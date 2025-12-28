const express = require('express');
const router = express.Router();
const applicationController = require('../controllers/applicationController');
const { authenticate, authorize } = require('../middlewares/authMiddleware');
const upload = require('../middlewares/uploadMiddleware');

// Tất cả routes đều cần đăng nhập
router.use(authenticate);

// POST /api/applications - Nộp hồ sơ (STUDENT)
router.post('/', authorize('STUDENT'), applicationController.submitApplication);

// POST /api/applications/:id/documents - Upload minh chứng (STUDENT)
// upload.array('files', 5) = Cho phép upload tối đa 5 files cùng lúc
router.post(
  '/:id/documents',
  authorize('STUDENT'),
  upload.array('files', 5),
  applicationController.uploadDocuments
);

// POST /api/applications/:id/copy-documents - Copy documents từ StudentDocument (STUDENT)
router.post(
  '/:id/copy-documents',
  authorize('STUDENT'),
  applicationController.copyDocumentsFromProfile
);

// GET /api/applications/my-history - Lịch sử hồ sơ (STUDENT)
router.get('/my-history', authorize('STUDENT'), applicationController.getMyApplications);

// GET /api/applications/export-disbursement - Xuất danh sách giải ngân (UNI_ADMIN, SUPER_ADMIN)
// Đặt trước route /:id để tránh conflict
router.get(
  '/export-disbursement',
  authorize('UNI_ADMIN', 'SUPER_ADMIN'),
  applicationController.exportDisbursementList
);

// GET /api/applications - Danh sách hồ sơ (UNI_ADMIN, SUPER_ADMIN)
router.get('/', authorize('UNI_ADMIN', 'SUPER_ADMIN'), applicationController.getApplications);

// GET /api/applications/:id - Chi tiết hồ sơ (STUDENT, UNI_ADMIN, SUPER_ADMIN)
router.get('/:id', applicationController.getApplicationById);

// PUT /api/applications/:id/review - Xét duyệt (UNI_ADMIN, SUPER_ADMIN)
router.put(
  '/:id/review',
  authorize('UNI_ADMIN', 'SUPER_ADMIN'),
  applicationController.reviewApplication
);

module.exports = router;
