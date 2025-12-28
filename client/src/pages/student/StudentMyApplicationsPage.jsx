import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import applicationService from '../../services/applicationService';
import Button from '../../components/common/Button';
import Badge from '../../components/common/Badge';
import Loading from '../../components/common/Loading';
import Modal from '../../components/common/Modal';
import FileUpload from '../../components/common/FileUpload';

const StudentMyApplicationsPage = () => {
  const navigate = useNavigate();
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedApp, setSelectedApp] = useState(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [uploadFiles, setUploadFiles] = useState([]);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    fetchApplications();
  }, []);

  const fetchApplications = async () => {
    try {
      setLoading(true);
      const response = await applicationService.getMyHistory();
      const data = response.data?.data || response.data || [];
      setApplications(Array.isArray(data) ? data : []);
    } catch (error) {
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleUpload = async () => {
    if (uploadFiles.length === 0) {
      toast.error('Vui lòng chọn file');
      return;
    }
    try {
      setUploading(true);
      await applicationService.uploadDocuments(selectedApp.id, uploadFiles);
      toast.success('Upload thành công!');
      setUploadFiles([]);
      fetchApplications();
    } catch (error) {
      toast.error(error.message);
    } finally {
      setUploading(false);
    }
  };

  const getStatusConfig = (status) => {
    const map = {
      PENDING: { variant: 'warning', label: 'Chờ duyệt', icon: '⏳', color: 'yellow', step: 1 },
      NEED_UPDATE: { variant: 'info', label: 'Cần bổ sung', icon: '📝', color: 'blue', step: 1 },
      APPROVED: { variant: 'success', label: 'Đã duyệt', icon: '✅', color: 'green', step: 2 },
      REJECTED: { variant: 'danger', label: 'Từ chối', icon: '❌', color: 'red', step: 2 },
      DISBURSED: { variant: 'primary', label: 'Đã nhận tiền', icon: '💰', color: 'purple', step: 3 },
    };
    return map[status] || map.PENDING;
  };

  const canEdit = (status) => status === 'PENDING' || status === 'NEED_UPDATE';

  if (loading) return <Loading />;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-800">Hồ sơ của tôi</h1>
        <p className="text-gray-600 mt-1">Theo dõi trạng thái hồ sơ học bổng</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: 'Tổng hồ sơ', value: applications.length, icon: '📝', color: 'blue' },
          { label: 'Chờ duyệt', value: applications.filter((a) => a.status === 'PENDING').length, icon: '⏳', color: 'yellow' },
          { label: 'Đã duyệt', value: applications.filter((a) => a.status === 'APPROVED').length, icon: '✅', color: 'green' },
          { label: 'Đã nhận tiền', value: applications.filter((a) => a.status === 'DISBURSED').length, icon: '💰', color: 'purple' },
        ].map((stat, i) => (
          <div key={i} className="bg-white rounded-xl shadow p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm">{stat.label}</p>
                <p className={`text-2xl font-bold text-${stat.color}-600`}>{stat.value}</p>
              </div>
              <span className="text-3xl">{stat.icon}</span>
            </div>
          </div>
        ))}
      </div>

      {/* Applications List */}
      {applications.length === 0 ? (
        <div className="bg-white rounded-xl shadow-lg p-12 text-center">
          <div className="text-6xl mb-4">📋</div>
          <h3 className="text-xl font-bold text-gray-800">Chưa có hồ sơ nào</h3>
          <p className="text-gray-600 mt-2 mb-6">Bạn chưa nộp hồ sơ cho học bổng nào</p>
          <Button variant="primary" onClick={() => navigate('/student/home')}>Tìm học bổng ngay</Button>
        </div>
      ) : (
        <div className="space-y-4">
          {applications.map((app) => {
            const statusConfig = getStatusConfig(app.status);
            return (
              <div key={app.id} className="bg-white rounded-xl shadow-lg overflow-hidden">
                {/* Progress Bar */}
                <div className="h-2 bg-gray-200">
                  <div className={`h-full bg-${statusConfig.color}-500 transition-all`}
                    style={{ width: `${(statusConfig.step / 3) * 100}%` }} />
                </div>

                <div className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <h3 className="text-xl font-bold text-gray-800">{app.scholarship?.name}</h3>
                      <p className="text-sm text-gray-500">
                        Nộp: {new Date(app.submitted_at).toLocaleDateString('vi-VN')}
                        {app.reviewed_at && ` • Duyệt: ${new Date(app.reviewed_at).toLocaleDateString('vi-VN')}`}
                      </p>
                    </div>
                    <Badge variant={statusConfig.variant}>
                      {statusConfig.icon} {statusConfig.label}
                    </Badge>
                  </div>

                  {/* Info Grid */}
                  <div className="grid grid-cols-3 gap-4 mb-4">
                    <div className="bg-gray-50 rounded-lg p-3 text-center">
                      <p className="text-xs text-gray-500">GPA</p>
                      <p className="font-bold text-blue-600">{parseFloat(app.snapshot_data?.gpa || 0).toFixed(2)}</p>
                    </div>
                    <div className="bg-gray-50 rounded-lg p-3 text-center">
                      <p className="text-xs text-gray-500">ĐRL</p>
                      <p className="font-bold text-green-600">{app.snapshot_data?.drr || 0}</p>
                    </div>
                    <div className="bg-gray-50 rounded-lg p-3 text-center">
                      <p className="text-xs text-gray-500">Giá trị</p>
                      <p className="font-bold text-yellow-600 text-sm">
                        {parseFloat(app.scholarship?.amount_per_slot || 0).toLocaleString('vi-VN')} đ
                      </p>
                    </div>
                  </div>

                  {/* Admin Note */}
                  {app.admin_note && (
                    <div className="bg-yellow-50 border-l-4 border-yellow-400 p-3 mb-4">
                      <p className="text-sm text-yellow-800">
                        <strong>📝 Ghi chú:</strong> {app.admin_note}
                      </p>
                    </div>
                  )}

                  {/* Actions - 2 nút riêng biệt */}
                  <div className="flex gap-3">
                    <Button 
                      variant="outline" 
                      size="sm" 
                      onClick={() => { setSelectedApp(app); setShowDetailModal(true); }}
                    >
                      👁️ Xem chi tiết
                    </Button>
                    {canEdit(app.status) && (
                      <Button 
                        variant="success" 
                        size="sm" 
                        onClick={() => navigate(`/scholarships/${app.scholarship_id}`)}
                      >
                        ✏️ Chỉnh sửa hồ sơ
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Detail Modal */}
      <Modal 
        isOpen={showDetailModal} 
        onClose={() => setShowDetailModal(false)} 
        title="Chi tiết hồ sơ" 
        size="lg"
      >
        {selectedApp && (
          <div className="space-y-4">
            {/* Thông tin học bổng */}
            <div className="bg-gray-50 rounded-lg p-4">
              <h3 className="font-bold mb-2">{selectedApp.scholarship?.name}</h3>
              <p className="text-sm text-gray-600">
                Giá trị: {parseFloat(selectedApp.scholarship?.amount_per_slot || 0).toLocaleString('vi-VN')} VNĐ
              </p>
            </div>

            {/* Thông tin hồ sơ */}
            <div className="bg-blue-50 rounded-lg p-4">
              <h3 className="font-bold text-blue-800 mb-2">📋 Thông tin hồ sơ</h3>
              <div className="grid grid-cols-2 gap-2 text-sm">
                <p><strong>GPA:</strong> {parseFloat(selectedApp.snapshot_data?.gpa || 0).toFixed(2)}</p>
                <p><strong>ĐRL:</strong> {selectedApp.snapshot_data?.drr || 0}</p>
                <p><strong>Hoàn cảnh:</strong> {
                  selectedApp.snapshot_data?.poor_cert_type === 'DISABILITY' ? 'Khuyết tật' :
                  selectedApp.snapshot_data?.poor_cert_type === 'POOR' ? 'Hộ nghèo' :
                  selectedApp.snapshot_data?.poor_cert_type === 'NEAR_POOR' ? 'Hộ cận nghèo' :
                  'Bình thường'
                }</p>
                <p><strong>Ngày nộp:</strong> {new Date(selectedApp.submitted_at).toLocaleDateString('vi-VN')}</p>
              </div>
            </div>

            {/* Minh chứng đã nộp */}
            <div className="bg-green-50 rounded-lg p-4">
              <h3 className="font-bold text-green-800 mb-2">📎 Minh chứng đã nộp</h3>
              {selectedApp.documents && selectedApp.documents.length > 0 ? (
                <div className="space-y-2">
                  {selectedApp.documents.map((doc, i) => (
                    <div key={i} className="flex items-center justify-between bg-white p-2 rounded">
                      <div className="flex items-center gap-2">
                        <span className="text-lg">
                          {doc.type === 'BANG_DIEM' ? '📊' : doc.type === 'HO_NGHEO' ? '📄' : doc.type === 'CCCD' ? '🪪' : '📁'}
                        </span>
                        <div>
                          <p className="text-sm font-medium">{doc.file_name}</p>
                          <p className="text-xs text-gray-500">
                            {doc.type === 'BANG_DIEM' ? 'Bảng điểm' : 
                             doc.type === 'HO_NGHEO' ? 'Hoàn cảnh' : 
                             doc.type === 'CCCD' ? 'CCCD' : 'Khác'}
                          </p>
                        </div>
                      </div>
                      <a href={`http://localhost:5000${doc.file_url}`} target="_blank" rel="noopener noreferrer"
                        className="text-blue-600 hover:text-blue-800 text-sm">
                        Xem
                      </a>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-gray-600">Chưa có minh chứng nào</p>
              )}
            </div>

            {/* Thêm minh chứng mới - chỉ hiện khi có thể edit */}
            {canEdit(selectedApp.status) && (
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                <p className="text-yellow-800 text-sm">
                  💡 Để bổ sung minh chứng, vui lòng vào <strong>"Hồ sơ của tôi"</strong> để upload file, sau đó nộp lại hồ sơ cho học bổng này.
                </p>
                <button
                  onClick={() => { setShowDetailModal(false); navigate('/student/my-profile'); }}
                  className="mt-2 text-blue-600 hover:text-blue-800 text-sm font-medium"
                >
                  → Đi đến Hồ sơ của tôi
                </button>
              </div>
            )}

            <div className="flex justify-end gap-3 pt-2">
              <Button variant="outline" onClick={() => setShowDetailModal(false)}>Đóng</Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default StudentMyApplicationsPage;
