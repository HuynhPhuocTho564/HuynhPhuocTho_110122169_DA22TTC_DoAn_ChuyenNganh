import { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import useAuthStore from '../store/useAuthStore';
import Button from '../components/common/Button';
import Loading from '../components/common/Loading';

const ProfilePage = () => {
  const navigate = useNavigate();
  const { user, setUser } = useAuthStore();
  const [loading, setLoading] = useState(false);
  const [editing, setEditing] = useState(false);
  const [formData, setFormData] = useState({
    full_name: '',
    email: '',
    phone: '',
    date_of_birth: '',
    gender: 'OTHER',
    address: '',
    gpa: '',
    drr: '',
    is_poor: false
  });

  useEffect(() => {
    if (user) {
      setFormData({
        full_name: user.full_name || '',
        email: user.email || '',
        phone: user.phone || '',
        date_of_birth: user.date_of_birth ? user.date_of_birth.split('T')[0] : '',
        gender: user.gender || 'OTHER',
        address: user.address || '',
        gpa: user.gpa || '',
        drr: user.drr || '',
        is_poor: user.is_poor || false
      });
    }
  }, [user]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === 'checkbox' ? checked : value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      setLoading(true);
      const response = await api.put('/users/profile', formData);
      setUser(response.data.user);
      toast.success('Cập nhật thông tin thành công!');
      setEditing(false);
    } catch (error) {
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <Loading />;

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">Hồ sơ cá nhân</h1>
          <p className="text-gray-600 mt-1">Quản lý thông tin cá nhân của bạn</p>
        </div>
        <Button
          variant="outline"
          onClick={() => navigate('/profile/change-password')}
        >
          🔒 Đổi mật khẩu
        </Button>
      </div>

      {/* Profile Card */}
      <div className="bg-white rounded-xl shadow-lg overflow-hidden">
        {/* Header with gradient */}
        <div className="h-32 bg-gradient-to-r from-blue-500 to-blue-600 relative">
          <div className="absolute -bottom-16 left-8">
            <div className="w-32 h-32 bg-white rounded-full border-4 border-white shadow-lg flex items-center justify-center">
              <span className="text-5xl font-bold text-blue-600">
                {user?.full_name?.charAt(0).toUpperCase()}
              </span>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="pt-20 px-8 pb-8">
          <div className="flex items-start justify-between mb-6">
            <div>
              <h2 className="text-2xl font-bold text-gray-800">{user?.full_name}</h2>
              <p className="text-gray-600">{user?.email}</p>
              <div className="flex items-center space-x-2 mt-2">
                <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-medium">
                  {user?.role}
                </span>
                {user?.student_code && (
                  <span className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm font-medium">
                    {user?.student_code}
                  </span>
                )}
              </div>
            </div>
            {!editing && (
              <Button variant="primary" onClick={() => setEditing(true)}>
                ✏️ Chỉnh sửa
              </Button>
            )}
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Basic Info */}
            <div className="space-y-4">
              <h3 className="text-lg font-bold text-gray-800 border-b pb-2">
                Thông tin cơ bản
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Họ và tên
                  </label>
                  <input
                    type="text"
                    name="full_name"
                    value={formData.full_name}
                    onChange={handleChange}
                    disabled={!editing}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Email
                  </label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    disabled={!editing}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Số điện thoại
                  </label>
                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    disabled={!editing}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Ngày sinh
                  </label>
                  <input
                    type="date"
                    name="date_of_birth"
                    value={formData.date_of_birth}
                    onChange={handleChange}
                    disabled={!editing}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Giới tính
                  </label>
                  <select
                    name="gender"
                    value={formData.gender}
                    onChange={handleChange}
                    disabled={!editing}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100"
                  >
                    <option value="MALE">Nam</option>
                    <option value="FEMALE">Nữ</option>
                    <option value="OTHER">Khác</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Địa chỉ
                  </label>
                  <input
                    type="text"
                    name="address"
                    value={formData.address}
                    onChange={handleChange}
                    disabled={!editing}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100"
                  />
                </div>
              </div>
            </div>

            {/* Academic Info (Student only - READ ONLY) */}
            {user?.role === 'STUDENT' && (
              <div className="space-y-4">
                <h3 className="text-lg font-bold text-gray-800 border-b pb-2">
                  Thông tin học tập
                  <span className="text-sm font-normal text-gray-500 ml-2">
                    (Chỉ admin mới có thể cập nhật)
                  </span>
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      GPA
                    </label>
                    <input
                      type="number"
                      name="gpa"
                      value={formData.gpa}
                      disabled={true}
                      step="0.01"
                      min="0"
                      max="4"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-gray-100 cursor-not-allowed"
                    />
                    <p className="text-xs text-gray-500 mt-1">Được cập nhật từ hệ thống đào tạo</p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Điểm rèn luyện
                    </label>
                    <input
                      type="number"
                      name="drr"
                      value={formData.drr}
                      disabled={true}
                      min="0"
                      max="100"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-gray-100 cursor-not-allowed"
                    />
                    <p className="text-xs text-gray-500 mt-1">Được cập nhật từ hệ thống đào tạo</p>
                  </div>

                  <div className="flex items-end">
                    <label className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        name="is_poor"
                        checked={formData.is_poor}
                        disabled={true}
                        className="w-4 h-4 text-blue-600 border-gray-300 rounded bg-gray-100 cursor-not-allowed"
                      />
                      <span className="text-sm text-gray-700">Hoàn cảnh khó khăn</span>
                    </label>
                    <p className="text-xs text-gray-500 ml-2">(Cần xác nhận từ admin)</p>
                  </div>
                </div>
              </div>
            )}

            {/* Actions */}
            {editing && (
              <div className="flex items-center justify-end space-x-3 pt-6 border-t">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setEditing(false)}
                >
                  Hủy
                </Button>
                <Button
                  type="submit"
                  variant="primary"
                  loading={loading}
                >
                  Lưu thay đổi
                </Button>
              </div>
            )}
          </form>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;
