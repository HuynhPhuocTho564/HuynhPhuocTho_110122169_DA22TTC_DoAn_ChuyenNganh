const XLSX = require('xlsx');
const bcrypt = require('bcryptjs');

/**
 * Parse Excel file và validate data
 */
const parseStudentExcel = (buffer) => {
  try {
    const workbook = XLSX.read(buffer, { type: 'buffer' });
    const sheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[sheetName];
    
    // Convert to JSON
    const data = XLSX.utils.sheet_to_json(worksheet);
    
    // Validate và transform data
    const students = data.map((row, index) => {
      const errors = [];
      
      // Required fields
      if (!row.student_code) errors.push('Thiếu mã sinh viên');
      if (!row.full_name) errors.push('Thiếu họ tên');
      if (!row.email) errors.push('Thiếu email');
      
      // Validate email format
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (row.email && !emailRegex.test(row.email)) {
        errors.push('Email không hợp lệ');
      }
      
      // Validate GPA (0-4.0)
      const gpa = parseFloat(row.gpa);
      if (row.gpa !== undefined && row.gpa !== null && row.gpa !== '') {
        if (isNaN(gpa) || gpa < 0 || gpa > 4) {
          errors.push('GPA phải là số từ 0-4.0');
        }
      }
      
      // Validate DRR (0-100)
      const drr = parseFloat(row.drr);
      if (row.drr !== undefined && row.drr !== null && row.drr !== '') {
        if (isNaN(drr) || drr < 0 || drr > 100) {
          errors.push('Điểm rèn luyện phải là số từ 0-100');
        }
      }
      
      // Validate số tài khoản ngân hàng (nếu có)
      if (row.bank_number) {
        const bankNum = row.bank_number.toString().replace(/\D/g, '');
        if (bankNum.length < 8 || bankNum.length > 20) {
          errors.push('Số tài khoản phải từ 8-20 chữ số');
        }
      }
      
      return {
        rowNumber: index + 2, // +2 vì row 1 là header và index bắt đầu từ 0
        data: {
          student_code: row.student_code?.toString().trim(),
          username: row.username?.toString().trim() || row.student_code?.toString().trim(),
          full_name: row.full_name?.toString().trim(),
          email: row.email?.toString().trim(),
          phone: row.phone?.toString().trim() || null,
          date_of_birth: row.date_of_birth ? new Date(row.date_of_birth) : null,
          gender: row.gender?.toString().toUpperCase() || 'OTHER',
          address: row.address?.toString().trim() || null,
          gpa: row.gpa ? parseFloat(row.gpa) : null,
          drr: row.drr ? parseFloat(row.drr) : null,
          is_poor: row.is_poor ? Boolean(row.is_poor) : false,
          password: row.password?.toString() || '123456', // Default password
        },
        errors
      };
    });
    
    return students;
  } catch (error) {
    throw new Error(`Lỗi đọc file Excel: ${error.message}`);
  }
};

/**
 * Generate Excel template for student import
 */
const generateStudentTemplate = () => {
  const template = [
    {
      student_code: 'B2014595',
      username: 'B2014595',
      full_name: 'Nguyễn Văn A',
      email: 'student@example.com',
      phone: '0123456789',
      date_of_birth: '2000-01-01',
      gender: 'MALE',
      address: 'Cần Thơ',
      gpa: 3.5,
      drr: 85,
      is_poor: 1,
      password: '123456'
    }
  ];
  
  const worksheet = XLSX.utils.json_to_sheet(template);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Students');
  
  return XLSX.write(workbook, { type: 'buffer', bookType: 'xlsx' });
};

/**
 * Export students to Excel
 */
const exportStudentsToExcel = (students) => {
  const data = students.map(student => ({
    'Mã SV': student.student_code,
    'Username': student.username,
    'Họ tên': student.full_name,
    'Email': student.email,
    'SĐT': student.phone,
    'Ngày sinh': student.date_of_birth,
    'Giới tính': student.gender,
    'Địa chỉ': student.address,
    'GPA': student.gpa,
    'Điểm rèn luyện': student.drr,
    'Hộ nghèo': student.is_poor ? 'Có' : 'Không',
    'Trạng thái': student.status
  }));
  
  const worksheet = XLSX.utils.json_to_sheet(data);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Students');
  
  return XLSX.write(workbook, { type: 'buffer', bookType: 'xlsx' });
};

/**
 * Export applications to Excel
 */
const exportApplicationsToExcel = (applications) => {
  const data = applications.map(app => ({
    'Mã hồ sơ': app.id,
    'Mã SV': app.Student?.student_code,
    'Họ tên': app.Student?.full_name,
    'Học bổng': app.Scholarship?.name,
    'GPA': app.gpa_at_submission,
    'Điểm rèn luyện': app.drr_at_submission,
    'Điểm tổng': app.total_score,
    'Trạng thái': app.status,
    'Ngày nộp': app.submitted_at,
    'Ngày duyệt': app.reviewed_at,
    'Ghi chú admin': app.admin_note
  }));
  
  const worksheet = XLSX.utils.json_to_sheet(data);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Applications');
  
  return XLSX.write(workbook, { type: 'buffer', bookType: 'xlsx' });
};

module.exports = {
  parseStudentExcel,
  generateStudentTemplate,
  exportStudentsToExcel,
  exportApplicationsToExcel
};
