import { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import api from '../../services/api';

const SystemBackupPage = () => {
  const [backups, setBackups] = useState([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);

  useEffect(() => {
    fetchBackups();
  }, []);

  const fetchBackups = async () => {
    setLoading(true);
    try {
      const res = await api.get('/backup/list');
      setBackups(res.data?.backups || []);
    } catch (err) {
      toast.error('Không thể tải danh sách backup');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateBackup = async () => {
    setCreating(true);
    try {
      const res = await api.post('/backup/create');
      toast.success(res.message || 'Tạo backup thành công!');
      fetchBackups();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Tạo backup thất bại');
    } finally {
      setCreating(false);
    }
  };

  const handleDownload = async (fileName) => {
    try {
      // Dùng fetch trực tiếp thay vì axios để tránh interceptor
      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:5000/api/backup/download/${fileName}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (!response.ok) {
        throw new Error('Download failed');
      }
      
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', fileName);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
      toast.success('Tải file thành công!');
    } catch (err) {
      toast.error('Không thể tải file');
    }
  };

  const handleDelete = async (fileName) => {
    if (!window.confirm(`Bạn có chắc muốn xóa backup "${fileName}"?`)) return;
    
    try {
      await api.delete(`/backup/${fileName}`);
      toast.success('Đã xóa backup');
      fetchBackups();
    } catch (err) {
      toast.error('Không thể xóa backup');
    }
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleString('vi-VN');
  };

  return (
    <div className="p-6">
      <div className="mb-6 flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">💾 Sao lưu Database</h1>
          <p className="text-gray-600 mt-1">Quản lý backup và khôi phục dữ liệu</p>
        </div>
        <button
          onClick={handleCreateBackup}
          disabled={creating}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 flex items-center gap-2"
        >
          {creating ? (
            <>
              <span className="animate-spin">⏳</span> Đang tạo...
            </>
          ) : (
            <>
              <span>➕</span> Tạo Backup
            </>
          )}
        </button>
      </div>

      {/* Info Card */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
        <h3 className="font-semibold text-blue-800 mb-2">ℹ️ Thông tin</h3>
        <ul className="text-sm text-blue-700 space-y-1">
          <li>• Hệ thống tự động backup mỗi ngày lúc 2:00 AM</li>
          <li>• Chỉ giữ lại 7 file backup gần nhất</li>
          <li>• File backup được lưu dưới dạng SQL, có thể restore bằng MySQL</li>
          <li>• Để restore: <code className="bg-blue-100 px-1 rounded">mysql -u user -p database &lt; backup.sql</code></li>
        </ul>
      </div>

      {/* Backup List */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="px-4 py-3 border-b bg-gray-50">
          <h2 className="font-semibold text-gray-700">📁 Danh sách Backup ({backups.length})</h2>
        </div>

        {loading ? (
          <div className="p-8 text-center text-gray-500">Đang tải...</div>
        ) : backups.length === 0 ? (
          <div className="p-8 text-center text-gray-500">
            <p className="text-4xl mb-2">📭</p>
            <p>Chưa có file backup nào</p>
            <p className="text-sm mt-1">Nhấn "Tạo Backup" để tạo bản sao lưu đầu tiên</p>
          </div>
        ) : (
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="px-4 py-3 text-left font-medium text-gray-600">Tên file</th>
                <th className="px-4 py-3 text-left font-medium text-gray-600">Loại</th>
                <th className="px-4 py-3 text-left font-medium text-gray-600">Kích thước</th>
                <th className="px-4 py-3 text-left font-medium text-gray-600">Thời gian</th>
                <th className="px-4 py-3 text-center font-medium text-gray-600">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {backups.map((backup, index) => (
                <tr key={backup.fileName} className={index === 0 ? 'bg-green-50' : 'hover:bg-gray-50'}>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <span>📄</span>
                      <span className="font-mono text-xs">{backup.fileName}</span>
                      {index === 0 && (
                        <span className="px-2 py-0.5 bg-green-100 text-green-700 text-xs rounded">Mới nhất</span>
                      )}
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <span className={`px-2 py-1 rounded text-xs ${
                      backup.type === 'auto' 
                        ? 'bg-blue-100 text-blue-700' 
                        : 'bg-purple-100 text-purple-700'
                    }`}>
                      {backup.type === 'auto' ? '⏰ Tự động' : '👤 Thủ công'}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-gray-600">{backup.sizeFormatted}</td>
                  <td className="px-4 py-3 text-gray-600">{formatDate(backup.createdAt)}</td>
                  <td className="px-4 py-3 text-center">
                    <div className="flex justify-center gap-2">
                      <button
                        onClick={() => handleDownload(backup.fileName)}
                        className="px-3 py-1 bg-green-100 text-green-700 rounded hover:bg-green-200 text-xs"
                      >
                        ⬇️ Tải về
                      </button>
                      <button
                        onClick={() => handleDelete(backup.fileName)}
                        className="px-3 py-1 bg-red-100 text-red-700 rounded hover:bg-red-200 text-xs"
                      >
                        🗑️ Xóa
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};

export default SystemBackupPage;
