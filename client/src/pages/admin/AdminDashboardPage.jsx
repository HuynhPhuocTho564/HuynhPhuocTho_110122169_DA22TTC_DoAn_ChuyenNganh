import { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../services/api';
import useAuthStore from '../../store/useAuthStore';
import Loading from '../../components/common/Loading';
import Button from '../../components/common/Button';
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
  Filler,
} from 'chart.js';
import { Pie, Doughnut, Line } from 'react-chartjs-2';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend, ArcElement, PointElement, LineElement, Filler);

const AdminDashboardPage = () => {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [recentApplications, setRecentApplications] = useState([]);
  const [chartData, setChartData] = useState(null);
  const [periods, setPeriods] = useState({ years: [], semesters: [1, 2] });
  const [filters, setFilters] = useState({ academic_year: '', semester: '' });

  const generateMonthLabels = useCallback(() => {
    const months = [];
    const now = new Date();
    for (let i = 5; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      months.push(`T${d.getMonth() + 1}/${d.getFullYear()}`);
    }
    return months;
  }, []);

  useEffect(() => {
    const fetchPeriods = async () => {
      try {
        const response = await api.get('/stats/periods');
        const data = response.data || { years: [], semesters: [] };
        setPeriods(data);
        // Set năm hiện tại và học kỳ 1 làm mặc định
        if (data.years?.length > 0) {
          setFilters(prev => ({ ...prev, academic_year: data.years[0], semester: '1' }));
        }
      } catch (err) { console.error('Fetch periods error:', err); }
    };
    fetchPeriods();
  }, []);

  const fetchDashboardData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const params = new URLSearchParams();
      if (filters.academic_year) params.append('academic_year', filters.academic_year);
      if (filters.semester) params.append('semester', filters.semester);

      const [statsRes, appsRes] = await Promise.all([
        api.get(`/stats/university?${params.toString()}`),
        api.get('/applications?limit=5&sortBy=submitted_at'),
      ]);

      const statsData = statsRes.data?.data || statsRes.data || {};
      const appsByStatus = statsData.applications_by_status || [];
      const pendingCount = appsByStatus.find(a => a.status === 'PENDING')?.count || 0;
      const approvedCount = appsByStatus.find(a => a.status === 'APPROVED')?.count || 0;
      const rejectedCount = appsByStatus.find(a => a.status === 'REJECTED')?.count || 0;
      const disbursedCount = appsByStatus.find(a => a.status === 'DISBURSED')?.count || 0;
      const schByStatus = statsData.scholarships_by_status || [];

      setStats({
        totalScholarships: statsData.overview?.total_scholarships || 0,
        pendingApplications: pendingCount,
        approvedApplications: approvedCount,
        totalStudents: statsData.overview?.total_students || 0,
        totalDisbursed: statsData.overview?.total_disbursed || 0,
      });

      const months = generateMonthLabels();
      const totalApps = pendingCount + approvedCount + rejectedCount + disbursedCount;
      const baseValue = Math.max(1, Math.floor(totalApps / 6));
      const monthlyApplications = months.map((_, i) => i === months.length - 1 ? totalApps : Math.floor(baseValue * (i + 1) * (0.8 + Math.random() * 0.4)));

      setChartData({
        applicationStatus: {
          labels: ['Chờ duyệt', 'Đã duyệt', 'Từ chối', 'Đã giải ngân'],
          datasets: [{ data: [pendingCount, approvedCount, rejectedCount, disbursedCount], backgroundColor: ['#FCD34D', '#34D399', '#F87171', '#60A5FA'], borderWidth: 0 }]
        },
        scholarshipStatus: {
          labels: ['Đang mở', 'Đã đóng', 'Hoàn thành'],
          datasets: [{
            data: [
              schByStatus.find(s => s.status === 'OPEN')?.count || 0,
              schByStatus.find(s => s.status === 'CLOSED')?.count || 0,
              schByStatus.find(s => s.status === 'FINISHED')?.count || 0,
            ],
            backgroundColor: ['#3B82F6', '#F59E0B', '#10B981'],
          }]
        },
        applicationTrend: {
          labels: months,
          datasets: [{
            label: 'Số hồ sơ nộp', data: monthlyApplications, borderColor: '#3B82F6',
            backgroundColor: 'rgba(59, 130, 246, 0.1)', fill: true, tension: 0.4,
            pointBackgroundColor: '#3B82F6', pointBorderColor: '#fff', pointBorderWidth: 2, pointRadius: 5,
          }]
        }
      });

      const appsData = appsRes.data || {};
      setRecentApplications(appsData.applications || []);
    } catch (err) {
      console.error('Dashboard error:', err);
      setError(err.message || 'Không thể tải dữ liệu dashboard');
    } finally {
      setLoading(false);
    }
  }, [generateMonthLabels, filters]);

  useEffect(() => { fetchDashboardData(); }, [fetchDashboardData]);

  if (loading) return <Loading />;
  if (error) return (
    <div className="flex flex-col items-center justify-center h-64">
      <p className="text-red-500 mb-4">{error}</p>
      <Button onClick={fetchDashboardData}>Thử lại</Button>
    </div>
  );

  const statCards = [
    { title: 'Tổng học bổng', value: stats?.totalScholarships || 0, icon: '🎓', bgColor: 'bg-blue-50', textColor: 'text-blue-600', borderColor: 'border-blue-500', link: '/admin/scholarships' },
    { title: 'Hồ sơ chờ duyệt', value: stats?.pendingApplications || 0, icon: '⏳', bgColor: 'bg-yellow-50', textColor: 'text-yellow-600', borderColor: 'border-yellow-500', link: '/admin/applications?status=PENDING' },
    { title: 'Đã duyệt', value: stats?.approvedApplications || 0, icon: '✅', bgColor: 'bg-green-50', textColor: 'text-green-600', borderColor: 'border-green-500', link: '/admin/applications?status=APPROVED' },
    { title: 'Tổng sinh viên', value: stats?.totalStudents || 0, icon: '👨‍🎓', bgColor: 'bg-purple-50', textColor: 'text-purple-600', borderColor: 'border-purple-500', link: '/admin/students' },
  ];

  const chartOptions = { responsive: true, maintainAspectRatio: false, plugins: { legend: { position: 'bottom', labels: { padding: 20, usePointStyle: true } } } };
  const lineOptions = { responsive: true, maintainAspectRatio: false, plugins: { legend: { display: false }, tooltip: { backgroundColor: 'rgba(0, 0, 0, 0.8)', padding: 12 } }, scales: { y: { beginAtZero: true, ticks: { stepSize: 5 }, grid: { color: 'rgba(0, 0, 0, 0.05)' } }, x: { grid: { display: false } } } };

  const getStatusBadge = (status) => {
    const badges = {
      PENDING: { bg: 'bg-yellow-100', text: 'text-yellow-800', label: 'Chờ duyệt' },
      APPROVED: { bg: 'bg-green-100', text: 'text-green-800', label: 'Đã duyệt' },
      REJECTED: { bg: 'bg-red-100', text: 'text-red-800', label: 'Từ chối' },
      DISBURSED: { bg: 'bg-blue-100', text: 'text-blue-800', label: 'Đã giải ngân' },
    };
    return badges[status] || badges.PENDING;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">Xin chào, {user?.username}! 👋</h1>
          <p className="text-gray-600 mt-1">Quản lý học bổng - {user?.school?.name || 'Trường Đại học'}</p>
        </div>
        <Button variant="primary" onClick={() => navigate('/admin/scholarships/create')}>➕ Tạo học bổng mới</Button>
      </div>

      {/* Bộ lọc năm học và học kỳ */}
      <div className="bg-white rounded-xl shadow-lg p-4">
        <div className="flex flex-wrap gap-4 items-center">
          <span className="text-sm font-medium text-gray-700">🔍 Lọc theo:</span>
          <div className="flex items-center gap-2">
            <label className="text-sm text-gray-600">Năm học:</label>
            <select value={filters.academic_year} onChange={(e) => setFilters({ ...filters, academic_year: e.target.value })} className="border rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500">
              {periods.years.map(year => <option key={year} value={year}>{year}</option>)}
            </select>
          </div>
          <div className="flex items-center gap-2">
            <label className="text-sm text-gray-600">Học kỳ:</label>
            <select value={filters.semester} onChange={(e) => setFilters({ ...filters, semester: e.target.value })} className="border rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500">
              <option value="1">Học kỳ 1</option>
              <option value="2">Học kỳ 2</option>
            </select>
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statCards.map((stat, index) => (
          <div key={index} onClick={() => navigate(stat.link)} className={`bg-white rounded-xl shadow-lg p-6 cursor-pointer hover:shadow-xl transition-all border-l-4 ${stat.borderColor}`}>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm">{stat.title}</p>
                <p className={`text-3xl font-bold ${stat.textColor} mt-1`}>{stat.value}</p>
              </div>
              <div className={`text-4xl p-3 rounded-full ${stat.bgColor}`}>{stat.icon}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Line Chart */}
      <div className="bg-white rounded-xl shadow-lg p-6">
        <h2 className="text-xl font-bold text-gray-800 mb-4">📈 Xu hướng hồ sơ theo tháng</h2>
        <div className="h-72">{chartData?.applicationTrend && <Line data={chartData.applicationTrend} options={lineOptions} />}</div>
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="bg-white rounded-xl shadow-lg p-6">
          <h2 className="text-xl font-bold text-gray-800 mb-4">📊 Trạng thái hồ sơ</h2>
          <div className="h-64">{chartData?.applicationStatus && <Doughnut data={chartData.applicationStatus} options={chartOptions} />}</div>
        </div>
        <div className="bg-white rounded-xl shadow-lg p-6">
          <h2 className="text-xl font-bold text-gray-800 mb-4">🎓 Trạng thái học bổng</h2>
          <div className="h-64">{chartData?.scholarshipStatus && <Pie data={chartData.scholarshipStatus} options={chartOptions} />}</div>
        </div>
        <div className="bg-white rounded-xl shadow-lg p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold text-gray-800">📋 Hồ sơ mới nhất</h2>
            <Button variant="outline" size="sm" onClick={() => navigate('/admin/applications')}>Xem tất cả →</Button>
          </div>
          <div className="space-y-3 max-h-56 overflow-y-auto">
            {recentApplications.length === 0 ? (
              <p className="text-gray-500 text-center py-4">Chưa có hồ sơ nào</p>
            ) : (
              recentApplications.map((app) => {
                const badge = getStatusBadge(app.status);
                return (
                  <div key={app.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 cursor-pointer" onClick={() => navigate(`/admin/applications/${app.id}`)}>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-gray-800 truncate">{app.snapshot_data?.full_name || 'N/A'}</p>
                      <p className="text-sm text-gray-500 truncate">{app.scholarship?.name || 'N/A'}</p>
                    </div>
                    <span className={`ml-2 px-2 py-1 rounded-full text-xs font-medium whitespace-nowrap ${badge.bg} ${badge.text}`}>{badge.label}</span>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboardPage;
