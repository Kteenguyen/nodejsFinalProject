// frontend/src/components/Dashboard/DashboardHome.jsx
import React, { useEffect, useMemo, useState } from "react";
// Đảm bảo bạn đã export hàm getAdvancedStats trong services/api.js
// Nếu chưa, hãy thêm: export const getAdvancedStats = (params, signal) => api.get('/admin/stats/advanced', { params, signal }).then(res => res.data);
import { getAdvancedStats } from "../services/api"; 
import { TrendingUp, ShoppingCart, PiggyBank, Calendar } from "lucide-react";
import {
  LineChart, Line, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Legend,
} from "recharts";

const currency = (n) => (Number(n) || 0).toLocaleString("vi-VN") + " ₫";
const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8'];

export default function DashboardHome() {
  const [period, setPeriod] = useState("year");
  const [customDate, setCustomDate] = useState({ start: "", end: "" });
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");
  
  // State lưu dữ liệu trả về từ API Advanced
  const [data, setData] = useState({
    kpis: { orders: 0, revenue: 0, profit: 0 },
    series: { revenueProfit: [], ordersQty: [], categoryShare: [], topProducts: [] }
  });

  useEffect(() => {
    const ctrl = new AbortController();
    const fetchData = async () => {
      setLoading(true);
      setErr("");
      try {
        // Chuẩn bị params gửi lên BE
        const params = { period };
        if (period === 'custom' && customDate.start && customDate.end) {
             params.startDate = customDate.start;
             params.endDate = customDate.end;
        }

        // Gọi API Advanced (đúng endpoint controller BE bạn đã viết)
        const res = await getAdvancedStats(params, ctrl.signal);
        
        // Cập nhật state từ response BE
        if (res) {
            setData({
                kpis: res.kpis || { orders: 0, revenue: 0, profit: 0 },
                series: res.series || { revenueProfit: [], ordersQty: [], categoryShare: [], topProducts: [] }
            });
        }
      } catch (e) {
        if (e.name !== "CanceledError") {
            setErr("Không thể tải dữ liệu thống kê. Vui lòng thử lại.");
            console.error(e);
        }
      } finally {
        setLoading(false);
      }
    };

    // Nếu chọn custom mà chưa nhập đủ ngày thì chưa gọi API
    if (period !== 'custom' || (customDate.start && customDate.end)) {
        fetchData();
    }

    return () => ctrl.abort();
  }, [period, customDate]);

  // Format dữ liệu cho biểu đồ Line (Doanh thu & Lợi nhuận)
  const lineChartData = useMemo(() => {
      return (data.series.revenueProfit || []).map(item => ({
          name: item.label,
          revenue: item.revenue,
          profit: item.profit
      }));
  }, [data.series.revenueProfit]);

  // Format dữ liệu cho biểu đồ Bar (Số đơn & Số SP)
  const barChartData = useMemo(() => {
      return (data.series.ordersQty || []).map(item => ({
          name: item.label,
          orders: item.orders,
          qty: item.qty
      }));
  }, [data.series.ordersQty]);

  return (
    <div className="p-4 md:p-6 bg-gray-50 min-h-screen">
      {/* HEADER & FILTER */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
        <div>
            <h1 className="text-2xl font-bold text-gray-800">Tổng quan kinh doanh</h1>
            <p className="text-sm text-gray-500">Theo dõi hiệu suất bán hàng của bạn</p>
        </div>

        <div className="flex flex-wrap items-center gap-2 bg-white p-2 rounded-lg shadow-sm border">
            <select
              value={period}
              onChange={(e) => setPeriod(e.target.value)}
              className="bg-transparent text-sm font-medium focus:outline-none cursor-pointer"
            >
              <option value="year">Năm nay</option>
              <option value="quarter">Quý này</option>
              <option value="month">Tháng này</option>
              <option value="week">Tuần này</option>
              <option value="custom">Tuỳ chọn ngày</option>
            </select>
            
            {period === 'custom' && (
                <div className="flex items-center gap-2 text-sm ml-2 border-l pl-2">
                    <input 
                        type="date" 
                        className="border rounded px-2 py-1"
                        onChange={(e) => setCustomDate({...customDate, start: e.target.value})}
                    />
                    <span>-</span>
                    <input 
                        type="date" 
                        className="border rounded px-2 py-1"
                        onChange={(e) => setCustomDate({...customDate, end: e.target.value})}
                    />
                </div>
            )}
        </div>
      </div>

      {err && <div className="mb-4 p-3 bg-red-100 text-red-700 rounded border border-red-200">{err}</div>}

      {/* KPI CARDS */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <KpiCard 
            title="Đơn hàng thành công" 
            value={data.kpis.orders} 
            icon={<ShoppingCart size={20} />} 
            color="blue" 
        />
        <KpiCard 
            title="Tổng doanh thu" 
            value={currency(data.kpis.revenue)} 
            icon={<TrendingUp size={20} />} 
            color="green" 
        />
        <KpiCard 
            title="Lợi nhuận ước tính" 
            value={currency(data.kpis.profit)} 
            icon={<PiggyBank size={20} />} 
            color="amber" 
        />
      </div>

      {/* CHARTS SECTION */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        {/* Main Chart: Revenue & Profit */}
        <div className="lg:col-span-2 bg-white p-5 rounded-xl shadow-sm border">
            <h3 className="font-semibold text-gray-700 mb-4">Doanh thu & Lợi nhuận</h3>
            <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={lineChartData} margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" />
                        <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#6b7280', fontSize: 12}} dy={10} />
                        <YAxis axisLine={false} tickLine={false} tick={{fill: '#6b7280', fontSize: 12}} tickFormatter={(val) => val >= 1000000 ? `${(val/1000000).toFixed(0)}M` : val} />
                        <Tooltip contentStyle={{borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'}} />
                        <Legend wrapperStyle={{paddingTop: '20px'}} />
                        <Line type="monotone" dataKey="revenue" name="Doanh thu" stroke="#3b82f6" strokeWidth={3} dot={{r: 4}} activeDot={{r: 6}} />
                        <Line type="monotone" dataKey="profit" name="Lợi nhuận" stroke="#f59e0b" strokeWidth={3} dot={{r: 4}} />
                    </LineChart>
                </ResponsiveContainer>
            </div>
        </div>

        {/* Pie Chart: Category Share */}
        <div className="bg-white p-5 rounded-xl shadow-sm border flex flex-col">
            <h3 className="font-semibold text-gray-700 mb-4">Tỷ trọng Danh mục (Số lượng)</h3>
            <div className="flex-1 min-h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                        <Pie
                            data={data.series.categoryShare}
                            cx="50%"
                            cy="50%"
                            innerRadius={60}
                            outerRadius={100}
                            paddingAngle={5}
                            dataKey="value"
                        >
                            {data.series.categoryShare.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                            ))}
                        </Pie>
                        <Tooltip formatter={(val) => [val, 'Số lượng']} />
                        <Legend layout="vertical" verticalAlign="bottom" align="center" />
                    </PieChart>
                </ResponsiveContainer>
            </div>
        </div>
      </div>

      {/* Bar Chart & Top Products Table */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
         {/* Bar Chart: Orders vs Qty */}
         <div className="lg:col-span-2 bg-white p-5 rounded-xl shadow-sm border">
            <h3 className="font-semibold text-gray-700 mb-4">Đơn hàng & Sản phẩm bán ra</h3>
            <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={barChartData} margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} />
                        <XAxis dataKey="name" axisLine={false} tickLine={false} />
                        <YAxis axisLine={false} tickLine={false} />
                        <Tooltip cursor={{fill: '#f3f4f6'}} />
                        <Legend />
                        <Bar dataKey="orders" name="Số đơn hàng" fill="#8b5cf6" radius={[4, 4, 0, 0]} barSize={30} />
                        <Bar dataKey="qty" name="Sản phẩm bán" fill="#10b981" radius={[4, 4, 0, 0]} barSize={30} />
                    </BarChart>
                </ResponsiveContainer>
            </div>
         </div>

         {/* Top Products List */}
         <div className="bg-white p-5 rounded-xl shadow-sm border">
             <h3 className="font-semibold text-gray-700 mb-4">Top Sản phẩm bán chạy</h3>
             <div className="overflow-y-auto max-h-80 pr-2">
                 <ul className="space-y-4">
                     {data.series.topProducts.map((p, idx) => (
                         <li key={idx} className="flex items-center justify-between text-sm">
                             <div className="flex items-center gap-3">
                                 <span className="flex items-center justify-center w-6 h-6 rounded-full bg-gray-100 text-gray-600 text-xs font-bold">
                                     {idx + 1}
                                 </span>
                                 <span className="font-medium text-gray-800 line-clamp-1 max-w-[150px]" title={p.name}>
                                     {p.name}
                                 </span>
                             </div>
                             <div className="text-right">
                                 <div className="font-bold text-gray-900">{p.qty} cái</div>
                                 <div className="text-xs text-gray-500">{currency(p.revenue)}</div>
                             </div>
                         </li>
                     ))}
                     {data.series.topProducts.length === 0 && (
                         <li className="text-center text-gray-500 py-4">Chưa có dữ liệu</li>
                     )}
                 </ul>
             </div>
         </div>
      </div>
    </div>
  );
}

// Component phụ hiển thị thẻ KPI nhỏ gọn
function KpiCard({ title, value, icon, color }) {
    const colorClasses = {
        blue: "bg-blue-50 text-blue-600",
        green: "bg-green-50 text-green-600",
        amber: "bg-amber-50 text-amber-600"
    };

    return (
        <div className="bg-white p-5 rounded-xl border shadow-sm flex items-center gap-4">
            <div className={`p-3 rounded-lg ${colorClasses[color]}`}>
                {icon}
            </div>
            <div>
                <p className="text-sm text-gray-500 font-medium uppercase tracking-wide">{title}</p>
                <h4 className="text-2xl font-bold text-gray-900 mt-1">{value}</h4>
            </div>
        </div>
    );
}