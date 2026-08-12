const prisma = require('../prismaClient');
const { hashPassword } = require('../utils/hashPassword');

const SAFE_FIELDS = {
  id: true,
  fullName: true,
  matricNumber: true,
  email: true,
  faculty: true,
  department: true,
  level: true,
  role: true,
  isVerified: true,
  createdAt: true,
};

async function listOfficers(req, res) {
  const officers = await prisma.user.findMany({
    where: { role: 'ELECTION_OFFICER' },
    select: SAFE_FIELDS,
    orderBy: { createdAt: 'desc' },
  });
  return res.json(officers);
}

async function createOfficer(req, res) {
  const { fullName, email, password, department } = req.body;

  if (!fullName || !email || !password) {
    return res.status(400).json({ error: 'fullName, email, and password are required.' });
  }

  if (password.length < 8) {
    return res.status(400).json({ error: 'Password must be at least 8 characters.' });
  }

  const existing = await prisma.user.findUnique({ where: { email: email.toLowerCase() } });
  if (existing) {
    return res.status(409).json({ error: 'An account with this email already exists.' });
  }

  // Generate a unique staff matric: OFF-<timestamp>
  const matricNumber = `OFF-${Date.now()}`;

  const hashedPassword = await hashPassword(password);

  const officer = await prisma.user.create({
    data: {
      fullName,
      matricNumber,
      email: email.toLowerCase(),
      password: hashedPassword,
      faculty: 'Administration',
      department: department || 'ICT',
      level: 'N/A',
      role: 'ELECTION_OFFICER',
      isVerified: true,
    },
    select: SAFE_FIELDS,
  });

  await prisma.auditLog.create({
    data: {
      action: 'CREATE_OFFICER',
      actorId: req.user.id,
      details: `Created Election Officer: ${officer.email}`,
    },
  });

  return res.status(201).json(officer);
}

async function removeOfficer(req, res) {
  const { id } = req.params;

  const officer = await prisma.user.findUnique({ where: { id } });

  if (!officer) {
    return res.status(404).json({ error: 'User not found.' });
  }

  if (officer.role !== 'ELECTION_OFFICER') {
    return res.status(400).json({ error: 'Only Election Officer accounts can be removed via this endpoint.' });
  }

  // Guard: cannot remove yourself
  if (officer.id === req.user.id) {
    return res.status(400).json({ error: 'You cannot remove your own account.' });
  }

  await prisma.user.delete({ where: { id } });

  await prisma.auditLog.create({
    data: {
      action: 'REMOVE_OFFICER',
      actorId: req.user.id,
      details: `Removed Election Officer: ${officer.email}`,
    },
  });

  return res.json({ message: 'Election Officer account removed.' });
}

module.exports = { listOfficers, createOfficer, removeOfficer };
