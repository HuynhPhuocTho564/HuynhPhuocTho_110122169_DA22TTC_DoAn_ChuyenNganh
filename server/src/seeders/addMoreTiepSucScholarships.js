/**
 * Thêm nhiều loại học bổng cho chương trình Tiếp sức đến trường
 * cho các năm 2023-2024 và 2024-2025
 */
const { Scholarship, Fund, Sponsor, Student, Application } = require('../models');
const { Op } = require('sequelize');

// Các loại học bổng Tiếp sức đến trường
const scholarshipTypes = [
  { name: 'Nghèo vượt khó', amount: 15000000, slots: 20 },
  { name: 'Cận nghèo học giỏi', amount: 10000000, slots: 15 },
  { name: 'Mồ côi hiếu học', amount: 20000000, slots: 10 },
  { name: 'Xuất sắc', amount: 8000000, slots: 25 },
  { name: 'Vượt khó', amount: 5000000, slots: 30 }
];

const years = ['2023-2024', '2024-2025'];
const semesters = ['HK1', 'HK2'];

// Tên sinh viên mẫu
const studentNames = [
  'Nguyễn Văn An', 'Trần Thị Bình', 'Lê Văn Cường', 'Phạm Thị Dung', 'Hoàng Văn Em',
  'Vũ Thị Phương', 'Đặng Văn Giang', 'Bùi Thị Hoa', 'Ngô Văn Khang', 'Lý Thị Lan',
  'Trương Văn Minh', 'Đinh Thị Ngọc', 'Cao Văn Phúc', 'Dương Thị Quỳnh', 'Tạ Văn Sơn'
];

async function addMoreScholarships() {
  try {
    console.log('🔧 Thêm học bổng Tiếp sức đến trường cho 2023-2024 và 2024-2025...\n');

    // Tìm sponsor Báo Tuổi Trẻ
    const sponsor = await Sponsor.findOne({
      where: { company_name: { [Op.like]: '%Tuổi Trẻ%' } }
    });

    if (!sponsor) {
      console.log('❌ Không tìm thấy sponsor Báo Tuổi Trẻ');
      process.exit(1);
    }

    // Lấy các quỹ của sponsor
    const funds = await Fund.findAll({
      where: { sponsor_id: sponsor.id }
    });

    console.log(`📦 Số quỹ: ${funds.length}`);

    let totalScholarships = 0;
    let totalApplications = 0;

    // Lấy students để tạo applications
    const allStudents = await Student.findAll({ limit: 50 });
    console.log(`👥 Số sinh viên: ${allStudents.length}\n`);

    for (const fund of funds) {
      console.log(`\n📁 Quỹ: ${fund.name}`);
      
      for (const year of years) {
        for (const semester of semesters) {
          for (const type of scholarshipTypes) {
            // Kiểm tra đã có chưa
            const existing = await Scholarship.findOne({
              where: {
                fund_id: fund.id,
                academic_year: year,
                semester: semester,
                name: { [Op.like]: `%${type.name}%` }
              }
            });

            if (existing) continue;

            const startYear = parseInt(year.split('-')[0]);
            const startDate = semester === 'HK1' 
              ? new Date(startYear, 8, 1)
              : new Date(startYear + 1, 1, 1);
            const endDate = semester === 'HK1'
              ? new Date(startYear + 1, 0, 31)
              : new Date(startYear + 1, 5, 30);

            const schol = await Scholarship.create({
              school_id: fund.school_id,
              fund_id: fund.id,
              name: `HB Tiếp sức đến trường - ${type.name}`,
              semester: semester,
              academic_year: year,
              amount_per_slot: type.amount,
              slots: type.slots,
              description: `Học bổng ${type.name} - Chương trình Tiếp sức đến trường ${semester} ${year}`,
              start_date: startDate,
              end_date: endDate,
              status: 'CLOSED'
            });
            totalScholarships++;

            // Tạo 3-8 applications cho mỗi học bổng
            const numApps = Math.floor(Math.random() * 6) + 3;
            const shuffled = [...allStudents].sort(() => 0.5 - Math.random());
            
            for (let i = 0; i < Math.min(numApps, shuffled.length); i++) {
              const student = shuffled[i];
              
              const existing = await Application.findOne({
                where: { scholarship_id: schol.id, student_id: student.id }
              });
              if (existing) continue;

              const submittedAt = new Date(startDate);
              submittedAt.setDate(submittedAt.getDate() + Math.floor(Math.random() * 30));
              
              const reviewedAt = new Date(submittedAt);
              reviewedAt.setDate(reviewedAt.getDate() + Math.floor(Math.random() * 14) + 7);

              await Application.create({
                scholarship_id: schol.id,
                student_id: student.id,
                snapshot_data: {
                  full_name: student.full_name || studentNames[i % studentNames.length],
                  student_code: student.student_code,
                  gpa: student.gpa || (Math.random() * 1.5 + 2.5).toFixed(2)
                },
                status: Math.random() > 0.15 ? 'APPROVED' : 'DISBURSED',
                submitted_at: submittedAt,
                reviewed_at: reviewedAt,
                reviewed_by: 1,
                review_note: 'Đủ điều kiện nhận học bổng'
              });
              totalApplications++;
            }
          }
          console.log(`  ✅ ${year} ${semester}: 5 loại học bổng`);
        }
      }
    }

    console.log(`\n📊 Tổng kết:`);
    console.log(`   - Học bổng mới: ${totalScholarships}`);
    console.log(`   - Applications mới: ${totalApplications}`);
    console.log('\n✅ Hoàn tất!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Lỗi:', error);
    process.exit(1);
  }
}

addMoreScholarships();
