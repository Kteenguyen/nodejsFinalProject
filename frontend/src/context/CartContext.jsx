// frontend/src/context/CartContext.jsx
import React, { createContext, useContext, useState, useEffect } from 'react';
import { toast } from 'react-toastify'; // Import toast để hiển thị thông báo

// 1. Tạo Context
const CartContext = createContext();

// 2. Tạo hàm hook 'useCart' để component con dễ dàng sử dụng
export const useCart = () => {
    return useContext(CartContext);
};

// 3. Tạo Provider Component
export const CartProvider = ({ children }) => {
    // Lấy giỏ hàng từ localStorage (nếu có) hoặc dùng mảng rỗng
    const [cartItems, setCartItems] = useState(() => {
        try {
            const localData = localStorage.getItem('cart');
            return localData ? JSON.parse(localData) : [];
        } catch (error) {
            console.error("Không thể parse giỏ hàng từ localStorage", error);
            // Nếu có lỗi, trả về mảng rỗng để tránh crash
            return []; 
        }
    });

    // Lưu giỏ hàng vào localStorage mỗi khi cartItems thay đổi
    useEffect(() => {
        localStorage.setItem('cart', JSON.stringify(cartItems));
    }, [cartItems]);

    /**
     * Thêm sản phẩm vào giỏ hàng
     * (itemToAdd: { productId, variantId, productName, image, price, stock, quantity })
     */
    const addItem = (itemToAdd) => {
        setCartItems(prevItems => {
            // Kiểm tra xem item (với cùng variantId) đã có trong giỏ chưa
            const existingItem = prevItems.find(
                item => item.productId === itemToAdd.productId && item.variantId === itemToAdd.variantId
            );

            if (existingItem) {
                // Nếu đã có -> Cập nhật số lượng
                const newQuantity = existingItem.quantity + itemToAdd.quantity;
                if (newQuantity > itemToAdd.stock) {
                    // Nếu vượt quá tồn kho
                    toast.error(`Chỉ còn ${itemToAdd.stock} sản phẩm. Bạn đã có ${existingItem.quantity} trong giỏ.`);
                    throw new Error(`Số lượng vượt quá tồn kho (${itemToAdd.stock}).`);
                }
                
                return prevItems.map(item =>
                    (item.productId === itemToAdd.productId && item.variantId === itemToAdd.variantId)
                        ? { ...item, quantity: newQuantity }
                        : item
                );
            } else {
                // Nếu chưa có -> Thêm mới vào giỏ
                if (itemToAdd.quantity > itemToAdd.stock) {
                    toast.error(`Chỉ còn ${itemToAdd.stock} sản phẩm.`);
                    throw new Error(`Số lượng vượt quá tồn kho (${itemToAdd.stock}).`);
                }
                return [...prevItems, itemToAdd];
            }
        });
    };

    /**
     * Xóa sản phẩm khỏi giỏ hàng (dựa trên variantId)
     */
    const removeItem = (variantId) => {
        setCartItems(prevItems => prevItems.filter(item => item.variantId !== variantId));
        toast.info("Sản phẩm đã được xóa khỏi giỏ hàng.");
    };

    /**
     * Cập nhật số lượng của một sản phẩm
     */
    const updateQuantity = (variantId, newQuantity) => {
        setCartItems(prevItems => 
            prevItems.map(item => {
                if (item.variantId === variantId) {
                    if (newQuantity <= 0) return null; // Sẽ bị xóa ở bước filter
                    if (newQuantity > item.stock) {
                        toast.error(`Chỉ còn ${item.stock} sản phẩm trong kho.`);
                        return { ...item, quantity: item.stock }; // Giới hạn ở tồn kho
                    }
                    return { ...item, quantity: newQuantity };
                }
                return item;
            }).filter(Boolean) // Loại bỏ các item có newQuantity <= 0 (đã bị gán null)
        );
        toast.success("Số lượng sản phẩm đã được cập nhật.");
    };

    // Giá trị cung cấp cho các component con
    const value = {
        cartItems,
        addItem,
        removeItem,
        updateQuantity,
        itemCount: cartItems.reduce((total, item) => total + item.quantity, 0),
        totalPrice: cartItems.reduce((total, item) => total + (item.price * item.quantity), 0)
    };

    return (
        <CartContext.Provider value={value}>
            {children}
        </CartContext.Provider>
    );
};