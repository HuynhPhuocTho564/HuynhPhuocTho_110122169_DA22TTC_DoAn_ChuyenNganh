const express = require('express');
const router = express.Router();
const universityController = require('../controllers/universityController');
const { authenticate, authorize } = require('../middlewares/authMiddleware');

// GET /api/universities - Danh sách trường (Public - cho trang đăng ký)
router.get('/', universityController.getUniversities);

// Các routes sau cần đăng nhập
router.use(authenticate);

// POST /api/universities - Tạo trường mới (SUPER_ADMIN only)
router.post('/', authorize('SUPER_ADMIN'), universityController.createUniversity);

// GET /api/universities/:id - Chi tiết trường (All roles)
router.get('/:id', universityController.getUniversityById);

// PUT /api/universities/:id - Cập nhật trường (SUPER_ADMIN only)
router.put('/:id', authorize('SUPER_ADMIN'), universityController.updateUniversity);

// PUT /api/universities/:id/status - Khóa/Mở khóa (SUPER_ADMIN only)
router.put('/:id/status', authorize('SUPER_ADMIN'), universityController.updateUniversityStatus);

// DELETE /api/universities/:id - Xóa trường (SUPER_ADMIN only)
router.delete('/:id', authorize('SUPER_ADMIN'), universityController.deleteUniversity);

module.exports = router;
