const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const { authenticate, authorize } = require('../middlewares/authMiddleware');
const upload = require('../middlewares/uploadMiddleware');

// Tất cả routes đều cần đăng nhập
router.use(authenticate);

// PUT /api/users/profile - Cập nhật profile của user hiện tại
router.put('/profile', userController.updateProfile);

// Student Documents - Hồ sơ của tôi
router.get('/my-documents', authorize('STUDENT'), userController.getMyDocuments);
router.post('/my-documents', authorize('STUDENT'), upload.single('file'), userController.uploadMyDocument);
router.delete('/my-documents/:id', authorize('STUDENT'), userController.deleteMyDocument);

// POST /api/users/create-uni-admin - Chỉ SUPER_ADMIN
router.post('/create-uni-admin', authorize('SUPER_ADMIN'), userController.createUniAdmin);

// GET /api/users - SUPER_ADMIN và UNI_ADMIN
router.get('/', authorize('SUPER_ADMIN', 'UNI_ADMIN'), userController.getUsers);

// GET /api/users/sponsors - Lấy danh sách nhà tài trợ (SUPER_ADMIN only)
router.get('/sponsors', authorize('SUPER_ADMIN'), userController.getSponsors);

// PUT /api/users/:id/status - Khóa/Mở khóa tài khoản
router.put('/:id/status', authorize('SUPER_ADMIN', 'UNI_ADMIN'), userController.updateUserStatus);

// POST /api/users/:id/reset-password - Reset mật khẩu (SUPER_ADMIN only)
router.post('/:id/reset-password', authorize('SUPER_ADMIN'), userController.resetPassword);

module.exports = router;
