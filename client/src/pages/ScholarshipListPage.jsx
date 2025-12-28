import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import scholarshipService from '../services/scholarshipService';
import universityService from '../services/universityService';
import useAuthStore from '../store/useAuthStore';
import Button from '../components/common/Button';
import Badge from '../components/common/Badge';
import Loading from '../components/common/Loading';

const ScholarshipListPage = () => {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const [scholarships, setScholarships] = useState([]);
  const [schools, setSchools] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filtersInitialized, setFiltersInitialized] = useState(false);
  const [filters, setFilters] = useState({
    status: '',
    search: '',
    school_id: ''
  });

  // Set default school_id cho sinh viên khi đăng nhập
  useEffect(() => {
    if (user?.role === 'STUDENT' && user?.school_id && !filtersInitialized) {
      setFilters(prev => ({ ...prev, school_id: String(user.school_id) }));
      setFiltersInitialized(true);
    } else if (!user || user?.role !== 'STUDENT') {
      setFiltersInitialized(true);
    }
  }, [user, filtersInitialized]);

  useEffect(() => {
    fetchSchools();
  }, []);

  useEffect(() => {
    if (filtersInitialized) {
      fetchScholarships();
    }
  }, [filters, filtersInitialized]);

  const fetchSchools = async () => {
    try {
      const response = await universityService.getAll();
      // API trả về { data: { universities: [...] } }
      const schoolData = response.data?.universities || response.universities || response.data || [];
      setSchools(Array.isArray(schoolData) ? schoolData : []);
    } catch (error) {
      console.error('Error fetching schools:', error);
    }
  };

  const fetchScholarships = async () => {
    try {
      setLoading(true);
      const response = await scholarshipService.getAll(filters);
      // Handle different response structures
      const scholarshipData = response.data?.scholarships || response.scholarships || response.data || [];
      setScholarships(Array.isArray(scholarshipData) ? scholarshipData : []);
    } catch (error) {
      console.error('Error fetching scholarships:', error);
      toast.error(error.message || 'Không thể tải danh sách học bổng');
      setScholarships([]);
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status) => {
    const statusMap = {
      OPEN: { variant: 'success', label: 'Đang mở' },
      CLOSED: { variant: 'warning', label: 'Đã đóng' },
      FINISHED: { variant: 'danger', label: 'Đã kết thúc' },
    };
    const config = statusMap[status] || statusMap.OPEN;
    return <Badge variant={config.variant}>{config.label}</Badge>;
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(amount);
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('vi-VN');
  };

  if (loading) return <Loading />;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">Danh sách Học bổng</h1>
          <p className="text-gray-600 mt-1">
            Tìm thấy {scholarships.length} học bổng
          </p>
        </div>
        {(user?.role === 'UNI_ADMIN' || user?.role === 'SUPER_ADMIN') && (
          <Button
            variant="primary"
            onClick={() => navigate('/manage/scholarships/create')}
          >
            <span className="mr-2">➕</span>
            Tạo học bổng mới
          </Button>
        )}
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow p-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <input
              type="text"
              placeholder="Tìm kiếm học bổng..."
              value={filters.search}
              onChange={(e) => setFilters({ ...filters, search: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          <div>
            <select
              value={filters.school_id}
              onChange={(e) => setFilters({ ...filters, school_id: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="">Tất cả trường</option>
              {schools.map((school) => (
                <option key={school.id} value={school.id}>
                  {school.name}
                </option>
              ))}
            </select>
          </div>
          <div>
            <select
              value={filters.status}
              onChange={(e) => setFilters({ ...filters, status: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="">Tất cả trạng thái</option>
              <option value="OPEN">Đang mở</option>
              <option value="CLOSED">Đã đóng</option>
              <option value="FINISHED">Đã kết thúc</option>
            </select>
          </div>
        </div>
      </div>

      {/* Scholarship Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {scholarships.map((scholarship) => (
          <div
            key={scholarship.id}
            onClick={() => navigate(`/scholarships/${scholarship.id}`)}
            className="bg-white rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 cursor-pointer overflow-hidden group"
          >
            {/* Header with gradient */}
            <div className="h-36 bg-gradient-to-br from-blue-500 to-blue-600 p-6 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-white opacity-10 rounded-full -mr-16 -mt-16"></div>
              <div className="relative z-10">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h3 className="text-white font-bold text-lg line-clamp-2 group-hover:scale-105 transition-transform">
                      {scholarship.name}
                    </h3>
                    {scholarship.school && (
                      <p className="text-blue-100 text-sm mt-1 truncate">
                        🏫 {scholarship.school.name}
                      </p>
                    )}
                  </div>
                  {getStatusBadge(scholarship.status)}
                </div>
              </div>
            </div>

            {/* Content */}
            <div className="p-6 space-y-4">
              {/* Amount */}
              <div className="flex items-center justify-between">
                <span className="text-gray-600 text-sm">Giá trị/suất:</span>
                <span className="text-2xl font-bold text-blue-600">
                  {formatCurrency(scholarship.amount_per_slot)}
                </span>
              </div>

              {/* Slots */}
              <div className="flex items-center justify-between">
                <span className="text-gray-600 text-sm">Số suất:</span>
                <span className="font-semibold text-gray-800">{scholarship.slots} suất</span>
              </div>

              {/* Dates */}
              <div className="pt-4 border-t border-gray-200 space-y-2">
                <div className="flex items-center text-sm text-gray-600">
                  <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  <span>Bắt đầu: {formatDate(scholarship.start_date)}</span>
                </div>
                <div className="flex items-center text-sm text-gray-600">
                  <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <span>Kết thúc: {formatDate(scholarship.end_date)}</span>
                </div>
              </div>

              {/* Action Button */}
              <Button
                variant="primary"
                fullWidth
                onClick={(e) => {
                  e.stopPropagation();
                  navigate(`/scholarships/${scholarship.id}`);
                }}
              >
                Xem chi tiết →
              </Button>
            </div>
          </div>
        ))}
      </div>

      {scholarships.length === 0 && (
        <div className="text-center py-12 bg-white rounded-lg shadow">
          <svg className="mx-auto h-16 w-16 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <p className="mt-4 text-gray-500 text-lg">Không tìm thấy học bổng nào</p>
        </div>
      )}
    </div>
  );
};

export default ScholarshipListPage;
