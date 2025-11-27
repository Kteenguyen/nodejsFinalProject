// frontend/src/controllers/DashboardController.jsx
import api from "../services/api";

export const DashboardController = {
    getStats: async (options = {}) => {
        const { period = "year", from, to, status } = options;
        
        // 1. Logic lấy Advanced Stats
        try {
            const params = { period, from, to, status };
            // Lọc bỏ null/undefined
            const cleanParams = Object.fromEntries(
                Object.entries(params).filter(([, v]) => v != null && v !== "")
            );
            
            const response = await api.get('/api/admin/stats/advanced', { params: cleanParams });
            return { success: true, data: response.data };

        } catch (error) {
            console.warn("Advanced stats failed, trying fallback...", error);

            // 2. Logic Fallback (đã gộp vào đây)
            try {
                // Fetch song song
                const [resProd, resOrder] = await Promise.all([
                    api.get('/products', { params: { limit: 1 } }).catch(() => ({ data: { totalProducts: 0 } })),
                    api.get('/orders/admin/all').catch(() => ({ data: { orders: [] } }))
                ]);

                const products = resProd.data?.totalProducts ?? 0;
                const orders = Array.isArray(resOrder.data?.orders) ? resOrder.data.orders.length : 0;

                return { 
                    success: true, 
                    data: { products, orders }, 
                    isFallback: true 
                };
            } catch (fallbackError) {
                return { success: false, message: "Không thể tải dữ liệu thống kê." };
            }
        }
    }
};