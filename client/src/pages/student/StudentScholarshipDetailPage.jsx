import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { toast } from 'react-toastify';
import scholarshipService from '../../services/scholarshipService';
import applicationService from '../../services/applicationService';
import useAuthStore from '../../store/useAuthStore';
import Button from '../../components/common/Button';
import Badge from '../../components/common/Badge';
import Loading from '../../components/common/Loading';
import Modal from '../../components/common/Modal';
import FileUpload from '../../components/common/FileUpload';

const StudentScholarshipDetailPage = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const { user } = useAuthStore();
  const [scholarship, setScholarship] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [showApplyModal, setShowApplyModal] = useState(false);
  const [uploadFiles, setUploadFiles] = useState([]);

  useEffect(() => {
    fetchScholarship();
  }, [id]);

  const fetchScholarship = async () => {
    try {
      setLoading(true);
      const response = await scholarshipService.getById(id);
      setScholarship(response.data?.data || response.data);
    } catch (error) {
      toast.error('Không thể tải thông tin học bổng');
      navigate('/student/home');
    } finally {
      setLoading(false);
    }
  };

  const handleApply = async () => {
    try {
      setSubmitting(true);
      const response = await applicationService.submit(id);
      const applicationId = response.data?.data?.id || response.data?.id;

      // Upload files if any
      if (uploadFiles.length > 0 && applicationId) {
        await applicationService.uploadDocuments(applicationId, uploadFiles);
      }

      toast.success('Nộp hồ sơ thành công! Vui lòng chờ kết quả xét duyệt.');
      setShowApplyModal(false);
      navigate('/student/my-applications');
    } catch (error) {
      toast.error(error.message);
    } finally {
      setSubmitting(false);
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount);
  };

  if (loading) return <Loading />;
  if (!scholarship) return <div className="text-center py-12">Không tìm thấy học bổng</div>;

  const isOpen = scholarship.status === 'OPEN' && new Date(scholarship.end_date) > new Date();
  const criteria = scholarship.criteria_json || {};

  return (
    <div className="space-y-6">
      <Button variant="outline" onClick={() => navigate('/student/home')}>← Quay lại</Button>

      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-700 rounded-2xl p-8 text-white">
        <div className="flex items-start justify-between">
          <div>
            <Badge variant={isOpen ? 'success' : 'danger'} className="mb-2">
              {isOpen ? '🟢 Đang mở' : '🔴 Đã đóng'}
            </Badge>
            <h1 className="text-3xl font-bold">{scholarship.name}</h1>
            <p className="mt-2 opacity-90">{scholarship.school?.name}</p>
          </div>
          <div className="text-right">
            <p className="text-sm opacity-75">Giá trị mỗi suất</p>
            <p className="text-3xl font-bold">{formatCurrency(scholarship.amount_per_slot)}</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Description */}
          <div className="bg-white rounded-xl shadow-lg p-6">
            <h2 className="text-xl font-bold text-gray-800 mb-4">📝 Mô tả</h2>
            <p className="text-gray-600 whitespace-pre-line">{scholarship.description || 'Chưa có mô tả'}</p>
          </div>

          {/* Criteria */}
          <div className="bg-white rounded-xl shadow-lg p-6">
            <h2 className="text-xl font-bold text-gray-800 mb-4">📋 Tiêu chí xét duyệt</h2>
            <div className="space-y-3">
              {criteria.min_gpa && (
                <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
                  <span className="text-gray-700">GPA tối thiểu</span>
                  <span className="font-bold text-blue-600">{criteria.min_gpa}</span>
                </div>
              )}
              {criteria.min_drr && (
                <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                  <span className="text-gray-700">Điểm rèn luyện tối thiểu</span>
                  <span className="font-bold text-green-600">{criteria.min_drr}</span>
                </div>
              )}
              {criteria.require_poor && (
                <div className="flex items-center justify-between p-3 bg-yellow-50 rounded-lg">
                  <span className="text-gray-700">Yêu cầu hoàn cảnh khó khăn</span>
                  <span className="font-bold text-yellow-600">Bắt buộc</span>
                </div>
              )}
              {!criteria.min_gpa && !criteria.min_drr && !criteria.require_poor && (
                <p className="text-gray-500">Không có tiêu chí đặc biệt</p>
              )}
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Info Card */}
          <div className="bg-white rounded-xl shadow-lg p-6">
            <h2 className="text-xl font-bold text-gray-800 mb-4">ℹ️ Thông tin</h2>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-gray-600">Học kỳ:</span>
                <span className="font-medium">{scholarship.semester} - {scholarship.academic_year}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Số suất:</span>
                <span className="font-medium">{scholarship.slots} suất</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Còn lại:</span>
                <span className="font-medium text-green-600">{scholarship.stats?.remaining_slots || scholarship.slots} suất</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Đã nộp:</span>
                <span className="font-medium">{scholarship.stats?.total_applications || 0} hồ sơ</span>
              </div>
              <hr />
              <div className="flex justify-between">
                <span className="text-gray-600">Bắt đầu:</span>
                <span className="font-medium">{new Date(scholarship.start_date).toLocaleDateString('vi-VN')}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Kết thúc:</span>
                <span className="font-medium text-red-600">{new Date(scholarship.end_date).toLocaleDateString('vi-VN')}</span>
              </div>
            </div>
          </div>

          {/* Apply Button */}
          {isOpen && (
            <Button variant="primary" fullWidth size="lg" onClick={() => setShowApplyModal(true)}>
              📝 Nộp hồ sơ ngay
            </Button>
          )}
        </div>
      </div>

      {/* Apply Modal */}
      <Modal isOpen={showApplyModal} onClose={() => setShowApplyModal(false)} title="Xác nhận nộp hồ sơ" size="lg">
        <div className="space-y-4">
          <div className="bg-blue-50 rounded-lg p-4">
            <h3 className="font-bold text-blue-800 mb-2">📋 Thông tin của bạn sẽ được gửi:</h3>
            <div className="grid grid-cols-2 gap-2 text-sm">
              <p><strong>Họ tên:</strong> {user?.full_name}</p>
              <p><strong>Mã SV:</strong> {user?.student_code}</p>
              <p><strong>GPA:</strong> {user?.gpa?.toFixed(2) || 'N/A'}</p>
              <p><strong>Điểm RL:</strong> {user?.drr || 'N/A'}</p>
            </div>
          </div>

          {/* Kiểm tra thông tin ngân hàng */}
          {(!user?.bank_name || !user?.bank_number) ? (
            <div className="bg-red-50 border border-red-300 rounded-lg p-4">
              <p className="text-red-800 font-bold mb-2">
                ❌ Thiếu thông tin ngân hàng!
              </p>
              <p className="text-red-700 text-sm mb-3">
                Bạn cần cập nhật thông tin ngân hàng (Tên ngân hàng và Số tài khoản) để có thể nhận tiền học bổng.
              </p>
              <Button 
                variant="danger" 
                size="sm" 
                onClick={() => { setShowApplyModal(false); navigate('/student/profile'); }}
              >
                👉 Cập nhật ngay
              </Button>
            </div>
          ) : (
            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <p className="text-green-800 text-sm">
                ✅ <strong>Thông tin ngân hàng:</strong> {user.bank_name} - {user.bank_number}
              </p>
            </div>
          )}

          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <p className="text-yellow-800 text-sm">
              ⚠️ <strong>Lưu ý:</strong> Thông tin sẽ được "đóng băng" tại thời điểm nộp. 
              Hãy đảm bảo thông tin của bạn đã được cập nhật đầy đủ.
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              📎 Upload minh chứng (không bắt buộc)
            </label>
            <FileUpload
              accept=".pdf,.jpg,.jpeg,.png,.doc,.docx"
              multiple={true}
              maxSize={5 * 1024 * 1024}
              onFilesSelected={setUploadFiles}
              label="Chọn file (Bảng điểm, Giấy xác nhận...)"
            />
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t">
            <Button variant="outline" onClick={() => setShowApplyModal(false)}>Hủy</Button>
            <Button 
              variant="primary" 
              onClick={handleApply} 
              loading={submitting}
              disabled={!user?.bank_name || !user?.bank_number}
            >
              Xác nhận nộp hồ sơ
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default StudentScholarshipDetailPage;
