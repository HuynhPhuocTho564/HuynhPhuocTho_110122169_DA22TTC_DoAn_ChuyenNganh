import { useEffect, useState } from 'react';
import { toast } from 'react-toastify';
import api from '../../services/api';
import Button from '../../components/common/Button';
import Loading from '../../components/common/Loading';

const SystemUsersPage = () => {
  const [students, setStudents] = useState([]);
  const [universities, setUniversities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({ search: '', school_id: '' });
  const [pagination, setPagination] = useState({ page: 1, totalPages: 1, total: 0 });

  useEffect(() => {
    fetchData();
  }, [filters, pagination.page]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [studentsRes, unisRes] = await Promise.all([
        api.get('/students', { 
          params: { 
            ...filters, 
            page: pagination.page,
            limit: 20
          } 
        }),
        api.get('/universities'),
      ]);
      
      // API service đã unwrap response.data, nên studentsRes = { success, data: { students, pagination } }
      const studentsData = studentsRes?.data?.students || studentsRes?.data || [];
      
      // Universities: unisRes = { success, data: { universities, pagination } }
      const unisData = unisRes?.data?.universities || unisRes?.universities || [];
      setUniversities(unisData);
      
      // Map school names to students before setting
      const studentsWithSchool = (Array.isArray(studentsData) ? studentsData : []).map(student => {
        // Thử nhiều nguồn để lấy tên trường
        let schoolName = 
          student.user?.school?.name ||  // từ user.school (backend include)
          student.class?.major?.faculty?.school?.name;  // từ class hierarchy
        
        // Fallback: tìm trong universities list theo school_id
        if (!schoolName && student.user?.school_id && unisData.length > 0) {
          const school = unisData.find(u => u.id === student.user.school_id);
          schoolName = school?.name;
        }
        
        return {
          ...student,
          schoolName: schoolName || 'N/A'
        };
      });
      setStudents(studentsWithSchool);
      
      if (studentsRes?.data?.pagination) {
        setPagination(prev => ({
          ...prev,
          totalPages: studentsRes.data.pagination.totalPages || 1,
          total: studentsRes.data.pagination.total || 0
        }));
      }
    } catch (error) {
      console.error('Error fetching data:', error);
      toast.error(error.message);
      setStudents([]);
    } finally {
      setLoading(false);
    }
  };

  const handleToggleStatus = async (student) => {
    try {
      const newStatus = student.user?.status === 'ACTIVE' ? 'LOCKED' : 'ACTIVE';
      await api.put(`/users/${student.user_id}/status`, { status: newStatus });
      toast.success(`${newStatus === 'LOCKED' ? 'Khóa' : 'Mở khóa'} tài khoản thành công!`);
      fetchData();
    } catch (error) {
      toast.error(error.message);
    }
  };

  const handleResetPassword = async (student) => {
    if (!confirm(`Reset mật khẩu cho ${student.full_name || student.student_code}?`)) return;
    try {
      await api.post(`/users/${student.user_id}/reset-password`);
      toast.success('Đã reset mật khẩu về 123456');
    } catch (error) {
      toast.error(error.message);
    }
  };

  const getStatusColor = (status) => {
    return status === 'ACTIVE' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800';
  };

  if (loading && students.length === 0) return <Loading />;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">👨‍🎓 Quản lý Sinh viên</h1>
          <p className="text-gray-600 mt-1">Xem và quản lý tài khoản sinh viên trong hệ thống</p>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white rounded-xl shadow-lg p-6 border-l-4 border-blue-500">
          <p className="text-gray-600 text-sm">Tổng sinh viên</p>
          <p className="text-3xl font-bold text-blue-600">{pagination.total}</p>
        </div>
        <div className="bg-white rounded-xl shadow-lg p-6 border-l-4 border-green-500">
          <p className="text-gray-600 text-sm">Đang hoạt động</p>
          <p className="text-3xl font-bold text-green-600">
            {students.filter(s => s.user?.status === 'ACTIVE').length}
          </p>
        </div>
        <div className="bg-white rounded-xl shadow-lg p-6 border-l-4 border-red-500">
          <p className="text-gray-600 text-sm">Đã khóa</p>
          <p className="text-3xl font-bold text-red-600">
            {students.filter(s => s.user?.status === 'LOCKED').length}
          </p>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow p-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <input 
            type="text" 
            placeholder="Tìm theo MSSV, họ tên, email..."
            value={filters.search} 
            onChange={(e) => setFilters({ ...filters, search: e.target.value })}
            className="px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500" 
          />
          <select 
            value={filters.school_id} 
            onChange={(e) => setFilters({ ...filters, school_id: e.target.value })}
            className="px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
          >
            <option value="">Tất cả trường</option>
            {universities.map((uni) => (
              <option key={uni.id} value={uni.id}>{uni.name}</option>
            ))}
          </select>
          <Button variant="outline" onClick={fetchData}>🔄 Làm mới</Button>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl shadow-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Sinh viên</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">MSSV</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Email</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Trường</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Trạng thái</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {students.map((student) => (
                <tr key={student.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3">
                    <div className="flex items-center">
                      <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                        <span className="text-blue-600 font-bold">
                          {student.full_name?.charAt(0) || 'S'}
                        </span>
                      </div>
                      <div className="ml-3">
                        <p className="font-medium text-gray-900">{student.full_name || 'N/A'}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-sm font-medium text-gray-900">{student.student_code}</td>
                  <td className="px-4 py-3 text-sm text-gray-500">{student.user?.email || student.email || 'N/A'}</td>
                  <td className="px-4 py-3 text-sm text-gray-900">
                    {student.schoolName || 'N/A'}
                  </td>
                  <td className="px-4 py-3">
                    <span className={`px-2 py-1 rounded-full text-xs ${getStatusColor(student.user?.status)}`}>
                      {student.user?.status === 'ACTIVE' ? 'Hoạt động' : 'Đã khóa'}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleToggleStatus(student)}
                        className={`px-2 py-1 rounded text-xs ${
                          student.user?.status === 'ACTIVE' 
                            ? 'bg-orange-100 text-orange-700 hover:bg-orange-200' 
                            : 'bg-green-100 text-green-700 hover:bg-green-200'
                        }`}
                        title={student.user?.status === 'ACTIVE' ? 'Khóa tài khoản' : 'Mở khóa'}
                      >
                        {student.user?.status === 'ACTIVE' ? '🔒 Khóa' : '🔓 Mở'}
                      </button>
                      <button
                        onClick={() => handleResetPassword(student)}
                        className="px-2 py-1 rounded text-xs bg-gray-100 text-gray-700 hover:bg-gray-200"
                        title="Reset mật khẩu"
                      >
                        🔑 Reset
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {students.length === 0 && (
                <tr>
                  <td colSpan="6" className="px-4 py-8 text-center text-gray-500">
                    Không tìm thấy sinh viên nào
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {pagination.totalPages > 1 && (
          <div className="px-4 py-3 border-t flex items-center justify-between">
            <p className="text-sm text-gray-500">
              Trang {pagination.page} / {pagination.totalPages} (Tổng: {pagination.total} sinh viên)
            </p>
            <div className="flex gap-2">
              <Button 
                variant="outline" 
                size="sm"
                disabled={pagination.page <= 1}
                onClick={() => setPagination(prev => ({ ...prev, page: prev.page - 1 }))}
              >
                ← Trước
              </Button>
              <Button 
                variant="outline" 
                size="sm"
                disabled={pagination.page >= pagination.totalPages}
                onClick={() => setPagination(prev => ({ ...prev, page: prev.page + 1 }))}
              >
                Sau →
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default SystemUsersPage;
