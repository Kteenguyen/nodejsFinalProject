// frontend/src/context/CartContext.jsx
import React, { createContext, useContext, useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import { useAuth } from './AuthContext';
import api from '../services/api';
// --- 1. THÊM IMPORT NÀY ---
import { CartController } from '../controllers/CartController'; 

const CartContext = createContext();

export const useCart = () => {
    return useContext(CartContext);
};

const mergeItem = (prevItems, itemToAdd) => {
    const existingItem = prevItems.find(
        item => item.variantId === itemToAdd.variantId
    );

    if (existingItem) {
        return prevItems.map(item =>
            item.variantId === itemToAdd.variantId
                ? { ...item, quantity: item.quantity + itemToAdd.quantity }
                : item
        );
    } else {
        return [...prevItems, itemToAdd];
    }
};

export const CartProvider = ({ children }) => {
    const [cartItems, setCartItems] = useState([]);
    const [loading, setLoading] = useState(true);
    const { isAuthenticated, authLoading } = useAuth();

    // --- 2. HÀM clearCart (QUAN TRỌNG CHO CHECKOUT) ---
    const clearCart = async () => {
        // Xóa state frontend ngay lập tức
        setCartItems([]);
        localStorage.removeItem('cart'); // Xóa cả local storage cho chắc

        // Nếu đã đăng nhập, gọi API xóa trên DB
        if (isAuthenticated) {
            try {
                await CartController.clearCart(); 
            } catch (error) {
                console.error("Lỗi xóa giỏ hàng DB:", error);
            }
        }
    };

    useEffect(() => {
        if (authLoading) return;

        setLoading(true);
        if (isAuthenticated) {
            const localCart = JSON.parse(localStorage.getItem('cart') || '[]');
            if (localCart.length > 0) {
                syncLocalToDB(localCart);
            } else {
                fetchDBCart();
            }
        } else {
            const localCart = JSON.parse(localStorage.getItem('cart') || '[]');
            setCartItems(localCart);
            setLoading(false);
        }
    }, [isAuthenticated, authLoading]);

    const syncLocalToDB = async (localCart) => {
        try {
            const localCartWithProductId = localCart.map(item => ({
                productId: item.productId,
                variantId: item.variantId,
                quantity: item.quantity
            }));

            const response = await api.post('/cart/sync', { localCart: localCartWithProductId });
            setCartItems(response.data.cart);
            localStorage.removeItem('cart');
            toast.success('Đã đồng bộ giỏ hàng của bạn!');
        } catch (error) {
            console.error("Lỗi đồng bộ giỏ hàng:", error);
            // toast.error('Lỗi đồng bộ giỏ hàng.');
        } finally {
            setLoading(false);
        }
    };

    const fetchDBCart = async () => {
        try {
            const response = await api.get('/cart');
            if (response.data && response.data.cart) {
                setCartItems(response.data.cart);
            } else {
                setCartItems([]);
            }
            // Xóa localStorage sau khi fetch thành công từ DB
            localStorage.removeItem('cart');
        } catch (error) {
            console.error("Lỗi tải giỏ hàng từ DB:", error);
            setCartItems([]);
        } finally {
            setLoading(false);
        }
    };

    const addItem = async (itemToAdd) => {
        if (isAuthenticated) {
            try {
                const response = await api.post('/cart', {
                    productId: itemToAdd.productId,
                    variantId: itemToAdd.variantId,
                    quantity: itemToAdd.quantity
                });
                setCartItems(prevItems => mergeItem(prevItems, response.data.item));
                // Xóa localStorage để tránh sync lại
                localStorage.removeItem('cart');
            } catch (error) {
                console.error("Lỗi thêm vào giỏ hàng DB:", error);
                toast.error(error.response?.data?.message || "Lỗi khi thêm vào giỏ hàng");
                throw error;
            }
        } else {
            const newCart = mergeItem(cartItems, itemToAdd);
            setCartItems(newCart);
            localStorage.setItem('cart', JSON.stringify(newCart));
        }
    };

    const removeItem = async (variantId) => {
        const oldCart = cartItems;
        const newCart = cartItems.filter(item => item.variantId !== variantId);
        setCartItems(newCart);

        if (isAuthenticated) {
            const itemToRemove = oldCart.find(item => item.variantId === variantId);
            if (!itemToRemove || !itemToRemove._id) return;

            try {
                await api.delete(`/cart/${itemToRemove._id}`);
                // Xóa localStorage để tránh sync lại
                localStorage.removeItem('cart');
            } catch (error) {
                console.error("Lỗi xóa item DB:", error);
                toast.error("Lỗi khi xóa sản phẩm.");
                setCartItems(oldCart);
            }
        } else {
            localStorage.setItem('cart', JSON.stringify(newCart));
        }
    };

    const updateQuantity = async (variantId, newQuantity) => {
        const oldCart = cartItems;
        const newCart = oldCart.map(item =>
            item.variantId === variantId ? { ...item, quantity: newQuantity } : item
        ).filter(item => item.quantity > 0);
        setCartItems(newCart);

        if (isAuthenticated) {
            const itemToUpdate = oldCart.find(item => item.variantId === variantId);
            if (!itemToUpdate || !itemToUpdate._id) return;

            try {
                await api.put(`/cart/${itemToUpdate._id}`, { quantity: newQuantity });
                // Xóa localStorage để tránh sync lại
                localStorage.removeItem('cart');
            } catch (error) {
                console.error("Lỗi cập nhật số lượng DB:", error);
                toast.error(error.response?.data?.message || "Lỗi cập nhật số lượng.");
                setCartItems(oldCart);
            }
        } else {
            localStorage.setItem('cart', JSON.stringify(newCart));
        }
    };

    // --- 3. ĐƯA clearCart VÀO ĐÂY ---
    const value = {
        cartItems,
        setCartItems,
        addItem,
        removeItem,
        updateQuantity,
        clearCart, // <--- QUAN TRỌNG: Phải có dòng này thì CheckoutPage mới gọi được
        loadingCart: loading,
        itemCount: (cartItems || []).reduce((total, item) => total + item.quantity, 0),
        totalPrice: (cartItems || []).reduce((total, item) => total + (item.price * item.quantity), 0)
    };

    return (
        <CartContext.Provider value={value}>
            {children}
        </CartContext.Provider>
    );
};