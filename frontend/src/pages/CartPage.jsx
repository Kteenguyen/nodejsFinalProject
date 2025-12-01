import React, { useEffect, useState, useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { CartController } from '../controllers/CartController';
import { motion, AnimatePresence } from 'framer-motion';
import { FaTrash, FaPlus, FaMinus, FaShoppingBag } from 'react-icons/fa';
import { toast } from 'react-toastify';
import { getImageUrl } from '../services/api';

// === Helpers: Chuẩn hoá field từ nhiều nguồn (#17, local, v.v.) ===
function getVariantKey(it) {
  // BE #17 có thể trả sku === variantId
  return it.variantId || it.sku || `${it._id || it.productMongoId || it.productId}-noVariant`;
}
function getProductId(it) {
  // Link chi tiết ưu tiên productId custom → productMongoId → _id
  return it.productId || it.productMongoId || it._id;
}
function getName(it) {
  // BE #17: name = productName, attrs.name = variant name
  return it.productName || it.name || it.title || '(Không tên)';
}
function getVariantName(it) {
  return it.variantName || it.attrs?.name || it.variant || '';
}
function getImage(it) {
  const img = it.image || it.images?.[0] || '/img/placeholder-1.jpg';
  return getImageUrl(img);
}
function getPrice(it) {
  // đồng bộ nhất quán: price hoặc unitPrice
  return Number(it.price ?? it.unitPrice ?? 0);
}
function getQty(it) {
  return Number(it.quantity ?? it.qty ?? 1);
}
function getStock(it) {
  // tồn kho có thể là stock hoặc maxQty, nếu không có thì coi như vô hạn
  const s = it.stock ?? it.maxQty;
  return Number.isFinite(Number(s)) ? Number(s) : Infinity;
}

const CartPage = () => {
  const {
    cartItems,
    removeItem,
    updateQuantity,
    totalPrice,
    itemCount,
    setCartItems,
    loadingCart
  } = useCart();

  const { user } = useAuth();
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();

  // Tổng tiền hiển thị (dựa vào context), nếu muốn tính lại theo field chuẩn hoá:
  const computedTotal = useMemo(() => {
    // Nếu context đã tính đúng, ưu tiên context
    if (typeof totalPrice === 'number' && totalPrice >= 0) return totalPrice;
    return cartItems.reduce((s, it) => s + getPrice(it) * getQty(it), 0);
  }, [cartItems, totalPrice]);

  // Làm giàu giỏ hàng (enrich) khi mở trang
  useEffect(() => {
    const run = async () => {
      setIsLoading(true);
      try {
        if (cartItems.length > 0 && CartController?.enrichCart) {
          const { updatedCartItems, cartChanged } = await CartController.enrichCart(cartItems);
          if (cartChanged) setCartItems(updatedCartItems);
        }
      } catch (e) {
        console.warn('Enrich cart error:', e?.message);
      } finally {
        setIsLoading(false);
      }
    };
    run();
    // CHÚ Ý: Không để cartItems vào dependency để tránh vòng lặp khi enrich → setCartItems
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleRemoveItem = (variantIdOrSku) => {
    const key = variantIdOrSku; // controller removeItem nhận key theo variantId
    removeItem(key);
  };

  const handleUpdateQuantity = (variantIdOrSku, newQuantity) => {
    const item = cartItems.find(i => getVariantKey(i) === variantIdOrSku);
    if (!item) return;

    if (newQuantity <= 0) {
      handleRemoveItem(variantIdOrSku);
      return;
    }

    const stock = getStock(item);
    if (newQuantity > stock) {
      toast.error(`Số lượng vượt quá tồn kho (chỉ còn ${Number.isFinite(stock) ? stock : 0})`);
      return;
    }

    updateQuantity(variantIdOrSku, newQuantity);
  };

  if (isLoading || loadingCart) {
    return <div className="text-center p-10 text-lg font-semibold">Đang cập nhật giỏ hàng...</div>;
  }

  if (itemCount === 0) {
    return (
      <motion.div
        className="flex flex-col items-center justify-center min-h-[60vh] text-center"
        initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}
      >
        <FaShoppingBag className="text-8xl text-gray-300 mb-6" />
        <h1 className="text-3xl font-bold text-gray-800 mb-2">Giỏ hàng của bạn đang trống</h1>
        <p className="text-gray-500 mb-6">Hãy thêm sản phẩm để bắt đầu mua sắm nào!</p>
        <Link
          to="/products"
          className="px-6 py-3 bg-indigo-600 text-white font-semibold rounded-lg shadow-md hover:bg-indigo-700 transition-all duration-300 transform hover:scale-105"
        >
          Tiếp tục mua sắm
        </Link>
      </motion.div>
    );
  }

  return (
    <motion.div className="bg-gray-100 min-h-screen" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.3 }}>
      <div className="container mx-auto p-4 md:p-8">
        <h1 className="text-3xl font-bold mb-6 text-gray-800">
          Giỏ hàng của bạn ({itemCount} sản phẩm)
        </h1>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Danh sách sản phẩm */}
          <motion.div
            className="lg:col-span-2 bg-white rounded-lg shadow-lg"
            initial={{ opacity: 0, x: -50 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.5, delay: 0.1 }}
          >
            <AnimatePresence>
              {cartItems.map((raw) => {
                const key = getVariantKey(raw);
                const linkId = getProductId(raw);
                const name = getName(raw);
                const variantName = getVariantName(raw);
                const price = getPrice(raw);
                const qty = getQty(raw);
                const img = getImage(raw);

                return (
                  <motion.div
                    key={key}
                    layout
                    initial={{ opacity: 0, x: -30 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 30, transition: { duration: 0.3 } }}
                    className="flex flex-col sm:flex-row items-center gap-4 p-4 border-b border-gray-200"
                  >
                    {/* Ảnh */}
                    <img src={img} alt={name} className="w-24 h-24 object-contain rounded-md" />

                    {/* Tên & Giá */}
                    <div className="flex-1 text-center sm:text-left">
                      <Link to={`/products/${linkId}`} className="text-lg font-semibold text-gray-800 hover:text-indigo-600">
                        {name}
                      </Link>
                      {variantName && <p className="text-sm text-gray-500">{variantName}</p>}
                      <p className="text-md font-bold text-indigo-600 sm:hidden mt-2">
                        {price.toLocaleString()} ₫
                      </p>
                    </div>

                    {/* Bộ điều khiển số lượng */}
                    <div className="flex items-center border border-gray-300 rounded-lg">
                      <button
                        onClick={() => handleUpdateQuantity(key, qty - 1)}
                        className="p-2 text-gray-600 hover:text-red-500 transition rounded-l-lg"
                      >
                        <FaMinus />
                      </button>
                      <span className="px-4 py-2 font-semibold">{qty}</span>
                      <button
                        onClick={() => handleUpdateQuantity(key, qty + 1)}
                        className="p-2 text-gray-600 hover:text-green-500 transition rounded-r-lg"
                      >
                        <FaPlus />
                      </button>
                    </div>

                    {/* Giá (Desktop) */}
                    <div className="hidden sm:block w-24 text-right">
                      <p className="text-md font-bold text-indigo-600">
                        {price.toLocaleString()} ₫
                      </p>
                    </div>

                    {/* Nút Xóa */}
                    <button
                      onClick={() => handleRemoveItem(key)}
                      className="p-2 text-gray-400 hover:text-red-600 transition rounded-full"
                      title="Xóa sản phẩm"
                    >
                      <FaTrash />
                    </button>
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </motion.div>

          {/* Tóm tắt đơn hàng */}
          <motion.div
            className="lg:col-span-1 bg-white rounded-lg shadow-lg p-6 h-fit sticky top-24"
            initial={{ opacity: 0, x: 50 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.5, delay: 0.2 }}
          >
            <h2 className="text-2xl font-semibold border-b pb-4 mb-4">Tóm tắt đơn hàng</h2>
            <div className="flex justify-between mb-2">
              <span className="text-gray-600">Tạm tính ({itemCount} sản phẩm)</span>
              <span className="font-semibold">{computedTotal.toLocaleString()} ₫</span>
            </div>
            <div className="flex justify-between mb-4">
              <span className="text-gray-600">Phí vận chuyển</span>
              <span className="font-semibold">Miễn phí</span>
            </div>

            <div className="border-t pt-4 mt-4 flex justify-between items-center">
              <span className="text-xl font-bold text-gray-800">Tổng cộng</span>
              <span className="text-2xl font-bold text-red-600">{computedTotal.toLocaleString()} ₫</span>
            </div>

            <button
              onClick={() => {
                if (!user) {
                  toast.warning('Vui lòng đăng nhập để tiến hành thanh toán');
                  navigate('/login', { state: { from: '/checkout' } });
                  return;
                }
                navigate('/checkout');
              }}
              className="w-full mt-6 py-3 bg-indigo-600 text-white text-lg font-semibold rounded-lg shadow-md hover:bg-indigo-700 transition-all duration-300 transform hover:scale-105"
            >
              Tiến hành Thanh toán
            </button>
            <Link to="/products" className="block text-center mt-4 text-indigo-600 hover:text-indigo-800 font-medium transition">
              Tiếp tục mua sắm
            </Link>
          </motion.div>
        </div>
      </div>
    </motion.div>
  );
};

export default CartPage;
