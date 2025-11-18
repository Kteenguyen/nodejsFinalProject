// frontend/src/controllers/orderController.js
import api from '../services/api'; // (Giả sử bạn có file api.js)

/**
 * Lấy lịch sử đơn hàng CỦA TÔI (cho user tự xem)
 * Gọi GET /api/orders/myorders
 */
const getMyOrders = async () => {
    // API này gọi 'GET /api/orders/myorders'
    const response = await api.get('/orders/myorders');
    
    // Hàm listMyOrders (backend) của bạn trả về { ..., orders: [...] }
    return response.data.orders; 
};

/**
 * Lấy TẤT CẢ đơn hàng (cho admin)
 * Gọi GET /api/orders/admin/all
 */
const getAllOrdersForAdmin = async () => {
    // API này gọi 'GET /api/orders/admin/all'
    const response = await api.get('/orders/admin/all');
    
    // ❗ CHÚ Ý: Tôi giả sử hàm listOrders (backend) cũng trả về { ..., orders: [...] }
    // Nếu nó trả về mảng, bạn chỉ cần `return response.data;`
    return response.data.orders; 
};

// Export nó ra
export const OrderController = {
    getMyOrders,
    getAllOrdersForAdmin
};