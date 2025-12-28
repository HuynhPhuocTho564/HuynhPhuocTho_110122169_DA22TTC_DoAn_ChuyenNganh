import { useNavigate } from 'react-router-dom';
import Button from '../components/common/Button';

const NotFoundPage = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
      <div className="text-center">
        <div className="text-9xl font-bold text-gray-300">404</div>
        <h1 className="text-3xl font-bold text-gray-800 mt-4">Không tìm thấy trang</h1>
        <p className="text-gray-600 mt-2 mb-8">
          Trang bạn đang tìm kiếm không tồn tại hoặc đã bị di chuyển.
        </p>
        <div className="flex justify-center gap-4">
          <Button variant="primary" onClick={() => navigate(-1)}>
            ← Quay lại
          </Button>
          <Button variant="outline" onClick={() => navigate('/')}>
            Về trang chủ
          </Button>
        </div>
      </div>
    </div>
  );
};

export default NotFoundPage;
