const express = require('express');
const router = express.Router();
const { authenticate, authorize } = require('../middlewares/authMiddleware');
const { Sponsor, Fund, Scholarship, Application, School } = require('../models');
const { Op } = require('sequelize');

// Tất cả routes đều cần đăng nhập và là SPONSOR
router.use(authenticate);
router.use(authorize('SPONSOR'));

// GET /api/sponsor/projects - Danh sách dự án tài trợ
router.get('/projects', async (req, res) => {
  try {
    const { academic_year, semester, school_id } = req.query;
    
    const sponsor = await Sponsor.findOne({
      where: { user_id: req.user.id }
    });

    // Nếu chưa có sponsor profile, trả về mảng rỗng thay vì lỗi
    if (!sponsor) {
      return res.json({
        success: true,
        data: [],
        schools: [],
        message: 'Chưa có thông tin nhà tài trợ'
      });
    }

    // Build fund where clause
    const fundWhere = { sponsor_id: sponsor.id };
    if (school_id) fundWhere.school_id = school_id;

    // Build scholarship where clause
    const scholarshipWhere = {};
    if (academic_year) scholarshipWhere.academic_year = academic_year;
    if (semester) scholarshipWhere.semester = semester;

    // Lấy các quỹ của sponsor
    const funds = await Fund.findAll({
      where: fundWhere,
      include: [
        {
          model: School,
          as: 'school',
          attributes: ['id', 'name', 'code']
        },
        {
          model: Scholarship,
          as: 'scholarships',
          where: Object.keys(scholarshipWhere).length > 0 ? scholarshipWhere : undefined,
          required: Object.keys(scholarshipWhere).length > 0,
          include: [
            {
              model: School,
              as: 'school',
              attributes: ['id', 'name', 'code']
            },
            {
              model: Application,
              as: 'applications',
              where: { status: 'APPROVED' },
              required: false
            }
          ]
        }
      ]
    });

    // Lấy danh sách trường mà sponsor có quỹ
    const allFunds = await Fund.findAll({
      where: { sponsor_id: sponsor.id },
      include: [{ model: School, as: 'school', attributes: ['id', 'name', 'code'] }]
    });
    const schools = [...new Map(allFunds.map(f => [f.school?.id, f.school]).filter(([id]) => id)).values()];

    // Format dữ liệu
    const projects = funds.map(fund => {
      const totalSlots = fund.scholarships?.reduce((sum, s) => sum + s.slots, 0) || 0;
      const disbursedAmount = fund.scholarships?.reduce((sum, s) => {
        const approvedCount = s.applications?.length || 0;
        return sum + (approvedCount * parseFloat(s.amount_per_slot));
      }, 0) || 0;

      return {
        id: fund.id,
        name: fund.name,
        total_amount: fund.amount,
        disbursed_amount: disbursedAmount,
        total_slots: totalSlots,
        status: fund.status || 'ACTIVE',
        school: fund.school,
        scholarships: fund.scholarships?.map(s => ({
          id: s.id,
          name: s.name,
          school: s.school,
          status: s.status,
          academic_year: s.academic_year,
          semester: s.semester
        }))
      };
    });

    res.json({
      success: true,
      data: projects,
      schools
    });
  } catch (error) {
    console.error('Error fetching sponsor projects:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

// GET /api/sponsor/recipients - Danh sách sinh viên nhận học bổng
router.get('/recipients', async (req, res) => {
  try {
    const { academic_year, semester, school_id } = req.query;
    
    const sponsor = await Sponsor.findOne({
      where: { user_id: req.user.id }
    });

    // Nếu chưa có sponsor profile, trả về mảng rỗng
    if (!sponsor) {
      return res.json({
        success: true,
        data: [],
        schools: [],
        message: 'Chưa có thông tin nhà tài trợ'
      });
    }

    // Lấy danh sách học bổng của sponsor
    const fundWhere = { sponsor_id: sponsor.id };
    if (school_id) fundWhere.school_id = school_id;
    
    const funds = await Fund.findAll({
      where: fundWhere,
      attributes: ['id']
    });
    
    if (funds.length === 0) {
      return res.json({
        success: true,
        data: [],
        schools: [],
        message: 'Chưa có gói tài trợ nào'
      });
    }

    const fundIds = funds.map(f => f.id);

    // Build scholarship where clause
    const scholarshipWhere = { fund_id: { [Op.in]: fundIds } };
    if (academic_year) scholarshipWhere.academic_year = academic_year;
    if (semester) scholarshipWhere.semester = semester;

    const scholarships = await Scholarship.findAll({
      where: scholarshipWhere,
      attributes: ['id']
    });
    
    if (scholarships.length === 0) {
      return res.json({
        success: true,
        data: [],
        schools: [],
        message: 'Chưa có học bổng nào'
      });
    }

    const scholarshipIds = scholarships.map(s => s.id);

    // Lấy danh sách sinh viên đã được duyệt
    const applications = await Application.findAll({
      where: {
        scholarship_id: { [Op.in]: scholarshipIds },
        status: { [Op.in]: ['APPROVED', 'DISBURSED'] }
      },
      include: [
        {
          model: Scholarship,
          as: 'scholarship',
          attributes: ['name', 'amount_per_slot', 'academic_year', 'semester'],
          include: [
            {
              model: School,
              as: 'school',
              attributes: ['id', 'name', 'code']
            }
          ]
        }
      ],
      order: [['reviewed_at', 'DESC']]
    });

    // Lấy danh sách trường mà sponsor có quỹ
    const allFunds = await Fund.findAll({
      where: { sponsor_id: sponsor.id },
      include: [{ model: School, as: 'school', attributes: ['id', 'name', 'code'] }]
    });
    const schools = [...new Map(allFunds.map(f => [f.school?.id, f.school]).filter(([id]) => id)).values()];

    // Format dữ liệu (ẩn thông tin nhạy cảm)
    const recipients = applications.map(app => ({
      student_name: app.snapshot_data?.full_name || 'N/A',
      school_name: app.scholarship?.school?.name || 'N/A',
      school_code: app.scholarship?.school?.code || 'N/A',
      scholarship_name: app.scholarship?.name || 'N/A',
      amount: app.scholarship?.amount_per_slot || 0,
      academic_year: app.scholarship?.academic_year || 'N/A',
      semester: app.scholarship?.semester || 'N/A',
      status: app.status
    }));

    res.json({
      success: true,
      data: recipients,
      schools
    });
  } catch (error) {
    console.error('Error fetching sponsor recipients:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

// GET /api/sponsor/pending-reviews - Hồ sơ chờ duyệt
router.get('/pending-reviews', async (req, res) => {
  try {
    // Tạm thời trả về mảng rỗng nếu chưa có sponsor profile
    const sponsor = await Sponsor.findOne({ where: { user_id: req.user.id } });
    if (!sponsor) {
      return res.json({ success: true, data: [] });
    }

    // TODO: Implement khi có bảng shortlist
    res.json({ success: true, data: [] });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// GET /api/sponsor/applications - Danh sách hồ sơ đề cử
router.get('/applications', async (req, res) => {
  try {
    const sponsor = await Sponsor.findOne({ where: { user_id: req.user.id } });
    if (!sponsor) {
      return res.json({ success: true, data: [] });
    }

    // TODO: Implement khi có bảng shortlist
    res.json({ success: true, data: [] });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// GET /api/sponsor/transactions - Lịch sử giao dịch
router.get('/transactions', async (req, res) => {
  try {
    // TODO: Implement khi có bảng transactions
    res.json({ success: true, data: [] });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// GET /api/sponsor/disbursements - Báo cáo giải ngân
router.get('/disbursements', async (req, res) => {
  try {
    // TODO: Implement khi có bảng disbursements
    res.json({ success: true, data: [] });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// GET /api/sponsor/profile - Lấy hồ sơ đơn vị
router.get('/profile', async (req, res) => {
  try {
    const sponsor = await Sponsor.findOne({ where: { user_id: req.user.id } });
    res.json({ success: true, data: sponsor || {} });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// PUT /api/sponsor/profile - Cập nhật hồ sơ đơn vị
router.put('/profile', async (req, res) => {
  try {
    const { company_name, website, contact_person } = req.body;

    let sponsor = await Sponsor.findOne({ where: { user_id: req.user.id } });
    
    if (sponsor) {
      await sponsor.update({
        company_name, website, contact_person
      });
    } else {
      sponsor = await Sponsor.create({
        user_id: req.user.id,
        company_name, website, contact_person
      });
    }

    res.json({ success: true, data: sponsor, message: 'Cập nhật thành công' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// GET /api/sponsor/notifications - Thông báo
router.get('/notifications', async (req, res) => {
  try {
    // TODO: Implement khi có bảng notifications
    res.json({ success: true, data: [] });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// GET /api/sponsor/thank-you-letters - Thư cảm ơn
router.get('/thank-you-letters', async (req, res) => {
  try {
    // TODO: Implement khi có bảng thank_you_letters
    res.json({ success: true, data: [] });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;
