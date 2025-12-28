import { useNavigate } from 'react-router-dom';
import Button from '../components/common/Button';

const AboutPage = () => {
  const navigate = useNavigate();

  return (
    <div className="bg-gray-50">
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-blue-600 via-blue-700 to-indigo-800 text-white py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-5xl font-bold mb-6">
              Về Hệ thống Quản lý Học bổng
            </h1>
            <p className="text-xl text-blue-100 max-w-3xl mx-auto">
              Nền tảng kết nối sinh viên khó khăn với các cơ hội học bổng từ trường đại học và nhà tài trợ trên toàn quốc
            </p>
          </div>
        </div>
      </section>

      {/* Mission & Vision */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
            <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-2xl p-8 shadow-lg">
              <div className="w-16 h-16 bg-blue-600 rounded-full flex items-center justify-center mb-6">
                <span className="text-3xl">🎯</span>
              </div>
              <h2 className="text-3xl font-bold text-gray-800 mb-4">Sứ mệnh</h2>
              <p className="text-gray-700 text-lg leading-relaxed">
                Tạo cơ hội bình đẳng trong giáo dục bằng cách kết nối sinh viên có hoàn cảnh khó khăn với các nguồn học bổng phù hợp, giúp họ tiếp tục theo đuổi ước mơ học tập và phát triển bản thân.
              </p>
            </div>

            <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-2xl p-8 shadow-lg">
              <div className="w-16 h-16 bg-green-600 rounded-full flex items-center justify-center mb-6">
                <span className="text-3xl">🌟</span>
              </div>
              <h2 className="text-3xl font-bold text-gray-800 mb-4">Tầm nhìn</h2>
              <p className="text-gray-700 text-lg leading-relaxed">
                Trở thành nền tảng quản lý học bổng hàng đầu Việt Nam, nơi mọi sinh viên đều có cơ hội tiếp cận nguồn hỗ trợ tài chính để hoàn thành chương trình đại học của mình.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Core Values */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-gray-800 mb-4">Giá trị cốt lõi</h2>
            <p className="text-xl text-gray-600">Những nguyên tắc định hướng hoạt động của chúng tôi</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            <div className="bg-white rounded-xl shadow-lg p-6 text-center hover:shadow-xl transition">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-3xl">🤝</span>
              </div>
              <h3 className="text-xl font-bold text-gray-800 mb-3">Minh bạch</h3>
              <p className="text-gray-600">
                Quy trình xét duyệt rõ ràng, công khai và công bằng cho tất cả sinh viên
              </p>
            </div>

            <div className="bg-white rounded-xl shadow-lg p-6 text-center hover:shadow-xl transition">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-3xl">⚡</span>
              </div>
              <h3 className="text-xl font-bold text-gray-800 mb-3">Hiệu quả</h3>
              <p className="text-gray-600">
                Tối ưu hóa quy trình để sinh viên nhận được hỗ trợ nhanh chóng và kịp thời
              </p>
            </div>

            <div className="bg-white rounded-xl shadow-lg p-6 text-center hover:shadow-xl transition">
              <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-3xl">💡</span>
              </div>
              <h3 className="text-xl font-bold text-gray-800 mb-3">Đổi mới</h3>
              <p className="text-gray-600">
                Ứng dụng công nghệ hiện đại để cải thiện trải nghiệm người dùng
              </p>
            </div>

            <div className="bg-white rounded-xl shadow-lg p-6 text-center hover:shadow-xl transition">
              <div className="w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-3xl">❤️</span>
              </div>
              <h3 className="text-xl font-bold text-gray-800 mb-3">Tận tâm</h3>
              <p className="text-gray-600">
                Đặt lợi ích của sinh viên lên hàng đầu trong mọi quyết định
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-gray-800 mb-4">Cách thức hoạt động</h2>
            <p className="text-xl text-gray-600">Quy trình đơn giản và minh bạch</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Step 1 */}
            <div className="relative">
              <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl p-8 text-white shadow-xl">
                <div className="absolute -top-4 -left-4 w-12 h-12 bg-yellow-400 rounded-full flex items-center justify-center text-2xl font-bold text-gray-800 shadow-lg">
                  1
                </div>
                <div className="text-6xl mb-4">📝</div>
                <h3 className="text-2xl font-bold mb-3">Đăng ký</h3>
                <p className="text-blue-100">
                  Sinh viên tạo tài khoản và cập nhật thông tin cá nhân, học vấn, hoàn cảnh gia đình
                </p>
              </div>
            </div>

            {/* Step 2 */}
            <div className="relative">
              <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-2xl p-8 text-white shadow-xl">
                <div className="absolute -top-4 -left-4 w-12 h-12 bg-yellow-400 rounded-full flex items-center justify-center text-2xl font-bold text-gray-800 shadow-lg">
                  2
                </div>
                <div className="text-6xl mb-4">🔍</div>
                <h3 className="text-2xl font-bold mb-3">Tìm kiếm</h3>
                <p className="text-green-100">
                  Hệ thống gợi ý các học bổng phù hợp dựa trên tiêu chí GPA, điểm rèn luyện và hoàn cảnh
                </p>
              </div>
            </div>

            {/* Step 3 */}
            <div className="relative">
              <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-2xl p-8 text-white shadow-xl">
                <div className="absolute -top-4 -left-4 w-12 h-12 bg-yellow-400 rounded-full flex items-center justify-center text-2xl font-bold text-gray-800 shadow-lg">
                  3
                </div>
                <div className="text-6xl mb-4">✅</div>
                <h3 className="text-2xl font-bold mb-3">Nộp hồ sơ</h3>
                <p className="text-purple-100">
                  Nộp hồ sơ trực tuyến và theo dõi tiến trình xét duyệt qua hệ thống
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-20 bg-gradient-to-br from-blue-50 to-indigo-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-gray-800 mb-4">Tính năng nổi bật</h2>
            <p className="text-xl text-gray-600">Những gì làm nên sự khác biệt</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <div className="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition">
              <div className="text-4xl mb-4">🎯</div>
              <h3 className="text-xl font-bold text-gray-800 mb-3">Gợi ý thông minh</h3>
              <p className="text-gray-600">
                Hệ thống tự động gợi ý học bổng phù hợp dựa trên hồ sơ của bạn
              </p>
            </div>

            <div className="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition">
              <div className="text-4xl mb-4">📊</div>
              <h3 className="text-xl font-bold text-gray-800 mb-3">Theo dõi tiến trình</h3>
              <p className="text-gray-600">
                Cập nhật trạng thái hồ sơ theo thời gian thực
              </p>
            </div>

            <div className="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition">
              <div className="text-4xl mb-4">🔒</div>
              <h3 className="text-xl font-bold text-gray-800 mb-3">Bảo mật cao</h3>
              <p className="text-gray-600">
                Thông tin cá nhân được mã hóa và bảo vệ tuyệt đối
              </p>
            </div>

            <div className="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition">
              <div className="text-4xl mb-4">📱</div>
              <h3 className="text-xl font-bold text-gray-800 mb-3">Đa nền tảng</h3>
              <p className="text-gray-600">
                Truy cập mọi lúc mọi nơi trên máy tính, tablet và điện thoại
              </p>
            </div>

            <div className="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition">
              <div className="text-4xl mb-4">🔔</div>
              <h3 className="text-xl font-bold text-gray-800 mb-3">Thông báo kịp thời</h3>
              <p className="text-gray-600">
                Nhận thông báo về học bổng mới và kết quả xét duyệt
              </p>
            </div>

            <div className="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition">
              <div className="text-4xl mb-4">📈</div>
              <h3 className="text-xl font-bold text-gray-800 mb-3">Thống kê chi tiết</h3>
              <p className="text-gray-600">
                Báo cáo và phân tích dữ liệu cho nhà quản lý
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Statistics */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-gray-800 mb-4">Con số ấn tượng</h2>
            <p className="text-xl text-gray-600">Thành tựu của chúng tôi</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div className="text-center">
              <div className="text-5xl font-bold text-blue-600 mb-2">50+</div>
              <p className="text-gray-600 text-lg">Trường đại học</p>
            </div>
            <div className="text-center">
              <div className="text-5xl font-bold text-green-600 mb-2">200+</div>
              <p className="text-gray-600 text-lg">Học bổng</p>
            </div>
            <div className="text-center">
              <div className="text-5xl font-bold text-purple-600 mb-2">5,000+</div>
              <p className="text-gray-600 text-lg">Sinh viên được hỗ trợ</p>
            </div>
            <div className="text-center">
              <div className="text-5xl font-bold text-red-600 mb-2">50 tỷ+</div>
              <p className="text-gray-600 text-lg">Giá trị học bổng</p>
            </div>
          </div>
        </div>
      </section>

      {/* Team */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-gray-800 mb-4">Đội ngũ phát triển</h2>
            <p className="text-xl text-gray-600">Những người đứng sau dự án</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-white rounded-xl shadow-lg p-8 text-center hover:shadow-xl transition">
              <div className="w-24 h-24 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center mx-auto mb-4 text-white text-3xl font-bold">
                DT
              </div>
              <h3 className="text-xl font-bold text-gray-800 mb-2">Đội ngũ Kỹ thuật</h3>
              <p className="text-gray-600 mb-4">Phát triển và duy trì hệ thống</p>
              <div className="flex justify-center space-x-2">
                <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm">Backend</span>
                <span className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm">Frontend</span>
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-lg p-8 text-center hover:shadow-xl transition">
              <div className="w-24 h-24 bg-gradient-to-br from-green-500 to-green-600 rounded-full flex items-center justify-center mx-auto mb-4 text-white text-3xl font-bold">
                SP
              </div>
              <h3 className="text-xl font-bold text-gray-800 mb-2">Đội ngũ Sản phẩm</h3>
              <p className="text-gray-600 mb-4">Thiết kế trải nghiệm người dùng</p>
              <div className="flex justify-center space-x-2">
                <span className="px-3 py-1 bg-purple-100 text-purple-800 rounded-full text-sm">UX/UI</span>
                <span className="px-3 py-1 bg-pink-100 text-pink-800 rounded-full text-sm">Design</span>
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-lg p-8 text-center hover:shadow-xl transition">
              <div className="w-24 h-24 bg-gradient-to-br from-purple-500 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-4 text-white text-3xl font-bold">
                HT
              </div>
              <h3 className="text-xl font-bold text-gray-800 mb-2">Đội ngũ Hỗ trợ</h3>
              <p className="text-gray-600 mb-4">Chăm sóc và hỗ trợ người dùng</p>
              <div className="flex justify-center space-x-2">
                <span className="px-3 py-1 bg-yellow-100 text-yellow-800 rounded-full text-sm">Support</span>
                <span className="px-3 py-1 bg-red-100 text-red-800 rounded-full text-sm">Training</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Contact */}
      <section className="py-20 bg-gradient-to-r from-blue-600 to-blue-700 text-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-4xl font-bold mb-6">Liên hệ với chúng tôi</h2>
          <p className="text-xl text-blue-100 mb-8">
            Có câu hỏi hoặc cần hỗ trợ? Chúng tôi luôn sẵn sàng giúp đỡ!
          </p>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div className="bg-white bg-opacity-20 rounded-lg p-6">
              <div className="text-3xl mb-2">📧</div>
              <p className="font-semibold mb-1">Email</p>
              <p className="text-blue-100">support@scholarship.edu.vn</p>
            </div>
            <div className="bg-white bg-opacity-20 rounded-lg p-6">
              <div className="text-3xl mb-2">📞</div>
              <p className="font-semibold mb-1">Hotline</p>
              <p className="text-blue-100">1900-xxxx</p>
            </div>
            <div className="bg-white bg-opacity-20 rounded-lg p-6">
              <div className="text-3xl mb-2">📍</div>
              <p className="font-semibold mb-1">Địa chỉ</p>
              <p className="text-blue-100">Việt Nam</p>
            </div>
          </div>

          <div className="flex flex-wrap justify-center gap-4">
            <Button
              variant="secondary"
              size="lg"
              onClick={() => navigate('/scholarships')}
            >
              Xem học bổng
            </Button>
            <Button
              variant="outline"
              size="lg"
              onClick={() => navigate('/register')}
              className="bg-white bg-opacity-20 hover:bg-opacity-30 border-white text-white"
            >
              Đăng ký ngay
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
};

export default AboutPage;
