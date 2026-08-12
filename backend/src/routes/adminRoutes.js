const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');
const authMiddleware = require('../middleware/authMiddleware');
const roleMiddleware = require('../middleware/roleMiddleware');

const superAdminOnly = [authMiddleware, roleMiddleware('SUPER_ADMIN')];

router.get('/officers', ...superAdminOnly, adminController.listOfficers);
router.post('/officers', ...superAdminOnly, adminController.createOfficer);
router.delete('/officers/:id', ...superAdminOnly, adminController.removeOfficer);

module.exports = router;
