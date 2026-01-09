import { useState, useEffect } from 'react';
import api from '../../services/api';

const SystemAuditLogsPage = () => {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState({ page: 1, limit: 50, total: 0 });
  const [filters, setFilters] = useState({
    action: '',
    username: '',
    from_date: '',
    to_date: '',
    search: ''
  });
  const [stats, setStats] = useState(null);
  const [actions, setActions] = useState([]);

  useEffect(() => {
    fetchActions();
    fetchStats();
  }, []);

  useEffect(() => {
    fetchLogs();
  }, [pagination.page, filters]);

  const fetchActions = async () => {
    try {
      const res = await api.get('/audit-logs/actions');
      setActions(res.data || []);
    } catch (err) {
      console.error('Fetch actions error:', err);
    }
  };

  const fetchStats = async () => {
    try {
      const res = await api.get('/audit-logs/stats');
      setStats(res.data);
    } catch (err) {
      console.error('Fetch stats error:', err);
    }
  };

  const fetchLogs = async () => {
    setLoading(true);
    try {
      const params = {
        page: pagination.page,
        limit: pagination.limit,
        ...filters
      };
      // Remove empty filters
      Object.keys(params).forEach(key => !params[key] && delete params[key]);
      
      const res = await api.get('/audit-logs', { params });
      setLogs(res.data?.logs || []);
      setPagination(prev => ({ ...prev, ...res.data?.pagination }));
    } catch (err) {
      console.error('Fetch logs error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters(prev => ({ ...prev, [name]: value }));
    setPagination(prev => ({ ...prev, page: 1 }));
  };

  const getActionBadge = (action) => {
    const styles = {
      LOGIN: 'bg-green-100 text-green-800',
      LOGOUT: 'bg-gray-100 text-gray-800',
      LOGIN_FAILED: 'bg-red-100 text-red-800',
      CREATE: 'bg-blue-100 text-blue-800',
      UPDATE: 'bg-yellow-100 text-yellow-800',
      DELETE: 'bg-red-100 text-red-800',
      APPROVE: 'bg-green-100 text-green-800',
      REJECT: 'bg-red-100 text-red-800',
      EXPORT: 'bg-purple-100 text-purple-800',
      IMPORT: 'bg-indigo-100 text-indigo-800',
      CHANGE_PASSWORD: 'bg-orange-100 text-orange-800'
    };
    const actionInfo = actions.find(a => a.value === action);
    return (
      <span className={`px-2 py-1 rounded text-xs font-medium ${styles[action] || 'bg-gray-100'}`}>
        {actionInfo?.icon} {actionInfo?.label || action}
      </span>
    );
  };

  const formatDate = (date) => {
    if (!date) return '-';
    return new Date(date).toLocaleString('vi-VN');
  };

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-800">📋 Nhật ký Hệ thống (Audit Log)</h1>
        <p className="text-gray-600 mt-1">Theo dõi mọi hoạt động quan trọng trong hệ thống</p>
      </div>

      {/* Stats Cards */}
      {stats && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-green-50 p-4 rounded-lg border border-green-200">
            <p className="text-green-600 text-sm">Đăng nhập</p>
            <p className="text-2xl font-bold text-green-700">
              {stats.actionStats?.find(s => s.action === 'LOGIN')?.count || 0}
            </p>
          </div>
          <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
            <p className="text-blue-600 text-sm">Tạo mới</p>
            <p className="text-2xl font-bold text-blue-700">
              {stats.actionStats?.find(s => s.action === 'CREATE')?.count || 0}
            </p>
          </div>
          <div className="bg-yellow-50 p-4 rounded-lg border border-yellow-200">
            <p className="text-yellow-600 text-sm">Cập nhật</p>
            <p className="text-2xl font-bold text-yellow-700">
              {stats.actionStats?.find(s => s.action === 'UPDATE')?.count || 0}
            </p>
          </div>
          <div className="bg-red-50 p-4 rounded-lg border border-red-200">
            <p className="text-red-600 text-sm">Đăng nhập thất bại</p>
            <p className="text-2xl font-bold text-red-700">
              {stats.actionStats?.find(s => s.action === 'LOGIN_FAILED')?.count || 0}
            </p>
          </div>
        </div>
      )}

      {/* Filters */}
      <div className="bg-white p-4 rounded-lg shadow mb-6">
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          <select
            name="action"
            value={filters.action}
            onChange={handleFilterChange}
            className="border rounded-lg px-3 py-2 text-sm"
          >
            <option value="">-- Tất cả hành động --</option>
            {actions.map(a => (
              <option key={a.value} value={a.value}>{a.icon} {a.label}</option>
            ))}
          </select>
          <input
            type="text"
            name="username"
            placeholder="Tìm theo username..."
            value={filters.username}
            onChange={handleFilterChange}
            className="border rounded-lg px-3 py-2 text-sm"
          />
          <input
            type="date"
            name="from_date"
            value={filters.from_date}
            onChange={handleFilterChange}
            className="border rounded-lg px-3 py-2 text-sm"
          />
          <input
            type="date"
            name="to_date"
            value={filters.to_date}
            onChange={handleFilterChange}
            className="border rounded-lg px-3 py-2 text-sm"
          />
          <input
            type="text"
            name="search"
            placeholder="Tìm kiếm..."
            value={filters.search}
            onChange={handleFilterChange}
            className="border rounded-lg px-3 py-2 text-sm"
          />
        </div>
      </div>

      {/* Logs Table */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        {loading ? (
          <div className="p-8 text-center text-gray-500">Đang tải...</div>
        ) : logs.length === 0 ? (
          <div className="p-8 text-center text-gray-500">Không có dữ liệu</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 border-b">
                <tr>
                  <th className="px-4 py-3 text-left font-medium text-gray-600">Thời gian</th>
                  <th className="px-4 py-3 text-left font-medium text-gray-600">Người dùng</th>
                  <th className="px-4 py-3 text-left font-medium text-gray-600">Hành động</th>
                  <th className="px-4 py-3 text-left font-medium text-gray-600">Đối tượng</th>
                  <th className="px-4 py-3 text-left font-medium text-gray-600">Mô tả</th>
                  <th className="px-4 py-3 text-left font-medium text-gray-600">IP</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {logs.map(log => (
                  <tr key={log.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3 whitespace-nowrap text-gray-500">
                      {formatDate(log.created_at)}
                    </td>
                    <td className="px-4 py-3">
                      <div>
                        <p className="font-medium text-gray-800">{log.username || '-'}</p>
                        <p className="text-xs text-gray-500">{log.user_role}</p>
                      </div>
                    </td>
                    <td className="px-4 py-3">{getActionBadge(log.action)}</td>
                    <td className="px-4 py-3">
                      <div>
                        <p className="text-gray-800">{log.entity_name || '-'}</p>
                        <p className="text-xs text-gray-500">{log.entity_type}</p>
                      </div>
                    </td>
                    <td className="px-4 py-3 max-w-xs truncate text-gray-600" title={log.description}>
                      {log.description}
                    </td>
                    <td className="px-4 py-3 text-gray-500 text-xs">{log.ip_address}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination */}
        {pagination.totalPages > 1 && (
          <div className="px-4 py-3 border-t flex items-center justify-between">
            <p className="text-sm text-gray-600">
              Hiển thị {logs.length} / {pagination.total} bản ghi
            </p>
            <div className="flex gap-2">
              <button
                onClick={() => setPagination(p => ({ ...p, page: p.page - 1 }))}
                disabled={pagination.page <= 1}
                className="px-3 py-1 border rounded text-sm disabled:opacity-50"
              >
                ← Trước
              </button>
              <span className="px-3 py-1 text-sm">
                Trang {pagination.page} / {pagination.totalPages}
              </span>
              <button
                onClick={() => setPagination(p => ({ ...p, page: p.page + 1 }))}
                disabled={pagination.page >= pagination.totalPages}
                className="px-3 py-1 border rounded text-sm disabled:opacity-50"
              >
                Sau →
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default SystemAuditLogsPage;
