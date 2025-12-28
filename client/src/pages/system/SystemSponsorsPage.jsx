import { useEffect, useState } from 'react';
import api from '../../services/api';
import Loading from '../../components/common/Loading';
import Button from '../../components/common/Button';
import Modal from '../../components/common/Modal';
import Input from '../../components/common/Input';

const SystemSponsorsPage = () => {
  const [sponsors, setSponsors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingSponsor, setEditingSponsor] = useState(null);
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    full_name: '',
    organization_name: '',
    phone: '',
  });

  useEffect(() => {
    fetchSponsors();
  }, []);

  const fetchSponsors = async () => {
    try {
      setLoading(true);
      const response = await api.get('/users/sponsors');
      const data = response.data?.data || response.data;
      setSponsors(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Error fetching sponsors:', error);
      setSponsors([]);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingSponsor) {
        await api.put(`/users/${editingSponsor.id}`, formData);
      } else {
        await api.post('/users', { ...formData, role: 'SPONSOR' });
      }
      setShowModal(false);
      setEditingSponsor(null);
      setFormData({ username: '', email: '', password: '', full_name: '', organization_name: '', phone: '' });
      fetchSponsors();
    } catch (error) {
      console.error('Error saving sponsor:', error);
      alert(error.response?.data?.message || 'Có lỗi xảy ra');
    }
  };

  const handleEdit = (sponsor) => {
    setEditingSponsor(sponsor);
    setFormData({
      username: sponsor.username || '',
      email: sponsor.email || '',
      password: '',
      full_name: sponsor.full_name || '',
      organization_name: sponsor.organization_name || '',
      phone: sponsor.phone || '',
    });
    setShowModal(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Bạn có chắc muốn xóa nhà tài trợ này?')) return;
    try {
      await api.delete(`/users/${id}`);
      fetchSponsors();
    } catch (error) {
      console.error('Error deleting sponsor:', error);
      alert(error.response?.data?.message || 'Có lỗi xảy ra');
    }
  };

  const handleToggleStatus = async (sponsor) => {
    try {
      await api.put(`/users/${sponsor.id}`, { is_active: !sponsor.is_active });
      fetchSponsors();
    } catch (error) {
      console.error('Error toggling status:', error);
    }
  };

  if (loading) return <Loading />;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">💼 Quản lý Nhà tài trợ</h1>
          <p className="text-gray-600 mt-1">Quản lý tài khoản và thông tin các nhà tài trợ trong hệ thống</p>
        </div>
        <Button
          variant="primary"
          onClick={() => {
            setEditingSponsor(null);
            setFormData({ username: '', email: '', password: '', full_name: '', organization_name: '', phone: '' });
            setShowModal(true);
          }}
        >
          + Thêm nhà tài trợ
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white rounded-xl shadow-lg p-6 border-l-4 border-purple-500">
          <p className="text-gray-600 text-sm">Tổng nhà tài trợ</p>
          <p className="text-3xl font-bold text-purple-600">{sponsors.length}</p>
        </div>
        <div className="bg-white rounded-xl shadow-lg p-6 border-l-4 border-green-500">
          <p className="text-gray-600 text-sm">Đang hoạt động</p>
          <p className="text-3xl font-bold text-green-600">{sponsors.filter(s => s.is_active !== false).length}</p>
        </div>
        <div className="bg-white rounded-xl shadow-lg p-6 border-l-4 border-red-500">
          <p className="text-gray-600 text-sm">Đã khóa</p>
          <p className="text-3xl font-bold text-red-600">{sponsors.filter(s => s.is_active === false).length}</p>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl shadow-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Nhà tài trợ</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Tổ chức</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Email</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">SĐT</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Trạng thái</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {sponsors.map((sponsor) => (
                <tr key={sponsor.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4">
                    <div className="flex items-center">
                      <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center">
                        <span className="text-purple-600 font-bold">
                          {sponsor.full_name?.charAt(0) || sponsor.username?.charAt(0) || 'S'}
                        </span>
                      </div>
                      <div className="ml-3">
                        <p className="font-medium text-gray-900">{sponsor.full_name || sponsor.username}</p>
                        <p className="text-sm text-gray-500">@{sponsor.username}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-900">{sponsor.organization_name || '-'}</td>
                  <td className="px-6 py-4 text-sm text-gray-500">{sponsor.email}</td>
                  <td className="px-6 py-4 text-sm text-gray-500">{sponsor.phone || '-'}</td>
                  <td className="px-6 py-4">
                    <span className={`px-2 py-1 text-xs rounded-full ${
                      sponsor.is_active !== false ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                    }`}>
                      {sponsor.is_active !== false ? 'Hoạt động' : 'Đã khóa'}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex space-x-2">
                      <button
                        onClick={() => handleEdit(sponsor)}
                        className="text-blue-600 hover:text-blue-800 text-sm"
                      >
                        Sửa
                      </button>
                      <button
                        onClick={() => handleToggleStatus(sponsor)}
                        className={`text-sm ${sponsor.is_active !== false ? 'text-orange-600 hover:text-orange-800' : 'text-green-600 hover:text-green-800'}`}
                      >
                        {sponsor.is_active !== false ? 'Khóa' : 'Mở khóa'}
                      </button>
                      <button
                        onClick={() => handleDelete(sponsor.id)}
                        className="text-red-600 hover:text-red-800 text-sm"
                      >
                        Xóa
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {sponsors.length === 0 && (
                <tr>
                  <td colSpan="6" className="px-6 py-8 text-center text-gray-500">
                    Chưa có nhà tài trợ nào trong hệ thống
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal */}
      <Modal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        title={editingSponsor ? 'Chỉnh sửa nhà tài trợ' : 'Thêm nhà tài trợ mới'}
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            label="Tên đăng nhập"
            value={formData.username}
            onChange={(e) => setFormData({ ...formData, username: e.target.value })}
            required
            disabled={!!editingSponsor}
          />
          <Input
            label="Email"
            type="email"
            value={formData.email}
            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            required
          />
          {!editingSponsor && (
            <Input
              label="Mật khẩu"
              type="password"
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              required
            />
          )}
          <Input
            label="Họ và tên"
            value={formData.full_name}
            onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
          />
          <Input
            label="Tên tổ chức"
            value={formData.organization_name}
            onChange={(e) => setFormData({ ...formData, organization_name: e.target.value })}
          />
          <Input
            label="Số điện thoại"
            value={formData.phone}
            onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
          />
          <div className="flex justify-end space-x-3 pt-4">
            <Button type="button" variant="secondary" onClick={() => setShowModal(false)}>
              Hủy
            </Button>
            <Button type="submit" variant="primary">
              {editingSponsor ? 'Cập nhật' : 'Thêm mới'}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default SystemSponsorsPage;
