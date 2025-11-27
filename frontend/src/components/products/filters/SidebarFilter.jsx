import { useMemo, useState } from "react";
import PriceRange from "./PriceRange";

export default function SidebarFilter({
  brands = [],
  categories = [],
  value,            // { brand:[], minPrice, maxPrice, categoryId:[], ratingMin }
  onChange,
  priceMin = 0,
  priceMax = 100_000_000,
}) {
  const [showAllBrands, setShowAllBrands] = useState(false);
  const topBrands = useMemo(() => brands.slice(0, 6), [brands]);
  const moreBrands = useMemo(() => brands.slice(6), [brands]);

  console.log('🎨 SidebarFilter rendered:', { brandsCount: brands.length, categoriesCount: categories.length, brands, categories });

  function toggleBrand(b) {
    const s = new Set(value.brand || []);
    s.has(b) ? s.delete(b) : s.add(b);
    onChange({ ...value, brand: Array.from(s) });
  }

  function toggleCategory(id) {
    const s = new Set(value.categoryId || []);
    s.has(id) ? s.delete(id) : s.add(id);
    onChange({ ...value, categoryId: Array.from(s) });
  }

  function setRating(r) {
    onChange({ ...value, ratingMin: r });
  }

  return (
    <aside className="w-full lg:w-64 xl:w-72 bg-white rounded-lg shadow p-4 space-y-6 lg:sticky lg:top-4 h-fit">
      {/* KHOẢNG GIÁ */}
      <section>
        <div className="font-semibold mb-3">Khoảng giá (VND)</div>
        <PriceRange
          min={priceMin}
          max={priceMax}
          valueMin={value.minPrice ?? priceMin}
          valueMax={value.maxPrice ?? priceMax}
          onChange={({ min, max }) =>
            onChange({ ...value, minPrice: min, maxPrice: max })
          }
        />
      </section>

      {/* THƯƠNG HIỆU */}
      <section>
        <div className="font-semibold mb-3">Thương hiệu</div>
        <div className="space-y-2">
          {(showAllBrands ? brands : topBrands).map((b) => (
            <label key={b} className="flex items-center gap-2">
              <input
                type="checkbox"
                className="h-4 w-4"
                checked={(value.brand || []).includes(b)}
                onChange={() => toggleBrand(b)}
              />
              <span className="select-none">{b}</span>
            </label>
          ))}
          {moreBrands.length > 0 && (
            <button
              className="text-indigo-600 text-sm"
              onClick={() => setShowAllBrands((s) => !s)}
            >
              {showAllBrands ? "Thu gọn" : "Xem thêm"}
            </button>
          )}
        </div>
      </section>

      {/* DANH MỤC */}
      <section>
        <div className="font-semibold mb-3">Danh mục</div>
        <div className="space-y-2 max-h-56 overflow-auto pr-1">
          {categories.map((c) => (
            <label key={c.categoryId || c.id} className="flex items-center gap-2">
              <input
                type="checkbox"
                className="h-4 w-4"
                checked={(value.categoryId || []).includes(c.categoryId || c.id)}
                onChange={() => toggleCategory(c.categoryId || c.id)}
              />
              <span className="select-none">{c.categoryName || c.name}</span>
            </label>
          ))}
        </div>
      </section>

      {/* ĐÁNH GIÁ (hiện số, không icon) */}
      <section>
        <div className="font-semibold mb-3">Đánh giá</div>
        <div className="grid grid-cols-3 gap-2">
          {[5, 4, 3, 2, 1].map((n) => (
            <button
              key={n}
              onClick={() => setRating(n)}
              className={`px-2 py-1 rounded border text-sm ${
                value.ratingMin === n
                  ? "border-indigo-600 text-indigo-600"
                  : "border-gray-300 text-gray-700"
              }`}
            >
              {n}+
            </button>
          ))}
        </div>
        {value.ratingMin && (
          <button
            className="mt-2 text-sm text-gray-500 underline"
            onClick={() => setRating(undefined)}
          >
            Xoá đánh giá
          </button>
        )}
      </section>
    </aside>
  );
}
