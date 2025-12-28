import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import useAuthStore from '../../store/useAuthStore';
import api from '../../services/api';

const Header = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout } = useAuthStore();
  const [showNotifications, setShowNotifications] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [loadingNotifs, setLoadingNotifs] = useState(false);

  // Fetch notifications khi component mount và user thay đổi
  useEffect(() => {
    if (user) {
      fetchNotifications();
    }
  }, [user]);

  // Refresh khi mở dropdown
  useEffect(() => {
    if (user && showNotifications) {
      fetchNotifications();
    }
  }, [showNotifications]);

  const fetchNotifications = async () => {
    if (!user) return;

    setLoadingNotifs(true);
    try {
      const notifs = [];

      if (user.role === 'STUDENT') {
        // Lấy hồ sơ của sinh viên
        const res = await api.get('/applications/my-history');
        const apps = res.data || [];

        apps.forEach((app) => {
          const scholarshipName = app.scholarship?.name || 'Học bổng';
          const statusMap = {
            PENDING: {
              title: `Hồ sơ "${scholarshipName}" đang chờ duyệt`,
              type: 'warning',
              icon: '⏳',
            },
            APPROVED: {
              title: `Hồ sơ "${scholarshipName}" đã được duyệt!`,
              type: 'success',
              icon: '✅',
            },
            NEED_UPDATE: {
              title: `Hồ sơ "${scholarshipName}" cần bổ sung`,
              type: 'error',
              icon: '📝',
            },
            REJECTED: {
              title: `Hồ sơ "${scholarshipName}" không được duyệt`,
              type: 'error',
              icon: '❌',
            },
            DISBURSED: {
              title: `Học bổng "${scholarshipName}" đã giải ngân!`,
              type: 'success',
              icon: '💰',
            },
          };

          const statusInfo = statusMap[app.status];
          if (statusInfo) {
            notifs.push({
              id: `app-${app.id}`,
              title: statusInfo.title,
              time: new Date(
                app.reviewed_at || app.submitted_at
              ).toLocaleDateString('vi-VN'),
              type: statusInfo.type,
              icon: statusInfo.icon,
              link: '/student/my-applications',
            });
          }
        });
      } else if (user.role === 'UNI_ADMIN') {
        // Lấy hồ sơ chờ duyệt và học bổng sắp hết hạn
        try {
          const [appsRes, scholarshipsRes] = await Promise.all([
            api.get('/applications?status=PENDING&limit=100'),
            api.get('/scholarships?status=OPEN'),
          ]);

          const pendingApps = appsRes.data?.applications || appsRes.data || [];
          const scholarships =
            scholarshipsRes.data?.scholarships || scholarshipsRes.data || [];

          // Thông báo hồ sơ chờ duyệt
          if (pendingApps.length > 0) {
            notifs.push({
              id: 'pending-apps',
              title: `Có ${pendingApps.length} hồ sơ mới chờ duyệt`,
              time: 'Cần xử lý',
              type: 'warning',
              icon: '📋',
              link: '/admin/applications',
            });
          }

          // Thông báo học bổng sắp hết hạn (trong 7 ngày)
          const now = new Date();
          const sevenDaysLater = new Date(
            now.getTime() + 7 * 24 * 60 * 60 * 1000
          );
          scholarships.forEach((s) => {
            const endDate = new Date(s.end_date);
            if (endDate <= sevenDaysLater && endDate >= now) {
              notifs.push({
                id: `scholarship-${s.id}`,
                title: `Học bổng "${s.name}" sắp hết hạn`,
                time: `Hết hạn: ${endDate.toLocaleDateString('vi-VN')}`,
                type: 'error',
                icon: '⚠️',
                link: `/admin/scholarships/${s.id}`,
              });
            }
          });
        } catch (err) {
          console.log('Error fetching admin notifications:', err);
        }
      } else if (user.role === 'SPONSOR') {
        // Lấy số sinh viên được duyệt học bổng của sponsor
        try {
          const res = await api.get('/sponsor/recipients');
          const recipients = res.data || [];

          // Đếm số sinh viên được duyệt gần đây (trong 7 ngày)
          const now = new Date();
          const sevenDaysAgo = new Date(
            now.getTime() - 7 * 24 * 60 * 60 * 1000
          );
          const recentApproved = recipients.filter((r) => {
            const approvedDate = new Date(r.reviewed_at || r.submitted_at);
            return r.status === 'APPROVED' && approvedDate >= sevenDaysAgo;
          });

          if (recentApproved.length > 0) {
            notifs.push({
              id: 'recent-approved',
              title: `Có ${recentApproved.length} sinh viên mới được duyệt học bổng`,
              time: '7 ngày qua',
              type: 'success',
              icon: '🎓',
              link: '/sponsor/recipients',
            });
          }

          // Tổng số sinh viên đang nhận học bổng
          const totalApproved = recipients.filter(
            (r) => r.status === 'APPROVED' || r.status === 'DISBURSED'
          ).length;
          if (totalApproved > 0) {
            notifs.push({
              id: 'total-recipients',
              title: `Tổng cộng ${totalApproved} sinh viên đang nhận học bổng`,
              time: 'Tổng quan',
              type: 'info',
              icon: '📊',
              link: '/sponsor/recipients',
            });
          }
        } catch (err) {
          console.log('Error fetching sponsor notifications:', err);
        }
      }

      setNotifications(notifs.slice(0, 5)); // Giới hạn 5 thông báo
    } catch (error) {
      console.log('Error fetching notifications:', error);
      setNotifications([]);
    } finally {
      setLoadingNotifs(false);
    }
  };

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (!event.target.closest('.notification-dropdown') && !event.target.closest('.notification-button')) {
        setShowNotifications(false);
      }
      if (!event.target.closest('.user-dropdown') && !event.target.closest('.user-button')) {
        setShowUserMenu(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Generate breadcrumb từ path
  const generateBreadcrumb = () => {
    const paths = location.pathname.split('/').filter(Boolean);
    const breadcrumbMap = {
      admin: 'Quản trị',
      manage: 'Quản lý',
      portal: 'Cổng thông tin',
      partner: 'Đối tác',
      dashboard: 'Dashboard',
      scholarships: 'Học bổng',
      applications: 'Hồ sơ',
      students: 'Sinh viên',
      universities: 'Trường đại học',
      profile: 'Hồ sơ',
      'my-applications': 'Hồ sơ của tôi',
    };

    return paths.map((path, index) => ({
      label: breadcrumbMap[path] || path,
      path: '/' + paths.slice(0, index + 1).join('/'),
      isLast: index === paths.length - 1,
    }));
  };

  const breadcrumbs = generateBreadcrumb();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const getNotificationStyle = (type) => {
    const styles = {
      success: 'bg-green-50 border-l-4 border-green-500',
      info: 'bg-blue-50 border-l-4 border-blue-500',
      warning: 'bg-yellow-50 border-l-4 border-yellow-500',
      error: 'bg-red-50 border-l-4 border-red-500',
    };
    return styles[type] || styles.info;
  };

  return (
    <header className="bg-white border-b border-gray-200 sticky top-0 z-30 shadow-sm">
      <div className="px-6 py-4">
        <div className="flex items-center justify-between">
          {/* Breadcrumb */}
          <div className="flex items-center space-x-2 text-sm">
            <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
            </svg>
            {breadcrumbs.map((crumb, index) => (
              <div key={index} className="flex items-center">
                {index > 0 && <span className="mx-2 text-gray-400">/</span>}
                {crumb.isLast ? (
                  <span className="font-semibold text-gray-800">{crumb.label}</span>
                ) : (
                  <button
                    onClick={() => navigate(crumb.path)}
                    className="text-gray-600 hover:text-blue-600 transition"
                  >
                    {crumb.label}
                  </button>
                )}
              </div>
            ))}
          </div>

          {/* Right side */}
          <div className="flex items-center space-x-4">
            {/* Search - chỉ hiển thị cho STUDENT */}
            {user?.role === 'STUDENT' && (
              <div className="hidden md:block">
                <div className="relative">
                  <input
                    type="text"
                    placeholder="Tìm kiếm..."
                    className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent w-64"
                  />
                  <svg className="w-5 h-5 text-gray-400 absolute left-3 top-2.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </div>
              </div>
            )}

            {/* Notifications */}
            <div className="relative">
              <button
                onClick={() => setShowNotifications(!showNotifications)}
                className="notification-button relative p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                </svg>
                {notifications.length > 0 && (
                  <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
                )}
              </button>

              {/* Notifications Dropdown */}
              {showNotifications && (
                <div className="notification-dropdown absolute right-0 mt-2 w-80 bg-white rounded-lg shadow-xl border border-gray-200 py-2">
                  <div className="px-4 py-2 border-b border-gray-200">
                    <h3 className="font-semibold text-gray-800">Thông báo</h3>
                  </div>
                  <div className="max-h-96 overflow-y-auto">
                    {loadingNotifs ? (
                      <div className="px-4 py-8 text-center text-gray-500">
                        <p className="text-sm">Đang tải...</p>
                      </div>
                    ) : notifications.length > 0 ? (
                      notifications.map((notif) => (
                        <div
                          key={notif.id}
                          onClick={() => {
                            setShowNotifications(false);
                            if (notif.link) navigate(notif.link);
                          }}
                          className={`px-4 py-3 hover:bg-gray-50 cursor-pointer border-b border-gray-100 ${getNotificationStyle(notif.type)}`}
                        >
                          <div className="flex items-start gap-3">
                            <span className="text-xl">{notif.icon}</span>
                            <div className="flex-1">
                              <p className="text-sm font-medium text-gray-800">{notif.title}</p>
                              <p className="text-xs text-gray-500 mt-1">{notif.time}</p>
                            </div>
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="px-4 py-8 text-center text-gray-500">
                        <span className="text-3xl">🔔</span>
                        <p className="mt-2 text-sm">Không có thông báo mới</p>
                      </div>
                    )}
                  </div>
                  {notifications.length > 0 && (
                    <div className="px-4 py-2 border-t border-gray-200">
                      <button
                        onClick={() => {
                          setShowNotifications(false);
                          const linkMap = {
                            STUDENT: '/student/my-applications',
                            UNI_ADMIN: '/admin/applications',
                            SPONSOR: '/sponsor/recipients',
                          };
                          navigate(linkMap[user?.role] || '/');
                        }}
                        className="text-sm text-blue-600 hover:text-blue-700 font-medium"
                      >
                        Xem tất cả
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* User Menu */}
            <div className="relative">
              <button
                onClick={() => setShowUserMenu(!showUserMenu)}
                className="user-button flex items-center space-x-3 p-2 hover:bg-gray-100 rounded-lg transition"
              >
                <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center text-white font-bold">
                  {user?.username?.charAt(0).toUpperCase()}
                </div>
                <div className="hidden md:block text-left">
                  <p className="text-sm font-semibold text-gray-800">{user?.username}</p>
                  <p className="text-xs text-gray-500">{user?.role}</p>
                </div>
                <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>

              {/* User Dropdown */}
              {showUserMenu && (
                <div className="user-dropdown absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-xl border border-gray-200 py-2">
                  <button
                    onClick={() => {
                      setShowUserMenu(false);
                      const dashboardMap = {
                        SUPER_ADMIN: '/system/dashboard',
                        UNI_ADMIN: '/admin/dashboard',
                        STUDENT: '/student/home',
                        SPONSOR: '/sponsor/dashboard',
                      };
                      navigate(dashboardMap[user?.role] || '/');
                    }}
                    className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-100 flex items-center space-x-2"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                    </svg>
                    <span>Dashboard</span>
                  </button>
                  <button
                    onClick={() => {
                      setShowUserMenu(false);
                      navigate('/profile');
                    }}
                    className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-100 flex items-center space-x-2"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                    <span>Hồ sơ cá nhân</span>
                  </button>
                  <button
                    onClick={() => {
                      setShowUserMenu(false);
                      // Sinh viên dùng route riêng không có sidebar
                      navigate(user?.role === 'STUDENT' ? '/student/change-password' : '/profile/change-password');
                    }}
                    className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-100 flex items-center space-x-2"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
                    </svg>
                    <span>Đổi mật khẩu</span>
                  </button>
                  <hr className="my-2" />
                  <button
                    onClick={handleLogout}
                    className="w-full px-4 py-2 text-left text-sm text-red-600 hover:bg-red-50 flex items-center space-x-2"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                    </svg>
                    <span>Đăng xuất</span>
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
