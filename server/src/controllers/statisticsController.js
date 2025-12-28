const statisticsService = require('../services/statisticsService');
const { successResponse, errorResponse } = require('../utils/responseHelper');

// GET /api/stats/periods - Lấy danh sách năm học và học kỳ
const getAcademicPeriods = async (req, res) => {
  try {
    const periods = await statisticsService.getAcademicPeriods();
    return successResponse(res, periods, 'Lấy danh sách năm học thành công');
  } catch (error) {
    console.error('Get academic periods error:', error);
    return errorResponse(res, error.message, 500);
  }
};

// GET /api/stats/system - Thống kê toàn hệ thống (SUPER_ADMIN)
const getSystemStats = async (req, res) => {
  try {
    const { academic_year, semester } = req.query;
    // semester là string ('HK1', 'HK2', etc.), không cần parse
    const filters = { academic_year, semester: semester || null };
    
    const stats = await statisticsService.getSystemStats(filters);

    return successResponse(res, stats, 'Lấy thống kê hệ thống thành công');
  } catch (error) {
    console.error('Get system stats error:', error);
    return errorResponse(res, error.message, 500);
  }
};

// GET /api/stats/university - Thống kê trường (UNI_ADMIN)
const getUniversityStats = async (req, res) => {
  try {
    const { school_id } = req.user;
    const { academic_year, semester } = req.query;
    // semester là string ('HK1', 'HK2', etc.), không cần parse
    const filters = { academic_year, semester: semester || null };

    if (!school_id) {
      return errorResponse(res, 'Tài khoản chưa được gán trường', 400);
    }

    const stats = await statisticsService.getUniversityStats(school_id, filters);

    return successResponse(res, stats, 'Lấy thống kê trường thành công');
  } catch (error) {
    console.error('Get university stats error:', error);
    return errorResponse(res, error.message, 500);
  }
};

// GET /api/stats/sponsor - Thống kê nhà tài trợ (SPONSOR)
const getSponsorStats = async (req, res) => {
  try {
    const { academic_year, semester } = req.query;
    // semester là string ('HK1', 'HK2', etc.), không cần parse
    const filters = { academic_year, semester: semester || null };
    
    const stats = await statisticsService.getSponsorStats(req.user.id, filters);

    return successResponse(res, stats, 'Lấy thống kê nhà tài trợ thành công');
  } catch (error) {
    console.error('Get sponsor stats error:', error);
    return errorResponse(res, error.message, 500);
  }
};

// GET /api/stats/dashboard - Dashboard tổng hợp (All roles)
const getDashboard = async (req, res) => {
  try {
    const { role, school_id, id } = req.user;

    let stats;

    // Route dựa trên role
    switch (role) {
      case 'SUPER_ADMIN':
        stats = await statisticsService.getSystemStats();
        break;

      case 'UNI_ADMIN':
        if (!school_id) {
          return errorResponse(res, 'Tài khoản chưa được gán trường', 400);
        }
        stats = await statisticsService.getUniversityStats(school_id);
        break;

      case 'SPONSOR':
        stats = await statisticsService.getSponsorStats(id);
        break;

      case 'STUDENT':
        // Sinh viên không có dashboard thống kê, chỉ xem hồ sơ của mình
        return errorResponse(res, 'Sinh viên không có quyền xem dashboard thống kê', 403);

      default:
        return errorResponse(res, 'Role không hợp lệ', 400);
    }

    return successResponse(res, {
      role,
      stats
    }, 'Lấy dashboard thành công');
  } catch (error) {
    console.error('Get dashboard error:', error);
    return errorResponse(res, error.message, 500);
  }
};

module.exports = {
  getSystemStats,
  getUniversityStats,
  getSponsorStats,
  getDashboard,
  getAcademicPeriods
};
