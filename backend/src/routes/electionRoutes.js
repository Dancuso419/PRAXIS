const express = require('express');
const router = express.Router();
const electionController = require('../controllers/electionController');
const authMiddleware = require('../middleware/authMiddleware');
const roleMiddleware = require('../middleware/roleMiddleware');

router.get('/', authMiddleware, electionController.getElections);
router.get('/:id', authMiddleware, electionController.getElectionById);

router.post('/', authMiddleware, roleMiddleware('ELECTION_OFFICER', 'SUPER_ADMIN'), electionController.createElection);
router.put('/:id', authMiddleware, roleMiddleware('ELECTION_OFFICER', 'SUPER_ADMIN'), electionController.updateElection);

router.post('/:id/positions', authMiddleware, roleMiddleware('ELECTION_OFFICER', 'SUPER_ADMIN'), electionController.addPosition);
router.delete('/:id/positions/:positionId', authMiddleware, roleMiddleware('ELECTION_OFFICER', 'SUPER_ADMIN'), electionController.removePosition);

router.put('/:id/eligibility', authMiddleware, roleMiddleware('SUPER_ADMIN'), electionController.setEligibility);
router.post('/:id/activate', authMiddleware, roleMiddleware('SUPER_ADMIN'), electionController.activateElection);
router.post('/:id/close', authMiddleware, roleMiddleware('SUPER_ADMIN'), electionController.closeElection);

module.exports = router;
