const applicationService = require('../services/applicationService');
const { ApplicationDocument, Application, Student, StudentDocument, Scholarship, Class } = require('../models');
const { successResponse, errorResponse } = require('../utils/responseHelper');
const ExcelJS = require('exceljs');
const auditService = require('../services/auditService');

// POST /api/applications - Nộp hồ sơ (STUDENT)
const submitApplication = async (req, res) => {
  try {
    const { scholarship_id } = req.body;

    if (!scholarship_id) {
      return errorResponse(res, 'Vui lòng chọn học bổng');
    }

    const application = await applicationService.submitApplication(
      scholarship_id,
      req.user.id
    );

    return successResponse(
      res,
      application,
      'Nộp hồ sơ thành công! Vui lòng chờ kết quả xét duyệt',
      201
    );
  } catch (error) {
    console.error('Submit application error:', error);
    return errorResponse(res, error.message, 400);
  }
};

// POST /api/applications/:id/documents - Upload minh chứng (STUDENT)
const uploadDocuments = async (req, res) => {
  try {
    const { id } = req.params;
    const { type = 'KHAC' } = req.body;

    // req.files được gắn bởi multer middleware
    if (!req.files || req.files.length === 0) {
      return errorResponse(res, 'Vui lòng chọn file để upload');
    }

    // Validate file types và size
    const allowedMimeTypes = [
      'application/pdf',
      'image/jpeg',
      'image/png',
      'image/jpg',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
    ];
    const maxSize = 5 * 1024 * 1024; // 5MB

    for (const file of req.files) {
      if (!allowedMimeTypes.includes(file.mimetype)) {
        return errorResponse(res, `File ${file.originalname} không được hỗ trợ. Chỉ chấp nhận PDF, JPG, PNG, DOC, DOCX`);
      }
      if (file.size > maxSize) {
        return errorResponse(res, `File ${file.originalname} vượt quá 5MB`);
      }
    }

    // Kiểm tra application tồn tại và thuộc về user
    const application = await Application.findByPk(id);
    if (!application) {
      return errorResponse(res, 'Không tìm thấy hồ sơ', 404);
    }

    // Kiểm tra quyền upload (chỉ owner mới được upload)
    const student = await Student.findOne({ where: { user_id: req.user.id } });
    if (!student || application.student_id !== student.id) {
      return errorResponse(res, 'Bạn không có quyền upload cho hồ sơ này', 403);
    }

    // Chỉ upload khi hồ sơ đang PENDING hoặc NEED_UPDATE
    if (!['PENDING', 'NEED_UPDATE'].includes(application.status)) {
      return errorResponse(res, 'Không thể upload minh chứng cho hồ sơ đã được xử lý');
    }

    // Lưu thông tin file vào database
    const documents = await Promise.all(
      req.files.map(file =>
        ApplicationDocument.create({
          application_id: id,
          file_name: file.originalname,
          file_url: `/uploads/documents/${file.filename}`,
          type
        })
      )
    );

    return successResponse(res, documents, 'Upload minh chứng thành công');
  } catch (error) {
    console.error('Upload documents error:', error);
    return errorResponse(res, error.message, 400);
  }
};

// GET /api/applications/my-history - Lịch sử hồ sơ (STUDENT)
const getMyApplications = async (req, res) => {
  try {
    const applications = await applicationService.getMyApplications(req.user.id);

    return successResponse(res, applications);
  } catch (error) {
    console.error('Get my applications error:', error);
    return errorResponse(res, error.message, 500);
  }
};

// GET /api/applications - Danh sách hồ sơ (UNI_ADMIN)
const getApplications = async (req, res) => {
  try {
    const { role, school_id } = req.user;

    const result = await applicationService.getApplications(role, school_id, req.query);

    return successResponse(res, result);
  } catch (error) {
    console.error('Get applications error:', error);
    return errorResponse(res, error.message, 500);
  }
};

// GET /api/applications/:id - Chi tiết hồ sơ
const getApplicationById = async (req, res) => {
  try {
    const { id } = req.params;
    const { role, id: userId, school_id } = req.user;

    const application = await applicationService.getApplicationById(id, role, userId, school_id);

    return successResponse(res, application);
  } catch (error) {
    console.error('Get application error:', error);
    return errorResponse(
      res,
      error.message,
      error.message.includes('không có quyền') ? 403 : 404
    );
  }
};

// PUT /api/applications/:id/review - Xét duyệt hồ sơ (UNI_ADMIN, SUPER_ADMIN)
const reviewApplication = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, admin_note } = req.body;

    if (!status) {
      return errorResponse(res, 'Vui lòng chọn trạng thái xét duyệt');
    }

    // Lấy thông tin application trước khi review để ghi log
    const appBefore = await Application.findByPk(id, {
      include: [
        { model: Student, as: 'student', attributes: ['full_name', 'student_code'] },
        { model: Scholarship, as: 'scholarship', attributes: ['name'] }
      ]
    });

    const application = await applicationService.reviewApplication(
      id,
      { status, admin_note },
      req.user.id,
      req.user.role,
      req.user.school_id
    );

    // Ghi audit log
    if (appBefore) {
      const studentName = appBefore.student?.full_name || 'N/A';
      const scholarshipName = appBefore.scholarship?.name || 'N/A';
      
      if (status === 'APPROVED') {
        await auditService.logApprove(req, appBefore, scholarshipName, studentName);
      } else if (status === 'REJECTED') {
        await auditService.logReject(req, appBefore, scholarshipName, studentName, admin_note || 'Không có lý do');
      }
    }

    const statusMessages = {
      APPROVED: 'Đã duyệt hồ sơ thành công',
      REJECTED: 'Đã từ chối hồ sơ',
      NEED_UPDATE: 'Đã yêu cầu sinh viên bổ sung hồ sơ',
      PENDING: 'Đã chuyển về trạng thái chờ xét'
    };

    return successResponse(res, application, statusMessages[status]);
  } catch (error) {
    console.error('Review application error:', error);
    return errorResponse(res, error.message, 400);
  }
};

// POST /api/applications/:id/copy-documents - Copy documents từ StudentDocument sang ApplicationDocument
const copyDocumentsFromProfile = async (req, res) => {
  try {
    const { id } = req.params;
    const { document_ids } = req.body;

    if (!document_ids || !Array.isArray(document_ids) || document_ids.length === 0) {
      return errorResponse(res, 'Vui lòng chọn ít nhất một minh chứng');
    }

    // Kiểm tra application tồn tại và thuộc về user
    const application = await Application.findByPk(id);
    if (!application) {
      return errorResponse(res, 'Không tìm thấy hồ sơ', 404);
    }

    const student = await Student.findOne({ where: { user_id: req.user.id } });
    if (!student || application.student_id !== student.id) {
      return errorResponse(res, 'Bạn không có quyền thực hiện thao tác này', 403);
    }

    // Chỉ copy khi hồ sơ đang PENDING hoặc NEED_UPDATE
    if (!['PENDING', 'NEED_UPDATE'].includes(application.status)) {
      return errorResponse(res, 'Không thể thêm minh chứng cho hồ sơ đã được xử lý');
    }

    // Lấy các StudentDocument thuộc về sinh viên này
    const studentDocs = await StudentDocument.findAll({
      where: {
        id: document_ids,
        student_id: student.id
      }
    });

    if (studentDocs.length === 0) {
      return errorResponse(res, 'Không tìm thấy minh chứng hợp lệ');
    }

    // Copy sang ApplicationDocument
    const copiedDocs = await Promise.all(
      studentDocs.map(doc =>
        ApplicationDocument.create({
          application_id: id,
          file_name: doc.file_name,
          file_url: doc.file_url,
          type: doc.type
        })
      )
    );

    return successResponse(res, copiedDocs, `Đã đính kèm ${copiedDocs.length} minh chứng`);
  } catch (error) {
    console.error('Copy documents error:', error);
    return errorResponse(res, error.message, 400);
  }
};

// GET /api/applications/export-disbursement - Xuất danh sách giải ngân
const exportDisbursementList = async (req, res) => {
  try {
    const { role, school_id } = req.user;
    const { scholarship_id, status = 'APPROVED', academic_year, semester } = req.query;

    // Build where clause
    const whereClause = {
      status: status
    };

    if (scholarship_id) {
      whereClause.scholarship_id = scholarship_id;
    }

    // Include options
    const includeOptions = [
      {
        model: Student,
        as: 'student',
        attributes: ['id', 'student_code', 'full_name', 'bank_number', 'bank_name', 'class_id'],
        include: [{
          model: Class,
          as: 'class',
          attributes: ['name']
        }]
      },
      {
        model: Scholarship,
        as: 'scholarship',
        attributes: ['id', 'name', 'amount_per_slot', 'academic_year', 'semester'],
        required: true,
        where: {}
      }
    ];

    // Lọc theo năm học và học kỳ
    if (academic_year) {
      includeOptions[1].where.academic_year = academic_year;
    }
    if (semester) {
      // Semester trong DB là "HK1", "HK2", "Cả năm" - frontend gửi "1" hoặc "2"
      includeOptions[1].where.semester = `HK${semester}`;
    }

    // Nếu là UNI_ADMIN, chỉ lấy hồ sơ của trường mình
    if (role === 'UNI_ADMIN' && school_id) {
      includeOptions[1].where.school_id = school_id;
    }

    const applications = await Application.findAll({
      where: whereClause,
      include: includeOptions,
      order: [['submitted_at', 'DESC']]
    });

    if (applications.length === 0) {
      const filterInfo = academic_year ? ` cho năm học ${academic_year}${semester ? ` HK${semester}` : ''}` : '';
      return errorResponse(res, `Không có hồ sơ đã duyệt nào để xuất${filterInfo}`, 404);
    }

    // Tạo workbook với ExcelJS
    const workbook = new ExcelJS.Workbook();
    workbook.creator = 'Scholarship System';
    workbook.created = new Date();

    // Tên sheet có thông tin năm học
    const sheetName = academic_year ? `Giải ngân ${academic_year} HK${semester || ''}` : 'Danh sách giải ngân';
    const worksheet = workbook.addWorksheet(sheetName.substring(0, 31)); // Excel giới hạn 31 ký tự

    // Định nghĩa cột với header - thêm cột Ghi chú
    worksheet.columns = [
      { header: 'STT', key: 'stt', width: 8 },
      { header: 'Mã SV', key: 'student_code', width: 15 },
      { header: 'Họ và Tên', key: 'full_name', width: 25 },
      { header: 'Lớp', key: 'class_name', width: 15 },
      { header: 'Tên Học bổng', key: 'scholarship_name', width: 30 },
      { header: 'Số tiền', key: 'amount', width: 18 },
      { header: 'Ngân hàng', key: 'bank_name', width: 20 },
      { header: 'Số Tài khoản', key: 'bank_number', width: 20 },
      { header: 'Nội dung CK', key: 'transfer_content', width: 35 },
      { header: 'Ghi chú', key: 'note', width: 25 }
    ];

    // Format Header Row (Row 1)
    const headerRow = worksheet.getRow(1);
    headerRow.font = { bold: true, color: { argb: 'FFFFFFFF' } };
    headerRow.fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FF2D3748' } // Màu xám đậm như hình
    };
    headerRow.alignment = { horizontal: 'center', vertical: 'middle' };
    headerRow.height = 25;

    // Đếm số SV thiếu thông tin ngân hàng và tính tổng tiền
    let missingBankCount = 0;
    let totalAmount = 0;

    // Đổ dữ liệu vào các dòng
    applications.forEach((app, index) => {
      const snapshot = app.snapshot_data || {};
      const student = app.student || {};
      const scholarship = app.scholarship || {};

      const studentCode = snapshot.student_code || student.student_code || '';
      const fullName = snapshot.full_name || student.full_name || '';
      const className = student.class?.name || snapshot.class_name || '';
      const bankName = snapshot.bank_name || student.bank_name || '';
      const bankNumber = snapshot.bank_number || student.bank_number || '';
      const amount = Number(scholarship.amount_per_slot) || 0;
      const scholarshipName = scholarship.name || '';

      // Cộng dồn tổng tiền
      totalAmount += amount;

      // Kiểm tra thiếu thông tin ngân hàng
      const missingBank = !bankName || !bankNumber;
      if (missingBank) missingBankCount++;

      const row = worksheet.addRow({
        stt: index + 1,
        student_code: studentCode,
        full_name: fullName,
        class_name: className,
        scholarship_name: scholarshipName,
        amount: amount,
        bank_name: bankName || '⚠️ THIẾU',
        bank_number: bankNumber || '⚠️ THIẾU',
        transfer_content: `HB ${scholarshipName} - ${studentCode}`,
        note: missingBank ? '❌ Thiếu TT ngân hàng' : '✓ OK'
      });

      // Highlight dòng thiếu thông tin ngân hàng bằng màu đỏ nhạt
      if (missingBank) {
        const currentRow = worksheet.getRow(index + 2); // +2 vì header ở row 1
        currentRow.eachCell((cell) => {
          cell.fill = {
            type: 'pattern',
            pattern: 'solid',
            fgColor: { argb: 'FFFECACA' } // Màu đỏ nhạt
          };
        });
      }
    });

    // Format số tiền (cột F - index 6)
    worksheet.getColumn(6).numFmt = '#,##0';
    worksheet.getColumn(6).alignment = { horizontal: 'right' };

    // Border cho tất cả cells có data (10 cột)
    const lastRow = applications.length + 1;
    for (let row = 1; row <= lastRow; row++) {
      for (let col = 1; col <= 10; col++) {
        const cell = worksheet.getCell(row, col);
        cell.border = {
          top: { style: 'thin' },
          left: { style: 'thin' },
          bottom: { style: 'thin' },
          right: { style: 'thin' }
        };
      }
    }

    // Thêm dòng tổng kết ở cuối
    const summaryRow = worksheet.addRow({});
    summaryRow.getCell(1).value = `Tổng: ${applications.length} sinh viên`;
    summaryRow.getCell(1).font = { bold: true };
    
    // Hiển thị tổng tiền ở cột F (Số tiền)
    summaryRow.getCell(5).value = 'TỔNG TIỀN:';
    summaryRow.getCell(5).font = { bold: true };
    summaryRow.getCell(5).alignment = { horizontal: 'right' };
    summaryRow.getCell(6).value = totalAmount;
    summaryRow.getCell(6).numFmt = '#,##0';
    summaryRow.getCell(6).font = { bold: true, color: { argb: 'FF1E40AF' } }; // Màu xanh đậm
    summaryRow.getCell(6).alignment = { horizontal: 'right' };
    
    if (missingBankCount > 0) {
      summaryRow.getCell(7).value = `⚠️ ${missingBankCount} SV thiếu TT ngân hàng`;
      summaryRow.getCell(7).font = { bold: true, color: { argb: 'FFDC2626' } };
    }
    
    // Border cho dòng tổng kết
    for (let col = 1; col <= 10; col++) {
      const cell = summaryRow.getCell(col);
      cell.border = {
        top: { style: 'thin' },
        left: { style: 'thin' },
        bottom: { style: 'double' },
        right: { style: 'thin' }
      };
      cell.fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: 'FFF3F4F6' } // Màu xám nhạt
      };
    }

    // Set response headers - tên file có thông tin năm học
    const dateStr = new Date().toISOString().split('T')[0];
    const periodStr = academic_year ? `_${academic_year.replace('-', '_')}${semester ? `_HK${semester}` : ''}` : '';
    const fileName = `Danh_sach_giai_ngan${periodStr}_${dateStr}.xlsx`;
    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', `attachment; filename="${encodeURIComponent(fileName)}"`);

    // Tạo buffer và gửi về client (thay vì stream trực tiếp)
    const buffer = await workbook.xlsx.writeBuffer();
    
    // Ghi audit log xuất báo cáo
    const auditPeriodStr = academic_year ? `${academic_year}${semester ? ` HK${semester}` : ''}` : 'Tất cả';
    await auditService.logExport(req, 'disbursement', `Xuất danh sách giải ngân ${auditPeriodStr} - ${applications.length} sinh viên`);
    
    res.send(buffer);

  } catch (error) {
    console.error('Export disbursement error:', error);
    return errorResponse(res, error.message, 500);
  }
};

module.exports = {
  submitApplication,
  uploadDocuments,
  copyDocumentsFromProfile,
  getMyApplications,
  getApplications,
  getApplicationById,
  reviewApplication,
  exportDisbursementList
};
