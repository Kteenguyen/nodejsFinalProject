// frontend/src/services/dashboardApi.js
import { API_BASE } from "./https";

/** KPI nâng cao (đúng RUBIK) */
export async function getAdvancedStats(options = {}, signal) {
  const {
    period = "year",
    from,
    to,
    status,
    startDate, // alias cũ
    endDate,   // alias cũ
    signal: optSignal // cho phép truyền signal trong options
  } = options;

  const params = {
    period,
    from: from || startDate,
    to: to || endDate,
    status
  };

  const q = new URLSearchParams(
    Object.fromEntries(Object.entries(params).filter(([, v]) => v != null && v !== ""))
  ).toString();

  const res = await fetch(
    `${API_BASE}/api/admin/stats/advanced${q ? `?${q}` : ""}`,
    { credentials: "include", signal: signal || optSignal }
  );
  if (!res.ok) {
    const txt = await res.text().catch(() => "");
    throw new Error(txt || `${res.status} ${res.statusText}`);
  }
  return res.json();
}

export const adminListOrders = (params) => api.get('/api/orders', { params });

/** Alias cũ */
export const getKpis = (opts, sig) => getAdvancedStats(opts, sig);

/** Fallback nhanh */
export async function getFallbackCounts(signal) {
  let products = 0, orders = 0;

  try {
    const r = await fetch(`${API_BASE}/api/products?limit=1`, { credentials: "include", signal });
    const j = await r.json();
    products = j?.totalProducts ?? 0;
  } catch {}

  try {
    const r2 = await fetch(`${API_BASE}/api/orders/admin/all`, { credentials: "include", signal });
    const j2 = await r2.json();
    const arr = j2?.orders || j2?.data || [];
    orders = Array.isArray(arr) ? arr.length : 0;
  } catch {}

  return { products, orders };
}
