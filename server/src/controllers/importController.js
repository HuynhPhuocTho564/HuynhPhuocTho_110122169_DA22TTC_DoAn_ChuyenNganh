const { parseStudentExcel, generateStudentTemplate } = require('../utils/excelHelper');
const { User } = require('../models');
const bcrypt = require('bcryptjs');
const { successResponse, errorResponse } = require('../utils/responseHelper');

/**
 * Download template Excel
 */
const downloadTemplate = async (req, res) => {
  try {
    const buffer = generateStudentTemplate();
    
    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', 'attachment; filename=student_import_template.xlsx');
    res.send(buffer);
  } catch (error) {
    return errorResponse(res, error.message, 500);
  }
};

/**
 * Preview import data
 */
const previewImport = async (req, res) => {
  try {
    if (!req.file) {
      return errorResponse(res, 'Vui lòng upload file Excel', 400);
    }
    
    const students = parseStudentExcel(req.file.buffer);
    
    // Kiểm tra duplicate trong DB
    const studentCodes = students.map(s => s.data.student_code);
    const existingUsers = await User.findAll({
      where: { student_code: studentCodes },
      attributes: ['student_code']
    });
    
    const existingCodes = new Set(existingUsers.map(u => u.student_code));
    
    // Mark duplicates
    students.forEach(student => {
      if (existingCodes.has(student.data.student_code)) {
        student.errors.push('Mã sinh viên đã tồn tại');
        student.isDuplicate = true;
      }
    });
    
    const validCount = students.filter(s => s.errors.length === 0).length;
    const errorCount = students.filter(s => s.errors.length > 0).length;
    
    return successResponse(res, {
      students,
      summary: {
        total: students.length,
        valid: validCount,
        error: errorCount
      }
    }, 'Preview thành công');
  } catch (error) {
    return errorResponse(res, error.message, 500);
  }
};

/**
 * Import students from Excel
 */
const importStudents = async (req, res) => {
  try {
    if (!req.file) {
      return errorResponse(res, 'Vui lòng upload file Excel', 400);
    }
    
    const students = parseStudentExcel(req.file.buffer);
    
    // Filter valid students only
    const validStudents = students.filter(s => s.errors.length === 0);
    
    if (validStudents.length === 0) {
      return errorResponse(res, 'Không có sinh viên hợp lệ để import', 400);
    }
    
    // Check duplicates
    const studentCodes = validStudents.map(s => s.data.student_code);
    const existingUsers = await User.findAll({
      where: { student_code: studentCodes },
      attributes: ['student_code']
    });
    
    const existingCodes = new Set(existingUsers.map(u => u.student_code));
    const newStudents = validStudents.filter(s => !existingCodes.has(s.data.student_code));
    
    if (newStudents.length === 0) {
      return errorResponse(res, 'Tất cả sinh viên đã tồn tại trong hệ thống', 400);
    }
    
    // Hash passwords và prepare data
    const studentsToInsert = await Promise.all(
      newStudents.map(async (student) => {
        const hashedPassword = await bcrypt.hash(student.data.password, 10);
        return {
          ...student.data,
          password: hashedPassword,
          role: 'STUDENT',
          university_id: req.user.university_id, // From authenticated admin
          status: 'ACTIVE'
        };
      })
    );
    
    // Bulk insert
    const createdUsers = await User.bulkCreate(studentsToInsert);
    
    return successResponse(res, {
      imported: createdUsers.length,
      skipped: existingCodes.size,
      total: students.length
    }, `Import thành công ${createdUsers.length} sinh viên`);
  } catch (error) {
    return errorResponse(res, error.message, 500);
  }
};

module.exports = {
  downloadTemplate,
  previewImport,
  importStudents
};
