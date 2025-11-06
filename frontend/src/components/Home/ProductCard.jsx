// src/components/ProductCard.jsx
import React from "react";
import { Link } from "react-router-dom";

const BASE_URL = "http://localhost:3001";

function getImageUrl(src) {
  if (!src) return "/images/placeholder.png";
  if (/^https?:\/\//i.test(src)) return src;             // đã là URL tuyệt đối
  // nối host nếu là đường dẫn tương đối (/uploads/...)
  return `${BASE_URL}${src.startsWith("/") ? "" : "/"}${src}`;
}

function getMinPrice(product) {
  // ưu tiên minPrice do backend aggregate tính sẵn
  if (typeof product?.minPrice === "number") return product.minPrice;

  const prices = (product?.variants || [])
    .map(v => Number(v?.price))
    .filter(n => Number.isFinite(n));

  return prices.length ? Math.min(...prices) : 0;
}

const ProductCard = ({ product }) => {
  const firstImg = product?.images?.[0];
  const imageUrl = getImageUrl(firstImg);
  const minPrice = getMinPrice(product);

  // id để đi tới trang chi tiết: ưu tiên productId (custom), fallback _id (Mongo)
  const detailId = product?.productId || product?._id || "";

  return (
    <div className="border rounded-lg p-4 shadow hover:shadow-lg transition">
      <Link to={`/products/${detailId}`} className="block">
        <img
          src={imageUrl}
          alt={product?.productName || "Product"}
          className="w-full h-40 object-cover rounded"
          loading="lazy"
        />
      </Link>

      <div className="mt-2">
        <Link
          to={`/products/${detailId}`}
          className="text-lg font-semibold line-clamp-2 hover:underline"
          title={product?.productName}
        >
          {product?.productName || "No name"}
        </Link>

        {product?.brand && (
          <p className="text-sm text-gray-500 mt-0.5">{product.brand}</p>
        )}

        <p className="text-red-500 font-bold mt-1">
          {minPrice.toLocaleString()} ₫
        </p>
      </div>

      <div className="mt-3">
        <Link
          to={`/products/${detailId}`}
          className="inline-flex items-center justify-center px-3 py-2 rounded bg-black text-white text-sm w-full"
        >
          Xem chi tiết
        </Link>
      </div>
    </div>
  );
};

export default ProductCard;
