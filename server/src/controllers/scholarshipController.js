const scholarshipService = require('../services/scholarshipService');
const { successResponse, errorResponse } = require('../utils/responseHelper');

// POST /api/scholarships - Tạo học bổng mới
const createScholarship = async (req, res) => {
  try {
    const { id, role, school_id } = req.user;

    // Validation
    const { name, amount_per_slot, slots, start_date, end_date } = req.body;

    if (!name || !amount_per_slot || !slots || !start_date || !end_date) {
      return errorResponse(res, 'Vui lòng nhập đầy đủ thông tin bắt buộc');
    }

    const scholarship = await scholarshipService.createScholarship(
      req.body,
      id,
      role,
      school_id
    );

    return successResponse(res, scholarship, 'Tạo học bổng thành công', 201);
  } catch (error) {
    console.error('Create scholarship error:', error);
    return errorResponse(res, error.message, 400);
  }
};

// GET /api/scholarships - Lấy danh sách học bổng
const getScholarships = async (req, res) => {
  try {
    // Optional auth - có thể có hoặc không có user
    const role = req.user?.role || null;
    const school_id = req.user?.school_id || null;

    const result = await scholarshipService.getScholarships(role, school_id, req.query);

    return successResponse(res, result);
  } catch (error) {
    console.error('Get scholarships error:', error);
    return errorResponse(res, error.message, 500);
  }
};

// GET /api/scholarships/:id - Lấy chi tiết học bổng
const getScholarshipById = async (req, res) => {
  try {
    const { id } = req.params;
    // Optional auth - có thể có hoặc không có user
    const role = req.user?.role || null;
    const school_id = req.user?.school_id || null;

    const scholarship = await scholarshipService.getScholarshipById(id, role, school_id);

    return successResponse(res, scholarship);
  } catch (error) {
    console.error('Get scholarship error:', error);
    return errorResponse(res, error.message, error.message.includes('không có quyền') ? 403 : 404);
  }
};

// PUT /api/scholarships/:id - Cập nhật học bổng
const updateScholarship = async (req, res) => {
  try {
    const { id } = req.params;
    const { role, school_id } = req.user;

    const scholarship = await scholarshipService.updateScholarship(
      id,
      req.body,
      role,
      school_id
    );

    return successResponse(res, scholarship, 'Cập nhật học bổng thành công');
  } catch (error) {
    console.error('Update scholarship error:', error);
    return errorResponse(res, error.message, 400);
  }
};

// DELETE /api/scholarships/:id - Xóa học bổng
const deleteScholarship = async (req, res) => {
  try {
    const { id } = req.params;
    const { role, school_id } = req.user;

    await scholarshipService.deleteScholarship(id, role, school_id);

    return successResponse(res, null, 'Xóa học bổng thành công');
  } catch (error) {
    console.error('Delete scholarship error:', error);
    return errorResponse(res, error.message, 400);
  }
};

module.exports = {
  createScholarship,
  getScholarships,
  getScholarshipById,
  updateScholarship,
  deleteScholarship
};
