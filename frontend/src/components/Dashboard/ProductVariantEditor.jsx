// ProductVariantEditor.jsx
import React, { useRef } from "react";

export default function ProductVariantEditor({ variant, onChange }) {
  const fileInputRef = useRef();

  // Xử lý thêm ảnh
  const handleAddImages = (e) => {
    const files = Array.from(e.target.files || []);
    if (!files.length) return;
    // Chỉ lấy đường dẫn tạm (FE), khi submit mới upload thật
    const newImages = files.map(file => URL.createObjectURL(file));
    onChange({
      ...variant,
      images: [...(variant.images || []), ...newImages],
    });
    // Reset input để chọn lại cùng file nếu muốn
    fileInputRef.current.value = "";
  };

  // Xử lý xóa ảnh (theo index)
  const handleRemoveImage = (idx) => {
    const newArr = (variant.images || []).filter((_, i) => i !== idx);
    onChange({ ...variant, images: newArr });
  };

  return (
    <div className="flex flex-col gap-2 mb-2 border p-2 rounded bg-gray-50">
      <div className="flex gap-2 mb-1">
        <input
          className="border rounded px-2 py-1 w-24"
          placeholder="Màu sắc"
          value={variant.color || ""}
          onChange={e => onChange({ ...variant, color: e.target.value })}
        />
        <input
          className="border rounded px-2 py-1 w-20"
          placeholder="ROM"
          value={variant.rom || ""}
          onChange={e => onChange({ ...variant, rom: e.target.value })}
        />
        <input
          className="border rounded px-2 py-1 w-20"
          placeholder="RAM"
          value={variant.ram || ""}
          onChange={e => onChange({ ...variant, ram: e.target.value })}
        />
      </div>
      {/* CRUD ẢNH BIẾN THỂ */}
      <div>
        <div className="flex gap-2 flex-wrap mb-1">
          {(variant.images || []).map((img, idx) => (
            <div key={idx} className="relative group">
              <img
                src={img}
                alt={`variant-img-${idx}`}
                className="w-14 h-14 object-cover rounded border"
              />
              <button
                type="button"
                className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs opacity-80 group-hover:opacity-100"
                onClick={() => handleRemoveImage(idx)}
                title="Xóa ảnh"
              >×</button>
            </div>
          ))}
          <button
            type="button"
            className="w-14 h-14 flex items-center justify-center border-2 border-dashed rounded text-gray-400 hover:border-blue-400 hover:text-blue-600"
            onClick={() => fileInputRef.current && fileInputRef.current.click()}
            title="Thêm ảnh"
          >
            +
          </button>
          <input
            type="file"
            accept="image/*"
            multiple
            ref={fileInputRef}
            style={{ display: "none" }}
            onChange={handleAddImages}
          />
        </div>
        <div className="text-xs text-gray-400">Ảnh riêng cho biến thể (có thể chọn nhiều)</div>
      </div>
    </div>
  );
}
