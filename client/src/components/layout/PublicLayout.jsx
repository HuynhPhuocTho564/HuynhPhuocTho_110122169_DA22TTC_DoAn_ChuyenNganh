import { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import useAuthStore from '../../store/useAuthStore';

const PublicLayout = ({ children }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { isAuthenticated, user, logout } = useAuthStore();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);

  // Check if current path matches
  const isActive = (path) => {
    if (path === '/') return location.pathname === '/';
    return location.pathname.startsWith(path);
  };

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (!event.target.closest('.user-dropdown') && !event.target.closest('.user-button')) {
        setShowUserMenu(false);
      }
      if (!event.target.closest('.notif-dropdown') && !event.target.closest('.notif-button')) {
        setShowNotifications(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Lấy đường dẫn dashboard theo role
  const getDashboardPath = () => {
    const dashboardMap = {
      SUPER_ADMIN: '/system/dashboard',
      UNI_ADMIN: '/admin/dashboard',
      SPONSOR: '/sponsor/dashboard',
    };
    return dashboardMap[user?.role] || '/';
  };

  // Menu items theo role
  const getUserMenuItems = () => {
    if (user?.role === 'STUDENT') {
      return [
        { label: 'Hồ sơ của tôi', path: '/student/my-profile', icon: '📁' },
        { label: 'Hồ sơ đã nộp', path: '/student/my-applications', icon: '📋' },
        { label: 'Thông tin cá nhân', path: '/student/profile', icon: '👤' },
      ];
    }
    return [
      { label: 'Dashboard', path: getDashboardPath(), icon: '🏠' },
      { label: 'Hồ sơ cá nhân', path: '/profile', icon: '👤' },
    ];
  };

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  // Mock notifications
  const notifications = [
    { id: 1, title: 'Học bổng mới đã mở', time: '1 giờ trước', unread: true },
    { id: 2, title: 'Hồ sơ đang chờ xét duyệt', time: '2 giờ trước', unread: true },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm sticky top-0 z-50">
        <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Logo */}
            <Link to="/" className="flex items-center space-x-2">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-blue-700 rounded-lg flex items-center justify-center">
                <span className="text-white text-2xl font-bold">🎓</span>
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-800">Học bổng</h1>
                <p className="text-xs text-gray-500">Hỗ trợ sinh viên</p>
              </div>
            </Link>

            {/* Desktop Menu */}
            <div className="hidden md:flex items-center space-x-8">
              <Link
                to="/"
                className={`text-xl font-medium transition ${isActive('/') && location.pathname === '/' ? 'text-blue-600 border-b-2 border-blue-600 pb-1' : 'text-gray-700 hover:text-blue-600'}`}
              >
                Trang chủ
              </Link>
              <Link
                to="/scholarships"
                className={`text-xl font-medium transition ${isActive('/scholarships') ? 'text-blue-600 border-b-2 border-blue-600 pb-1' : 'text-gray-700 hover:text-blue-600'}`}
              >
                Học bổng
              </Link>
              <Link
                to="/universities"
                className={`text-xl font-medium transition ${isActive('/universities') ? 'text-blue-600 border-b-2 border-blue-600 pb-1' : 'text-gray-700 hover:text-blue-600'}`}
              >
                Danh sách trường
              </Link>
              <Link
                to="/about"
                className={`text-xl font-medium transition ${isActive('/about') ? 'text-blue-600 border-b-2 border-blue-600 pb-1' : 'text-gray-700 hover:text-blue-600'}`}
              >
                Giới thiệu
              </Link>
              <Link
                to="/guide"
                className={`text-xl font-medium transition ${isActive('/guide') ? 'text-blue-600 border-b-2 border-blue-600 pb-1' : 'text-gray-700 hover:text-blue-600'}`}
              >
                Hướng dẫn
              </Link>
            </div>

            {/* Auth Buttons */}
            <div className="hidden md:flex items-center space-x-4">
              {isAuthenticated ? (
                <div className="flex items-center space-x-3">
                  {/* Notification Bell */}
                  <div className="relative">
                    <button
                      onClick={() => setShowNotifications(!showNotifications)}
                      className="notif-button relative p-2 text-gray-600 hover:bg-gray-100 rounded-full transition"
                    >
                      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                      </svg>
                      {notifications.some(n => n.unread) && (
                        <span className="absolute top-1 right-1 w-2.5 h-2.5 bg-red-500 rounded-full border-2 border-white"></span>
                      )}
                    </button>

                    {/* Notifications Dropdown */}
                    {showNotifications && (
                      <div className="notif-dropdown absolute right-0 mt-2 w-80 bg-white rounded-xl shadow-xl border border-gray-200 py-2 z-50">
                        <div className="px-4 py-2 border-b border-gray-100">
                          <h3 className="font-semibold text-gray-800">Thông báo</h3>
                        </div>
                        <div className="max-h-64 overflow-y-auto">
                          {notifications.length > 0 ? notifications.map((notif) => (
                            <div key={notif.id} className="px-4 py-3 hover:bg-gray-50 cursor-pointer border-b border-gray-50">
                              <p className="text-sm text-gray-800">{notif.title}</p>
                              <p className="text-xs text-gray-500 mt-1">{notif.time}</p>
                            </div>
                          )) : (
                            <p className="px-4 py-3 text-sm text-gray-500">Không có thông báo mới</p>
                          )}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* User Avatar & Dropdown */}
                  <div className="relative">
                    <button
                      onClick={() => setShowUserMenu(!showUserMenu)}
                      className="user-button flex items-center space-x-2 p-1.5 hover:bg-gray-100 rounded-full transition"
                    >
                      <div className="w-9 h-9 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center text-white font-bold text-sm">
                        {user?.username?.charAt(0).toUpperCase() || 'U'}
                      </div>
                      <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                      </svg>
                    </button>

                    {/* User Dropdown */}
                    {showUserMenu && (
                      <div className="user-dropdown absolute right-0 mt-2 w-56 bg-white rounded-xl shadow-xl border border-gray-200 py-2 z-50">
                        {/* User Info */}
                        <div className="px-4 py-3 border-b border-gray-100">
                          <p className="font-semibold text-gray-800">{user?.full_name || user?.username}</p>
                          <p className="text-sm text-gray-500">{user?.email}</p>
                        </div>

                        {/* Menu Items */}
                        <div className="py-1">
                          {getUserMenuItems().map((item, idx) => (
                            <button
                              key={idx}
                              onClick={() => { setShowUserMenu(false); navigate(item.path); }}
                              className="w-full px-4 py-2.5 text-left text-sm text-gray-700 hover:bg-gray-50 flex items-center space-x-3"
                            >
                              <span>{item.icon}</span>
                              <span>{item.label}</span>
                            </button>
                          ))}
                        </div>

                        {/* Logout */}
                        <div className="border-t border-gray-100 pt-1">
                          <button
                            onClick={handleLogout}
                            className="w-full px-4 py-2.5 text-left text-sm text-red-600 hover:bg-red-50 flex items-center space-x-3"
                          >
                            <span>🚪</span>
                            <span>Đăng xuất</span>
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              ) : (
                <>
                  <button
                    onClick={() => navigate('/login')}
                    className="px-4 py-2 text-gray-700 hover:text-blue-600 font-medium transition"
                  >
                    Đăng nhập
                  </button>
                  <button
                    onClick={() => navigate('/register')}
                    className="px-6 py-2 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-lg hover:shadow-lg transition font-medium"
                  >
                    Đăng ký
                  </button>
                </>
              )}
            </div>

            {/* Mobile menu button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 rounded-lg hover:bg-gray-100"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
          </div>

          {/* Mobile Menu */}
          {mobileMenuOpen && (
            <div className="md:hidden py-4 border-t border-gray-200">
              <div className="flex flex-col space-y-4">
                <Link to="/" className={`font-medium ${isActive('/') && location.pathname === '/' ? 'text-blue-600' : 'text-gray-700 hover:text-blue-600'}`}>
                  Trang chủ
                </Link>
                <Link to="/scholarships" className={`font-medium ${isActive('/scholarships') ? 'text-blue-600' : 'text-gray-700 hover:text-blue-600'}`}>
                  Học bổng
                </Link>
                <Link to="/universities" className={`font-medium ${isActive('/universities') ? 'text-blue-600' : 'text-gray-700 hover:text-blue-600'}`}>
                  Danh sách trường
                </Link>
                <Link to="/about" className={`font-medium ${isActive('/about') ? 'text-blue-600' : 'text-gray-700 hover:text-blue-600'}`}>
                  Giới thiệu
                </Link>
                <Link to="/guide" className={`font-medium ${isActive('/guide') ? 'text-blue-600' : 'text-gray-700 hover:text-blue-600'}`}>
                  Hướng dẫn
                </Link>
                <hr />
                {isAuthenticated ? (
                  <>
                    <div className="py-2 text-sm text-gray-500">
                      Xin chào, {user?.full_name || user?.username}
                    </div>
                    {getUserMenuItems().map((item, idx) => (
                      <button
                        key={idx}
                        onClick={() => { setMobileMenuOpen(false); navigate(item.path); }}
                        className="text-left text-gray-700 hover:text-blue-600 font-medium flex items-center space-x-2"
                      >
                        <span>{item.icon}</span>
                        <span>{item.label}</span>
                      </button>
                    ))}
                    <button
                      onClick={handleLogout}
                      className="text-left px-4 py-2 bg-red-500 text-white rounded-lg"
                    >
                      🚪 Đăng xuất
                    </button>
                  </>
                ) : (
                  <>
                    <button
                      onClick={() => navigate('/login')}
                      className="text-left text-gray-700 hover:text-blue-600 font-medium"
                    >
                      Đăng nhập
                    </button>
                    <button
                      onClick={() => navigate('/register')}
                      className="text-left px-4 py-2 bg-blue-600 text-white rounded-lg"
                    >
                      Đăng ký
                    </button>
                  </>
                )}
              </div>
            </div>
          )}
        </nav>
      </header>

      {/* Main Content */}
      <main>
        {children}
      </main>

      {/* Footer */}
      <footer className="bg-gray-900 text-white mt-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <h3 className="text-lg font-bold mb-4">Về chúng tôi</h3>
              <p className="text-gray-400 text-sm">
                Hệ thống quản lý học bổng hỗ trợ sinh viên khó khăn tiếp cận cơ hội học tập.
              </p>
            </div>
            <div>
              <h3 className="text-lg font-bold mb-4">Liên kết</h3>
              <ul className="space-y-2 text-sm">
                <li><Link to="/" className="text-gray-400 hover:text-white">Trang chủ</Link></li>
                <li><Link to="/scholarships" className="text-gray-400 hover:text-white">Học bổng</Link></li>
                <li><Link to="/universities" className="text-gray-400 hover:text-white">Danh sách trường</Link></li>
              </ul>
            </div>
            <div>
              <h3 className="text-lg font-bold mb-4">Hỗ trợ</h3>
              <ul className="space-y-2 text-sm">
                <li><Link to="/guide" className="text-gray-400 hover:text-white">Hướng dẫn</Link></li>
                <li><Link to="/guide" className="text-gray-400 hover:text-white">Câu hỏi thường gặp</Link></li>
                <li><Link to="/about" className="text-gray-400 hover:text-white">Liên hệ</Link></li>
              </ul>
            </div>
            <div>
              <h3 className="text-lg font-bold mb-4">Liên hệ</h3>
              <ul className="space-y-2 text-sm text-gray-400">
                <li>📧 support@scholarship.edu.vn</li>
                <li>📞 1900-xxxx</li>
                <li>📍 Việt Nam</li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-800 mt-8 pt-8 text-center text-gray-400 text-sm">
            <p>© 2024 Hệ thống Quản lý Học bổng. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default PublicLayout;
