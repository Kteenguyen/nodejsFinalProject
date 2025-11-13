// src/pages/ProductsPage.jsx
import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import SidebarFilter from "../components/products/filters/SidebarFilter";
import { listProducts, getBrands, getCategories } from "../services/productApi";

function isAbort(err) {
  return err?.name === "AbortError" || /abort/i.test(String(err?.message));
}

export default function ProductsPage() {
  const [searchParams, setSearchParams] = useSearchParams();

  // dữ liệu bộ lọc (nguồn)
  const [brands, setBrands] = useState([]);
  const [categories, setCategories] = useState([]);

  // danh sách SP + meta
  const [items, setItems] = useState([]);
  const [meta, setMeta] = useState({ total: 0, page: 1, pages: 1 });

  // state filter đồng bộ với URL khi mount
  const [filter, setFilter] = useState({
    brand: (searchParams.get("brand") || "").split(",").filter(Boolean),
    minPrice: searchParams.get("minPrice")
      ? Number(searchParams.get("minPrice"))
      : undefined,
    maxPrice: searchParams.get("maxPrice")
      ? Number(searchParams.get("maxPrice"))
      : undefined,
    categoryId: (searchParams.get("categoryId") || "")
      .split(",")
      .filter(Boolean),
    ratingMin: searchParams.get("ratingMin")
      ? Number(searchParams.get("ratingMin"))
      : undefined,
    sortBy: searchParams.get("sortBy") || "newest",
    sortOrder: searchParams.get("sortOrder") || "desc",
    page: Number(searchParams.get("page") || 1),
    limit: Number(searchParams.get("limit") || 12),
  });

  // ---------- Load brands & categories một lần ----------
  useEffect(() => {
    const ctrl = new AbortController();
    (async () => {
      try {
        const [b, c] = await Promise.all([
          getBrands(ctrl.signal),
          getCategories(ctrl.signal), // nếu backend chưa có, xem ghi chú bên dưới
        ]);
        setBrands(b?.data || b?.brands || b || []);
        setCategories(c?.data || c?.categories || c || []);
      } catch (e) {
        if (!isAbort(e)) console.error("Load facets failed:", e);
      }
    })();
    return () => ctrl.abort();
  }, []);

  // ---------- Từ filter -> query string (memo để đỡ build lại) ----------
  const queryParams = useMemo(() => {
    const qp = new URLSearchParams();
    if (filter.brand?.length) qp.set("brand", filter.brand.join(","));
    if (filter.categoryId?.length)
      qp.set("categoryId", filter.categoryId.join(","));
    if (filter.minPrice != null) qp.set("minPrice", filter.minPrice);
    if (filter.maxPrice != null) qp.set("maxPrice", filter.maxPrice);
    if (filter.ratingMin != null) qp.set("ratingMin", filter.ratingMin);
    qp.set("sortBy", filter.sortBy);
    qp.set("sortOrder", filter.sortOrder);
    qp.set("page", String(filter.page));
    qp.set("limit", String(filter.limit));
    return qp;
  }, [filter]);

  // ---------- Đồng bộ URL & fetch danh sách ----------
  useEffect(() => {
    // 1) Cập nhật URL
    setSearchParams(queryParams, { replace: true });

    // 2) Gọi API (bắt AbortError để không đỏ màn hình)
    const ctrl = new AbortController();
    (async () => {
      try {
        const res = await listProducts(
          Object.fromEntries(queryParams),
          ctrl.signal
        );
        setItems(res?.products || res?.data || []);
        setMeta({
          total: res?.totalProducts ?? res?.total ?? 0,
          page: res?.currentPage ?? res?.page ?? 1,
          pages: res?.totalPages ?? res?.pages ?? 1,
        });
      } catch (e) {
        if (!isAbort(e)) console.error("Load products failed:", e);
      }
    })();

    return () => ctrl.abort();
  }, [queryParams, setSearchParams]);

  // (nếu chưa build API min/max từ server) – cấu hình thủ công
  const priceMin = 0;
  const priceMax = 100_000_000;

  return (
    <div className="container mx-auto px-4 py-4 grid grid-cols-1 lg:grid-cols-[18rem_1fr] gap-4">
      <SidebarFilter
        brands={brands}
        categories={categories}
        value={filter}
        onChange={(v) => setFilter((s) => ({ ...s, ...v, page: 1 }))}
        priceMin={priceMin}
        priceMax={priceMax}
      />

      {/* Kết quả */}
      <section>
        <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4">
          {items.map((p) => {
            const name = p.name || p.productName || "(Không tên)";
            const price =
              (p.lowestPrice ?? p.minPrice ?? 0).toLocaleString("vi-VN") + " đ";
            const img = (p.images && p.images[0]) || "/img/placeholder.png";
            return (
              <article key={p._id || p.productId} className="bg-white rounded shadow p-3">
                <img src={img} alt="" className="w-full aspect-square object-cover rounded" />
                <div className="mt-2 font-medium line-clamp-2">{name}</div>
                <div className="text-indigo-600 font-semibold">{price}</div>
              </article>
            );
          })}
        </div>

        {/* phân trang */}
        <div className="mt-6 flex items-center gap-2">
          <button
            disabled={meta.page <= 1}
            onClick={() => setFilter((s) => ({ ...s, page: s.page - 1 }))}
            className="px-3 py-1 rounded border disabled:opacity-50"
          >
            Trước
          </button>
          <div>Trang {meta.page}/{meta.pages}</div>
          <button
            disabled={meta.page >= meta.pages}
            onClick={() => setFilter((s) => ({ ...s, page: s.page + 1 }))}
            className="px-3 py-1 rounded border disabled:opacity-50"
          >
            Sau
          </button>
        </div>
      </section>
    </div>
  );
}
