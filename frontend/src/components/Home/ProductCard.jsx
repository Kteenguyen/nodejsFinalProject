// src/components/ProductCard.jsx
import React from "react"; 
import { Link } from "react-router-dom";
import { ProductController } from "../../controllers/productController"; // Import controller

const ProductCard = ({ product }) => {
    // Kiểm tra an toàn cho trường hợp product không tồn tại
    if (!product) return null; 

    // Sử dụng hàm helpers từ ProductController
    const firstImg = product?.images?.[0];
    const imageUrl = ProductController.getImageUrl(firstImg);
    const minPrice = ProductController.getMinPrice(product);

    // Sử dụng _id hoặc productId tùy thuộc vào cấu trúc dữ liệu của bạn
    const detailId = product?.productId || product?._id || "";

    return (
        <div className="border rounded-lg p-4 shadow-sm hover:shadow-md transition-shadow duration-200 bg-white">
            <Link to={`/products/${detailId}`} className="block relative h-40 overflow-hidden rounded-md group">
                <img
                    src={imageUrl}
                    alt={product?.productName || "Product image"}
                    className="w-full h-full object-contain group-hover:scale-105 transition-transform duration-300"
                    loading="lazy" 
                />
            </Link>

            <div className="mt-3">
                <Link
                    to={`/products/${detailId}`}
                    className="text-md font-semibold text-gray-800 line-clamp-2 hover:text-indigo-600 transition-colors"
                    title={product?.productName}
                >
                    {product?.productName || "Sản phẩm không tên"}
                </Link>

                {product?.brand && (
                    <p className="text-sm text-gray-500 mt-0.5">{product.brand}</p>
                )}

                <p className="text-lg font-bold text-red-600 mt-2">
                    {minPrice.toLocaleString()} ₫
                </p>
            </div>
            {/* Bạn có thể thêm nút "Thêm vào giỏ hàng" hoặc các hành động khác ở đây */}
        </div>
    );
};

export default ProductCard;