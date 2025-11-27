// src/pages/Admin/OrderManagement.jsx
import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';

const API_BASE = "https://localhost:3001/api"; 
const fmtVND = (n) => new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(n);
const fmtDate = (d) => new Date(d).toLocaleString('vi-VN');

export default function OrderManagement() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(false);
  
  // --- CẤU HÌNH BỘ LỌC (QUAN TRỌNG: ID phải khớp với Backend) ---
  const [filterDate, setFilterDate] = useState('month'); // Mặc định chọn Tháng này
  const [customRange, setCustomRange] = useState({ start: '', end: '' });
  const [filterStatus, setFilterStatus] = useState('ALL');
  
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState({ totalPages: 1, totalOrders: 0 });

  const fetchOrders = async (p = 1) => {
    setLoading(true);
    try {
      const params = {
        page: p,
        limit: 20,
        date: filterDate, // Gửi key: 'month', 'today', v.v.
        status: filterStatus
      };

      if (filterDate === 'custom') {
        if (!customRange.start || !customRange.end) {
           setLoading(false); return; 
        }
        params.start = customRange.start;
        params.end = customRange.end;
      }

      const res = await axios.get(`${API_BASE}/orders`, { 
        params, 
        withCredentials: true 
      });

      if (res.data.success) {
        setOrders(res.data.orders);
        setPagination(res.data.pagination);
        setPage(p);
      }
    } catch (error) {
      console.error(error);
      toast.error("Lỗi tải danh sách đơn hàng");
    } finally {
      setLoading(false);
    }
  };

  // Gọi API khi bộ lọc thay đổi
  useEffect(() => {
    if (filterDate === 'custom' && (!customRange.start || !customRange.end)) return;
    fetchOrders(1); // Reset về trang 1
    // eslint-disable-next-line
  }, [filterDate, filterStatus]);

  return (
    <div className="p-6 bg-white min-h-screen rounded-lg shadow-sm">
      <h1 className="text-2xl font-bold mb-6 text-gray-800">Quản lý Đơn hàng</h1>

      {/* --- THANH BỘ LỌC --- */}
      <div className="bg-gray-50 p-4 rounded-lg border mb-6 flex flex-wrap gap-4 items-center justify-between">
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-sm font-semibold text-gray-600 mr-2">Thời gian:</span>
          {[
            { id: 'today', label: 'Hôm nay' },
            { id: 'yesterday', label: 'Hôm qua' },
            { id: 'week', label: 'Tuần này' },
            { id: 'month', label: 'Tháng này' }, // Backend chờ chữ 'month'
            { id: 'all', label: 'Tất cả' },
            { id: 'custom', label: 'Tùy chọn' },
          ].map((btn) => (
            <button
              key={btn.id}
              onClick={() => setFilterDate(btn.id)}
              className={`px-3 py-1.5 text-sm rounded border transition-all ${
                filterDate === btn.id
                  ? 'bg-blue-600 text-white border-blue-600 shadow'
                  : 'bg-white text-gray-700 hover:bg-gray-100 border-gray-300'
              }`}
            >
              {btn.label}
            </button>
          ))}
        </div>

        {filterDate === 'custom' && (
          <div className="flex items-center gap-2">
            <input type="date" className="border rounded px-2 py-1 text-sm" 
              onChange={e => setCustomRange({...customRange, start: e.target.value})} />
            <span>-</span>
            <input type="date" className="border rounded px-2 py-1 text-sm" 
              onChange={e => setCustomRange({...customRange, end: e.target.value})} />
            <button onClick={() => fetchOrders(1)} className="bg-blue-600 text-white px-3 py-1 text-sm rounded">Lọc</button>
          </div>
        )}

        <div className="flex items-center gap-2">
          <span className="text-sm font-semibold text-gray-600">Trạng thái:</span>
          <select 
            className="border rounded px-2 py-1.5 text-sm bg-white outline-none focus:border-blue-500"
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
          >
            <option value="ALL">Tất cả</option>
            <option value="Pending">Chờ xử lý</option>
            <option value="Confirmed">Đã xác nhận</option>
            <option value="Shipping">Đang giao</option>
            <option value="Delivered">Đã giao hàng</option>
            <option value="Cancelled">Đã hủy</option>
          </select>
        </div>
      </div>

      {/* --- BẢNG DỮ LIỆU --- */}
      <div className="overflow-x-auto border rounded-lg">
        <table className="min-w-full text-sm text-left">
          <thead className="bg-gray-100 text-gray-700 font-semibold uppercase text-xs">
            <tr>
              <th className="px-4 py-3">Mã đơn</th>
              <th className="px-4 py-3">Ngày tạo</th>
              <th className="px-4 py-3">Khách hàng</th>
              <th className="px-4 py-3 text-center">SL</th>
              <th className="px-4 py-3 text-right">Tổng tiền</th>
              <th className="px-4 py-3 text-center">Trạng thái</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200 bg-white">
            {loading ? (
              <tr><td colSpan={6} className="p-8 text-center text-gray-500">Đang tải...</td></tr>
            ) : orders.length === 0 ? (
              <tr><td colSpan={6} className="p-8 text-center text-gray-500 italic">Không có đơn hàng nào.</td></tr>
            ) : (
              orders.map((order) => (
                <tr key={order._id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-4 py-3 font-medium text-blue-600">{order.orderId}</td>
                  <td className="px-4 py-3 text-gray-600">{fmtDate(order.createdAt)}</td>
                  <td className="px-4 py-3">
                    <div className="font-medium">{order.customerName}</div>
                    <div className="text-xs text-gray-400">{order.customerEmail}</div>
                  </td>
                  <td className="px-4 py-3 text-center">{order.itemsCount}</td>
                  <td className="px-4 py-3 text-right font-bold text-red-600">{fmtVND(order.totalPrice)}</td>
                  <td className="px-4 py-3 text-center">
                    <span className={`px-2 py-1 rounded text-xs font-bold border ${
                      order.status === 'Delivered' ? 'bg-green-100 text-green-700 border-green-200' :
                      order.status === 'Cancelled' ? 'bg-red-100 text-red-700 border-red-200' :
                      'bg-yellow-100 text-yellow-700 border-yellow-200'
                    }`}>
                      {order.status}
                    </span>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* --- PHÂN TRANG --- */}
      <div className="flex items-center justify-between mt-4 px-2">
        <div className="text-sm text-gray-600">
          Trang <b>{page}</b> / {pagination.totalPages} (Tổng <b>{pagination.totalOrders}</b> đơn)
        </div>
        <div className="flex gap-2">
          <button disabled={page <= 1} onClick={() => fetchOrders(page - 1)} 
            className="px-3 py-1 border rounded hover:bg-gray-100 disabled:opacity-50 text-sm">Trước</button>
          <button disabled={page >= pagination.totalPages} onClick={() => fetchOrders(page + 1)} 
            className="px-3 py-1 border rounded hover:bg-gray-100 disabled:opacity-50 text-sm">Sau</button>
        </div>
      </div>
    </div>
  );
}