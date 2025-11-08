// frontend/src/controllers/productController.jsx
import api from "../services/api"; // Import instance axios đã cấu hình

// ============================================
// CÁC HÀM GỌI API
// ============================================
/**
 * Lấy danh sách TẤT CẢ sản phẩm (hỗ trợ phân trang)
 * (Refactored từ ProductsPage.jsx)
 * @param {object} options Các tùy chọn như page, limit
 */
const getProducts = async (options = {}) => {
    const { page = 1, limit = 12 } = options;
    try {
        // Xây dựng query params
        const params = new URLSearchParams({
            page,
            limit
        });

        // Gọi API /api/products (route GET '/' của productRoutes.js)
        const response = await api.get('/products', { params });

        // Trả về data (VD: { products: [...], totalPages: X })
        return response.data;
    } catch (error) {
        console.error("Lỗi fetch (all) products (Controller):", error);
        throw error; // Ném lỗi để component cha xử lý
    }
};
/**
 * Lấy chi tiết một sản phẩm bằng ID
 * (Refactored từ ProductDetail.jsx)
 * @param {string} productId ID của sản phẩm (ví dụ: 'monitor04')
 */
const getProductById = async (productId) => {
    if (!productId) {
        throw new Error("Product ID là bắt buộc");
    }
    try {
        // Dùng 'api.get', nó sẽ tự động dùng base URL 'https://localhost:3001/api'
        // Nó sẽ gọi tới: /api/products/:productId
        const response = await api.get(`/products/${productId}`);

        // Backend của fen trả về { success: true, product: {...} }
        return response.data.product;
    } catch (error) {
        console.error(`Lỗi fetch chi tiết sản phẩm ${productId} (Controller):`, error);
        throw error; // Ném lỗi để component cha xử lý
    }
};
/**
 * Lấy danh sách sản phẩm theo Category ID.
 * Hỗ trợ sắp xếp, phân trang.
 * @param {string} categoryId ID của danh mục
 * @param {object} options Các tùy chọn như sortBy, sortOrder, page, limit
 * @returns {Promise<object>} Đối tượng chứa products (mảng), totalPages, currentPage
 */
const getProductsByCategory = async (categoryId, options = {}) => {
    const {
        sortBy = 'newest',
        sortOrder = 'desc',
        page = 1,
        limit = 8
    } = options;

    if (!categoryId) {
        console.warn("Category ID không được cung cấp. Trả về mảng rỗng.");
        return { products: [], totalPages: 1, currentPage: 1 };
    }

    try {
        const params = new URLSearchParams({
            sortBy,
            sortOrder,
            page,
            limit
        });

        const response = await api.get(`/products/category/${categoryId}`, { params });
        return response.data; // Backend nên trả về { products: [...], totalPages: X, currentPage: Y }
    } catch (error) {
        console.error(`Lỗi fetch sản phẩm danh mục ${categoryId}:`, error);
        throw error; // Ném lỗi để component xử lý
    }
};

/**
 * Lấy danh sách sản phẩm mới nhất.
 * @returns {Promise<Array>} Mảng các sản phẩm mới
 */
const getNewProducts = async () => {
    try {
        const response = await api.get("/products/collections/new");
        return response.data.products || []; // Đảm bảo trả về mảng
    } catch (error) {
        console.error("Lỗi fetch sản phẩm mới:", error);
        throw error;
    }
};

/**
 * Lấy danh sách sản phẩm bán chạy nhất.
 * @returns {Promise<Array>} Mảng các sản phẩm bán chạy
 */
const getBestSellers = async () => {
    try {
        const response = await api.get("/products/collections/bestsellers");
        return response.data.products || []; // Đảm bảo trả về mảng
    } catch (error) {
        console.error("Lỗi fetch Best Sellers:", error);
        throw error;
    }
};

// ============================================
// CÁC HÀM HELPERS (cho ProductCard, v.v.)
// ============================================

/**
 * Lấy URL đầy đủ cho ảnh sản phẩm.
 * Xử lý cả URL tuyệt đối và tương đối.
 * @param {string} src Đường dẫn ảnh từ dữ liệu sản phẩm
 * @returns {string} URL ảnh đầy đủ
 */
function getImageUrl(src) {
    if (!src) return "/images/placeholder.png"; // Ảnh mặc định nếu không có

    // Nếu đã là URL đầy đủ (HTTP/HTTPS)
    if (src.startsWith('http://') || src.startsWith('https://')) {
        return src;
    }

    // Nếu là URL tương đối, ghép với BASE_URL của frontend
    // Đảm bảo REACT_APP_API_URL khớp với domain của backend serve ảnh tĩnh
    const BASE_URL_FOR_IMAGES = process.env.REACT_APP_API_URL || "https://localhost:3001";

    // Đảm bảo có đúng một dấu '/' giữa base và src
    return `${BASE_URL_FOR_IMAGES}${src.startsWith("/") ? "" : "/"}${src}`;
}

/**
 * Lấy giá thấp nhất của sản phẩm từ thuộc tính minPrice hoặc từ variants.
 * @param {object} product Đối tượng sản phẩm
 * @returns {number} Giá thấp nhất
 */
function getMinPrice(product) {
    // Ưu tiên thuộc tính minPrice đã được tính toán từ backend
    if (typeof product?.minPrice === 'number' && product.minPrice >= 0) {
        return product.minPrice;
    }

    // Nếu không có, hoặc minPrice không hợp lệ, tính từ variants
    const prices = (product?.variants || [])
        .map(v => Number(v?.price))
        .filter(n => Number.isFinite(n) && n >= 0); // Lọc các giá trị số hợp lệ

    return prices.length > 0 ? Math.min(...prices) : 0; // Trả về 0 nếu không có giá
}


// Export tất cả các hàm để sử dụng ở các component
export const ProductController = {
    //API Calls
    getProductById,
    getProductsByCategory,
    getNewProducts,
    getBestSellers,
    getProducts,
    // Helpers
    getImageUrl,
    getMinPrice
};