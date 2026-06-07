// frontend/src/components/FlashSale/FlashSaleSection.jsx
// UI kiểu Shopee: 3 tabs (Đang diễn ra | Sắp tới | Ngày mai)
import React, { useState, useEffect, useCallback } from 'react';
import FlashSaleCard from './FlashSaleCard';
import FlashSaleCountdown from './FlashSaleCountdown';
import { useNavigate } from 'react-router-dom';
import api from '../../services/api';

// Time slots kiểu Shopee
const TIME_SLOTS = [
    { slot: '00:00-09:00', label: '00:00', icon: '🌙' },
    { slot: '09:00-12:00', label: '09:00', icon: '☀️' },
    { slot: '12:00-15:00', label: '12:00', icon: '🌞' },
    { slot: '15:00-18:00', label: '15:00', icon: '🌤️' },
    { slot: '18:00-21:00', label: '18:00', icon: '🌆' },
    { slot: '21:00-00:00', label: '21:00', icon: '🌃' },
];

const FlashSaleSection = () => {
    const [data, setData] = useState({ active: [], upcomingToday: [], tomorrow: [] });
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('active'); // 'active', 'upcoming', 'tomorrow'
    const [selectedSlot, setSelectedSlot] = useState(null);
    const navigate = useNavigate();

    const fetchFlashSales = useCallback(async () => {
        try {
            const { data: response } = await api.get('/flash-sales/homepage');
            console.log('🔥 Flash Sales homepage response:', response);
            
            if (response.success) {
                setData({
                    active: response.active || [],
                    upcomingToday: response.upcomingToday || [],
                    tomorrow: response.tomorrow || []
                });
                
                // Auto select tab based on available data
                if (response.active?.length > 0) {
                    setActiveTab('active');
                    setSelectedSlot(response.active[0]);
                } else if (response.upcomingToday?.length > 0) {
                    setActiveTab('upcoming');
                    setSelectedSlot(response.upcomingToday[0]);
                } else if (response.tomorrow?.length > 0) {
                    setActiveTab('tomorrow');
                    setSelectedSlot(response.tomorrow[0]);
                }
            }
        } catch (error) {
            console.error('❌ Error fetching flash sales:', error);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchFlashSales();
        // Auto refresh every minute to update status
        const interval = setInterval(fetchFlashSales, 60000);
        return () => clearInterval(interval);
    }, [fetchFlashSales]);

    // Chọn tab
    const handleTabChange = (tab) => {
        setActiveTab(tab);
        const list = tab === 'active' ? data.active : tab === 'upcoming' ? data.upcomingToday : data.tomorrow;
        setSelectedSlot(list[0] || null);
    };

    // Chọn time slot
    const handleSlotChange = (slot) => {
        setSelectedSlot(slot);
    };

    // Tính countdown target
    const getCountdownTarget = () => {
        if (!selectedSlot) return null;
        if (activeTab === 'active') {
            return { type: 'end', time: selectedSlot.endTime, label: 'Kết thúc sau' };
        }
        return { type: 'start', time: selectedSlot.startTime, label: 'Bắt đầu sau' };
    };

    // Format time slot label
    const formatTimeSlot = (slot) => {
        const found = TIME_SLOTS.find(t => t.slot === slot.timeSlot);
        return found ? `${found.icon} ${found.label}` : slot.timeSlot;
    };

    // Get current list based on tab
    const getCurrentList = () => {
        switch (activeTab) {
            case 'active': return data.active;
            case 'upcoming': return data.upcomingToday;
            case 'tomorrow': return data.tomorrow;
            default: return [];
        }
    };

    if (loading) {
        return (
            <div className="bg-gradient-to-r from-red-600 to-orange-500 rounded-lg shadow-xl p-8 mb-8">
                <div className="flex items-center justify-center gap-4">
                    <div className="animate-spin rounded-full h-8 w-8 border-4 border-white border-t-transparent"></div>
                    <span className="text-white font-bold">Đang tải Flash Sale...</span>
                </div>
            </div>
        );
    }

    // Không có flash sale nào
    const hasAnyFlashSale = data.active.length > 0 || data.upcomingToday.length > 0 || data.tomorrow.length > 0;
    
    if (!hasAnyFlashSale) {
        return (
            <div className="bg-gradient-to-r from-gray-400 to-gray-500 rounded-lg shadow-xl p-8 mb-8 text-center">
                <div className="flex items-center justify-center gap-2 mb-4">
                    <span className="text-4xl opacity-50">⚡</span>
                    <h2 className="text-3xl font-bold text-white opacity-75">FLASH SALE</h2>
                </div>
                <p className="text-white text-lg mb-4">Hiện chưa có Flash Sale nào</p>
                <p className="text-white/80 text-sm">Hãy quay lại sau để không bỏ lỡ các deal hot nhé!</p>
            </div>
        );
    }

    const countdown = getCountdownTarget();
    const currentList = getCurrentList();

    return (
        <div className="bg-slate-950 border border-red-500/10 rounded-3xl shadow-2xl overflow-hidden mb-10 relative">
            {/* Glowing accent lights */}
            <div className="absolute -top-40 -left-40 w-96 h-96 bg-red-600/10 rounded-full blur-3xl pointer-events-none" />
            <div className="absolute -bottom-40 -right-40 w-96 h-96 bg-amber-600/10 rounded-full blur-3xl pointer-events-none" />

            {/* Header với tabs kiểu Shopee */}
            <div className="bg-slate-900/80 backdrop-blur-md px-6 py-5 border-b border-white/5 relative z-10">
                <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
                    {/* Logo + Title */}
                    <div className="flex items-center gap-3">
                        <span className="text-3xl animate-bounce">⚡</span>
                        <div>
                            <h2 className="text-2xl font-black text-transparent bg-clip-text bg-gradient-to-r from-red-500 via-orange-500 to-amber-400 tracking-wider uppercase">
                                FLASH SALE
                            </h2>
                            <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest mt-0.5">🔥 Săn deal chớp nhoáng</p>
                        </div>
                    </div>

                    {/* Tabs: Đang diễn ra | Sắp tới | Ngày mai */}
                    <div className="flex bg-white/5 backdrop-blur-md rounded-2xl p-1 border border-white/10 w-full lg:w-auto">
                        <button
                            onClick={() => handleTabChange('active')}
                            className={`flex-1 lg:flex-none px-4 py-2.5 rounded-xl font-extrabold text-xs md:text-sm transition-all duration-300 whitespace-nowrap flex items-center justify-center gap-1.5 ${
                                activeTab === 'active'
                                    ? 'bg-gradient-to-r from-red-500 to-rose-600 text-white shadow-lg'
                                    : 'text-gray-400 hover:text-white hover:bg-white/5'
                            } ${data.active.length === 0 ? 'opacity-40 cursor-not-allowed' : ''}`}
                            disabled={data.active.length === 0}
                        >
                            🔴 Đang diễn ra
                            {data.active.length > 0 && (
                                <span className="bg-white/20 text-white text-[10px] px-1.5 py-0.5 rounded-md font-bold">
                                    {data.active.length}
                                </span>
                            )}
                        </button>
                        <button
                            onClick={() => handleTabChange('upcoming')}
                            className={`flex-1 lg:flex-none px-4 py-2.5 rounded-xl font-extrabold text-xs md:text-sm transition-all duration-300 whitespace-nowrap flex items-center justify-center gap-1.5 ${
                                activeTab === 'upcoming'
                                    ? 'bg-gradient-to-r from-amber-500 to-orange-500 text-white shadow-lg'
                                    : 'text-gray-400 hover:text-white hover:bg-white/5'
                            } ${data.upcomingToday.length === 0 ? 'opacity-40 cursor-not-allowed' : ''}`}
                            disabled={data.upcomingToday.length === 0}
                        >
                            ⏰ Sắp diễn ra
                            {data.upcomingToday.length > 0 && (
                                <span className="bg-white/20 text-white text-[10px] px-1.5 py-0.5 rounded-md font-bold">
                                    {data.upcomingToday.length}
                                </span>
                            )}
                        </button>
                        <button
                            onClick={() => handleTabChange('tomorrow')}
                            className={`flex-1 lg:flex-none px-4 py-2.5 rounded-xl font-extrabold text-xs md:text-sm transition-all duration-300 whitespace-nowrap flex items-center justify-center gap-1.5 ${
                                activeTab === 'tomorrow'
                                    ? 'bg-gradient-to-r from-blue-500 to-indigo-650 text-white shadow-lg'
                                    : 'text-gray-400 hover:text-white hover:bg-white/5'
                            } ${data.tomorrow.length === 0 ? 'opacity-40 cursor-not-allowed' : ''}`}
                            disabled={data.tomorrow.length === 0}
                        >
                            📅 Ngày mai
                            {data.tomorrow.length > 0 && (
                                <span className="bg-white/20 text-white text-[10px] px-1.5 py-0.5 rounded-md font-bold">
                                    {data.tomorrow.length}
                                </span>
                            )}
                        </button>
                    </div>

                    {/* Countdown + View All */}
                    <div className="flex items-center gap-4 w-full lg:w-auto justify-between lg:justify-end">
                        {countdown && selectedSlot && (
                            <div className="flex items-center gap-2">
                                <span className="text-gray-400 text-xs md:text-sm font-semibold">{countdown.label}:</span>
                                <FlashSaleCountdown 
                                    endTime={countdown.time} 
                                    onExpire={fetchFlashSales}
                                />
                            </div>
                        )}

                        {/* View All Button */}
                        <button
                            onClick={() => navigate('/flash-sale')}
                            className="bg-white/5 border border-white/10 hover:bg-white hover:text-red-600 text-white px-5 py-2.5 rounded-xl font-bold text-xs md:text-sm transition-all duration-300 shadow-md whitespace-nowrap"
                        >
                            Xem tất cả →
                        </button>
                    </div>
                </div>
            </div>

            {/* Time Slot Selector */}
            {currentList.length > 1 && (
                <div className="bg-slate-900/40 border-b border-white/5 px-6 py-3.5 relative z-10">
                    <div className="flex gap-2 overflow-x-auto pb-1">
                        {currentList.map((slot) => (
                            <button
                                key={slot._id}
                                onClick={() => handleSlotChange(slot)}
                                className={`flex items-center gap-2 px-4 py-2 rounded-xl font-bold text-xs md:text-sm whitespace-nowrap transition-all duration-300 border ${
                                    selectedSlot?._id === slot._id
                                        ? 'bg-white text-slate-950 border-white shadow-lg scale-102'
                                        : 'bg-white/5 text-gray-400 border-white/5 hover:border-white/10 hover:text-white'
                                }`}
                            >
                                <span>{formatTimeSlot(slot)}</span>
                                {slot.products?.length > 0 && (
                                    <span className={`text-[10px] px-1.5 py-0.5 rounded-md font-bold ${
                                        selectedSlot?._id === slot._id ? 'bg-red-500 text-white' : 'bg-white/10 text-gray-300'
                                    }`}>
                                        {slot.products.length}
                                    </span>
                                )}
                            </button>
                        ))}
                    </div>
                </div>
            )}

            {/* Products Grid */}
            <div className="p-6 relative z-10">
                {selectedSlot && selectedSlot.products?.length > 0 ? (
                    <>
                        {/* Flash Sale Name & Description */}
                        {selectedSlot.name && (
                            <div className="mb-6 text-center">
                                <h3 className="text-lg md:text-xl font-extrabold text-white">{selectedSlot.name}</h3>
                                {selectedSlot.description && (
                                    <p className="text-gray-400 text-xs md:text-sm mt-1">{selectedSlot.description}</p>
                                )}
                            </div>
                        )}

                        {/* Products */}
                        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
                            {selectedSlot.products.slice(0, 12).map((product) => (
                                <FlashSaleCard
                                    key={product.productId?._id || product._id}
                                    product={product}
                                    flashSale={selectedSlot}
                                    isUpcoming={activeTab !== 'active'}
                                />
                            ))}
                        </div>

                        {/* View more if has more products */}
                        {selectedSlot.products.length > 12 && (
                            <div className="text-center mt-8">
                                <button
                                    onClick={() => navigate('/flash-sale')}
                                    className="bg-white/5 hover:bg-white/10 border border-white/10 text-white px-8 py-3 rounded-2xl font-bold text-sm transition-all duration-300"
                                >
                                    Xem thêm {selectedSlot.products.length - 12} sản phẩm →
                                </button>
                            </div>
                        )}
                    </>
                ) : (
                    <div className="text-center py-12 text-gray-500">
                        <span className="text-5xl mb-4 block">📦</span>
                        <p className="text-gray-400 text-base font-semibold">Chưa có sản phẩm trong khung giờ này</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default FlashSaleSection;
