import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import scholarshipService from '../../services/scholarshipService';
import authService from '../../services/authService';
import useAuthStore from '../../store/useAuthStore';
import Button from '../../components/common/Button';
import Badge from '../../components/common/Badge';
import Loading from '../../components/common/Loading';

const StudentHomePage = () => {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const [scholarships, setScholarships] = useState([]);
  const [studentProfile, setStudentProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      // Fetch cả profile và scholarships cùng lúc
      const [profileRes, scholarshipsRes] = await Promise.all([
        authService.getProfile(),
        scholarshipService.getAll({ status: 'OPEN' })
      ]);
      
      // Lấy student profile
      const profile = profileRes.data?.studentProfile || profileRes.studentProfile;
      setStudentProfile(profile);
      
      // Lấy scholarships
      const data = scholarshipsRes.data?.scholarships || scholarshipsRes.scholarships || [];
      setScholarships(Array.isArray(data) ? data : []);
    } catch (error) {
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount);
  };

  const getDaysLeft = (endDate) => {
    const days = Math.ceil((new Date(endDate) - new Date()) / (1000 * 60 * 60 * 24));
    return days > 0 ? days : 0;
  };

  if (loading) return <Loading />;

  return (
    <div className="space-y-6">
      {/* Welcome Banner */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-700 rounded-2xl p-8 text-white">
        <h1 className="text-3xl font-bold">Xin chào, {user?.full_name || user?.username}! 👋</h1>
        <p className="mt-2 opacity-90">Khám phá các học bổng phù hợp với bạn</p>
        <div className="mt-4 flex gap-4">
          <Button variant="outline" className="!text-white !border-white hover:!bg-white/20"
            onClick={() => navigate('/student/my-applications')}>
            📋 Hồ sơ của tôi
          </Button>
          <Button variant="outline" className="!text-white !border-white hover:!bg-white/20"
            onClick={() => navigate('/student/profile')}>
            👤 Cập nhật hồ sơ
          </Button>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white rounded-xl shadow p-6">
          <p className="text-gray-600 text-sm">Học bổng đang mở</p>
          <p className="text-3xl font-bold text-blue-600">{scholarships.length}</p>
        </div>
        <div className="bg-white rounded-xl shadow p-6">
          <p className="text-gray-600 text-sm">GPA của bạn</p>
          <p className="text-3xl font-bold text-green-600">
            {studentProfile?.gpa ? parseFloat(studentProfile.gpa).toFixed(2) : 'Chưa cập nhật'}
          </p>
        </div>
        <div className="bg-white rounded-xl shadow p-6">
          <p className="text-gray-600 text-sm">Điểm rèn luyện</p>
          <p className="text-3xl font-bold text-purple-600">
            {studentProfile?.drr ?? 'Chưa cập nhật'}
          </p>
        </div>
      </div>

      {/* Scholarships List */}
      <div>
        <h2 className="text-2xl font-bold text-gray-800 mb-4">🎓 Học bổng đang mở</h2>
        {scholarships.length === 0 ? (
          <div className="bg-white rounded-xl shadow-lg p-12 text-center">
            <div className="text-6xl mb-4">📭</div>
            <h3 className="text-xl font-bold text-gray-800">Chưa có học bổng nào</h3>
            <p className="text-gray-600 mt-2">Hiện tại chưa có học bổng nào đang mở. Hãy quay lại sau!</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {scholarships.map((s) => (
              <div key={s.id} className="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-all group">
                {/* Header */}
                <div className="h-32 bg-gradient-to-br from-blue-500 to-blue-600 p-6 relative">
                  <div className="absolute top-0 right-0 w-24 h-24 bg-white/10 rounded-full -mr-12 -mt-12"></div>
                  <Badge variant="success" className="absolute top-4 right-4">Đang mở</Badge>
                  <h3 className="text-white font-bold text-lg line-clamp-2">{s.name}</h3>
                </div>

                {/* Content */}
                <div className="p-6 space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600 text-sm">Giá trị:</span>
                    <span className="text-2xl font-bold text-blue-600">{formatCurrency(s.amount_per_slot)}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600 text-sm">Số suất:</span>
                    <span className="font-semibold">{s.slots} suất</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600 text-sm">Còn lại:</span>
                    <span className={`font-semibold ${getDaysLeft(s.end_date) <= 3 ? 'text-red-600' : 'text-green-600'}`}>
                      {getDaysLeft(s.end_date)} ngày
                    </span>
                  </div>

                  {/* Criteria Preview */}
                  {s.criteria_json && (
                    <div className="pt-3 border-t border-gray-200">
                      <p className="text-xs text-gray-500 mb-2">Yêu cầu:</p>
                      <div className="flex flex-wrap gap-2">
                        {s.criteria_json.min_gpa && (
                          <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded text-xs">
                            GPA ≥ {s.criteria_json.min_gpa}
                          </span>
                        )}
                        {s.criteria_json.min_drr && (
                          <span className="px-2 py-1 bg-green-100 text-green-800 rounded text-xs">
                            ĐRL ≥ {s.criteria_json.min_drr}
                          </span>
                        )}
                        {s.criteria_json.require_poor && (
                          <span className="px-2 py-1 bg-yellow-100 text-yellow-800 rounded text-xs">
                            Hoàn cảnh khó khăn
                          </span>
                        )}
                      </div>
                    </div>
                  )}

                  <Button variant="primary" fullWidth onClick={() => navigate(`/student/scholarships/${s.id}`)}>
                    Xem chi tiết & Nộp đơn →
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default StudentHomePage;
