import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../services/api"; // Đảm bảo đường dẫn này đúng với cấu trúc thư mục của bạn

const LABELS = {
  today: "Hôm nay",
  yesterday: "Hôm qua",
  week: "Tuần này",
  month: "Tháng này",
  all: "Tất cả",
  custom: "Tùy chọn",
};

const Currency = ({ value }) => (
  <span className="font-semibold text-gray-700">
    {(Number(value) || 0).toLocaleString("vi-VN")} ₫
  </span>
);

export default function AdminOrders() {
  const navigate = useNavigate();

  const [orders, setOrders] = useState([]);
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(20);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState(""); // Thêm state để hiện lỗi

  const [date, setDate] = useState("all");
  const [status, setStatus] = useState("");
  const [range, setRange] = useState({ start: "", end: "" });

  const fetchOrders = async (p = page) => {
    setLoading(true);
    setErrorMsg(""); // Reset lỗi cũ

    const params = { page: p, limit, date, status };

    if (date === "custom") {
      if (range.start) params.start = range.start;
      if (range.end) params.end = range.end;
    }

    try {
      // Gọi API
      const res = await api.get('/orders', { params });
      
      // Xử lý dữ liệu an toàn
      const data = res.data || res;
      const list = data.orders || [];
      
      setOrders(list);
      
      const total = data.totalOrders || data.total || 0;
      setTotalPages(Math.max(Math.ceil(total / limit), 1));
      setPage(data.currentPage || p);
      
    } catch (e) {
      console.error("Lỗi tải đơn hàng:", e);
      // Hiển thị thông báo lỗi ra màn hình để dễ debug
      const message = e.response?.data?.message || e.message || "Lỗi kết nối Server";
      setErrorMsg(message); 
      setOrders([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (date === "custom" && (!range.start || !range.end)) return;
    fetchOrders(1);
    // eslint-disable-next-line 
  }, [date, status, limit]); 

  const handleCustomFilter = () => {
    if (date === "custom" && range.start && range.end) fetchOrders(1);
  };

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Quản lý Đơn hàng</h1>
        <span className="text-sm text-gray-500">Tổng quan đơn hàng</span>
      </div>

      {/* --- HIỂN THỊ LỖI NẾU CÓ --- */}
      {errorMsg && (
        <div className="mb-4 p-4 bg-red-100 text-red-700 rounded border border-red-200">
          ⚠ Gặp lỗi khi tải dữ liệu: <b>{errorMsg}</b>. <br/>
          Vui lòng kiểm tra Console (F12) hoặc thử đăng nhập lại.
        </div>
      )}

      {/* --- THANH BỘ LỌC --- */}
      <div className="bg-white p-4 rounded-lg shadow-sm border mb-6 flex flex-col gap-4">
        <div className="flex flex-wrap items-center gap-3">
          <span className="text-sm font-semibold text-gray-600">Thời gian:</span>
          <div className="flex flex-wrap gap-2">
            {["today", "yesterday", "week", "month", "all", "custom"].map((k) => (
              <button
                key={k}
                onClick={() => setDate(k)}
                className={`px-3 py-1.5 text-sm rounded border transition-colors ${
                  date === k 
                    ? "bg-blue-600 text-white border-blue-600 shadow-sm" 
                    : "bg-white text-gray-600 hover:bg-gray-50 border-gray-300"
                }`}
              >
                {LABELS[k]}
              </button>
            ))}
          </div>

          {date === "custom" && (
            <div className="flex items-center gap-2 ml-2">
              <input type="date" className="border rounded px-2 py-1.5 text-sm"
                onChange={(e) => setRange({ ...range, start: e.target.value })} />
              <span>-</span>
              <input type="date" className="border rounded px-2 py-1.5 text-sm"
                onChange={(e) => setRange({ ...range, end: e.target.value })} />
              <button onClick={handleCustomFilter} className="bg-blue-600 text-white px-3 py-1.5 rounded text-sm">Lọc</button>
            </div>
          )}
        </div>

        <div className="flex flex-wrap items-center justify-between gap-4 border-t pt-4">
          <div className="flex items-center gap-2">
            <label className="text-sm font-semibold text-gray-600">Trạng thái:</label>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              className="border rounded px-3 py-1.5 text-sm bg-white outline-none focus:border-blue-500"
            >
              <option value="">Tất cả trạng thái</option>
              <option value="Pending">Chờ xử lý</option>
              <option value="Confirmed">Đã xác nhận</option>
              <option value="Shipping">Đang giao</option>
              <option value="Delivered">Đã giao hàng</option>
              <option value="Cancelled">Đã hủy</option>
            </select>
          </div>

          <div className="flex items-center gap-2">
            <label className="text-sm text-gray-600">Hiển thị:</label>
            <select value={limit} onChange={(e) => setLimit(Number(e.target.value))}
              className="border rounded px-2 py-1.5 text-sm bg-white outline-none">
              {[10, 20, 50].map((n) => <option key={n} value={n}>{n} dòng</option>)}
            </select>
          </div>
        </div>
      </div>

      {/* --- BẢNG DỮ LIỆU --- */}
      <div className="bg-white rounded-lg shadow-sm border overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm text-left">
            <thead className="bg-gray-50 text-gray-700 font-semibold border-b">
              <tr>
                <th className="p-4">Mã đơn</th>
                <th className="p-4">Ngày đặt</th>
                <th className="p-4">Khách hàng</th>
                <th className="p-4 text-center">SL</th>
                <th className="p-4 text-right">Tổng tiền</th>
                <th className="p-4 text-center">Thanh toán</th>
                <th className="p-4 text-center">Trạng thái</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {loading ? (
                <tr><td className="p-8 text-center text-gray-500" colSpan={7}>Đang tải dữ liệu...</td></tr>
              ) : orders.length === 0 ? (
                <tr><td className="p-8 text-center text-gray-500 italic" colSpan={7}>
                    {errorMsg ? "Vui lòng sửa lỗi để xem dữ liệu." : "Không tìm thấy đơn hàng nào."}
                </td></tr>
              ) : (
                orders.map((o) => (
                  <tr key={o.orderId} className="hover:bg-blue-50 transition-colors">
                    <td 
                      className="p-4 font-mono font-medium text-blue-600 cursor-pointer hover:underline"
                      onClick={() => navigate(`/admin/orders/${o.orderId}`)}
                      title="Xem chi tiết"
                    >
                      {o.orderId}
                    </td>
                    <td className="p-4 text-gray-600">
                      {o.createdAt ? new Date(o.createdAt).toLocaleDateString("vi-VN") : ""} <br/>
                      <span className="text-xs text-gray-400">{o.createdAt ? new Date(o.createdAt).toLocaleTimeString("vi-VN") : ""}</span>
                    </td>
                    <td className="p-4">
                      <div className="font-medium text-gray-900">{o.customerName}</div>
                      <div className="text-xs text-gray-500">{o.customerEmail}</div>
                    </td>
                    <td className="p-4 text-center text-gray-600">{o.itemsCount}</td>
                    <td className="p-4 text-right"><Currency value={o.totalPrice} /></td>
                    <td className="p-4 text-center">
                       {o.isPaid ? <span className="text-xs text-green-600 font-bold bg-green-50 px-2 py-1 rounded">Đã TT</span> 
                       : <span className="text-xs text-orange-500 font-medium">Chưa TT</span>}
                    </td>
                    <td className="p-4 text-center">
                      <span className={`px-2.5 py-1 rounded-full text-xs font-semibold border ${
                        o.status === 'Delivered' ? 'bg-green-100 text-green-700 border-green-200' :
                        o.status === 'Cancelled' ? 'bg-red-100 text-red-700 border-red-200' :
                        o.status === 'Shipping' ? 'bg-blue-100 text-blue-700 border-blue-200' :
                        'bg-yellow-100 text-yellow-700 border-yellow-200'
                      }`}>{o.status}</span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* --- PHÂN TRANG --- */}
      <div className="flex items-center justify-between mt-4 px-2">
        <span className="text-sm text-gray-500">Trang {page}/{totalPages}</span>
        <div className="flex gap-2">
          <button disabled={page <= 1} onClick={() => fetchOrders(page - 1)} className="px-3 py-1 border rounded hover:bg-gray-50 disabled:opacity-50 text-sm">Trước</button>
          <button disabled={page >= totalPages} onClick={() => fetchOrders(page + 1)} className="px-3 py-1 border rounded hover:bg-gray-50 disabled:opacity-50 text-sm">Sau</button>
        </div>
      </div>
    </div>
  );
}