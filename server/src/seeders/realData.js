const { sequelize } = require('../config/database');
const { User, School, Scholarship } = require('../models');
const { hashPassword } = require('../utils/helper');

const seedRealData = async () => {
  try {
    console.log('🌱 Bắt đầu seed dữ liệu thực tế...\n');

    // 1. Tạo các trường đại học thực tế ở Việt Nam
    console.log('📚 Tạo các trường đại học...');
    const schools = await School.bulkCreate([
      {
        code: 'VNU',
        name: 'Đại học Quốc gia Hà Nội',
        address: '144 Xuân Thủy, Cầu Giấy, Hà Nội',
        phone: '024-37547008',
        email: 'info@vnu.edu.vn',
        website: 'https://vnu.edu.vn',
        status: 'ACTIVE'
      },
      {
        code: 'HUST',
        name: 'Đại học Bách Khoa Hà Nội',
        address: 'Số 1 Đại Cồ Việt, Hai Bà Trưng, Hà Nội',
        phone: '024-38692008',
        email: 'dhbk@hust.edu.vn',
        website: 'https://hust.edu.vn',
        status: 'ACTIVE'
      },
      {
        code: 'VNU-HCM',
        name: 'Đại học Quốc gia TP.HCM',
        address: 'Phường Linh Trung, TP. Thủ Đức, TP.HCM',
        phone: '028-37244270',
        email: 'info@vnuhcm.edu.vn',
        website: 'https://vnuhcm.edu.vn',
        status: 'ACTIVE'
      },
      {
        code: 'CTU',
        name: 'Đại học Cần Thơ',
        address: 'Khu II, đường 3/2, P. Xuân Khánh, Q. Ninh Kiều, TP. Cần Thơ',
        phone: '0292-3832663',
        email: 'dhct@ctu.edu.vn',
        website: 'https://ctu.edu.vn',
        status: 'ACTIVE'
      },
      {
        code: 'HU',
        name: 'Đại học Huế',
        address: '03 Lê Lợi, TP. Huế',
        phone: '0234-3822041',
        email: 'dhh@hueuni.edu.vn',
        website: 'https://hueuni.edu.vn',
        status: 'ACTIVE'
      },
      {
        code: 'UD',
        name: 'Đại học Đà Nẵng',
        address: '41 Lê Duẩn, Hải Châu, Đà Nẵng',
        phone: '0236-3822041',
        email: 'dhdn@ud.edu.vn',
        website: 'https://ud.edu.vn',
        status: 'ACTIVE'
      },
      {
        code: 'NEU',
        name: 'Đại học Kinh tế Quốc dân',
        address: '207 Giải Phóng, Hai Bà Trưng, Hà Nội',
        phone: '024-36280280',
        email: 'dhktqd@neu.edu.vn',
        website: 'https://neu.edu.vn',
        status: 'ACTIVE'
      },
      {
        code: 'FTU',
        name: 'Đại học Ngoại thương',
        address: '91 Chùa Láng, Đống Đa, Hà Nội',
        phone: '024-37664242',
        email: 'dhnt@ftu.edu.vn',
        website: 'https://ftu.edu.vn',
        status: 'ACTIVE'
      },
      {
        code: 'HMU',
        name: 'Đại học Y Hà Nội',
        address: 'Số 1 Tôn Thất Tùng, Đống Đa, Hà Nội',
        phone: '024-38523798',
        email: 'dhyhn@hmu.edu.vn',
        website: 'https://hmu.edu.vn',
        status: 'ACTIVE'
      },
      {
        code: 'HNUE',
        name: 'Đại học Sư phạm Hà Nội',
        address: '136 Xuân Thủy, Cầu Giấy, Hà Nội',
        phone: '024-37547506',
        email: 'dhsphn@hnue.edu.vn',
        website: 'https://hnue.edu.vn',
        status: 'ACTIVE'
      },
      {
        code: 'UET',
        name: 'Đại học Công nghệ - ĐHQGHN',
        address: 'E3, 144 Xuân Thủy, Cầu Giấy, Hà Nội',
        phone: '024-37547461',
        email: 'uet@vnu.edu.vn',
        website: 'https://uet.vnu.edu.vn',
        status: 'ACTIVE'
      },
      {
        code: 'HUS',
        name: 'Đại học Khoa học Tự nhiên - ĐHQGHN',
        address: '334 Nguyễn Trãi, Thanh Xuân, Hà Nội',
        phone: '024-38584615',
        email: 'hus@vnu.edu.vn',
        website: 'https://hus.vnu.edu.vn',
        status: 'ACTIVE'
      },
      {
        code: 'USSH',
        name: 'Đại học Khoa học Xã hội và Nhân văn - ĐHQGHN',
        address: '336 Nguyễn Trãi, Thanh Xuân, Hà Nội',
        phone: '024-35532956',
        email: 'ussh@vnu.edu.vn',
        website: 'https://ussh.vnu.edu.vn',
        status: 'ACTIVE'
      },
      {
        code: 'HCMUAF',
        name: 'Đại học Nông Lâm TP.HCM',
        address: 'Khu phố 6, P. Linh Trung, TP. Thủ Đức, TP.HCM',
        phone: '028-37252002',
        email: 'dhnonglam@hcmuaf.edu.vn',
        website: 'https://hcmuaf.edu.vn',
        status: 'ACTIVE'
      },
      {
        code: 'TDTU',
        name: 'Đại học Tôn Đức Thắng',
        address: '19 Nguyễn Hữu Thọ, Quận 7, TP.HCM',
        phone: '028-37755037',
        email: 'tdt@tdtu.edu.vn',
        website: 'https://tdtu.edu.vn',
        status: 'ACTIVE'
      }
    ]);
    console.log(`✅ Đã tạo ${schools.length} trường đại học\n`);

    // 2. Tạo tài khoản admin
    console.log('👤 Tạo tài khoản quản trị...');
    
    const superAdmin = await User.create({
      school_id: null,
      username: 'superadmin',
      email: 'admin@system.com',
      password_hash: await hashPassword('123456'),
      role: 'SUPER_ADMIN',
      status: 'ACTIVE'
    });
    console.log('✅ SUPER_ADMIN: superadmin / 123456');

    // Tạo admin cho một số trường
    const admins = [];
    for (let i = 0; i < Math.min(5, schools.length); i++) {
      const admin = await User.create({
        school_id: schools[i].id,
        username: `admin_${schools[i].code.toLowerCase()}`,
        email: `admin@${schools[i].code.toLowerCase()}.edu.vn`,
        password_hash: await hashPassword('123456'),
        role: 'UNI_ADMIN',
        status: 'ACTIVE'
      });
      admins.push(admin);
      console.log(`✅ UNI_ADMIN: ${admin.username} / 123456`);
    }

    // 3. Tạo các học bổng thực tế
    console.log('\n🎓 Tạo các học bổng...');
    
    const currentYear = new Date().getFullYear();
    const scholarships = [];

    // Học bổng cho từng trường
    for (const school of schools) {
      // Học bổng khuyến khích học tập
      scholarships.push({
        school_id: school.id,
        name: `Học bổng Khuyến khích Học tập ${school.code} ${currentYear}`,
        description: `Học bổng dành cho sinh viên có thành tích học tập xuất sắc tại ${school.name}. Học bổng nhằm khuyến khích và động viên sinh viên phấn đấu trong học tập.`,
        semester: 'HK1',
        academic_year: currentYear.toString(),
        amount_per_slot: 5000000,
        slots: 50,
        start_date: new Date(currentYear, 0, 1),
        end_date: new Date(currentYear, 11, 31),
        status: 'OPEN',
        criteria_json: {
          min_gpa: 3.2,
          min_drr: 80,
          require_poor: false
        }
      });

      // Học bổng hỗ trợ sinh viên khó khăn
      scholarships.push({
        school_id: school.id,
        name: `Học bổng Hỗ trợ Sinh viên Khó khăn ${school.code} ${currentYear}`,
        description: `Học bổng dành cho sinh viên có hoàn cảnh khó khăn, vượt khó vươn lên trong học tập tại ${school.name}.`,
        semester: 'HK1',
        academic_year: currentYear.toString(),
        amount_per_slot: 3000000,
        slots: 100,
        start_date: new Date(currentYear, 0, 1),
        end_date: new Date(currentYear, 11, 31),
        status: 'OPEN',
        criteria_json: {
          min_gpa: 2.5,
          min_drr: 70,
          require_poor: true
        }
      });

      // Học bổng toàn phần
      scholarships.push({
        school_id: school.id,
        name: `Học bổng Toàn phần ${school.code} ${currentYear}`,
        description: `Học bổng toàn phần dành cho sinh viên xuất sắc nhất của ${school.name}. Bao gồm học phí và sinh hoạt phí.`,
        semester: 'HK1',
        academic_year: currentYear.toString(),
        amount_per_slot: 20000000,
        slots: 10,
        start_date: new Date(currentYear, 0, 1),
        end_date: new Date(currentYear, 5, 30),
        status: 'OPEN',
        criteria_json: {
          min_gpa: 3.6,
          min_drr: 90,
          require_poor: false
        }
      });
    }

    // Thêm một số học bổng đặc biệt
    scholarships.push(
      {
        school_id: schools[0].id,
        name: 'Học bổng Vingroup - Đào tạo Kỹ sư Công nghệ 2024',
        description: 'Học bổng toàn phần từ Tập đoàn Vingroup dành cho sinh viên ngành Công nghệ Thông tin, Điện tử, Cơ khí. Bao gồm học phí, sinh hoạt phí và cơ hội thực tập tại Vingroup.',
        semester: 'HK1',
        academic_year: currentYear.toString(),
        amount_per_slot: 50000000,
        slots: 20,
        start_date: new Date(currentYear, 0, 1),
        end_date: new Date(currentYear, 3, 30),
        status: 'OPEN',
        criteria_json: {
          min_gpa: 3.5,
          min_drr: 85,
          require_poor: false
        }
      },
      {
        school_id: schools[1].id,
        name: 'Học bổng Vallet - Hỗ trợ Sinh viên Vượt khó 2024',
        description: 'Học bổng từ Quỹ Vallet dành cho sinh viên có hoàn cảnh khó khăn nhưng có thành tích học tập tốt và tinh thần vượt khó.',
        semester: 'HK1',
        academic_year: currentYear.toString(),
        amount_per_slot: 15000000,
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
        school_id: schools[2].id,
        name: 'Học bổng Odon Vallet 2024',
        description: 'Học bổng danh giá từ Giáo sư Odon Vallet dành cho sinh viên nghèo vượt khó học giỏi. Đây là một trong những học bổng uy tín nhất Việt Nam.',
        semester: 'HK1',
        academic_year: currentYear.toString(),
        amount_per_slot: 10000000,
        slots: 30,
        start_date: new Date(currentYear, 0, 1),
        end_date: new Date(currentYear, 2, 31),
        status: 'OPEN',
        criteria_json: {
          min_gpa: 3.4,
          min_drr: 80,
          require_poor: true
        }
      },
      {
        school_id: schools[3].id,
        name: 'Học bổng Tiếp sức Đến trường 2024',
        description: 'Chương trình Tiếp sức Đến trường do Trung ương Đoàn TNCS Hồ Chí Minh tổ chức, hỗ trợ sinh viên có hoàn cảnh khó khăn.',
        semester: 'HK1',
        academic_year: currentYear.toString(),
        amount_per_slot: 5000000,
        slots: 100,
        start_date: new Date(currentYear, 6, 1),
        end_date: new Date(currentYear, 8, 30),
        status: 'OPEN',
        criteria_json: {
          min_gpa: 2.5,
          min_drr: 70,
          require_poor: true
        }
      },
      {
        school_id: schools[4].id,
        name: 'Học bổng Honda Y-E-S 2024',
        description: 'Học bổng từ Honda Việt Nam dành cho sinh viên ngành Kỹ thuật, Cơ khí. Bao gồm học bổng và cơ hội thực tập tại Honda.',
        semester: 'HK1',
        academic_year: currentYear.toString(),
        amount_per_slot: 12000000,
        slots: 25,
        start_date: new Date(currentYear, 0, 1),
        end_date: new Date(currentYear, 3, 30),
        status: 'OPEN',
        criteria_json: {
          min_gpa: 3.0,
          min_drr: 75,
          require_poor: false
        }
      }
    );

    await Scholarship.bulkCreate(scholarships);
    console.log(`✅ Đã tạo ${scholarships.length} học bổng\n`);

    console.log('🎉 Seed dữ liệu thực tế thành công!\n');
    console.log('📋 Thông tin đăng nhập:');
    console.log('┌─────────────────────────────────────────┐');
    console.log('│ SUPER_ADMIN:                            │');
    console.log('│   Username: superadmin                  │');
    console.log('│   Password: 123456                      │');
    console.log('├─────────────────────────────────────────┤');
    console.log('│ UNI_ADMIN (các trường):                 │');
    for (const admin of admins) {
      console.log(`│   Username: ${admin.username.padEnd(28)} │`);
    }
    console.log('│   Password: 123456                      │');
    console.log('└─────────────────────────────────────────┘\n');

    console.log(`📊 Tổng kết:`);
    console.log(`   - ${schools.length} trường đại học`);
    console.log(`   - ${admins.length + 1} tài khoản quản trị`);
    console.log(`   - ${scholarships.length} học bổng\n`);

  } catch (error) {
    console.error('❌ Lỗi khi seed dữ liệu:', error);
    throw error;
  }
};

// Chạy seed
if (require.main === module) {
  seedRealData()
    .then(() => {
      console.log('✅ Hoàn tất!');
      process.exit(0);
    })
    .catch((error) => {
      console.error('❌ Thất bại:', error);
      process.exit(1);
    });
}

module.exports = seedRealData;
