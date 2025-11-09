// frontend/src/context/CartContext.jsx
import React, { createContext, useContext, useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import { useAuth } from './AuthContext'; // 👈 Import AuthContext
import api from '../services/api'; // 👈 Import axios instance

const CartContext = createContext();

export const useCart = () => {
    return useContext(CartContext);
};

// Hàm helper để gộp item (dùng trong addItem)
const mergeItem = (prevItems, itemToAdd) => {
    const existingItem = prevItems.find(
        item => item.variantId === itemToAdd.variantId
    );

    if (existingItem) {
        // Nếu đã có -> Cập nhật số lượng
        return prevItems.map(item =>
            item.variantId === itemToAdd.variantId
                ? { ...item, quantity: item.quantity + itemToAdd.quantity }
                : item
        );
    } else {
        // Nếu chưa có -> Thêm mới vào giỏ
        return [...prevItems, itemToAdd];
    }
};

export const CartProvider = ({ children }) => {
    const [cartItems, setCartItems] = useState([]); // Bắt đầu với giỏ hàng rỗng
    const [loading, setLoading] = useState(true); // Thêm state loading
    const { isAuthenticated, authLoading } = useAuth(); // Lấy trạng thái Auth

    // Lắng nghe thay đổi của AuthState -> Đồng bộ/Tải giỏ hàng
    useEffect(() => {
        // Chờ AuthContext load xong
        if (authLoading) return;

        setLoading(true);
        if (isAuthenticated) {
            // === USER ĐÃ ĐĂNG NHẬP ===
            const localCart = JSON.parse(localStorage.getItem('cart') || '[]');

            if (localCart.length > 0) {
                // Nếu có giỏ hàng local (khách), gửi lên DB để gộp
                syncLocalToDB(localCart);
            } else {
                // Nếu không có giỏ hàng local, tải giỏ hàng từ DB xuống
                fetchDBCart();
            }
        } else {
            // === USER LÀ KHÁCH (CHƯA ĐĂNG NHẬP) ===
            // Tải giỏ hàng từ localStorage
            const localCart = JSON.parse(localStorage.getItem('cart') || '[]');
            setCartItems(localCart);
            setLoading(false);
        }
    }, [isAuthenticated, authLoading]); // Chạy khi trạng thái đăng nhập thay đổi

    // === CÁC HÀM API GỌI LÊN BACKEND (MỚI) ===

    // Gộp LocalStorage lên DB (khi vừa đăng nhập)
    const syncLocalToDB = async (localCart) => {
        try {
            // Chuẩn bị data cho API của fen (cần cả productId)
            const localCartWithProductId = localCart.map(item => ({
                productId: item.productId, // ProductCard.jsx đã thêm productId khi addItem
                variantId: item.variantId,
                quantity: item.quantity
            }));

            const response = await api.post('/cart/sync', { localCart: localCartWithProductId });
            // Cập nhật Context bằng giỏ hàng đã gộp từ server
            setCartItems(response.data.cart); // Hàm syncCart của fen đã trả về giỏ hàng enrich
            localStorage.removeItem('cart'); // Xóa giỏ hàng local
            toast.success('Đã đồng bộ giỏ hàng của bạn!');
        } catch (error) {
            console.error("Lỗi đồng bộ giỏ hàng:", error);
            toast.error('Lỗi đồng bộ giỏ hàng.');
        } finally {
            setLoading(false);
        }
    };

    // Tải giỏ hàng từ DB (khi đã đăng nhập)
    const fetchDBCart = async () => {
        try {
            const response = await api.get('/cart');

            // Thêm kiểm tra response (vì 401 sẽ trả về response.data = undefined)
            if (response.data && response.data.cart) {
                setCartItems(response.data.cart);
            } else {
                // Nếu API trả về 401 (response.data là undefined)
                setCartItems([]); // 👈 Sửa thành mảng rỗng
            }
        } catch (error) {
            console.error("Lỗi tải giỏ hàng từ DB:", error);
            setCartItems([]); // 👈 Sửa thành mảng rỗng
        } finally {
            setLoading(false);
        }
    };
    // === CÁC HÀM THAO TÁC GIỎ HÀNG (ĐÃ CẬP NHẬT) ===

    // Hàm này (từ ProductCard) sẽ thông minh hơn:
    // 1. Đã đăng nhập -> Gọi API
    // 2. Là khách -> Dùng localStorage
    const addItem = async (itemToAdd) => {
        if (isAuthenticated) {
            // 1. Đã đăng nhập -> Gọi API 'addToCart'
            try {
                const response = await api.post('/cart', {
                    productId: itemToAdd.productId,
                    variantId: itemToAdd.variantId,
                    quantity: itemToAdd.quantity
                });
                // Cập nhật state bằng item đã được enrich từ API
                // (Gộp vào state chứ không phải set, để tránh ghi đè)
                setCartItems(prevItems => mergeItem(prevItems, response.data.item));
            } catch (error) {
                console.error("Lỗi thêm vào giỏ hàng DB:", error);
                toast.error(error.response?.data?.message || "Lỗi khi thêm vào giỏ hàng");
                throw error; // Ném lỗi để ProductCard bắt
            }
        } else {
            // 2. Là khách -> Dùng localStorage
            const newCart = mergeItem(cartItems, itemToAdd);
            setCartItems(newCart);
            localStorage.setItem('cart', JSON.stringify(newCart));
        }
    };

    const removeItem = async (variantId) => {
        // Cập nhật UI trước (Optimistic Update)
        const oldCart = cartItems;
        const newCart = cartItems.filter(item => item.variantId !== variantId);
        setCartItems(newCart);

        if (isAuthenticated) {
            // 1. Đã đăng nhập -> Gọi API 'removeCartItem'
            // Lưu ý: Cần cartItemId (chính là item._id)
            const itemToRemove = oldCart.find(item => item.variantId === variantId);
            if (!itemToRemove || !itemToRemove._id) return; // Không tìm thấy _id để xóa

            try {
                await api.delete(`/cart/${itemToRemove._id}`);
            } catch (error) {
                console.error("Lỗi xóa item DB:", error);
                toast.error("Lỗi khi xóa sản phẩm.");
                setCartItems(oldCart); // Hoàn tác nếu lỗi
            }
        } else {
            // 2. Là khách -> Dùng localStorage
            localStorage.setItem('cart', JSON.stringify(newCart));
        }
    };

    const updateQuantity = async (variantId, newQuantity) => {
        const oldCart = cartItems;

        // Cập nhật UI trước
        const newCart = oldCart.map(item =>
            item.variantId === variantId ? { ...item, quantity: newQuantity } : item
        ).filter(item => item.quantity > 0); // Lọc bỏ nếu số lượng = 0
        setCartItems(newCart);

        if (isAuthenticated) {
            // 1. Đã đăng nhập -> Gọi API 'updateCartItem'
            const itemToUpdate = oldCart.find(item => item.variantId === variantId);
            if (!itemToUpdate || !itemToUpdate._id) return;

            try {
                await api.put(`/cart/${itemToUpdate._id}`, { quantity: newQuantity });
            } catch (error) {
                console.error("Lỗi cập nhật số lượng DB:", error);
                toast.error(error.response?.data?.message || "Lỗi cập nhật số lượng.");
                setCartItems(oldCart); // Hoàn tác nếu lỗi
            }
        } else {
            // 2. Là khách -> Dùng localStorage
            localStorage.setItem('cart', JSON.stringify(newCart));
        }
    };

    // Giá trị cung cấp
    const value = {
        cartItems,
        setCartItems, // Giữ lại để Cart.jsx enrich
        addItem,
        removeItem,
        updateQuantity,
        loadingCart: loading, // Export state loading
        itemCount: (cartItems || []).reduce((total, item) => total + item.quantity, 0),
        totalPrice: (cartItems || []).reduce((total, item) => total + (item.price * item.quantity), 0)
    };

    return (
        <CartContext.Provider value={value}>
            {children}
        </CartContext.Provider>
    );
};