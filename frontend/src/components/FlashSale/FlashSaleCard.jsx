// frontend/src/components/FlashSale/FlashSaleCard.jsx
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { getImageUrl } from '../../services/api';

const FlashSaleCard = ({ product, flashSale, isUpcoming = false }) => {
    const navigate = useNavigate();
    
    const soldPercent = Math.round((product.soldCount / product.totalStock) * 100);
    const remaining = product.totalStock - product.soldCount;

    return (
        <div 
            className={`bg-white rounded-2xl shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 cursor-pointer overflow-hidden border border-gray-100 group flex flex-col justify-between ${isUpcoming ? 'opacity-90' : ''}`}
            onClick={() => navigate(`/products/${product.productId?._id || product.productId}`)}
        >
            {/* Image Container */}
            <div className="relative overflow-hidden bg-gray-50/50 aspect-square">
                <img 
                    src={getImageUrl(product.productId?.images?.[0])}
                    alt={product.productId?.productName || 'Product'}
                    className={`w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 ${isUpcoming ? 'grayscale-[20%]' : ''}`}
                />
                
                {/* Flash Sale Badge */}
                <div className={`absolute top-3 left-3 text-white text-[10px] font-bold px-2 py-1 rounded-lg flex items-center gap-1 shadow-sm ${isUpcoming ? 'bg-amber-500/90 backdrop-blur-sm' : 'bg-red-500/95 backdrop-blur-sm'}`}>
                    <span>{isUpcoming ? '⏰' : '⚡'}</span>
                    <span>{isUpcoming ? 'SẮP MỞ BÁN' : 'FLASH SALE'}</span>
                </div>

                {/* Discount Badge */}
                <div className="absolute top-3 right-3 bg-amber-400 text-red-700 text-sm font-extrabold px-2 py-0.5 rounded-lg shadow-sm">
                    -{product.discountPercent || 0}%
                </div>

                {/* Stock Badge */}
                {!isUpcoming && remaining <= 10 && remaining > 0 && (
                    <div className="absolute bottom-3 left-3 bg-red-600/90 backdrop-blur-sm text-white text-[10px] font-extrabold px-2.5 py-1 rounded-lg animate-pulse shadow-sm">
                        CHỈ CÒN {remaining}
                    </div>
                )}
            </div>

            {/* Product Info */}
            <div className="p-4 flex-1 flex flex-col justify-between gap-3">
                <div>
                    {/* Product Name */}
                    <h3 className="text-sm font-bold text-gray-800 line-clamp-2 min-h-[40px] mb-2 group-hover:text-red-500 transition-colors duration-200">
                        {product.productId?.productName || 'Sản phẩm'}
                    </h3>

                    {/* Price Section */}
                    <div className="mb-2">
                        <div className="flex items-baseline gap-1.5 flex-wrap">
                            <span className="text-base md:text-lg font-black text-red-600">
                                {(product.flashPrice || 0).toLocaleString('vi-VN')}₫
                            </span>
                            <span className="text-xs text-gray-400 line-through">
                                {(product.originalPrice || 0).toLocaleString('vi-VN')}₫
                            </span>
                        </div>
                    </div>
                </div>

                <div>
                    {/* Progress Bar */}
                    <div className="mb-3">
                        <div className="flex justify-between text-[10px] text-gray-500 mb-1 font-semibold">
                            <span>{isUpcoming ? `Số lượng: ${product.totalStock}` : `Đã bán ${product.soldCount}/${product.totalStock}`}</span>
                            {!isUpcoming && <span>{soldPercent}%</span>}
                        </div>
                        <div className="w-full bg-gray-100 rounded-full h-2 overflow-hidden border border-gray-200/50">
                            <div 
                                className={`h-full transition-all duration-500 rounded-full ${
                                    isUpcoming 
                                        ? 'bg-gradient-to-r from-amber-400 to-amber-500' 
                                        : 'bg-gradient-to-r from-red-500 to-orange-500'
                                }`}
                                style={{ width: isUpcoming ? '100%' : `${Math.min(soldPercent, 100)}%` }}
                            />
                        </div>
                    </div>

                    {/* Action Button */}
                    {isUpcoming ? (
                        <button 
                            className="w-full bg-amber-50 text-amber-600 border border-amber-200/60 font-bold text-xs py-2 rounded-xl cursor-default transition-all duration-300"
                            disabled
                        >
                            ⏰ SẮP MỞ BÁN
                        </button>
                    ) : remaining > 0 ? (
                        <button 
                            className="w-full bg-gradient-to-r from-red-500 to-rose-600 text-white font-extrabold text-xs py-2.5 rounded-xl hover:from-red-600 hover:to-rose-700 transition-all duration-300 shadow-sm shadow-red-200"
                            onClick={(e) => {
                                e.stopPropagation();
                                navigate(`/products/${product.productId?._id || product.productId}`);
                            }}
                        >
                            MUA NGAY
                        </button>
                    ) : (
                        <button 
                            className="w-full bg-gray-100 text-gray-400 font-bold text-xs py-2 rounded-xl cursor-not-allowed border border-gray-200/50"
                            disabled
                        >
                            HẾT HÀNG
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
};

export default FlashSaleCard;
