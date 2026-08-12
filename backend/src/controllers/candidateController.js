const prisma = require('../prismaClient');

async function createCandidate(req, res) {
  const { fullName, department, level, profilePicture, manifesto, slogan, electionId, positionId, positionTitle } = req.body;

  if (!fullName || !department || !level || !manifesto || !electionId || (!positionId && !positionTitle)) {
    return res.status(400).json({ error: 'Full name, department, level, manifesto, election, and position are required.' });
  }

  const election = await prisma.election.findUnique({ where: { id: electionId } });

  if (!election) {
    return res.status(404).json({ error: 'Election not found.' });
  }

  if (election.status === 'ACTIVE' || election.status === 'CLOSED') {
    return res.status(400).json({ error: 'Cannot add candidates to an active or closed election.' });
  }

  // Resolve the position: by id (legacy), or by free-text title (find-or-create).
  let position;
  if (positionId) {
    position = await prisma.position.findFirst({ where: { id: positionId, electionId } });
    if (!position) {
      return res.status(404).json({ error: 'Position not found.' });
    }
  } else {
    const title = String(positionTitle).trim();
    if (!title) {
      return res.status(400).json({ error: 'Position title cannot be empty.' });
    }
    const existing = await prisma.position.findMany({ where: { electionId } });
    position = existing.find((p) => p.title.toLowerCase() === title.toLowerCase());
    if (!position) {
      position = await prisma.position.create({ data: { title, electionId } });
    }
  }

  const candidate = await prisma.candidate.create({
    data: {
      fullName,
      department,
      level,
      profilePicture: profilePicture || null,
      manifesto,
      slogan: slogan || null,
      electionId,
      positionId: position.id,
    },
    include: { position: true, election: true },
  });

  await prisma.auditLog.create({
    data: {
      action: 'CANDIDATE_CREATED',
      actorId: req.user.id,
      details: `Created candidate "${fullName}" for position "${position.title}" in election ${electionId}`,
    },
  });

  return res.status(201).json(candidate);
}

async function getCandidates(req, res) {
  const { electionId } = req.params;

  const candidates = await prisma.candidate.findMany({
    where: { electionId },
    include: { position: true },
    orderBy: { position: { title: 'asc' } },
  });

  return res.json(candidates);
}

async function updateCandidate(req, res) {
  const { id } = req.params;
  const { fullName, department, level, profilePicture, manifesto, slogan } = req.body;

  const candidate = await prisma.candidate.findUnique({
    where: { id },
    include: { election: true },
  });

  if (!candidate) {
    return res.status(404).json({ error: 'Candidate not found.' });
  }

  if (candidate.election.status === 'ACTIVE' || candidate.election.status === 'CLOSED') {
    return res.status(400).json({ error: 'Cannot edit candidates in an active or closed election.' });
  }

  const updated = await prisma.candidate.update({
    where: { id },
    data: {
      ...(fullName && { fullName }),
      ...(department && { department }),
      ...(level && { level }),
      ...(profilePicture !== undefined && { profilePicture }),
      ...(manifesto && { manifesto }),
      ...(slogan !== undefined && { slogan }),
    },
  });

  await prisma.auditLog.create({
    data: {
      action: 'CANDIDATE_UPDATED',
      actorId: req.user.id,
      details: `Updated candidate "${updated.fullName}" (${id})`,
    },
  });

  return res.json(updated);
}

async function deleteCandidate(req, res) {
  const { id } = req.params;

  const candidate = await prisma.candidate.findUnique({
    where: { id },
    include: { election: true },
  });

  if (!candidate) {
    return res.status(404).json({ error: 'Candidate not found.' });
  }

  if (candidate.election.status === 'ACTIVE' || candidate.election.status === 'CLOSED') {
    return res.status(400).json({ error: 'Cannot remove candidates from an active or closed election.' });
  }

  await prisma.candidate.delete({ where: { id } });

  await prisma.auditLog.create({
    data: {
      action: 'CANDIDATE_DELETED',
      actorId: req.user.id,
      details: `Deleted candidate "${candidate.fullName}" (${id})`,
    },
  });

  return res.json({ message: 'Candidate removed.' });
}

async function getCandidateById(req, res) {
  const { id } = req.params;

  const candidate = await prisma.candidate.findUnique({
    where: { id },
    include: { position: true, election: { select: { id: true, title: true } } },
  });

  if (!candidate) {
    return res.status(404).json({ error: 'Candidate not found.' });
  }

  return res.json(candidate);
}

async function disqualifyCandidate(req, res) {
  const { id } = req.params;
  const { reason } = req.body;

  if (!reason) {
    return res.status(400).json({ error: 'Disqualification reason is required.' });
  }

  const candidate = await prisma.candidate.findUnique({ where: { id } });

  if (!candidate) {
    return res.status(404).json({ error: 'Candidate not found.' });
  }

  const updated = await prisma.candidate.update({
    where: { id },
    data: { isDisqualified: true, disqualifyReason: reason },
  });

  await prisma.auditLog.create({
    data: {
      action: 'CANDIDATE_DISQUALIFIED',
      actorId: req.user.id,
      details: `Disqualified candidate "${updated.fullName}" (${id}). Reason: ${reason}`,
    },
  });

  return res.json(updated);
}

module.exports = {
  createCandidate,
  getCandidates,
  getCandidateById,
  updateCandidate,
  deleteCandidate,
  disqualifyCandidate,
};
