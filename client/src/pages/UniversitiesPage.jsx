import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import api from '../services/api';
import Loading from '../components/common/Loading';

const UniversitiesPage = () => {
  const navigate = useNavigate();
  const [universities, setUniversities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  // Ảnh nền cho các trường - sử dụng ảnh campus từ Unsplash
  const universityBackgrounds = {
    CTU: 'https://images.unsplash.com/photo-1607237138185-eedd9c632b0b?w=800&q=80',
    HCMUT: 'https://images.unsplash.com/photo-1562774053-701939374585?w=800&q=80',
    HUST: 'https://images.unsplash.com/photo-1541339907198-e08756dedf3f?w=800&q=80',
    HCMUAF: 'https://images.unsplash.com/photo-1523050854058-8df90110c9f1?w=800&q=80',
  };

  const getUniversityBackground = (code) => {
    return universityBackgrounds[code] || 'https://images.unsplash.com/photo-1498243691581-b145c3f54a5a?w=800&q=80';
  };

  useEffect(() => {
    fetchUniversities();
  }, []);

  const fetchUniversities = async () => {
    try {
      const response = await api.get('/universities');
      setUniversities(response.data.universities || []);
    } catch (error) {
      toast.error('Không thể tải danh sách trường');
    } finally {
      setLoading(false);
    }
  };

  const filteredUniversities = universities.filter(uni =>
    uni.name.toLowerCase().includes(search.toLowerCase()) ||
    uni.code.toLowerCase().includes(search.toLowerCase())
  );

  if (loading) return <Loading />;

  return (
    <div className="py-12 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-800 mb-4">
            Danh sách Trường Đại học
          </h1>
          <p className="text-xl text-gray-600">
            Khám phá các trường đại học có chương trình học bổng
          </p>
        </div>

        {/* Search */}
        <div className="mb-8 max-w-2xl mx-auto">
          <div className="relative">
            <input
              type="text"
              placeholder="Tìm kiếm trường đại học..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full px-6 py-4 pl-14 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent text-lg"
            />
            <svg className="w-6 h-6 text-gray-400 absolute left-4 top-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
        </div>

        {/* Universities Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {filteredUniversities.map((university) => (
            <div
              key={university.id}
              onClick={() => navigate(`/scholarships?school=${university.id}`)}
              className="bg-white rounded-xl shadow-lg hover:shadow-2xl transition-all duration-300 cursor-pointer overflow-hidden group"
            >
              {/* Logo/Header with Background Image */}
              <div className="h-56 relative overflow-hidden">
                {/* Background Image - luôn có */}
                <img
                  src={getUniversityBackground(university.code)}
                  alt=""
                  className="absolute inset-0 w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
                />
                {/* Overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-blue-900/80 via-blue-900/40 to-transparent"></div>
                
                {/* Logo - hiển thị chữ viết tắt với màu sắc đẹp */}
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="w-36 h-36 bg-white rounded-full flex items-center justify-center shadow-xl relative z-10 border-4 border-white">
                    <span className="text-3xl font-bold text-blue-700">
                      {university.code}
                    </span>
                  </div>
                </div>
              </div>

              {/* Content */}
              <div className="p-6">
                <div className="mb-4">
                  <span className="inline-block px-3 py-1 bg-blue-100 text-blue-800 text-sm font-medium rounded-full mb-2">
                    {university.code}
                  </span>
                  <h3 className="text-xl font-bold text-gray-800 group-hover:text-blue-600 transition">
                    {university.name}
                  </h3>
                </div>

                {university.address && (
                  <div className="flex items-start text-sm text-gray-600 mb-4">
                    <svg className="w-5 h-5 mr-2 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                    <span className="line-clamp-2">{university.address}</span>
                  </div>
                )}

                {/* Stats */}
                <div className="grid grid-cols-2 gap-4 pt-4 border-t border-gray-200">
                  <div className="text-center">
                    <p className="text-2xl font-bold text-blue-600">
                      {university.student_count || 0}
                    </p>
                    <p className="text-xs text-gray-500">Sinh viên</p>
                  </div>
                  <div className="text-center">
                    <p className="text-2xl font-bold text-green-600">
                      {university.scholarship_count || 0}
                    </p>
                    <p className="text-xs text-gray-500">Học bổng</p>
                  </div>
                </div>

                {/* View Button */}
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    navigate(`/scholarships?school=${university.id}`);
                  }}
                  className="mt-4 w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-medium"
                >
                  Xem học bổng →
                </button>
              </div>
            </div>
          ))}
        </div>

        {filteredUniversities.length === 0 && (
          <div className="text-center py-12">
            <svg className="mx-auto h-16 w-16 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <p className="mt-4 text-gray-500 text-lg">Không tìm thấy trường nào</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default UniversitiesPage;
