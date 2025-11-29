// frontend/src/pages/OrderDetailPage.jsx
import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { OrderController } from '../controllers/OrderController';
import { ArrowLeft, MapPin, CreditCard, Package, Truck, Calendar, DollarSign } from 'lucide-react';
import { getImageUrl } from '../services/api';

const OrderDetailPage = () => {
    const { id } = useParams(); // Lấy orderId từ URL
    const [order, setOrder] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchOrderDetail = async () => {
            try {
                // Gọi API lấy chi tiết đơn hàng
                const data = await OrderController.getOrderDetail(id);
                setOrder(data);
            } catch (err) {
                setError("Không tìm thấy đơn hàng hoặc bạn không có quyền xem.");
            } finally {
                setLoading(false);
            }
        };
        fetchOrderDetail();
    }, [id]);

    if (loading) return <div className="min-h-screen flex items-center justify-center">Đang tải chi tiết đơn hàng...</div>;
    if (error) return <div className="min-h-screen flex items-center justify-center text-red-500">{error}</div>;
    if (!order) return null;

    // Helpers format
    const fmtVND = (n) => new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(n || 0);
    const formatDate = (d) => new Date(d).toLocaleString('vi-VN');

    // Màu trạng thái
    const getStatusColor = (st) => {
        const map = {
            'Delivered': 'bg-green-100 text-green-700',
            'Shipping': 'bg-purple-100 text-purple-700',
            'Cancelled': 'bg-red-100 text-red-700',
            'Pending': 'bg-yellow-100 text-yellow-700'
        };
        return map[st] || 'bg-gray-100 text-gray-700';
    };

    return (
        <div className="min-h-screen bg-gray-50 py-8 px-4">
            <div className="max-w-4xl mx-auto">
                {/* Header: Nút back & Title */}
                <div className="flex items-center gap-4 mb-6">
                    <Link to="/profile" className="p-2 bg-white rounded-full shadow-sm hover:bg-gray-100 text-gray-600">
                        <ArrowLeft size={20} />
                    </Link>
                    <div>
                        <h1 className="text-2xl font-bold text-gray-800">Chi tiết đơn hàng</h1>
                        <p className="text-sm text-gray-500">Mã đơn: <span className="font-mono font-bold text-blue-600">#{order.orderId || order._id}</span></p>
                    </div>
                </div>

                {/* Thông tin chính */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                    {/* Cột 1: Thông tin người nhận */}
                    <div className="bg-white p-5 rounded-xl shadow-sm border border-gray-100">
                        <h3 className="font-bold text-gray-800 mb-3 flex items-center gap-2">
                            <MapPin size={18} className="text-blue-500" /> Địa chỉ nhận hàng
                        </h3>
                        <div className="text-sm text-gray-600 space-y-1">
                            <p className="font-semibold text-gray-800">{order.shippingAddress?.recipientName || order.guestInfo?.name}</p>
                            <p>{order.shippingAddress?.phoneNumber || order.guestInfo?.phone}</p>
                            <p>{order.shippingAddress?.street || order.shippingAddress?.address}</p>
                            <p>{order.shippingAddress?.ward && `${order.shippingAddress.ward}, `}
                               {order.shippingAddress?.district && `${order.shippingAddress.district}, `}
                               {order.shippingAddress?.city}</p>
                        </div>
                    </div>

                    {/* Cột 2: Trạng thái & Thanh toán */}
                    <div className="bg-white p-5 rounded-xl shadow-sm border border-gray-100">
                        <h3 className="font-bold text-gray-800 mb-3 flex items-center gap-2">
                            <Truck size={18} className="text-purple-500" /> Thông tin vận chuyển
                        </h3>
                        <div className="space-y-3">
                            <div>
                                <span className={`px-3 py-1 rounded-full text-xs font-bold ${getStatusColor(order.status)}`}>
                                    {order.status === 'Delivered' ? 'Giao thành công' : order.status}
                                </span>
                            </div>
                            <div className="text-sm text-gray-600">
                                <p className="flex items-center gap-2"><Calendar size={14}/> Đặt lúc: {formatDate(order.createdAt)}</p>
                                {order.paidAt && <p className="flex items-center gap-2 text-green-600"><DollarSign size={14}/> Đã thanh toán: {formatDate(order.paidAt)}</p>}
                            </div>
                        </div>
                    </div>

                    {/* Cột 3: Phương thức thanh toán */}
                    <div className="bg-white p-5 rounded-xl shadow-sm border border-gray-100">
                        <h3 className="font-bold text-gray-800 mb-3 flex items-center gap-2">
                            <CreditCard size={18} className="text-orange-500" /> Thanh toán
                        </h3>
                        <p className="text-sm text-gray-600 uppercase font-semibold">
                            {order.paymentMethod === 'cod' ? 'Thanh toán khi nhận hàng (COD)' : order.paymentMethod}
                        </p>
                        <p className={`text-sm mt-2 font-medium ${order.isPaid ? 'text-green-600' : 'text-orange-600'}`}>
                            {order.isPaid ? 'Đã thanh toán' : 'Chưa thanh toán'}
                        </p>
                    </div>
                </div>

                {/* Danh sách sản phẩm */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden mb-6">
                    <div className="p-4 border-b border-gray-100 bg-gray-50 font-bold text-gray-700 flex items-center gap-2">
                        <Package size={18} /> Danh sách sản phẩm
                    </div>
                    <div className="divide-y divide-gray-100">
                        {order.items?.map((item, index) => {
                             // Xử lý ảnh: item có thể lưu sẵn image hoặc phải tự lấy placeholder
                             const itemImage = getImageUrl(item.image || item.images?.[0] || '/img/placeholder.png');
                             
                             return (
                                <div key={index} className="p-4 flex gap-4 items-center">
                                    <div className="w-16 h-16 bg-gray-50 rounded border border-gray-200 flex-shrink-0">
                                        <img src={itemImage} alt={item.name} className="w-full h-full object-contain p-1" />
                                    </div>
                                    <div className="flex-1">
                                        <h4 className="font-medium text-gray-800 line-clamp-2">{item.name}</h4>
                                        <p className="text-sm text-gray-500">Phân loại: {item.variantName || 'Mặc định'}</p>
                                        <p className="text-sm text-gray-500">x{item.quantity}</p>
                                    </div>
                                    <div className="text-right">
                                        <p className="font-bold text-gray-800">{fmtVND(item.price)}</p>
                                        <p className="text-xs text-gray-500">Tổng: {fmtVND(item.price * item.quantity)}</p>
                                    </div>
                                </div>
                             )
                        })}
                    </div>
                </div>

                {/* Điểm thưởng */}
                {order.loyaltyPoints && order.loyaltyPoints.pointsEarned > 0 && (
                    <div className="bg-gradient-to-br from-yellow-50 via-orange-50 to-red-50 rounded-xl shadow-sm border border-yellow-200 p-5 mb-6">
                        <h3 className="font-bold text-gray-800 mb-3 flex items-center gap-2">
                            <span className="text-2xl">🎁</span> Điểm thưởng
                        </h3>
                        <div className="space-y-3">
                            <div className="flex justify-between items-center">
                                <span className="text-sm text-gray-700">Điểm sẽ nhận từ đơn hàng này:</span>
                                <span className="font-bold text-2xl text-green-600">+{order.loyaltyPoints.pointsEarned} điểm</span>
                            </div>
                            <div className="mt-3 pt-3 border-t border-yellow-200">
                                <p className="text-xs text-gray-600 text-center">
                                    Giá trị: {(order.loyaltyPoints.pointsEarned * 1000).toLocaleString()}đ (1 điểm = 1.000đ)
                                </p>
                            </div>
                            {order.status === 'Delivered' && order.isPaid ? (
                                <div className="mt-3 bg-green-50 border border-green-200 rounded-lg p-3">
                                    <p className="text-xs text-green-700 text-center font-medium">
                                        ✅ Điểm đã được cộng vào tài khoản của bạn!
                                    </p>
                                </div>
                            ) : (
                                <div className="mt-3 bg-orange-50 border border-orange-200 rounded-lg p-3">
                                    <p className="text-xs text-orange-700 text-center font-medium">
                                        ⏳ Điểm sẽ được cộng sau khi đơn hàng được giao thành công
                                    </p>
                                </div>
                            )}
                        </div>
                    </div>
                )}

                {/* Tổng kết tiền */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
                    <div className="flex justify-end">
                        <div className="w-full md:w-1/3 space-y-2">
                            <div className="flex justify-between text-sm text-gray-600">
                                <span>Tạm tính:</span>
                                <span>{fmtVND(order.subTotal)}</span>
                            </div>
                            <div className="flex justify-between text-sm text-gray-600">
                                <span>Phí vận chuyển:</span>
                                <span>{fmtVND(order.shippingPrice)}</span>
                            </div>
                            {order.tax > 0 && (
                                <div className="flex justify-between text-sm text-gray-600">
                                    <span>Thuế:</span>
                                    <span>{fmtVND(order.tax)}</span>
                                </div>
                            )}
                            {order.discount?.amount > 0 && (
                                <div className="flex justify-between text-sm text-green-600">
                                    <span>Giảm giá:</span>
                                    <span>-{fmtVND(order.discount.amount)}</span>
                                </div>
                            )}
                            <div className="border-t border-gray-100 pt-2 mt-2 flex justify-between items-center">
                                <span className="font-bold text-gray-800">Tổng cộng:</span>
                                <span className="font-bold text-xl text-blue-600">{fmtVND(order.totalPrice)}</span>
                            </div>
                        </div>
                    </div>
                </div>

            </div>
        </div>
    );
};

export default OrderDetailPage;