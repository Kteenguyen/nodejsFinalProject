import React, { useEffect, useState } from "react";
import OrdersApi from "../services/ordersApi";

const LABELS = {
  today: "Hôm nay",
  yesterday: "Hôm qua",
  thisWeek: "Tuần này",
  thisMonth: "Tháng này",
  all: "Tất cả",
  range: "Tùy chọn",
};

const Currency = ({ value }) => (
  <span>{(Number(value) || 0).toLocaleString("vi-VN")} đ</span>
);

export default function AdminOrders() {
  const [orders, setOrders] = useState([]);
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(20);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);

  const [date, setDate] = useState("today"); // today|yesterday|thisWeek|thisMonth|range|all
  const [status, setStatus] = useState("");  // Pending|Confirmed|Shipping|Delivered|Cancelled|""
  const [range, setRange] = useState({ start: "", end: "" });

  const fetchOrders = async (p = page) => {
    setLoading(true);
    const params = { page: p, limit, date, status };
    if (date === "range") {
      if (range.start) params.start = range.start;
      if (range.end) params.end = range.end;
    }
    try {
      const { data } = await OrdersApi.list(params);
      const list = data.orders || data.items || data.data || [];
      setOrders(list);
      setTotalPages(data.totalPages || Math.max(Math.ceil((data.totalOrders || 0) / limit), 1));
      setPage(data.currentPage || p);
    } catch (e) {
      console.error(e);
      setOrders([]);
      setTotalPages(1);
      setPage(1);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders(1);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [date, status, limit, range.start, range.end]);

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Đơn hàng</h1>

      {/* Filters */}
      <div className="flex flex-wrap items-end gap-3 mb-4">
        <div>
          <label className="block text-sm mb-1">Khoảng thời gian</label>
          <div className="flex flex-wrap gap-2">
            {["today", "yesterday", "thisWeek", "thisMonth", "all", "range"].map((k) => (
              <button
                key={k}
                onClick={() => setDate(k)}
                className={`px-3 py-1 rounded border ${
                  date === k ? "bg-indigo-600 text-white" : "bg-white"
                }`}
              >
                {LABELS[k]}
              </button>
            ))}
          </div>
        </div>

        {date === "range" && (
          <div className="flex items-end gap-2">
            <div>
              <label className="block text-sm mb-1">Bắt đầu</label>
              <input
                type="date"
                value={range.start}
                onChange={(e) => setRange({ ...range, start: e.target.value })}
                className="border rounded px-2 py-1"
              />
            </div>
            <div>
              <label className="block text-sm mb-1">Kết thúc</label>
              <input
                type="date"
                value={range.end}
                onChange={(e) => setRange({ ...range, end: e.target.value })}
                className="border rounded px-2 py-1"
              />
            </div>
          </div>
        )}

        <div>
          <label className="block text-sm mb-1">Trạng thái</label>
          <select
            value={status}
            onChange={(e) => setStatus(e.target.value)}
            className="border rounded px-2 py-1"
          >
            <option value="">Tất cả</option>
            <option value="Pending">Pending</option>
            <option value="Confirmed">Confirmed</option>
            <option value="Shipping">Shipping</option>
            <option value="Delivered">Delivered</option>
            <option value="Cancelled">Cancelled</option>
          </select>
        </div>

        <div className="ml-auto">
          <label className="block text-sm mb-1">Mỗi trang</label>
          <select
            value={limit}
            onChange={(e) => setLimit(Number(e.target.value))}
            className="border rounded px-2 py-1"
          >
            {[10, 20, 30, 50].map((n) => (
              <option key={n} value={n}>
                {n}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded shadow overflow-x-auto">
        <table className="min-w-full">
          <thead>
            <tr className="bg-gray-100 text-left">
              <th className="p-3">Mã đơn</th>
              <th className="p-3">Ngày</th>
              <th className="p-3">Khách</th>
              <th className="p-3">Số SP</th>
              <th className="p-3">Tổng tiền</th>
              <th className="p-3">Thanh toán</th>
              <th className="p-3">Trạng thái</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td className="p-5" colSpan={7}>
                  Đang tải…
                </td>
              </tr>
            ) : orders.length === 0 ? (
              <tr>
                <td className="p-5" colSpan={7}>
                  Không có đơn hàng.
                </td>
              </tr>
            ) : (
              orders.map((o) => (
                <tr key={o.orderId} className="border-t">
                  <td className="p-3 font-semibold">{o.orderId}</td>
                  <td className="p-3">
                    {o.createdAt ? new Date(o.createdAt).toLocaleString("vi-VN") : ""}
                  </td>
                  <td className="p-3">
                    {o.guestInfo?.name || o.customer?.name || o.accountId || "Guest"}
                  </td>
                  <td className="p-3">{o.items?.length ?? 0}</td>
                  <td className="p-3">
                    <Currency value={o.totalPrice || o.total} />
                  </td>
                  <td className="p-3">{o.isPaid ? "Đã thanh toán" : "Chưa thanh toán"}</td>
                  <td className="p-3">{o.status}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      <div className="flex items-center gap-2 mt-4">
        <button
          className="px-3 py-1 border rounded"
          disabled={page <= 1}
          onClick={() => fetchOrders(page - 1)}
        >
          Trước
        </button>
        <span>
          Trang {page}/{totalPages}
        </span>
        <button
          className="px-3 py-1 border rounded"
          disabled={page >= totalPages}
          onClick={() => fetchOrders(page + 1)}
        >
          Sau
        </button>
      </div>
    </div>
  );
}
