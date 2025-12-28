const { sequelize } = require('../config/database');
const { User, School, Faculty, Major, Class, Student } = require('../models');
const { hashPassword } = require('../utils/helper');

const seedDatabase = async () => {
  try {
    console.log('🌱 Bắt đầu seed dữ liệu...');

    // 1. Tạo trường đại học
    const school = await School.create({
      code: 'CTU',
      name: 'Đại học Cần Thơ',
      logo_url: 'https://example.com/ctu-logo.png',
      phone: '0292-3831301',
      address: 'Khu II, đường 3/2, P. Xuân Khánh, Q. Ninh Kiều, TP. Cần Thơ',
      status: 'ACTIVE'
    });

    console.log('✅ Đã tạo trường:', school.name);

    // Tạo trường Đại học Trà Vinh
    const schoolTVU = await School.create({
      code: 'TVU',
      name: 'Đại học Trà Vinh',
      logo_url: 'https://example.com/tvu-logo.png',
      phone: '0294-3855247',
      address: 'Số 126, đường Nguyễn Thiện Thành, phường Hòa Thuận, tỉnh Vĩnh Long',
      status: 'ACTIVE'
    });

    console.log('✅ Đã tạo trường:', schoolTVU.name);

    // 2. Tạo tài khoản SUPER_ADMIN
    const superAdmin = await User.create({
      school_id: null, // Super admin không thuộc trường nào
      username: 'superadmin',
      email: 'admin@system.com',
      password_hash: await hashPassword('123456'),
      role: 'SUPER_ADMIN',
      status: 'ACTIVE'
    });

    console.log('✅ Đã tạo SUPER_ADMIN:', superAdmin.username);

    // 3. Tạo tài khoản UNI_ADMIN
    const uniAdmin = await User.create({
      school_id: school.id,
      username: 'admin_ctu',
      email: 'admin@ctu.edu.vn',
      password_hash: await hashPassword('123456'),
      role: 'UNI_ADMIN',
      status: 'ACTIVE'
    });

    console.log('✅ Đã tạo UNI_ADMIN:', uniAdmin.username);

    // 4. Tạo Khoa
    const faculty = await Faculty.create({
      school_id: school.id,
      name: 'Khoa Công nghệ Thông tin & Truyền thông'
    });

    // 5. Tạo Ngành
    const major = await Major.create({
      faculty_id: faculty.id,
      name: 'Công nghệ Thông tin'
    });

    // 6. Tạo Lớp
    const classRoom = await Class.create({
      major_id: major.id,
      code: 'DA22TTC',
      name: 'Đại học Công nghệ Thông tin K47'
    });

    console.log('✅ Đã tạo cấu trúc: Khoa -> Ngành -> Lớp');

    // 7. Tạo tài khoản STUDENT
    const studentUser = await User.create({
      school_id: school.id,
      username: 'B2014595',
      email: 'student@ctu.edu.vn',
      password_hash: await hashPassword('123456'),
      role: 'STUDENT',
      status: 'ACTIVE'
    });

    // 8. Tạo profile sinh viên
    const student = await Student.create({
      user_id: studentUser.id,
      class_id: classRoom.id,
      full_name: 'Nguyễn Văn A',
      student_code: 'B2014595',
      dob: '2002-05-15',
      gender: 'MALE',
      gpa: 3.25,
      drr: 85,
      poor_cert_type: 'POOR',
      bank_number: '1234567890',
      bank_name: 'Vietcombank'
    });

    console.log('✅ Đã tạo STUDENT:', student.full_name);

    console.log('\n🎉 Seed dữ liệu thành công!');
    console.log('\n📋 Thông tin đăng nhập:');
    console.log('┌─────────────────────────────────────────┐');
    console.log('│ SUPER_ADMIN:                            │');
    console.log('│   Username: superadmin                  │');
    console.log('│   Password: 123456                      │');
    console.log('├─────────────────────────────────────────┤');
    console.log('│ UNI_ADMIN (Cán bộ CTU):                 │');
    console.log('│   Username: admin_ctu                   │');
    console.log('│   Password: 123456                      │');
    console.log('├─────────────────────────────────────────┤');
    console.log('│ STUDENT (Sinh viên):                    │');
    console.log('│   Username: B2014595                    │');
    console.log('│   Password: 123456                      │');
    console.log('└─────────────────────────────────────────┘');

  } catch (error) {
    console.error('❌ Lỗi khi seed dữ liệu:', error);
  } finally {
    await sequelize.close();
  }
};

// Chạy seed
seedDatabase();
