import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import useAuthStore from '../store/useAuthStore';
import Button from '../components/common/Button';

const HomePage = () => {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuthStore();
  const [stats, setStats] = useState({ schools: 0, scholarships: 0, students: 0 });
  const [featuredScholarships, setFeaturedScholarships] = useState([]);

  useEffect(() => {
    fetchPublicData();
  }, []);

  const fetchPublicData = async () => {
    try {
      // Fetch featured scholarships (không cần auth)
      const response = await api.get('/scholarships?status=OPEN&limit=6');
      setFeaturedScholarships(response.data.scholarships || []);
      
      // Mock stats (hoặc tạo API public)
      setStats({
        schools: 50,
        scholarships: 200,
        students: 5000
      });
    } catch (error) {
      console.error('Error fetching public data:', error);
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(amount);
  };

  return (
    <div>
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-blue-600 via-blue-700 to-indigo-800 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-20">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 items-center">
            <div className="text-center lg:text-left">
              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-4 lg:mb-6 leading-tight">
                Cơ hội học bổng<br />
                <span className="text-blue-200">cho mọi sinh viên</span>
              </h1>
              <p className="text-lg lg:text-xl text-blue-100 mb-6 lg:mb-8">
                Kết nối sinh viên khó khăn với các chương trình học bổng từ trường đại học và nhà tài trợ trên toàn quốc.
              </p>
              <div className="flex flex-wrap gap-4 justify-center lg:justify-start">
                <Button
                  variant="secondary"
                  size="lg"
                  onClick={() => navigate('/scholarships')}
                >
                  Tìm học bổng ngay →
                </Button>
                {!isAuthenticated && (
                  <Button
                    variant="outline"
                    size="lg"
                    onClick={() => navigate('/register')}
                    className="bg-white bg-opacity-20 hover:bg-opacity-30 border-white text-white"
                  >
                    Đăng ký tài khoản
                  </Button>
                )}
              </div>
            </div>
            <div className="flex justify-center mt-8 lg:mt-0">
              <div className="relative w-full max-w-md lg:max-w-none">
                <div className="absolute inset-0 bg-blue-400 rounded-full opacity-20 blur-3xl"></div>
                <img
                  src="/images/gen-n-scholarship-hero.jpg"
                  alt="Học bổng sinh viên"
                  className="relative rounded-2xl shadow-2xl w-full h-auto max-w-lg mx-auto"
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-12 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="text-5xl font-bold text-blue-600 mb-2">{stats.schools}+</div>
              <p className="text-gray-600">Trường đại học</p>
            </div>
            <div className="text-center">
              <div className="text-5xl font-bold text-green-600 mb-2">{stats.scholarships}+</div>
              <p className="text-gray-600">Học bổng</p>
            </div>
            <div className="text-center">
              <div className="text-5xl font-bold text-purple-600 mb-2">{stats.students}+</div>
              <p className="text-gray-600">Sinh viên được hỗ trợ</p>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Scholarships */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-gray-800 mb-4">
              Học bổng đang mở
            </h2>
            <p className="text-xl text-gray-600">
              Khám phá các cơ hội học bổng mới nhất
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {featuredScholarships.map((scholarship) => (
              <div
                key={scholarship.id}
                onClick={() => navigate(`/scholarships/${scholarship.id}`)}
                className="bg-white rounded-xl shadow-lg hover:shadow-2xl transition-all duration-300 cursor-pointer overflow-hidden group"
              >
                <div className="h-32 bg-gradient-to-br from-blue-500 to-blue-600 p-6 relative">
                  <h3 className="text-white font-bold text-lg line-clamp-2 group-hover:scale-105 transition">
                    {scholarship.name}
                  </h3>
                </div>
                <div className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-gray-600 text-sm">Giá trị:</span>
                    <span className="text-2xl font-bold text-blue-600">
                      {formatCurrency(scholarship.amount_per_slot)}
                    </span>
                  </div>
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-gray-600 text-sm">Số suất:</span>
                    <span className="font-semibold">{scholarship.slots} suất</span>
                  </div>
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

          <div className="text-center mt-12">
            <Button
              variant="outline"
              size="lg"
              onClick={() => navigate('/scholarships')}
            >
              Xem tất cả học bổng →
            </Button>
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-gray-800 mb-4">
              Cách thức hoạt động
            </h2>
            <p className="text-xl text-gray-600">
              Chỉ với 3 bước đơn giản
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <span className="text-4xl">📝</span>
              </div>
              <h3 className="text-xl font-bold text-gray-800 mb-3">1. Đăng ký tài khoản</h3>
              <p className="text-gray-600">
                Tạo tài khoản miễn phí và cập nhật thông tin cá nhân
              </p>
            </div>

            <div className="text-center">
              <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <span className="text-4xl">🔍</span>
              </div>
              <h3 className="text-xl font-bold text-gray-800 mb-3">2. Tìm học bổng phù hợp</h3>
              <p className="text-gray-600">
                Khám phá các học bổng phù hợp với hoàn cảnh của bạn
              </p>
            </div>

            <div className="text-center">
              <div className="w-20 h-20 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <span className="text-4xl">✅</span>
              </div>
              <h3 className="text-xl font-bold text-gray-800 mb-3">3. Nộp hồ sơ</h3>
              <p className="text-gray-600">
                Nộp hồ sơ trực tuyến và chờ kết quả xét duyệt
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-20 bg-gradient-to-br from-blue-50 to-indigo-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-gray-800 mb-4">
              Câu chuyện thành công
            </h2>
            <p className="text-xl text-gray-600">
              Những sinh viên đã nhận được học bổng
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-white rounded-xl shadow-lg p-8">
              <div className="flex items-center mb-4">
                <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center text-2xl font-bold text-blue-600 mr-4">
                  NA
                </div>
                <div>
                  <h4 className="font-bold text-gray-800">Nguyễn Văn A</h4>
                  <p className="text-sm text-gray-500">ĐH Cần Thơ</p>
                </div>
              </div>
              <p className="text-gray-600 italic">
                "Nhờ học bổng này, em đã có thể tiếp tục theo đuổi ước mơ trở thành kỹ sư. Cảm ơn chương trình đã hỗ trợ em!"
              </p>
              <div className="mt-4 flex text-yellow-400">
                ⭐⭐⭐⭐⭐
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-lg p-8">
              <div className="flex items-center mb-4">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center text-2xl font-bold text-green-600 mr-4">
                  LTH
                </div>
                <div>
                  <h4 className="font-bold text-gray-800">Lê Thị Hoa</h4>
                  <p className="text-sm text-gray-500">ĐH Bách Khoa</p>
                </div>
              </div>
              <p className="text-gray-600 italic">
                "Học bổng đã giúp em giảm bớt gánh nặng tài chính cho gia đình. Em rất biết ơn!"
              </p>
              <div className="mt-4 flex text-yellow-400">
                ⭐⭐⭐⭐⭐
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-lg p-8">
              <div className="flex items-center mb-4">
                <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center text-2xl font-bold text-purple-600 mr-4">
                  PTB
                </div>
                <div>
                  <h4 className="font-bold text-gray-800">Phạm Tuấn Bình</h4>
                  <p className="text-sm text-gray-500">ĐH Quốc Gia</p>
                </div>
              </div>
              <p className="text-gray-600 italic">
                "Quy trình nộp hồ sơ rất đơn giản và nhanh chóng. Kết quả được thông báo kịp thời!"
              </p>
              <div className="mt-4 flex text-yellow-400">
                ⭐⭐⭐⭐⭐
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="py-20 bg-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-gray-800 mb-4">
              Câu hỏi thường gặp
            </h2>
            <p className="text-xl text-gray-600">
              Giải đáp thắc mắc của bạn
            </p>
          </div>

          <div className="space-y-6">
            <details className="bg-gray-50 rounded-lg p-6 cursor-pointer hover:bg-gray-100 transition">
              <summary className="font-bold text-lg text-gray-800 cursor-pointer">
                Ai có thể đăng ký học bổng?
              </summary>
              <p className="mt-4 text-gray-600">
                Tất cả sinh viên đang theo học tại các trường đại học có chương trình học bổng đều có thể đăng ký. Mỗi học bổng có tiêu chí riêng về GPA, điểm rèn luyện và hoàn cảnh.
              </p>
            </details>

            <details className="bg-gray-50 rounded-lg p-6 cursor-pointer hover:bg-gray-100 transition">
              <summary className="font-bold text-lg text-gray-800 cursor-pointer">
                Cần chuẩn bị những giấy tờ gì?
              </summary>
              <p className="mt-4 text-gray-600">
                Bạn cần chuẩn bị: Bảng điểm, giấy xác nhận hoàn cảnh khó khăn (nếu có), giấy xác nhận sinh viên, và các minh chứng khác theo yêu cầu của từng học bổng.
              </p>
            </details>

            <details className="bg-gray-50 rounded-lg p-6 cursor-pointer hover:bg-gray-100 transition">
              <summary className="font-bold text-lg text-gray-800 cursor-pointer">
                Bao lâu thì có kết quả?
              </summary>
              <p className="mt-4 text-gray-600">
                Thời gian xét duyệt thường từ 7-14 ngày làm việc sau khi hết hạn nộp hồ sơ. Bạn sẽ nhận được thông báo qua email và trên hệ thống.
              </p>
            </details>

            <details className="bg-gray-50 rounded-lg p-6 cursor-pointer hover:bg-gray-100 transition">
              <summary className="font-bold text-lg text-gray-800 cursor-pointer">
                Có thể nộp nhiều học bổng cùng lúc không?
              </summary>
              <p className="mt-4 text-gray-600">
                Có, bạn có thể nộp hồ sơ cho nhiều học bổng khác nhau. Tuy nhiên, mỗi học bổng chỉ được nộp 1 lần.
              </p>
            </details>

            <details className="bg-gray-50 rounded-lg p-6 cursor-pointer hover:bg-gray-100 transition">
              <summary className="font-bold text-lg text-gray-800 cursor-pointer">
                Học bổng có phải hoàn trả không?
              </summary>
              <p className="mt-4 text-gray-600">
                Không, các học bổng trong hệ thống đều là học bổng tài trợ, không cần hoàn trả. Bạn chỉ cần duy trì kết quả học tập tốt.
              </p>
            </details>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-blue-600 to-blue-700 text-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-4xl font-bold mb-6">
            {isAuthenticated ? 'Khám phá học bổng' : 'Sẵn sàng bắt đầu?'}
          </h2>
          <p className="text-xl text-blue-100 mb-8">
            {isAuthenticated 
              ? 'Tìm kiếm và nộp hồ sơ cho các học bổng phù hợp với bạn'
              : 'Đăng ký ngay hôm nay để không bỏ lỡ cơ hội nhận học bổng'}
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            {!isAuthenticated && (
              <Button
                variant="secondary"
                size="lg"
                onClick={() => navigate('/register')}
              >
                Đăng ký miễn phí
              </Button>
            )}
            <Button
              variant={isAuthenticated ? 'secondary' : 'outline'}
              size="lg"
              onClick={() => navigate('/scholarships')}
              className={isAuthenticated ? '' : 'bg-white bg-opacity-20 hover:bg-opacity-30 border-white text-white'}
            >
              Xem học bổng
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
};

export default HomePage;
