import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import scholarshipService from '../../services/scholarshipService';
import Button from '../../components/common/Button';
import Badge from '../../components/common/Badge';
import Loading from '../../components/common/Loading';
import Modal from '../../components/common/Modal';

const AdminScholarshipsPage = () => {
  const navigate = useNavigate();
  const [scholarships, setScholarships] = useState([]);
  const [loading, setLoading] = useState(true);
  const [deleteModal, setDeleteModal] = useState({ open: false, id: null });
  const [filters, setFilters] = useState({ status: '', search: '' });

  useEffect(() => {
    fetchScholarships();
  }, [filters]);

  const fetchScholarships = async () => {
    try {
      setLoading(true);
      const response = await scholarshipService.getAll(filters);
      const data = response.data?.scholarships || response.scholarships || [];
      setScholarships(Array.isArray(data) ? data : []);
    } catch (error) {
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    try {
      await scholarshipService.delete(deleteModal.id);
      toast.success('Xóa học bổng thành công');
      setDeleteModal({ open: false, id: null });
      fetchScholarships();
    } catch (error) {
      toast.error(error.message);
    }
  };

  const getStatusBadge = (status) => {
    const map = {
      OPEN: { variant: 'success', label: 'Đang mở' },
      CLOSED: { variant: 'warning', label: 'Đã đóng' },
      FINISHED: { variant: 'danger', label: 'Kết thúc' },
    };
    const config = map[status] || map.OPEN;
    return <Badge variant={config.variant}>{config.label}</Badge>;
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount);
  };

  if (loading) return <Loading />;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">Quản lý Học bổng</h1>
          <p className="text-gray-600 mt-1">Tạo và quản lý các đợt học bổng</p>
        </div>
        <Button variant="primary" onClick={() => navigate('/admin/scholarships/create')}>
          ➕ Tạo học bổng mới
        </Button>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow p-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <input
            type="text"
            placeholder="Tìm kiếm học bổng..."
            value={filters.search}
            onChange={(e) => setFilters({ ...filters, search: e.target.value })}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
          />
          <select
            value={filters.status}
            onChange={(e) => setFilters({ ...filters, status: e.target.value })}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
          >
            <option value="">Tất cả trạng thái</option>
            <option value="OPEN">Đang mở</option>
            <option value="CLOSED">Đã đóng</option>
            <option value="FINISHED">Kết thúc</option>
          </select>
          <Button variant="outline" onClick={fetchScholarships}>🔄 Làm mới</Button>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Tên học bổng</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Học kỳ</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Giá trị</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Số suất</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Hạn nộp</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Trạng thái</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Thao tác</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {scholarships.map((s) => (
              <tr key={s.id} className="hover:bg-gray-50">
                <td className="px-6 py-4">
                  <div className="font-medium text-gray-900">{s.name}</div>
                </td>
                <td className="px-6 py-4 text-sm text-gray-500">
                  {s.semester} - {s.academic_year}
                </td>
                <td className="px-6 py-4 text-sm font-medium text-blue-600">
                  {formatCurrency(s.amount_per_slot)}
                </td>
                <td className="px-6 py-4 text-sm text-gray-500">{s.slots} suất</td>
                <td className="px-6 py-4 text-sm text-gray-500">
                  {new Date(s.end_date).toLocaleDateString('vi-VN')}
                </td>
                <td className="px-6 py-4">{getStatusBadge(s.status)}</td>
                <td className="px-6 py-4">
                  <div className="flex space-x-2">
                    <Button size="sm" variant="outline" onClick={() => navigate(`/admin/scholarships/${s.id}/edit`)}>
                      ✏️
                    </Button>
                    <Button size="sm" variant="danger" onClick={() => setDeleteModal({ open: true, id: s.id })}>
                      🗑️
                    </Button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {scholarships.length === 0 && (
          <div className="text-center py-12 text-gray-500">Chưa có học bổng nào</div>
        )}
      </div>

      {/* Delete Modal */}
      <Modal isOpen={deleteModal.open} onClose={() => setDeleteModal({ open: false, id: null })} title="Xác nhận xóa">
        <p className="text-gray-600 mb-4">Bạn có chắc muốn xóa học bổng này? Hành động không thể hoàn tác.</p>
        <div className="flex justify-end space-x-3">
          <Button variant="outline" onClick={() => setDeleteModal({ open: false, id: null })}>Hủy</Button>
          <Button variant="danger" onClick={handleDelete}>Xóa</Button>
        </div>
      </Modal>
    </div>
  );
};

export default AdminScholarshipsPage;
