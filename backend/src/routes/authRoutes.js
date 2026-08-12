const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const authMiddleware = require('../middleware/authMiddleware');
const { authLimiter } = require('../middleware/rateLimiter');

router.post('/register', authLimiter, authController.register);
router.get('/verify-email/:token', authController.verifyEmail);
router.post('/resend-verification', authLimiter, authController.resendVerification);
router.post('/login', authLimiter, authController.login);
router.post('/forgot-password', authLimiter, authController.forgotPassword);
router.post('/reset-password', authLimiter, authController.resetPassword);
router.get('/me', authMiddleware, authController.getMe);
router.put('/me', authMiddleware, authController.updateProfile);
router.put('/change-password', authMiddleware, authController.changePassword);

module.exports = router;
