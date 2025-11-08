// frontend/src/pages/Cart.jsx
import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { CartController } from '../controllers/CartController'; // 👈 Import controller mới
import { motion, AnimatePresence } from 'framer-motion';
import { FaTrash, FaPlus, FaMinus, FaShoppingBag } from 'react-icons/fa';

const CartPage = () => {
    const { 
        cartItems, 
        removeItem, 
        updateQuantity, 
        totalPrice, 
        itemCount, 
        setCartItems // 👈 Lấy hàm setCartItems để cập nhật sau khi enrich
    } = useCart();
    
    const [isLoading, setIsLoading] = useState(true); // State loading cho việc enrich
    const navigate = useNavigate();

    // 1. Logic: Làm giàu giỏ hàng khi trang được tải
    useEffect(() => {
        const checkCartData = async () => {
            setIsLoading(true);
            const { updatedCartItems, cartChanged } = await CartController.enrichCart(cartItems);
            
            if (cartChanged) {
                // Nếu có thay đổi (giá, tồn kho, xóa SP), cập nhật lại Context
                setCartItems(updatedCartItems); 
            }
            setIsLoading(false);
        };

        if (cartItems.length > 0) {
            checkCartData();
        } else {
            setIsLoading(false);
        }
    }, []); // Chỉ chạy 1 lần khi component mount

    // 2. Logic: Wrappers cho các hàm update (để xử lý loading)
    const handleRemoveItem = (variantId) => {
        removeItem(variantId);
    };

    const handleUpdateQuantity = (variantId, newQuantity) => {
        const item = cartItems.find(i => i.variantId === variantId);
        if (newQuantity <= 0) {
            handleRemoveItem(variantId);
            return;
        }
        if (newQuantity > item.stock) {
            toast.error(`Số lượng vượt quá tồn kho (chỉ còn ${item.stock})`);
            return;
        }
        updateQuantity(variantId, newQuantity);
    };

    // 3. Render
    if (isLoading) {
        return <div className="text-center p-10 text-lg font-semibold">Đang cập nhật giỏ hàng...</div>
    }

    if (itemCount === 0) {
        return (
            <motion.div 
                className="flex flex-col items-center justify-center min-h-[60vh] text-center"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
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
        <motion.div 
            className="bg-gray-100 min-h-screen"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.3 }}
        >
            <div className="container mx-auto p-4 md:p-8">
                <h1 className="text-3xl font-bold mb-6 text-gray-800">Giỏ hàng của bạn ({itemCount} sản phẩm)</h1>
                
                {/* Layout: Mobile (1 cột) | Desktop (2 cột) */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

                    {/* Cột trái: Danh sách sản phẩm */}
                    <motion.div 
                        className="lg:col-span-2 bg-white rounded-lg shadow-lg"
                        initial={{ opacity: 0, x: -50 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.5, delay: 0.1 }}
                    >
                        <AnimatePresence>
                            {cartItems.map((item) => (
                                <motion.div
                                    key={item.variantId}
                                    layout
                                    initial={{ opacity: 0, x: -30 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    exit={{ opacity: 0, x: 30, transition: { duration: 0.3 } }}
                                    className="flex flex-col sm:flex-row items-center gap-4 p-4 border-b border-gray-200"
                                >
                                    {/* Ảnh */}
                                    <img src={item.image} alt={item.productName} className="w-24 h-24 object-contain rounded-md" />

                                    {/* Tên & Giá */}
                                    <div className="flex-1 text-center sm:text-left">
                                        <Link to={`/products/${item.productId}`} className="text-lg font-semibold text-gray-800 hover:text-indigo-600">
                                            {item.productName}
                                        </Link>
                                        <p className="text-sm text-gray-500">{item.variantName}</p>
                                        <p className="text-md font-bold text-indigo-600 sm:hidden mt-2">
                                            {item.price.toLocaleString()} ₫
                                        </p>
                                    </div>

                                    {/* Bộ điều khiển số lượng */}
                                    <div className="flex items-center border border-gray-300 rounded-lg">
                                        <button 
                                            onClick={() => handleUpdateQuantity(item.variantId, item.quantity - 1)}
                                            className="p-2 text-gray-600 hover:text-red-500 transition rounded-l-lg"
                                        >
                                            <FaMinus />
                                        </button>
                                        <span className="px-4 py-2 font-semibold">{item.quantity}</span>
                                        <button 
                                            onClick={() => handleUpdateQuantity(item.variantId, item.quantity + 1)}
                                            className="p-2 text-gray-600 hover:text-green-500 transition rounded-r-lg"
                                        >
                                            <FaPlus />
                                        </button>
                                    </div>

                                    {/* Giá (Desktop) */}
                                    <div className="hidden sm:block w-24 text-right">
                                        <p className="text-md font-bold text-indigo-600">
                                            {item.price.toLocaleString()} ₫
                                        </p>
                                    </div>

                                    {/* Nút Xóa */}
                                    <button 
                                        onClick={() => handleRemoveItem(item.variantId)}
                                        className="p-2 text-gray-400 hover:text-red-600 transition rounded-full"
                                        title="Xóa sản phẩm"
                                    >
                                        <FaTrash />
                                    </button>
                                </motion.div>
                            ))}
                        </AnimatePresence>
                    </motion.div>

                    {/* Cột phải: Tóm tắt đơn hàng */}
                    <motion.div 
                        className="lg:col-span-1 bg-white rounded-lg shadow-lg p-6 h-fit sticky top-24" // h-fit + sticky
                        initial={{ opacity: 0, x: 50 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.5, delay: 0.2 }}
                    >
                        <h2 className="text-2xl font-semibold border-b pb-4 mb-4">Tóm tắt đơn hàng</h2>
                        <div className="flex justify-between mb-2">
                            <span className="text-gray-600">Tạm tính ({itemCount} sản phẩm)</span>
                            <span className="font-semibold">{totalPrice.toLocaleString()} ₫</span>
                        </div>
                        <div className="flex justify-between mb-4">
                            <span className="text-gray-600">Phí vận chuyển</span>
                            <span className="font-semibold">Miễn phí</span>
                        </div>
                        
                        {/* (Thêm ô nhập mã giảm giá ở đây nếu fen muốn) */}

                        <div className="border-t pt-4 mt-4 flex justify-between items-center">
                            <span className="text-xl font-bold text-gray-800">Tổng cộng</span>
                            <span className="text-2xl font-bold text-red-600">{totalPrice.toLocaleString()} ₫</span>
                        </div>

                        <button 
                            onClick={() => navigate('/checkout')} // Giả sử fen có trang /checkout
                            className="w-full mt-6 py-3 bg-indigo-600 text-white text-lg font-semibold rounded-lg shadow-md hover:bg-indigo-700 transition-all duration-300 transform hover:scale-105"
                        >
                            Tiến hành Thanh toán
                        </button>
                        <Link 
                            to="/products"
                            className="block text-center mt-4 text-indigo-600 hover:text-indigo-800 font-medium transition"
                        >
                            Tiếp tục mua sắm
                        </Link>
                    </motion.div>

                </div>
            </div>
        </motion.div>
    );
};

export default CartPage;