// frontend/src/pages/ProductsPage.jsx

// 1. FIX LỖI: IMPORT ĐẦY ĐỦ CÁC HOOKS VÀ MODULES
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'react-toastify';
import { FaBoxOpen } from 'react-icons/fa';

// 2. REFACTOR: IMPORT CONTROLLER
import { ProductController } from '../controllers/productController'; 

// 3. FIX LỖI: SỬA ĐƯỜNG DẪN IMPORT PRODUCTCARD
// (Nếu ProductCard của fen nằm ở 'components/Home/ProductCard' thì dùng đường dẫn đó)
import ProductCard from '../components/Home/ProductCard'; 

const ProductsPage = () => {
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const productsPerPage = 12; // Số sản phẩm mỗi trang

    useEffect(() => {
        const fetchProducts = async () => {
            setLoading(true);
            setError(null);
            try {
                // 4. REFACTOR: SỬ DỤNG CONTROLLER ĐỂ GỌI API
                const data = await ProductController.getProducts({
                    page: currentPage,
                    limit: productsPerPage
                });
                
                setProducts(data.products || []); // Đảm bảo products là mảng
                setTotalPages(data.totalPages || 1); // Đảm bảo totalPages là số

            } catch (err) {
                console.error("Lỗi khi tải sản phẩm:", err);
                setError("Không thể tải sản phẩm. Vui lòng thử lại sau.");
                toast.error("Lỗi khi tải sản phẩm.");
            } finally {
                setLoading(false);
            }
        };

        fetchProducts();
    }, [currentPage]); // Chạy lại khi trang thay đổi

    const handlePageChange = (page) => {
        setCurrentPage(page);
        window.scrollTo({ top: 0, behavior: 'smooth' }); // Cuộn lên đầu trang
    };

    if (loading) {
        return <div className="text-center p-10 text-lg font-semibold">Đang tải sản phẩm...</div>;
    }

    if (error) {
        return <div className="text-center p-10 text-red-600 font-semibold">{error}</div>;
    }

    if (products.length === 0) {
        return (
            <motion.div 
                className="flex flex-col items-center justify-center min-h-[60vh] text-center p-4"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
            >
                <FaBoxOpen className="text-8xl text-gray-300 mb-6" />
                <h1 className="text-3xl font-bold text-gray-800 mb-2">Không tìm thấy sản phẩm nào</h1>
                <p className="text-gray-500 mb-6">Có vẻ như cửa hàng chưa có sản phẩm nào được hiển thị.</p>
            </motion.div>
        );
    }

    return (
        <motion.div 
            className="container mx-auto p-4 md:p-8"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
        >
            <h1 className="text-3xl font-bold mb-6 text-gray-800">Tất cả sản phẩm</h1>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                <AnimatePresence>
                    {products.map((product) => (
                        <motion.div
                            key={product._id || product.productId} // Dùng key ổn định
                            layout // Thêm layout prop để animate mượt khi phân trang
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.9 }}
                            transition={{ duration: 0.3 }}
                        >
                            <ProductCard product={product} />
                        </motion.div>
                    ))}
                </AnimatePresence>
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
                <div className="flex justify-center items-center space-x-2 mt-10">
                    <button
                        onClick={() => handlePageChange(currentPage - 1)}
                        disabled={currentPage === 1}
                        className="px-4 py-2 bg-gray-300 text-gray-700 rounded-lg disabled:opacity-50 hover:bg-gray-400 transition"
                    >
                        Trước
                    </button>
                    {[...Array(totalPages)].map((_, index) => (
                        <button
                            key={index + 1}
                            onClick={() => handlePageChange(index + 1)}
                            className={`px-4 py-2 rounded-lg ${
                                currentPage === index + 1
                                    ? 'bg-indigo-600 text-white'
                                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                            } transition`}
                        >
                            {index + 1}
                        </button>
                    ))}
                    <button
                        onClick={() => handlePageChange(currentPage + 1)}
                        disabled={currentPage === totalPages}
                        className="px-4 py-2 bg-gray-300 text-gray-700 rounded-lg disabled:opacity-50 hover:bg-gray-400 transition"
                    >
                        Sau
                    </button>
                </div>
            )}
        </motion.div>
    );
};

export default ProductsPage;