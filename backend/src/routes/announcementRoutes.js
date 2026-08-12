const express = require('express');
const router = express.Router();
const announcementController = require('../controllers/announcementController');
const authMiddleware = require('../middleware/authMiddleware');
const roleMiddleware = require('../middleware/roleMiddleware');

router.get('/', authMiddleware, announcementController.getAnnouncements);
router.post('/', authMiddleware, roleMiddleware('ELECTION_OFFICER', 'SUPER_ADMIN'), announcementController.createAnnouncement);

module.exports = router;
