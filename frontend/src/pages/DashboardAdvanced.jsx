// src/pages/Admin/DashboardAdvanced.jsx
import React, { useEffect, useState } from "react";
import axios from "axios";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, LineChart, Line
} from "recharts";

const API_BASE = "https://localhost:3001/api";
const fmtVND = (n) => new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(n);

const FILTERS = [
  { id: 'year', label: 'Năm nay' },
  { id: 'quarter', label: 'Quý này' },
  { id: 'month', label: 'Tháng này' },
  { id: 'week', label: 'Tuần này' },
  { id: 'custom', label: 'Tùy chọn' },
];

export default function DashboardAdvanced() {
  const [period, setPeriod] = useState('year');
  const [customRange, setCustomRange] = useState({ start: '', end: '' });
  
  // --- 1. THÊM STATE TRẠNG THÁI ---
  const [status, setStatus] = useState(''); // Mặc định rỗng (Tương đương ALL nhưng trừ Cancelled)

  const [stats, setStats] = useState({ totalRevenue: 0, totalOrders: 0, avgOrderValue: 0, chartData: [] });
  const [loading, setLoading] = useState(false);

  const fetchStats = async () => {
    try {
      setLoading(true);
      
      // --- 2. GỬI THÊM STATUS VÀO PARAMS ---
      const params = { period, status };
      
      if (period === 'custom') {
        if (!customRange.start || !customRange.end) { setLoading(false); return; }
        params.start = customRange.start;
        params.end = customRange.end;
      }

      const res = await axios.get(`${API_BASE}/orders/dashboard/stats`, {
        params,
        withCredentials: true
      });

      if (res.data.success) {
        setStats(res.data);
      }
    } catch (error) {
      console.error("Lỗi:", error);
    } finally {
      setLoading(false);
    }
  };

  // --- 3. THÊM STATUS VÀO DEPENDENCY ---
  useEffect(() => {
    fetchStats();
    // eslint-disable-next-line
  }, [period, status]); // Khi đổi thời gian hoặc trạng thái đều gọi lại API

  const handleCustomFilter = () => {
    if (period === 'custom' && customRange.start && customRange.end) fetchStats();
  };

  return (
    <div className="p-6 bg-gray-50 min-h-screen font-sans">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Advanced Dashboard</h1>
          <p className="text-sm text-gray-500 mt-1">
            Dữ liệu: <span className="font-semibold text-blue-600">{FILTERS.find(f => f.id === period)?.label}</span>
            {status && <span className="ml-2 font-semibold text-orange-600">({status})</span>}
          </p>
        </div>

        <div className="flex flex-col items-end gap-3">
          {/* --- 4. DROPDOWN CHỌN TRẠNG THÁI --- */}
          <div className="flex items-center gap-2">
             <span className="text-sm font-semibold text-gray-600">Trạng thái:</span>
             <select 
               value={status} 
               onChange={(e) => setStatus(e.target.value)}
               className="border rounded px-3 py-1.5 text-sm bg-white outline-none focus:border-blue-500 shadow-sm"
             >
               <option value="">Đơn thực tế (Trừ hủy)</option>
               <option value="ALL">Tất cả (Bao gồm hủy)</option>
               <option value="Pending">Chờ xử lý</option>
               <option value="Confirmed">Đã xác nhận</option>
               <option value="Shipping">Đang giao</option>
               <option value="Delivered">Đã giao hàng</option>
               <option value="Cancelled">Đã hủy</option>
             </select>
          </div>

          <div className="bg-white p-1 rounded-lg border shadow-sm flex gap-1">
            {FILTERS.map(f => (
              <button key={f.id} onClick={() => setPeriod(f.id)}
                className={`px-3 py-1.5 text-sm font-medium rounded-md transition-all ${
                  period === f.id ? 'bg-blue-600 text-white shadow' : 'text-gray-600 hover:bg-gray-100'
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>

          {period === 'custom' && (
            <div className="flex gap-2 bg-white p-1 rounded border shadow-sm animate-fade-in">
              <input type="date" className="border rounded px-2 py-1 text-sm"
                onChange={e => setCustomRange({...customRange, start: e.target.value})} />
              <span className="self-center">-</span>
              <input type="date" className="border rounded px-2 py-1 text-sm"
                onChange={e => setCustomRange({...customRange, end: e.target.value})} />
              <button onClick={fetchStats} className="bg-blue-600 text-white px-3 py-1 text-sm rounded">Lọc</button>
            </div>
          )}
        </div>
      </div>

      {/* KPI Cards & Charts giữ nguyên như cũ */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white p-6 rounded-xl shadow-sm border-l-4 border-blue-500">
          <p className="text-gray-500 text-xs font-bold uppercase tracking-wider">Số đơn hàng</p>
          <h2 className="text-3xl font-bold text-gray-800 mt-2">{stats.totalOrders}</h2>
        </div>
        <div className="bg-white p-6 rounded-xl shadow-sm border-l-4 border-green-500">
          <p className="text-gray-500 text-xs font-bold uppercase tracking-wider">Tổng doanh thu</p>
          <h2 className="text-3xl font-bold text-gray-800 mt-2">{fmtVND(stats.totalRevenue)}</h2>
        </div>
        <div className="bg-white p-6 rounded-xl shadow-sm border-l-4 border-orange-500">
          <p className="text-gray-500 text-xs font-bold uppercase tracking-wider">Giá trị TB / Đơn</p>
          <h2 className="text-3xl font-bold text-gray-800 mt-2">{fmtVND(stats.avgOrderValue)}</h2>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl p-6 shadow-sm">
          <h3 className="font-semibold mb-6 text-gray-700">Biểu đồ Doanh thu</h3>
          <div className="h-80 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={stats.chartData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#eee" />
                <XAxis dataKey="name" tick={{fontSize: 12}} axisLine={false} tickLine={false} dy={10} />
                <YAxis tick={{fontSize: 12}} axisLine={false} tickLine={false} 
                  tickFormatter={(val)=> val >= 1000000 ? `${val/1000000}M` : val} />
                <Tooltip formatter={(value) => fmtVND(value)} 
                  contentStyle={{borderRadius: '8px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)'}} />
                <Legend wrapperStyle={{paddingTop: '20px'}} />
                <Line type="monotone" dataKey="DoanhThu" name="Doanh thu" stroke="#3b82f6" strokeWidth={3} dot={{r:4, strokeWidth:2, fill:'#fff'}} activeDot={{r:6}} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white rounded-xl p-6 shadow-sm">
          <h3 className="font-semibold mb-6 text-gray-700">Số lượng đơn hàng</h3>
          <div className="h-80 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={stats.chartData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#eee" />
                <XAxis dataKey="name" tick={{fontSize: 12}} axisLine={false} tickLine={false} dy={10} />
                <YAxis allowDecimals={false} tick={{fontSize: 12}} axisLine={false} tickLine={false} />
                <Tooltip contentStyle={{borderRadius: '8px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)'}} />
                <Legend wrapperStyle={{paddingTop: '20px'}} />
                <Bar dataKey="DonHang" name="Số đơn hàng" fill="#10b981" radius={[4, 4, 0, 0]} barSize={40} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
}