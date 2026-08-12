const crypto = require('crypto');

function generateReceiptHash(userId, electionId, positionId) {
  const data = `${userId}-${electionId}-${positionId}-${Date.now()}-${crypto.randomBytes(16).toString('hex')}`;
  return crypto.createHash('sha256').update(data).digest('hex');
}

module.exports = { generateReceiptHash };
