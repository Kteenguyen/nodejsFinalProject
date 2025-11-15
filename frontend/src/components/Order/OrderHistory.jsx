// src/components/common/OrderHistory.jsx
import React from 'react';
import { motion } from 'framer-motion';
import { PackageCheck, Truck, ArchiveRestore, ClipboardList } from 'lucide-react';

// Helper formats riêng cho đơn hàng
const formatVND = (amount) => {
    if (typeof amount !== 'number') return '0 ₫';
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount);
};

const formatDate = (dateString) => {
    if (!dateString) return '';
    return new Date(dateString).toLocaleDateString('vi-VN', {
        day: '2-digit', month: '2-digit', year: 'numeric',
        hour: '2-digit', minute: '2-digit'
    });
};

const formatOrderStatusBadges = (stats) => {
    if (!stats) return null;
    const config = {
        pending: { color: 'bg-yellow-100 text-yellow-700', icon: <ClipboardList size={14} />, label: 'Chờ xử lý' },
        processing: { color: 'bg-blue-100 text-blue-700', icon: <PackageCheck size={14} />, label: 'Đang xử lý' },
        shipping: { color: 'bg-purple-100 text-purple-700', icon: <Truck size={14} />, label: 'Đang giao' },
        delivered: { color: 'bg-green-100 text-green-700', icon: <ArchiveRestore size={14} />, label: 'Hoàn tất' },
        cancelled: { color: 'bg-red-100 text-red-700', icon: <ClipboardList size={14} />, label: 'Đã hủy' },
    };

    const status = stats[stats.length - 1]?.status || 'pending';
    const style = config[status] || config.pending;

    return (
        <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium ${style.color}`}>
            {style.icon}
            {style.label}
        </span>
    );
};

const OrderHistory = ({ orders, isLoading }) => {
    return (
        <div className="space-y-4">
            <h3 className="text-lg font-semibold text-text-primary border-l-4 border-accent pl-3">
                Lịch sử đơn hàng
            </h3>

            {isLoading ? (
                <div className="text-center py-8 text-text-secondary">Đang tải đơn hàng...</div>
            ) : orders?.length > 0 ? (
                <div className="space-y-3 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
                    {orders.map((order) => (
                        <motion.div
                            key={order._id}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="p-4 rounded-lg border border-gray-100 bg-gray-50 hover:bg-white hover:shadow-md transition-all duration-200"
                        >
                            <div className="flex justify-between items-start mb-2">
                                <div>
                                    <div className="font-medium text-text-primary">
                                        #{order._id.slice(-6).toUpperCase()}
                                    </div>
                                    <div className="text-xs text-text-secondary mt-1">
                                        {formatDate(order.createdAt)}
                                    </div>
                                </div>
                                {formatOrderStatusBadges(order.orderStatus)}
                            </div>
                            <div className="flex justify-between items-end pt-2 border-t border-gray-200">
                                <span className="text-sm text-text-secondary">
                                    {order.products?.length || 0} sản phẩm
                                </span>
                                <span className="font-bold text-accent">
                                    {formatVND(order.totalAmount)}
                                </span>
                            </div>
                        </motion.div>
                    ))}
                </div>
            ) : (
                <div className="text-center py-8 bg-gray-50 rounded-lg border border-dashed border-gray-300">
                    <ClipboardList className="mx-auto h-10 w-10 text-gray-400 mb-2" />
                    <p className="text-text-secondary">Chưa có đơn hàng nào</p>
                </div>
            )}
        </div>
    );
};

export default OrderHistory;