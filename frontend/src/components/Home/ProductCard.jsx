// src/components/Home/ProductCard.jsx
import React, { useState } from "react";
import { Link } from "react-router-dom";
import { ProductController } from "../../controllers/productController";
import { FaCartPlus } from "react-icons/fa";
import { useCart } from "../../context/CartContext";
import { toast } from "react-toastify";
import { motion } from "framer-motion";
import { BACKEND_URL } from "../../services/api";

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0 },
};

export default function ProductCard({ product, viewMode = "grid" }) {
  const { addItem } = useCart();
  const [busy, setBusy] = useState(false);

  const p = product ?? {};
  const isList = viewMode === "list";

  // Id dùng cho route /products/:id
  const detailId = p.productId || p._id || p.id || "";

  // ========== 1. Tổng tồn kho (ưu tiên dùng totalStock từ backend) ==========
  const totalStock = (() => {
    if (typeof p.totalStock === "number") {
      return p.totalStock;
    }

    if (Array.isArray(p.variants) && p.variants.length > 0) {
      return p.variants.reduce(
        (sum, v) => sum + (Number(v.stock) || 0),
        0
      );
    }

    if (p.stock != null) {
      return Number(p.stock) || 0;
    }

    return 0;
  })();

  const isOutOfStock = totalStock <= 0;

  // ========== 2. Ảnh hiển thị ==========
  const imageUrl = (() => {
    // Ưu tiên: images array > image string > thumbnail > mainImage > placeholder
    // Backend trả về images array từ CDN TGDD
    if (Array.isArray(p.images) && p.images.length > 0 && p.images[0]) {
      const imgPath = p.images[0];
      console.log(`🖼️ [${p.productName}] Using images[0]:`, imgPath);
      // Nếu đường dẫn bắt đầu bằng /images thì thêm BACKEND_URL (local images)
      const url = imgPath.startsWith('/images') ? `${BACKEND_URL}${imgPath}` : imgPath;
      console.log(`📍 Final URL:`, url);
      return url;
    }
    
    // Fallback: single image field
    if (p.image && typeof p.image === 'string' && p.image.trim()) {
      console.log(`🖼️ [${p.productName}] Using p.image`);
      const url = p.image.startsWith('/images') ? `${BACKEND_URL}${p.image}` : p.image;
      return url;
    }
    
    if (p.thumbnail) {
      return p.thumbnail.startsWith('/images') ? `${BACKEND_URL}${p.thumbnail}` : p.thumbnail;
    }
    if (p.mainImage) {
      return p.mainImage.startsWith('/images') ? `${BACKEND_URL}${p.mainImage}` : p.mainImage;
    }
    
    // Fallback to placeholder
    console.log(`⚠️ [${p.productName}] No image found, using placeholder`);
    return "/img/placeholder.png";
  })();

  // ========== 3. Chọn variant để bán ==========
  const pickSellableVariant = (obj) => {
    if (!obj) return null;

    if (Array.isArray(obj.variants) && obj.variants.length > 0) {
      // ưu tiên variant còn stock
      const withStock = obj.variants.filter(
        (v) => Number(v.stock ?? 0) > 0
      );
      const v = withStock[0] || obj.variants[0];

      if (v) {
        return {
          variantId: v.variantId || v._id || "default",
          name: v.name || v.variantName || "Mặc định",
          price: Number(v.price) || 0,
          stock: Number(v.stock ?? 0),
        };
      }
    }

    // Fallback cho sản phẩm không có biến thể
    if (obj?.price != null) {
      return {
        variantId: "default",
        name: "Mặc định",
        price: Number(obj.price) || 0,
        stock: Number(obj.stock ?? 0),
      };
    }

    return null;
  };

  // ========== 4. Thêm vào giỏ ==========
  const handleAddToCart = async (e) => {
    e.preventDefault();
    e.stopPropagation();

    if (isOutOfStock) {
      toast.info("Sản phẩm này tạm thời hết hàng.");
      return;
    }

    try {
      setBusy(true);

      // Backend đã gửi đủ thông tin: _id, variants, totalStock
      const mongoId = p._id;
      if (!mongoId) {
        toast.error("Lỗi dữ liệu sản phẩm (thiếu _id).");
        return;
      }

      const v = pickSellableVariant(p);

      if (!v || v.stock <= 0) {
        toast.error("Phiên bản này đã hết hàng.");
        return;
      }

      await addItem({
        productId: mongoId,
        productStringId: detailId,
        productName: p.productName || p.name || "Sản phẩm",
        image: imageUrl,
        variantId: v.variantId,
        variantName: v.name,
        price: v.price,
        stock: v.stock,
        quantity: 1,
      });

      toast.success("Đã thêm vào giỏ!");
    } catch (err) {
      const msg =
        err?.response?.data?.message ||
        err.message ||
        "Lỗi thêm giỏ hàng";

      if (msg.toLowerCase().includes("tồn kho")) {
        toast.warning("Sản phẩm không đủ số lượng tồn kho.");
      } else {
        toast.error(msg);
      }
    } finally {
      setBusy(false);
    }
  };

  // ========== 5. Giá hiển thị ==========
  const minPrice = Number(p.lowestPrice ?? p.minPrice ?? p.price ?? 0);

  // Nếu không có id thì không render (tránh crash)
  if (!detailId) return null;

  // ========== 6. JSX ==========
  return (
    <motion.div variants={itemVariants} className="h-full">
      <div
        className={`
          group bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden 
          transition-all duration-300 hover:shadow-xl hover:border-indigo-100
          ${isList ? "flex flex-row items-center p-4 gap-6" : "flex flex-col h-full"}
          ${isOutOfStock ? "opacity-80" : ""} 
        `}
      >
        {/* Hình ảnh */}
        <Link
          to={`/products/${detailId}`}
          className={`
            block relative overflow-hidden flex-shrink-0
            ${isList ? "w-48 h-48 rounded-lg bg-gray-50" : "w-full h-48"}
          `}
        >
          <img
            src={imageUrl}
            alt={p.productName}
            className={`
              w-full h-full object-contain mix-blend-multiply p-4 transition-transform duration-500 
              ${!isOutOfStock && "group-hover:scale-110"}
              ${isOutOfStock ? "grayscale" : ""}
            `}
            loading="lazy"
          />

          {isOutOfStock && (
            <div className="absolute inset-0 bg-black/10 flex items-center justify-center z-10">
              <span className="bg-gray-800 text-white text-xs font-bold px-3 py-1 rounded shadow-md uppercase tracking-wider">
                Hết hàng
              </span>
            </div>
          )}
        </Link>

        {/* Nội dung */}
        <div
          className={`flex flex-col flex-1 ${
            isList ? "justify-between h-full" : "p-4"
          }`}
        >
          <div>
            {p?.brand && (
              <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1">
                {p.brand}
              </p>
            )}

            <Link
              to={`/products/${detailId}`}
              className={`
                block font-bold text-gray-800 hover:text-indigo-600 transition-colors
                ${isList ? "text-xl mb-2" : "text-base mb-2 line-clamp-2 min-h-[3rem]"}
              `}
              title={p?.productName}
            >
              {p?.productName || p?.name || "Sản phẩm không tên"}
            </Link>

            {isList && (
              <p className="text-sm text-gray-500 line-clamp-2 mb-4 pr-4">
                {p.productDescription ||
                  p.description ||
                  "Mô tả đang cập nhật..."}
              </p>
            )}
          </div>

          <div
            className={`flex items-center justify-between ${
              isList ? "mt-0" : "mt-4"
            }`}
          >
            <div className="flex flex-col">
              <span className="text-xs text-gray-400">Giá chỉ từ</span>
              <span
                className={`text-lg font-bold ${
                  isOutOfStock ? "text-gray-500" : "text-red-600"
                }`}
              >
                {minPrice.toLocaleString("vi-VN")} ₫
              </span>
            </div>

            {/* Nút mua */}
            <button
              onClick={handleAddToCart}
              disabled={busy || isOutOfStock}
              className={`
                flex items-center gap-2 rounded-full shadow-md transition-all duration-300 font-medium
                ${isList ? "px-6 py-2" : "p-3"}
                ${
                  isOutOfStock
                    ? "bg-gray-200 text-gray-500 cursor-not-allowed shadow-none"
                    : "bg-indigo-50 text-indigo-600 hover:bg-indigo-600 hover:text-white"
                }
              `}
              title={isOutOfStock ? "Hết hàng" : "Thêm vào giỏ hàng"}
            >
              {isOutOfStock ? (
                <span className="text-xs font-bold px-1">HẾT</span>
              ) : (
                <>
                  <FaCartPlus className="h-5 w-5" />
                  {isList && <span>Thêm giỏ hàng</span>}
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
