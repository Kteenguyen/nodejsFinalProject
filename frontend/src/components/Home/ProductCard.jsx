// src/components/Home/ProductCard.jsx
import React, { useState } from "react";
import { Link } from "react-router-dom";
import { ProductController } from "../../controllers/productController";
import { FaCartPlus } from "react-icons/fa";
import { useCart } from "../../context/CartContext";
import { toast } from "react-toastify";
import { motion } from "framer-motion";

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0 },
};

export default function ProductCard({ product }) {
  const { addItem } = useCart();
  const [busy, setBusy] = useState(false);

  const p = product ?? {}; // dùng object an toàn, không return sớm

  const detailId = p.productId || p._id || p.id || "";
  // Lấy hình ảnh: ưu tiên images array, nếu không thì dùng image field, cuối cùng dùng placeholder
  const firstImg = Array.isArray(p?.images) && p.images.length > 0 ? p.images[0] : p?.image;
  const imageUrl = ProductController.getImageUrl(firstImg);
  
  console.log('🖼️ ProductCard received product:', {
    productName: p.productName,
    images: p.images,
    firstImg,
    imageUrl,
    allKeys: Object.keys(p)
  });

  // Chọn biến thể bán được; nếu không có variants -> dùng price chung
  const pickSellableVariant = (obj) => {
    const vs = Array.isArray(obj?.variants) ? obj.variants : [];
    const v =
      vs.find((x) => (x?.stock ?? 1) > 0) ||
      vs[0];

    if (v) {
      return {
        variantId: v.variantId || v._id || "default",
        name: v.name || v.variantName || "Mặc định",
        price: Number(v.price) || 0,
        stock: Number(v.stock ?? 99),
      };
    }
    if (obj?.price != null) {
      return {
        variantId: "default",
        name: "Mặc định",
        price: Number(obj.price) || 0,
        stock: Number(obj.stock ?? 99),
      };
    }
    return null;
  };

  const sellableOnList = !!pickSellableVariant(p);

  const handleAddToCart = async (e) => {
    e.preventDefault();
    e.stopPropagation();

    try {
      setBusy(true);

      // nếu thiếu _id hoặc chưa chọn được variant từ list -> lấy chi tiết
      let full = p;
      if (!p?._id || !sellableOnList) {
        const j = await getProductById(detailId);
        full = j?.data || j?.product || j || p;
      }

      const v = pickSellableVariant(full);
      if (!v) {
        toast.error("Sản phẩm này tạm thời hết hàng.");
        return;
      }

      const mongoId = full?._id;
      if (!mongoId) {
        toast.error("Không thể thêm vào giỏ: thiếu mã sản phẩm.");
        return;
      }

      await addItem({
        productId: mongoId,
        productStringId: detailId,
        productName: full.productName || full.name || "Sản phẩm",
        image: imageUrl,
        variantId: v.variantId,
        variantName: v.name,
        price: v.price,
        stock: v.stock,
        quantity: 1,
      });

      toast.success("Đã thêm vào giỏ!");
    } catch (err) {
      toast.error(err?.message || "Không thể thêm vào giỏ hàng.");
    } finally {
      setBusy(false);
    }
  };

  // Giá hiển thị
  const minPrice = Number(p.lowestPrice ?? p.minPrice ?? p.price ?? 0);

  // Nếu không có id để dẫn link thì ẩn card
  if (!detailId) return null;

  return (
    <motion.div variants={itemVariants}>
      <div className="bg-white rounded-xl shadow-xl overflow-hidden transform transition duration-500 hover:scale-105">
        <Link to={`/products/${detailId}`} className="block relative h-40 overflow-hidden">
          <img src={imageUrl} alt={product.name}
            className="w-full h-full object-contain transition-transform duration-300"
            loading="lazy"
          />
        </Link>

        <div className="p-6">
          <Link
            to={`/products/${detailId}`}
            className="text-lg font-semibold text-gray-800 line-clamp-2 hover:text-indigo-600 transition-colors"
            title={p?.productName}
          >
            {p?.productName || p?.name || "Sản phẩm không tên"}
          </Link>

          {p?.brand && <p className="text-sm text-gray-500 mt-0.5">{p.brand}</p>}

          <div className="flex justify-between items-center mt-2">
            <p className="text-lg font-bold text-red-600">
              {minPrice.toLocaleString("vi-VN")} ₫
            </p>

            <button
              onClick={handleAddToCart}
              disabled={busy}
              className={`p-2 rounded-full shadow-md transition-all duration-300
                         ${busy ? "bg-gray-300 cursor-not-allowed" : "bg-indigo-600 hover:bg-indigo-700 text-white"}`}
              aria-label="Thêm vào giỏ hàng"
              title="Thêm vào giỏ hàng"
            >
              <FaCartPlus className="h-5 w-5" />
            </button>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
