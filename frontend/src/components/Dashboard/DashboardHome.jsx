// frontend/src/components/Dashboard/DashboardHome.jsx
import React, { useEffect, useMemo, useState } from "react";
import { getKpis, getFallbackCounts } from "../../services/dashboardApi";
import { API_BASE } from "../../services/https";
import { TrendingUp, ShoppingCart, PiggyBank } from "lucide-react";
import {
  LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Legend,
} from "recharts";

const currency = (n) => (Number(n) || 0).toLocaleString("vi-VN") + " ₫";

export default function DashboardHome() {
  const [period, setPeriod] = useState("year");
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");
  const [kpis, setKpis] = useState({
    orders: 0,
    revenue: 0,
    profit: 0,
    series: [],       // [{label, revenue, profit, orders}]
  });

  useEffect(() => {
    const ctrl = new AbortController();
    (async () => {
      setLoading(true);
      setErr("");
      try {
        // Thử gọi API dashboard (chuẩn đề & rubric)
        const data = await getKpis({ period }, ctrl.signal);
        // Kỳ vọng backend trả các trường giống tên
        setKpis({
          orders: Number(data.orders || 0),
          revenue: Number(data.revenue || 0),
          profit: Number(data.profit || 0),
          series: Array.isArray(data.series) ? data.series : [],
        });
      } catch (e) {
        // Fallback để vẫn có số hiển thị
        const fb = await getFallbackCounts(ctrl.signal);
        setKpis({
          orders: fb.orders,
          revenue: 0,
          profit: 0,
          series: [],
        });
        setErr("Đang dùng số liệu dự phòng (fallback). Hãy kiểm tra endpoint /api/admin/dashboard/kpis.");
        // console.warn(e);
      } finally {
        setLoading(false);
      }
    })();
    return () => ctrl.abort();
  }, [period]);

  const series = useMemo(() => {
    // Chuẩn hoá data cho Recharts
    return (kpis.series || []).map((x) => ({
      name: x.label || x.name || "",
      revenue: Number(x.revenue || 0),
      profit: Number(x.profit || 0),
      orders: Number(x.orders || 0),
    }));
  }, [kpis.series]);

  return (
    <div className="p-4 md:p-6">
      <div className="flex items-center justify-between gap-3 mb-4">
        <h1 className="text-xl font-semibold">Dashboard</h1>

        {/* Bộ chọn khung thời gian theo RUBIK */}
        <select
          value={period}
          onChange={(e) => setPeriod(e.target.value)}
          className="border rounded px-3 py-2 text-sm"
        >
          <option value="year">Theo năm (mặc định)</option>
          <option value="quarter">Theo quý</option>
          <option value="month">Theo tháng</option>
          <option value="week">Theo tuần</option>
          <option value="custom" disabled>Tuỳ chọn (from/to) – sẽ thêm sau</option>
        </select>
      </div>

      {err && (
        <div className="mb-4 text-sm text-yellow-700 bg-yellow-50 border border-yellow-200 rounded px-3 py-2">
          {err}
          <div className="text-xs text-gray-500 mt-1">
            API_BASE: <code>{API_BASE}</code>
          </div>
        </div>
      )}

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="rounded-lg border p-4 bg-white shadow-sm">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded bg-blue-50 text-blue-700">
              <ShoppingCart size={18} />
            </div>
            <div>
              <div className="text-xs text-gray-500 uppercase">Đơn hàng</div>
              <div className="text-xl font-semibold">{kpis.orders}</div>
            </div>
          </div>
        </div>
        <div className="rounded-lg border p-4 bg-white shadow-sm">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded bg-green-50 text-green-700">
              <TrendingUp size={18} />
            </div>
            <div>
              <div className="text-xs text-gray-500 uppercase">Doanh thu</div>
              <div className="text-xl font-semibold">{currency(kpis.revenue)}</div>
            </div>
          </div>
        </div>
        <div className="rounded-lg border p-4 bg-white shadow-sm">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded bg-amber-50 text-amber-700">
              <PiggyBank size={18} />
            </div>
            <div>
              <div className="text-xs text-gray-500 uppercase">Lợi nhuận</div>
              <div className="text-xl font-semibold">{currency(kpis.profit)}</div>
            </div>
          </div>
        </div>
      </div>

      {/* Chart: Revenue/Profit over time */}
      <div className="rounded-lg border p-4 bg-white shadow-sm">
        <div className="flex items-center justify-between mb-3">
          <div className="font-medium">Doanh thu & Lợi nhuận theo thời gian</div>
        </div>

        {loading ? (
          <div className="text-sm text-gray-500">Đang tải biểu đồ...</div>
        ) : series.length === 0 ? (
          <div className="text-sm text-gray-500">Chưa có dữ liệu biểu đồ cho khung thời gian này.</div>
        ) : (
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={series} margin={{ top: 10, right: 16, bottom: 0, left: 0 }}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis tickFormatter={(v) => (v / 1e6).toFixed(0) + "M"} />
                <Tooltip
                  formatter={(value, name) => {
                    if (name === "orders") return [value, "Đơn hàng"];
                    return [currency(value), name === "revenue" ? "Doanh thu" : "Lợi nhuận"];
                  }}
                />
                <Legend />
                <Line type="monotone" dataKey="revenue" stroke="#2563eb" strokeWidth={2} dot={false} />
                <Line type="monotone" dataKey="profit" stroke="#16a34a" strokeWidth={2} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        )}
      </div>
    </div>
  );
}
