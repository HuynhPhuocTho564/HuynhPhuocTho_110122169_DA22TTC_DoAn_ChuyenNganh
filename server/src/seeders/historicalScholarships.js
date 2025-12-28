const { School, Scholarship, User, Application, Student } = require('../models');

/**
 * Seed dữ liệu học bổng lịch sử cho các năm 2022, 2023, 2024
 * Mỗi năm có 2 học kỳ (HK1, HK2)
 */
const seedHistoricalScholarships = async () => {
  try {
    console.log('🌱 Bắt đầu seed dữ liệu học bổng lịch sử...\n');

    // Lấy tất cả trường đang hoạt động
    const schools = await School.findAll({ where: { status: 'ACTIVE' } });
    if (schools.length === 0) {
      console.log('❌ Không có trường nào trong hệ thống!');
      return;
    }

    // Lấy admin của mỗi trường
    const adminMap = {};
    for (const school of schools) {
      const admin = await User.findOne({ 
        where: { school_id: school.id, role: 'UNI_ADMIN', status: 'ACTIVE' } 
      });
      if (admin) adminMap[school.id] = admin.id;
    }

    // Các năm và học kỳ cần tạo
    const years = ['2022', '2023', '2024'];
    const semesters = ['HK1', 'HK2'];

    // Template học bổng
    const scholarshipTemplates = [
      {
        nameTemplate: 'Học bổng Khuyến khích Học tập',
        description: 'Học bổng dành cho sinh viên có kết quả học tập xuất sắc trong học kỳ.',
        amount_per_slot: 5000000,
        slots: 20,
        criteria_json: { min_gpa: 3.2, min_drr: 75 },
        status: 'FINISHED'
      },
      {
        nameTemplate: 'Học bổng Hỗ trợ Sinh viên Khó khăn',
        description: 'Học bổng dành cho sinh viên có hoàn cảnh gia đình khó khăn.',
        amount_per_slot: 3000000,
        slots: 30,
        criteria_json: { min_gpa: 2.0, require_poor: true, poor_types: ['POOR', 'NEAR_POOR'] },
        status: 'FINISHED'
      },
      {
        nameTemplate: 'Học bổng Toàn phần',
        description: 'Học bổng toàn phần dành cho sinh viên xuất sắc nhất.',
        amount_per_slot: 15000000,
        slots: 5,
        criteria_json: { min_gpa: 3.6, min_drr: 85 },
        status: 'FINISHED'
      }
    ];

    let createdCount = 0;

    for (const school of schools) {
      const adminId = adminMap[school.id];
      if (!adminId) {
        console.log(`⚠️ Trường ${school.name} không có admin, bỏ qua...`);
        continue;
      }

      console.log(`\n📚 Tạo học bổng cho ${school.name}...`);

      for (const year of years) {
        for (const semester of semesters) {
          for (const template of scholarshipTemplates) {
            const name = `${template.nameTemplate} ${school.code} ${semester} ${year}`;
            
            // Kiểm tra đã tồn tại chưa
            const existing = await Scholarship.findOne({
              where: { school_id: school.id, name }
            });

            if (!existing) {
              // Tính ngày bắt đầu và kết thúc
              const yearNum = parseInt(year);
              let startDate, endDate;
              
              if (semester === 'HK1') {
                startDate = new Date(yearNum, 8, 1);  // 1/9
                endDate = new Date(yearNum, 11, 31);  // 31/12
              } else {
                startDate = new Date(yearNum + 1, 0, 1);  // 1/1 năm sau
                endDate = new Date(yearNum + 1, 5, 30);   // 30/6 năm sau
              }

              await Scholarship.create({
                school_id: school.id,
                fund_id: null,
                name,
                description: `${template.description} Năm học ${year}-${parseInt(year) + 1}, ${semester}.`,
                semester,
                academic_year: year,
                amount_per_slot: template.amount_per_slot,
                slots: template.slots,
                start_date: startDate,
                end_date: endDate,
                status: template.status,
                criteria_json: template.criteria_json,
                created_by: adminId
              });
              createdCount++;
            }
          }
        }
      }
    }

    console.log(`\n✅ Đã tạo ${createdCount} học bổng lịch sử!`);

    // Tạo một số hồ sơ đã duyệt cho các năm trước
    console.log('\n📝 Tạo hồ sơ đã duyệt cho các năm trước...');
    await createHistoricalApplications();

    console.log('\n🎉 Seed dữ liệu lịch sử hoàn tất!');

  } catch (error) {
    console.error('❌ Lỗi khi seed dữ liệu:', error);
    throw error;
  }
};

/**
 * Tạo hồ sơ đã duyệt cho các năm trước
 */
const createHistoricalApplications = async () => {
  try {
    // Lấy các học bổng đã hoàn thành
    const finishedScholarships = await Scholarship.findAll({
      where: { status: 'FINISHED' },
      include: [{ model: School, as: 'school' }]
    });

    if (finishedScholarships.length === 0) {
      console.log('⚠️ Không có học bổng FINISHED nào');
      return;
    }

    let appCount = 0;

    for (const scholarship of finishedScholarships) {
      // Lấy sinh viên của trường này
      const students = await Student.findAll({
        include: [{
          model: User,
          as: 'user',
          where: { school_id: scholarship.school_id, status: 'ACTIVE' }
        }],
        limit: Math.min(scholarship.slots, 3) // Tối đa 3 hồ sơ mỗi học bổng
      });

      for (const student of students) {
        // Kiểm tra đã có hồ sơ chưa
        const existingApp = await Application.findOne({
          where: { student_id: student.id, scholarship_id: scholarship.id }
        });

        if (!existingApp) {
          await Application.create({
            student_id: student.id,
            scholarship_id: scholarship.id,
            status: 'APPROVED',
            snapshot_data: {
              full_name: student.user.full_name || student.full_name || 'Sinh viên',
              student_code: student.student_code,
              gpa: student.gpa || 3.0,
              drr: student.drr || 75
            },
            submitted_at: scholarship.start_date,
            reviewed_at: new Date(scholarship.start_date.getTime() + 7 * 24 * 60 * 60 * 1000),
            reviewed_by: scholarship.created_by
          });
          appCount++;
        }
      }
    }

    console.log(`✅ Đã tạo ${appCount} hồ sơ đã duyệt`);

  } catch (error) {
    console.error('Lỗi tạo hồ sơ:', error.message);
  }
};

// Chạy seed
if (require.main === module) {
  seedHistoricalScholarships()
    .then(() => {
      console.log('\n✅ Hoàn tất!');
      process.exit(0);
    })
    .catch((error) => {
      console.error('❌ Thất bại:', error);
      process.exit(1);
    });
}

module.exports = seedHistoricalScholarships;
