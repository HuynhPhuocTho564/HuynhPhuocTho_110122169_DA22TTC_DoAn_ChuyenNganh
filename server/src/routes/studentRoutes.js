const express = require('express');
const router = express.Router();
const studentController = require('../controllers/studentController');
const { authenticate, authorize } = require('../middlewares/authMiddleware');

// Test route - không cần auth (để test route hoạt động)
router.get('/test', (req, res) => {
  console.log('[STUDENT ROUTE] GET /test - no auth');
  res.json({ success: true, message: 'Student route works!' });
});

// Debug middleware - log tất cả requests
router.use((req, res, next) => {
  console.log(`[STUDENT ROUTE] ${req.method} ${req.path}`);
  next();
});

// GET /api/students/classes - Lấy danh sách lớp (PHẢI ĐẶT TRƯỚC /:id)
router.get('/classes', authenticate, authorize('UNI_ADMIN', 'SUPER_ADMIN'), studentController.getClasses);

// GET /api/students - Lấy danh sách sinh viên (UNI_ADMIN, SUPER_ADMIN)
router.get('/', authenticate, authorize('UNI_ADMIN', 'SUPER_ADMIN'), studentController.getStudents);

// POST /api/students - Tạo sinh viên mới
router.post('/', authenticate, authorize('UNI_ADMIN', 'SUPER_ADMIN'), studentController.createStudent);

// GET /api/students/:id - Lấy chi tiết sinh viên (ĐẶT SAU /classes)
router.get('/:id', authenticate, authorize('UNI_ADMIN', 'SUPER_ADMIN'), studentController.getStudentById);

// PUT /api/students/:id - Cập nhật sinh viên
router.put('/:id', authenticate, authorize('UNI_ADMIN', 'SUPER_ADMIN'), studentController.updateStudent);

// DELETE /api/students/:id - Xóa sinh viên
router.delete('/:id', authenticate, authorize('UNI_ADMIN', 'SUPER_ADMIN'), studentController.deleteStudent);

// PUT /api/students/:id/circumstance - Cập nhật hoàn cảnh sinh viên (Admin duyệt)
router.put('/:id/circumstance', authenticate, authorize('UNI_ADMIN', 'SUPER_ADMIN'), studentController.updateCircumstance);

module.exports = router;
