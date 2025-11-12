// frontend/src/components/Dashboard/ProductManagement.jsx
import React, { useEffect, useMemo, useState } from "react";
import { getProductsAdmin } from "../../services/productApi";

const fmtVND = (n) =>
  (Number.isFinite(Number(n)) ? Number(n) : 0).toLocaleString("vi-VN") + " đ";

export default function ProductManagement() {
  const [search, setSearch] = useState("");
  const [sort, setSort] = useState("newest");
  const [page, setPage] = useState(1);
  const [limit] = useState(10);
  const [loading, setLoading] = useState(false);
  const [rows, setRows] = useState([]);

  useEffect(() => {
    const ctrl = new AbortController();
    setLoading(true);
    getProductsAdmin({ page, limit, search, sort }, ctrl.signal)
      .then((j) => {
        const arr = Array.isArray(j?.products) ? j.products : [];
        const mapped = arr.map((p) => ({
          id: p.productId || p._id,
          // tên: ưu tiên alias `name` rồi tới `productName`
          name: p.name || p.productName || "(Không tên)",
          brand: p.brand || "—",
          // giá: ưu tiên alias `lowestPrice`, nếu không có dùng `minPrice`
          lowestPrice: p.lowestPrice ?? p.minPrice ?? 0,
          // ảnh: lấy ảnh đầu tiên, fallback
          image:
            (Array.isArray(p.images) && p.images[0]) ||
            p.image ||
            "/img/no_image.png",
        }));
        setRows(mapped);
      })
      .catch((e) => {
        console.error(e);
        setRows([]);
      })
      .finally(() => setLoading(false));
    return () => ctrl.abort();
  }, [page, limit, search, sort]);

  return (
    <div className="p-4 md:p-6">
      <h2 className="text-xl font-semibold mb-4">Product Management</h2>

      <div className="flex gap-2 mb-3">
        <input
          className="border rounded px-3 py-2 flex-1"
          placeholder="Tìm theo tên/mã/brand…"
          value={search}
          onChange={(e) => {
            setPage(1);
            setSearch(e.target.value);
          }}
        />
        <select
          className="border rounded px-3 py-2"
          value={sort}
          onChange={(e) => {
            setPage(1);
            setSort(e.target.value);
          }}
        >
          <option value="newest">Mới nhất</option>
          <option value="oldest">Cũ nhất</option>
          <option value="price_asc">Giá tăng dần</option>
          <option value="price_desc">Giá giảm dần</option>
          <option value="name_asc">Tên A→Z</option>
          <option value="name_desc">Tên Z→A</option>
        </select>
      </div>

      <div className="bg-white rounded-lg shadow overflow-x-auto">
        <table className="min-w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="text-left px-4 py-3">Ảnh</th>
              <th className="text-left px-4 py-3">Tên</th>
              <th className="text-left px-4 py-3">Brand</th>
              <th className="text-left px-4 py-3">Giá thấp nhất</th>
              <th className="text-left px-4 py-3">Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td className="px-4 py-4 text-gray-500" colSpan={5}>
                  Đang tải…
                </td>
              </tr>
            ) : rows.length === 0 ? (
              <tr>
                <td className="px-4 py-4 text-gray-500" colSpan={5}>
                  Không có sản phẩm
                </td>
              </tr>
            ) : (
              rows.map((r) => (
                <tr key={r.id} className="border-t">
                  <td className="px-4 py-3">
                    <img
                      src={r.image}
                      alt={r.name}
                      className="w-12 h-12 object-cover rounded"
                    />
                  </td>
                  <td className="px-4 py-3 font-medium">{r.name}</td>
                  <td className="px-4 py-3">{r.brand}</td>
                  <td className="px-4 py-3">{fmtVND(r.lowestPrice)}</td>
                  <td className="px-4 py-3">
                    <button className="px-3 py-1.5 rounded border">
                      Sửa
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
