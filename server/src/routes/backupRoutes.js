/**
 * Backup Routes - API quản lý backup database
 * Chỉ SUPER_ADMIN mới có quyền truy cập
 */
const express = require('express');
const router = express.Router();
const { authenticate, authorize } = require('../middlewares/authMiddleware');
const backupService = require('../services/backupService');
const { successResponse, errorResponse } = require('../utils/responseHelper');
const auditService = require('../services/auditService');

// GET /api/backup/list - Lấy danh sách backup
router.get('/list', authenticate, authorize('SUPER_ADMIN'), async (req, res) => {
  try {
    const backups = backupService.getBackupList();
    return successResponse(res, {
      backups,
      backupDir: backupService.BACKUP_DIR,
      total: backups.length
    });
  } catch (error) {
    return errorResponse(res, error.message, 500);
  }
});

// POST /api/backup/create - Tạo backup thủ công
router.post('/create', authenticate, authorize('SUPER_ADMIN'), async (req, res) => {
  try {
    const backup = await backupService.createBackup('manual');
    
    // Ghi audit log
    await auditService.logAction({
      userId: req.user.id,
      username: req.user.username,
      userRole: req.user.role,
      action: 'EXPORT',
      entityType: 'backup',
      entityName: backup.fileName,
      description: `Tạo backup thủ công: ${backup.fileName} (${backup.sizeFormatted})`,
      ...auditService.getRequestInfo(req)
    });

    return successResponse(res, backup, 'Tạo backup thành công');
  } catch (error) {
    return errorResponse(res, `Backup thất bại: ${error.message}`, 500);
  }
});

// GET /api/backup/download/:fileName - Download file backup
router.get('/download/:fileName', authenticate, authorize('SUPER_ADMIN'), async (req, res) => {
  try {
    const { fileName } = req.params;
    
    // Validate filename để tránh path traversal
    if (fileName.includes('..') || fileName.includes('/') || fileName.includes('\\')) {
      return errorResponse(res, 'Tên file không hợp lệ', 400);
    }

    const filePath = backupService.getBackupPath(fileName);
    
    if (!filePath) {
      return errorResponse(res, 'File không tồn tại', 404);
    }

    res.download(filePath, fileName);
  } catch (error) {
    return errorResponse(res, error.message, 500);
  }
});

// DELETE /api/backup/:fileName - Xóa file backup
router.delete('/:fileName', authenticate, authorize('SUPER_ADMIN'), async (req, res) => {
  try {
    const { fileName } = req.params;
    
    if (fileName.includes('..') || fileName.includes('/') || fileName.includes('\\')) {
      return errorResponse(res, 'Tên file không hợp lệ', 400);
    }

    const deleted = backupService.deleteBackup(fileName);
    
    if (!deleted) {
      return errorResponse(res, 'File không tồn tại', 404);
    }

    // Ghi audit log
    await auditService.logAction({
      userId: req.user.id,
      username: req.user.username,
      userRole: req.user.role,
      action: 'DELETE',
      entityType: 'backup',
      entityName: fileName,
      description: `Xóa file backup: ${fileName}`,
      ...auditService.getRequestInfo(req)
    });

    return successResponse(res, null, 'Xóa backup thành công');
  } catch (error) {
    return errorResponse(res, error.message, 500);
  }
});

// POST /api/backup/clean - Dọn dẹp backup cũ
router.post('/clean', authenticate, authorize('SUPER_ADMIN'), async (req, res) => {
  try {
    const { keepCount = 7 } = req.body;
    const deletedCount = backupService.cleanOldBackups(keepCount);
    return successResponse(res, { deletedCount }, `Đã xóa ${deletedCount} file backup cũ`);
  } catch (error) {
    return errorResponse(res, error.message, 500);
  }
});

module.exports = router;
