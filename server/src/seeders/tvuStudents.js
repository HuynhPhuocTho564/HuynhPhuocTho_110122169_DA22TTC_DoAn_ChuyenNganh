const { sequelize } = require('../config/database');
const { School, User, Student, Faculty, Major, Class } = require('../models');
const { hashPassword } = require('../utils/helper');

/**
 * Seed sinh viên cho Đại học Trà Vinh
 */
const seedTVUStudents = async () => {
  try {
    console.log('🌱 Bắt đầu seed sinh viên Đại học Trà Vinh...\n');

    // 1. Tìm trường TVU
    const tvuSchool = await School.findOne({ where: { code: 'TVU' } });
    if (!tvuSchool) {
      console.log('❌ Chưa có trường TVU. Vui lòng chạy tvuScholarships.js trước!');
      return;
    }

    // 2. Tạo Khoa
    console.log('📚 Tạo cấu trúc Khoa - Ngành - Lớp...');
    
    const faculties = await Faculty.bulkCreate([
      { school_id: tvuSchool.id, name: 'Khoa Kinh tế' },
      { school_id: tvuSchool.id, name: 'Khoa Công nghệ Thông tin' },
      { school_id: tvuSchool.id, name: 'Khoa Nông nghiệp - Thủy sản' },
      { school_id: tvuSchool.id, name: 'Khoa Ngôn ngữ - Văn hóa - Nghệ thuật' },
      { school_id: tvuSchool.id, name: 'Khoa Kỹ thuật và Công nghệ' }
    ], { ignoreDuplicates: true });

    // 3. Tạo Ngành
    const facultyKT = await Faculty.findOne({ where: { school_id: tvuSchool.id, name: 'Khoa Kinh tế' } });
    const facultyCNTT = await Faculty.findOne({ where: { school_id: tvuSchool.id, name: 'Khoa Công nghệ Thông tin' } });
    const facultyNN = await Faculty.findOne({ where: { school_id: tvuSchool.id, name: 'Khoa Nông nghiệp - Thủy sản' } });

    const majors = await Major.bulkCreate([
      { faculty_id: facultyKT.id, name: 'Kế toán' },
      { faculty_id: facultyKT.id, name: 'Quản trị Kinh doanh' },
      { faculty_id: facultyCNTT.id, name: 'Công nghệ Thông tin' },
      { faculty_id: facultyCNTT.id, name: 'Hệ thống Thông tin' },
      { faculty_id: facultyNN.id, name: 'Nuôi trồng Thủy sản' }
    ], { ignoreDuplicates: true });

    // 4. Tạo Lớp
    const majorCNTT = await Major.findOne({ where: { faculty_id: facultyCNTT.id, name: 'Công nghệ Thông tin' } });
    const majorKT = await Major.findOne({ where: { faculty_id: facultyKT.id, name: 'Kế toán' } });

    const classes = await Class.bulkCreate([
      { major_id: majorCNTT.id, code: 'DA22CNTT', name: 'Công nghệ Thông tin K22' },
      { major_id: majorCNTT.id, code: 'DA23CNTT', name: 'Công nghệ Thông tin K23' },
      { major_id: majorKT.id, code: 'DA22KT', name: 'Kế toán K22' }
    ], { ignoreDuplicates: true });

    const classCNTT22 = await Class.findOne({ where: { code: 'DA22CNTT' } });
    const classCNTT23 = await Class.findOne({ where: { code: 'DA23CNTT' } });
    const classKT22 = await Class.findOne({ where: { code: 'DA22KT' } });

    console.log('✅ Đã tạo cấu trúc Khoa - Ngành - Lớp');

    // 5. Tạo sinh viên
    console.log('\n👨‍🎓 Tạo sinh viên...');

    const studentsData = [
      {
        username: '110122001',
        email: '110122001@st.tvu.edu.vn',
        full_name: 'Nguyễn Văn An',
        student_code: '110122001',
        class_id: classCNTT22.id,
        dob: '2004-03-15',
        gender: 'MALE',
        gpa: 3.45,
        drr: 85,
        poor_cert_type: 'POOR',
        phone: '0901234567',
        address: 'Xã Long Đức, TP. Trà Vinh',
        bank_number: '1234567890',
        bank_name: 'Vietcombank'
      },
      {
        username: '110122002',
        email: '110122002@st.tvu.edu.vn',
        full_name: 'Trần Thị Bích',
        student_code: '110122002',
        class_id: classCNTT22.id,
        dob: '2004-07-22',
        gender: 'FEMALE',
        gpa: 3.68,
        drr: 90,
        poor_cert_type: 'NEAR_POOR',
        phone: '0912345678',
        address: 'Phường 1, TP. Trà Vinh',
        bank_number: '2345678901',
        bank_name: 'BIDV'
      },
      {
        username: '110122003',
        email: '110122003@st.tvu.edu.vn',
        full_name: 'Lê Hoàng Cường',
        student_code: '110122003',
        class_id: classCNTT22.id,
        dob: '2004-01-10',
        gender: 'MALE',
        gpa: 2.85,
        drr: 75,
        poor_cert_type: 'POOR',
        phone: '0923456789',
        address: 'Xã Hòa Thuận, TP. Trà Vinh',
        bank_number: '3456789012',
        bank_name: 'Agribank'
      },
      {
        username: '110123001',
        email: '110123001@st.tvu.edu.vn',
        full_name: 'Phạm Thị Dung',
        student_code: '110123001',
        class_id: classCNTT23.id,
        dob: '2005-05-20',
        gender: 'FEMALE',
        gpa: 3.25,
        drr: 82,
        poor_cert_type: 'POOR',
        phone: '0934567890',
        address: 'Huyện Càng Long, Trà Vinh',
        bank_number: '4567890123',
        bank_name: 'Sacombank'
      },
      {
        username: '110123002',
        email: '110123002@st.tvu.edu.vn',
        full_name: 'Võ Minh Em',
        student_code: '110123002',
        class_id: classCNTT23.id,
        dob: '2005-09-08',
        gender: 'MALE',
        gpa: 2.95,
        drr: 78,
        poor_cert_type: 'POOR',
        phone: '0945678901',
        address: 'Huyện Tiểu Cần, Trà Vinh',
        bank_number: '5678901234',
        bank_name: 'Vietinbank'
      },
      {
        username: '120122001',
        email: '120122001@st.tvu.edu.vn',
        full_name: 'Huỳnh Thị Phương',
        student_code: '120122001',
        class_id: classKT22.id,
        dob: '2004-11-25',
        gender: 'FEMALE',
        gpa: 3.55,
        drr: 88,
        poor_cert_type: 'NEAR_POOR',
        phone: '0956789012',
        address: 'Huyện Châu Thành, Trà Vinh',
        bank_number: '6789012345',
        bank_name: 'MB Bank'
      },
      {
        username: '120122002',
        email: '120122002@st.tvu.edu.vn',
        full_name: 'Nguyễn Thanh Giang',
        student_code: '120122002',
        class_id: classKT22.id,
        dob: '2004-04-12',
        gender: 'FEMALE',
        gpa: 3.72,
        drr: 92,
        poor_cert_type: 'POOR',
        phone: '0967890123',
        address: 'Huyện Cầu Kè, Trà Vinh',
        bank_number: '7890123456',
        bank_name: 'Techcombank'
      },
      {
        username: '110122004',
        email: '110122004@st.tvu.edu.vn',
        full_name: 'Trương Văn Hải',
        student_code: '110122004',
        class_id: classCNTT22.id,
        dob: '2004-08-30',
        gender: 'MALE',
        gpa: 3.15,
        drr: 80,
        poor_cert_type: 'POOR',
        phone: '0978901234',
        address: 'Huyện Trà Cú, Trà Vinh',
        bank_number: '8901234567',
        bank_name: 'ACB'
      },
      {
        username: '110122005',
        email: '110122005@st.tvu.edu.vn',
        full_name: 'Lý Thị Kim',
        student_code: '110122005',
        class_id: classCNTT22.id,
        dob: '2004-02-14',
        gender: 'FEMALE',
        gpa: 3.38,
        drr: 86,
        poor_cert_type: 'NEAR_POOR',
        phone: '0989012345',
        address: 'Huyện Duyên Hải, Trà Vinh',
        bank_number: '9012345678',
        bank_name: 'VPBank'
      },
      {
        username: '110123003',
        email: '110123003@st.tvu.edu.vn',
        full_name: 'Đặng Văn Long',
        student_code: '110123003',
        class_id: classCNTT23.id,
        dob: '2005-06-18',
        gender: 'MALE',
        gpa: 2.75,
        drr: 72,
        poor_cert_type: 'POOR',
        phone: '0990123456',
        address: 'Huyện Cầu Ngang, Trà Vinh',
        bank_number: '0123456789',
        bank_name: 'Vietcombank'
      }
    ];

    for (const data of studentsData) {
      let user = await User.findOne({ where: { username: data.username } });
      
      if (!user) {
        user = await User.create({
          school_id: tvuSchool.id,
          username: data.username,
          email: data.email,
          password_hash: await hashPassword('123456'),
          role: 'STUDENT',
          status: 'ACTIVE'
        });

        await Student.create({
          user_id: user.id,
          class_id: data.class_id,
          full_name: data.full_name,
          student_code: data.student_code,
          dob: data.dob,
          gender: data.gender,
          gpa: data.gpa,
          drr: data.drr,
          poor_cert_type: data.poor_cert_type,
          phone: data.phone,
          address: data.address,
          bank_number: data.bank_number,
          bank_name: data.bank_name
        });

        console.log(`✅ Đã tạo SV: ${data.full_name} (${data.student_code}) - ${data.poor_cert_type}`);
      } else {
        console.log(`ℹ️ Đã tồn tại: ${data.full_name}`);
      }
    }

    console.log('\n🎉 Seed sinh viên TVU thành công!');
    console.log('\n📋 Thông tin đăng nhập sinh viên:');
    console.log('┌──────────────────────────────────────────────────────┐');
    console.log('│ Tất cả sinh viên đăng nhập với:                      │');
    console.log('│   Username: Mã số sinh viên (VD: 110122001)          │');
    console.log('│   Password: 123456                                   │');
    console.log('├──────────────────────────────────────────────────────┤');
    console.log('│ Danh sách sinh viên khó khăn:                        │');
    console.log('│   110122001 - Nguyễn Văn An (Hộ nghèo)               │');
    console.log('│   110122002 - Trần Thị Bích (Cận nghèo)              │');
    console.log('│   110122003 - Lê Hoàng Cường (Mồ côi 1 bên)          │');
    console.log('│   110123001 - Phạm Thị Dung (Hộ nghèo)               │');
    console.log('│   110123002 - Võ Minh Em (Khuyết tật)                │');
    console.log('│   120122001 - Huỳnh Thị Phương (Cận nghèo)           │');
    console.log('│   120122002 - Nguyễn Thanh Giang (Mồ côi cả 2)       │');
    console.log('│   110122004 - Trương Văn Hải (Hộ nghèo)              │');
    console.log('│   110122005 - Lý Thị Kim (Cận nghèo)                 │');
    console.log('│   110123003 - Đặng Văn Long (Hộ nghèo)               │');
    console.log('└──────────────────────────────────────────────────────┘');

  } catch (error) {
    console.error('❌ Lỗi khi seed dữ liệu:', error);
    throw error;
  }
};

// Chạy seed
if (require.main === module) {
  seedTVUStudents()
    .then(() => {
      console.log('\n✅ Hoàn tất!');
      process.exit(0);
    })
    .catch((error) => {
      console.error('❌ Thất bại:', error);
      process.exit(1);
    });
}

module.exports = seedTVUStudents;
