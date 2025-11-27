// frontend/src/controllers/orderController.jsx
import api from '../services/api';

const BASE_URL = '/orders';

const getMyOrders = async () => {
    try {
        const response = await api.get(`${BASE_URL}/myorders`);
        return response.data.orders || []; 
    } catch (error) {
        console.error("Lỗi getMyOrders:", error);
        return [];
    }
};

const getAllOrdersForAdmin = async (params) => {
    try {
        // Tích hợp logic ordersApi.list
        const response = await api.get(`${BASE_URL}/admin/all`, { params });
        return response.data.orders || response.data.data || []; 
    } catch (error) {
        console.error("Lỗi getAllOrdersForAdmin:", error);
        throw error;
    }
};

const getOrderDetail = async (orderId) => {
    try {
        // Tích hợp logic ordersApi.detail
        const response = await api.get(`${BASE_URL}/${orderId}`);
        return response.data.order || response.data;
    } catch (error) {
        throw error;
    }
};

const updateOrderStatus = async (orderId, status) => {
    try {
        // Tích hợp logic ordersApi.updateStatus
        const response = await api.put(`${BASE_URL}/${orderId}/status`, { status });
        return response.data;
    } catch (error) {
        throw error;
    }
};

export const OrderController = {
    getMyOrders,
    getAllOrdersForAdmin,
    getOrderDetail,
    updateOrderStatus
};