// src/components/catalog/Filters.jsx
import React, { useEffect, useState } from "react";
import { getBrands } from "../../services/productApi";

export default function Filters({ value, onChange }) {
  const [brands, setBrands] = useState([]);

  useEffect(() => {
    const ctrl = new AbortController();
    getBrands(ctrl.signal).then(j => {
      const arr = Array.isArray(j?.data) ? j.data : (j?.brands || []);
      setBrands(arr);
    }).catch(()=>{}); 
    return () => ctrl.abort();
  }, []);

  return (
    <div className="flex flex-wrap gap-2 items-end">
      <div>
        <label className="block text-sm text-gray-600">Brand</label>
        <select
          value={value.brand || ""}
          onChange={(e) => onChange({ ...value, brand: e.target.value })}
          className="border rounded px-3 py-2"
        >
          <option value="">Tất cả</option>
          {brands.map((b) => (
            <option key={b} value={b}>{b}</option>
          ))}
        </select>
      </div>

      <div>
        <label className="block text-sm text-gray-600">Giá tối thiểu</label>
        <input
          type="number"
          value={value.min || ""}
          onChange={(e) => onChange({ ...value, min: e.target.value })}
          className="border rounded px-3 py-2 w-36"
        />
      </div>

      <div>
        <label className="block text-sm text-gray-600">Giá tối đa</label>
        <input
          type="number"
          value={value.max || ""}
          onChange={(e) => onChange({ ...value, max: e.target.value })}
          className="border rounded px-3 py-2 w-36"
        />
      </div>

      <div>
        <label className="block text-sm text-gray-600">Đánh giá</label>
        <select
          value={value.rating || ""}
          onChange={(e) => onChange({ ...value, rating: e.target.value })}
          className="border rounded px-3 py-2"
        >
          <option value="">Tất cả</option>
          <option value="4">Từ 4 sao</option>
          <option value="3">Từ 3 sao</option>
          <option value="2">Từ 2 sao</option>
          <option value="1">Từ 1 sao</option>
        </select>
      </div>
    </div>
  );
}
