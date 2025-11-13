// frontend/src/services/productApi.js
import { API_BASE } from "./https";

// helper build query
const toQS = (obj = {}) =>
  new URLSearchParams(
    Object.entries(obj).filter(([, v]) => v !== undefined && v !== null && v !== "")
  ).toString();

  const jsonOrText = async (res) => {
  const text = await res.text();
  try { return JSON.parse(text); } catch { return { success:false, message:text || res.statusText }; }
};

const throwIfFail = (j, res) => {
  if (res.ok && j?.success !== false) return j;
  const msg = j?.message || res.statusText || "Lỗi máy chủ";
  throw new Error(msg);
};

/** Danh sách sản phẩm (FE + Admin dùng chung) */
export async function listProducts(params = {}, signal) {
  const qs = new URLSearchParams(params).toString();
  try {
    const res = await fetch(`${API_BASE}/api/products${qs ? `?${qs}` : ""}`, {
      credentials: "include",
      signal,
    });
    if (!res.ok) throw new Error(await res.text().catch(() => res.statusText));
    return res.json();
  } catch (e) {
    if (e?.name === "AbortError" || /aborted/i.test(String(e?.message))) {
      // Cho phép caller nhận biết nếu cần
      e.aborted = true;
      throw e;
    }
    throw e;
  }
}

/** ✅ Alias để không phải sửa component admin */
export async function getProductsAdmin(params = {}, signal) {
  return listProducts(params, signal);
}

/** Chi tiết sản phẩm */
export async function getProductById(productId, signal) {
  const res = await fetch(`${API_BASE}/api/products/${productId}`, {
    credentials: "include",
    signal,
  });
  const j = await jsonOrText(res);
  return throwIfFail(j, res);
}

/** Thương hiệu */
export async function getBrands(signal) {
  const res = await fetch(`${API_BASE}/api/products/brands`, {
    credentials: "include",
    signal,
  });
  if (!res.ok) throw new Error(await res.text().catch(() => res.statusText));
  return res.json(); // { success, data: [...] }
}

export async function getCategories(signal) {
  const res = await fetch(`${API_BASE}/api/products/categories`, {
    credentials: "include",
    signal,
  });
  if (!res.ok) throw new Error(await res.text().catch(() => res.statusText));
  return res.json(); // { success, data: [ {categoryId, categoryName}, ... ] }
}

/** (Tùy chọn) Search dùng Elasticsearch nếu BE có */
export async function esSearchProducts(params = {}, signal) {
  const qs = toQS(params);
  const res = await fetch(`${API_BASE}/api/search/products${qs ? `?${qs}` : ""}`, {
    credentials: "include",
    signal,
  });
  if (!res.ok) throw new Error(await res.text().catch(() => res.statusText));
  return res.json();
}

/** Thêm bình luận (server yêu cầu: { comment, name? }) */
export async function addComment(productId, payload, signal) {
  const body = typeof payload === "string"
    ? { comment: payload }
    : { name: payload?.name, comment: payload?.comment || payload?.text }; // map text -> comment

  const res = await fetch(`${API_BASE}/api/products/${productId}/comments`, {
    method: "POST",
    credentials: "include",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
    signal,
  });
  const j = await jsonOrText(res);
  return throwIfFail(j, res);
}

/** Đánh giá sao (server yêu cầu: { rating: 1..5 }) */
export async function rateProduct(productId, payload, signal) {
  // chấp nhận cả number lẫn object
  const rating = typeof payload === "number" ? payload : (payload?.rating ?? payload?.value);
  const res = await fetch(`${API_BASE}/api/products/${productId}/ratings`, {
    method: "POST",
    credentials: "include",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ rating }),  // <-- luôn gửi { rating }
    signal,
  });
  const j = await jsonOrText(res);
  return throwIfFail(j, res);
}
