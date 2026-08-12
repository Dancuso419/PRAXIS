const express = require('express');
const router = express.Router();
const voteController = require('../controllers/voteController');
const authMiddleware = require('../middleware/authMiddleware');
const roleMiddleware = require('../middleware/roleMiddleware');
const { voteLimiter } = require('../middleware/rateLimiter');

router.post('/', authMiddleware, roleMiddleware('STUDENT'), voteLimiter, voteController.castVote);
router.get('/receipt/:receiptHash', authMiddleware, voteController.getVoteReceipt);
router.get('/elections/:electionId/results', authMiddleware, voteController.getResults);
router.post('/elections/:electionId/publish-results', authMiddleware, roleMiddleware('SUPER_ADMIN'), voteController.publishResults);
router.post('/elections/:electionId/recount', authMiddleware, roleMiddleware('SUPER_ADMIN'), voteController.recountVotes);
router.get('/elections/:electionId/turnout', authMiddleware, roleMiddleware('ELECTION_OFFICER', 'SUPER_ADMIN'), voteController.getTurnoutAnalytics);
router.get('/elections/:electionId/live-tally', authMiddleware, roleMiddleware('ELECTION_OFFICER', 'SUPER_ADMIN'), voteController.getLiveTally);

module.exports = router;
