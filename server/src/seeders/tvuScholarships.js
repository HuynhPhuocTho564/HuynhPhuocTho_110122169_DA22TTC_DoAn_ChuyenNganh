const { sequelize } = require('../config/database');
const { School, Scholarship, Sponsor, User, Fund } = require('../models');
const { hashPassword } = require('../utils/helper');

/**
 * Seed 7 học bổng dành cho sinh viên khó khăn của Đại học Trà Vinh
 * Dựa trên dữ liệu thực tế từ năm 2019-2024
 */
const seedTVUScholarships = async () => {
  try {
    console.log('🌱 Bắt đầu seed học bổng Đại học Trà Vinh...\n');

    // 1. Tìm hoặc tạo trường Đại học Trà Vinh
    let tvuSchool = await School.findOne({ where: { code: 'TVU' } });
    
    if (!tvuSchool) {
      tvuSchool = await School.create({
        code: 'TVU',
        name: 'Đại học Trà Vinh',
        logo_url: 'https://tvu.edu.vn/images/logo-tvu.png',
        phone: '0294-3855247',
        address: 'Số 126, đường Nguyễn Thiện Thành, phường Hòa Thuận, TP. Trà Vinh, tỉnh Trà Vinh',
        status: 'ACTIVE'
      });
      console.log('✅ Đã tạo trường Đại học Trà Vinh');
    } else {
      console.log('ℹ️ Trường Đại học Trà Vinh đã tồn tại');
    }

    // 2. Tạo tài khoản admin cho TVU nếu chưa có
    let tvuAdmin = await User.findOne({ where: { username: 'admin_tvu' } });
    if (!tvuAdmin) {
      tvuAdmin = await User.create({
        school_id: tvuSchool.id,
        username: 'admin_tvu',
        email: 'admin@tvu.edu.vn',
        password_hash: await hashPassword('123456'),
        role: 'UNI_ADMIN',
        status: 'ACTIVE'
      });
      console.log('✅ Đã tạo tài khoản admin_tvu / 123456');
    }

    // 3. Tạo các nhà tài trợ
    console.log('\n👥 Tạo các nhà tài trợ...');
    const sponsors = [];

    const sponsorData = [
      {
        username: 'sponsor_nguyenthienthanh',
        email: 'hocbong.nguyenthienthanh@tvu.edu.vn',
        company_name: 'Quỹ học bổng Ông Bà GS Nguyễn Thiện Thành',
        contact_person: 'Ban quản lý Quỹ GS Nguyễn Thiện Thành',
        website: 'https://tvu.edu.vn'
      },
      {
        username: 'sponsor_quytuthien',
        email: 'quytuthientritue@gmail.com',
        company_name: 'Quỹ từ thiện Trí Tuệ',
        contact_person: 'Ông Lâm Hoàng Lộc',
        website: null
      },
      {
        username: 'sponsor_nguyendong',
        email: 'nguyendong.scholarship@gmail.com',
        company_name: 'Quỹ học bổng TS Nguyễn Đồng',
        contact_person: 'TS Nguyễn Đồng & ThS Đặng Thị Cúc Phương',
        website: null
      },
      {
        username: 'sponsor_vongtaythaibinh',
        email: 'vongtaythaibinh@gmail.com',
        company_name: 'Quỹ Vòng Tay Thái Bình',
        contact_person: 'Cô Trần Khánh Tuyết',
        website: null
      },
      {
        username: 'sponsor_cheneliere',
        email: 'fondation@cheneliere.ca',
        company_name: 'Fondation de la Chenelière (HB Võ Văn Trương)',
        contact_person: 'Fondation de la Chenelière',
        website: 'https://cheneliere.ca'
      },
      {
        username: 'sponsor_weav',
        email: 'weav.vietnam@gmail.com',
        company_name: 'Tổ chức WEAV - Vì Quyền và Tiếng nói Phụ nữ',
        contact_person: 'WEAV Vietnam',
        website: 'https://weav.org'
      },
      {
        username: 'sponsor_tzuchi',
        email: 'tzuchi.vietnam@tzuchi.org',
        company_name: 'Hội Từ thiện Phật giáo Tzu-Chi Đài Loan',
        contact_person: 'Buddhist Compassion Relief Tzu Chi Foundation',
        website: 'https://tzuchi.org.vn'
      }
    ];

    for (const data of sponsorData) {
      let user = await User.findOne({ where: { username: data.username } });
      if (!user) {
        user = await User.create({
          school_id: null,
          username: data.username,
          email: data.email,
          password_hash: await hashPassword('123456'),
          role: 'SPONSOR',
          status: 'ACTIVE'
        });

        await Sponsor.create({
          user_id: user.id,
          company_name: data.company_name,
          contact_person: data.contact_person,
          website: data.website
        });

        sponsors.push({ user, ...data });
        console.log(`✅ Đã tạo nhà tài trợ: ${data.company_name}`);
      }
    }

    // 4. Tạo 7 học bổng cho sinh viên khó khăn
    console.log('\n🎓 Tạo 7 học bổng cho sinh viên khó khăn...');

    const currentYear = new Date().getFullYear();
    const academicYear = `${currentYear}-${currentYear + 1}`; // Năm học 2025-2026
    
    // Thời gian thực tế cho HK1: Tháng 9 - Tháng 1 năm sau
    const hk1StartDate = new Date(currentYear, 8, 1);  // 01/09/2025
    const hk1EndDate = new Date(currentYear + 1, 0, 31);  // 31/01/2026
    
    const scholarshipsData = [
      {
        name: `Học bổng Ông Bà GS Nguyễn Thiện Thành ${currentYear}`,
        description: `Học bổng mang tên Giáo sư Nguyễn Thiện Thành - người sáng lập Đại học Trà Vinh. Học bổng dành cho sinh viên có hoàn cảnh khó khăn, vượt khó học tập tại Đại học Trà Vinh. Đây là học bổng có số suất lớn nhất và được duy trì liên tục từ năm 2019 đến nay.

Điều kiện:
- Sinh viên đang học tại Đại học Trà Vinh
- Có hoàn cảnh gia đình khó khăn (hộ nghèo, cận nghèo, mồ côi)
- Điểm trung bình tích lũy từ 2.5 trở lên
- Điểm rèn luyện từ 70 trở lên`,
        amount_per_slot: 5000000,
        slots: 35,
        criteria_json: {
          min_gpa: 2.5,
          min_drr: 70,
          require_poor: true,
          poor_types: ['POOR', 'NEAR_POOR', 'ORPHAN_BOTH', 'ORPHAN_ONE']
        }
      },
      {
        name: `Học bổng Quỹ Từ thiện Trí Tuệ ${currentYear}`,
        description: `Học bổng từ Quỹ Từ thiện Trí Tuệ do Giám đốc Ông Lâm Hoàng Lộc tài trợ. Đây là học bổng có số suất lớn, dành cho sinh viên có hoàn cảnh khó khăn nhưng có ý chí vươn lên trong học tập.

Điều kiện:
- Sinh viên có hoàn cảnh gia đình khó khăn
- Có tinh thần vượt khó, ý chí phấn đấu
- Điểm trung bình tích lũy từ 2.0 trở lên
- Không vi phạm kỷ luật`,
        amount_per_slot: 3000000,
        slots: 100,
        criteria_json: {
          min_gpa: 2.0,
          min_drr: 65,
          require_poor: true,
          poor_types: ['POOR', 'NEAR_POOR', 'DISABILITY', 'ORPHAN_BOTH', 'ORPHAN_ONE']
        }
      },
      {
        name: `Học bổng TS Nguyễn Đồng và ThS Đặng Thị Cúc Phương ${currentYear}`,
        description: `Học bổng do Tiến sĩ Nguyễn Đồng và Thạc sĩ Đặng Thị Cúc Phương tài trợ hàng năm cho sinh viên Đại học Trà Vinh. Học bổng dành cho sinh viên có hoàn cảnh khó khăn, có thành tích học tập tốt.

Điều kiện:
- Sinh viên có hoàn cảnh gia đình khó khăn
- Điểm trung bình tích lũy từ 2.8 trở lên
- Điểm rèn luyện từ 75 trở lên
- Tích cực tham gia hoạt động xã hội`,
        amount_per_slot: 4000000,
        slots: 5,
        criteria_json: {
          min_gpa: 2.8,
          min_drr: 75,
          require_poor: true,
          poor_types: ['POOR', 'NEAR_POOR']
        }
      },
      {
        name: `Học bổng Vòng Tay Thái Bình ${currentYear}`,
        description: `Học bổng Vòng Tay Thái Bình do cô Trần Khánh Tuyết tài trợ. Học bổng mang ý nghĩa nhân văn sâu sắc, hỗ trợ sinh viên có hoàn cảnh đặc biệt khó khăn, giúp các em có điều kiện tiếp tục con đường học vấn.

Điều kiện:
- Sinh viên có hoàn cảnh đặc biệt khó khăn
- Mồ côi cha/mẹ hoặc cả hai
- Gia đình thuộc hộ nghèo, cận nghèo
- Điểm trung bình tích lũy từ 2.5 trở lên`,
        amount_per_slot: 5000000,
        slots: 33,
        criteria_json: {
          min_gpa: 2.5,
          min_drr: 70,
          require_poor: true,
          poor_types: ['POOR', 'NEAR_POOR', 'ORPHAN_BOTH', 'ORPHAN_ONE']
        }
      },
      {
        name: `Học bổng Fondation de la Chenelière (Võ Văn Trương) ${currentYear}`,
        description: `Học bổng từ Quỹ Fondation de la Chenelière (Canada), còn gọi là Học bổng Võ Văn Trương. Đây là học bổng quốc tế uy tín, dành cho sinh viên nghèo vượt khó học giỏi tại các trường đại học Việt Nam.

Điều kiện:
- Sinh viên có hoàn cảnh gia đình khó khăn
- Điểm trung bình tích lũy từ 3.0 trở lên
- Điểm rèn luyện từ 80 trở lên
- Có tinh thần vượt khó, nghị lực trong học tập`,
        amount_per_slot: 10000000,
        slots: 30,
        criteria_json: {
          min_gpa: 3.0,
          min_drr: 80,
          require_poor: true,
          poor_types: ['POOR', 'NEAR_POOR']
        }
      },
      {
        name: `Học bổng WEAV - Vì Quyền và Tiếng nói Phụ nữ ${currentYear}`,
        description: `Học bổng từ tổ chức WEAV (Women's Empowerment and Voice) dành riêng cho sinh viên nữ có hoàn cảnh khó khăn. Học bổng nhằm hỗ trợ và trao quyền cho phụ nữ trong giáo dục.

Điều kiện:
- Sinh viên NỮ có hoàn cảnh gia đình khó khăn
- Điểm trung bình tích lũy từ 2.5 trở lên
- Điểm rèn luyện từ 70 trở lên
- Tích cực tham gia hoạt động vì cộng đồng`,
        amount_per_slot: 5000000,
        slots: 20,
        criteria_json: {
          min_gpa: 2.5,
          min_drr: 70,
          require_poor: true,
          require_female: true,
          poor_types: ['POOR', 'NEAR_POOR', 'DISABILITY']
        }
      },
      {
        name: `Học bổng Hội Từ thiện Phật giáo Tzu-Chi ${currentYear}`,
        description: `Học bổng từ Hội Từ thiện Phật giáo Tzu-Chi (Buddhist Compassion Relief Tzu Chi Foundation) - Đài Loan. Đây là tổ chức từ thiện Phật giáo lớn nhất thế giới, hỗ trợ sinh viên khó khăn tại nhiều quốc gia.

Điều kiện:
- Sinh viên có hoàn cảnh gia đình khó khăn
- Điểm trung bình tích lũy từ 2.5 trở lên
- Có đạo đức tốt, tinh thần vượt khó
- Cam kết tham gia hoạt động thiện nguyện`,
        amount_per_slot: 6000000,
        slots: 11,
        criteria_json: {
          min_gpa: 2.5,
          min_drr: 75,
          require_poor: true,
          poor_types: ['POOR', 'NEAR_POOR', 'DISABILITY', 'ORPHAN_BOTH', 'ORPHAN_ONE']
        }
      }
    ];

    for (const data of scholarshipsData) {
      const existing = await Scholarship.findOne({
        where: {
          school_id: tvuSchool.id,
          name: data.name
        }
      });

      if (!existing) {
        await Scholarship.create({
          school_id: tvuSchool.id,
          fund_id: null,
          name: data.name,
          description: data.description,
          semester: 'HK1',
          academic_year: academicYear,
          amount_per_slot: data.amount_per_slot,
          slots: data.slots,
          start_date: hk1StartDate,
          end_date: hk1EndDate,
          status: 'OPEN',
          criteria_json: data.criteria_json,
          created_by: tvuAdmin.id
        });
        console.log(`✅ Đã tạo: ${data.name}`);
      } else {
        console.log(`ℹ️ Đã tồn tại: ${data.name}`);
      }
    }

    console.log('\n🎉 Seed học bổng Đại học Trà Vinh thành công!');
    console.log('\n📋 Thông tin đăng nhập:');
    console.log('┌─────────────────────────────────────────────┐');
    console.log('│ UNI_ADMIN (Đại học Trà Vinh):               │');
    console.log('│   Username: admin_tvu                       │');
    console.log('│   Password: 123456                          │');
    console.log('├─────────────────────────────────────────────┤');
    console.log('│ SPONSOR (Nhà tài trợ):                      │');
    console.log('│   Username: sponsor_nguyenthienthanh        │');
    console.log('│   Username: sponsor_quytuthien              │');
    console.log('│   Username: sponsor_nguyendong              │');
    console.log('│   Username: sponsor_vongtaythaibinh         │');
    console.log('│   Username: sponsor_cheneliere              │');
    console.log('│   Username: sponsor_weav                    │');
    console.log('│   Username: sponsor_tzuchi                  │');
    console.log('│   Password: 123456 (tất cả)                 │');
    console.log('└─────────────────────────────────────────────┘');

  } catch (error) {
    console.error('❌ Lỗi khi seed dữ liệu:', error);
    throw error;
  }
};

// Chạy seed
if (require.main === module) {
  seedTVUScholarships()
    .then(() => {
      console.log('\n✅ Hoàn tất!');
      process.exit(0);
    })
    .catch((error) => {
      console.error('❌ Thất bại:', error);
      process.exit(1);
    });
}

module.exports = seedTVUScholarships;
