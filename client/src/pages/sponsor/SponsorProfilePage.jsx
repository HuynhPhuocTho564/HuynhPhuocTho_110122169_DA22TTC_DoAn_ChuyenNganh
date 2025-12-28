import { useEffect, useState } from 'react';
import { toast } from 'react-toastify';
import api from '../../services/api';
import useAuthStore from '../../store/useAuthStore';
import Button from '../../components/common/Button';
import Loading from '../../components/common/Loading';

const SponsorProfilePage = () => {
  const { user } = useAuthStore();
  const [profile, setProfile] = useState({
    company_name: '',
    description: '',
    mission: '',
    contact_email: '',
    contact_phone: '',
    address: ''
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      const res = await api.get('/sponsor/profile');
      if (res.data) {
        // Đảm bảo không có giá trị null (fix warning React)
        const sanitized = {};
        Object.keys(res.data).forEach(key => {
          sanitized[key] = res.data[key] ?? '';
        });
        setProfile(prev => ({ ...prev, ...sanitized }));
      }
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    setProfile({ ...profile, [e.target.name]: e.target.value });
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      await api.put('/sponsor/profile', profile);
      toast.success('Cập nhật hồ sơ thành công!');
    } catch (error) {
      toast.error(error.message);
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <Loading />;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-800">Hồ sơ Đơn vị</h1>
        <p className="text-gray-600 mt-1">Thông tin này sẽ hiển thị trên trang công khai</p>
      </div>

      {/* Preview Card */}
      <div className="bg-white rounded-xl shadow-lg overflow-hidden">
        <div className="h-24 bg-gradient-to-r from-purple-600 to-indigo-600 relative">
          <div className="absolute -bottom-10 left-6">
            <div className="w-20 h-20 bg-white rounded-xl shadow-lg flex items-center justify-center">
              <span className="text-4xl">🏢</span>
            </div>
          </div>
        </div>
        <div className="pt-14 pb-6 px-6">
          <h2 className="text-2xl font-bold text-gray-800">{profile.company_name || user?.full_name || 'Tên đơn vị'}</h2>
          <p className="text-gray-600 mt-2">{profile.mission || 'Sứ mệnh của quỹ học bổng...'}</p>
        </div>
      </div>

      {/* Edit Form */}
      <div className="bg-white rounded-xl shadow-lg p-6">
        <h3 className="text-xl font-bold text-gray-800 mb-6">✏️ Chỉnh sửa thông tin</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-2">Tên đơn vị/Quỹ</label>
            <input type="text" name="company_name" value={profile.company_name} onChange={handleChange}
              className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500"
              placeholder="VD: Quỹ học bổng Vingroup" />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Email liên hệ</label>
            <input type="email" name="contact_email" value={profile.contact_email} onChange={handleChange}
              className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500" />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Số điện thoại</label>
            <input type="tel" name="contact_phone" value={profile.contact_phone} onChange={handleChange}
              className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500" />
          </div>

          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-2">Địa chỉ</label>
            <input type="text" name="address" value={profile.address} onChange={handleChange}
              className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500" />
          </div>

          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-2">Sứ mệnh / Lời ngỏ</label>
            <textarea name="mission" value={profile.mission} onChange={handleChange} rows={3}
              className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500"
              placeholder="Sứ mệnh của quỹ học bổng..." />
          </div>

          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-2">Giới thiệu chi tiết</label>
            <textarea name="description" value={profile.description} onChange={handleChange} rows={5}
              className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500"
              placeholder="Mô tả về đơn vị, lịch sử, hoạt động..." />
          </div>
        </div>

        <div className="mt-6 flex justify-end">
          <Button variant="primary" onClick={handleSave} loading={saving}>
            💾 Lưu thay đổi
          </Button>
        </div>
      </div>
    </div>
  );
};

export default SponsorProfilePage;
