// src/pages/ProductDetail.jsx
import React, { useEffect, useMemo, useState } from 'react';
// import axios from 'axios'; // 👈 BỎ DÒNG NÀY
import { useParams } from 'react-router-dom'; // 👈 Dùng useParams để lấy productId
import { ProductController } from '../controllers/productController'; // 👈 IMPORT CONTROLLER
import { useCart } from '../context/CartContext'; // 👈 Import CartContext
import { toast } from 'react-toastify'; // 👈 Import Toastify

// 👈 BỎ CÁC BIẾN CŨ (API_BASE, resolveUrl)

export default function ProductDetail() { // 👈 Bỏ prop 'productId'

  const { productId } = useParams(); // 👈 Lấy productId từ URL

  const [p, setP] = useState(null); // p = product
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true); // 👈 Thêm state loading
  const [sel, setSel] = useState('');     // variantId được chọn
  const [qty, setQty] = useState(1);

  const { addItem } = useCart(); // 👈 Lấy hàm addItem từ Context

  // Fetch data
  useEffect(() => {
    if (!productId) return; // Không làm gì nếu không có ID

    const fetchProduct = async () => {
      setLoading(true);
      setError('');
      try {
        // 👈 SỬ DỤNG CONTROLLER (ĐÃ FIX HTTPS)
        const data = await ProductController.getProductById(productId);
        setP(data || null);
        // Tự động chọn biến thể đầu tiên (nếu có)
        const first = data?.variants?.[0]?.variantId;
        if (first) setSel(first);
      } catch (e) {
        setError(e?.response?.data?.message || 'Lỗi tải sản phẩm');
      } finally {
        setLoading(false);
      }
    };

    fetchProduct();
  }, [productId]); // Chạy lại khi productId thay đổi

  // Lấy thông tin biến thể (variant) đang được chọn
  const v = useMemo(() => {
    if (!p || !Array.isArray(p.variants)) return null;
    return p.variants.find(x => String(x.variantId) === String(sel));
  }, [p, sel]);

  // Lấy ảnh chính (ưu tiên ảnh của variant, nếu không thì lấy ảnh đầu tiên)
  const mainImage = useMemo(() => {
    const variantImage = v?.image; // Giả sử variant có trường 'image'
    const firstImage = p?.images?.[0];
    // Dùng ProductController để lấy URL an toàn
    return ProductController.getImageUrl(variantImage || firstImage);
  }, [p, v]);

  // Logic thêm vào giỏ hàng
  const addToCart = () => {
    if (!p || !v) {
      toast.error("Vui lòng chọn một phiên bản.");
      return;
    }

    if (qty > v.stock) {
      toast.error(`Số lượng vượt quá tồn kho (chỉ còn ${v.stock})`);
      return;
    }

    try {
      addItem({
        productId: p.productId,
        productName: p.productName,
        image: mainImage,
        variantId: v.variantId,
        variantName: v.name,
        price: v.price,
        stock: v.stock,
        quantity: qty
      });
      toast.success(`Đã thêm ${qty} x ${p.productName} vào giỏ!`);
    } catch (error) {
      toast.error(error.message || "Không thể thêm vào giỏ hàng.");
    }
  };

  // --- RENDER ---
  if (loading) return <div className="text-center p-10">Đang tải...</div>;
  if (error) return <div className="text-center p-10 text-red-500">{error}</div>;
  if (!p) return <div className="text-center p-10">Không tìm thấy sản phẩm.</div>;

  return (
    <div className="container mx-auto p-4">
      {/* (Code JSX cho trang chi tiết sản phẩm của fen...) */}
      {/* Ví dụ layout cơ bản: */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Cột ảnh */}
        <div>
          <img src={mainImage} alt={p.productName} className="w-full rounded-lg shadow-lg" />
          {/* (Thêm gallery ảnh thumbnail ở đây nếu muốn) */}
        </div>

        {/* Cột thông tin */}
        <div>
          <h1 className="text-3xl font-bold mb-2">{p.productName}</h1>
          <span className="text-lg text-gray-500 mb-4 block">{p.brand}</span>

          {/* Giá (của variant) */}
          <p className="text-4xl font-bold text-red-600 mb-4">
            {v ? `${v.price.toLocaleString()} ₫` : 'Vui lòng chọn phiên bản'}
          </p>

          {/* Chọn Variant */}
          <div className="mb-4">
            <h3 className="text-lg font-semibold mb-2">Chọn phiên bản:</h3>
            <div className="flex flex-wrap gap-2">
              {p.variants.map(variant => (
                <button
                  key={variant.variantId}
                  onClick={() => setSel(variant.variantId)}
                  className={`py-2 px-4 border rounded-lg transition
                                    ${sel === variant.variantId
                      ? 'bg-indigo-600 text-white border-indigo-600'
                      : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-100'}
                                    ${variant.stock <= 0 ? 'opacity-50 line-through' : ''}
                                `}
                  disabled={variant.stock <= 0}
                >
                  {variant.name} {variant.stock <= 0 ? '(Hết hàng)' : `(Còn ${variant.stock})`}
                </button>
              ))}
            </div>
          </div>

          {/* Chọn số lượng */}
          <div className="mb-6">
            <label htmlFor="quantity" className="text-lg font-semibold mb-2 block">Số lượng:</label>
            <input
              type="number"
              id="quantity"
              min="1"
              max={v?.stock || 1}
              value={qty}
              onChange={(e) => setQty(Math.max(1, parseInt(e.target.value)))}
              className="w-20 p-2 border border-gray-300 rounded-lg text-center"
              disabled={!v || v.stock <= 0}
            />
          </div>

          {/* Nút Thêm vào giỏ */}
          <button
            className="w-full px-6 py-3 rounded bg-indigo-600 text-white font-bold text-lg disabled:opacity-50 hover:bg-indigo-700 transition"
            disabled={!v || v.stock <= 0 || qty > v.stock}
            onClick={addToCart}
          >
            {v?.stock > 0 ? 'Thêm vào giỏ hàng' : 'Hết hàng'}
          </button>

          {/* Mô tả */}
          <div className="mt-8">
            <h3 className="text-xl font-semibold mb-2">Mô tả sản phẩm</h3>
            <p className="text-gray-700 whitespace-pre-line">{p.productDescription}</p>
          </div>
        </div>
      </div>

      {/* (Phần đánh giá, bình luận fen có thể thêm ở đây) */}
    </div>
  );
}