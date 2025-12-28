const { sequelize } = require('../config/database');
const { User, School, Scholarship, Faculty, Major } = require('../models');
const { hashPassword } = require('../utils/helper');

/**
 * Seed dữ liệu cho 3 trường đại học:
 * 1. Trường Đại học Bách Khoa - ĐHQG TP.HCM (HCMUT)
 * 2. Đại học Bách khoa Hà Nội (HUST)
 * 3. Trường Đại học Nông Lâm TP.HCM (HCMUAF)
 * 
 * Dữ liệu được tham khảo từ website chính thức của các trường
 */

const seedAdditionalSchools = async () => {
  try {
    console.log('🌱 Bắt đầu seed dữ liệu 3 trường đại học...\n');

    const currentYear = new Date().getFullYear();

    // ============================================
    // 1. TRƯỜNG ĐẠI HỌC BÁCH KHOA - ĐHQG TP.HCM
    // Website: https://hcmut.edu.vn
    // ============================================
    console.log('📚 Tạo Trường ĐH Bách Khoa - ĐHQG TP.HCM...');
    
    const hcmut = await School.create({
      code: 'HCMUT',
      name: 'Trường Đại học Bách Khoa - ĐHQG TP.HCM',
      address: '268 Lý Thường Kiệt, Phường 14, Quận 10, TP. Hồ Chí Minh',
      phone: '028-38647256',
      email: 'info@hcmut.edu.vn',
      website: 'https://hcmut.edu.vn',
      status: 'ACTIVE'
    });

    // Tạo admin cho HCMUT
    const adminHCMUT = await User.create({
      school_id: hcmut.id,
      username: 'admin_hcmut',
      email: 'admin@hcmut.edu.vn',
      password_hash: await hashPassword('123456'),
      role: 'UNI_ADMIN',
      status: 'ACTIVE'
    });

    // Học bổng HCMUT (Nguồn: https://hcmut.edu.vn/hoc-bong)
    const hcmutScholarships = [
      {
        school_id: hcmut.id,
        name: 'Học bổng Khuyến khích Học tập HCMUT',
        description: 'Học bổng dành cho sinh viên có kết quả học tập xuất sắc trong học kỳ. Mức học bổng từ 2-10 triệu đồng tùy theo thành tích. Nguồn: Quỹ học bổng của trường.',
        semester: 'HK1',
        academic_year: currentYear.toString(),
        amount_per_slot: 5000000,
        slots: 200,
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
        school_id: hcmut.id,
        name: 'Học bổng Hỗ trợ Sinh viên Khó khăn HCMUT',
        description: 'Học bổng hỗ trợ sinh viên có hoàn cảnh gia đình khó khăn, thuộc diện hộ nghèo, cận nghèo hoặc có hoàn cảnh đặc biệt. Ưu tiên sinh viên vùng sâu, vùng xa.',
        semester: 'HK1',
        academic_year: currentYear.toString(),
        amount_per_slot: 3000000,
        slots: 150,
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
        school_id: hcmut.id,
        name: 'Học bổng Lawrence S. Ting - HCMUT',
        description: 'Học bổng từ Quỹ Lawrence S. Ting dành cho sinh viên nghèo vượt khó học giỏi. Đây là học bổng thường niên có giá trị cao, hỗ trợ sinh viên trong suốt quá trình học tập.',
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
        school_id: hcmut.id,
        name: 'Học bổng Đồng hành HCMUT',
        description: 'Chương trình học bổng Đồng hành hỗ trợ sinh viên có hoàn cảnh khó khăn do thiên tai, dịch bệnh, tai nạn hoặc mất người thân. Mức hỗ trợ từ 2-5 triệu đồng.',
        semester: 'HK1',
        academic_year: currentYear.toString(),
        amount_per_slot: 4000000,
        slots: 50,
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
        school_id: hcmut.id,
        name: 'Học bổng Tài năng Kỹ thuật HCMUT',
        description: 'Học bổng toàn phần dành cho sinh viên xuất sắc nhất các ngành Kỹ thuật. Bao gồm miễn 100% học phí và hỗ trợ sinh hoạt phí hàng tháng.',
        semester: 'HK1',
        academic_year: currentYear.toString(),
        amount_per_slot: 25000000,
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

    console.log('✅ Đã tạo HCMUT và admin\n');

    // ============================================
    // 2. ĐẠI HỌC BÁCH KHOA HÀ NỘI
    // Website: https://hust.edu.vn
    // ============================================
    console.log('📚 Tạo Đại học Bách khoa Hà Nội...');

    // Kiểm tra xem HUST đã tồn tại chưa
    let hust = await School.findOne({ where: { code: 'HUST' } });
    
    if (!hust) {
      hust = await School.create({
        code: 'HUST',
        name: 'Đại học Bách khoa Hà Nội',
        address: 'Số 1 Đại Cồ Việt, Phường Bách Khoa, Quận Hai Bà Trưng, Hà Nội',
        phone: '024-38692008',
        email: 'dhbk@hust.edu.vn',
        website: 'https://hust.edu.vn',
        status: 'ACTIVE'
      });
    }

    // Kiểm tra admin HUST
    let adminHUST = await User.findOne({ where: { username: 'admin_hust' } });
    if (!adminHUST) {
      adminHUST = await User.create({
        school_id: hust.id,
        username: 'admin_hust',
        email: 'admin@hust.edu.vn',
        password_hash: await hashPassword('123456'),
        role: 'UNI_ADMIN',
        status: 'ACTIVE'
      });
    }

    // Học bổng HUST (Nguồn: https://hust.edu.vn/vi/sinh-vien/hoc-bong)
    const hustScholarships = [
      {
        school_id: hust.id,
        name: 'Học bổng Khuyến khích Học tập HUST',
        description: 'Học bổng dành cho sinh viên có điểm trung bình học kỳ từ loại Giỏi trở lên. Mức học bổng: Loại Xuất sắc 100% học phí, Loại Giỏi 50% học phí.',
        semester: 'HK1',
        academic_year: currentYear.toString(),
        amount_per_slot: 8000000,
        slots: 300,
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
        school_id: hust.id,
        name: 'Học bổng Hỗ trợ Sinh viên Khó khăn HUST',
        description: 'Học bổng từ Quỹ Hỗ trợ Sinh viên HUST dành cho sinh viên có hoàn cảnh gia đình khó khăn, thuộc diện chính sách, hộ nghèo, cận nghèo.',
        semester: 'HK1',
        academic_year: currentYear.toString(),
        amount_per_slot: 4000000,
        slots: 200,
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
        school_id: hust.id,
        name: 'Học bổng Vallet - HUST',
        description: 'Học bổng từ Quỹ Vallet (Pháp) dành cho sinh viên nghèo vượt khó học giỏi. Đây là học bổng uy tín được trao hàng năm cho sinh viên xuất sắc.',
        semester: 'HK1',
        academic_year: currentYear.toString(),
        amount_per_slot: 12000000,
        slots: 40,
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
        school_id: hust.id,
        name: 'Học bổng Samsung Talent - HUST',
        description: 'Học bổng từ Samsung Việt Nam dành cho sinh viên ngành Điện tử, CNTT, Cơ khí. Bao gồm học bổng và cơ hội thực tập tại Samsung.',
        semester: 'HK1',
        academic_year: currentYear.toString(),
        amount_per_slot: 20000000,
        slots: 25,
        start_date: new Date(currentYear, 0, 1),
        end_date: new Date(currentYear, 3, 30),
        status: 'OPEN',
        criteria_json: {
          min_gpa: 3.3,
          min_drr: 80,
          require_poor: false
        }
      },
      {
        school_id: hust.id,
        name: 'Học bổng Tiếp sức Tài năng HUST',
        description: 'Học bổng toàn phần dành cho thủ khoa, á khoa các kỳ thi tuyển sinh và sinh viên đạt giải Olympic quốc gia, quốc tế.',
        semester: 'HK1',
        academic_year: currentYear.toString(),
        amount_per_slot: 30000000,
        slots: 15,
        start_date: new Date(currentYear, 0, 1),
        end_date: new Date(currentYear, 2, 31),
        status: 'OPEN',
        criteria_json: {
          min_gpa: 3.7,
          min_drr: 90,
          require_poor: false
        }
      }
    ];

    console.log('✅ Đã tạo/cập nhật HUST và admin\n');

    // ============================================
    // 3. TRƯỜNG ĐẠI HỌC NÔNG LÂM TP.HCM
    // Website: https://hcmuaf.edu.vn
    // ============================================
    console.log('📚 Tạo Trường ĐH Nông Lâm TP.HCM...');

    // Kiểm tra xem HCMUAF đã tồn tại chưa
    let hcmuaf = await School.findOne({ where: { code: 'HCMUAF' } });
    
    if (!hcmuaf) {
      hcmuaf = await School.create({
        code: 'HCMUAF',
        name: 'Trường Đại học Nông Lâm TP. Hồ Chí Minh',
        address: 'Khu phố 6, Phường Linh Trung, TP. Thủ Đức, TP. Hồ Chí Minh',
        phone: '028-37245397',
        email: 'dhnonglam@hcmuaf.edu.vn',
        website: 'https://hcmuaf.edu.vn',
        status: 'ACTIVE'
      });
    }

    // Kiểm tra admin HCMUAF
    let adminHCMUAF = await User.findOne({ where: { username: 'admin_hcmuaf' } });
    if (!adminHCMUAF) {
      adminHCMUAF = await User.create({
        school_id: hcmuaf.id,
        username: 'admin_hcmuaf',
        email: 'admin@hcmuaf.edu.vn',
        password_hash: await hashPassword('123456'),
        role: 'UNI_ADMIN',
        status: 'ACTIVE'
      });
    }

    // Học bổng HCMUAF (Nguồn: https://hcmuaf.edu.vn/hoc-bong)
    const hcmuafScholarships = [
      {
        school_id: hcmuaf.id,
        name: 'Học bổng Khuyến khích Học tập NLU',
        description: 'Học bổng dành cho sinh viên có kết quả học tập tốt trong học kỳ. Mức học bổng từ 1-5 triệu đồng tùy theo xếp loại học lực.',
        semester: 'HK1',
        academic_year: currentYear.toString(),
        amount_per_slot: 3000000,
        slots: 250,
        start_date: new Date(currentYear, 0, 1),
        end_date: new Date(currentYear, 11, 31),
        status: 'OPEN',
        criteria_json: {
          min_gpa: 3.0,
          min_drr: 75,
          require_poor: false
        }
      },
      {
        school_id: hcmuaf.id,
        name: 'Học bổng Hỗ trợ Sinh viên Khó khăn NLU',
        description: 'Học bổng hỗ trợ sinh viên có hoàn cảnh gia đình khó khăn, con em nông dân, vùng sâu vùng xa. Ưu tiên sinh viên ngành Nông nghiệp, Lâm nghiệp.',
        semester: 'HK1',
        academic_year: currentYear.toString(),
        amount_per_slot: 2500000,
        slots: 200,
        start_date: new Date(currentYear, 0, 1),
        end_date: new Date(currentYear, 11, 31),
        status: 'OPEN',
        criteria_json: {
          min_gpa: 2.3,
          min_drr: 65,
          require_poor: true
        }
      },
      {
        school_id: hcmuaf.id,
        name: 'Học bổng Tiếp sức Đến trường - NLU',
        description: 'Chương trình Tiếp sức Đến trường hỗ trợ tân sinh viên có hoàn cảnh khó khăn. Mỗi suất học bổng trị giá 5 triệu đồng.',
        semester: 'HK1',
        academic_year: currentYear.toString(),
        amount_per_slot: 5000000,
        slots: 100,
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
        school_id: hcmuaf.id,
        name: 'Học bổng Nông nghiệp Xanh NLU',
        description: 'Học bổng dành cho sinh viên ngành Nông nghiệp, Công nghệ Sinh học, Môi trường có đề tài nghiên cứu về nông nghiệp bền vững.',
        semester: 'HK1',
        academic_year: currentYear.toString(),
        amount_per_slot: 8000000,
        slots: 30,
        start_date: new Date(currentYear, 0, 1),
        end_date: new Date(currentYear, 5, 30),
        status: 'OPEN',
        criteria_json: {
          min_gpa: 3.2,
          min_drr: 80,
          require_poor: false
        }
      },
      {
        school_id: hcmuaf.id,
        name: 'Học bổng Thú y Việt Nam - NLU',
        description: 'Học bổng từ Hội Thú y Việt Nam dành cho sinh viên ngành Thú y có thành tích học tập xuất sắc và tham gia hoạt động cộng đồng.',
        semester: 'HK1',
        academic_year: currentYear.toString(),
        amount_per_slot: 6000000,
        slots: 20,
        start_date: new Date(currentYear, 0, 1),
        end_date: new Date(currentYear, 4, 31),
        status: 'OPEN',
        criteria_json: {
          min_gpa: 3.0,
          min_drr: 75,
          require_poor: false
        }
      }
    ];

    console.log('✅ Đã tạo/cập nhật HCMUAF và admin\n');

    // ============================================
    // TẠO HỌC BỔNG
    // ============================================
    console.log('🎓 Tạo các học bổng...');

    const allScholarships = [
      ...hcmutScholarships,
      ...hustScholarships,
      ...hcmuafScholarships
    ];

    await Scholarship.bulkCreate(allScholarships);
    console.log(`✅ Đã tạo ${allScholarships.length} học bổng\n`);

    // ============================================
    // TỔNG KẾT
    // ============================================
    console.log('🎉 Seed dữ liệu thành công!\n');
    console.log('📋 Thông tin đăng nhập:');
    console.log('┌──────────────────────────────────────────────┐');
    console.log('│ UNI_ADMIN (ĐH Bách Khoa TP.HCM):             │');
    console.log('│   Username: admin_hcmut                      │');
    console.log('│   Password: 123456                           │');
    console.log('├──────────────────────────────────────────────┤');
    console.log('│ UNI_ADMIN (ĐH Bách khoa Hà Nội):             │');
    console.log('│   Username: admin_hust                       │');
    console.log('│   Password: 123456                           │');
    console.log('├──────────────────────────────────────────────┤');
    console.log('│ UNI_ADMIN (ĐH Nông Lâm TP.HCM):              │');
    console.log('│   Username: admin_hcmuaf                     │');
    console.log('│   Password: 123456                           │');
    console.log('└──────────────────────────────────────────────┘\n');

    console.log('📊 Tổng kết:');
    console.log('   - 3 trường đại học');
    console.log('   - 3 tài khoản UNI_ADMIN');
    console.log(`   - ${allScholarships.length} học bổng (mỗi trường 5 học bổng)\n`);

    console.log('📝 Danh sách học bổng:');
    console.log('\n🏫 ĐH Bách Khoa TP.HCM (HCMUT):');
    hcmutScholarships.forEach((s, i) => console.log(`   ${i+1}. ${s.name}`));
    
    console.log('\n🏫 ĐH Bách khoa Hà Nội (HUST):');
    hustScholarships.forEach((s, i) => console.log(`   ${i+1}. ${s.name}`));
    
    console.log('\n🏫 ĐH Nông Lâm TP.HCM (HCMUAF):');
    hcmuafScholarships.forEach((s, i) => console.log(`   ${i+1}. ${s.name}`));

  } catch (error) {
    console.error('❌ Lỗi khi seed dữ liệu:', error);
    throw error;
  }
};

// Chạy seed
if (require.main === module) {
  seedAdditionalSchools()
    .then(() => {
      console.log('\n✅ Hoàn tất!');
      process.exit(0);
    })
    .catch((error) => {
      console.error('❌ Thất bại:', error);
      process.exit(1);
    });
}

module.exports = seedAdditionalSchools;
