import { useEffect, useState } from 'react';
import { toast } from 'react-toastify';
import api from '../../services/api';
import Button from '../../components/common/Button';
import Loading from '../../components/common/Loading';
import Modal from '../../components/common/Modal';

const SystemUniversitiesPage = () => {
  const [universities, setUniversities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingUni, setEditingUni] = useState(null);
  const [formData, setFormData] = useState({ name: '', code: '', address: '', hotline: '' });
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchUniversities();
  }, []);

  const fetchUniversities = async () => {
    try {
      const response = await api.get('/universities');
      setUniversities(response.data?.data?.universities || response.data?.universities || []);
    } catch (error) {
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setSubmitting(true);
      if (editingUni) {
        await api.put(`/universities/${editingUni.id}`, formData);
        toast.success('Cập nhật thành công!');
      } else {
        await api.post('/universities', formData);
        toast.success('Thêm trường thành công!');
      }
      setShowModal(false);
      setEditingUni(null);
      setFormData({ name: '', code: '', address: '', hotline: '' });
      fetchUniversities();
    } catch (error) {
      toast.error(error.message);
    } finally {
      setSubmitting(false);
    }
  };

  const handleEdit = (uni) => {
    setEditingUni(uni);
    setFormData({ name: uni.name, code: uni.code, address: uni.address || '', hotline: uni.hotline || '' });
    setShowModal(true);
  };

  const handleToggleStatus = async (uni) => {
    try {
      await api.put(`/universities/${uni.id}/status`, { status: uni.status === 'ACTIVE' ? 'LOCKED' : 'ACTIVE' });
      toast.success(`${uni.status === 'ACTIVE' ? 'Khóa' : 'Mở khóa'} trường thành công!`);
      fetchUniversities();
    } catch (error) {
      toast.error(error.message);
    }
  };

  if (loading) return <Loading />;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">Quản lý Trường Đại học</h1>
          <p className="text-gray-600 mt-1">Thêm và quản lý các trường tham gia hệ thống</p>
        </div>
        <Button variant="primary" onClick={() => { setEditingUni(null); setFormData({ name: '', code: '', address: '', hotline: '' }); setShowModal(true); }}>
          ➕ Thêm trường mới
        </Button>
      </div>

      <div className="bg-white rounded-lg shadow overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Mã</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Tên trường</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Địa chỉ</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Hotline</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Trạng thái</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Thao tác</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {universities.map((uni) => (
              <tr key={uni.id} className="hover:bg-gray-50">
                <td className="px-6 py-4 text-sm font-medium">{uni.code}</td>
                <td className="px-6 py-4 text-sm">{uni.name}</td>
                <td className="px-6 py-4 text-sm text-gray-500">{uni.address || 'N/A'}</td>
                <td className="px-6 py-4 text-sm">{uni.hotline || 'N/A'}</td>
                <td className="px-6 py-4">
                  <span className={`px-2 py-1 rounded-full text-xs ${uni.status === 'ACTIVE' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                    {uni.status === 'ACTIVE' ? 'Hoạt động' : 'Đã khóa'}
                  </span>
                </td>
                <td className="px-6 py-4">
                  <div className="flex gap-2">
                    <Button size="sm" variant="outline" onClick={() => handleEdit(uni)}>✏️</Button>
                    <Button size="sm" variant={uni.status === 'ACTIVE' ? 'danger' : 'success'} onClick={() => handleToggleStatus(uni)}>
                      {uni.status === 'ACTIVE' ? '🔒' : '🔓'}
                    </Button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <Modal isOpen={showModal} onClose={() => setShowModal(false)} title={editingUni ? 'Sửa trường' : 'Thêm trường mới'}>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Mã trường *</label>
            <input type="text" value={formData.code} onChange={(e) => setFormData({ ...formData, code: e.target.value })}
              className="w-full px-4 py-2 border rounded-lg" required />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Tên trường *</label>
            <input type="text" value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full px-4 py-2 border rounded-lg" required />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Địa chỉ</label>
            <input type="text" value={formData.address} onChange={(e) => setFormData({ ...formData, address: e.target.value })}
              className="w-full px-4 py-2 border rounded-lg" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Hotline</label>
            <input type="text" value={formData.hotline} onChange={(e) => setFormData({ ...formData, hotline: e.target.value })}
              className="w-full px-4 py-2 border rounded-lg" />
          </div>
          <div className="flex justify-end gap-3">
            <Button type="button" variant="outline" onClick={() => setShowModal(false)}>Hủy</Button>
            <Button type="submit" variant="primary" loading={submitting}>{editingUni ? 'Cập nhật' : 'Thêm'}</Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default SystemUniversitiesPage;
