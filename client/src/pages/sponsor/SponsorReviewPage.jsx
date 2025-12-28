import { useEffect, useState } from 'react';
import { toast } from 'react-toastify';
import api from '../../services/api';
import Button from '../../components/common/Button';
import Badge from '../../components/common/Badge';
import Loading from '../../components/common/Loading';
import Modal from '../../components/common/Modal';

const SponsorReviewPage = () => {
  const [applications, setApplications] = useState([]);
  const [scholarships, setScholarships] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedApp, setSelectedApp] = useState(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [filter, setFilter] = useState({ scholarship_id: '', status: 'SHORTLISTED' });

  useEffect(() => {
    fetchData();
  }, [filter]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [appsRes, scholsRes] = await Promise.all([
        api.get('/sponsor/applications', { params: filter }).catch(() => ({ data: { data: [] } })),
        api.get('/sponsor/projects').catch(() => ({ data: { data: [] } }))
      ]);
      setApplications(appsRes.data?.data || []);
      setScholarships(scholsRes.data?.data || []);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleAction = async (appId, action, note = '') => {
    try {
      await api.put(`/sponsor/applications/${appId}/${action}`, { note });
      toast.success(action === 'approve' ? 'Đã duyệt hồ sơ!' : 
                   action === 'reject' ? 'Đã từ chối hồ sơ!' : 'Đã yêu cầu phỏng vấn!');
      fetchData();
      setShowDetailModal(false);
    } catch (error) {
      toast.error(error.message);
    }
  };

  const viewDetail = (app) => {
    setSelectedApp(app);
    setShowDetailModal(true);
  };

  const getStatusBadge = (status) => {
    const map = {
      SHORTLISTED: { variant: 'info', label: '📋 Đề cử' },
      SPONSOR_APPROVED: { variant: 'success', label: '✅ Đã duyệt' },
      SPONSOR_REJECTED: { variant: 'danger', label: '❌ Từ chối' },
      INTERVIEW_REQUIRED: { variant: 'warning', label: '💬 Cần phỏng vấn' },
    };
    const config = map[status] || { variant: 'secondary', label: status };
    return <Badge variant={config.variant}>{config.label}</Badge>;
  };

  if (loading) return <Loading />;


  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-800">Xét duyệt Hồ sơ</h1>
        <p className="text-gray-600 mt-1">Duyệt danh sách sinh viên được trường đề cử</p>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow p-4">
        <div className="flex flex-wrap gap-4">
          <select value={filter.scholarship_id} 
            onChange={(e) => setFilter({...filter, scholarship_id: e.target.value})}
            className="px-4 py-2 border rounded-lg">
            <option value="">Tất cả học bổng</option>
            {scholarships.map(s => (
              <option key={s.id} value={s.id}>{s.name}</option>
            ))}
          </select>
          <select value={filter.status}
            onChange={(e) => setFilter({...filter, status: e.target.value})}
            className="px-4 py-2 border rounded-lg">
            <option value="">Tất cả trạng thái</option>
            <option value="SHORTLISTED">Đề cử (Chờ duyệt)</option>
            <option value="SPONSOR_APPROVED">Đã duyệt</option>
            <option value="SPONSOR_REJECTED">Đã từ chối</option>
            <option value="INTERVIEW_REQUIRED">Cần phỏng vấn</option>
          </select>
          <Button variant="outline" onClick={fetchData}>🔄 Làm mới</Button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-4 gap-4">
        <div className="bg-blue-50 rounded-lg p-4 text-center">
          <p className="text-2xl font-bold text-blue-600">{applications.length}</p>
          <p className="text-sm text-gray-600">Tổng hồ sơ</p>
        </div>
        <div className="bg-yellow-50 rounded-lg p-4 text-center">
          <p className="text-2xl font-bold text-yellow-600">
            {applications.filter(a => a.sponsor_status === 'SHORTLISTED').length}
          </p>
          <p className="text-sm text-gray-600">Chờ duyệt</p>
        </div>
        <div className="bg-green-50 rounded-lg p-4 text-center">
          <p className="text-2xl font-bold text-green-600">
            {applications.filter(a => a.sponsor_status === 'SPONSOR_APPROVED').length}
          </p>
          <p className="text-sm text-gray-600">Đã duyệt</p>
        </div>
        <div className="bg-red-50 rounded-lg p-4 text-center">
          <p className="text-2xl font-bold text-red-600">
            {applications.filter(a => a.sponsor_status === 'SPONSOR_REJECTED').length}
          </p>
          <p className="text-sm text-gray-600">Từ chối</p>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Sinh viên</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Học bổng</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">GPA</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Hoàn cảnh</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Điểm trường</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Trạng thái</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Thao tác</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {applications.map(app => (
              <tr key={app.id} className="hover:bg-gray-50">
                <td className="px-4 py-3">
                  <p className="font-medium">{app.snapshot_data?.full_name || app.student?.full_name}</p>
                  <p className="text-sm text-gray-500">{app.snapshot_data?.student_code}</p>
                </td>
                <td className="px-4 py-3 text-sm">{app.scholarship?.name}</td>
                <td className="px-4 py-3 text-sm font-bold text-blue-600">
                  {parseFloat(app.snapshot_data?.gpa || 0).toFixed(2)}
                </td>
                <td className="px-4 py-3 text-sm">{app.snapshot_data?.circumstance || 'Bình thường'}</td>
                <td className="px-4 py-3 text-sm font-bold">{app.system_score || 'N/A'}</td>
                <td className="px-4 py-3">{getStatusBadge(app.sponsor_status || 'SHORTLISTED')}</td>
                <td className="px-4 py-3">
                  <Button size="sm" onClick={() => viewDetail(app)}>Xem chi tiết</Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {applications.length === 0 && (
          <div className="text-center py-12 text-gray-500">
            Chưa có hồ sơ nào được đề cử
          </div>
        )}
      </div>

      {/* Detail Modal */}
      <Modal isOpen={showDetailModal} onClose={() => setShowDetailModal(false)} 
        title="Chi tiết hồ sơ sinh viên" size="lg">
        {selectedApp && (
          <div className="space-y-6">
            {/* Student Info */}
            <div className="bg-gray-50 rounded-lg p-4">
              <h4 className="font-bold text-lg mb-3">👤 Thông tin sinh viên</h4>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div><span className="text-gray-500">Họ tên:</span> <strong>{selectedApp.snapshot_data?.full_name}</strong></div>
                <div><span className="text-gray-500">MSSV:</span> <strong>{selectedApp.snapshot_data?.student_code}</strong></div>
                <div><span className="text-gray-500">GPA:</span> <strong className="text-blue-600">{selectedApp.snapshot_data?.gpa}</strong></div>
                <div><span className="text-gray-500">ĐRL:</span> <strong>{selectedApp.snapshot_data?.drr}</strong></div>
                <div><span className="text-gray-500">Hoàn cảnh:</span> <strong>{selectedApp.snapshot_data?.circumstance || 'Bình thường'}</strong></div>
                <div><span className="text-gray-500">Điểm đánh giá:</span> <strong>{selectedApp.system_score}</strong></div>
              </div>
            </div>

            {/* Documents */}
            <div className="bg-blue-50 rounded-lg p-4">
              <h4 className="font-bold text-lg mb-3">📎 Minh chứng</h4>
              <div className="space-y-2">
                {selectedApp.documents?.length > 0 ? (
                  selectedApp.documents.map((doc, i) => (
                    <a key={i} href={doc.url} target="_blank" rel="noreferrer"
                      className="block p-2 bg-white rounded hover:bg-gray-50">
                      📄 {doc.name}
                    </a>
                  ))
                ) : (
                  <p className="text-gray-500">Chưa có minh chứng đính kèm</p>
                )}
              </div>
            </div>

            {/* Essay */}
            {selectedApp.essay && (
              <div className="bg-yellow-50 rounded-lg p-4">
                <h4 className="font-bold text-lg mb-3">📝 Bài luận</h4>
                <p className="text-gray-700 whitespace-pre-wrap">{selectedApp.essay}</p>
              </div>
            )}

            {/* Actions */}
            <div className="flex gap-3 pt-4 border-t">
              <Button variant="success" onClick={() => handleAction(selectedApp.id, 'approve')}>
                ✅ Duyệt
              </Button>
              <Button variant="danger" onClick={() => handleAction(selectedApp.id, 'reject')}>
                ❌ Từ chối
              </Button>
              <Button variant="warning" onClick={() => handleAction(selectedApp.id, 'interview')}>
                💬 Yêu cầu phỏng vấn
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default SponsorReviewPage;
