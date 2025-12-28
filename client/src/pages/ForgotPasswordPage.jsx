import { useState } from 'react';
import { Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import api from '../services/api';
import Button from '../components/common/Button';

const ForgotPasswordPage = () => {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email) {
      toast.error('Vui lòng nhập email');
      return;
    }

    try {
      setLoading(true);
      await api.post('/auth/forgot-password', { email });
      setSent(true);
      toast.success('Đã gửi email hướng dẫn đặt lại mật khẩu!');
    } catch (error) {
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-500 to-blue-700 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-8">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-800">🔑 Quên mật khẩu</h1>
          <p className="text-gray-600 mt-2">Nhập email để nhận hướng dẫn đặt lại mật khẩu</p>
        </div>

        {sent ? (
          <div className="text-center space-y-4">
            <div className="text-6xl">📧</div>
            <h2 className="text-xl font-bold text-gray-800">Đã gửi email!</h2>
            <p className="text-gray-600">
              Vui lòng kiểm tra hộp thư của bạn và làm theo hướng dẫn để đặt lại mật khẩu.
            </p>
            <Link to="/login" className="text-blue-600 hover:underline">
              ← Quay lại đăng nhập
            </Link>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                placeholder="Nhập email của bạn"
                required
              />
            </div>

            <Button type="submit" variant="primary" fullWidth loading={loading}>
              Gửi yêu cầu
            </Button>

            <p className="text-center text-gray-600">
              <Link to="/login" className="text-blue-600 hover:underline">
                ← Quay lại đăng nhập
              </Link>
            </p>
          </form>
        )}
      </div>
    </div>
  );
};

export default ForgotPasswordPage;
