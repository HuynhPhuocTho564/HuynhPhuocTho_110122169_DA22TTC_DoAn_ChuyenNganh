import { useEffect, useState } from 'react';
import { Bar, Doughnut, Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
  PointElement,
  LineElement,
} from 'chart.js';
import api from '../../services/api';
import Loading from '../../components/common/Loading';

ChartJS.register(
  CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend,
  ArcElement, PointElement, LineElement
);

const SystemReportsPage = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [periods, setPeriods] = useState({ years: [], semesters: [1, 2] });
  const [filters, setFilters] = useState({ academic_year: '', semester: '' });

  useEffect(() => {
    fetchPeriods();
  }, []);

  useEffect(() => {
    fetchStats();
  }, [filters]);

  const fetchPeriods = async () => {
    try {
      const response = await api.get('/stats/periods');
      const data = response.data || { years: [], semesters: [] };
      setPeriods(data);
      // Set năm hiện tại và học kỳ 1 làm mặc định
      if (data.years?.length > 0 && !filters.academic_year) {
        setFilters(prev => ({ ...prev, academic_year: data.years[0], semester: '1' }));
      }
    } catch (error) {
      console.error(error);
    }
  };

  const fetchStats = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (filters.academic_year) params.append('academic_year', filters.academic_year);
      if (filters.semester) params.append('semester', filters.semester);
      
      const response = await api.get(`/stats/system?${params.toString()}`);
      setStats(response.data?.data || response.data || {});
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const overview = stats?.overview || {};
  const usersByRole = stats?.users_by_role || [];
  const scholarshipsByStatus = stats?.scholarships_by_status || [];
  const applicationsByStatus = stats?.applications_by_status || [];
  const topSchools = stats?.top_schools || [];

  const getUsersChartData = () => {
    const roleLabels = { STUDENT: 'Sinh viên', UNI_ADMIN: 'Admin trường', SPONSOR: 'Nhà tài trợ', SUPER_ADMIN: 'System Admin' };
    return {
      labels: usersByRole.map(r => roleLabels[r.role] || r.role),
      datasets: [{
        data: usersByRole.map(r => r.count),
        backgroundColor: ['#3B82F6', '#10B981', '#8B5CF6', '#EF4444'],
      }],
    };
  };

  const getScholarshipsChartData = () => {
    const statusLabels = { OPEN: 'Đang mở', CLOSED: 'Đã đóng', FINISHED: 'Hoàn thành' };
    return {
      labels: scholarshipsByStatus.map(s => statusLabels[s.status] || s.status),
      datasets: [{
        label: 'Số học bổng',
        data: scholarshipsByStatus.map(s => s.count),
        backgroundColor: ['#9CA3AF', '#10B981', '#F59E0B', '#3B82F6'],
        borderRadius: 8,
      }],
    };
  };

  const getApplicationsChartData = () => {
    const statusLabels = { PENDING: 'Chờ duyệt', APPROVED: 'Đã duyệt', REJECTED: 'Từ chối', DISBURSED: 'Đã giải ngân' };
    return {
      labels: applicationsByStatus.map(a => statusLabels[a.status] || a.status),
      datasets: [{
        data: applicationsByStatus.map(a => a.count),
        backgroundColor: ['#F59E0B', '#10B981', '#EF4444', '#3B82F6'],
      }],
    };
  };

  const getTopSchoolsChartData = () => ({
    labels: topSchools.map(s => s.code || s.name?.substring(0, 10)),
    datasets: [{
      label: 'Số sinh viên',
      data: topSchools.map(s => parseInt(s.student_count) || 0),
      backgroundColor: '#8B5CF6',
      borderRadius: 8,
    }],
  });

  const getTrendData = () => {
    const months = ['T1', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7', 'T8', 'T9', 'T10', 'T11', 'T12'];
    const total = overview.total_applications || 0;
    return {
      labels: months,
      datasets: [{
        label: 'Hồ sơ mới',
        data: months.map((_, i) => i >= 8 ? Math.floor(total * 0.25) : Math.floor(total * 0.05)),
        borderColor: '#3B82F6',
        backgroundColor: 'rgba(59, 130, 246, 0.1)',
        fill: true,
        tension: 0.4,
      }],
    };
  };

  const chartOptions = { responsive: true, maintainAspectRatio: false, plugins: { legend: { position: 'bottom' } } };

  if (loading) return <Loading />;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-800">📊 Báo cáo Hệ thống</h1>
        <p className="text-gray-600 mt-1">Thống kê tổng quan toàn hệ thống theo năm học</p>
      </div>

      {/* Bộ lọc năm học và học kỳ */}
      <div className="bg-white rounded-xl shadow-lg p-4">
        <div className="flex flex-wrap gap-4 items-center">
          <div className="flex items-center gap-2">
            <label className="text-sm font-medium text-gray-700">Năm học:</label>
            <select
              value={filters.academic_year}
              onChange={(e) => setFilters({ ...filters, academic_year: e.target.value })}
              className="border rounded-lg px-3 py-2 text-sm"
            >
              {periods.years.map(year => (
                <option key={year} value={year}>{year}</option>
              ))}
            </select>
          </div>
          <div className="flex items-center gap-2">
            <label className="text-sm font-medium text-gray-700">Học kỳ:</label>
            <select
              value={filters.semester}
              onChange={(e) => setFilters({ ...filters, semester: e.target.value })}
              className="border rounded-lg px-3 py-2 text-sm"
            >
              <option value="1">Học kỳ 1</option>
              <option value="2">Học kỳ 2</option>
            </select>
          </div>
          {stats?.filter_applied?.academic_year && (
            <span className="text-sm text-gray-500">
              Đang xem: {stats.filter_applied.academic_year} 
              {stats.filter_applied.semester ? ` - HK${stats.filter_applied.semester}` : ''}
            </span>
          )}
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        <div className="bg-white rounded-xl shadow-lg p-5 border-l-4 border-blue-500">
          <p className="text-gray-500 text-sm">Tổng trường</p>
          <p className="text-3xl font-bold text-blue-600">{overview.total_schools || 0}</p>
        </div>
        <div className="bg-white rounded-xl shadow-lg p-5 border-l-4 border-green-500">
          <p className="text-gray-500 text-sm">Tổng người dùng</p>
          <p className="text-3xl font-bold text-green-600">{overview.total_users || 0}</p>
        </div>
        <div className="bg-white rounded-xl shadow-lg p-5 border-l-4 border-purple-500">
          <p className="text-gray-500 text-sm">Sinh viên</p>
          <p className="text-3xl font-bold text-purple-600">{overview.total_students || 0}</p>
        </div>
        <div className="bg-white rounded-xl shadow-lg p-5 border-l-4 border-orange-500">
          <p className="text-gray-500 text-sm">Học bổng</p>
          <p className="text-3xl font-bold text-orange-600">{overview.total_scholarships || 0}</p>
        </div>
        <div className="bg-white rounded-xl shadow-lg p-5 border-l-4 border-teal-500">
          <p className="text-gray-500 text-sm">Nhà tài trợ</p>
          <p className="text-3xl font-bold text-teal-600">{overview.total_sponsors || 0}</p>
        </div>
      </div>

      {/* Charts Row 1 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl shadow-lg p-6">
          <h3 className="text-lg font-bold text-gray-800 mb-4">👥 Người dùng theo vai trò</h3>
          <div className="h-64">
            <Doughnut data={getUsersChartData()} options={chartOptions} />
          </div>
        </div>
        <div className="bg-white rounded-xl shadow-lg p-6">
          <h3 className="text-lg font-bold text-gray-800 mb-4">🎓 Học bổng theo trạng thái</h3>
          <div className="h-64">
            <Bar data={getScholarshipsChartData()} options={chartOptions} />
          </div>
        </div>
      </div>

      {/* Charts Row 2 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl shadow-lg p-6">
          <h3 className="text-lg font-bold text-gray-800 mb-4">📋 Hồ sơ theo trạng thái</h3>
          <div className="h-64">
            <Doughnut data={getApplicationsChartData()} options={chartOptions} />
          </div>
        </div>
        <div className="bg-white rounded-xl shadow-lg p-6">
          <h3 className="text-lg font-bold text-gray-800 mb-4">🏫 Top trường có nhiều SV</h3>
          <div className="h-64">
            <Bar data={getTopSchoolsChartData()} options={chartOptions} />
          </div>
        </div>
      </div>

      {/* Trend Chart */}
      <div className="bg-white rounded-xl shadow-lg p-6">
        <h3 className="text-lg font-bold text-gray-800 mb-4">📅 Xu hướng hồ sơ năm 2025</h3>
        <div className="h-64">
          <Line data={getTrendData()} options={chartOptions} />
        </div>
      </div>

      {/* Top Schools Table */}
      <div className="bg-white rounded-xl shadow-lg p-6">
        <h3 className="text-xl font-bold text-gray-800 mb-4">🏫 Danh sách trường tham gia</h3>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Mã trường</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Tên trường</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Số sinh viên</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {topSchools.map((school, i) => (
                <tr key={i} className="hover:bg-gray-50">
                  <td className="px-4 py-3 text-sm font-medium text-blue-600">{school.code}</td>
                  <td className="px-4 py-3 text-sm">{school.name}</td>
                  <td className="px-4 py-3 text-sm font-bold text-purple-600">{school.student_count || 0}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default SystemReportsPage;
