// frontend/src/components/FlashSale/FlashSaleSection.jsx
import React, { useState, useEffect } from 'react';
import FlashSaleCard from './FlashSaleCard';
import FlashSaleCountdown from './FlashSaleCountdown';
import { useNavigate } from 'react-router-dom';

const FlashSaleSection = () => {
    const [flashSales, setFlashSales] = useState([]);
    const [loading, setLoading] = useState(true);
    const [activeSlot, setActiveSlot] = useState(null);
    const navigate = useNavigate();

    useEffect(() => {
        fetchActiveFlashSales();
    }, []);

    const fetchActiveFlashSales = async () => {
        try {
            const response = await fetch('http://localhost:3001/api/flash-sales/active');
            const data = await response.json();
            
            if (data.success && data.data.length > 0) {
                setFlashSales(data.data);
                setActiveSlot(data.data[0]); // Show first active sale
            }
        } catch (error) {
            console.error('Error fetching flash sales:', error);
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="bg-white rounded-lg shadow-md p-8 text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600 mx-auto"></div>
                <p className="mt-4 text-gray-600">Đang tải Flash Sale...</p>
            </div>
        );
    }

    // Hiển thị placeholder nếu chưa có flash sale (để user biết tính năng này tồn tại)
    if (!activeSlot || activeSlot.products.length === 0) {
        return (
            <div className="bg-gradient-to-r from-gray-400 to-gray-500 rounded-lg shadow-xl p-8 mb-8 text-center">
                <div className="flex items-center justify-center gap-2 mb-4">
                    <span className="text-4xl opacity-50">⚡</span>
                    <h2 className="text-3xl font-bold text-white opacity-75">FLASH SALE</h2>
                </div>
                <p className="text-white text-lg mb-4">Hiện chưa có Flash Sale nào đang diễn ra</p>
                <p className="text-white/80 text-sm">Hãy quay lại sau để không bỏ lỡ các deal hot nhé!</p>
            </div>
        );
    }

    return (
        <div className="bg-gradient-to-r from-red-600 to-orange-500 rounded-lg shadow-xl p-6 mb-8">
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-4">
                    <div className="flex items-center gap-2">
                        <span className="text-3xl">⚡</span>
                        <h2 className="text-3xl font-bold text-white">FLASH SALE</h2>
                    </div>
                    <FlashSaleCountdown endTime={activeSlot.endTime} />
                </div>
                
                <button
                    onClick={() => navigate('/flash-sale')}
                    className="bg-white text-red-600 px-6 py-2 rounded-full font-bold hover:bg-gray-100 transition-colors"
                >
                    Xem tất cả →
                </button>
            </div>

            {/* Time Slots (if multiple) */}
            {flashSales.length > 1 && (
                <div className="flex gap-3 mb-6 overflow-x-auto pb-2">
                    {flashSales.map((sale) => (
                        <button
                            key={sale._id}
                            onClick={() => setActiveSlot(sale)}
                            className={`px-4 py-2 rounded-lg font-bold whitespace-nowrap transition-colors ${
                                activeSlot._id === sale._id
                                    ? 'bg-white text-red-600'
                                    : 'bg-red-700 text-white hover:bg-red-800'
                            }`}
                        >
                            {sale.timeSlot}
                        </button>
                    ))}
                </div>
            )}

            {/* Products Grid */}
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-4">
                {activeSlot.products.slice(0, 6).map((product) => (
                    <FlashSaleCard
                        key={product.productId._id}
                        product={product}
                        flashSale={activeSlot}
                    />
                ))}
            </div>

            {/* Show banner if has description */}
            {activeSlot.description && (
                <div className="mt-4 bg-white/10 backdrop-blur-sm rounded-lg p-4">
                    <p className="text-white text-center">{activeSlot.description}</p>
                </div>
            )}
        </div>
    );
};

export default FlashSaleSection;
