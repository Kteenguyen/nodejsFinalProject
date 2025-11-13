import React, { useEffect, useState } from 'react';
import { adminListOrders } from '../../services/dashboardApi';

const QUICK = [
  { key: 'today', label: 'Hôm nay' },
  { key: 'yesterday', label: 'Hôm qua' },
  { key: 'thisWeek', label: 'Tuần này' },
  { key: 'thisMonth', label: 'Tháng này' },
  { key: 'range', label: 'Khoảng ngày' },
  { key: 'all', label: 'Tất cả' },
];

export default function OrderManagement() {
  const [dateKey, setDateKey] = useState('today');
  const [start, setStart] = useState('');
  const [end, setEnd] = useState('');
  const [status, setStatus] = useState('');
  const [page, setPage] = useState(1);

  const [rows, setRows] = useState([]);
  const [meta, setMeta] = useState({ totalOrders:0, totalPages:1 });

  const load = async (p=page) => {
    const params = { page: p, limit: 20, date: dateKey };
    if (dateKey === 'range') { params.start = start; params.end = end; }
    if (status) params.status = status;

    const res = await adminListOrders(params);
    setRows(res.data.orders || []);
    setMeta({ totalOrders: res.data.totalOrders, totalPages: res.data.totalPages });
    setPage(p);
  };

  useEffect(() => { load(1); /* eslint-disable-next-line */ }, [dateKey, status]); // đổi filter => về trang 1

  return (
    <div className="p-4">
      <h1 className="text-xl font-bold mb-4">Order Management</h1>

      {/* Filters */}
      <div className="flex flex-wrap gap-2 items-end mb-4">
        {QUICK.map(q => (
          <button key={q.key}
            className={`px-3 py-2 rounded border ${dateKey===q.key?'bg-black text-white':'bg-white'}`}
            onClick={()=>setDateKey(q.key)}
          >{q.label}</button>
        ))}

        {dateKey === 'range' && (
          <>
            <div>
              <div className="text-xs text-gray-500 mb-1">Từ ngày</div>
              <input type="date" value={start} onChange={e=>setStart(e.target.value)}
                     className="border rounded px-2 py-1" />
            </div>
            <div>
              <div className="text-xs text-gray-500 mb-1">Đến ngày</div>
              <input type="date" value={end} onChange={e=>setEnd(e.target.value)}
                     className="border rounded px-2 py-1" />
            </div>
            <button className="px-3 py-2 border rounded" onClick={()=>load(1)}>Lọc</button>
          </>
        )}

        <div className="ml-auto">
          <div className="text-xs text-gray-500 mb-1">Trạng thái</div>
          <select value={status} onChange={e=>setStatus(e.target.value)} className="border px-2 py-1 rounded">
            <option value="">(Tất cả)</option>
            <option value="new">Mới</option>
            <option value="paid">Đã thanh toán</option>
            <option value="shipped">Đã gửi</option>
            <option value="done">Hoàn tất</option>
            <option value="cancel">Huỷ</option>
          </select>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded shadow overflow-x-auto">
        <table className="min-w-full text-sm">
          <thead className="bg-gray-50">
            <tr>
              <th className="text-left p-3">Thời gian</th>
              <th className="text-left p-3">Khách hàng</th>
              <th className="text-left p-3">Email</th>
              <th className="text-right p-3">SL</th>
              <th className="text-right p-3">Tổng</th>
              <th className="text-left p-3">Trạng thái</th>
            </tr>
          </thead>
          <tbody>
            {rows.map(o => (
              <tr key={o._id} className="border-t">
                <td className="p-3">{new Date(o.createdAt).toLocaleString()}</td>
                <td className="p-3">{o.customer?.name}</td>
                <td className="p-3">{o.customer?.email}</td>
                <td className="p-3 text-right">{o.itemsCount ?? (o.items?.length || 0)}</td>
                <td className="p-3 text-right">{Number(o.total||0).toLocaleString()} ₫</td>
                <td className="p-3 capitalize">{o.status}</td>
              </tr>
            ))}
            {!rows.length && (
              <tr><td className="p-6 text-center text-gray-500" colSpan={6}>Không có đơn hàng</td></tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      <div className="flex items-center justify-between mt-3">
        <div>Tổng: <b>{meta.totalOrders}</b> đơn</div>
        <div className="flex gap-2">
          <button disabled={page<=1}
                  onClick={()=>load(page-1)}
                  className="px-3 py-1 border rounded disabled:opacity-50">« Trước</button>
          <div className="px-2 py-1">Trang {page}/{meta.totalPages}</div>
          <button disabled={page>=meta.totalPages}
                  onClick={()=>load(page+1)}
                  className="px-3 py-1 border rounded disabled:opacity-50">Sau »</button>
        </div>
      </div>
    </div>
  );
}
