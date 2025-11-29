// src/pages/CheckoutPage.jsx
import React, { useState, useMemo } from 'react';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import { MapPin, Truck, CreditCard, Ticket, ChevronRight, Edit2, ShieldCheck, Coins, X } from 'lucide-react';
import { toast } from 'react-toastify';
import { OrderController } from '../controllers/OrderController';
import { getImageUrl } from '../services/api';

import AddressForm from '../components/checkout/AddressForm';
import PaymentMethods from '../components/checkout/PaymentMethods';

export default function CheckoutPage() {
    const { cartItems, clearCart } = useCart();
    const { user } = useAuth();
    const navigate = useNavigate();

    // --- STATE ---
    const [loading, setLoading] = useState(false);
    const [paymentMethod, setPaymentMethod] = useState('cod');
    const [shippingMethod, setShippingMethod] = useState('express');
    const [note, setNote] = useState('');
    const [isEditing, setIsEditing] = useState(true);

    // State Mã giảm giá & Điểm
    const [couponCode, setCouponCode] = useState('');
    const [appliedCoupon, setAppliedCoupon] = useState(null); // { code, percent }
    const [couponLoading, setCouponLoading] = useState(false);
    const [usePoints, setUsePoints] = useState(false);

    // State Địa chỉ
    const [address, setAddress] = useState({
        name: user?.name || "",
        phone: user?.phoneNumber || "",
        email: user?.email || "",
        fullAddress: user?.address || "",
        city: "", district: "", ward: ""
    });

    // --- TÍNH TOÁN TIỀN (Realtime) ---
    const { subTotal, shippingFee, couponDiscount, pointDiscount, finalTotal } = useMemo(() => {
        // 1. Tổng tiền hàng
        const sub = cartItems.reduce((acc, item) => acc + (Number(item.price) || 0) * (Number(item.quantity) || 1), 0);
        
        // 2. Phí ship
        const ship = shippingMethod === 'express' ? 50000 : 30000;
        
        // 3. Giảm giá Coupon (% trên tổng đơn hàng)
        let discCoupon = 0;
        if (appliedCoupon) {
            discCoupon = (sub * appliedCoupon.percent) / 100;
        }

        // Số tiền còn lại sau khi trừ Coupon (để tính giới hạn dùng điểm)
        const amountBeforePoints = sub + ship - discCoupon;

        // 4. Giảm giá Điểm thưởng (1 điểm = 1000đ)
        let discPoint = 0;
        if (usePoints && user?.loyaltyPoints > 0) {
            const maxPointValue = user.loyaltyPoints * 1000;
            // Chỉ trừ tối đa bằng số tiền còn lại (không âm tiền)
            discPoint = Math.min(maxPointValue, Math.max(0, amountBeforePoints));
        }

        // 5. Tổng kết
        const final = Math.max(0, amountBeforePoints - discPoint);
        
        return { 
            subTotal: sub, 
            shippingFee: ship, 
            couponDiscount: discCoupon,
            pointDiscount: discPoint, 
            finalTotal: final 
        };
    }, [cartItems, shippingMethod, appliedCoupon, usePoints, user]);

    // --- XỬ LÝ MÃ GIẢM GIÁ ---
    const handleApplyCoupon = async () => {
        if (!couponCode.trim()) return toast.warning("Vui lòng nhập mã!");
        setCouponLoading(true);
        try {
            // Gọi API kiểm tra mã
            const res = await OrderController.validateCoupon(couponCode, subTotal);
            if (res.valid) {
                setAppliedCoupon({ code: couponCode, percent: res.percent });
                toast.success(`Áp dụng mã thành công! Giảm ${res.percent}%`);
                setCouponCode(""); 
            }
        } catch (error) {
            toast.error(error.message);
        } finally {
            setCouponLoading(false);
        }
    };

    // --- XỬ LÝ ĐẶT HÀNG ---
    const handlePlaceOrder = async () => {
        // Validate Địa chỉ (Fix lỗi Network do thiếu trường)
        if (!address.name || !address.phone || !address.city || !address.district || !address.ward || !address.fullAddress) {
            toast.warning("Vui lòng nhập đầy đủ địa chỉ (Tỉnh, Quận, Phường)!");
            setIsEditing(true); // Mở form địa chỉ để user nhập
            return;
        }

        // Validate nếu đang ở chế độ edit
        if (isEditing) {
            toast.warning("Vui lòng xác nhận địa chỉ trước khi đặt hàng!");
            return;
        }
        
        try {
            setLoading(true);
            
            // Map items to include variantId
            const mappedItems = cartItems.map(item => ({
                productId: item.productId || item._id,
                variantId: item.variantId || item.variant?.variantId || new Date().getTime().toString(),
                name: item.name || item.productName,
                price: item.price,
                quantity: item.quantity
            }));
            
            const orderPayload = {
                items: mappedItems,
                // Map đúng tên trường Backend yêu cầu
                shippingAddress: {
                    recipientName: address.name,
                    phoneNumber: address.phone,
                    street: address.fullAddress, // Số nhà/Tên đường
                    city: address.city,
                    district: address.district,
                    ward: address.ward
                },
                // Thêm guestInfo ngay cả khi user đã login để backend có thể dùng nếu cần
                guestInfo: {
                    name: address.name,
                    email: address.email || user?.email
                },
                paymentMethod,
                shippingPrice: shippingFee,
                tax: 0, // Add tax field (0 for now, adjust if needed)
                totalPrice: Math.round(finalTotal), // Làm tròn tiền
                note,
                
                // Gửi thông tin giảm giá lên
                discount: {
                    code: appliedCoupon ? appliedCoupon.code : "",
                    amount: (couponDiscount || 0)
                },
                
                // Gửi số điểm muốn dùng (Backend sẽ trừ)
                pointsToUse: usePoints ? Math.ceil(pointDiscount / 1000) : 0
            };

            console.log('📦 Order payload:', orderPayload); // Debug log
            
            // 1. Tạo đơn hàng
            const res = await OrderController.createOrder(orderPayload);
            console.log('✅ Order response:', res); // Debug response
            
            if (res.success) {
                const newOrderId = res.order.orderId || res.order._id;
                console.log('🎉 Order created successfully, orderId:', newOrderId);
                
                // Hiển thị thông báo điểm thưởng nếu có (chỉ khi backend trả về message)
                if (res.loyalty && res.loyalty.message) {
                    toast.info(
                        `🎁 ${res.loyalty.message}`,
                        { duration: 5000 }
                    );
                }
                
                if (paymentMethod === 'banking') {
                    // Chuyển khoản ngân hàng
                    toast.success("Đặt hàng thành công!");
                    clearCart();
                    navigate(`/order-success?code=banking&orderId=${newOrderId}`);
                } else {
                    // COD
                    toast.success("Đặt hàng thành công!");
                    clearCart();
                    navigate(`/order-success?code=00&orderId=${newOrderId}`);
                }
            } else {
                toast.error("Đặt hàng thất bại: " + (res.message || "Lỗi không xác định"));
            }
        } catch (error) {
            console.error('❌ Order creation error:', error);
            const msg = error.response?.data?.message || error.message || "Lỗi kết nối server";
            toast.error("Đặt hàng thất bại: " + msg);
        } finally {
            setLoading(false);
        }
    };

    if (cartItems.length === 0) return <div className="text-center py-20 text-gray-500">Giỏ hàng trống</div>;

    return (
        <div className="bg-[#f4f6f8] min-h-screen py-8 font-sans">
            <div className="container mx-auto px-4 max-w-6xl">
                {/* Header */}
                <div className="flex items-center gap-2 text-sm text-gray-500 mb-6">
                    <Link to="/cart" className="hover:text-blue-600">Giỏ hàng</Link> <ChevronRight size={16} /> <span className="font-bold text-gray-800">Thanh toán</span>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                    {/* CỘT TRÁI */}
                    <div className="lg:col-span-7 space-y-6">
                        {/* 1. ĐỊA CHỈ */}
                        {isEditing ? (
                            <div className="animate-fade-in"><AddressForm address={address} setAddress={setAddress} />
                                <div className="flex justify-end gap-3 bg-white p-4 rounded-b-xl border-x border-b border-gray-100 -mt-6 mb-6">
                                    <button onClick={() => setIsEditing(false)} className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium">Xác nhận địa chỉ</button>
                                </div>
                            </div>
                        ) : (
                            <div className="bg-white p-6 rounded-xl shadow-sm border mb-6 flex justify-between items-center">
                                <div>
                                    <p className="font-bold text-gray-800 flex items-center gap-2"><MapPin size={18} className="text-blue-600"/> {address.name} - {address.phone}</p>
                                    <p className="text-sm text-gray-600 mt-1">{address.fullAddress}, {address.ward}, {address.district}, {address.city}</p>
                                </div>
                                <button onClick={() => setIsEditing(true)} className="text-blue-600 text-sm font-medium flex items-center gap-1 hover:underline"><Edit2 size={14}/> Thay đổi</button>
                            </div>
                        )}

                        {/* 2. VẬN CHUYỂN */}
                        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                            <h3 className="text-lg font-bold text-gray-800 flex items-center gap-2 mb-4"><Truck className="text-orange-500" size={20} /> Vận chuyển</h3>
                            <div className="flex gap-4">
                                <label className={`flex-1 border p-3 rounded-lg cursor-pointer flex items-center gap-2 ${shippingMethod==='express'?'border-blue-500 bg-blue-50 ring-1 ring-blue-500':''}`}>
                                    <input type="radio" name="ship" checked={shippingMethod==='express'} onChange={()=>setShippingMethod('express')} className="accent-blue-600"/>
                                    <div><span className="font-bold block text-sm">Hỏa tốc</span><span className="text-xs text-gray-500">50.000đ</span></div>
                                </label>
                                <label className={`flex-1 border p-3 rounded-lg cursor-pointer flex items-center gap-2 ${shippingMethod==='standard'?'border-blue-500 bg-blue-50 ring-1 ring-blue-500':''}`}>
                                    <input type="radio" name="ship" checked={shippingMethod==='standard'} onChange={()=>setShippingMethod('standard')} className="accent-blue-600"/>
                                    <div><span className="font-bold block text-sm">Tiêu chuẩn</span><span className="text-xs text-gray-500">30.000đ</span></div>
                                </label>
                            </div>
                        </div>

                        {/* 3. THANH TOÁN */}
                        <PaymentMethods method={paymentMethod} setMethod={setPaymentMethod} />
                    </div>

                    {/* CỘT PHẢI: TỔNG KẾT */}
                    <div className="lg:col-span-5">
                        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 sticky top-24">
                            <h3 className="text-lg font-bold text-gray-800 mb-4 border-b pb-2">Đơn hàng ({cartItems.length} món)</h3>
                            
                            <div className="space-y-3 mb-6 max-h-48 overflow-y-auto pr-1 custom-scrollbar">
                                {cartItems.map((item, idx) => (
                                    <div key={idx} className="flex gap-3">
                                        <div className="w-14 h-14 border rounded bg-gray-50 flex-shrink-0 p-1"><img src={getImageUrl(item.image || item.images?.[0])} alt="" className="w-full h-full object-contain" /></div>
                                        <div className="flex-1"><h4 className="text-sm font-medium text-gray-800 line-clamp-1">{item.productName}</h4><div className="flex justify-between items-center mt-1"><span className="text-xs text-gray-500">x{item.quantity}</span><span className="text-sm font-bold text-gray-900">{(Number(item.price)*item.quantity).toLocaleString()}đ</span></div></div>
                                    </div>
                                ))}
                            </div>

                            {/* --- A. MÃ GIẢM GIÁ --- */}
                            <div className="mb-4">
                                {appliedCoupon ? (
                                    <div className="flex justify-between items-center bg-green-50 p-3 rounded-lg border border-green-200">
                                        <span className="text-sm font-bold text-green-700 flex items-center gap-1"><Ticket size={16}/> Mã: {appliedCoupon.code} (-{appliedCoupon.percent}%)</span>
                                        <button onClick={() => setAppliedCoupon(null)} className="text-xs text-red-500 font-medium hover:underline flex items-center gap-1"><X size={12}/> Bỏ mã</button>
                                    </div>
                                ) : (
                                    <div className="flex gap-2">
                                        <div className="relative flex-1">
                                            <Ticket className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                                            <input type="text" placeholder="Nhập mã giảm giá" className="w-full pl-9 pr-3 py-2 border rounded-lg text-sm outline-none focus:border-blue-500" value={couponCode} onChange={e=>setCouponCode(e.target.value.toUpperCase())} />
                                        </div>
                                        <button onClick={handleApplyCoupon} disabled={couponLoading} className="px-4 py-2 bg-gray-800 text-white text-sm font-bold rounded-lg hover:bg-gray-700 disabled:opacity-50">{couponLoading ? "..." : "Áp dụng"}</button>
                                    </div>
                                )}
                            </div>

                            {/* --- B. ĐIỂM THƯỞNG --- */}
                            {user && (
                                <div className={`mb-4 p-3 rounded-lg border ${user.loyaltyPoints > 0 ? 'bg-yellow-50 border-yellow-200' : 'bg-gray-50 border-gray-200'}`}>
                                    <div className="flex items-center justify-between mb-2">
                                        <span className="text-sm font-bold text-yellow-800 flex items-center gap-1">
                                            <Coins size={16}/> Điểm tích lũy
                                        </span>
                                        <span className="text-sm font-medium text-yellow-700">
                                            {user.loyaltyPoints || 0} điểm
                                        </span>
                                    </div>
                                    {user.loyaltyPoints > 0 ? (
                                        <label className="flex items-center gap-2 cursor-pointer select-none">
                                            <input type="checkbox" checked={usePoints} onChange={(e) => setUsePoints(e.target.checked)} className="rounded accent-yellow-600 w-4 h-4 cursor-pointer" />
                                            <span className="text-sm text-gray-700">Dùng điểm thanh toán (-{Math.min(user.loyaltyPoints * 1000, subTotal + shippingFee - couponDiscount).toLocaleString()}đ)</span>
                                        </label>
                                    ) : (
                                        <p className="text-xs text-gray-500">
                                            💡 Mua hàng để tích điểm! Bạn sẽ nhận 10% giá trị đơn hàng thành điểm thưởng.
                                        </p>
                                    )}
                                </div>
                            )}

                            {/* TỔNG KẾT */}
                            <div className="border-t pt-4 space-y-2 text-sm text-gray-600">
                                <div className="flex justify-between"><span>Tạm tính</span><span>{subTotal.toLocaleString()}đ</span></div>
                                <div className="flex justify-between"><span>Phí vận chuyển</span><span>{shippingFee.toLocaleString()}đ</span></div>
                                {couponDiscount > 0 && <div className="flex justify-between text-green-600"><span>Mã giảm giá</span><span>-{couponDiscount.toLocaleString()}đ</span></div>}
                                {pointDiscount > 0 && <div className="flex justify-between text-yellow-600 font-bold"><span>Điểm thưởng</span><span>-{pointDiscount.toLocaleString()}đ</span></div>}
                                <div className="flex justify-between text-lg font-bold text-red-600 pt-3 border-t mt-2"><span>Tổng cộng</span><span>{finalTotal.toLocaleString()}đ</span></div>
                            </div>

                            <button onClick={handlePlaceOrder} disabled={loading || isEditing} className={`w-full mt-6 py-3.5 rounded-xl font-bold text-white text-lg shadow-lg flex items-center justify-center gap-2 transition-all ${loading || isEditing ? 'bg-gray-400 cursor-not-allowed' : 'bg-red-600 hover:bg-red-700 shadow-red-200'}`}>
                                {loading ? 'Đang xử lý...' : (isEditing ? 'VUI LÒNG XÁC NHẬN ĐỊA CHỈ' : 'ĐẶT HÀNG NGAY')}
                            </button>
                            {isEditing && (
                                <p className="text-xs text-center text-orange-600 mt-2">⚠️ Bạn cần xác nhận địa chỉ giao hàng trước khi đặt hàng</p>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}