// frontend/src/services/productApi.js
import { httpGet } from "./https";

// Lấy danh sách sản phẩm cho trang Admin Products
export async function getProductsAdmin({ page = 1, limit = 10, search = "", sort = "newest" } = {}, signal) {
  const qs = new URLSearchParams(
    Object.fromEntries(
      Object.entries({
        page,
        limit,
        sort,              // newest | oldest | price_asc | price_desc | name_asc | name_desc
        keyword: search,   // trùng BE
      }).filter(([, v]) => v !== undefined && v !== null && v !== "")
    )
  ).toString();

  // PUBLIC endpoint — cookie vẫn được gửi (httpOnly) nhờ credentials: 'include' trong https.js
  return httpGet(`/api/products?${qs}`, { signal });
}
