import { useEffect, useState } from 'react';
import { toast } from 'react-toastify';
import { Bar, Doughnut } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
} from 'chart.js';
import api from '../../services/api';
import Loading from '../../components/common/Loading';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend, ArcElement);

const AdminReportsPage = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [exporting, setExporting] = useState(false);
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
      
      const response = await api.get(`/stats/dashboard?${params.toString()}`);
      const data = response.data?.data?.stats || response.data?.stats || {};
      setStats(data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const exportDisbursementList = async () => {
    try {
      setExporting(true);
      toast.info('Đang xuất danh sách giải ngân...');
      
      // Truyền filter năm học và học kỳ
      const params = new URLSearchParams();
      if (filters.academic_year) params.append('academic_year', filters.academic_year);
      if (filters.semester) params.append('semester', filters.semester);
      
      const response = await api.get(`/applications/export-disbursement?${params.toString()}`, { 
        responseType: 'arraybuffer'
      });
      
      // Kiểm tra nếu response là JSON error (không phải Excel)
      const contentType = response.headers['content-type'];
      if (contentType && contentType.includes('application/json')) {
        // Decode arraybuffer thành text để đọc error message
        const decoder = new TextDecoder('utf-8');
        const errorData = JSON.parse(decoder.decode(response.data));
        toast.error(errorData.message || 'Có lỗi xảy ra');
        return;
      }
      
      // Tạo blob từ arraybuffer
      const blob = new Blob([response.data], { 
        type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' 
      });
      
      // Tạo URL và download
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      const dateStr = new Date().toISOString().split('T')[0];
      const periodStr = filters.academic_year ? `_${filters.academic_year.replace('-', '_')}${filters.semester ? `_HK${filters.semester}` : ''}` : '';
      link.setAttribute('download', `danh_sach_giai_ngan${periodStr}_${dateStr}.xlsx`);
      document.body.appendChild(link);
      link.click();
      link.parentNode.removeChild(link);
      window.URL.revokeObjectURL(url);
      
      toast.success('Xuất file thành công!');
    } catch (error) {
      console.error('Export error:', error);
      // Error message đã được xử lý trong api interceptor
      const errorMsg = error.message || 'Không có hồ sơ đã duyệt để xuất';
      toast.error(errorMsg);
    } finally {
      setExporting(false);
    }
  };

  const overview = stats?.overview || {};
  const appsByStatus = stats?.applications_by_status || [];
  const scholarshipsByStatus = stats?.scholarships_by_status || [];
  
  const getAppCount = (status) => appsByStatus.find(a => a.status === status)?.count || 0;

  const getAppChartData = () => ({
    labels: ['Chờ duyệt', 'Đã duyệt', 'Từ chối', 'Đã giải ngân'],
    datasets: [{
      data: [getAppCount('PENDING'), getAppCount('APPROVED'), getAppCount('REJECTED'), getAppCount('DISBURSED')],
      backgroundColor: ['#F59E0B', '#10B981', '#EF4444', '#3B82F6'],
    }],
  });

  const getScholarshipChartData = () => {
    const statusMap = { OPEN: 0, CLOSED: 0, FINISHED: 0 };
    scholarshipsByStatus.forEach(s => { if (statusMap[s.status] !== undefined) statusMap[s.status] = s.count; });
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

  const chartOptions = { responsive: true, maintainAspectRatio: false, plugins: { legend: { position: 'bottom' } } };

  if (loading) return <Loading />;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">📊 Báo cáo & Thống kê</h1>
          <p className="text-gray-600 mt-1">Xuất báo cáo và xem thống kê theo năm học</p>
        </div>
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
        </div>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white rounded-xl shadow-lg p-6 border-l-4 border-blue-500">
          <p className="text-gray-600 text-sm">Tổng học bổng</p>
          <p className="text-3xl font-bold text-blue-600">{overview.total_scholarships || 0}</p>
        </div>
        <div className="bg-white rounded-xl shadow-lg p-6 border-l-4 border-purple-500">
          <p className="text-gray-600 text-sm">Tổng hồ sơ</p>
          <p className="text-3xl font-bold text-purple-600">{overview.total_applications || 0}</p>
        </div>
        <div className="bg-white rounded-xl shadow-lg p-6 border-l-4 border-green-500">
          <p className="text-gray-600 text-sm">Đã duyệt</p>
          <p className="text-3xl font-bold text-green-600">{getAppCount('APPROVED')}</p>
        </div>
        <div className="bg-white rounded-xl shadow-lg p-6 border-l-4 border-yellow-500">
          <p className="text-gray-600 text-sm">Đã giải ngân</p>
          <p className="text-2xl font-bold text-yellow-600">
            {(overview.total_disbursed || 0).toLocaleString('vi-VN')} đ
          </p>
        </div>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl shadow-lg p-6">
          <h3 className="text-lg font-bold text-gray-800 mb-4">📋 Hồ sơ theo trạng thái</h3>
          <div className="h-64">
            <Doughnut data={getAppChartData()} options={chartOptions} />
          </div>
        </div>
        <div className="bg-white rounded-xl shadow-lg p-6">
          <h3 className="text-lg font-bold text-gray-800 mb-4">🎓 Học bổng theo trạng thái</h3>
          <div className="h-64">
            <Bar data={getScholarshipChartData()} options={chartOptions} />
          </div>
        </div>
      </div>

      {/* Export Options */}
      <div className="bg-white rounded-xl shadow-lg p-6">
        <h2 className="text-xl font-bold text-gray-800 mb-4">📥 Xuất báo cáo Excel</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <button onClick={exportDisbursementList} disabled={exporting}
            className="p-6 border-2 border-dashed border-green-300 rounded-xl hover:bg-green-50 transition-colors text-left">
            <span className="text-3xl">💰</span>
            <h3 className="font-bold text-gray-800 mt-2">Danh sách giải ngân</h3>
            <p className="text-sm text-gray-500">Xuất danh sách SV đã duyệt để gửi ngân hàng</p>
          </button>
        </div>
      </div>
    </div>
  );
};

export default AdminReportsPage;
