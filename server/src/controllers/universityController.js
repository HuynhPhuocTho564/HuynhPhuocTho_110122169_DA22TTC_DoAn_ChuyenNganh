const universityService = require('../services/universityService');
const { successResponse, errorResponse } = require('../utils/responseHelper');

// POST /api/universities - Tạo trường mới (SUPER_ADMIN)
const createUniversity = async (req, res) => {
  try {
    const { code, name, logo_url, phone, address } = req.body;

    // Validation
    if (!code || !name) {
      return errorResponse(res, 'Vui lòng nhập mã trường và tên trường');
    }

    // Validate mã trường (chỉ chữ hoa và số, không dấu)
    const codeRegex = /^[A-Z0-9]+$/;
    if (!codeRegex.test(code)) {
      return errorResponse(res, 'Mã trường chỉ được chứa chữ hoa và số (VD: CTU, HCMUT)');
    }

    const university = await universityService.createUniversity(req.body);

    return successResponse(
      res,
      university,
      'Tạo trường đại học thành công',
      201
    );
  } catch (error) {
    console.error('Create university error:', error);
    return errorResponse(res, error.message, 400);
  }
};

// GET /api/universities - Danh sách trường
const getUniversities = async (req, res) => {
  try {
    const result = await universityService.getUniversities(req.query);

    return successResponse(res, result);
  } catch (error) {
    console.error('Get universities error:', error);
    return errorResponse(res, error.message, 500);
  }
};

// GET /api/universities/:id - Chi tiết trường
const getUniversityById = async (req, res) => {
  try {
    const { id } = req.params;

    const university = await universityService.getUniversityById(id);

    return successResponse(res, university);
  } catch (error) {
    console.error('Get university error:', error);
    return errorResponse(res, error.message, 404);
  }
};

// PUT /api/universities/:id - Cập nhật trường
const updateUniversity = async (req, res) => {
  try {
    const { id } = req.params;
    const { code } = req.body;

    // Validate mã trường nếu có
    if (code) {
      const codeRegex = /^[A-Z0-9]+$/;
      if (!codeRegex.test(code)) {
        return errorResponse(res, 'Mã trường chỉ được chứa chữ hoa và số');
      }
    }

    const university = await universityService.updateUniversity(id, req.body);

    return successResponse(res, university, 'Cập nhật trường thành công');
  } catch (error) {
    console.error('Update university error:', error);
    return errorResponse(res, error.message, 400);
  }
};

// PUT /api/universities/:id/status - Khóa/Mở khóa trường
const updateUniversityStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!status) {
      return errorResponse(res, 'Vui lòng chọn trạng thái');
    }

    const result = await universityService.updateUniversityStatus(id, status);

    const message = status === 'LOCKED' 
      ? 'Đã khóa trường thành công' 
      : 'Đã mở khóa trường thành công';

    return successResponse(res, result, message);
  } catch (error) {
    console.error('Update university status error:', error);
    return errorResponse(res, error.message, 400);
  }
};

// DELETE /api/universities/:id - Xóa trường
const deleteUniversity = async (req, res) => {
  try {
    const { id } = req.params;

    await universityService.deleteUniversity(id);

    return successResponse(res, null, 'Xóa trường thành công');
  } catch (error) {
    console.error('Delete university error:', error);
    return errorResponse(res, error.message, 400);
  }
};

module.exports = {
  createUniversity,
  getUniversities,
  getUniversityById,
  updateUniversity,
  updateUniversityStatus,
  deleteUniversity
};
