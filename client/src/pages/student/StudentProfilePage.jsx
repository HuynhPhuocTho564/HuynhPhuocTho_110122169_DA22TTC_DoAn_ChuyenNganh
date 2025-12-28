import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import api from '../../services/api';
import authService from '../../services/authService';
import useAuthStore from '../../store/useAuthStore';
import Button from '../../components/common/Button';
import Loading from '../../components/common/Loading';

const StudentProfilePage = () => {
  const navigate = useNavigate();
  const { user, setUser } = useAuthStore();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [editing, setEditing] = useState(false);
  const [formData, setFormData] = useState({
    full_name: '',
    email: '',
    phone: '',
    address: '',
    bank_name: '',
    bank_number: '',
  });

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      setLoading(true);
      const response = await authService.getProfile();
      const data = response.data || response;
      setProfile(data);
      
      // Lấy thông tin từ studentProfile
      const studentData = data.studentProfile || {};
      setFormData({
        full_name: studentData.full_name || data.full_name || '',
        email: data.email || '',
        phone: studentData.phone || '',
        address: studentData.address || '',
        bank_name: studentData.bank_name || '',
        bank_number: studentData.bank_number || '',
      });
    } catch (error) {
      toast.error('Không thể tải thông tin');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setSaving(true);
      const response = await api.put('/users/profile', formData);
      toast.success('Cập nhật thành công!');
      setEditing(false);
      fetchProfile(); // Reload profile
    } catch (error) {
      toast.error(error.message);
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <Loading />;

  const studentData = profile?.studentProfile || {};

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">Hồ sơ cá nhân</h1>
          <p className="text-gray-600 mt-1">Quản lý thông tin của bạn</p>
        </div>
        <Button variant="outline" onClick={() => navigate('/student/change-password')}>
          🔒 Đổi mật khẩu
        </Button>
      </div>

      {/* Profile Card */}
      <div className="bg-white rounded-xl shadow-lg overflow-hidden">
        <div className="h-32 bg-gradient-to-r from-blue-500 to-blue-600 relative">
          <div className="absolute -bottom-16 left-8">
            <div className="w-32 h-32 bg-white rounded-full border-4 border-white shadow-lg flex items-center justify-center">
              <span className="text-5xl font-bold text-blue-600">
                {(studentData.full_name || profile?.full_name || 'U')?.charAt(0).toUpperCase()}
              </span>
            </div>
          </div>
        </div>

        <div className="pt-20 px-8 pb-8">
          <div className="flex items-start justify-between mb-6">
            <div>
              <h2 className="text-2xl font-bold text-gray-800">{studentData.full_name || profile?.full_name}</h2>
              <p className="text-gray-600">{profile?.email}</p>
              <div className="flex gap-2 mt-2">
                <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm">
                  {studentData.student_code || profile?.username}
                </span>
                <span className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm">
                  Sinh viên
                </span>
              </div>
            </div>
            {!editing && (
              <Button variant="primary" onClick={() => setEditing(true)}>✏️ Chỉnh sửa</Button>
            )}
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Editable Info */}
            <div className="space-y-4">
              <h3 className="text-lg font-bold text-gray-800 border-b pb-2">Thông tin liên hệ</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Họ và tên</label>
                  <input type="text" name="full_name" value={formData.full_name} onChange={handleChange}
                    disabled={!editing} className="w-full px-4 py-2 border rounded-lg disabled:bg-gray-100" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
                  <input type="email" name="email" value={formData.email} onChange={handleChange}
                    disabled={!editing} className="w-full px-4 py-2 border rounded-lg disabled:bg-gray-100" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Số điện thoại</label>
                  <input type="tel" name="phone" value={formData.phone} onChange={handleChange}
                    disabled={!editing} className="w-full px-4 py-2 border rounded-lg disabled:bg-gray-100" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Địa chỉ</label>
                  <input type="text" name="address" value={formData.address} onChange={handleChange}
                    disabled={!editing} className="w-full px-4 py-2 border rounded-lg disabled:bg-gray-100" />
                </div>
              </div>
            </div>

            {/* Bank Info */}
            <div className="space-y-4">
              <h3 className="text-lg font-bold text-gray-800 border-b pb-2">
                Thông tin ngân hàng
                <span className="text-sm font-normal text-gray-500 ml-2">(Để nhận tiền học bổng)</span>
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Tên ngân hàng</label>
                  <input type="text" name="bank_name" value={formData.bank_name} onChange={handleChange}
                    disabled={!editing} placeholder="VD: Vietcombank"
                    className="w-full px-4 py-2 border rounded-lg disabled:bg-gray-100" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Số tài khoản</label>
                  <input type="text" name="bank_number" value={formData.bank_number} onChange={handleChange}
                    disabled={!editing} placeholder="VD: 1234567890"
                    className="w-full px-4 py-2 border rounded-lg disabled:bg-gray-100" />
                </div>
              </div>
            </div>

            {/* Academic Info (Read-only) */}
            <div className="space-y-4">
              <h3 className="text-lg font-bold text-gray-800 border-b pb-2">
                Thông tin học tập
                <span className="text-sm font-normal text-gray-500 ml-2">(Chỉ admin có thể cập nhật)</span>
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-blue-50 rounded-lg p-4 text-center">
                  <p className="text-sm text-gray-600">GPA</p>
                  <p className="text-3xl font-bold text-blue-600">{studentData.gpa ? parseFloat(studentData.gpa).toFixed(2) : 'N/A'}</p>
                </div>
                <div className="bg-green-50 rounded-lg p-4 text-center">
                  <p className="text-sm text-gray-600">Điểm rèn luyện</p>
                  <p className="text-3xl font-bold text-green-600">{studentData.drr ?? 'N/A'}</p>
                </div>
              </div>
              <p className="text-xs text-gray-500">
                * Thông tin học tập được đồng bộ từ hệ thống đào tạo. Liên hệ Phòng CTSV nếu cần cập nhật.
              </p>
            </div>

            {/* Actions */}
            {editing && (
              <div className="flex justify-end gap-3 pt-6 border-t">
                <Button type="button" variant="outline" onClick={() => setEditing(false)}>Hủy</Button>
                <Button type="submit" variant="primary" loading={saving}>Lưu thay đổi</Button>
              </div>
            )}
          </form>
        </div>
      </div>
    </div>
  );
};

export default StudentProfilePage;
