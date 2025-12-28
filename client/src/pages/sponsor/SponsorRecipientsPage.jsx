import { useEffect, useState } from 'react';
import api from '../../services/api';
import Loading from '../../components/common/Loading';
import Badge from '../../components/common/Badge';

const SponsorRecipientsPage = () => {
  const [recipients, setRecipients] = useState([]);
  const [schools, setSchools] = useState([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const currentYear = new Date().getFullYear();
  const [filters, setFilters] = useState({
    academic_year: `${currentYear}-${currentYear + 1}`,
    semester: 'HK1',
    school_id: ''
  });

  // Generate year options
  const yearOptions = [];
  for (let y = currentYear + 1; y >= 2020; y--) {
    yearOptions.push(`${y}-${y + 1}`);
  }

  useEffect(() => {
    fetchRecipients();
  }, [filters]);

  const fetchRecipients = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (filters.academic_year) params.append('academic_year', filters.academic_year);
      if (filters.semester) params.append('semester', filters.semester);
      if (filters.school_id) params.append('school_id', filters.school_id);
      
      const response = await api.get(`/sponsor/recipients?${params.toString()}`);
      setRecipients(response?.data || []);
      if (response?.schools) setSchools(response.schools);
    } catch (error) {
      console.error('Fetch recipients error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  // Tính tổng - parse amount thành số
  const totalAmount = recipients.reduce((sum, r) => sum + (parseFloat(r.amount) || 0), 0);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-800">Sinh viên nhận học bổng</h1>
        <p className="text-gray-600 mt-1">Danh sách sinh viên đã được hỗ trợ từ quỹ của bạn</p>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl shadow p-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Năm học</label>
            <select
              value={filters.academic_year}
              onChange={(e) => handleFilterChange('academic_year', e.target.value)}
              className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
            >
              {yearOptions.map(y => (
                <option key={y} value={y}>{y}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Học kỳ</label>
            <select
              value={filters.semester}
              onChange={(e) => handleFilterChange('semester', e.target.value)}
              className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
            >
              <option value="HK1">Học kỳ 1</option>
              <option value="HK2">Học kỳ 2</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Trường</label>
            <select
              value={filters.school_id}
              onChange={(e) => handleFilterChange('school_id', e.target.value)}
              className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Tất cả trường</option>
              {schools.map(s => (
                <option key={s.id} value={s.id}>{s.name} ({s.code})</option>
              ))}
            </select>
          </div>
          <div className="flex items-end">
            <button
              onClick={() => setFilters({ academic_year: `${currentYear}-${currentYear + 1}`, semester: 'HK1', school_id: '' })}
              className="px-4 py-2 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-lg transition"
            >
              🔄 Đặt lại
            </button>
          </div>
        </div>
      </div>

      {/* Summary */}
      {recipients.length > 0 && (
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          <div className="bg-blue-50 rounded-xl p-4 text-center">
            <p className="text-gray-600 text-sm">Tổng sinh viên</p>
            <p className="text-2xl font-bold text-blue-600">{recipients.length}</p>
          </div>
          <div className="bg-green-50 rounded-xl p-4 text-center">
            <p className="text-gray-600 text-sm">Tổng giá trị</p>
            <p className="text-2xl font-bold text-green-600">{totalAmount.toLocaleString('vi-VN')} đ</p>
          </div>
          <div className="bg-purple-50 rounded-xl p-4 text-center">
            <p className="text-gray-600 text-sm">Số trường</p>
            <p className="text-2xl font-bold text-purple-600">
              {new Set(recipients.map(r => r.school_code)).size}
            </p>
          </div>
        </div>
      )}

      <div className="bg-blue-50 rounded-lg p-4">
        <p className="text-blue-800 text-sm">
          ℹ️ Một số thông tin cá nhân đã được ẩn để bảo vệ quyền riêng tư của sinh viên.
        </p>
      </div>

      {loading ? (
        <Loading />
      ) : recipients.length === 0 ? (
        <div className="bg-white rounded-xl shadow-lg p-12 text-center">
          <div className="text-6xl mb-4">👨‍🎓</div>
          <h3 className="text-xl font-bold text-gray-800">Chưa có sinh viên nào</h3>
          <p className="text-gray-500 mt-2">Thử thay đổi bộ lọc để xem kết quả khác</p>
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">STT</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Họ tên</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Trường</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Học bổng</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Giá trị</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Trạng thái</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {recipients.map((r, i) => (
                <tr key={i} className="hover:bg-gray-50">
                  <td className="px-6 py-4 text-sm text-gray-500">{i + 1}</td>
                  <td className="px-6 py-4 text-sm font-medium">{r.student_name}</td>
                  <td className="px-6 py-4 text-sm text-gray-500">{r.school_code}</td>
                  <td className="px-6 py-4 text-sm">{r.scholarship_name}</td>
                  <td className="px-6 py-4 text-sm font-medium text-blue-600">
                    {parseFloat(r.amount)?.toLocaleString('vi-VN')} đ
                  </td>
                  <td className="px-6 py-4">
                    <Badge variant={r.status === 'DISBURSED' ? 'success' : 'warning'} size="sm">
                      {r.status === 'DISBURSED' ? 'Đã giải ngân' : 'Đã duyệt'}
                    </Badge>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default SponsorRecipientsPage;
