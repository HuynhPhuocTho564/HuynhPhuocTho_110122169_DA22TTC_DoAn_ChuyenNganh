import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { toast } from 'react-toastify';
import applicationService from '../../services/applicationService';
import Button from '../../components/common/Button';
import Badge from '../../components/common/Badge';
import Loading from '../../components/common/Loading';
import Modal from '../../components/common/Modal';

const AdminApplicationDetailPage = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const [application, setApplication] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [reviewData, setReviewData] = useState({ status: '', admin_note: '' });
  const [showDocModal, setShowDocModal] = useState(false);
  const [selectedDoc, setSelectedDoc] = useState(null);
  const [showConfirmModal, setShowConfirmModal] = useState(false);

  useEffect(() => {
    fetchApplication();
  }, [id]);

  const fetchApplication = async () => {
    try {
      setLoading(true);
      const response = await applicationService.getById(id);
      const data = response.data?.data || response.data;
      setApplication(data);
      setReviewData({ status: data?.status || '', admin_note: data?.admin_note || '' });
    } catch (error) {
      toast.error('Không thể tải thông tin hồ sơ');
      navigate('/admin/applications');
    } finally {
      setLoading(false);
    }
  };

  const handleReview = async () => {
    if (!reviewData.status) {
      toast.error('Vui lòng chọn trạng thái');
      return;
    }
    if ((reviewData.status === 'REJECTED' || reviewData.status === 'NEED_UPDATE') && !reviewData.admin_note) {
      toast.error('Vui lòng nhập lý do');
      return;
    }

    // Hiện modal xác nhận
    setShowConfirmModal(true);
  };

  const confirmReview = async () => {
    try {
      setSubmitting(true);
      setShowConfirmModal(false);
      await applicationService.review(id, reviewData.status, reviewData.admin_note);
      toast.success('Xét duyệt thành công!');
      fetchApplication();
    } catch (error) {
      toast.error(error.message);
    } finally {
      setSubmitting(false);
    }
  };

  const getStatusLabel = (status) => {
    const map = {
      APPROVED: 'Duyệt',
      REJECTED: 'Từ chối',
      NEED_UPDATE: 'Yêu cầu bổ sung',
      PENDING: 'Chờ xét',
    };
    return map[status] || status;
  };

  const getStatusBadge = (status) => {
    const map = {
      PENDING: { variant: 'warning', label: '⏳ Chờ duyệt' },
      APPROVED: { variant: 'success', label: '✅ Đã duyệt' },
      REJECTED: { variant: 'danger', label: '❌ Từ chối' },
      NEED_UPDATE: { variant: 'info', label: '📝 Cần bổ sung' },
      DISBURSED: { variant: 'primary', label: '💰 Đã giải ngân' },
    };
    const config = map[status] || map.PENDING;
    return <Badge variant={config.variant}>{config.label}</Badge>;
  };

  if (loading) return <Loading />;
  if (!application) return <div className="text-center py-12">Không tìm thấy hồ sơ</div>;

  const student = application.student || {};

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">Chi tiết Hồ sơ #{id}</h1>
          <p className="text-gray-600 mt-1">{application.scholarship?.name}</p>
        </div>
        <Button variant="outline" onClick={() => navigate('/admin/applications')}>← Quay lại</Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left: Student Info */}
        <div className="lg:col-span-2 space-y-6">
          {/* Student Data */}
          <div className="bg-white rounded-xl shadow-lg p-6">
            <h2 className="text-xl font-bold text-gray-800 mb-4">👤 Thông tin sinh viên</h2>
            <div className="grid grid-cols-2 gap-6">
              <div className="space-y-3">
                <p><strong>Họ tên:</strong> {student.full_name}</p>
                <p><strong>Mã SV:</strong> {student.student_code}</p>
                <p><strong>GPA:</strong> <span className="font-bold text-blue-600">{student.gpa ? parseFloat(student.gpa).toFixed(2) : 'N/A'}</span></p>
                <p><strong>Điểm RL:</strong> <span className="font-bold text-blue-600">{student.drr}</span></p>
                <p><strong>Hoàn cảnh:</strong> {
                  student.poor_cert_type === 'DISABILITY' ? '♿ Khuyết tật' :
                  student.poor_cert_type === 'POOR' ? '📋 Hộ nghèo' :
                  student.poor_cert_type === 'NEAR_POOR' ? '📄 Hộ cận nghèo' :
                  '✅ Bình thường'
                }</p>
              </div>
              <div className="space-y-3">
                <p><strong>Email:</strong> {student.user?.email}</p>
                <p><strong>SĐT:</strong> {student.phone || 'N/A'}</p>
                <p><strong>Lớp:</strong> {student.class_name || 'N/A'}</p>
                <p><strong>Ngân hàng:</strong> {student.bank_name || 'N/A'}</p>
                <p><strong>STK:</strong> {student.bank_number || 'N/A'}</p>
              </div>
            </div>
          </div>

          {/* Documents */}
          <div className="bg-white rounded-xl shadow-lg p-6">
            <h2 className="text-xl font-bold text-gray-800 mb-4">📎 Minh chứng đính kèm</h2>
            {application.documents?.length > 0 ? (
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {application.documents.map((doc) => (
                  <div key={doc.id} className="border rounded-lg p-3 hover:bg-gray-50 cursor-pointer"
                    onClick={() => { setSelectedDoc(doc); setShowDocModal(true); }}>
                    <p className="font-medium text-sm truncate">{doc.file_name}</p>
                    <p className="text-xs text-gray-500">{doc.type}</p>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-500">Chưa có minh chứng nào</p>
            )}
          </div>
        </div>

        {/* Right: Review Panel */}
        <div className="space-y-6">
          {/* Status */}
          <div className="bg-white rounded-xl shadow-lg p-6">
            <h2 className="text-xl font-bold text-gray-800 mb-4">📋 Trạng thái</h2>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-gray-600">Trạng thái:</span>
                {getStatusBadge(application.status)}
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-600">Ngày nộp:</span>
                <span>{new Date(application.submitted_at).toLocaleDateString('vi-VN')}</span>
              </div>
              {application.reviewed_at && (
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Ngày duyệt:</span>
                  <span>{new Date(application.reviewed_at).toLocaleDateString('vi-VN')}</span>
                </div>
              )}
            </div>
          </div>

          {/* Review Form - Chỉ hiện khi chưa APPROVED hoặc DISBURSED */}
          {application.status !== 'APPROVED' && application.status !== 'DISBURSED' ? (
            <div className="bg-white rounded-xl shadow-lg p-6">
              <h2 className="text-xl font-bold text-gray-800 mb-4">✍️ Xét duyệt</h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Quyết định</label>
                  <select value={reviewData.status} onChange={(e) => setReviewData({ ...reviewData, status: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg">
                    <option value="">-- Chọn --</option>
                    <option value="APPROVED">✅ Duyệt</option>
                    <option value="REJECTED">❌ Từ chối</option>
                    <option value="NEED_UPDATE">📝 Yêu cầu bổ sung</option>
                    <option value="PENDING">⏳ Chờ xét</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Ghi chú</label>
                  <textarea value={reviewData.admin_note} onChange={(e) => setReviewData({ ...reviewData, admin_note: e.target.value })}
                    rows={4} className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                    placeholder="Nhập lý do (bắt buộc nếu từ chối/yêu cầu bổ sung)" />
                </div>
                <Button variant="primary" fullWidth onClick={handleReview} loading={submitting}>
                  Xác nhận
                </Button>
              </div>
            </div>
          ) : (
            <div className="bg-green-50 rounded-xl shadow-lg p-6 border border-green-200">
              <h2 className="text-xl font-bold text-green-800 mb-2">✅ Đã hoàn tất</h2>
              <p className="text-green-700">
                {application.status === 'DISBURSED' 
                  ? 'Hồ sơ đã được giải ngân, không thể thay đổi.'
                  : 'Hồ sơ đã được duyệt, không thể thay đổi trạng thái.'}
              </p>
              {application.admin_note && (
                <div className="mt-3 p-3 bg-white rounded-lg">
                  <p className="text-sm text-gray-600"><strong>Ghi chú:</strong> {application.admin_note}</p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Document Modal */}
      <Modal isOpen={showDocModal} onClose={() => setShowDocModal(false)} title="Xem minh chứng" size="lg">
        {selectedDoc && (
          <div className="text-center">
            <p className="mb-4 font-medium">{selectedDoc.file_name}</p>
            {selectedDoc.file_url?.match(/\.(jpg|jpeg|png|gif)$/i) ? (
              <img src={selectedDoc.file_url} alt={selectedDoc.file_name} className="max-w-full mx-auto rounded-lg" />
            ) : (
              <a href={selectedDoc.file_url} target="_blank" rel="noopener noreferrer"
                className="text-blue-600 hover:underline">Tải xuống file</a>
            )}
          </div>
        )}
      </Modal>

      {/* Confirm Review Modal */}
      <Modal isOpen={showConfirmModal} onClose={() => setShowConfirmModal(false)} title="Xác nhận xét duyệt">
        <div className="space-y-4">
          <div className={`p-4 rounded-lg ${
            reviewData.status === 'APPROVED' ? 'bg-green-50 border border-green-200' :
            reviewData.status === 'REJECTED' ? 'bg-red-50 border border-red-200' :
            'bg-yellow-50 border border-yellow-200'
          }`}>
            <p className="font-medium">
              Bạn có chắc chắn muốn <strong>{getStatusLabel(reviewData.status)}</strong> hồ sơ này?
            </p>
            {reviewData.status === 'APPROVED' && (
              <p className="text-sm text-green-700 mt-2">
                ⚠️ Lưu ý: Sau khi duyệt, bạn sẽ không thể thay đổi trạng thái hồ sơ này.
              </p>
            )}
            {reviewData.admin_note && (
              <p className="text-sm text-gray-600 mt-2">
                <strong>Ghi chú:</strong> {reviewData.admin_note}
              </p>
            )}
          </div>
          <div className="flex gap-3 justify-end">
            <Button variant="outline" onClick={() => setShowConfirmModal(false)}>
              Hủy
            </Button>
            <Button 
              variant={reviewData.status === 'APPROVED' ? 'success' : reviewData.status === 'REJECTED' ? 'danger' : 'primary'} 
              onClick={confirmReview} 
              loading={submitting}
            >
              Xác nhận
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default AdminApplicationDetailPage;
