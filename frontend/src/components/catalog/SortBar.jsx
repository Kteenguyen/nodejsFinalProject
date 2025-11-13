// src/components/catalog/SortBar.jsx
import React from "react";

export default function SortBar({ value, onChange }) {
  return (
    <div className="flex items-center gap-2">
      <span className="text-sm text-gray-600">Sắp xếp:</span>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="border rounded px-3 py-2"
      >
        <option value="name_asc">Tên A→Z</option>
        <option value="name_desc">Tên Z→A</option>
        <option value="price_asc">Giá thấp→cao</option>
        <option value="price_desc">Giá cao→thấp</option>
        <option value="newest">Mới nhất</option>
        <option value="oldest">Cũ nhất</option>
      </select>
    </div>
  );
}
