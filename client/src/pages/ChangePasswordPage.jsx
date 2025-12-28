import { useState } from 'react';
import { toast } from 'react-toastify';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import Button from '../components/common/Button';

const ChangePasswordPage = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [showPasswords, setShowPasswords] = useState({
    current: false,
    new: false,
    confirm: false
  });

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const getPasswordStrength = (password) => {
    if (!password) return { strength: 0, label: '', color: 'gray' };
    
    let strength = 0;
    if (password.length >= 8) strength++;
    if (password.length >= 12) strength++;
    if (/[a-z]/.test(password) && /[A-Z]/.test(password)) strength++;
    if (/\d/.test(password)) strength++;
    if (/[^a-zA-Z\d]/.test(password)) strength++;

    const levels = [
      { strength: 0, label: 'Rất yếu', color: 'red' },
      { strength: 1, label: 'Yếu', color: 'orange' },
      { strength: 2, label: 'Trung bình', color: 'yellow' },
      { strength: 3, label: 'Khá', color: 'blue' },
      { strength: 4, label: 'Mạnh', color: 'green' },
      { strength: 5, label: 'Rất mạnh', color: 'green' }
    ];

    return levels[strength];
  };

  const passwordStrength = getPasswordStrength(formData.newPassword);

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validation
    if (!formData.currentPassword || !formData.newPassword || !formData.confirmPassword) {
      toast.error('Vui lòng điền đầy đủ thông tin');
      return;
    }

    if (formData.newPassword.length < 6) {
      toast.error('Mật khẩu mới phải có ít nhất 6 ký tự');
      return;
    }

    if (formData.newPassword !== formData.confirmPassword) {
      toast.error('Mật khẩu xác nhận không khớp');
      return;
    }

    if (formData.currentPassword === formData.newPassword) {
      toast.error('Mật khẩu mới phải khác mật khẩu cũ');
      return;
    }

    try {
      setLoading(true);
      await api.put('/users/change-password', {
        current_password: formData.currentPassword,
        new_password: formData.newPassword
      });
      toast.success('Đổi mật khẩu thành công!');
      navigate('/dashboard');
    } catch (error) {
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">Đổi mật khẩu</h1>
          <p className="text-gray-600 mt-1">Cập nhật mật khẩu của bạn</p>
        </div>
        <Button variant="outline" onClick={() => navigate(-1)}>
          ← Quay lại
        </Button>
      </div>

      {/* Form Card */}
      <div className="bg-white rounded-xl shadow-lg p-8">
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Current Password */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Mật khẩu hiện tại <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <input
                type={showPasswords.current ? 'text' : 'password'}
                name="currentPassword"
                value={formData.currentPassword}
                onChange={handleChange}
                className="w-full px-4 py-3 pr-12 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Nhập mật khẩu hiện tại"
                required
              />
              <button
                type="button"
                onClick={() => setShowPasswords({ ...showPasswords, current: !showPasswords.current })}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
              >
                {showPasswords.current ? '👁️' : '👁️‍🗨️'}
              </button>
            </div>
          </div>

          {/* New Password */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Mật khẩu mới <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <input
                type={showPasswords.new ? 'text' : 'password'}
                name="newPassword"
                value={formData.newPassword}
                onChange={handleChange}
                className="w-full px-4 py-3 pr-12 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Nhập mật khẩu mới"
                required
              />
              <button
                type="button"
                onClick={() => setShowPasswords({ ...showPasswords, new: !showPasswords.new })}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
              >
                {showPasswords.new ? '👁️' : '👁️‍🗨️'}
              </button>
            </div>

            {/* Password Strength Indicator */}
            {formData.newPassword && (
              <div className="mt-2">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs text-gray-600">Độ mạnh mật khẩu:</span>
                  <span className={`text-xs font-medium text-${passwordStrength.color}-600`}>
                    {passwordStrength.label}
                  </span>
                </div>
                <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                  <div
                    className={`h-full bg-${passwordStrength.color}-500 transition-all duration-300`}
                    style={{ width: `${(passwordStrength.strength / 5) * 100}%` }}
                  ></div>
                </div>
                <div className="mt-2 space-y-1">
                  <p className="text-xs text-gray-600">Mật khẩu mạnh nên có:</p>
                  <ul className="text-xs text-gray-500 space-y-0.5 ml-4">
                    <li className={formData.newPassword.length >= 8 ? 'text-green-600' : ''}>
                      ✓ Ít nhất 8 ký tự
                    </li>
                    <li className={/[a-z]/.test(formData.newPassword) && /[A-Z]/.test(formData.newPassword) ? 'text-green-600' : ''}>
                      ✓ Chữ hoa và chữ thường
                    </li>
                    <li className={/\d/.test(formData.newPassword) ? 'text-green-600' : ''}>
                      ✓ Số
                    </li>
                    <li className={/[^a-zA-Z\d]/.test(formData.newPassword) ? 'text-green-600' : ''}>
                      ✓ Ký tự đặc biệt
                    </li>
                  </ul>
                </div>
              </div>
            )}
          </div>

          {/* Confirm Password */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Xác nhận mật khẩu mới <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <input
                type={showPasswords.confirm ? 'text' : 'password'}
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleChange}
                className="w-full px-4 py-3 pr-12 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Nhập lại mật khẩu mới"
                required
              />
              <button
                type="button"
                onClick={() => setShowPasswords({ ...showPasswords, confirm: !showPasswords.confirm })}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
              >
                {showPasswords.confirm ? '👁️' : '👁️‍🗨️'}
              </button>
            </div>
            {formData.confirmPassword && formData.newPassword !== formData.confirmPassword && (
              <p className="mt-1 text-sm text-red-600">Mật khẩu không khớp</p>
            )}
          </div>

          {/* Security Tips */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <h4 className="font-medium text-blue-900 mb-2">💡 Lưu ý bảo mật</h4>
            <ul className="text-sm text-blue-800 space-y-1">
              <li>• Không chia sẻ mật khẩu với bất kỳ ai</li>
              <li>• Sử dụng mật khẩu khác nhau cho các tài khoản khác nhau</li>
              <li>• Thay đổi mật khẩu định kỳ để bảo mật tài khoản</li>
            </ul>
          </div>

          {/* Actions */}
          <div className="flex items-center justify-end space-x-3 pt-6 border-t">
            <Button
              type="button"
              variant="outline"
              onClick={() => navigate(-1)}
            >
              Hủy
            </Button>
            <Button
              type="submit"
              variant="primary"
              loading={loading}
            >
              Đổi mật khẩu
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ChangePasswordPage;
