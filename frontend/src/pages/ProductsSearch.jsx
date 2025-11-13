import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import FilterBar from "../components/products/FilterBar";
import SortBar from "../components/products/SortBar";
import { listProducts } from "../services/productApi";
import { API_BASE } from "../services/https";
import { currency } from "../utils/format";

function ProductCard({ p }) {
  const name = p.name || p.productName || "(Không tên)";
  const price = p.lowestPrice ?? p.minPrice ?? p.price ?? 0;
  const img = (Array.isArray(p.images) && p.images[0]) || "/img/placeholder.png";
  return (
    <div className="bg-white rounded-lg shadow p-3">
      <img src={img} alt={name} className="w-full aspect-square object-cover rounded" />
      <div className="mt-2 font-semibold line-clamp-2">{name}</div>
      <div className="text-indigo-600">{currency(price)}</div>
    </div>
  );
}

export default function ProductsSearch() {
  const [sp] = useSearchParams();
  const keyword = sp.get("query") || sp.get("q") || "";

  const [products, setProducts] = useState([]);
  const [total, setTotal]       = useState(0);

  const [brands, setBrands]         = useState([]);
  const [categories, setCategories] = useState([]);

  const [filters, setFilters] = useState({
    brand: [], minPrice: "", maxPrice: "", categoryId: "", minRating: 0, inStock: false, isNew: false, bestSeller: false
  });
  const [sort, setSort] = useState("newest");

  const [page, setPage] = useState(1);
  const limit = 12;

  useEffect(() => {
    fetch(`${API_BASE}/api/products/brands`, { credentials: "include" })
      .then(r=>r.json()).then(j=>setBrands(j?.brands || []))
      .catch(()=>setBrands([]));

    fetch(`${API_BASE}/api/products/categories`, { credentials: "include" })
      .then(r=>r.json()).then(j=>setCategories(j?.categories || []))
      .catch(()=>setCategories([]));
  }, []);

  useEffect(() => { setPage(1); }, [keyword]);

  async function load() {
    const params = {
      page, limit, sort,
      keyword: keyword || undefined,
      categoryId: filters.categoryId || undefined,
      brand: (filters.brand || []).join(",") || undefined,
      minPrice: filters.minPrice || undefined,
      maxPrice: filters.maxPrice || undefined,
      minRating: filters.minRating || undefined,
      inStock: filters.inStock ? 'true' : undefined,
      isNew: filters.isNew ? 'true' : undefined,
      bestSeller: filters.bestSeller ? 'true' : undefined,
    };
    const j = await listProducts(params);
    const items = j?.products || j?.data || j?.items || [];
    setProducts(items);
    setTotal(j?.totalProducts || j?.total || items.length);
  }

  useEffect(() => {
    load().catch(console.error);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, sort, keyword, JSON.stringify(filters)]);

  const totalPages = Math.max(Math.ceil(total / limit), 1);

  return (
    <div className="container mx-auto p-4 md:p-6">
      <h1 className="text-2xl font-bold mb-3">Kết quả tìm kiếm {keyword ? `cho “${keyword}”` : ""}</h1>

      <FilterBar
        brands={brands}
        categories={categories}
        initial={filters}
        onApply={(f)=>{ setPage(1); setFilters(f); }}
        onReset={()=>{ setPage(1); setFilters({ brand: [], minPrice: "", maxPrice: "", categoryId: "", minRating: 0, inStock:false, isNew:false, bestSeller:false }); }}
      />

      <SortBar value={sort} onChange={(v)=>{ setPage(1); setSort(v); }} />

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {products.map((p) => (
          <ProductCard key={p._id || p.productId || p.code} p={p} />
        ))}
      </div>

      <div className="flex items-center justify-center gap-2 mt-6">
        <button className="px-3 py-1 rounded border bg-white disabled:opacity-50"
                onClick={()=>setPage(p=>Math.max(1, p-1))} disabled={page<=1}>Trang trước</button>
        <div className="text-sm text-gray-600">Trang {page}/{totalPages}</div>
        <button className="px-3 py-1 rounded border bg-white disabled:opacity-50"
                onClick={()=>setPage(p=>Math.min(totalPages, p+1))} disabled={page>=totalPages}>Trang sau</button>
      </div>
    </div>
  );
}
