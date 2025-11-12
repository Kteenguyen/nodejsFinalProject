import { useEffect, useState } from "react";
import { getAdvancedStats, getFallbackCounts } from "../services/dashboardApi";
import TimeGranularityPicker from "../components/Dashboard/TimeGranularityPicker";
import KPIStat from "../components/Dashboard/KPIStat";
import RevenueProfitLine from "../components/Dashboard/charts/RevenueProfitLine";
import OrdersQtyBar from "../components/Dashboard/charts/OrdersQtyBar";
import CategoryPie from "../components/Dashboard/charts/CategoryPie";
import TopProductsBar from "../components/Dashboard/charts/TopProductsBar";

// Mock để vẫn xem UI nếu API chưa kết nối
function mock(bucket = "year") {
  const labels =
    bucket === "year" ? ["2023","2024","2025"]
    : bucket === "quarter" ? ["2025-Q1","2025-Q2","2025-Q3","2025-Q4"]
    : bucket === "month" ? ["2025-01","2025-02","2025-03","2025-04","2025-05","2025-06"]
    : bucket === "week" ? ["2025-W01","W02","W03","W04","W05","W06"]
    : ["A","B","C"];
  const rnd = (a,b)=> Math.round(a + Math.random()*(b-a));
  const revenueProfit = labels.map(l => ({ label:l, revenue:rnd(80,220)*1e6, profit:rnd(15,65)*1e6 }));
  const ordersQty     = labels.map(l => ({ label:l, orders:rnd(20,110), qty:rnd(30,250) }));
  const categoryShare = [{name:"Laptop", value:rnd(40,100)},{name:"PC", value:rnd(20,60)},{name:"Phụ kiện", value:rnd(25,80)},{name:"Khác", value:rnd(5,30)}];
  const topProducts   = [{name:"Laptop A15", qty:rnd(5,40), revenue:rnd(50,150)*1e6},{name:"PC Gaming X", qty:rnd(5,35), revenue:rnd(40,120)*1e6},{name:"Chuột Z", qty:rnd(10,80), revenue:rnd(10,40)*1e6}];
  return { range:{ period:bucket }, kpis:{ orders: ordersQty.reduce((s,x)=>s+x.orders,0), revenue: revenueProfit.reduce((s,x)=>s+x.revenue,0), profit: revenueProfit.reduce((s,x)=>s+x.profit,0) }, series:{ revenueProfit, ordersQty, categoryShare, topProducts } };
}

export default function DashboardAdvanced() {
  const [period, setPeriod] = useState("year");      // year|quarter|month|week|custom
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const [status, setStatus] = useState("Delivered"); // “đơn hàng bán”
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState(mock("year"));
  const [error, setError] = useState("");

  useEffect(() => {
    const ctrl = new AbortController();
    setLoading(true); setError("");
    getAdvancedStats({ period, startDate: from, endDate: to, status, signal: ctrl.signal })
      .then(json => setData(json))
      .catch(() => setData(mock(period)))
      .finally(() => setLoading(false));
    return () => ctrl.abort();
  }, [period, from, to, status]);

  const k = data?.kpis || { orders:0, revenue:0, profit:0 };
  const s = data?.series || { revenueProfit:[], ordersQty:[], categoryShare:[], topProducts:[] };

  return (
    <div className="p-4 md:p-6 space-y-6">
      <header className="flex flex-col md:flex-row md:items-end md:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold">Advanced Dashboard</h1>
          <p className="text-sm text-gray-500">Theo dõi đơn hàng bán (Delivered), doanh thu, lợi nhuận – theo Năm/Quý/Tháng/Tuần hoặc khoảng ngày.</p>
        </div>

        <div className="flex flex-col md:flex-row gap-2 md:items-center">
          <TimeGranularityPicker
            value={period}
            onChange={setPeriod}
            from={from}
            to={to}
            onRangeChange={({ from:f, to:t }) => { setFrom(f); setTo(t); }}
          />
          <select className="border rounded-lg px-2 py-2" value={status} onChange={e=>setStatus(e.target.value)}>
            <option value="Delivered">Delivered</option>
            <option value="">Tất cả</option>
            <option value="Confirmed">Confirmed</option>
            <option value="Shipping">Shipping</option>
            <option value="Cancelled">Cancelled</option>
          </select>
        </div>
      </header>

      <section className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <KPIStat label="Số đơn hàng bán" value={k.orders.toLocaleString()} />
        <KPIStat label="Tổng doanh thu" value={`${k.revenue.toLocaleString("vi-VN")} ₫`} />
        <KPIStat label="Lợi nhuận (ước tính)" value={`${k.profit.toLocaleString("vi-VN")} ₫`} />
      </section>

      <section className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        <div className="bg-white rounded-2xl p-4 shadow-sm">
          <h3 className="font-semibold mb-2">Doanh thu & Lợi nhuận</h3>
          <RevenueProfitLine data={s.revenueProfit} />
        </div>
        <div className="bg-white rounded-2xl p-4 shadow-sm">
          <h3 className="font-semibold mb-2">Số đơn & Số lượng SP</h3>
          <OrdersQtyBar data={s.ordersQty} />
        </div>
        <div className="bg-white rounded-2xl p-4 shadow-sm">
          <h3 className="font-semibold mb-2">Cơ cấu loại sản phẩm</h3>
          <CategoryPie data={s.categoryShare} />
        </div>
        <div className="bg-white rounded-2xl p-4 shadow-sm">
          <h3 className="font-semibold mb-2">Top sản phẩm</h3>
          <TopProductsBar data={s.topProducts} />
        </div>
      </section>

      {loading && <p className="text-sm text-gray-500">Đang tải…</p>}
      {error && <p className="text-sm text-red-600">{error}</p>}
    </div>
  );
}
