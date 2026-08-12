const prisma = require('../prismaClient');

async function createElection(req, res) {
  const { title, description, startTime, endTime, positions } = req.body;

  if (!title || !startTime || !endTime) {
    return res.status(400).json({ error: 'Title, start time, and end time are required.' });
  }

  if (new Date(endTime) <= new Date(startTime)) {
    return res.status(400).json({ error: 'End time must be after start time.' });
  }

  const election = await prisma.election.create({
    data: {
      title,
      description: description || '',
      startTime: new Date(startTime),
      endTime: new Date(endTime),
      positions: {
        create: positions || [],
      },
    },
    include: { positions: true },
  });

  await prisma.auditLog.create({
    data: {
      action: 'ELECTION_CREATED',
      actorId: req.user.id,
      details: `Created election "${title}" (${election.id})`,
    },
  });

  return res.status(201).json(election);
}

async function getElections(req, res) {
  const now = new Date();
  const isAdmin = req.user.role === 'ELECTION_OFFICER' || req.user.role === 'SUPER_ADMIN';

  let where = {};

  if (!isAdmin) {
    where = {
      status: { not: 'DRAFT' },
    };
  }

  const elections = await prisma.election.findMany({
    where,
    include: {
      positions: true,
      _count: { select: { candidates: true, voterRecords: true } },
    },
    orderBy: { createdAt: 'desc' },
  });

  const enriched = elections.map((e) => {
    let computedStatus = e.status;
    if (e.status === 'SCHEDULED' && now >= new Date(e.startTime) && now <= new Date(e.endTime)) {
      computedStatus = 'ACTIVE';
    } else if (e.status === 'ACTIVE' && now > new Date(e.endTime)) {
      computedStatus = 'CLOSED';
    }
    return { ...e, computedStatus };
  });

  return res.json(enriched);
}

async function getElectionById(req, res) {
  const { id } = req.params;
  const isAdmin = req.user.role === 'ELECTION_OFFICER' || req.user.role === 'SUPER_ADMIN';

  const election = await prisma.election.findUnique({
    where: { id },
    include: {
      positions: { include: { candidates: true } },
      eligibility: true,
      _count: { select: { voterRecords: true } },
    },
  });

  if (!election) {
    return res.status(404).json({ error: 'Election not found.' });
  }

  if (!isAdmin && election.status === 'DRAFT') {
    return res.status(403).json({ error: 'Access denied.' });
  }

  return res.json(election);
}

async function updateElection(req, res) {
  const { id } = req.params;
  const { title, description, startTime, endTime } = req.body;

  const election = await prisma.election.findUnique({ where: { id } });

  if (!election) {
    return res.status(404).json({ error: 'Election not found.' });
  }

  if (election.status === 'ACTIVE' || election.status === 'CLOSED') {
    return res.status(400).json({ error: 'Cannot edit an active or closed election.' });
  }

  const updated = await prisma.election.update({
    where: { id },
    data: {
      ...(title && { title }),
      ...(description !== undefined && { description }),
      ...(startTime && { startTime: new Date(startTime) }),
      ...(endTime && { endTime: new Date(endTime) }),
    },
    include: { positions: true },
  });

  await prisma.auditLog.create({
    data: {
      action: 'ELECTION_UPDATED',
      actorId: req.user.id,
      details: `Updated election "${updated.title}" (${updated.id})`,
    },
  });

  return res.json(updated);
}

async function setEligibility(req, res) {
  const { id } = req.params;
  const { faculty, department, level } = req.body;

  const election = await prisma.election.findUnique({ where: { id } });

  if (!election) {
    return res.status(404).json({ error: 'Election not found.' });
  }

  const rule = await prisma.eligibilityRule.upsert({
    where: { electionId: id },
    update: { faculty, department, level },
    create: { electionId: id, faculty, department, level },
  });

  await prisma.auditLog.create({
    data: {
      action: 'ELIGIBILITY_SET',
      actorId: req.user.id,
      details: `Set eligibility rules for election ${id}`,
    },
  });

  return res.json(rule);
}

async function activateElection(req, res) {
  const { id } = req.params;

  const election = await prisma.election.findUnique({
    where: { id },
    include: {
      positions: { include: { candidates: true } },
      eligibility: true,
    },
  });

  if (!election) {
    return res.status(404).json({ error: 'Election not found.' });
  }

  if (election.status !== 'DRAFT' && election.status !== 'SCHEDULED') {
    return res.status(400).json({ error: 'Only draft or scheduled elections can be activated.' });
  }

  if (!election.eligibility) {
    return res.status(400).json({ error: 'Eligibility rules must be set before activation.' });
  }

  const hasPositions = election.positions.length > 0;
  const hasCandidates = election.positions.every((p) => p.candidates.length > 0);

  if (!hasPositions || !hasCandidates) {
    return res.status(400).json({ error: 'Each position must have at least one candidate.' });
  }

  const updated = await prisma.election.update({
    where: { id },
    data: { status: 'ACTIVE' },
  });

  await prisma.auditLog.create({
    data: {
      action: 'ELECTION_ACTIVATED',
      actorId: req.user.id,
      details: `Activated election "${updated.title}" (${id})`,
    },
  });

  return res.json(updated);
}

async function closeElection(req, res) {
  const { id } = req.params;

  const election = await prisma.election.findUnique({ where: { id } });

  if (!election) {
    return res.status(404).json({ error: 'Election not found.' });
  }

  if (election.status !== 'ACTIVE') {
    return res.status(400).json({ error: 'Only active elections can be closed.' });
  }

  const updated = await prisma.election.update({
    where: { id },
    data: { status: 'CLOSED' },
  });

  await prisma.auditLog.create({
    data: {
      action: 'ELECTION_CLOSED',
      actorId: req.user.id,
      details: `Closed election "${updated.title}" (${id})`,
    },
  });

  return res.json(updated);
}

async function addPosition(req, res) {
  const { id } = req.params;
  const { title } = req.body;

  if (!title) {
    return res.status(400).json({ error: 'Position title is required.' });
  }

  const election = await prisma.election.findUnique({ where: { id } });

  if (!election) {
    return res.status(404).json({ error: 'Election not found.' });
  }

  if (election.status !== 'DRAFT' && election.status !== 'SCHEDULED') {
    return res.status(400).json({ error: 'Cannot modify positions after election is active.' });
  }

  const position = await prisma.position.create({
    data: { title, electionId: id },
  });

  return res.status(201).json(position);
}

async function removePosition(req, res) {
  const { id, positionId } = req.params;

  const election = await prisma.election.findUnique({ where: { id } });

  if (!election) {
    return res.status(404).json({ error: 'Election not found.' });
  }

  if (election.status !== 'DRAFT' && election.status !== 'SCHEDULED') {
    return res.status(400).json({ error: 'Cannot modify positions after election is active.' });
  }

  const position = await prisma.position.findFirst({
    where: { id: positionId, electionId: id },
  });

  if (!position) {
    return res.status(404).json({ error: 'Position not found.' });
  }

  await prisma.position.delete({ where: { id: positionId } });

  return res.json({ message: 'Position removed.' });
}

module.exports = {
  createElection,
  getElections,
  getElectionById,
  updateElection,
  setEligibility,
  activateElection,
  closeElection,
  addPosition,
  removePosition,
};
