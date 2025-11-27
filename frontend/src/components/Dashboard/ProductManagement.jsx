// src/components/Dashboard/ProductManagement.jsx
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { ProductController } from '../../controllers/productController';
import { toast } from "react-toastify";

const API_BASE = "https://localhost:3001/api";

const fmtVND = (n) =>
  (Number.isFinite(Number(n)) ? Number(n) : 0).toLocaleString("vi-VN") + " đ";

export default function ProductManagement() {
  const [search, setSearch] = useState("");
  const [sort, setSort] = useState("newest");
  const [page, setPage] = useState(1);
  const [limit] = useState(10);
  const [loading, setLoading] = useState(false);
  const [rows, setRows] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    const ctrl = new AbortController();
    setLoading(true);

    ProductController.getProducts({ page, limit, search, sort, admin: true }, ctrl.signal)
      .then((resData) => {
        // hỗ trợ nhiều kiểu shape trả về từ BE
        const raw =
          resData?.products ||
          resData?.items ||
          resData?.data ||
          resData ||
          [];

        const arr = Array.isArray(raw) ? raw : [];

        const mapped = arr.map((p) => ({
          id: p.productId || p._id,
          name: p.productName || p.name || "(Không tên)",

          // --- THÊM DÒNG NÀY ---
          // Lấy tên danh mục từ object category
          category: p.category?.categoryName || p.category?.name || "—",
          // ---------------------

          brand: p.brand || "—",
          lowestPrice: p.lowestPrice ?? p.minPrice ?? 0,
          image: (Array.isArray(p.images) && p.images[0]) || p.image || "/img/no_image.png",
        }));
        setRows(mapped);
      })
      .catch((err) => {
        if (err?.aborted) return;
        console.error("LOAD PRODUCTS ERROR", err);
        toast.error(
          err?.message || "Không tải được danh sách sản phẩm (admin)"
        );
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
        <button
          className="px-4 py-2 rounded bg-blue-600 text-white"
          onClick={() => navigate("/admin/products/new")}
        >
          + Thêm sản phẩm
        </button>
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
              <th className="text-left px-4 py-3">Danh mục</th>
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
                    <img src={r.image} alt={r.name} className="w-12 h-12 object-cover rounded" />
                  </td>
                  <td className="px-4 py-3 font-medium">{r.name}</td>
                  <td className="px-4 py-3 text-gray-600">{r.category}</td>
                  <td className="px-4 py-3">{r.brand}</td>
                  <td className="px-4 py-3">{fmtVND(r.lowestPrice)}</td>
                  <td className="px-4 py-3 space-x-2">
                    <button
                      className="px-3 py-1.5 rounded border"
                      onClick={() =>
                        navigate(
                          `/admin/products/${encodeURIComponent(r.id)}/edit`
                        )
                      }
                    >
                      Sửa
                    </button>
                    <button
                      className="px-3 py-1.5 rounded border border-red-500 text-red-600"
                      onClick={async () => {
                        if (
                          !window.confirm(
                            "Bạn có chắc muốn xóa sản phẩm này?"
                          )
                        )
                          return;
                        try {
                          await axios.delete(
                            `${API_BASE}/products/${encodeURIComponent(r.id)}`,
                            { withCredentials: true }
                          );
                          toast.success("Xóa sản phẩm thành công");
                          setRows((prev) =>
                            prev.filter((x) => x.id !== r.id)
                          );
                        } catch (err) {
                          console.error("DELETE ERROR", err.response || err);
                          const msg =
                            err.response?.data?.message ||
                            err.response?.statusText ||
                            err.message ||
                            "Xóa sản phẩm thất bại";
                          toast.error(msg);
                        }
                      }}
                    >
                      Xóa
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
