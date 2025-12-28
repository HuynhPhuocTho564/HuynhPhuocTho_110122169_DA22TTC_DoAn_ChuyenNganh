const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const { authenticate } = require('../middlewares/authMiddleware');

// Public routes (Không cần đăng nhập)
router.post('/login', authController.login);
router.post('/register', authController.register);
router.post('/forgot-password', authController.forgotPassword);

// Protected routes (Cần đăng nhập)
router.get('/me', authenticate, authController.getMe);
router.put('/change-password', authenticate, authController.changePassword);

module.exports = router;
