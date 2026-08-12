const prisma = require('../prismaClient');

async function getAuditLogs(req, res) {
  const logs = await prisma.auditLog.findMany({
    orderBy: { createdAt: 'desc' },
  });

  return res.json(logs);
}

module.exports = { getAuditLogs };
