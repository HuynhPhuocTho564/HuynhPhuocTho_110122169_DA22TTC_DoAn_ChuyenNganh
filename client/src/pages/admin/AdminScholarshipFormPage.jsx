import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { toast } from 'react-toastify';
import scholarshipService from '../../services/scholarshipService';
import Button from '../../components/common/Button';
import Loading from '../../components/common/Loading';

const AdminScholarshipFormPage = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const isEdit = Boolean(id);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    semester: 'HK1',
    academic_year: new Date().getFullYear().toString(),
    amount_per_slot: '',
    slots: '',
    start_date: '',
    end_date: '',
    status: 'OPEN',
    min_gpa: '',
    min_drr: '',
    require_poor: false,
  });

  useEffect(() => {
    if (isEdit) fetchScholarship();
  }, [id]);

  const fetchScholarship = async () => {
    try {
      setLoading(true);
      const response = await scholarshipService.getById(id);
      const data = response.data?.data || response.data;
      if (data) {
        setFormData({
          name: data.name || '',
          description: data.description || '',
          semester: data.semester || 'HK1',
          academic_year: data.academic_year || '',
          amount_per_slot: data.amount_per_slot || '',
          slots: data.slots || '',
          start_date: data.start_date?.split('T')[0] || '',
          end_date: data.end_date?.split('T')[0] || '',
          status: data.status || 'OPEN',
          min_gpa: data.criteria_json?.min_gpa || '',
          min_drr: data.criteria_json?.min_drr || '',
          require_poor: data.criteria_json?.require_poor || false,
        });
      }
    } catch (error) {
      toast.error('Không thể tải thông tin học bổng');
      navigate('/admin/scholarships');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({ ...formData, [name]: type === 'checkbox' ? checked : value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name || !formData.amount_per_slot || !formData.slots || !formData.start_date || !formData.end_date) {
      toast.error('Vui lòng điền đầy đủ thông tin bắt buộc');
      return;
    }
    if (new Date(formData.start_date) >= new Date(formData.end_date)) {
      toast.error('Ngày kết thúc phải sau ngày bắt đầu');
      return;
    }

    try {
      setLoading(true);
      const data = {
        ...formData,
        amount_per_slot: parseFloat(formData.amount_per_slot),
        slots: parseInt(formData.slots),
        criteria_json: {
          min_gpa: formData.min_gpa ? parseFloat(formData.min_gpa) : null,
          min_drr: formData.min_drr ? parseFloat(formData.min_drr) : null,
          require_poor: formData.require_poor,
        },
      };

      if (isEdit) {
        await scholarshipService.update(id, data);
        toast.success('Cập nhật học bổng thành công!');
      } else {
        await scholarshipService.create(data);
        toast.success('Tạo học bổng thành công!');
      }
      navigate('/admin/scholarships');
    } catch (error) {
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  if (loading && isEdit) return <Loading />;

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">
            {isEdit ? 'Chỉnh sửa học bổng' : 'Tạo học bổng mới'}
          </h1>
          <p className="text-gray-600 mt-1">Điền thông tin để {isEdit ? 'cập nhật' : 'tạo'} học bổng</p>
        </div>
        <Button variant="outline" onClick={() => navigate('/admin/scholarships')}>← Quay lại</Button>
      </div>

      <form onSubmit={handleSubmit} className="bg-white rounded-xl shadow-lg p-8 space-y-6">
        {/* Basic Info */}
        <div className="space-y-4">
          <h2 className="text-xl font-bold text-gray-800 border-b pb-2">Thông tin cơ bản</h2>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Tên học bổng *</label>
            <input type="text" name="name" value={formData.name} onChange={handleChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500" required />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Mô tả</label>
            <textarea name="description" value={formData.description} onChange={handleChange} rows={4}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Học kỳ *</label>
              <select name="semester" value={formData.semester} onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg">
                <option value="HK1">Học kỳ 1</option>
                <option value="HK2">Học kỳ 2</option>
                <option value="HK3">Học kỳ hè</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Năm học *</label>
              <input type="text" name="academic_year" value={formData.academic_year} onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg" required />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Giá trị/suất (VNĐ) *</label>
              <input type="number" name="amount_per_slot" value={formData.amount_per_slot} onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg" min="0" required />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Số suất *</label>
              <input type="number" name="slots" value={formData.slots} onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg" min="1" required />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Ngày bắt đầu *</label>
              <input type="date" name="start_date" value={formData.start_date} onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg" required />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Ngày kết thúc *</label>
              <input type="date" name="end_date" value={formData.end_date} onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg" required />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Trạng thái</label>
            <select name="status" value={formData.status} onChange={handleChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg">
              <option value="OPEN">Đang mở</option>
              <option value="CLOSED">Đã đóng</option>
              <option value="FINISHED">Hoàn thành</option>
            </select>
          </div>
        </div>

        {/* Criteria */}
        <div className="space-y-4">
          <h2 className="text-xl font-bold text-gray-800 border-b pb-2">Tiêu chí xét duyệt</h2>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">GPA tối thiểu</label>
              <input type="number" name="min_gpa" value={formData.min_gpa} onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg" min="0" max="4" step="0.1" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Điểm rèn luyện tối thiểu</label>
              <input type="number" name="min_drr" value={formData.min_drr} onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg" min="0" max="100" />
            </div>
          </div>
          <label className="flex items-center space-x-2">
            <input type="checkbox" name="require_poor" checked={formData.require_poor} onChange={handleChange}
              className="w-4 h-4 text-blue-600 border-gray-300 rounded" />
            <span className="text-sm text-gray-700">Yêu cầu hoàn cảnh khó khăn</span>
          </label>
        </div>

        <div className="flex justify-end space-x-4 pt-6 border-t">
          <Button type="button" variant="outline" onClick={() => navigate('/admin/scholarships')}>Hủy</Button>
          <Button type="submit" variant="primary" loading={loading}>
            {isEdit ? 'Cập nhật' : 'Tạo học bổng'}
          </Button>
        </div>
      </form>
    </div>
  );
};

export default AdminScholarshipFormPage;
