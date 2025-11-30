// frontend/src/components/FlashSale/FlashSaleCard.jsx
import React from 'react';
import { useNavigate } from 'react-router-dom';
import FlashSaleCountdown from './FlashSaleCountdown';

const FlashSaleCard = ({ product, flashSale }) => {
    const navigate = useNavigate();
    
    const soldPercent = Math.round((product.soldCount / product.totalStock) * 100);
    const remaining = product.totalStock - product.soldCount;

    return (
        <div 
            className="bg-white rounded-lg shadow-md hover:shadow-xl transition-shadow cursor-pointer overflow-hidden group"
            onClick={() => navigate(`/products/${product.productId._id}`)}
        >
            {/* Image Container */}
            <div className="relative overflow-hidden">
                <img 
                    src={product.productId.images?.[0] || '/img/default.png'}
                    alt={product.productId.productName}
                    className="w-full h-48 object-cover group-hover:scale-110 transition-transform duration-300"
                />
                
                {/* Flash Sale Badge */}
                <div className="absolute top-2 left-2 bg-red-600 text-white text-xs font-bold px-2 py-1 rounded flex items-center gap-1">
                    <span>🔥</span>
                    <span>FLASH SALE</span>
                </div>

                {/* Discount Badge */}
                <div className="absolute top-2 right-2 bg-yellow-400 text-red-700 text-lg font-bold px-2 py-1 rounded">
                    -{product.discountPercent}%
                </div>

                {/* Stock Badge */}
                {remaining <= 10 && remaining > 0 && (
                    <div className="absolute bottom-2 left-2 bg-orange-500 text-white text-xs font-bold px-2 py-1 rounded animate-pulse">
                        CHỈ CÒN {remaining}
                    </div>
                )}
            </div>

            {/* Product Info */}
            <div className="p-4">
                {/* Product Name */}
                <h3 className="text-sm font-medium text-gray-800 line-clamp-2 h-10 mb-2">
                    {product.productId.productName}
                </h3>

                {/* Price Section */}
                <div className="mb-3">
                    <div className="flex items-center gap-2">
                        <span className="text-2xl font-bold text-red-600">
                            {product.flashPrice.toLocaleString('vi-VN')}₫
                        </span>
                    </div>
                    <div className="flex items-center gap-2 mt-1">
                        <span className="text-sm text-gray-400 line-through">
                            {product.originalPrice.toLocaleString('vi-VN')}₫
                        </span>
                    </div>
                </div>

                {/* Progress Bar */}
                <div className="mb-3">
                    <div className="flex justify-between text-xs text-gray-600 mb-1">
                        <span>Đã bán {product.soldCount}/{product.totalStock}</span>
                        <span>{soldPercent}%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-4 overflow-hidden">
                        <div 
                            className="h-full bg-gradient-to-r from-red-500 to-orange-500 transition-all duration-300 flex items-center justify-center text-white text-xs font-bold"
                            style={{ width: `${Math.min(soldPercent, 100)}%` }}
                        >
                            {soldPercent > 20 && `${soldPercent}%`}
                        </div>
                    </div>
                </div>

                {/* Action Button */}
                {remaining > 0 ? (
                    <button 
                        className="w-full bg-red-600 hover:bg-red-700 text-white font-bold py-2 rounded transition-colors"
                        onClick={(e) => {
                            e.stopPropagation();
                            navigate(`/products/${product.productId._id}`);
                        }}
                    >
                        MUA NGAY
                    </button>
                ) : (
                    <button 
                        className="w-full bg-gray-400 text-white font-bold py-2 rounded cursor-not-allowed"
                        disabled
                    >
                        HẾT HÀNG
                    </button>
                )}
            </div>
        </div>
    );
};

export default FlashSaleCard;
