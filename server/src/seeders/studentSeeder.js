const bcrypt = require('bcryptjs');
const { User, Student, School } = require('../models');

/**
 * Seed 40 sinh viên (10 mỗi trường) với mã sinh viên và email thực tế
 * Mật khẩu: 123456
 */
const seedStudents = async () => {
  try {
    console.log('🌱 Seed dữ liệu sinh viên...\n');

    const passwordHash = await bcrypt.hash('123456', 10);

    // Lấy các trường
    const ctu = await School.findOne({ where: { code: 'CTU' } });
    const hcmut = await School.findOne({ where: { code: 'HCMUT' } });
    const hust = await School.findOne({ where: { code: 'HUST' } });
    const hcmuaf = await School.findOne({ where: { code: 'HCMUAF' } });

    if (!ctu || !hcmut || !hust || !hcmuaf) {
      console.log('❌ Chưa có đủ dữ liệu trường');
      return;
    }

    // Danh sách sinh viên theo trường
    const studentsData = [
      // ĐH Cần Thơ - Mã SV: B + năm + số (VD: B2100001)
      // Email: mssv@student.ctu.edu.vn
      ...generateStudents(ctu.id, 'CTU', 'B21', '@student.ctu.edu.vn', [
        { name: 'Nguyễn Văn An', gender: 'MALE', gpa: 3.45, drr: 85, poor: 'NONE' },
        { name: 'Trần Thị Bích', gender: 'FEMALE', gpa: 3.72, drr: 90, poor: 'POOR' },
        { name: 'Lê Hoàng Cường', gender: 'MALE', gpa: 2.85, drr: 75, poor: 'NEAR_POOR' },
        { name: 'Phạm Thị Dung', gender: 'FEMALE', gpa: 3.55, drr: 88, poor: 'NONE' },
        { name: 'Võ Minh Đức', gender: 'MALE', gpa: 3.20, drr: 82, poor: 'POOR' },
        { name: 'Huỳnh Thị Em', gender: 'FEMALE', gpa: 3.68, drr: 92, poor: 'NONE' },
        { name: 'Đặng Văn Phúc', gender: 'MALE', gpa: 2.95, drr: 78, poor: 'NEAR_POOR' },
        { name: 'Ngô Thị Giang', gender: 'FEMALE', gpa: 3.82, drr: 95, poor: 'NONE' },
        { name: 'Bùi Quốc Hải', gender: 'MALE', gpa: 3.15, drr: 80, poor: 'DISABILITY' },
        { name: 'Lý Thị Hương', gender: 'FEMALE', gpa: 3.38, drr: 86, poor: 'POOR' },
      ]),

      // ĐH Bách Khoa TP.HCM - Mã SV: số 7 chữ số (VD: 2112001)
      // Email: mssv@hcmut.edu.vn
      ...generateStudents(hcmut.id, 'HCMUT', '21120', '@hcmut.edu.vn', [
        { name: 'Trương Văn Khoa', gender: 'MALE', gpa: 3.65, drr: 88, poor: 'NONE' },
        { name: 'Lê Thị Lan', gender: 'FEMALE', gpa: 3.48, drr: 85, poor: 'POOR' },
        { name: 'Nguyễn Hoàng Minh', gender: 'MALE', gpa: 3.92, drr: 96, poor: 'NONE' },
        { name: 'Phan Thị Ngọc', gender: 'FEMALE', gpa: 3.25, drr: 82, poor: 'NEAR_POOR' },
        { name: 'Hoàng Văn Phong', gender: 'MALE', gpa: 3.55, drr: 87, poor: 'NONE' },
        { name: 'Đỗ Thị Quỳnh', gender: 'FEMALE', gpa: 3.78, drr: 91, poor: 'POOR' },
        { name: 'Vũ Đình Sơn', gender: 'MALE', gpa: 3.12, drr: 79, poor: 'NONE' },
        { name: 'Mai Thị Trang', gender: 'FEMALE', gpa: 3.42, drr: 84, poor: 'DISABILITY' },
        { name: 'Đinh Văn Uy', gender: 'MALE', gpa: 2.88, drr: 76, poor: 'NEAR_POOR' },
        { name: 'Cao Thị Vân', gender: 'FEMALE', gpa: 3.58, drr: 89, poor: 'NONE' },
      ]),

      // ĐH Bách Khoa Hà Nội - Mã SV: năm + mã khoa + số (VD: 20210001)
      // Email: mssv@sis.hust.edu.vn
      ...generateStudents(hust.id, 'HUST', '202100', '@sis.hust.edu.vn', [
        { name: 'Phạm Xuân Bách', gender: 'MALE', gpa: 3.75, drr: 90, poor: 'NONE' },
        { name: 'Nguyễn Thị Châu', gender: 'FEMALE', gpa: 3.52, drr: 86, poor: 'POOR' },
        { name: 'Trần Đức Dũng', gender: 'MALE', gpa: 3.88, drr: 94, poor: 'NONE' },
        { name: 'Lê Thị Hà', gender: 'FEMALE', gpa: 3.18, drr: 81, poor: 'NEAR_POOR' },
        { name: 'Vương Văn Kiên', gender: 'MALE', gpa: 3.62, drr: 88, poor: 'NONE' },
        { name: 'Đào Thị Linh', gender: 'FEMALE', gpa: 3.95, drr: 97, poor: 'NONE' },
        { name: 'Hoàng Minh Nam', gender: 'MALE', gpa: 3.28, drr: 83, poor: 'POOR' },
        { name: 'Bùi Thị Oanh', gender: 'FEMALE', gpa: 3.45, drr: 85, poor: 'DISABILITY' },
        { name: 'Ngô Quang Phú', gender: 'MALE', gpa: 2.92, drr: 77, poor: 'NEAR_POOR' },
        { name: 'Lý Thị Quyên', gender: 'FEMALE', gpa: 3.68, drr: 91, poor: 'NONE' },
      ]),

      // ĐH Nông Lâm TP.HCM - Mã SV: năm + mã khoa + số (VD: 21126001)
      // Email: mssv@st.hcmuaf.edu.vn
      ...generateStudents(hcmuaf.id, 'HCMUAF', '211260', '@st.hcmuaf.edu.vn', [
        { name: 'Trần Văn Rạng', gender: 'MALE', gpa: 3.35, drr: 84, poor: 'POOR' },
        { name: 'Nguyễn Thị Sen', gender: 'FEMALE', gpa: 3.58, drr: 87, poor: 'NONE' },
        { name: 'Lê Hoàng Tâm', gender: 'MALE', gpa: 3.22, drr: 80, poor: 'NEAR_POOR' },
        { name: 'Phạm Thị Uyên', gender: 'FEMALE', gpa: 3.72, drr: 92, poor: 'NONE' },
        { name: 'Võ Văn Vinh', gender: 'MALE', gpa: 2.98, drr: 78, poor: 'POOR' },
        { name: 'Huỳnh Thị Xuân', gender: 'FEMALE', gpa: 3.48, drr: 86, poor: 'NONE' },
        { name: 'Đặng Quốc Yên', gender: 'MALE', gpa: 3.15, drr: 81, poor: 'DISABILITY' },
        { name: 'Ngô Thị Ánh', gender: 'FEMALE', gpa: 3.82, drr: 93, poor: 'NONE' },
        { name: 'Bùi Văn Bình', gender: 'MALE', gpa: 3.05, drr: 79, poor: 'NEAR_POOR' },
        { name: 'Lý Thị Cẩm', gender: 'FEMALE', gpa: 3.62, drr: 89, poor: 'POOR' },
      ]),
    ];

    // Tạo users và students
    let created = 0;
    for (const data of studentsData) {
      // Kiểm tra user đã tồn tại chưa
      const existingUser = await User.findOne({ where: { email: data.email } });
      if (existingUser) {
        console.log(`⏭️  Skip: ${data.email} (đã tồn tại)`);
        continue;
      }

      // Tạo user
      const user = await User.create({
        school_id: data.school_id,
        username: data.student_code,
        email: data.email,
        password_hash: passwordHash,
        role: 'STUDENT',
        status: 'ACTIVE'
      });

      // Tạo student profile
      await Student.create({
        user_id: user.id,
        full_name: data.full_name,
        student_code: data.student_code,
        dob: data.dob,
        gender: data.gender,
        gpa: data.gpa,
        drr: data.drr,
        poor_cert_type: data.poor_cert_type,
        phone: data.phone,
        address: data.address,
        id_number: data.id_number
      });

      created++;
      console.log(`✅ ${data.student_code} - ${data.full_name} (${data.school_code})`);
    }

    console.log(`\n📊 Đã tạo ${created} sinh viên mới`);

  } catch (error) {
    console.error('❌ Lỗi:', error);
    throw error;
  }
};

// Helper function để generate danh sách sinh viên
function generateStudents(schoolId, schoolCode, codePrefix, emailDomain, students) {
  return students.map((s, index) => {
    const num = String(index + 1).padStart(2, '0');
    const studentCode = `${codePrefix}${num}`;
    const year = 2003 + Math.floor(Math.random() * 3); // 2003-2005
    const month = Math.floor(Math.random() * 12) + 1;
    const day = Math.floor(Math.random() * 28) + 1;
    
    return {
      school_id: schoolId,
      school_code: schoolCode,
      student_code: studentCode,
      email: `${studentCode.toLowerCase()}${emailDomain}`,
      full_name: s.name,
      dob: new Date(year, month - 1, day),
      gender: s.gender,
      gpa: s.gpa,
      drr: s.drr,
      poor_cert_type: s.poor,
      phone: `09${Math.floor(10000000 + Math.random() * 90000000)}`,
      address: getRandomAddress(schoolCode),
      id_number: `0${Math.floor(10000000000 + Math.random() * 90000000000)}`
    };
  });
}

function getRandomAddress(schoolCode) {
  const addresses = {
    CTU: ['Ninh Kiều, Cần Thơ', 'Bình Thủy, Cần Thơ', 'Ô Môn, Cần Thơ', 'Vĩnh Long', 'An Giang'],
    HCMUT: ['Quận 10, TP.HCM', 'Bình Thạnh, TP.HCM', 'Gò Vấp, TP.HCM', 'Thủ Đức, TP.HCM', 'Tân Bình, TP.HCM'],
    HUST: ['Hai Bà Trưng, Hà Nội', 'Đống Đa, Hà Nội', 'Cầu Giấy, Hà Nội', 'Thanh Xuân, Hà Nội', 'Hoàng Mai, Hà Nội'],
    HCMUAF: ['Thủ Đức, TP.HCM', 'Quận 9, TP.HCM', 'Bình Dương', 'Đồng Nai', 'Long An']
  };
  const list = addresses[schoolCode] || addresses.CTU;
  return list[Math.floor(Math.random() * list.length)];
}

if (require.main === module) {
  seedStudents()
    .then(() => {
      console.log('\n✅ Hoàn tất!');
      process.exit(0);
    })
    .catch((error) => {
      console.error('❌ Thất bại:', error);
      process.exit(1);
    });
}

module.exports = seedStudents;
