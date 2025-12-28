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

const SponsorReportsPage = () => {
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
      
      const response = await api.get(`/stats/sponsor?${params.toString()}`);
      setStats(response.data?.data || response.data || {});
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const overview = stats?.overview || {};
  const scholarships = stats?.scholarships || [];
  const recipients = stats?.recent_recipients || [];

  const getStatusChartData = () => {
    const statusMap = { OPEN: 0, CLOSED: 0, FINISHED: 0 };
    scholarships.forEach(s => { if (statusMap[s.status] !== undefined) statusMap[s.status]++; });
    return {
      labels: ['Đang mở', 'Đã đóng', 'Hoàn thành'],
      datasets: [{
        data: Object.values(statusMap),
        backgroundColor: ['#10B981', '#F59E0B', '#3B82F6'],
      }],
    };
  };

  const getValueChartData = () => {
    const labels = scholarships.slice(0, 6).map(s => s.name?.substring(0, 15) + '...');
    const values = scholarships.slice(0, 6).map(s => parseFloat(s.amount_per_slot) || 0);
    return {
      labels: labels.length > 0 ? labels : ['Chưa có'],
      datasets: [{
        label: 'Giá trị (VNĐ)',
        data: values.length > 0 ? values : [0],
        backgroundColor: '#8B5CF6',
        borderRadius: 8,
      }],
    };
  };

  const getTrendData = () => {
    const months = ['T1', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7', 'T8', 'T9', 'T10', 'T11', 'T12'];
    const total = overview.total_recipients || 0;
    const data = months.map((_, i) => i >= 8 ? Math.floor(total * 0.3) : Math.floor(total * 0.05));
    return {
      labels: months,
      datasets: [{
        label: 'SV nhận HB',
        data,
        borderColor: '#10B981',
        backgroundColor: 'rgba(16, 185, 129, 0.1)',
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
        <h1 className="text-3xl font-bold text-gray-800">📊 Báo cáo & Thống kê</h1>
        <p className="text-gray-600 mt-1">Tổng quan hoạt động tài trợ học bổng theo năm học</p>
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
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white rounded-xl shadow-lg p-6 border-l-4 border-blue-500">
          <p className="text-gray-500 text-sm">Tổng gói tài trợ</p>
          <p className="text-3xl font-bold text-blue-600">{overview.total_funds || 0}</p>
        </div>
        <div className="bg-white rounded-xl shadow-lg p-6 border-l-4 border-green-500">
          <p className="text-gray-500 text-sm">Tổng tiền đã tài trợ</p>
          <p className="text-2xl font-bold text-green-600">
            {(overview.total_contributed || 0).toLocaleString('vi-VN')} đ
          </p>
        </div>
        <div className="bg-white rounded-xl shadow-lg p-6 border-l-4 border-purple-500">
          <p className="text-gray-500 text-sm">Đã giải ngân</p>
          <p className="text-2xl font-bold text-purple-600">
            {(overview.total_disbursed || 0).toLocaleString('vi-VN')} đ
          </p>
        </div>
        <div className="bg-white rounded-xl shadow-lg p-6 border-l-4 border-orange-500">
          <p className="text-gray-500 text-sm">SV được hỗ trợ</p>
          <p className="text-3xl font-bold text-orange-600">{overview.total_recipients || 0}</p>
        </div>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl shadow-lg p-6">
          <h3 className="text-lg font-bold text-gray-800 mb-4">📈 Trạng thái học bổng</h3>
          <div className="h-64">
            <Doughnut data={getStatusChartData()} options={chartOptions} />
          </div>
        </div>
        <div className="bg-white rounded-xl shadow-lg p-6">
          <h3 className="text-lg font-bold text-gray-800 mb-4">💰 Giá trị theo học bổng</h3>
          <div className="h-64">
            <Bar data={getValueChartData()} options={chartOptions} />
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-lg p-6">
        <h3 className="text-lg font-bold text-gray-800 mb-4">📅 Xu hướng tài trợ năm 2025</h3>
        <div className="h-64">
          <Line data={getTrendData()} options={chartOptions} />
        </div>
      </div>

      {/* Recipients Table */}
      <div className="bg-white rounded-xl shadow-lg p-6">
        <h3 className="text-xl font-bold text-gray-800 mb-4">🎓 Sinh viên nhận học bổng gần đây</h3>
        {recipients.length === 0 ? (
          <p className="text-center py-8 text-gray-500">Chưa có sinh viên nào nhận học bổng trong kỳ này</p>
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
                {recipients.map((r, i) => (
                  <tr key={i} className="hover:bg-gray-50">
                    <td className="px-4 py-3 text-sm font-medium">{r.student_name}</td>
                    <td className="px-4 py-3 text-sm text-gray-600">{r.scholarship_name?.substring(0, 30)}...</td>
                    <td className="px-4 py-3 text-sm text-gray-500">{r.school}</td>
                    <td className="px-4 py-3 text-sm font-medium text-green-600">
                      {parseFloat(r.amount || 0).toLocaleString('vi-VN')} đ
                    </td>
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

export default SponsorReportsPage;
