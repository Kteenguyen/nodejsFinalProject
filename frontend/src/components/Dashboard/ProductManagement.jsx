// src/components/Dashboard/ProductManagement.jsx
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ProductController } from '../../controllers/productController';
import { toast } from "react-toastify";
import api, { getImageUrl } from '../../services/api';

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

        const mapped = arr.map((p) => {
          // 1. Tính tổng tồn kho để xác định trạng thái Hết hàng
          // SỬA: Ưu tiên lấy totalStock từ API nếu có, nếu không mới tính từ variants
          let calculatedStock = 0;

          if (p.totalStock !== undefined && p.totalStock !== null) {
            // Trường hợp 1: API danh sách đã tính sẵn totalStock
            calculatedStock = Number(p.totalStock);
          } else if (Array.isArray(p.variants) && p.variants.length > 0) {
            // Trường hợp 2: Có variants (thường là trang chi tiết), tự cộng dồn
            calculatedStock = p.variants.reduce((sum, v) => sum + (Number(v.stock) || 0), 0);
          } else {
            // Trường hợp 3: Fallback các trường khác
            calculatedStock = Number(p.stock) || Number(p.quantity) || 0;
          }

          const isOutOfStock = calculatedStock <= 0;

          return {
            id: p.productId || p._id,
            name: p.productName || p.name || "(Không tên)",
            category: p.category?.categoryName || p.category?.name || "—",
            brand: p.brand || "—",
            lowestPrice: p.lowestPrice ?? p.minPrice ?? 0,
            image: getImageUrl((Array.isArray(p.images) && p.images[0]) || p.image || "/img/no_image.png"),

            // Cập nhật giá trị cuối cùng vào đây
            totalStock: p.totalStock || 0,
          };
        });
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
      <div className="flex items-center gap-3 mb-4">
        <button
          onClick={() => navigate("/admin/management")}
          className="px-3 py-2 rounded bg-gray-300 text-gray-800 hover:bg-gray-400 transition flex items-center gap-2"
          title="Quay lại Management Hub"
        >
          ← Quay lại
        </button>
        <h2 className="text-xl font-semibold">Product Management</h2>
      </div>

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
              <th className="px-4 py-3 text-center">Tồn kho</th>
              <th className="text-left px-4 py-3">Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td className="px-4 py-4 text-gray-500" colSpan={7}>
                  Đang tải…
                </td>
              </tr>
            ) : rows.length === 0 ? (
              <tr>
                <td className="px-4 py-4 text-gray-500" colSpan={7}>
                  Không có sản phẩm
                </td>
              </tr>
            ) : (
              rows.map((r) => {
                // 2. XỬ LÝ MÀU SẮC CHO TỒN KHO
                const stockColor = r.totalStock > 0 ? "text-green-600 bg-green-50" : "text-red-600 bg-red-50";

                return (
                  <tr key={r.id} className="border-t">
                    <td className="px-4 py-3">
                      <img src={r.image} alt={r.name} className="w-12 h-12 object-cover rounded" />
                    </td>
                    <td className="px-4 py-3 font-medium">{r.name}</td>
                    <td className="px-4 py-3 text-gray-600">{r.category}</td>
                    <td className="px-4 py-3">{r.brand}</td>
                    <td className="px-4 py-3">{fmtVND(r.lowestPrice)}</td>

                    {/* 👇 CỘT HIỂN THỊ TỒN KHO MỚI 👇 */}
                    <td className="px-4 py-3 text-center">
                      <span className={`px-2 py-1 rounded-full text-xs font-bold ${stockColor}`}>
                        {r.totalStock > 0 ? r.totalStock : "Hết hàng"}
                      </span>
                    </td>
                    {/* -------------------------------- */}

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
                            await api.delete(
                              `/products/${encodeURIComponent(r.id)}`
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
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}