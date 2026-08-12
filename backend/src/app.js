const express = require('express');
const cors = require('cors');
const { generalLimiter } = require('./middleware/rateLimiter');

const authRoutes = require('./routes/authRoutes');
const electionRoutes = require('./routes/electionRoutes');
const candidateRoutes = require('./routes/candidateRoutes');
const voteRoutes = require('./routes/voteRoutes');
const announcementRoutes = require('./routes/announcementRoutes');
const auditRoutes = require('./routes/auditRoutes');
const adminRoutes = require('./routes/adminRoutes');

const app = express();

app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:5173',
  credentials: true,
}));

app.use(express.json());
app.use(generalLimiter);

app.use('/api/auth', authRoutes);
app.use('/api/elections', electionRoutes);
app.use('/api/candidates', candidateRoutes);
app.use('/api/vote', voteRoutes);
app.use('/api/announcements', announcementRoutes);
app.use('/api/audit-logs', auditRoutes);
app.use('/api/admin', adminRoutes);

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

app.use((err, req, res, _next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Internal server error.' });
});

module.exports = app;
