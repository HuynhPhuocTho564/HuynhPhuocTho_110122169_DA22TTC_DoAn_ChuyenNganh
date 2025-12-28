import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { toast } from 'react-toastify';
import applicationService from '../../services/applicationService';
import scholarshipService from '../../services/scholarshipService';
import Button from '../../components/common/Button';
import Badge from '../../components/common/Badge';
import Loading from '../../components/common/Loading';

const AdminApplicationsPage = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [applications, setApplications] = useState([]);
  const [scholarships, setScholarships] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    status: searchParams.get('status') || '',
    scholarship_id: '',
    search: '',
    sortBy: 'system_score',
  });

  useEffect(() => {
    fetchData();
  }, [filters]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [appsRes, scholsRes] = await Promise.all([
        applicationService.getAll(filters),
        scholarshipService.getAll(),
      ]);
      const apps = appsRes.data?.data?.applications || appsRes.data?.applications || [];
      const schols = scholsRes.data?.data?.scholarships || scholsRes.data?.scholarships || [];
      setApplications(Array.isArray(apps) ? apps : []);
      setScholarships(Array.isArray(schols) ? schols : []);
    } catch (error) {
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
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

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">Xét duyệt Hồ sơ</h1>
          <p className="text-gray-600 mt-1">Duyệt và quản lý hồ sơ học bổng</p>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        {[
          { label: 'Tổng', value: applications.length, color: 'blue' },
          { label: 'Chờ duyệt', value: applications.filter((a) => a.status === 'PENDING').length, color: 'yellow' },
          { label: 'Đã duyệt', value: applications.filter((a) => a.status === 'APPROVED').length, color: 'green' },
          { label: 'Từ chối', value: applications.filter((a) => a.status === 'REJECTED').length, color: 'red' },
          { label: 'Đã giải ngân', value: applications.filter((a) => a.status === 'DISBURSED').length, color: 'purple' },
        ].map((stat, i) => (
          <div key={i} className="bg-white rounded-lg shadow p-4 text-center">
            <p className="text-gray-600 text-sm">{stat.label}</p>
            <p className={`text-2xl font-bold text-${stat.color}-600`}>{stat.value}</p>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow p-4">
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          <input type="text" placeholder="Tìm theo tên, mã SV..." value={filters.search}
            onChange={(e) => setFilters({ ...filters, search: e.target.value })}
            className="px-4 py-2 border border-gray-300 rounded-lg" />
          <select value={filters.scholarship_id} onChange={(e) => setFilters({ ...filters, scholarship_id: e.target.value })}
            className="px-4 py-2 border border-gray-300 rounded-lg">
            <option value="">Tất cả học bổng</option>
            {scholarships.map((s) => (<option key={s.id} value={s.id}>{s.name}</option>))}
          </select>
          <select value={filters.status} onChange={(e) => setFilters({ ...filters, status: e.target.value })}
            className="px-4 py-2 border border-gray-300 rounded-lg">
            <option value="">Tất cả trạng thái</option>
            <option value="PENDING">Chờ duyệt</option>
            <option value="APPROVED">Đã duyệt</option>
            <option value="REJECTED">Từ chối</option>
            <option value="DISBURSED">Đã giải ngân</option>
          </select>
          <select value={filters.sortBy} onChange={(e) => setFilters({ ...filters, sortBy: e.target.value })}
            className="px-4 py-2 border border-gray-300 rounded-lg">
            <option value="system_score">Điểm cao → thấp</option>
            <option value="submitted_at">Mới nhất</option>
          </select>
          <Button variant="outline" onClick={fetchData}>🔄 Làm mới</Button>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Mã SV</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Họ tên</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Học bổng</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">GPA</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">ĐRL</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Trạng thái</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Ngày nộp</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Thao tác</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {applications.map((app) => (
              <tr key={app.id} className="hover:bg-gray-50">
                <td className="px-4 py-3 text-sm font-medium">{app.snapshot_data?.student_code || app.student?.student_code}</td>
                <td className="px-4 py-3 text-sm">{app.snapshot_data?.full_name || app.student?.full_name}</td>
                <td className="px-4 py-3 text-sm"><div className="max-w-[150px] truncate">{app.scholarship?.name}</div></td>
                <td className="px-4 py-3 text-sm">{app.snapshot_data?.gpa ? parseFloat(app.snapshot_data.gpa).toFixed(2) : 'N/A'}</td>
                <td className="px-4 py-3 text-sm">{app.snapshot_data?.drr || 'N/A'}</td>
                <td className="px-4 py-3">{getStatusBadge(app.status)}</td>
                <td className="px-4 py-3 text-sm text-gray-500">{new Date(app.submitted_at).toLocaleDateString('vi-VN')}</td>
                <td className="px-4 py-3">
                  <Button size="sm" variant="primary" onClick={() => navigate(`/admin/applications/${app.id}`)}>
                    Xem & Duyệt
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {applications.length === 0 && <div className="text-center py-12 text-gray-500">Không có hồ sơ nào</div>}
      </div>
    </div>
  );
};

export default AdminApplicationsPage;
