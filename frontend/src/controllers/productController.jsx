// frontend/src/controllers/productController.jsx
import api from "../services/api"; // 👈 QUAN TRỌNG: Import 'api' đã cấu hình HTTPS

const ProductController = {
    /**
     * Lấy danh sách sản phẩm mới
     */
    getNewProducts: async () => {
        try {
            // Dùng 'api.get', nó sẽ tự động dùng base URL 'https://localhost:3001/api'
            const response = await api.get("/products/collections/new");
            return response.data.products || []; // Trả về mảng products
        } catch (error) {
            console.error("Lỗi fetch sản phẩm mới (Controller):", error);
            throw error; // Ném lỗi để component cha bắt
        }
    },

    /**
     * Lấy danh sách sản phẩm bán chạy
     */
    getBestSellers: async () => {
        try {
            const response = await api.get("/products/collections/bestsellers");
            return response.data.products || [];
        } catch (error) {
            console.error("Lỗi fetch Best Sellers (Controller):", error);
            throw error;
        }
    },

    /**
     * Lấy sản phẩm theo danh mục (category)
     * @param {string} categoryId ID của danh mục (ví dụ: 'laptop')
     */
    getProductsByCategory: async (categoryId) => {
        if (!categoryId) {
            throw new Error("Category ID là bắt buộc");
        }
        try {
            const response = await api.get(`/products/category/${categoryId}`);
            return response.data.products || [];
        } catch (error) {
            console.error(`Lỗi fetch sản phẩm danh mục ${categoryId} (Controller):`, error);
            throw error;
        }
    }
    
    // Thêm các hàm khác như getProductById, searchProducts... nếu cần
};

export { ProductController };