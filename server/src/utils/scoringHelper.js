// Hàm tính điểm tự động cho hồ sơ (Auto Ranking/Scoring)
// Điểm càng cao = Ưu tiên càng cao

// Validate và chuẩn hóa GPA (0-4.0)
const validateGPA = (gpa) => {
  const value = parseFloat(gpa) || 0;
  return Math.max(0, Math.min(4.0, value));
};

// Validate và chuẩn hóa DRR (0-100)
const validateDRR = (drr) => {
  const value = parseInt(drr) || 0;
  return Math.max(0, Math.min(100, value));
};

const calculateApplicationScore = (studentData, criteriaJson = {}) => {
  let score = 0;

  // 1. Điểm GPA (40% trọng số) - Thang điểm 4.0
  const gpa = validateGPA(studentData.gpa);
  const gpaScore = (gpa / 4.0) * 40; // Max 40 điểm
  score += gpaScore;

  // 2. Điểm rèn luyện (20% trọng số) - Thang điểm 100
  const drr = validateDRR(studentData.drr);
  const drrScore = (drr / 100) * 20; // Max 20 điểm
  score += drrScore;

  // 3. Điểm hoàn cảnh (40% trọng số)
  const poorCertType = studentData.poor_cert_type;
  let circumstanceScore = 0;

  switch (poorCertType) {
    case 'POOR': // Hộ nghèo
      circumstanceScore = 40;
      break;
    case 'NEAR_POOR': // Hộ cận nghèo
      circumstanceScore = 30;
      break;
    case 'DISABILITY': // Khuyết tật
      circumstanceScore = 35;
      break;
    case 'NONE': // Không có
      circumstanceScore = 0;
      break;
    default:
      circumstanceScore = 0;
  }

  score += circumstanceScore;

  // 4. Áp dụng tiêu chí động từ criteria_json (nếu có)
  if (criteriaJson.min_gpa && gpa < criteriaJson.min_gpa) {
    score = 0; // Không đủ điều kiện
  }

  if (criteriaJson.min_drr && drr < criteriaJson.min_drr) {
    score = 0;
  }

  if (criteriaJson.require_poor && poorCertType === 'NONE') {
    score = 0; // Bắt buộc phải có hộ nghèo
  }

  // Làm tròn 2 chữ số thập phân
  return Math.round(score * 100) / 100;
};

// Hàm kiểm tra hồ sơ có đủ điều kiện không
const checkEligibility = (studentData, criteriaJson = {}) => {
  const errors = [];

  const gpa = validateGPA(studentData.gpa);
  const drr = validateDRR(studentData.drr);

  // Check GPA tối thiểu
  if (criteriaJson.min_gpa && gpa < criteriaJson.min_gpa) {
    errors.push(`GPA tối thiểu yêu cầu: ${criteriaJson.min_gpa}`);
  }

  // Check điểm rèn luyện tối thiểu
  if (criteriaJson.min_drr && drr < criteriaJson.min_drr) {
    errors.push(`Điểm rèn luyện tối thiểu: ${criteriaJson.min_drr}`);
  }

  // Check yêu cầu hộ nghèo
  if (criteriaJson.require_poor && studentData.poor_cert_type === 'NONE') {
    errors.push('Học bổng này yêu cầu có giấy xác nhận hộ nghèo/cận nghèo');
  }

  return {
    isEligible: errors.length === 0,
    errors
  };
};

module.exports = {
  calculateApplicationScore,
  checkEligibility,
  validateGPA,
  validateDRR
};
