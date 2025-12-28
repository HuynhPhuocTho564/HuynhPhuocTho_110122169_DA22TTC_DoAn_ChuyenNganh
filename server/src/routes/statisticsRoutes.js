const express = require('express');
const router = express.Router();
const statisticsController = require('../controllers/statisticsController');
const { authenticate, authorize } = require('../middlewares/authMiddleware');

// Tất cả routes đều cần đăng nhập
router.use(authenticate);

// GET /api/stats/periods - Lấy danh sách năm học và học kỳ
router.get('/periods', statisticsController.getAcademicPeriods);

// GET /api/stats/dashboard - Dashboard tự động theo role
router.get('/dashboard', statisticsController.getDashboard);

// GET /api/stats/system - Thống kê toàn hệ thống (SUPER_ADMIN only)
router.get('/system', authorize('SUPER_ADMIN'), statisticsController.getSystemStats);

// GET /api/stats/university - Thống kê trường (UNI_ADMIN)
router.get('/university', authorize('UNI_ADMIN'), statisticsController.getUniversityStats);

// GET /api/stats/sponsor - Thống kê nhà tài trợ (SPONSOR)
router.get('/sponsor', authorize('SPONSOR'), statisticsController.getSponsorStats);

module.exports = router;
