// frontend/src/controllers/productController.jsx
import api from "../services/api"; // Giữ file này để lấy cấu hình axios gốc

// ============================================
// CÁC HÀM QUẢN LÝ SẢN PHẨM
// ============================================

/**
 * Lấy danh sách sản phẩm (Dùng chung cho cả Admin và User trang Shop)
 * Thay thế cho: getProductsAdmin, listProducts
 */
const getProducts = async (options = {}) => {
    const {
        page = 1,
        limit = 10,
        sort = "newest",      
        search = "",
        brand = "",
        category = "",
        productType = "",    
        minPrice,
        maxPrice
    } = options;

    try {
        const params = {
            page,
            limit,
            sort,
            search: search || undefined,
            brand: brand || undefined,
            category: category || undefined,
            productType: productType || undefined,
            minPrice: minPrice || undefined,
            maxPrice: maxPrice || undefined
        };

        // Gọi trực tiếp endpoint
        const response = await api.get('/products', { params });
        
        // Backend trả về: { success, items, pagination } hoặc { products: [...], ... }
        // Chuẩn hóa dữ liệu trả về để View dễ dùng
        return {
            products: response.data.items || response.data.products || [],
            pagination: response.data.pagination || {},
            totalPages: response.data.totalPages || 1,
            currentPage: response.data.currentPage || 1
        };
    } catch (error) {
        console.error("Lỗi getProducts:", error);
        throw error;
    }
};

/**
 * Tìm kiếm sản phẩm (Ưu tiên ES, fallback về thường)
 * Thay thế cho: searchProducts
 */
const searchProducts = async (query = {}) => {
    const qs = new URLSearchParams();
    Object.entries(query).forEach(([k, v]) => {
        if (v !== undefined && v !== null && v !== "") qs.append(k, v);
    });

    try {
        // Ưu tiên gọi API Search (ElasticSearch)
        const response = await api.get(`/search/products?${qs.toString()}`);
        return response.data;
    } catch (error) {
        // Fallback: Nếu API search lỗi, gọi API thường
        console.warn("ES search failed, fallback to normal API");
        return getProducts(query);
    }
};

/**
 * Lấy chi tiết sản phẩm
 */
const getProductById = async (idOrSlug) => {
    try {
        const response = await api.get(`/products/${idOrSlug}`);
        return response.data.product || response.data;
    } catch (error) {
        console.error(`Lỗi getProductById ${idOrSlug}:`, error);
        throw error;
    }
};

/**
 * Lấy sản phẩm theo Category (Helper function dùng lại getProducts)
 */
const getProductsByCategory = async (categoryId, options = {}) => {
    return getProducts({ ...options, category: categoryId });
};

/**
 * Lấy sản phẩm mới (Helper function)
 */
const getNewProducts = async () => {
    try {
        // Gọi endpoint collection hoặc filter
        const response = await api.get("/products/collections/new"); 
        // Hoặc: await getProducts({ productType: 'new', limit: 8 });
        return response.data.products || [];
    } catch (error) {
        return [];
    }
};

/**
 * Lấy sản phẩm bán chạy (Helper function)
 */
const getBestSellers = async () => {
    try {
        const response = await api.get("/products/collections/bestsellers");
        return response.data.products || [];
    } catch (error) {
        return [];
    }
};

// ============================================
// HELPERS (Không gọi API)
// ============================================
function getImageUrl(src) {
    if (!src) return "/images/placeholder.png";
    if (src.startsWith('http')) return src;
    const BASE_URL = process.env.REACT_APP_API_URL || "https://localhost:3001";
    return `${BASE_URL}${src.startsWith("/") ? "" : "/"}${src}`;
}

function getMinPrice(product) {
    if (typeof product?.minPrice === 'number' && product.minPrice >= 0) return product.minPrice;
    const prices = (product?.variants || []).map(v => Number(v?.price)).filter(n => n >= 0);
    return prices.length > 0 ? Math.min(...prices) : 0;
}

export const ProductController = {
    getProducts,
    searchProducts,
    getProductById,
    getProductsByCategory,
    getNewProducts,
    getBestSellers,
    getImageUrl,
    getMinPrice
};