import { useState } from 'react';

const GuidePage = () => {
  const [activeTab, setActiveTab] = useState('scholarship');

  return (
    <div className="max-w-5xl mx-auto px-4 py-12">
      {/* Header */}
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold text-gray-800 mb-4">📚 Hướng dẫn sử dụng</h1>
        <p className="text-gray-600 text-lg">
          Hướng dẫn chi tiết cách tìm kiếm học bổng và nộp hồ sơ
        </p>
      </div>

      {/* Tabs */}
      <div className="flex justify-center mb-8">
        <div className="bg-gray-100 rounded-xl p-1 inline-flex">
          <button
            onClick={() => setActiveTab('scholarship')}
            className={`px-6 py-3 rounded-lg font-medium transition ${
              activeTab === 'scholarship'
                ? 'bg-white text-blue-600 shadow'
                : 'text-gray-600 hover:text-gray-800'
            }`}
          >
            🎓 Hướng dẫn chọn học bổng
          </button>
          <button
            onClick={() => setActiveTab('document')}
            className={`px-6 py-3 rounded-lg font-medium transition ${
              activeTab === 'document'
                ? 'bg-white text-blue-600 shadow'
                : 'text-gray-600 hover:text-gray-800'
            }`}
          >
            📎 Hướng dẫn nộp minh chứng
          </button>
        </div>
      </div>

      {/* Content */}
      {activeTab === 'scholarship' ? (
        <div className="space-y-8">
          {/* Step 1 */}
          <div className="bg-white rounded-2xl shadow-lg p-8">
            <div className="flex items-start gap-6">
              <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center text-2xl font-bold text-blue-600 flex-shrink-0">
                1
              </div>
              <div>
                <h3 className="text-xl font-bold text-gray-800 mb-3">Đăng nhập vào hệ thống</h3>
                <p className="text-gray-600 mb-4">
                  Sử dụng tài khoản sinh viên được cấp để đăng nhập. Nếu chưa có tài khoản, 
                  hãy liên hệ phòng đào tạo của trường để được cấp.
                </p>
                <div className="bg-blue-50 rounded-lg p-4">
                  <p className="text-blue-800 text-sm">
                    💡 <strong>Mẹo:</strong> Tài khoản thường là mã sinh viên, mật khẩu mặc định là 123456
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Step 2 */}
          <div className="bg-white rounded-2xl shadow-lg p-8">
            <div className="flex items-start gap-6">
              <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center text-2xl font-bold text-blue-600 flex-shrink-0">
                2
              </div>
              <div>
                <h3 className="text-xl font-bold text-gray-800 mb-3">Xem danh sách học bổng</h3>
                <p className="text-gray-600 mb-4">
                  Vào mục <strong>"Học bổng"</strong> trên thanh menu để xem tất cả học bổng đang mở. 
                  Hệ thống sẽ tự động hiển thị học bổng của trường bạn trước.
                </p>
                <ul className="space-y-2 text-gray-600">
                  <li className="flex items-center gap-2">
                    <span className="text-green-500">✓</span>
                    Lọc theo trường, trạng thái học bổng
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="text-green-500">✓</span>
                    Xem giá trị, số suất, thời hạn nộp
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="text-green-500">✓</span>
                    Nhấn vào học bổng để xem chi tiết
                  </li>
                </ul>
              </div>
            </div>
          </div>

          {/* Step 3 */}
          <div className="bg-white rounded-2xl shadow-lg p-8">
            <div className="flex items-start gap-6">
              <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center text-2xl font-bold text-blue-600 flex-shrink-0">
                3
              </div>
              <div>
                <h3 className="text-xl font-bold text-gray-800 mb-3">Kiểm tra điều kiện</h3>
                <p className="text-gray-600 mb-4">
                  Mỗi học bổng có các tiêu chí xét duyệt khác nhau. Hãy đọc kỹ trước khi nộp:
                </p>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="bg-gray-50 rounded-lg p-4 text-center">
                    <p className="text-3xl mb-2">📊</p>
                    <p className="font-medium text-gray-800">GPA tối thiểu</p>
                    <p className="text-sm text-gray-500">Điểm trung bình tích lũy</p>
                  </div>
                  <div className="bg-gray-50 rounded-lg p-4 text-center">
                    <p className="text-3xl mb-2">⭐</p>
                    <p className="font-medium text-gray-800">Điểm rèn luyện</p>
                    <p className="text-sm text-gray-500">Điểm đánh giá rèn luyện</p>
                  </div>
                  <div className="bg-gray-50 rounded-lg p-4 text-center">
                    <p className="text-3xl mb-2">📄</p>
                    <p className="font-medium text-gray-800">Hoàn cảnh</p>
                    <p className="text-sm text-gray-500">Hoàn cảnh khó khăn</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Step 4 */}
          <div className="bg-white rounded-2xl shadow-lg p-8">
            <div className="flex items-start gap-6">
              <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center text-2xl font-bold text-green-600 flex-shrink-0">
                4
              </div>
              <div>
                <h3 className="text-xl font-bold text-gray-800 mb-3">Nộp hồ sơ</h3>
                <p className="text-gray-600 mb-4">
                  Nhấn nút <strong>"Nộp hồ sơ ngay"</strong> để bắt đầu. Hệ thống sẽ tự động 
                  đính kèm các minh chứng bạn đã upload trong "Hồ sơ của tôi".
                </p>
                <div className="bg-yellow-50 rounded-lg p-4">
                  <p className="text-yellow-800 text-sm">
                    ⚠️ <strong>Lưu ý:</strong> Bạn chỉ có thể nộp hồ sơ cho học bổng của trường mình
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="space-y-8">
          {/* Step 1 */}
          <div className="bg-white rounded-2xl shadow-lg p-8">
            <div className="flex items-start gap-6">
              <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center text-2xl font-bold text-purple-600 flex-shrink-0">
                1
              </div>
              <div>
                <h3 className="text-xl font-bold text-gray-800 mb-3">Vào "Hồ sơ của tôi"</h3>
                <p className="text-gray-600 mb-4">
                  Sau khi đăng nhập, nhấn vào avatar ở góc phải → chọn <strong>"Hồ sơ của tôi"</strong>. 
                  Đây là nơi bạn quản lý tất cả minh chứng cá nhân.
                </p>
              </div>
            </div>
          </div>

          {/* Step 2 */}
          <div className="bg-white rounded-2xl shadow-lg p-8">
            <div className="flex items-start gap-6">
              <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center text-2xl font-bold text-purple-600 flex-shrink-0">
                2
              </div>
              <div>
                <h3 className="text-xl font-bold text-gray-800 mb-3">Chuẩn bị các loại minh chứng</h3>
                <p className="text-gray-600 mb-4">
                  Hệ thống hỗ trợ các loại minh chứng sau:
                </p>
                <div className="space-y-3">
                  <div className="flex items-center gap-4 p-4 bg-blue-50 rounded-lg">
                    <span className="text-2xl">📊</span>
                    <div>
                      <p className="font-medium text-gray-800">Bảng điểm / Kết quả học tập</p>
                      <p className="text-sm text-gray-500">Bảng điểm học kỳ gần nhất hoặc bảng điểm tích lũy</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4 p-4 bg-yellow-50 rounded-lg">
                    <span className="text-2xl">📄</span>
                    <div>
                      <p className="font-medium text-gray-800">Giấy xác nhận hoàn cảnh khó khăn</p>
                      <p className="text-sm text-gray-500">Do UBND xã/phường cấp, còn hiệu lực</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4 p-4 bg-green-50 rounded-lg">
                    <span className="text-2xl">🪪</span>
                    <div>
                      <p className="font-medium text-gray-800">CCCD / CMND</p>
                      <p className="text-sm text-gray-500">Ảnh chụp 2 mặt rõ ràng</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg">
                    <span className="text-2xl">📁</span>
                    <div>
                      <p className="font-medium text-gray-800">Minh chứng khác</p>
                      <p className="text-sm text-gray-500">Giấy khen, chứng chỉ, giấy xác nhận hoạt động...</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Step 3 */}
          <div className="bg-white rounded-2xl shadow-lg p-8">
            <div className="flex items-start gap-6">
              <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center text-2xl font-bold text-purple-600 flex-shrink-0">
                3
              </div>
              <div>
                <h3 className="text-xl font-bold text-gray-800 mb-3">Upload minh chứng</h3>
                <p className="text-gray-600 mb-4">
                  Nhấn nút <strong>"Chỉnh sửa"</strong> → <strong>"+ Thêm file"</strong> để upload. 
                  Sau khi xong nhấn <strong>"Lưu thay đổi"</strong>.
                </p>
                <div className="bg-blue-50 rounded-lg p-4 space-y-2">
                  <p className="text-blue-800 text-sm font-medium">📋 Yêu cầu file:</p>
                  <ul className="text-blue-700 text-sm space-y-1">
                    <li>• Định dạng: PDF, JPG, PNG</li>
                    <li>• Kích thước tối đa: 5MB/file</li>
                    <li>• Hình ảnh rõ ràng, không bị mờ</li>
                    <li>• Đầy đủ thông tin, không bị cắt xén</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>

          {/* Step 4 */}
          <div className="bg-white rounded-2xl shadow-lg p-8">
            <div className="flex items-start gap-6">
              <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center text-2xl font-bold text-green-600 flex-shrink-0">
                4
              </div>
              <div>
                <h3 className="text-xl font-bold text-gray-800 mb-3">Nộp hồ sơ học bổng</h3>
                <p className="text-gray-600 mb-4">
                  Khi nộp hồ sơ học bổng, hệ thống sẽ tự động đính kèm tất cả minh chứng 
                  bạn đã upload. Bạn không cần upload lại!
                </p>
                <div className="bg-green-50 rounded-lg p-4">
                  <p className="text-green-800 text-sm">
                    ✅ <strong>Tiện lợi:</strong> Upload một lần, sử dụng cho nhiều học bổng
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* FAQ Section */}
      <div className="mt-16">
        <h2 className="text-2xl font-bold text-gray-800 mb-6 text-center">❓ Câu hỏi thường gặp</h2>
        <div className="space-y-4">
          <div className="bg-white rounded-xl shadow p-6">
            <h4 className="font-semibold text-gray-800 mb-2">Tôi có thể nộp nhiều học bổng cùng lúc không?</h4>
            <p className="text-gray-600">Có, bạn có thể nộp hồ sơ cho nhiều học bổng khác nhau nếu đủ điều kiện.</p>
          </div>
          <div className="bg-white rounded-xl shadow p-6">
            <h4 className="font-semibold text-gray-800 mb-2">Làm sao biết hồ sơ đã được duyệt?</h4>
            <p className="text-gray-600">Vào mục "Hồ sơ đã nộp" để theo dõi trạng thái. Hệ thống cũng sẽ gửi thông báo khi có cập nhật.</p>
          </div>
          <div className="bg-white rounded-xl shadow p-6">
            <h4 className="font-semibold text-gray-800 mb-2">Tôi có thể chỉnh sửa hồ sơ sau khi nộp không?</h4>
            <p className="text-gray-600">Sau khi nộp, bạn chỉ có thể bổ sung minh chứng nếu được yêu cầu. Thông tin cá nhân sẽ được đóng băng.</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default GuidePage;
