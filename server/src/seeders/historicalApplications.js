/**
 * Tạo dữ liệu applications đã duyệt cho các năm 2023-2024 và 2024-2025
 * cho sponsor Báo Tuổi Trẻ - Tiếp sức đến trường
 */
const { Scholarship, Application, Student, Fund, Sponsor } = require('../models');
const { Op } = require('sequelize');

// Tên sinh viên mẫu
const studentNames = [
  'Nguyễn Văn An', 'Trần Thị Bình', 'Lê Văn Cường', 'Phạm Thị Dung', 'Hoàng Văn Em',
  'Vũ Thị Phương', 'Đặng Văn Giang', 'Bùi Thị Hoa', 'Ngô Văn Khang', 'Lý Thị Lan',
  'Trương Văn Minh', 'Đinh Thị Ngọc', 'Cao Văn Phúc', 'Dương Thị Quỳnh', 'Tạ Văn Sơn',
  'Hồ Thị Trang', 'Mai Văn Uy', 'Phan Thị Vân', 'Châu Văn Xuân', 'Lưu Thị Yến'
];

async function createHistoricalApplications() {
  try {
    console.log('🔧 Tạo dữ liệu applications cho năm 2023-2024 và 2024-2025...\n');

    // Tìm sponsor Báo Tuổi Trẻ
    const sponsor = await Sponsor.findOne({
      where: { company_name: { [Op.like]: '%Tuổi Trẻ%' } }
    });

    if (!sponsor) {
      console.log('❌ Không tìm thấy sponsor Báo Tuổi Trẻ');
      process.exit(1);
    }

    console.log(`✅ Sponsor: ${sponsor.company_name} (ID: ${sponsor.id})`);

    // Lấy các quỹ của sponsor
    const funds = await Fund.findAll({
      where: { sponsor_id: sponsor.id }
    });

    console.log(`📦 Số quỹ: ${funds.length}`);
    const fundIds = funds.map(f => f.id);

    // Lấy học bổng của sponsor cho năm 2023-2024 và 2024-2025
    const scholarships = await Scholarship.findAll({
      where: {
        fund_id: { [Op.in]: fundIds },
        academic_year: { [Op.in]: ['2023-2024', '2024-2025'] }
      }
    });

    console.log(`📚 Số học bổng tìm thấy: ${scholarships.length}`);

    if (scholarships.length === 0) {
      console.log('⚠️ Không có học bổng nào cho năm 2023-2024 và 2024-2025');
      console.log('Cần tạo học bổng trước...');
      
      // Tạo học bổng cho các năm này
      await createScholarshipsForYears(fundIds);
      
      // Lấy lại
      const newScholarships = await Scholarship.findAll({
        where: {
          fund_id: { [Op.in]: fundIds },
          academic_year: { [Op.in]: ['2023-2024', '2024-2025'] }
        }
      });
      
      await createApplicationsForScholarships(newScholarships);
    } else {
      await createApplicationsForScholarships(scholarships);
    }

    console.log('\n✅ Hoàn tất!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Lỗi:', error);
    process.exit(1);
  }
}

async function createScholarshipsForYears(fundIds) {
  const { School } = require('../models');
  
  // Lấy funds với thông tin school
  const funds = await Fund.findAll({
    where: { id: { [Op.in]: fundIds } },
    include: [{ model: School, as: 'school' }]
  });

  const years = ['2023-2024', '2024-2025'];
  const semesters = ['HK1', 'HK2'];

  for (const fund of funds) {
    for (const year of years) {
      for (const semester of semesters) {
        // Kiểm tra đã có chưa
        const existing = await Scholarship.findOne({
          where: {
            fund_id: fund.id,
            academic_year: year,
            semester: semester
          }
        });

        if (!existing) {
          const startYear = parseInt(year.split('-')[0]);
          const startDate = semester === 'HK1' 
            ? new Date(startYear, 8, 1)  // 01/09
            : new Date(startYear + 1, 1, 1); // 01/02
          const endDate = semester === 'HK1'
            ? new Date(startYear + 1, 0, 31) // 31/01
            : new Date(startYear + 1, 5, 30); // 30/06

          await Scholarship.create({
            school_id: fund.school_id,
            fund_id: fund.id,
            name: `HB ${fund.name} - ${semester} ${year}`,
            semester: semester,
            academic_year: year,
            amount_per_slot: 5000000,
            slots: 10,
            description: `Học bổng Tiếp sức đến trường ${semester} năm ${year}`,
            start_date: startDate,
            end_date: endDate,
            status: 'CLOSED'
          });
          console.log(`  ✅ Tạo HB: ${fund.name} - ${semester} ${year}`);
        }
      }
    }
  }
}

async function createApplicationsForScholarships(scholarships) {
  let totalCreated = 0;
  let nameIndex = 0;

  // Lấy tất cả students có sẵn
  const allStudents = await Student.findAll({ limit: 50 });
  
  if (allStudents.length === 0) {
    console.log('⚠️ Không có sinh viên nào trong database');
    return;
  }

  console.log(`👥 Tìm thấy ${allStudents.length} sinh viên`);

  for (const schol of scholarships) {
    // Lấy random 3-5 students
    const shuffled = [...allStudents].sort(() => 0.5 - Math.random());
    const numApps = Math.min(Math.floor(Math.random() * 3) + 3, shuffled.length);
    const selectedStudents = shuffled.slice(0, numApps);
    
    let created = 0;
    for (const student of selectedStudents) {
      const studentName = studentNames[nameIndex % studentNames.length];
      nameIndex++;

      // Kiểm tra đã có application cho học bổng này chưa
      const existing = await Application.findOne({
        where: { 
          scholarship_id: schol.id,
          student_id: student.id
        }
      });

      if (existing) continue;

      const submittedAt = new Date(schol.start_date);
      submittedAt.setDate(submittedAt.getDate() + Math.floor(Math.random() * 30));
      
      const reviewedAt = new Date(submittedAt);
      reviewedAt.setDate(reviewedAt.getDate() + Math.floor(Math.random() * 14) + 7);

      await Application.create({
        scholarship_id: schol.id,
        student_id: student.id,
        snapshot_data: {
          full_name: student.full_name || studentName,
          student_code: student.student_code || `SV${Math.floor(Math.random() * 900000) + 100000}`,
          email: `student${student.id}@edu.vn`,
          gpa: student.gpa || (Math.random() * 1.5 + 2.5).toFixed(2),
          family_income: Math.floor(Math.random() * 3000000) + 1000000
        },
        status: Math.random() > 0.2 ? 'APPROVED' : 'DISBURSED',
        submitted_at: submittedAt,
        reviewed_at: reviewedAt,
        reviewed_by: 1,
        review_note: 'Đủ điều kiện nhận học bổng'
      });
      totalCreated++;
      created++;
    }
    
    console.log(`  📝 ${schol.name}: tạo ${created} applications`);
  }

  console.log(`\n📊 Tổng applications đã tạo: ${totalCreated}`);
}

createHistoricalApplications();
