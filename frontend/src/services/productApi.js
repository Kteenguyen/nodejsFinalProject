// src/services/productApi.js
import axios from "axios";
import { API_BASE } from "./https";

// helper build query cho mấy hàm khác (nếu cần)
const toQS = (obj = {}) =>
  new URLSearchParams(
    Object.entries(obj).filter(
      ([, v]) => v !== undefined && v !== null && v !== ""
    )
  ).toString();

// Lấy danh sách sản phẩm cho trang admin
export async function getProductsAdmin(params = {}) {
  const {
    page = 1,
    limit = 10,
    sort = "newest",      // newest | price_asc | price_desc ...
    search = "",
    brand = "",
    category = "",
    productType = "",     // all | new | bestseller | special ...
  } = params;

  try {
    const res = await axios.get(`${API_BASE}/products`, {
      params: {
        page,
        limit,
        sort,
        search: search || undefined,
        brand: brand || undefined,
        category: category || undefined,
        productType: productType || undefined,
        // param admin này backend hiện không dùng, nhưng để cũng không sao
        admin: "true",
      },
      withCredentials: true,
    });

    // BE trả về dạng: { success, items, pagination }
    return res.data;
  } catch (error) {
    console.error("LOAD PRODUCTS ERROR", error);
    throw error;
  }
}

/* ================== CÁC HÀM KHÁC (nếu cần) ================== */

// (Tùy bạn có dùng hay không – mình để sẵn, nhưng đã bỏ bug page/limit & res.ok)
export async function listProducts(params = {}, signal) {
  const res = await axios.get(`${API_BASE}/products`, {
    params,
    withCredentials: true,
    signal,
  });
  return res.data;
}

const jsonOrText = async (res) => {
  const text = await res.text();
  try {
    return JSON.parse(text);
  } catch {
    return { success: false, message: text || res.statusText };
  }
};

const throwIfFail = (j, res) => {
  if (res.ok && j?.success !== false) return j;
  const msg = j?.message || res.statusText || "Lỗi máy chủ";
  throw new Error(msg);
};

// ví dụ: /products/:id
export async function getProductById(productId, signal) {
  const res = await fetch(`${API_BASE}/products/${productId}`, {
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
