import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import api from '../../services/api';
import authService from '../../services/authService';
import Button from '../../components/common/Button';
import Loading from '../../components/common/Loading';

const StudentMyProfilePage = () => {
  const navigate = useNavigate();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [documents, setDocuments] = useState([]);
  const [editingDocs, setEditingDocs] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const response = await authService.getProfile();
      const data = response.data || response;
      setProfile(data);
      
      // Fetch saved documents
      try {
        const docsRes = await api.get('/users/my-documents');
        setDocuments(docsRes.data || []);
      } catch (e) {
        // API chưa có thì bỏ qua
      }
    } catch (error) {
      toast.error('Không thể tải thông tin');
    } finally {
      setLoading(false);
    }
  };

  const handleUpload = async (type, file) => {
    if (!file) return;
    
    try {
      setUploading(true);
      const formData = new FormData();
      formData.append('file', file);
      formData.append('type', type);
      
      await api.post('/users/my-documents', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      
      toast.success('Upload thành công!');
      fetchData();
    } catch (error) {
      toast.error(error.message || 'Upload thất bại');
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async (docId) => {
    if (!confirm('Xác nhận xóa file này?')) return;
    try {
      await api.delete(`/users/my-documents/${docId}`);
      toast.success('Đã xóa');
      fetchData();
    } catch (error) {
      toast.error(error.message);
    }
  };

  if (loading) return <Loading />;

  const studentData = profile?.studentProfile || {};
  
  const docTypes = [
    { type: 'BANG_DIEM', label: 'Bảng điểm / Kết quả học tập', icon: '📊', color: 'blue' },
    { type: 'HO_NGHEO', label: 'Giấy xác nhận hoàn cảnh khó khăn', icon: '📄', color: 'yellow' },
    { type: 'CCCD', label: 'CCCD / CMND', icon: '🪪', color: 'green' },
    { type: 'KHAC', label: 'Minh chứng khác', icon: '📁', color: 'gray' },
  ];

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-800">Hồ sơ của tôi</h1>
        <p className="text-gray-600 mt-1">Chuẩn bị sẵn minh chứng để nộp học bổng nhanh hơn</p>
      </div>

      {/* Thông tin cơ bản */}
      <div className="bg-white rounded-xl shadow-lg p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
            <span>👤</span> Thông tin cơ bản
          </h2>
          <Button 
            variant="outline" 
            size="sm"
            onClick={() => navigate('/student/profile')}
          >
            ✏️ Chỉnh sửa
          </Button>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-gray-50 rounded-lg p-4">
            <p className="text-sm text-gray-500">Họ và tên</p>
            <p className="font-semibold">{studentData.full_name || profile?.full_name || 'Chưa cập nhật'}</p>
          </div>
          <div className="bg-gray-50 rounded-lg p-4">
            <p className="text-sm text-gray-500">Mã sinh viên</p>
            <p className="font-semibold">{studentData.student_code || profile?.username}</p>
          </div>
          <div className="bg-gray-50 rounded-lg p-4">
            <p className="text-sm text-gray-500">Email</p>
            <p className="font-semibold">{profile?.email}</p>
          </div>
          <div className="bg-gray-50 rounded-lg p-4">
            <p className="text-sm text-gray-500">Số điện thoại</p>
            <p className="font-semibold">{studentData.phone || 'Chưa cập nhật'}</p>
          </div>
        </div>
      </div>

      {/* Thông tin học tập */}
      <div className="bg-white rounded-xl shadow-lg p-6">
        <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
          <span>📚</span> Thông tin học tập
        </h2>
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-blue-50 rounded-lg p-4 text-center">
            <p className="text-sm text-gray-600">GPA</p>
            <p className="text-3xl font-bold text-blue-600">
              {studentData.gpa ? parseFloat(studentData.gpa).toFixed(2) : 'N/A'}
            </p>
          </div>
          <div className="bg-green-50 rounded-lg p-4 text-center">
            <p className="text-sm text-gray-600">Điểm rèn luyện</p>
            <p className="text-3xl font-bold text-green-600">{studentData.drr ?? 'N/A'}</p>
          </div>
        </div>
        <p className="text-xs text-gray-500 mt-3">
          * Thông tin học tập được đồng bộ từ hệ thống đào tạo
        </p>
      </div>

      {/* Minh chứng đã upload */}
      <div className="bg-white rounded-xl shadow-lg p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
            <span>📎</span> Minh chứng của tôi
          </h2>
          <Button
            variant={editingDocs ? 'primary' : 'outline'}
            size="sm"
            onClick={() => setEditingDocs(!editingDocs)}
          >
            {editingDocs ? '✓ Xong' : '✏️ Chỉnh sửa'}
          </Button>
        </div>
        <p className="text-sm text-gray-600 mb-4">
          Upload sẵn các minh chứng để sử dụng khi nộp hồ sơ học bổng
        </p>

        <div className="space-y-4">
          {docTypes.map((docType) => {
            const existingDocs = documents.filter(d => d.type === docType.type);
            
            return (
              <div key={docType.type} className={`border-2 border-dashed border-${docType.color}-200 rounded-lg p-4`}>
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <span className="text-2xl">{docType.icon}</span>
                    <span className="font-medium text-gray-800">{docType.label}</span>
                  </div>
                  {editingDocs && (
                    <label className="cursor-pointer">
                      <input
                        type="file"
                        accept=".pdf,.jpg,.jpeg,.png"
                        className="hidden"
                        onChange={(e) => handleUpload(docType.type, e.target.files[0])}
                        disabled={uploading}
                      />
                      <span className={`px-3 py-1.5 bg-${docType.color}-100 text-${docType.color}-700 rounded-lg text-sm hover:bg-${docType.color}-200 transition`}>
                        + Thêm file
                      </span>
                    </label>
                  )}
                </div>

                {existingDocs.length > 0 ? (
                  <div className="space-y-2">
                    {existingDocs.map((doc) => (
                      <div key={doc.id} className="flex items-center justify-between bg-gray-50 p-2 rounded">
                        <div className="flex items-center gap-2">
                          <span>📄</span>
                          <span className="text-sm">{doc.file_name}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <a
                            href={`http://localhost:5000${doc.file_url}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-blue-600 hover:text-blue-800 text-sm"
                          >
                            Xem
                          </a>
                          {editingDocs && (
                            <button
                              onClick={() => handleDelete(doc.id)}
                              className="text-red-500 hover:text-red-700 text-sm"
                            >
                              Xóa
                            </button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-gray-400">Chưa có file nào</p>
                )}
              </div>
            );
          })}
        </div>

        {/* Nút Lưu khi đang chỉnh sửa */}
        {editingDocs && (
          <div className="flex justify-end gap-3 mt-6 pt-4 border-t">
            <Button
              variant="outline"
              onClick={() => setEditingDocs(false)}
            >
              Hủy
            </Button>
            <Button
              variant="primary"
              onClick={() => {
                setEditingDocs(false);
                toast.success('Đã lưu thay đổi!');
              }}
            >
              💾 Lưu thay đổi
            </Button>
          </div>
        )}
      </div>

      {/* Tips */}
      <div className="bg-blue-50 border border-blue-200 rounded-xl p-6">
        <h3 className="font-bold text-blue-800 mb-2">💡 Mẹo</h3>
        <ul className="text-sm text-blue-700 space-y-1">
          <li>• Upload sẵn minh chứng để nộp hồ sơ nhanh hơn</li>
          <li>• Định dạng hỗ trợ: PDF, JPG, PNG (tối đa 5MB)</li>
          <li>• Đảm bảo file rõ ràng, không bị mờ</li>
          <li>• Cập nhật lại khi có kết quả học tập mới</li>
        </ul>
      </div>
    </div>
  );
};

export default StudentMyProfilePage;
