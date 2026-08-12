const prisma = require('../prismaClient');
const { generateReceiptHash } = require('../utils/generateReceipt');

async function castVote(req, res) {
  const { electionId, positionId, candidateId } = req.body;
  const userId = req.user.id;

  if (!electionId || !positionId || !candidateId) {
    return res.status(400).json({ error: 'Election ID, position ID, and candidate ID are required.' });
  }

  const user = await prisma.user.findUnique({ where: { id: userId } });

  if (!user || !user.isVerified) {
    return res.status(403).json({ error: 'Verified account required to vote.' });
  }

  const election = await prisma.election.findUnique({
    where: { id: electionId },
    include: { eligibility: true },
  });

  if (!election) {
    return res.status(404).json({ error: 'Election not found.' });
  }

  if (election.status !== 'ACTIVE') {
    return res.status(400).json({ error: 'Election is not active.' });
  }

  const now = new Date();
  if (now < new Date(election.startTime) || now > new Date(election.endTime)) {
    return res.status(400).json({ error: 'Voting is outside the allowed time window.' });
  }

  if (election.eligibility) {
    const { faculty, department, level } = election.eligibility;
    if (faculty && (!user.faculty || user.faculty.trim().toLowerCase() !== faculty.trim().toLowerCase())) {
      return res.status(403).json({ error: 'You are not eligible to vote in this election (faculty restriction).' });
    }
    if (department && (!user.department || user.department.trim().toLowerCase() !== department.trim().toLowerCase())) {
      return res.status(403).json({ error: 'You are not eligible to vote in this election (department restriction).' });
    }
    if (level && (!user.level || user.level.trim().toLowerCase() !== level.trim().toLowerCase())) {
      return res.status(403).json({ error: 'You are not eligible to vote in this election (level restriction).' });
    }
  }

  const existingRecord = await prisma.voterRecord.findFirst({
    where: { userId, electionId, positionId },
  });

  if (existingRecord) {
    return res.status(409).json({ error: 'You have already voted for this position.' });
  }

  const position = await prisma.position.findFirst({
    where: { id: positionId, electionId },
  });

  if (!position) {
    return res.status(404).json({ error: 'Position not found in this election.' });
  }

  const candidate = await prisma.candidate.findFirst({
    where: { id: candidateId, positionId, electionId },
  });

  if (!candidate) {
    return res.status(404).json({ error: 'Candidate not found for this position.' });
  }

  if (candidate.isDisqualified) {
    return res.status(400).json({ error: 'Cannot vote for a disqualified candidate.' });
  }

  const receiptHash = generateReceiptHash(userId, electionId, positionId);

  try {
    const [vote, voterRecord] = await prisma.$transaction([
      prisma.vote.create({
        data: { electionId, positionId, candidateId },
      }),
      prisma.voterRecord.create({
        data: { userId, electionId, positionId, receiptHash },
      }),
    ]);

    return res.status(201).json({
      message: 'Vote cast successfully.',
      receiptHash,
      votedAt: voterRecord.votedAt,
    });
  } catch (error) {
    if (error.code === 'P2002') {
      return res.status(409).json({ error: 'You have already voted for this position.' });
    }
    throw error;
  }
}

async function getVoteReceipt(req, res) {
  const { receiptHash } = req.params;

  const record = await prisma.voterRecord.findUnique({
    where: { receiptHash },
    include: {
      election: { select: { title: true } },
      user: { select: { fullName: true, matricNumber: true } },
    },
  });

  if (!record) {
    return res.status(404).json({ error: 'Receipt not found.' });
  }

  if (record.userId !== req.user.id && req.user.role === 'STUDENT') {
    return res.status(403).json({ error: 'Access denied.' });
  }

  return res.json({
    receiptHash: record.receiptHash,
    voterName: record.user.fullName,
    matricNumber: record.user.matricNumber,
    election: record.election.title,
    votedAt: record.votedAt,
  });
}

async function getResults(req, res) {
  const { electionId } = req.params;

  const election = await prisma.election.findUnique({
    where: { id: electionId },
    include: { positions: true },
  });

  if (!election) {
    return res.status(404).json({ error: 'Election not found.' });
  }

  if (election.status !== 'RESULTS_PUBLISHED') {
    if (req.user.role !== 'SUPER_ADMIN') {
      return res.status(403).json({ error: 'Results have not been published yet.' });
    }
    if (election.status !== 'CLOSED') {
      return res.status(400).json({ error: 'Results cannot be viewed before the election is closed.' });
    }
  }

  const results = await computeResults(electionId);

  return res.json({
    electionId,
    electionTitle: election.title,
    status: election.status,
    results,
  });
}

async function publishResults(req, res) {
  const { electionId } = req.params;

  const election = await prisma.election.findUnique({ where: { id: electionId } });

  if (!election) {
    return res.status(404).json({ error: 'Election not found.' });
  }

  if (election.status !== 'CLOSED') {
    return res.status(400).json({ error: 'Election must be closed before results can be published.' });
  }

  const updated = await prisma.election.update({
    where: { id: electionId },
    data: { status: 'RESULTS_PUBLISHED' },
  });

  await prisma.auditLog.create({
    data: {
      action: 'RESULTS_PUBLISHED',
      actorId: req.user.id,
      details: `Published results for election "${updated.title}" (${electionId})`,
    },
  });

  return res.json(updated);
}

async function recountVotes(req, res) {
  const { electionId } = req.params;

  const election = await prisma.election.findUnique({ where: { id: electionId } });

  if (!election) {
    return res.status(404).json({ error: 'Election not found.' });
  }

  await prisma.auditLog.create({
    data: {
      action: 'RECOUNT_TRIGGERED',
      actorId: req.user.id,
      details: `Recount triggered for election "${election.title}" (${electionId})`,
    },
  });

  const computed = await computeResults(electionId);

  return res.json({
    message: 'Recount completed successfully.',
    computed,
  });
}

async function computeResults(electionId) {
  const election = await prisma.election.findUnique({
    where: { id: electionId },
    include: { positions: true },
  });

  const results = await Promise.all(
    election.positions.map(async (position) => {
      const candidates = await prisma.candidate.findMany({
        where: { positionId: position.id, electionId },
        select: { id: true, fullName: true, isDisqualified: true },
      });

      const candidateVotes = await Promise.all(
        candidates.map(async (candidate) => {
          const count = await prisma.vote.count({
            where: { candidateId: candidate.id },
          });
          return {
            id: candidate.id,
            fullName: candidate.fullName,
            isDisqualified: candidate.isDisqualified,
            voteCount: count,
          };
        })
      );

      return {
        position: position.title,
        positionId: position.id,
        candidates: candidateVotes.sort((a, b) => b.voteCount - a.voteCount),
        totalVotes: candidateVotes.reduce((sum, c) => sum + c.voteCount, 0),
      };
    })
  );

  return results;
}

async function getLiveTally(req, res) {
  const { electionId } = req.params;

  const election = await prisma.election.findUnique({ where: { id: electionId } });

  if (!election) {
    return res.status(404).json({ error: 'Election not found.' });
  }

  // Live per-candidate counts are visible to administrators at any stage,
  // including while the election is ACTIVE. Students never reach this route.
  const results = await computeResults(electionId);
  const totalVotesCast = await prisma.vote.count({ where: { electionId } });

  return res.json({
    electionId,
    electionTitle: election.title,
    status: election.status,
    startTime: election.startTime,
    endTime: election.endTime,
    totalVotesCast,
    results,
    generatedAt: new Date().toISOString(),
  });
}

async function getTurnoutAnalytics(req, res) {
  const { electionId } = req.params;

  const election = await prisma.election.findUnique({
    where: { id: electionId },
    include: { positions: true },
  });

  if (!election) {
    return res.status(404).json({ error: 'Election not found.' });
  }

  const totalEligible = await prisma.user.count({ where: { isVerified: true, role: 'STUDENT' } });

  const votedUsers = await prisma.voterRecord.findMany({
    where: { electionId },
    select: { userId: true },
    distinct: ['userId'],
  });

  const totalVotesCast = await prisma.vote.count({ where: { electionId } });
  const totalVoterRecords = await prisma.voterRecord.count({ where: { electionId } });

  const turnoutByPosition = await Promise.all(
    election.positions.map(async (position) => {
      const count = await prisma.voterRecord.count({
        where: { electionId, positionId: position.id },
      });
      return { position: position.title, votesCast: count };
    })
  );

  return res.json({
    electionId,
    electionTitle: election.title,
    totalEligibleVoters: totalEligible,
    uniqueVoters: votedUsers.length,
    totalVotesCast,
    totalVoterRecords,
    participationPercent: totalEligible > 0 ? ((votedUsers.length / totalEligible) * 100).toFixed(2) : 0,
    turnoutByPosition,
  });
}

module.exports = {
  castVote,
  getVoteReceipt,
  getResults,
  publishResults,
  recountVotes,
  getTurnoutAnalytics,
  getLiveTally,
};
