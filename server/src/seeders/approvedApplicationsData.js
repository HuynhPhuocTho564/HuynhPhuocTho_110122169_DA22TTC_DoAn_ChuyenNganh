const { sequelize } = require('../config/database');
const { User, Student, Scholarship, Application, Fund, Sponsor, School, Class } = require('../models');
const { hashPassword } = require('../utils/helper');

/**
 * Seed data cho sinh viên đã được duyệt nhận học bổng của sponsor_tuoitre
 * Chạy: node src/seeders/approvedApplicationsData.js
 */
const seedApprovedApplications = async () => {
  try {
    console.log('🌱 Bắt đầu seed sinh viên nhận học bổng...\n');

    // Tìm sponsor_tuoitre
    const sponsorUser = await User.findOne({ where: { username: 'sponsor_tuoitre' } });
    if (!sponsorUser) {
      console.log('❌ Không tìm thấy sponsor_tuoitre. Hãy chạy sponsorData.js trước.');
      return;
    }

    const sponsor = await Sponsor.findOne({ where: { user_id: sponsorUser.id } });
    if (!sponsor) {
      console.log('❌ Không tìm thấy sponsor profile.');
      return;
    }

    // Lấy các quỹ của sponsor_tuoitre
    const funds = await Fund.findAll({ where: { sponsor_id: sponsor.id } });
    if (funds.length === 0) {
      console.log('❌ Không tìm thấy quỹ tài trợ.');
      return;
    }

    const fundIds = funds.map(f => f.id);

    // Lấy các học bổng từ các quỹ này
    const scholarships = await Scholarship.findAll({
      where: { fund_id: fundIds },
      include: [{ model: School, as: 'school' }]
    });

    if (scholarships.length === 0) {
      console.log('❌ Không tìm thấy học bổng.');
      return;
    }

    console.log(`📚 Tìm thấy ${scholarships.length} học bổng của sponsor_tuoitre\n`);

    // Lấy class đầu tiên để gán cho sinh viên
    const defaultClass = await Class.findOne();

    // Danh sách sinh viên mẫu
    // poor_cert_type trong DB: NONE, POOR, NEAR_POOR, DISABILITY
    const studentsData = [
      { name: 'Nguyễn Văn An', code: 'B2100001', gpa: 3.2, drr: 78, poor: 'POOR' },
      { name: 'Trần Thị Bình', code: 'B2100002', gpa: 3.5, drr: 85, poor: 'NEAR_POOR' },
      { name: 'Lê Hoàng Cường', code: 'B2100003', gpa: 2.8, drr: 72, poor: 'DISABILITY' },
      { name: 'Phạm Minh Dũng', code: 'B2100004', gpa: 3.0, drr: 75, poor: 'POOR' },
      { name: 'Hoàng Thị Em', code: 'B2100005', gpa: 3.3, drr: 80, poor: 'NEAR_POOR' },
      { name: 'Võ Văn Phúc', code: 'B2100006', gpa: 2.9, drr: 70, poor: 'DISABILITY' },
      { name: 'Đặng Thị Giang', code: 'B2100007', gpa: 3.1, drr: 76, poor: 'POOR' },
      { name: 'Bùi Quốc Hùng', code: 'B2100008', gpa: 3.4, drr: 82, poor: 'NEAR_POOR' },
      { name: 'Ngô Thị Lan', code: 'B2100009', gpa: 2.7, drr: 68, poor: 'POOR' },
      { name: 'Trương Văn Khoa', code: 'B2100010', gpa: 3.6, drr: 88, poor: 'NEAR_POOR' },
      { name: 'Lý Thị Mai', code: 'B2100011', gpa: 2.5, drr: 65, poor: 'DISABILITY' },
      { name: 'Phan Văn Nam', code: 'B2100012', gpa: 3.2, drr: 79, poor: 'POOR' },
    ];

    let createdCount = 0;

    // Tạo sinh viên và hồ sơ đã duyệt cho mỗi học bổng
    for (let i = 0; i < scholarships.length && i < studentsData.length; i++) {
      const scholarship = scholarships[i];
      const studentData = studentsData[i];

      // Tạo user cho sinh viên
      const [studentUser, userCreated] = await User.findOrCreate({
        where: { username: studentData.code },
        defaults: {
          school_id: scholarship.school_id,
          username: studentData.code,
          email: `${studentData.code.toLowerCase()}@student.edu.vn`,
          password_hash: await hashPassword('123456'),
          full_name: studentData.name,
          role: 'STUDENT',
          status: 'ACTIVE'
        }
      });

      // Tạo student profile
      const [student, studentCreated] = await Student.findOrCreate({
        where: { user_id: studentUser.id },
        defaults: {
          user_id: studentUser.id,
          class_id: defaultClass?.id || 1,
          full_name: studentData.name,
          student_code: studentData.code,
          dob: '2002-05-15',
          gender: i % 2 === 0 ? 'MALE' : 'FEMALE',
          gpa: studentData.gpa,
          drr: studentData.drr,
          poor_cert_type: studentData.poor,
          bank_number: `${1000000000 + i}`,
          bank_name: 'Vietcombank'
        }
      });

      // Tạo application đã được duyệt
      const [application, appCreated] = await Application.findOrCreate({
        where: {
          student_id: student.id,
          scholarship_id: scholarship.id
        },
        defaults: {
          student_id: student.id,
          scholarship_id: scholarship.id,
          status: 'APPROVED',
          snapshot_data: {
            full_name: studentData.name,
            student_code: studentData.code,
            gpa: studentData.gpa,
            drr: studentData.drr,
            circumstance: studentData.poor === 'DISABILITY' ? 'Khuyết tật' : 
                          studentData.poor === 'POOR' ? 'Hộ nghèo' : 'Hộ cận nghèo',
            bank_number: `${1000000000 + i}`,
            bank_name: 'Vietcombank'
          },
          system_score: Math.floor(studentData.gpa * 20 + studentData.drr * 0.5),
          reviewed_at: new Date(),
          reviewed_by: 1
        }
      });

      if (appCreated) {
        createdCount++;
        console.log(`   ✅ ${studentData.name} -> ${scholarship.name}`);
      }
    }

    console.log(`\n🎉 Đã tạo ${createdCount} hồ sơ sinh viên đã duyệt!\n`);

    console.log('📊 Tổng kết:');
    console.log(`   - Nhà tài trợ: sponsor_tuoitre (Báo Tuổi Trẻ)`);
    console.log(`   - Số học bổng: ${scholarships.length}`);
    console.log(`   - Số SV được duyệt: ${createdCount}\n`);

  } catch (error) {
    console.error('❌ Lỗi khi seed dữ liệu:', error);
    throw error;
  }
};

// Chạy seed
if (require.main === module) {
  seedApprovedApplications()
    .then(() => {
      console.log('✅ Hoàn tất!');
      process.exit(0);
    })
    .catch((error) => {
      console.error('❌ Thất bại:', error);
      process.exit(1);
    });
}

module.exports = seedApprovedApplications;
