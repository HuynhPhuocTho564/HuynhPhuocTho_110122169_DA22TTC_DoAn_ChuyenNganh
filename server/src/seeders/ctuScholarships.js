const { sequelize } = require('../config/database');
const { School, Scholarship } = require('../models');

/**
 * Seed học bổng cho Đại học Cần Thơ (CTU)
 * Nguồn: https://ctu.edu.vn - Website chính thức của trường
 * 
 * Các học bổng dành cho sinh viên khó khăn tại ĐH Cần Thơ
 */

const seedCTUScholarships = async () => {
  try {
    console.log('🌱 Bắt đầu seed học bổng cho Đại học Cần Thơ...\n');

    const currentYear = new Date().getFullYear();

    // Tìm trường CTU
    let ctu = await School.findOne({ where: { code: 'CTU' } });
    
    if (!ctu) {
      console.log('📚 Tạo Đại học Cần Thơ...');
      ctu = await School.create({
        code: 'CTU',
        name: 'Trường Đại học Cần Thơ',
        address: 'Khu II, đường 3/2, Phường Xuân Khánh, Quận Ninh Kiều, TP. Cần Thơ',
        phone: '0292-3832663',
        email: 'dhct@ctu.edu.vn',
        website: 'https://ctu.edu.vn',
        status: 'ACTIVE'
      });
      console.log('✅ Đã tạo Đại học Cần Thơ\n');
    } else {
      console.log('✅ Đã tìm thấy Đại học Cần Thơ (ID: ' + ctu.id + ')\n');
    }

    // Học bổng CTU (Nguồn: https://ctu.edu.vn/hoc-bong.html)
    const ctuScholarships = [
      {
        school_id: ctu.id,
        name: 'Học bổng Khuyến khích Học tập CTU',
        description: 'Học bổng dành cho sinh viên có kết quả học tập xuất sắc trong học kỳ. Mức học bổng: Loại Xuất sắc 100% học phí, Loại Giỏi 70% học phí, Loại Khá 50% học phí. Xét theo từng học kỳ.',
        semester: 'HK1',
        academic_year: currentYear.toString(),
        amount_per_slot: 5000000,
        slots: 500,
        start_date: new Date(currentYear, 0, 1),
        end_date: new Date(currentYear, 11, 31),
        status: 'OPEN',
        criteria_json: {
          min_gpa: 3.2,
          min_drr: 80,
          require_poor: false
        }
      },
      {
        school_id: ctu.id,
        name: 'Học bổng Hỗ trợ Sinh viên Khó khăn CTU',
        description: 'Học bổng từ Quỹ Hỗ trợ Sinh viên của trường dành cho sinh viên có hoàn cảnh gia đình khó khăn, thuộc diện hộ nghèo, cận nghèo, vùng sâu vùng xa ĐBSCL. Ưu tiên sinh viên dân tộc thiểu số.',
        semester: 'HK1',
        academic_year: currentYear.toString(),
        amount_per_slot: 3000000,
        slots: 300,
        start_date: new Date(currentYear, 0, 1),
        end_date: new Date(currentYear, 11, 31),
        status: 'OPEN',
        criteria_json: {
          min_gpa: 2.5,
          min_drr: 70,
          require_poor: true
        }
      },
      {
        school_id: ctu.id,
        name: 'Học bổng Tiếp sức Đến trường - CTU',
        description: 'Chương trình Tiếp sức Đến trường do Báo Tuổi Trẻ và Trung ương Đoàn phối hợp tổ chức. Hỗ trợ tân sinh viên có hoàn cảnh khó khăn vùng ĐBSCL nhập học. Mỗi suất 5-10 triệu đồng.',
        semester: 'HK1',
        academic_year: currentYear.toString(),
        amount_per_slot: 7000000,
        slots: 150,
        start_date: new Date(currentYear, 6, 1),
        end_date: new Date(currentYear, 9, 30),
        status: 'OPEN',
        criteria_json: {
          min_gpa: 2.0,
          min_drr: 60,
          require_poor: true
        }
      },
      {
        school_id: ctu.id,
        name: 'Học bổng Vallet - CTU',
        description: 'Học bổng từ Quỹ Vallet (Pháp) do Giáo sư Odon Vallet tài trợ. Dành cho sinh viên nghèo vượt khó học giỏi. Đây là học bổng uy tín được trao hàng năm tại ĐH Cần Thơ từ năm 2001.',
        semester: 'HK1',
        academic_year: currentYear.toString(),
        amount_per_slot: 10000000,
        slots: 50,
        start_date: new Date(currentYear, 0, 1),
        end_date: new Date(currentYear, 4, 31),
        status: 'OPEN',
        criteria_json: {
          min_gpa: 3.0,
          min_drr: 75,
          require_poor: true
        }
      },
      {
        school_id: ctu.id,
        name: 'Học bổng Lawrence S. Ting - CTU',
        description: 'Học bổng từ Quỹ Lawrence S. Ting dành cho sinh viên nghèo vượt khó học giỏi vùng ĐBSCL. Học bổng có giá trị cao, hỗ trợ sinh viên trong suốt quá trình học tập.',
        semester: 'HK1',
        academic_year: currentYear.toString(),
        amount_per_slot: 15000000,
        slots: 30,
        start_date: new Date(currentYear, 0, 1),
        end_date: new Date(currentYear, 5, 30),
        status: 'OPEN',
        criteria_json: {
          min_gpa: 3.0,
          min_drr: 75,
          require_poor: true
        }
      },
      {
        school_id: ctu.id,
        name: 'Học bổng Đồng hành Sinh viên Vượt khó CTU',
        description: 'Chương trình Đồng hành hỗ trợ sinh viên gặp khó khăn đột xuất do thiên tai, lũ lụt (đặc thù vùng ĐBSCL), dịch bệnh, tai nạn hoặc mất người thân.',
        semester: 'HK1',
        academic_year: currentYear.toString(),
        amount_per_slot: 4000000,
        slots: 100,
        start_date: new Date(currentYear, 0, 1),
        end_date: new Date(currentYear, 11, 31),
        status: 'OPEN',
        criteria_json: {
          min_gpa: 2.0,
          min_drr: 65,
          require_poor: true
        }
      },
      {
        school_id: ctu.id,
        name: 'Học bổng Nông nghiệp ĐBSCL - CTU',
        description: 'Học bổng dành cho sinh viên ngành Nông nghiệp, Thủy sản, Môi trường - các ngành trọng điểm phục vụ phát triển vùng ĐBSCL. Ưu tiên sinh viên con em nông dân.',
        semester: 'HK1',
        academic_year: currentYear.toString(),
        amount_per_slot: 6000000,
        slots: 80,
        start_date: new Date(currentYear, 0, 1),
        end_date: new Date(currentYear, 5, 30),
        status: 'OPEN',
        criteria_json: {
          min_gpa: 2.8,
          min_drr: 75,
          require_poor: false
        }
      },
      {
        school_id: ctu.id,
        name: 'Học bổng Tài năng Trẻ CTU',
        description: 'Học bổng toàn phần dành cho sinh viên xuất sắc nhất, thủ khoa các ngành, sinh viên đạt giải Olympic quốc gia. Bao gồm miễn 100% học phí và hỗ trợ sinh hoạt phí.',
        semester: 'HK1',
        academic_year: currentYear.toString(),
        amount_per_slot: 20000000,
        slots: 20,
        start_date: new Date(currentYear, 0, 1),
        end_date: new Date(currentYear, 3, 30),
        status: 'OPEN',
        criteria_json: {
          min_gpa: 3.6,
          min_drr: 90,
          require_poor: false
        }
      }
    ];

    console.log('🎓 Tạo các học bổng cho CTU...');
    await Scholarship.bulkCreate(ctuScholarships);
    console.log(`✅ Đã tạo ${ctuScholarships.length} học bổng\n`);

    // Tổng kết
    console.log('🎉 Seed học bổng CTU thành công!\n');
    console.log('📝 Danh sách học bổng Đại học Cần Thơ:');
    console.log('┌──────────────────────────────────────────────────────────────┐');
    ctuScholarships.forEach((s, i) => {
      const amount = (s.amount_per_slot / 1000000).toFixed(0);
      console.log(`│ ${i+1}. ${s.name.padEnd(45)} │`);
      console.log(`│    💰 ${amount} triệu/suất | 🎯 ${s.slots} suất ${s.criteria_json.require_poor ? '| 📋 Yêu cầu hộ nghèo' : ''}`.padEnd(63) + '│');
    });
    console.log('└──────────────────────────────────────────────────────────────┘\n');

    console.log('📊 Tổng kết:');
    console.log(`   - Trường: Đại học Cần Thơ (CTU)`);
    console.log(`   - Số học bổng: ${ctuScholarships.length}`);
    console.log(`   - Tổng số suất: ${ctuScholarships.reduce((sum, s) => sum + s.slots, 0)}`);
    
    const totalAmount = ctuScholarships.reduce((sum, s) => sum + (s.amount_per_slot * s.slots), 0);
    console.log(`   - Tổng giá trị: ${(totalAmount / 1000000000).toFixed(1)} tỷ VNĐ\n`);

  } catch (error) {
    console.error('❌ Lỗi khi seed dữ liệu:', error);
    throw error;
  }
};

// Chạy seed
if (require.main === module) {
  seedCTUScholarships()
    .then(() => {
      console.log('✅ Hoàn tất!');
      process.exit(0);
    })
    .catch((error) => {
      console.error('❌ Thất bại:', error);
      process.exit(1);
    });
}

module.exports = seedCTUScholarships;
