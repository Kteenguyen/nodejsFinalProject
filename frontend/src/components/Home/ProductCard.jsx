// src/components/ProductCard.jsx
import React from "react";
import { Link } from "react-router-dom";
import { ProductController } from "../../controllers/productController";
import { FaCartPlus } from "react-icons/fa";
import { useCart } from "../../context/CartContext";
import { toast } from 'react-toastify';
import { motion } from 'framer-motion'; // 👈 1. IMPORT MOTION

// 2. ĐỊNH NGHĨA ANIMATION CHO ITEM
const itemVariants = {
    hidden: { opacity: 0, y: 20 }, // Bắt đầu mờ và ở dưới 20px
    show: { opacity: 1, y: 0 },    // Hiện ra và trượt về vị trí 0
};

const ProductCard = ({ product }) => {
    const { addItem } = useCart();

    if (!product) return null;

    const firstImg = product?.images?.[0];
    const imageUrl = ProductController.getImageUrl(firstImg);
    const minPrice = ProductController.getMinPrice(product);
    const detailId = product?.productId || product?._id || "";

    const handleAddToCart = (e) => {
        // ... (logic handleAddToCart giữ nguyên) ...
        e.preventDefault();
        e.stopPropagation();
        const defaultVariant = product.variants?.[0];
        if (!defaultVariant) {
            toast.error("Sản phẩm này tạm thời hết hàng.");
            return;
        }
        const itemToAdd = {
            productId: detailId,
            productName: product.productName,
            image: imageUrl,
            variantId: defaultVariant.variantId,
            variantName: defaultVariant.name,
            price: defaultVariant.price,
            stock: defaultVariant.stock,
            quantity: 1
        };
        try {
            addItem(itemToAdd);
            toast.success(`${product.productName} đã được thêm vào giỏ!`);
        } catch (error) {
            toast.error(error.message || "Không thể thêm vào giỏ hàng.");
        }
    };

    return (
        // 3. BỌC TOÀN BỘ CARD BẰNG MOTION.DIV
        <motion.div variants={itemVariants}>
            <div className="bg-white rounded-xl shadow-xl overflow-hidden transform transition duration-500 hover:scale-105">

                <Link to={`/products/${detailId}`} className="block relative h-40 overflow-hidden">
                    <img
                        src={imageUrl}
                        alt={product?.productName || "Product image"}
                        className="w-full h-full object-contain transition-transform duration-300"
                        loading="lazy"
                    />
                </Link>

                <div className="p-6">

                    <Link
                        to={`/products/${detailId}`}
                        className="text-lg font-semibold text-gray-800 line-clamp-2 hover:text-indigo-600 transition-colors"
                        title={product?.productName}
                    >
                        {product?.productName || "Sản phẩm không tên"}
                    </Link>

                    {product?.brand && (
                        <p className="text-sm text-gray-500 mt-0.5">{product.brand}</p>
                    )}

                    {(product.rating > 0) && (
                        <div className="flex items-center mt-1">
                            <svg className="h-5 w-5 text-yellow-500 mr-1" fill="currentColor" viewBox="0 0 20 20">
                                <path
                                    d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z">
                                </path>
                            </svg>
                            <span className="text-gray-600 ml-1 text-sm">
                                {product.rating.toFixed(1)} ({product.numReviews || 0} đánh giá)
                            </span>
                        </div>
                    )}

                    <div className="flex justify-between items-center mt-2">
                        <p className="text-lg font-bold text-red-600">
                            {minPrice.toLocaleString()} ₫
                        </p>

                        <button
                            onClick={handleAddToCart}
                            className="p-2 bg-indigo-600 text-white rounded-full shadow-md 
                                    transform transition-all duration-300 ease-in-out
                                    hover:bg-indigo-700 hover:scale-110 
                                    focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-opacity-75"
                            aria-label="Thêm vào giỏ hàng"
                            title="Thêm vào giỏ hàng"
                        >
                            <FaCartPlus className="h-5 w-5" />
                        </button>
                    </div>
                </div>
            </div>
        </motion.div>
    );
};

export default ProductCard;