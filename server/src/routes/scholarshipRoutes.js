const express = require('express');
const router = express.Router();
const scholarshipController = require('../controllers/scholarshipController');
const { authenticate, authorize, optionalAuth } = require('../middlewares/authMiddleware');

// Public routes (không cần đăng nhập)
// GET /api/scholarships - Xem danh sách (Public)
router.get('/', optionalAuth, scholarshipController.getScholarships);

// GET /api/scholarships/:id - Xem chi tiết (Public)
router.get('/:id', optionalAuth, scholarshipController.getScholarshipById);

// Protected routes (cần đăng nhập)
// POST /api/scholarships - Tạo học bổng (UNI_ADMIN, SUPER_ADMIN)
router.post('/', authenticate, authorize('UNI_ADMIN', 'SUPER_ADMIN'), scholarshipController.createScholarship);

// PUT /api/scholarships/:id - Cập nhật (UNI_ADMIN, SUPER_ADMIN)
router.put('/:id', authenticate, authorize('UNI_ADMIN', 'SUPER_ADMIN'), scholarshipController.updateScholarship);

// DELETE /api/scholarships/:id - Xóa (UNI_ADMIN, SUPER_ADMIN)
router.delete('/:id', authenticate, authorize('UNI_ADMIN', 'SUPER_ADMIN'), scholarshipController.deleteScholarship);

module.exports = router;
