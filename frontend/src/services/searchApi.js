// ES + fallback search
import { API_BASE, httpGet } from "./https";

/**
 * Search sản phẩm (ưu tiên ElasticSearch). 
 * Server nên route: GET /api/search/products (ES) và fallback /api/products
 * query = { q, page, limit, sort, brands, minPrice, maxPrice, rating, category }
 */
export async function searchProducts(query = {}, signal) {
  const qs = new URLSearchParams();
  Object.entries(query).forEach(([k, v]) => {
    if (v === undefined || v === null || v === "") return;
    if (Array.isArray(v)) v.forEach(x => qs.append(k, x));
    else qs.set(k, v);
  });

  // Ưu tiên ES
  try {
    const url = `${API_BASE}/api/search/products?${qs.toString()}`;
    const res = await fetch(url, { credentials: "include", signal });
    if (!res.ok) throw new Error("ES search failed");
    return await res.json(); // {items, total, aggs?}
  } catch {
    // fallback sang /api/products
    return httpGet(`/api/products?${qs.toString()}`, { signal });
  }
}

export async function getProductDetail(idOrSlug, signal) {
  // bạn có thể map slug->id ở server; FE cứ gọi thẳng endpoint này
  return httpGet(`/api/products/${idOrSlug}`, { signal });
}

export async function getProductReviews(productId, page = 1, limit = 10, signal) {
  return httpGet(`/api/products/${productId}/reviews?page=${page}&limit=${limit}`, { signal });
}

export async function postProductReview(productId, payload, signal) {
  // { rating: 1..5, comment: string }
  const res = await fetch(`${API_BASE}/api/products/${productId}/reviews`, {
    method: "POST",
    credentials: "include",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
    signal,
  });
  if (!res.ok) throw new Error((await res.text()) || "Failed to review");
  return res.json();
}

export async function postProductComment(productId, payload, signal) {
  // { comment: string, displayName?: string }
  const res = await fetch(`${API_BASE}/api/products/${productId}/comments`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
    signal,
  });
  if (!res.ok) throw new Error((await res.text()) || "Failed to comment");
  return res.json();
}

export async function checkSession(signal) {
  // dùng hàm check session sẵn server: /api/auth/check-session
  try {
    const r = await fetch(`${API_BASE}/api/auth/check-session`, {
      credentials: "include", signal
    });
    return await r.json(); // {isAuthenticated, user}
  } catch { return { isAuthenticated: false, user: null }; }
}
