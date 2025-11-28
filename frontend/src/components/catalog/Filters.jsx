// frontend/src/components/catalog/Filters.jsx
import { useEffect, useState } from "react";

const RatingStar = ({ active }) => (
  <svg viewBox="0 0 20 20" className={`w-5 h-5 ${active ? "fill-yellow-400" : "fill-gray-300"}`}>
    <path d="M10 15l-5.878 3.09L5.09 11.545.18 7.41l6.092-.887L10 1l2.728 5.523 6.092.887-4.909 4.136 1.969 6.545z" />
  </svg>
);

export default function Filters({
  brands = [],
  categories = [],
  initial = { brand: [], minPrice: "", maxPrice: "", categoryId: "", minRating: 0, inStock: false, isNew: false, bestSeller: false },
  onApply,
  onReset,
}) {
  const [brand, setBrand] = useState(initial.brand || []);
  const [minPrice, setMinPrice] = useState(initial.minPrice || "");
  const [maxPrice, setMaxPrice] = useState(initial.maxPrice || "");
  const [categoryId, setCategoryId] = useState(initial.categoryId || "");
  const [minRating, setMinRating] = useState(initial.minRating || 0);
  const [inStock, setInStock] = useState(initial.inStock || false);
  const [isNew, setIsNew] = useState(initial.isNew || false);
  const [bestSeller, setBestSeller] = useState(initial.bestSeller || false);

  useEffect(() => {
    setBrand(initial.brand || []);
    setMinPrice(initial.minPrice || "");
    setMaxPrice(initial.maxPrice || "");
    setCategoryId(initial.categoryId || "");
    setMinRating(initial.minRating || 0);
    setInStock(!!initial.inStock);
    setIsNew(!!initial.isNew);
    setBestSeller(!!initial.bestSeller);
  }, [initial]);

  const toggleBrand = (b) => {
    setBrand((prev) => prev.includes(b) ? prev.filter(x => x !== b) : [...prev, b]);
  };

  const apply = () => {
    onApply?.({
      brand,
      minPrice: minPrice === "" ? "" : Number(minPrice),
      maxPrice: maxPrice === "" ? "" : Number(maxPrice),
      categoryId,
      minRating: Number(minRating) || 0,
      inStock,
      isNew,
      bestSeller
    });
  };

  const reset = () => {
    setBrand([]);
    setMinPrice("");
    setMaxPrice("");
    setCategoryId("");
    setMinRating(0);
    setInStock(false);
    setIsNew(false);
    setBestSeller(false);
    onReset?.();
  };

  return (
    <div className="bg-white p-4 rounded-lg shadow mb-4">
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
        {/* BRAND (bắt buộc) */}
        <div>
          <div className="font-semibold mb-2">Thương hiệu</div>
          <div className="flex flex-wrap gap-2">
            {brands.map((b) => (
              <label
                key={b}
                className={`px-3 py-1 rounded-full border cursor-pointer text-sm
                  ${brand.includes(b) ? "bg-black text-white border-black" : "bg-gray-100 border-gray-300"}`}
              >
                <input type="checkbox" className="hidden" checked={brand.includes(b)} onChange={() => toggleBrand(b)} />
                {b}
              </label>
            ))}
            {brands.length === 0 && <div className="text-gray-500 text-sm">Không có dữ liệu brand</div>}
          </div>
        </div>

        {/* PRICE (bắt buộc) */}
        <div>
          <div className="font-semibold mb-2">Khoảng giá (₫)</div>
          <div className="flex items-center gap-2">
            <input type="number" min={0} value={minPrice} onChange={(e) => setMinPrice(e.target.value)} placeholder="Từ"
                   className="w-full border rounded px-3 py-2" />
            <span className="text-gray-400">—</span>
            <input type="number" min={0} value={maxPrice} onChange={(e) => setMaxPrice(e.target.value)} placeholder="Đến"
                   className="w-full border rounded px-3 py-2" />
          </div>
        </div>

        {/* CATEGORY (tiêu chí 3) */}
        <div>
          <div className="font-semibold mb-2">Danh mục</div>
          <select value={categoryId} onChange={(e) => setCategoryId(e.target.value)} className="w-full border rounded px-3 py-2 bg-white">
            <option value="">Tất cả</option>
            {categories.map((c) => (<option key={c.id} value={c.id}>{c.name || c.id}</option>))}
          </select>
        </div>

        {/* RATING (tiêu chí 4) */}
        <div>
          <div className="font-semibold mb-2">Đánh giá tối thiểu</div>
          <div className="flex items-center gap-2">
            {[0,1,2,3,4,5].map((r) => (
              <button key={r}
                      onClick={() => setMinRating(r)}
                      className={`px-2 py-1 rounded border ${minRating===r ? "bg-yellow-50 border-yellow-400" : "bg-white"}`}>
                <div className="flex items-center gap-1">
                  <span className="text-xs w-3 text-right">{r}</span>
                  <div className="flex">{[...Array(5)].map((_,i)=><RatingStar key={i} active={i<r} />)}</div>
                </div>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Flags thêm (tuỳ chọn) */}
      <div className="flex flex-wrap items-center gap-4 mt-4">
        <label className="inline-flex items-center gap-2">
          <input type="checkbox" checked={inStock} onChange={(e)=>setInStock(e.target.checked)} />
          <span>Còn hàng</span>
        </label>
        <label className="inline-flex items-center gap-2">
          <input type="checkbox" checked={isNew} onChange={(e)=>setIsNew(e.target.checked)} />
          <span>Hàng mới</span>
        </label>
        <label className="inline-flex items-center gap-2">
          <input type="checkbox" checked={bestSeller} onChange={(e)=>setBestSeller(e.target.checked)} />
          <span>Bán chạy</span>
        </label>

        <div className="ml-auto flex items-center gap-2">
          <button onClick={apply} className="px-4 py-2 rounded bg-black text-white">Áp dụng</button>
          <button onClick={reset} className="px-4 py-2 rounded border bg-gray-50">Xoá lọc</button>
        </div>
      </div>
    </div>
  );
}
