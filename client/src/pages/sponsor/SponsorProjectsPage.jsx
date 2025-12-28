import { useEffect, useState } from 'react';
import api from '../../services/api';
import Loading from '../../components/common/Loading';
import Badge from '../../components/common/Badge';

const SponsorProjectsPage = () => {
  const [projects, setProjects] = useState([]);
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
    fetchProjects();
  }, [filters]);

  const fetchProjects = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (filters.academic_year) params.append('academic_year', filters.academic_year);
      if (filters.semester) params.append('semester', filters.semester);
      if (filters.school_id) params.append('school_id', filters.school_id);
      
      const response = await api.get(`/sponsor/projects?${params.toString()}`);
      setProjects(response?.data || []);
      if (response?.schools) setSchools(response.schools);
    } catch (error) {
      console.error('Fetch projects error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  // Hàm ẩn năm trong tên (VD: "CTU 2024" -> "CTU")
  const formatName = (name) => {
    if (!name) return '';
    return name.replace(/\s+\d{4}(-\d{4})?$/g, '').trim();
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-800">Dự án tài trợ</h1>
        <p className="text-gray-600 mt-1">Các gói học bổng bạn đang tài trợ</p>
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

      {loading ? (
        <Loading />
      ) : projects.length === 0 ? (
        <div className="bg-white rounded-xl shadow-lg p-12 text-center">
          <div className="text-6xl mb-4">📋</div>
          <h3 className="text-xl font-bold text-gray-800">Không có dự án nào</h3>
          <p className="text-gray-500 mt-2">Thử thay đổi bộ lọc để xem kết quả khác</p>
        </div>
      ) : (
        <div className="space-y-6">
          {projects.map((project) => (
            <div key={project.id} className="bg-white rounded-xl shadow-lg p-6">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h3 className="text-xl font-bold text-gray-800">{formatName(project.name)}</h3>
                  <p className="text-sm text-gray-500">Trường: {project.school?.name || 'N/A'}</p>
                </div>
                <Badge variant={project.status === 'ACTIVE' ? 'success' : 'default'}>
                  {project.status === 'ACTIVE' ? 'Đang hoạt động' : 'Đã kết thúc'}
                </Badge>
              </div>
              
              <div className="grid grid-cols-3 gap-4 mb-4 text-sm">
                <div className="bg-blue-50 rounded-lg p-3 text-center">
                  <p className="text-gray-500">Tổng quỹ</p>
                  <p className="font-bold text-blue-600">{project.total_amount?.toLocaleString('vi-VN')} đ</p>
                </div>
                <div className="bg-green-50 rounded-lg p-3 text-center">
                  <p className="text-gray-500">Đã giải ngân</p>
                  <p className="font-bold text-green-600">{project.disbursed_amount?.toLocaleString('vi-VN')} đ</p>
                </div>
                <div className="bg-purple-50 rounded-lg p-3 text-center">
                  <p className="text-gray-500">Tổng suất</p>
                  <p className="font-bold text-purple-600">{project.total_slots}</p>
                </div>
              </div>

              {project.scholarships && project.scholarships.length > 0 && (
                <div className="border-t pt-4">
                  <h4 className="font-semibold text-gray-700 mb-3">📚 Các học bổng ({project.scholarships.length})</h4>
                  <div className="space-y-2">
                    {project.scholarships.map((schol) => (
                      <div key={schol.id} className="flex items-center justify-between bg-gray-50 rounded-lg p-3">
                        <div>
                          <span className="text-sm">{schol.name}</span>
                          <span className="text-xs text-gray-400 ml-2">({schol.academic_year} - {schol.semester})</span>
                        </div>
                        <Badge variant={schol.status === 'OPEN' ? 'success' : 'default'} size="sm">
                          {schol.status === 'OPEN' ? 'Đang mở' : schol.status}
                        </Badge>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default SponsorProjectsPage;
