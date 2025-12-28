import { useEffect, useState } from 'react';
import api from '../../services/api';
import Loading from '../../components/common/Loading';
import Badge from '../../components/common/Badge';

const SponsorFinancePage = () => {
  const [stats, setStats] = useState({});
  const [transactions, setTransactions] = useState([]);
  const [disbursements, setDisbursements] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [statsRes, transRes, disbRes] = await Promise.all([
        api.get('/stats/sponsor').catch(() => ({ data: { data: { overview: {} } } })),
        api.get('/sponsor/transactions').catch(() => ({ data: { data: [] } })),
        api.get('/sponsor/disbursements').catch(() => ({ data: { data: [] } }))
      ]);
      // API trả về { success, data: { overview: {...} } }
      const statsData = statsRes.data?.data?.overview || statsRes.data?.overview || {};
      setStats({
        totalSponsored: statsData.total_contributed || 0,
        totalDisbursed: statsData.total_disbursed || 0,
        totalRecipients: statsData.total_recipients || 0
      });
      setTransactions(transRes.data?.data || []);
      setDisbursements(disbRes.data?.data || []);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <Loading />;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-800">Tài chính & Giải ngân</h1>
        <p className="text-gray-600 mt-1">Theo dõi dòng tiền và báo cáo giải ngân</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white rounded-xl shadow-lg p-6 border-t-4 border-blue-500">
          <p className="text-gray-500 text-sm">Tổng đã tài trợ</p>
          <p className="text-2xl font-bold text-blue-600">
            {(stats.totalSponsored || 0).toLocaleString('vi-VN')} đ
          </p>
        </div>
        <div className="bg-white rounded-xl shadow-lg p-6 border-t-4 border-green-500">
          <p className="text-gray-500 text-sm">Đã giải ngân</p>
          <p className="text-2xl font-bold text-green-600">
            {(stats.totalDisbursed || 0).toLocaleString('vi-VN')} đ
          </p>
        </div>
        <div className="bg-white rounded-xl shadow-lg p-6 border-t-4 border-yellow-500">
          <p className="text-gray-500 text-sm">Còn lại</p>
          <p className="text-2xl font-bold text-yellow-600">
            {((stats.totalSponsored || 0) - (stats.totalDisbursed || 0)).toLocaleString('vi-VN')} đ
          </p>
        </div>
        <div className="bg-white rounded-xl shadow-lg p-6 border-t-4 border-purple-500">
          <p className="text-gray-500 text-sm">Sinh viên nhận</p>
          <p className="text-2xl font-bold text-purple-600">{stats.totalRecipients || 0}</p>
        </div>
      </div>

      {/* Lịch sử chuyển khoản */}
      <div className="bg-white rounded-xl shadow-lg p-6">
        <h3 className="text-xl font-bold text-gray-800 mb-4">💳 Lịch sử chuyển khoản vào quỹ</h3>
        {transactions.length > 0 ? (
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Ngày</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Số tiền</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Ghi chú</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Trạng thái</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {transactions.map((t, i) => (
                <tr key={i}>
                  <td className="px-4 py-3 text-sm">{new Date(t.date).toLocaleDateString('vi-VN')}</td>
                  <td className="px-4 py-3 text-sm font-bold text-green-600">+{t.amount?.toLocaleString('vi-VN')} đ</td>
                  <td className="px-4 py-3 text-sm">{t.note}</td>
                  <td className="px-4 py-3"><Badge variant="success">Đã nhận</Badge></td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <div className="text-center py-8 text-gray-500">
            <p className="text-4xl mb-2">💰</p>
            <p>Chưa có giao dịch nào</p>
          </div>
        )}
      </div>

      {/* Báo cáo giải ngân */}
      <div className="bg-white rounded-xl shadow-lg p-6">
        <h3 className="text-xl font-bold text-gray-800 mb-4">📊 Báo cáo giải ngân cho sinh viên</h3>
        {disbursements.length > 0 ? (
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Sinh viên</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Học bổng</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Số tiền</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Ngày giải ngân</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Minh chứng</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {disbursements.map((d, i) => (
                <tr key={i}>
                  <td className="px-4 py-3">
                    <p className="font-medium">{d.student_name}</p>
                    <p className="text-sm text-gray-500">{d.student_code}</p>
                  </td>
                  <td className="px-4 py-3 text-sm">{d.scholarship_name}</td>
                  <td className="px-4 py-3 text-sm font-bold text-blue-600">{d.amount?.toLocaleString('vi-VN')} đ</td>
                  <td className="px-4 py-3 text-sm">{new Date(d.date).toLocaleDateString('vi-VN')}</td>
                  <td className="px-4 py-3">
                    {d.proof_url ? (
                      <a href={d.proof_url} target="_blank" rel="noreferrer" className="text-blue-600 hover:underline">
                        📄 Xem UNC
                      </a>
                    ) : (
                      <span className="text-gray-400">-</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <div className="text-center py-8 text-gray-500">
            <p className="text-4xl mb-2">📋</p>
            <p>Chưa có báo cáo giải ngân</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default SponsorFinancePage;
