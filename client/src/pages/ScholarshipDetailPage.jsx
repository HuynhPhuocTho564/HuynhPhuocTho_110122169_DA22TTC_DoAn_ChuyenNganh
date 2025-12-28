import { useEffect, useState, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import scholarshipService from '../services/scholarshipService';
import applicationService from '../services/applicationService';
import api from '../services/api';
import useAuthStore from '../store/useAuthStore';
import Button from '../components/common/Button';
import Badge from '../components/common/Badge';
import Loading from '../components/common/Loading';
import Modal from '../components/common/Modal';
import { isExpired, formatDate } from '../utils/dateHelper';

const ScholarshipDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const [scholarship, setScholarship] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  
  // Documents từ "Hồ sơ của tôi"
  const [myDocuments, setMyDocuments] = useState([]);
  const [loadingDocs, setLoadingDocs] = useState(false);
  
  // Kiểm tra hồ sơ đã nộp
  const [existingApplication, setExistingApplication] = useState(null);

  // Upload trực tiếp
  const fileInputRef = useRef(null);
  const [uploading, setUploading] = useState(false);
  const [selectedType, setSelectedType] = useState('OTHER');

  useEffect(() => {
    fetchScholarshipDetail();
    if (user?.role === 'STUDENT') {
      checkExistingApplication();
    }
  }, [id, user]);

  const fetchScholarshipDetail = async () => {
    try {
      const response = await scholarshipService.getById(id);
      setScholarship(response.data);
    } catch (error) {
      toast.error(error.message);
      navigate('/scholarships');
    } finally {
      setLoading(false);
    }
  };

  const checkExistingApplication = async () => {
    try {
      const res = await api.get('/applications/my-history');
      const apps = res.data || [];
      const existing = apps.find(app => app.scholarship_id === parseInt(id));
      setExistingApplication(existing || null);
    } catch (error) {
      // Không có hồ sơ nào - bình thường
    }
  };

  // Fetch documents từ "Hồ sơ của tôi" khi mở modal
  const fetchMyDocuments = async () => {
    try {
      setLoadingDocs(true);
      const res = await api.get('/users/my-documents');
      const docs = res.data || [];
      setMyDocuments(docs);
    } catch (error) {
      console.log('Chưa có documents');
      setMyDocuments([]);
    } finally {
      setLoadingDocs(false);
    }
  };

  const handleOpenModal = () => {
    setShowConfirmModal(true);
    fetchMyDocuments();
  };

  // Upload file trực tiếp
  const handleFileUpload = async (e, typeOverride = null) => {
    const file = e.target.files[0];
    if (!file) return;

    const uploadType = typeOverride || selectedType;

    try {
      setUploading(true);
      const formData = new FormData();
      formData.append('file', file);
      formData.append('type', uploadType);

      await api.post('/users/my-documents', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });

      toast.success('Upload thành công!');
      fetchMyDocuments(); // Refresh danh sách
    } catch (error) {
      toast.error(error.message || 'Upload thất bại');
    } finally {
      setUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  // Xóa file
  const handleDeleteDocument = async (docId) => {
    if (!window.confirm('Bạn có chắc muốn xóa file này?')) return;

    try {
      await api.delete(`/users/my-documents/${docId}`);
      // Cập nhật state ngay lập tức để UI phản hồi nhanh
      setMyDocuments(prev => prev.filter(doc => doc.id !== docId));
      toast.success('Đã xóa file');
    } catch (error) {
      toast.error(error.message || 'Xóa thất bại');
      // Nếu lỗi, refresh lại danh sách
      fetchMyDocuments();
    }
  };
  const handleSubmitApplication = async () => {
    try {
      setSubmitting(true);
      
      // 1. Nộp hồ sơ trước
      const response = await applicationService.submit(id);
      // api interceptor đã unwrap, response = { success, data, message }
      // data chứa application object
      const applicationId = response.data?.id;
      
      if (!applicationId) {
        throw new Error('Không thể tạo hồ sơ');
      }
      
      // 2. Copy tất cả documents từ "Hồ sơ của tôi" (nếu có)
      if (myDocuments.length > 0) {
        try {
          await api.post(`/applications/${applicationId}/copy-documents`, {
            document_ids: myDocuments.map(d => d.id)
          });
        } catch (docError) {
          console.log('Copy documents warning:', docError.message);
          // Không throw error - vẫn cho nộp hồ sơ thành công
        }
      }
      
      toast.success(existingApplication ? 'Cập nhật hồ sơ thành công!' : 'Nộp hồ sơ thành công! Vui lòng chờ kết quả xét duyệt.');
      setShowConfirmModal(false);
      navigate('/student/my-applications');
    } catch (error) {
      toast.error(error.message);
    } finally {
      setSubmitting(false);
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(amount);
  };

  // formatDate đã import từ dateHelper

  const getStatusBadge = (status) => {
    const statusMap = {
      OPEN: { variant: 'success', label: 'Đang mở' },
      CLOSED: { variant: 'warning', label: 'Đã đóng' },
      FINISHED: { variant: 'danger', label: 'Đã kết thúc' },
    };
    const config = statusMap[status] || statusMap.OPEN;
    return <Badge variant={config.variant} size="lg">{config.label}</Badge>;
  };

  if (loading) return <Loading fullScreen />;
  if (!scholarship) return null;

  const isDeadlinePassed = isExpired(scholarship.end_date);
  const isStudent = user?.role === 'STUDENT';
  const isOpen = scholarship.status === 'OPEN' && !isDeadlinePassed;
  
  // Kiểm tra trạng thái hồ sơ đã nộp
  const appStatus = existingApplication?.status;
  const canApply = isStudent && isOpen && (!appStatus || appStatus === 'PENDING' || appStatus === 'NEED_UPDATE' || appStatus === 'REJECTED');
  const cannotApply = appStatus === 'APPROVED' || appStatus === 'DISBURSED';
  
  // Text cho nút
  const getButtonText = () => {
    if (!appStatus) return 'Nộp hồ sơ ngay';
    if (appStatus === 'PENDING') return 'Chỉnh sửa hồ sơ';
    if (appStatus === 'NEED_UPDATE') return 'Bổ sung hồ sơ';
    if (appStatus === 'REJECTED') return 'Nộp lại hồ sơ';
    return 'Nộp hồ sơ ngay';
  };

  return (
    <div className="space-y-6">
      {/* Back Button */}
      <Button
        variant="outline"
        onClick={() => navigate(-1)}
      >
        ← Quay lại
      </Button>

      {/* Header Card */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-700 rounded-2xl p-8 text-white shadow-xl">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="flex items-center space-x-3 mb-4">
              {getStatusBadge(scholarship.status)}
              <span className="text-blue-100">
                {scholarship.semester} - {scholarship.academic_year}
              </span>
            </div>
            <h1 className="text-4xl font-bold mb-4">{scholarship.name}</h1>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-6">
              <div className="bg-white bg-opacity-20 rounded-lg p-4">
                <p className="text-blue-100 text-sm mb-1">Giá trị/suất</p>
                <p className="text-3xl font-bold">{formatCurrency(scholarship.amount_per_slot)}</p>
              </div>
              <div className="bg-white bg-opacity-20 rounded-lg p-4">
                <p className="text-blue-100 text-sm mb-1">Số suất</p>
                <p className="text-3xl font-bold">{scholarship.slots} suất</p>
              </div>
              <div className="bg-white bg-opacity-20 rounded-lg p-4">
                <p className="text-blue-100 text-sm mb-1">Còn lại</p>
                <p className="text-3xl font-bold">
                  {scholarship.stats?.remaining_slots || scholarship.slots} suất
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Description */}
          <div className="bg-white rounded-xl shadow-lg p-6">
            <h2 className="text-2xl font-bold text-gray-800 mb-4 flex items-center">
              <span className="mr-2">📋</span>
              Mô tả học bổng
            </h2>
            <div className="prose max-w-none text-gray-700">
              {scholarship.description || 'Chưa có mô tả'}
            </div>
          </div>

          {/* Criteria */}
          {scholarship.criteria_json && (
            <div className="bg-white rounded-xl shadow-lg p-6">
              <h2 className="text-2xl font-bold text-gray-800 mb-4 flex items-center">
                <span className="mr-2">✅</span>
                Tiêu chí xét duyệt
              </h2>
              <div className="space-y-3">
                {scholarship.criteria_json.min_gpa && (
                  <div className="flex items-center p-3 bg-blue-50 rounded-lg">
                    <svg className="w-5 h-5 text-blue-600 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <span className="text-gray-700">
                      GPA tối thiểu: <strong>{scholarship.criteria_json.min_gpa}</strong>
                    </span>
                  </div>
                )}
                {scholarship.criteria_json.min_drr && (
                  <div className="flex items-center p-3 bg-green-50 rounded-lg">
                    <svg className="w-5 h-5 text-green-600 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <span className="text-gray-700">
                      Điểm rèn luyện tối thiểu: <strong>{scholarship.criteria_json.min_drr}</strong>
                    </span>
                  </div>
                )}
                {scholarship.criteria_json.require_poor && (
                  <div className="flex items-center p-3 bg-yellow-50 rounded-lg">
                    <svg className="w-5 h-5 text-yellow-600 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                    </svg>
                    <span className="text-gray-700">
                      Yêu cầu có giấy xác nhận hoàn cảnh khó khăn
                    </span>
                  </div>
                )}
              </div>
            </div>
          )}


        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Timeline */}
          <div className="bg-white rounded-xl shadow-lg p-6">
            <h3 className="text-lg font-bold text-gray-800 mb-4">Thời gian</h3>
            <div className="space-y-4">
              <div className="flex items-start">
                <div className="flex-shrink-0 w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                  <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-900">Bắt đầu</p>
                  <p className="text-sm text-gray-500">{formatDate(scholarship.start_date)}</p>
                </div>
              </div>
              <div className="flex items-start">
                <div className={`flex-shrink-0 w-10 h-10 ${isDeadlinePassed ? 'bg-red-100' : 'bg-yellow-100'} rounded-full flex items-center justify-center`}>
                  <svg className={`w-5 h-5 ${isDeadlinePassed ? 'text-red-600' : 'text-yellow-600'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-900">Hạn nộp</p>
                  <p className="text-sm text-gray-500">{formatDate(scholarship.end_date)}</p>
                  {isDeadlinePassed && (
                    <Badge variant="danger" size="sm">Đã hết hạn</Badge>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Trạng thái hồ sơ đã nộp */}
          {isStudent && existingApplication && (
            <div className={`rounded-xl shadow-lg p-6 border-2 ${
              appStatus === 'PENDING' ? 'bg-blue-50 border-blue-200' :
              appStatus === 'NEED_UPDATE' ? 'bg-yellow-50 border-yellow-200' :
              appStatus === 'APPROVED' ? 'bg-green-50 border-green-200' :
              appStatus === 'REJECTED' ? 'bg-red-50 border-red-200' :
              appStatus === 'DISBURSED' ? 'bg-purple-50 border-purple-200' :
              'bg-gray-50 border-gray-200'
            }`}>
              <div className="flex items-center gap-3 mb-3">
                <span className="text-2xl">
                  {appStatus === 'PENDING' ? '⏳' :
                   appStatus === 'NEED_UPDATE' ? '📝' :
                   appStatus === 'APPROVED' ? '✅' :
                   appStatus === 'REJECTED' ? '❌' :
                   appStatus === 'DISBURSED' ? '💰' : '📄'}
                </span>
                <div>
                  <p className="font-bold text-gray-800">Bạn đã nộp hồ sơ</p>
                  <p className={`text-sm font-medium ${
                    appStatus === 'PENDING' ? 'text-blue-600' :
                    appStatus === 'NEED_UPDATE' ? 'text-yellow-600' :
                    appStatus === 'APPROVED' ? 'text-green-600' :
                    appStatus === 'REJECTED' ? 'text-red-600' :
                    appStatus === 'DISBURSED' ? 'text-purple-600' : 'text-gray-600'
                  }`}>
                    {appStatus === 'PENDING' ? 'Đang chờ xét duyệt' :
                     appStatus === 'NEED_UPDATE' ? 'Cần bổ sung hồ sơ' :
                     appStatus === 'APPROVED' ? 'Đã được duyệt' :
                     appStatus === 'REJECTED' ? 'Đã bị từ chối' :
                     appStatus === 'DISBURSED' ? 'Đã nhận học bổng' : appStatus}
                  </p>
                </div>
              </div>
              {existingApplication.submitted_at && (
                <p className="text-xs text-gray-500">
                  Nộp lúc: {new Date(existingApplication.submitted_at).toLocaleString('vi-VN')}
                </p>
              )}
              {existingApplication.admin_note && (
                <p className="text-sm text-gray-600 mt-2 p-2 bg-white rounded border">
                  💬 Ghi chú: {existingApplication.admin_note}
                </p>
              )}
              <button
                onClick={() => navigate('/student/my-applications')}
                className="mt-3 text-blue-600 hover:text-blue-800 text-sm font-medium"
              >
                Xem chi tiết hồ sơ →
              </button>
            </div>
          )}

          {/* Action Button */}
          {canApply && (
            <div className={`rounded-xl shadow-lg p-6 text-white ${
              appStatus === 'NEED_UPDATE' ? 'bg-gradient-to-br from-yellow-500 to-yellow-600' :
              appStatus === 'REJECTED' ? 'bg-gradient-to-br from-orange-500 to-orange-600' :
              appStatus === 'PENDING' ? 'bg-gradient-to-br from-blue-500 to-blue-600' :
              'bg-gradient-to-br from-green-500 to-green-600'
            }`}>
              <h3 className="text-lg font-bold mb-2">
                {appStatus === 'NEED_UPDATE' ? '📝 Cần bổ sung hồ sơ' :
                 appStatus === 'REJECTED' ? '🔄 Nộp lại hồ sơ' :
                 appStatus === 'PENDING' ? '✏️ Chỉnh sửa hồ sơ' :
                 'Sẵn sàng nộp hồ sơ?'}
              </h3>
              <p className="text-sm mb-4 opacity-90">
                {appStatus === 'NEED_UPDATE' ? `Lý do: ${existingApplication?.admin_note || 'Vui lòng bổ sung thêm minh chứng'}` :
                 appStatus === 'REJECTED' ? `Lý do từ chối: ${existingApplication?.admin_note || 'Không đủ điều kiện'}` :
                 appStatus === 'PENDING' ? 'Bạn có thể chỉnh sửa hồ sơ trong thời gian học bổng còn mở' :
                 'Hãy đảm bảo bạn đã đọc kỹ tiêu chí và chuẩn bị đầy đủ minh chứng'}
              </p>
              <Button
                variant="secondary"
                fullWidth
                onClick={handleOpenModal}
              >
                {getButtonText()}
              </Button>
            </div>
          )}

          {/* Đã được duyệt */}
          {cannotApply && (
            <div className="bg-green-50 border border-green-200 rounded-xl p-6">
              <p className="text-green-800 font-medium">
                ✅ {appStatus === 'DISBURSED' ? 'Bạn đã nhận học bổng này' : 'Hồ sơ của bạn đã được duyệt'}
              </p>
            </div>
          )}

          {isDeadlinePassed && (
            <div className="bg-red-50 border border-red-200 rounded-xl p-6">
              <p className="text-red-800 font-medium">⚠️ Đã hết hạn nộp hồ sơ</p>
            </div>
          )}
        </div>
      </div>

      {/* Confirm Modal */}
      <Modal
        isOpen={showConfirmModal}
        onClose={() => setShowConfirmModal(false)}
        title={appStatus ? 'Cập nhật hồ sơ học bổng' : 'Nộp hồ sơ học bổng'}
        size="lg"
      >
        <div className="space-y-6">
          <p className="text-gray-700">
            {appStatus ? 'Cập nhật' : 'Nộp'} hồ sơ cho học bổng <strong>{scholarship.name}</strong>
          </p>

          {/* Minh chứng đính kèm - 4 loại cố định */}
          {loadingDocs ? (
            <div className="text-center py-4 text-gray-500">Đang tải minh chứng...</div>
          ) : (
            <div className="space-y-3">
              <h4 className="font-semibold text-gray-800">📎 Minh chứng đính kèm</h4>
              
              <div className="border rounded-lg divide-y">
                {/* 4 loại minh chứng cố định */}
                {[
                  { type: 'CCCD', label: 'CCCD/CMND', icon: '🪪' },
                  { type: 'BANG_DIEM', label: 'Bảng điểm', icon: '📊' },
                  { type: 'HO_NGHEO', label: 'Giấy xác nhận hoàn cảnh', icon: '📄' },
                  { type: 'KHAC', label: 'Minh chứng khác', icon: '📁' }
                ].map((docType) => {
                  const existingDoc = myDocuments.find(d => d.type === docType.type);
                  return (
                    <div key={docType.type} className="flex items-center gap-3 p-3">
                      <span className="text-lg">{docType.icon}</span>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-800">{docType.label}</p>
                        {existingDoc ? (
                          <p className="text-xs text-green-600 truncate">✓ {existingDoc.file_name}</p>
                        ) : (
                          <p className="text-xs text-gray-400">Chưa có file</p>
                        )}
                      </div>
                      <div className="flex items-center gap-2">
                        {existingDoc ? (
                          <>
                            <a
                              href={`http://localhost:5000${existingDoc.file_url}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-blue-600 hover:text-blue-800 text-sm"
                            >
                              Xem
                            </a>
                            <button
                              onClick={() => handleDeleteDocument(existingDoc.id)}
                              className="text-red-600 hover:text-red-800 text-sm"
                            >
                              Xóa
                            </button>
                          </>
                        ) : (
                          <label className="cursor-pointer text-green-600 hover:text-green-800 text-sm">
                            + Thêm
                            <input
                              type="file"
                              className="hidden"
                              accept="image/*,.pdf"
                              disabled={uploading}
                              onChange={(e) => {
                                if (e.target.files[0]) {
                                  handleFileUpload(e, docType.type);
                                }
                              }}
                            />
                          </label>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
              
              {uploading && (
                <p className="text-sm text-blue-600 text-center">⏳ Đang upload...</p>
              )}
            </div>
          )}

          <div className="flex space-x-3">
            <Button
              variant="secondary"
              fullWidth
              onClick={() => setShowConfirmModal(false)}
            >
              Hủy
            </Button>
            <Button
              variant="success"
              fullWidth
              loading={submitting}
              onClick={handleSubmitApplication}
            >
              {appStatus ? 'Xác nhận cập nhật' : 'Xác nhận nộp hồ sơ'}
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default ScholarshipDetailPage;
