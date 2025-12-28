import { useEffect, useState } from 'react';
import { toast } from 'react-toastify';
import api from '../../services/api';
import Button from '../../components/common/Button';
import Loading from '../../components/common/Loading';
import Modal from '../../components/common/Modal';
import Input from '../../components/common/Input';

const CIRCUMSTANCE_LABELS = {
  NONE: { label: 'Bình thường', color: 'gray' },
  POOR: { label: 'Hộ nghèo', color: 'red' },
  NEAR_POOR: { label: 'Hộ cận nghèo', color: 'orange' },
  DISABILITY: { label: 'Khuyết tật', color: 'purple' },
  ORPHAN_BOTH: { label: 'Mồ côi cả cha lẫn mẹ', color: 'indigo' },
  ORPHAN_ONE: { label: 'Mồ côi cha hoặc mẹ', color: 'blue' },
};

const AdminStudentsPage = () => {
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({ search: '', page: 1, class_id: '', circumstance: '' });
  const [pagination, setPagination] = useState({ total: 0, totalPages: 1 });
  const [classes, setClasses] = useState([]);
  
  // Modal thêm/sửa sinh viên
  const [showStudentModal, setShowStudentModal] = useState(false);
  const [editingStudent, setEditingStudent] = useState(null);
  const [studentForm, setStudentForm] = useState({
    student_code: '', full_name: '', email: '', class_id: '', gpa: '', drr: '', poor_cert_type: 'NONE'
  });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchClasses();
  }, []);

  useEffect(() => {
    fetchStudents();
  }, [filters]);

  const fetchClasses = async () => {
    try {
      const res = await api.get('/students/classes');
      setClasses(res.data?.data || res.data || []);
    } catch (error) {
      console.error('Error fetching classes:', error);
    }
  };

  const fetchStudents = async () => {
    try {
      setLoading(true);
      const response = await api.get('/students', { params: filters });
      const data = response.data?.data || response.data;
      setStudents(data?.students || []);
      setPagination(data?.pagination || { total: 0, totalPages: 1 });
    } catch (error) {
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleAddStudent = () => {
    setEditingStudent(null);
    setStudentForm({
      student_code: '', full_name: '', email: '', class_id: '', gpa: '', drr: '', poor_cert_type: 'NONE'
    });
    setShowStudentModal(true);
  };

  const handleEditStudent = (student) => {
    setEditingStudent(student);
    setStudentForm({
      student_code: student.student_code || '',
      full_name: student.full_name || '',
      email: student.user?.email || student.email || '',
      class_id: student.class_id || '',
      gpa: student.gpa || '',
      drr: student.drr || '',
      poor_cert_type: student.poor_cert_type || 'NONE'
    });
    setShowStudentModal(true);
  };

  const handleSaveStudent = async () => {
    if (!studentForm.student_code || !studentForm.full_name || !studentForm.email) {
      toast.error('Vui lòng điền đầy đủ thông tin bắt buộc');
      return;
    }
    try {
      setSaving(true);
      if (editingStudent) {
        await api.put(`/students/${editingStudent.id}`, studentForm);
        toast.success('Cập nhật sinh viên thành công!');
      } else {
        await api.post('/students', studentForm);
        toast.success('Thêm sinh viên thành công!');
      }
      setShowStudentModal(false);
      fetchStudents();
    } catch (error) {
      toast.error(error.response?.data?.message || error.message);
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteStudent = async (student) => {
    if (!window.confirm(`Bạn có chắc muốn xóa sinh viên ${student.full_name}?`)) return;
    try {
      await api.delete(`/students/${student.id}`);
      toast.success('Xóa sinh viên thành công!');
      fetchStudents();
    } catch (error) {
      toast.error(error.response?.data?.message || error.message);
    }
  };

  const getCircumstanceBadge = (type) => {
    const config = CIRCUMSTANCE_LABELS[type] || CIRCUMSTANCE_LABELS.NONE;
    const colorClasses = {
      gray: 'bg-gray-100 text-gray-600',
      red: 'bg-red-100 text-red-800',
      orange: 'bg-orange-100 text-orange-800',
      purple: 'bg-purple-100 text-purple-800',
      indigo: 'bg-indigo-100 text-indigo-800',
      blue: 'bg-blue-100 text-blue-800',
    };
    return (
      <span className={`px-2 py-1 rounded-full text-xs ${colorClasses[config.color]}`}>
        {config.label}
      </span>
    );
  };

  if (loading) return <Loading />;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">Quản lý Sinh viên</h1>
          <p className="text-gray-600 mt-1">Danh sách sinh viên toàn trường</p>
        </div>
        <Button variant="primary" onClick={handleAddStudent}>
          ➕ Thêm sinh viên
        </Button>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow p-4">
        <div className="flex flex-wrap gap-3 items-center">
          <input type="text" placeholder="Tìm theo tên, mã SV, email..."
            value={filters.search} onChange={(e) => setFilters({ ...filters, search: e.target.value, page: 1 })}
            className="flex-1 min-w-[200px] px-4 py-2 border border-gray-300 rounded-lg" />
          
          <select value={filters.class_id}
            onChange={(e) => setFilters({ ...filters, class_id: e.target.value, page: 1 })}
            className="px-4 py-2 border border-gray-300 rounded-lg min-w-[150px]">
            <option value="">-- Tất cả lớp --</option>
            {classes.map((c) => (
              <option key={c.id} value={c.id}>{c.name}</option>
            ))}
          </select>

          <select value={filters.circumstance}
            onChange={(e) => setFilters({ ...filters, circumstance: e.target.value, page: 1 })}
            className="px-4 py-2 border border-gray-300 rounded-lg min-w-[180px]">
            <option value="">-- Tất cả hoàn cảnh --</option>
            <option value="NONE">Bình thường</option>
            <option value="POOR">Hộ nghèo</option>
            <option value="NEAR_POOR">Hộ cận nghèo</option>
            <option value="DISABILITY">Khuyết tật</option>
            <option value="ORPHAN_BOTH">Mồ côi cả cha lẫn mẹ</option>
            <option value="ORPHAN_ONE">Mồ côi cha hoặc mẹ</option>
          </select>

          <Button variant="primary" onClick={fetchStudents}>🔍 Áp dụng</Button>
          <Button variant="outline" onClick={() => setFilters({ search: '', page: 1, class_id: '', circumstance: '' })}>
            🔄 Xóa lọc
          </Button>
        </div>
      </div>

      {/* Stats */}
      <div className="bg-blue-50 rounded-lg p-4">
        <p className="text-blue-800">Tổng số: <strong>{pagination.total}</strong> sinh viên</p>
      </div>

      {/* Table */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Mã SV</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Họ tên</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Email</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Lớp</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">GPA</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">ĐRL</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Hoàn cảnh</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Thao tác</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {students.map((s) => (
              <tr key={s.id} className="hover:bg-gray-50">
                <td className="px-4 py-3 text-sm font-medium">{s.student_code}</td>
                <td className="px-4 py-3 text-sm">{s.full_name}</td>
                <td className="px-4 py-3 text-sm text-gray-500">{s.user?.email || s.email}</td>
                <td className="px-4 py-3 text-sm">{s.class?.name || 'N/A'}</td>
                <td className="px-4 py-3 text-sm font-medium text-blue-600">{parseFloat(s.gpa || 0).toFixed(2)}</td>
                <td className="px-4 py-3 text-sm">{s.drr}</td>
                <td className="px-4 py-3 text-sm">{getCircumstanceBadge(s.poor_cert_type)}</td>
                <td className="px-4 py-3 text-sm">
                  <div className="flex gap-2">
                    <button onClick={() => handleEditStudent(s)}
                      className="px-2 py-1 bg-blue-100 text-blue-700 rounded hover:bg-blue-200 text-xs">
                      ✏️ Sửa
                    </button>
                    <button onClick={() => handleDeleteStudent(s)}
                      className="px-2 py-1 bg-red-100 text-red-700 rounded hover:bg-red-200 text-xs">
                      🗑️ Xóa
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {students.length === 0 && <div className="text-center py-12 text-gray-500">Chưa có sinh viên nào</div>}
      </div>

      {/* Pagination */}
      {pagination.totalPages > 1 && (
        <div className="flex justify-center gap-2">
          {Array.from({ length: Math.min(pagination.totalPages, 10) }, (_, i) => (
            <button key={i} onClick={() => setFilters({ ...filters, page: i + 1 })}
              className={`px-3 py-1 rounded ${filters.page === i + 1 ? 'bg-blue-600 text-white' : 'bg-gray-200'}`}>
              {i + 1}
            </button>
          ))}
        </div>
      )}

      {/* Add/Edit Student Modal */}
      <Modal isOpen={showStudentModal} onClose={() => setShowStudentModal(false)} 
        title={editingStudent ? 'Chỉnh sửa sinh viên' : 'Thêm sinh viên mới'}>
        <div className="space-y-4">
          <Input label="Mã sinh viên *" value={studentForm.student_code}
            onChange={(e) => setStudentForm({ ...studentForm, student_code: e.target.value })}
            disabled={!!editingStudent} />
          <Input label="Họ và tên *" value={studentForm.full_name}
            onChange={(e) => setStudentForm({ ...studentForm, full_name: e.target.value })} />
          <Input label="Email *" type="email" value={studentForm.email}
            onChange={(e) => setStudentForm({ ...studentForm, email: e.target.value })}
            disabled={!!editingStudent} />
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Lớp</label>
            <select value={studentForm.class_id}
              onChange={(e) => setStudentForm({ ...studentForm, class_id: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg">
              <option value="">-- Chọn lớp --</option>
              {classes.map((c) => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <Input label="GPA" type="number" step="0.01" min="0" max="4" value={studentForm.gpa}
              onChange={(e) => setStudentForm({ ...studentForm, gpa: e.target.value })} />
            <Input label="Điểm rèn luyện" type="number" min="0" max="100" value={studentForm.drr}
              onChange={(e) => setStudentForm({ ...studentForm, drr: e.target.value })} />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Hoàn cảnh</label>
            <select value={studentForm.poor_cert_type}
              onChange={(e) => setStudentForm({ ...studentForm, poor_cert_type: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg">
              <option value="NONE">Bình thường</option>
              <option value="POOR">Hộ nghèo</option>
              <option value="NEAR_POOR">Hộ cận nghèo</option>
              <option value="DISABILITY">Khuyết tật</option>
              <option value="ORPHAN_BOTH">Mồ côi cả cha lẫn mẹ</option>
              <option value="ORPHAN_ONE">Mồ côi cha hoặc mẹ</option>
            </select>
          </div>
          <div className="flex justify-end gap-3 pt-4">
            <Button variant="outline" onClick={() => setShowStudentModal(false)}>Hủy</Button>
            <Button variant="primary" onClick={handleSaveStudent} loading={saving}>
              {editingStudent ? 'Cập nhật' : 'Thêm mới'}
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default AdminStudentsPage;
