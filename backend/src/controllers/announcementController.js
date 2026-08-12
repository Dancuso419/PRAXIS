const prisma = require('../prismaClient');

async function createAnnouncement(req, res) {
  const { title, content, electionId } = req.body;

  if (!title || !content) {
    return res.status(400).json({ error: 'Title and content are required.' });
  }

  const announcement = await prisma.announcement.create({
    data: { title, content, electionId: electionId || null },
  });

  await prisma.auditLog.create({
    data: {
      action: 'ANNOUNCEMENT_CREATED',
      actorId: req.user.id,
      details: `Created announcement "${title}"`,
    },
  });

  return res.status(201).json(announcement);
}

async function getAnnouncements(req, res) {
  const announcements = await prisma.announcement.findMany({
    orderBy: { createdAt: 'desc' },
    include: { election: { select: { title: true } } },
  });

  return res.json(announcements);
}

module.exports = { createAnnouncement, getAnnouncements };
