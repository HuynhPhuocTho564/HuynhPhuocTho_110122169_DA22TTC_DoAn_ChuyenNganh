const express = require('express');
const router = express.Router();
const multer = require('multer');
const { authenticate, authorize } = require('../middlewares/authMiddleware');
const importController = require('../controllers/importController');

// Multer config for memory storage
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB
  },
  fileFilter: (req, file, cb) => {
    if (file.mimetype === 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' ||
        file.mimetype === 'application/vnd.ms-excel') {
      cb(null, true);
    } else {
      cb(new Error('Chỉ chấp nhận file Excel (.xlsx, .xls)'));
    }
  }
});

// Download template
router.get('/template', 
  authenticate, 
  authorize('UNI_ADMIN', 'SUPER_ADMIN'), 
  importController.downloadTemplate
);

// Preview import
router.post('/preview', 
  authenticate, 
  authorize('UNI_ADMIN', 'SUPER_ADMIN'), 
  upload.single('file'),
  importController.previewImport
);

// Import students
router.post('/students', 
  authenticate, 
  authorize('UNI_ADMIN', 'SUPER_ADMIN'), 
  upload.single('file'),
  importController.importStudents
);

module.exports = router;
