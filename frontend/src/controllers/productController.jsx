// frontend/src/controllers/productController.jsx
import api, { BACKEND_URL } from "../services/api"; // Giữ file này để lấy cấu hình axios gốc

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
        limit = 12,
        sortBy = "newest",
        sortOrder = "desc",
        search = "",
        keyword = "",
        brand = "",
        categoryId = "",
        minPrice,
        maxPrice,
        ratingMin,
        inStock,
        isNew,
        bestSeller
    } = options;

    try {
        const params = {};

        // Phân trang
        if (page) params.page = page;
        if (limit) params.limit = limit;

        // Sắp xếp
        if (sortBy) params.sortBy = sortBy;
        if (sortOrder) params.sortOrder = sortOrder;

        // Tìm kiếm
        const searchQuery = search || keyword;
        if (searchQuery) params.keyword = searchQuery;

        // Lọc brand - support cả string và array
        if (brand) {
            if (Array.isArray(brand)) {
                params.brand = brand.join(",");
            } else {
                params.brand = brand;
            }
        }

        // Lọc category - support cả string và array
        if (categoryId) {
            if (Array.isArray(categoryId)) {
                params.categoryId = categoryId.join(",");
            } else {
                params.categoryId = categoryId;
            }
        }

        // Lọc giá
        if (minPrice != null) params.minPrice = minPrice;
        if (maxPrice != null) params.maxPrice = maxPrice;

        // Lọc rating
        if (ratingMin != null) params.minRating = ratingMin;

        // Lọc tình trạng
        if (inStock === true || inStock === "true") params.inStock = "true";
        if (isNew === true || isNew === "true") params.isNew = "true";
        if (bestSeller === true || bestSeller === "true") params.bestSeller = "true";

        console.log('📦 ProductController.getProducts called with:', { options, params });

        // Gọi trực tiếp endpoint
        const response = await api.get('/products', { params });

        console.log('✅ Products fetched:', response.data.products?.length, 'items');

        // Backend trả về: { success, products, pagination, totalProducts, totalPages } hoặc { items, ... }
        // Chuẩn hóa dữ liệu trả về để View dễ dùng
        return {
            products: response.data.products || response.data.items || [],
            pagination: response.data.pagination || {
                totalProducts: response.data.totalProducts,
                totalPages: response.data.totalPages,
                currentPage: response.data.currentPage
            },
            total: response.data.totalProducts || response.data.total || 0,
            totalPages: response.data.totalPages || 1,
            currentPage: response.data.currentPage || response.data.page || 1
        };
    } catch (error) {
        console.error("❌ Lỗi getProducts:", error);
        throw error;
    }
};

/**
 * Tìm kiếm sản phẩm (Ưu tiên ES, fallback về thường)
 * Thay thế cho: searchProducts
 */
const searchProducts = async (keyword) => {
    try {
        if (!keyword) return [];
        const response = await api.get('/products/search', {
            params: { keyword }
        });
        return response.data.products || [];
    } catch (error) {
        console.error("Lỗi tìm kiếm sản phẩm:", error);
        return [];
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
    try {
        // Gọi endpoint riêng cho danh mục: /api/products/category/:categoryId
        const params = new URLSearchParams();
        if (options.sortBy) params.append('sortBy', options.sortBy);
        if (options.sortOrder) params.append('sortOrder', options.sortOrder);
        if (options.page) params.append('page', options.page);
        if (options.limit) params.append('limit', options.limit);

        const url = `/products/category/${categoryId}${params.toString() ? '?' + params.toString() : ''}`;
        console.log('📂 Fetching category products:', { categoryId, url, options });

        const response = await api.get(url);
        const items = response.data.products || [];

        console.log('✅ Category products fetched:', items.length, 'items');

        return {
            products: items,
            totalProducts: items.length,
            totalPages: 1,
            currentPage: 1,
            ...response.data
        };
    } catch (error) {
        console.error('❌ Error fetching category products:', error);
        return { products: [], totalProducts: 0, totalPages: 1, currentPage: 1 };
    }
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

/**
 * Lấy danh sách tất cả thương hiệu
 * Endpoint: /api/products/brands
 */
const getBrands = async () => {
    try {
        const response = await api.get('/products/brands');
        // Backend trả về { success: true, brands: [...] }
        console.log('🏷️ Brands fetched:', response.data.brands?.length);
        return response.data.brands || [];
    } catch (error) {
        console.error("Lỗi lấy danh sách thương hiệu:", error);
        return [];
    }
};

/**
 * Lấy danh sách tất cả danh mục
 * Endpoint: /api/products/categories
 */
const getCategories = async () => {
    try {
        const response = await api.get('/products/categories');
        // Backend trả về { success: true, categories: [...] }
        console.log('📂 Categories fetched:', response.data.categories?.length);
        return response.data.categories || [];
    } catch (error) {
        console.error("Lỗi lấy danh sách danh mục:", error);
        return [];
    }
};

/**
 * Thêm bình luận cho sản phẩm
 */
const addComment = async (productIdOrSlug, commentData) => {
    try {
        const response = await api.post(`/products/${productIdOrSlug}/comments`, commentData);
        return response.data;
    } catch (error) {
        console.error(`Lỗi thêm bình luận:`, error);
        throw new Error(error.response?.data?.message || "Không thể thêm bình luận");
    }
};

/**
 * Đánh giá sản phẩm
 */
const rateProduct = async (productIdOrSlug, ratingData) => {
    try {
        const response = await api.post(`/products/${productIdOrSlug}/ratings`, ratingData);
        return response.data;
    } catch (error) {
        console.error(`Lỗi đánh giá sản phẩm:`, error);
        throw new Error(error.response?.data?.message || "Không thể đánh giá sản phẩm");
    }
};

// ============================================
// HELPERS (Không gọi API)
// ============================================
function getImageUrl(src) {
    if (!src) {
        console.log('❌ No image source provided, returning placeholder');
        return "/img/default.png";
    }

    if (src.startsWith('http')) {
        if (src.includes('cloudinary.com') || src.includes('image-proxy')) {
            return src;
        }
        if (src.includes('tgdd.vn') || src.includes('cellphones.com.vn')) {
            return `${BACKEND_URL}/api/image-proxy?url=${encodeURIComponent(src)}`;
        }
        console.log('✅ Image is already a full URL:', src);
        return src;
    }

    // Sử dụng BACKEND_URL từ api.js
    const fullUrl = src.startsWith('/') ? `${BACKEND_URL}${src}` : `${BACKEND_URL}/${src}`;
    console.log('🔄 Converted relative path to full URL:', { src, BACKEND_URL, fullUrl });
    return fullUrl;
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
    getBrands,
    getCategories,
    addComment,
    rateProduct,
    getImageUrl,
    getMinPrice
};