import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import useAuthStore from '../../store/useAuthStore';

const Sidebar = () => {
  const location = useLocation();
  const { user } = useAuthStore();
  const [collapsed, setCollapsed] = useState(false);

  // Menu items theo role - Cấu trúc 5 Portal
  const menuItems = {
    SUPER_ADMIN: [
      { icon: '🛡️', label: 'System Dashboard', path: '/system/dashboard' },
      { icon: '🏫', label: 'Quản lý Trường', path: '/system/universities' },
      { icon: '👨‍🎓', label: 'Quản lý Sinh viên', path: '/system/users' },
      { icon: '💼', label: 'Quản lý Nhà tài trợ', path: '/system/sponsors' },
      { icon: '📈', label: 'Báo cáo', path: '/system/reports' },
      { icon: '📋', label: 'Nhật ký Hệ thống', path: '/system/audit-logs' },
      { icon: '💾', label: 'Sao lưu Database', path: '/system/backup' },
    ],
    UNI_ADMIN: [
      { icon: '📊', label: 'Dashboard', path: '/admin/dashboard' },
      { icon: '🎓', label: 'Quản lý Học bổng', path: '/admin/scholarships' },
      { icon: '📋', label: 'Xét duyệt Hồ sơ', path: '/admin/applications' },
      { icon: '👨‍🎓', label: 'Quản lý Sinh viên', path: '/admin/students' },
      { icon: '📈', label: 'Báo cáo', path: '/admin/reports' },
    ],
    STUDENT: [
      { icon: '🏠', label: 'Trang chủ', path: '/student/home' },
      { icon: '📋', label: 'Hồ sơ của tôi', path: '/student/my-applications' },
      { icon: '👤', label: 'Thông tin cá nhân', path: '/student/profile' },
    ],
    SPONSOR: [
      { icon: '📊', label: 'Bảng điều khiển', path: '/sponsor/dashboard' },
      { icon: '📋', label: 'Gói tài trợ', path: '/sponsor/projects' },
      { icon: '👨‍🎓', label: 'Sinh viên nhận HB', path: '/sponsor/recipients' },
      { icon: '📈', label: 'Báo cáo', path: '/sponsor/reports' },
      { icon: '🏢', label: 'Hồ sơ đơn vị', path: '/sponsor/profile' },
    ],
  };

  const currentMenu = menuItems[user?.role] || [];

  const isActive = (path) => location.pathname === path || location.pathname.startsWith(path + '/');

  const getRoleLabel = (role) => {
    const labels = {
      SUPER_ADMIN: 'System Admin',
      UNI_ADMIN: 'Quản trị viên',
      STUDENT: 'Sinh viên',
      SPONSOR: 'Nhà tài trợ',
    };
    return labels[role] || role;
  };

  const getRoleColor = (role) => {
    const colors = {
      SUPER_ADMIN: 'bg-red-600',
      UNI_ADMIN: 'bg-blue-600',
      STUDENT: 'bg-green-600',
      SPONSOR: 'bg-purple-600',
    };
    return colors[role] || 'bg-gray-600';
  };

  return (
    <div
      className={`bg-gradient-to-b from-blue-900 to-blue-800 text-white h-screen fixed left-0 top-0 transition-all duration-300 flex flex-col ${
        collapsed ? 'w-20' : 'w-64'
      } shadow-2xl z-40`}
    >
      {/* Logo & Toggle */}
      <div className="p-4 border-b border-blue-700 flex items-center justify-between">
        {!collapsed && (
          <div className="flex items-center space-x-2">
            <div className="w-10 h-10 bg-white rounded-lg flex items-center justify-center">
              <span className="text-2xl">🎓</span>
            </div>
            <div>
              <h1 className="font-bold text-sm">Scholarship</h1>
              <p className="text-xs text-blue-300">System</p>
            </div>
          </div>
        )}
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="p-2 hover:bg-blue-700 rounded-lg transition"
        >
          {collapsed ? '→' : '←'}
        </button>
      </div>

      {/* User Info */}
      {!collapsed && (
        <div className="p-4 border-b border-blue-700">
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 bg-blue-600 rounded-full flex items-center justify-center text-xl font-bold">
              {user?.full_name?.charAt(0).toUpperCase() || user?.username?.charAt(0).toUpperCase()}
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-semibold truncate">{user?.full_name || user?.username}</p>
              <p className="text-xs text-blue-300 truncate">{user?.email}</p>
              <span className={`inline-block mt-1 px-2 py-0.5 ${getRoleColor(user?.role)} rounded text-xs`}>
                {getRoleLabel(user?.role)}
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Menu Items - Flex grow để chiếm không gian còn lại */}
      <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
        {currentMenu.map((item, index) => {
          if (item.type === 'divider') {
            return !collapsed ? (
              <div key={index} className="pt-4 pb-2">
                <p className="text-xs text-blue-400 uppercase tracking-wider">{item.label}</p>
              </div>
            ) : (
              <hr key={index} className="border-blue-700 my-2" />
            );
          }

          return (
            <Link
              key={item.path}
              to={item.path}
              className={`flex items-center space-x-3 px-4 py-3 rounded-lg transition-all ${
                isActive(item.path)
                  ? 'bg-blue-600 shadow-lg'
                  : 'hover:bg-blue-700'
              }`}
            >
              <span className="text-xl">{item.icon}</span>
              {!collapsed && <span className="font-medium text-sm">{item.label}</span>}
            </Link>
          );
        })}
      </nav>

      {/* Quick Links - Không dùng absolute nữa */}
      {!collapsed && (
        <div className="px-4 py-2 space-y-1 border-t border-blue-700">
          <Link
            to="/profile"
            className="flex items-center space-x-3 px-4 py-2 rounded-lg hover:bg-blue-700 transition"
          >
            <span className="text-xl">👤</span>
            <span className="text-sm">Tài khoản</span>
          </Link>
          <Link
            to="/"
            className="flex items-center space-x-3 px-4 py-2 rounded-lg hover:bg-blue-700 transition"
          >
            <span className="text-xl">🌐</span>
            <span className="text-sm">Về trang web</span>
          </Link>
        </div>
      )}

      {/* Footer */}
      {!collapsed && (
        <div className="p-4 border-t border-blue-700 bg-blue-900">
          <p className="text-xs text-blue-300 text-center">© 2024 Scholarship System</p>
          <p className="text-xs text-blue-400 text-center mt-1">Hệ thống Quản lý Học bổng</p>
        </div>
      )}
    </div>
  );
};

export default Sidebar;
