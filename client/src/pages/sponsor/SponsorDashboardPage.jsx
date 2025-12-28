import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
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
import { Bar, Doughnut, Line } from 'react-chartjs-2';
import api from '../../services/api';
import useAuthStore from '../../store/useAuthStore';
import Loading from '../../components/common/Loading';

ChartJS.register(
  CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend,
  ArcElement, PointElement, LineElement
);

const SponsorDashboardPage = () => {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const [stats, setStats] = useState({});
  const [loading, setLoading] = useState(true);
  const [pendingReviews, setPendingReviews] = useState([]);
  const [scholarships, setScholarships] = useState([]);
  const [recentRecipients, setRecentRecipients] = useState([]);
  const [projects, setProjects] = useState([]);
  const [periods, setPeriods] = useState({ years: [], semesters: [1, 2] });
  const [filters, setFilters] = useState({ academic_year: '', semester: '' });

  useEffect(() => {
    fetchPeriods();
  }, []);

  useEffect(() => {
    fetchData();
  }, [filters]);

  const fetchPeriods = async () => {
    try {
      const response = await api.get('/stats/periods');
      // api.js đã unwrap response.data, nên response chính là { success, data, message }
      const data = response.data || { years: [], semesters: [] };
      setPeriods(data);
      // Set năm hiện tại và học kỳ 1 làm mặc định
      if (data.years?.length > 0 && !filters.academic_year) {
        setFilters(prev => ({ ...prev, academic_year: data.years[0], semester: '1' }));
      }
    } catch (error) {
      console.error('Fetch periods error:', error);
    }
  };

  const fetchData = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (filters.academic_year) params.append('academic_year', filters.academic_year);
      if (filters.semester) params.append('semester', filters.semester);

      const [statsRes, reviewsRes, projectsRes] = await Promise.all([
        api.get(`/stats/sponsor?${params.toString()}`).catch(() => null),
        api.get('/sponsor/pending-reviews').catch(() => null),
        api.get('/sponsor/projects').catch(() => null),
      ]);

      // api.js đã unwrap response.data, nên statsRes = { success, data, message }
      // statsRes.data = { overview, scholarships, recent_recipients }
      const statsData = statsRes?.data?.overview || {};
      
      setStats({
        totalFunds: statsData.total_funds || 0,
        totalSponsored: statsData.total_contributed || 0,
        totalDisbursed: statsData.total_disbursed || 0,
        totalRecipients: statsData.total_recipients || 0,
        totalScholarships: statsData.total_scholarships || 0,
      });

      setScholarships(statsRes?.data?.scholarships || []);
      setRecentRecipients(statsRes?.data?.recent_recipients || []);
      setPendingReviews(reviewsRes?.data || []);
      setProjects(projectsRes?.data || []);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const getSchoolDistributionData = () => {
    const schoolMap = {};
    projects.forEach((fund) => {
      fund.scholarships?.forEach((s) => {
        const schoolName = s.school?.name || fund.school?.name || 'Khác';
        schoolMap[schoolName] = (schoolMap[schoolName] || 0) + 1;
      });
    });
    const labels = Object.keys(schoolMap);
    const data = Object.values(schoolMap);
    return {
      labels: labels.length > 0 ? labels : ['Chưa có dữ liệu'],
      datasets: [{
        data: data.length > 0 ? data : [1],
        backgroundColor: ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#EC4899'],
        borderWidth: 0,
      }],
    };
  };

  const getScholarshipStatusData = () => {
    const statusMap = { OPEN: 0, CLOSED: 0, FINISHED: 0 };
    scholarships.forEach((s) => { if (statusMap[s.status] !== undefined) statusMap[s.status]++; });
    return {
      labels: ['Đang mở', 'Đã đóng', 'Hoàn thành'],
      datasets: [{
        label: 'Số học bổng',
        data: Object.values(statusMap),
        backgroundColor: ['#10B981', '#F59E0B', '#3B82F6'],
        borderRadius: 8,
      }],
    };
  };

  const getFundValueData = () => {
    // Nhóm học bổng theo fund_name và tính tổng quỹ
    const fundMap = {};
    scholarships.forEach((s) => {
      const fundName = s.fund_name || 'Khác';
      if (!fundMap[fundName]) {
        fundMap[fundName] = { total: 0, disbursed: 0 };
      }
      // Tổng quỹ = amount_per_slot * slots
      fundMap[fundName].total += (parseFloat(s.amount_per_slot) || 0) * (parseInt(s.slots) || 0);
    });
    
    // Tính đã giải ngân từ recentRecipients (sử dụng fund_name trực tiếp)
    recentRecipients.forEach((r) => {
      const fundName = r.fund_name || 'Khác';
      if (fundMap[fundName]) {
        fundMap[fundName].disbursed += parseFloat(r.amount) || 0;
      }
    });

    const labels = Object.keys(fundMap).slice(0, 5).map(name => name.substring(0, 20));
    const totalAmounts = Object.values(fundMap).slice(0, 5).map(f => f.total);
    const disbursedAmounts = Object.values(fundMap).slice(0, 5).map(f => f.disbursed);
    
    return {
      labels: labels.length > 0 ? labels : ['Chưa có dữ liệu'],
      datasets: [
        { label: 'Tổng quỹ', data: totalAmounts.length > 0 ? totalAmounts : [0], backgroundColor: '#3B82F6', borderRadius: 4 },
        { label: 'Đã giải ngân', data: disbursedAmounts.length > 0 ? disbursedAmounts : [0], backgroundColor: '#10B981', borderRadius: 4 },
      ],
    };
  };

  const getMonthlyRecipientsData = () => {
    const months = ['T1', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7', 'T8', 'T9', 'T10', 'T11', 'T12'];
    const total = stats.totalRecipients || 0;
    const data = months.map((_, i) => i < 6 ? 0 : (i === 8 || i === 9) ? Math.floor(total * 0.4) : Math.floor(total * 0.1));
    return {
      labels: months,
      datasets: [{
        label: 'Sinh viên nhận HB',
        data,
        borderColor: '#8B5CF6',
        backgroundColor: 'rgba(139, 92, 246, 0.1)',
        fill: true,
        tension: 0.4,
      }],
    };
  };

  const chartOptions = { responsive: true, maintainAspectRatio: false, plugins: { legend: { position: 'bottom', labels: { padding: 20, usePointStyle: true } } } };
  const barOptions = { ...chartOptions, scales: { y: { beginAtZero: true, ticks: { callback: (v) => v >= 1000000 ? `${(v / 1000000).toFixed(0)}M` : v } } } };

  if (loading) return <Loading />;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-purple-600 to-indigo-600 rounded-2xl p-6 text-white">
        <h1 className="text-3xl font-bold">Xin chào, {user?.full_name || 'Nhà tài trợ'}! 👋</h1>
        <p className="mt-2 opacity-90">Bảng điều khiển Nhà tài trợ - Theo dõi và quản lý các hoạt động tài trợ</p>
      </div>

      {/* Bộ lọc năm học và học kỳ */}
      <div className="bg-white rounded-xl shadow-lg p-4">
        <div className="flex flex-wrap gap-4 items-center">
          <span className="text-sm font-medium text-gray-700">🔍 Lọc theo:</span>
          <div className="flex items-center gap-2">
            <label className="text-sm text-gray-600">Năm học:</label>
            <select
              value={filters.academic_year}
              onChange={(e) => setFilters({ ...filters, academic_year: e.target.value })}
              className="border rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-purple-500"
            >
              {periods.years.map(year => <option key={year} value={year}>{year}</option>)}
            </select>
          </div>
          <div className="flex items-center gap-2">
            <label className="text-sm text-gray-600">Học kỳ:</label>
            <select
              value={filters.semester}
              onChange={(e) => setFilters({ ...filters, semester: e.target.value })}
              className="border rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-purple-500"
            >
              <option value="1">Học kỳ 1</option>
              <option value="2">Học kỳ 2</option>
            </select>
          </div>
        </div>
      </div>

      {/* Alert */}
      {pendingReviews.length > 0 && (
        <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded-lg cursor-pointer hover:bg-red-100" onClick={() => navigate('/sponsor/review')}>
          <div className="flex items-center">
            <span className="text-2xl mr-3">🔔</span>
            <div>
              <p className="font-bold text-red-800">Có {pendingReviews.length} hồ sơ cần xét duyệt!</p>
              <p className="text-red-600 text-sm">Nhấn để xem danh sách đề cử từ trường</p>
            </div>
          </div>
        </div>
      )}

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white rounded-xl shadow-lg p-6 border-l-4 border-blue-500">
          <p className="text-gray-500 text-sm">Tổng gói học bổng</p>
          <p className="text-3xl font-bold text-blue-600">{stats.totalFunds || 0}</p>
        </div>
        <div className="bg-white rounded-xl shadow-lg p-6 border-l-4 border-green-500">
          <p className="text-gray-500 text-sm">Tổng tiền đã tài trợ</p>
          <p className="text-2xl font-bold text-green-600">{(stats.totalSponsored || 0).toLocaleString('vi-VN')} đ</p>
        </div>
        <div className="bg-white rounded-xl shadow-lg p-6 border-l-4 border-purple-500">
          <p className="text-gray-500 text-sm">Đã giải ngân</p>
          <p className="text-2xl font-bold text-purple-600">{(stats.totalDisbursed || 0).toLocaleString('vi-VN')} đ</p>
        </div>
        <div className="bg-white rounded-xl shadow-lg p-6 border-l-4 border-orange-500">
          <p className="text-gray-500 text-sm">Sinh viên được hỗ trợ</p>
          <p className="text-3xl font-bold text-orange-600">{stats.totalRecipients || 0}</p>
        </div>
      </div>

      {/* Charts Row 1 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl shadow-lg p-6">
          <h3 className="text-lg font-bold text-gray-800 mb-4">📊 Phân bổ học bổng theo trường</h3>
          <div className="h-64"><Doughnut data={getSchoolDistributionData()} options={chartOptions} /></div>
        </div>
        <div className="bg-white rounded-xl shadow-lg p-6">
          <h3 className="text-lg font-bold text-gray-800 mb-4">📈 Trạng thái học bổng</h3>
          <div className="h-64"><Bar data={getScholarshipStatusData()} options={barOptions} /></div>
        </div>
      </div>

      {/* Charts Row 2 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl shadow-lg p-6">
          <h3 className="text-lg font-bold text-gray-800 mb-4">💰 Giá trị tài trợ theo quỹ</h3>
          <div className="h-64"><Bar data={getFundValueData()} options={barOptions} /></div>
        </div>
        <div className="bg-white rounded-xl shadow-lg p-6">
          <h3 className="text-lg font-bold text-gray-800 mb-4">📅 Sinh viên nhận HB theo tháng ({filters.academic_year || '2025-2026'})</h3>
          <div className="h-64"><Line data={getMonthlyRecipientsData()} options={chartOptions} /></div>
        </div>
      </div>

      {/* Recent Recipients */}
      <div className="bg-white rounded-xl shadow-lg p-6">
        <h3 className="text-xl font-bold text-gray-800 mb-4">🎓 Sinh viên nhận học bổng gần đây</h3>
        {recentRecipients.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <span className="text-4xl">👨‍🎓</span>
            <p className="mt-2">Chưa có sinh viên nào nhận học bổng</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Họ tên</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Học bổng</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Trường</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Giá trị</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {recentRecipients.slice(0, 5).map((r, i) => (
                  <tr key={i} className="hover:bg-gray-50">
                    <td className="px-4 py-3 text-sm font-medium">{r.student_name}</td>
                    <td className="px-4 py-3 text-sm text-gray-600">{r.scholarship_name?.substring(0, 30)}...</td>
                    <td className="px-4 py-3 text-sm text-gray-500">{r.school}</td>
                    <td className="px-4 py-3 text-sm font-medium text-green-600">{parseFloat(r.amount || 0).toLocaleString('vi-VN')} đ</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default SponsorDashboardPage;
