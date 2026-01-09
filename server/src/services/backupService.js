/**
 * Backup Service - Sao lưu database MySQL tự động
 */
const { exec } = require('child_process');
const path = require('path');
const fs = require('fs');
const cron = require('node-cron');

// Thư mục lưu backup
const BACKUP_DIR = path.join(__dirname, '../../backups');

// Đảm bảo thư mục backup tồn tại
if (!fs.existsSync(BACKUP_DIR)) {
  fs.mkdirSync(BACKUP_DIR, { recursive: true });
}

/**
 * Tạo backup database
 * @param {string} type - 'auto' hoặc 'manual'
 * @returns {Promise<object>} Thông tin file backup
 */
const createBackup = async (type = 'auto') => {
  return new Promise((resolve, reject) => {
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19);
    const fileName = `backup_${type}_${timestamp}.sql`;
    const filePath = path.join(BACKUP_DIR, fileName);

    // Lấy thông tin DB từ env (DB_PASS trong .env)
    const { DB_HOST, DB_USER, DB_PASS, DB_NAME } = process.env;

    // Đường dẫn mysqldump - thử nhiều vị trí phổ biến trên Windows
    const mysqldumpPaths = [
      'mysqldump', // Nếu đã có trong PATH
      'C:\\Program Files\\MySQL\\MySQL Server 8.0\\bin\\mysqldump.exe',
      'C:\\Program Files\\MySQL\\MySQL Server 8.1\\bin\\mysqldump.exe',
      'C:\\Program Files\\MySQL\\MySQL Server 8.2\\bin\\mysqldump.exe',
      'C:\\xampp\\mysql\\bin\\mysqldump.exe',
      'C:\\laragon\\bin\\mysql\\mysql-8.0.30-winx64\\bin\\mysqldump.exe',
      '/usr/bin/mysqldump', // Linux/Mac
    ];

    // Tìm mysqldump path hợp lệ
    let mysqldumpPath = 'mysqldump';
    for (const p of mysqldumpPaths) {
      if (fs.existsSync(p) || p === 'mysqldump') {
        mysqldumpPath = p.includes(' ') ? `"${p}"` : p;
        if (fs.existsSync(p)) break;
      }
    }

    // Lệnh mysqldump
    const command = `${mysqldumpPath} -h ${DB_HOST || 'localhost'} -u ${DB_USER} -p${DB_PASS} ${DB_NAME} > "${filePath}"`;

    console.log(`📦 Starting ${type} backup...`);

    exec(command, (error, stdout, stderr) => {
      if (error) {
        console.error('❌ Backup failed:', error.message);
        reject(error);
        return;
      }

      // Lấy kích thước file
      const stats = fs.statSync(filePath);
      const fileSizeKB = (stats.size / 1024).toFixed(2);

      console.log(`✅ Backup completed: ${fileName} (${fileSizeKB} KB)`);

      resolve({
        fileName,
        filePath,
        size: stats.size,
        sizeFormatted: `${fileSizeKB} KB`,
        createdAt: new Date(),
        type
      });
    });
  });
};

/**
 * Lấy danh sách các file backup
 */
const getBackupList = () => {
  if (!fs.existsSync(BACKUP_DIR)) {
    return [];
  }

  const files = fs.readdirSync(BACKUP_DIR)
    .filter(f => f.endsWith('.sql'))
    .map(fileName => {
      const filePath = path.join(BACKUP_DIR, fileName);
      const stats = fs.statSync(filePath);
      
      // Parse type từ tên file (backup_auto_... hoặc backup_manual_...)
      const type = fileName.includes('_auto_') ? 'auto' : 'manual';
      
      return {
        fileName,
        size: stats.size,
        sizeFormatted: stats.size > 1024 * 1024 
          ? `${(stats.size / 1024 / 1024).toFixed(2)} MB`
          : `${(stats.size / 1024).toFixed(2)} KB`,
        createdAt: stats.mtime,
        type
      };
    })
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)); // Mới nhất trước

  return files;
};

/**
 * Xóa file backup
 */
const deleteBackup = (fileName) => {
  const filePath = path.join(BACKUP_DIR, fileName);
  if (fs.existsSync(filePath)) {
    fs.unlinkSync(filePath);
    return true;
  }
  return false;
};

/**
 * Xóa các backup cũ, chỉ giữ lại N file gần nhất
 */
const cleanOldBackups = (keepCount = 7) => {
  const files = getBackupList();
  
  if (files.length <= keepCount) {
    return 0;
  }

  const filesToDelete = files.slice(keepCount);
  let deletedCount = 0;

  filesToDelete.forEach(file => {
    if (deleteBackup(file.fileName)) {
      deletedCount++;
      console.log(`🗑️ Deleted old backup: ${file.fileName}`);
    }
  });

  return deletedCount;
};

/**
 * Lấy đường dẫn file backup để download
 */
const getBackupPath = (fileName) => {
  const filePath = path.join(BACKUP_DIR, fileName);
  if (fs.existsSync(filePath)) {
    return filePath;
  }
  return null;
};

/**
 * Khởi động cron job backup tự động
 * Chạy mỗi ngày lúc 2:00 AM
 */
const startAutoBackup = () => {
  // Cron expression: '0 2 * * *' = 2:00 AM mỗi ngày
  // Để test, có thể dùng '*/5 * * * *' = mỗi 5 phút
  const schedule = process.env.BACKUP_SCHEDULE || '0 2 * * *';
  
  cron.schedule(schedule, async () => {
    console.log('⏰ Running scheduled backup...');
    try {
      await createBackup('auto');
      // Xóa backup cũ, giữ lại 7 file gần nhất
      cleanOldBackups(7);
    } catch (error) {
      console.error('❌ Scheduled backup failed:', error.message);
    }
  });

  console.log(`📅 Auto backup scheduled: ${schedule}`);
};

module.exports = {
  createBackup,
  getBackupList,
  deleteBackup,
  cleanOldBackups,
  getBackupPath,
  startAutoBackup,
  BACKUP_DIR
};
