const express = require('express');
const router = express.Router();
const candidateController = require('../controllers/candidateController');
const authMiddleware = require('../middleware/authMiddleware');
const roleMiddleware = require('../middleware/roleMiddleware');

router.get('/elections/:electionId/candidates', authMiddleware, candidateController.getCandidates);
router.get('/:id', authMiddleware, candidateController.getCandidateById);
router.post('/', authMiddleware, roleMiddleware('ELECTION_OFFICER', 'SUPER_ADMIN'), candidateController.createCandidate);
router.put('/:id', authMiddleware, roleMiddleware('ELECTION_OFFICER', 'SUPER_ADMIN'), candidateController.updateCandidate);
router.delete('/:id', authMiddleware, roleMiddleware('ELECTION_OFFICER', 'SUPER_ADMIN'), candidateController.deleteCandidate);
router.post('/:id/disqualify', authMiddleware, roleMiddleware('ELECTION_OFFICER', 'SUPER_ADMIN'), candidateController.disqualifyCandidate);

module.exports = router;
