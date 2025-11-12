import { httpGet } from "./https";

/** Đổi path này nếu backend của bạn khác */
export function getUsers({ page = 1, limit = 10, keyword = "" } = {}) {
  const qs = new URLSearchParams();
  qs.set("page", page);
  qs.set("limit", limit);
  if (keyword) qs.set("keyword", keyword);

  // ví dụ: /api/admin/users?page=1&limit=10&keyword=...
  return httpGet(`/api/admin/users?${qs.toString()}`);
}
