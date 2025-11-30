// src/pages/CheckoutPage.jsx
import React, { useState, useMemo, useEffect } from 'react';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import { MapPin, Truck, CreditCard, Ticket, ChevronRight, Edit2, ShieldCheck, Coins, X, Check, Plus } from 'lucide-react';
import { toast } from 'react-toastify';
import { OrderController } from '../controllers/OrderController';
import { UserController } from '../controllers/userController';
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
    const [isEditing, setIsEditing] = useState(false); // Mặc định false nếu có địa chỉ lưu sẵn

    // State Mã giảm giá & Điểm
    const [couponCode, setCouponCode] = useState('');
    const [appliedCoupon, setAppliedCoupon] = useState(null); // { code, percent }
    const [couponLoading, setCouponLoading] = useState(false);
    const [usePoints, setUsePoints] = useState(false);

    // State Địa chỉ đã lưu
    const [savedAddresses, setSavedAddresses] = useState([]);
    const [selectedAddressId, setSelectedAddressId] = useState(null);
    const [showAddressList, setShowAddressList] = useState(true);

    // State Địa chỉ
    const [address, setAddress] = useState({
        name: user?.name || "",
        phone: user?.phoneNumber || "",
        email: user?.email || "",
        fullAddress: "",
        city: "", district: "", ward: ""
    });

    // Fetch địa chỉ đã lưu khi load trang
    useEffect(() => {
        const fetchAddresses = async () => {
            if (!user) return;
            try {
                const addresses = await UserController.getShippingAddresses();
                setSavedAddresses(addresses || []);
                
                // Tự động chọn địa chỉ mặc định
                const defaultAddr = addresses?.find(a => a.isDefault);
                if (defaultAddr) {
                    selectSavedAddress(defaultAddr);
                } else if (addresses?.length > 0) {
                    selectSavedAddress(addresses[0]);
                } else {
                    // Không có địa chỉ lưu sẵn -> mở form nhập mới
                    setIsEditing(true);
                    setShowAddressList(false);
                }
            } catch (error) {
                console.error('Error fetching addresses:', error);
                setIsEditing(true);
            }
        };
        fetchAddresses();
    }, [user]);

    // Hàm chọn địa chỉ đã lưu
    const selectSavedAddress = (addr) => {
        setSelectedAddressId(addr._id);
        setAddress({
            name: addr.recipientName || user?.name || "",
            phone: addr.phoneNumber || user?.phoneNumber || "",
            email: user?.email || "",
            fullAddress: addr.street || "",
            city: addr.city || "",
            district: addr.district || "",
            ward: addr.ward || ""
        });
        setIsEditing(false);
        setShowAddressList(false);
    };

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
        // Validate Địa chỉ - cần có ít nhất tên, SĐT, và địa chỉ (city/district/ward hoặc fullAddress)
        const hasBasicInfo = address.name && address.phone;
        const hasLocation = address.city && address.district && address.ward;
        
        if (!hasBasicInfo || !hasLocation) {
            toast.warning("Vui lòng chọn hoặc nhập đầy đủ địa chỉ giao hàng!");
            if (savedAddresses.length > 0) {
                setShowAddressList(true);
            } else {
                setIsEditing(true);
            }
            return;
        }

        // Validate nếu đang ở chế độ edit hoặc chưa xác nhận
        if (isEditing || showAddressList) {
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
                    street: address.fullAddress || `${address.ward}, ${address.district}`, // Fallback nếu không có street
                    ward: address.ward,
                    district: address.district,
                    city: address.city
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
                        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                            <div className="p-4 border-b bg-gray-50 flex justify-between items-center">
                                <h3 className="font-bold text-gray-800 flex items-center gap-2">
                                    <MapPin size={18} className="text-blue-600"/> Địa chỉ giao hàng
                                </h3>
                                {savedAddresses.length > 0 && !showAddressList && !isEditing && (
                                    <button 
                                        onClick={() => setShowAddressList(true)} 
                                        className="text-blue-600 text-sm font-medium hover:underline"
                                    >
                                        Đổi địa chỉ
                                    </button>
                                )}
                            </div>

                            {/* Danh sách địa chỉ đã lưu */}
                            {showAddressList && savedAddresses.length > 0 && !isEditing && (
                                <div className="p-4 space-y-3">
                                    <p className="text-sm text-gray-600 mb-2">Chọn địa chỉ giao hàng:</p>
                                    {savedAddresses.map((addr) => (
                                        <div 
                                            key={addr._id}
                                            onClick={() => selectSavedAddress(addr)}
                                            className={`p-4 border rounded-lg cursor-pointer transition-all ${
                                                selectedAddressId === addr._id 
                                                    ? 'border-blue-500 bg-blue-50 ring-1 ring-blue-500' 
                                                    : 'hover:border-gray-400'
                                            }`}
                                        >
                                            <div className="flex justify-between items-start">
                                                <div className="flex-1">
                                                    <div className="flex items-center gap-2 mb-1">
                                                        <span className="font-bold text-gray-800">{addr.recipientName}</span>
                                                        <span className="text-gray-400">|</span>
                                                        <span className="text-gray-600">{addr.phoneNumber}</span>
                                                        {addr.isDefault && (
                                                            <span className="bg-red-100 text-red-600 text-xs px-2 py-0.5 rounded font-medium">
                                                                Mặc định
                                                            </span>
                                                        )}
                                                    </div>
                                                    <p className="text-sm text-gray-600">
                                                        {[addr.street, addr.ward, addr.district, addr.city].filter(Boolean).join(', ')}
                                                    </p>
                                                </div>
                                                {selectedAddressId === addr._id && (
                                                    <Check size={20} className="text-blue-600 flex-shrink-0" />
                                                )}
                                            </div>
                                        </div>
                                    ))}
                                    
                                    {/* Nút thêm địa chỉ mới */}
                                    <button 
                                        onClick={() => {
                                            setIsEditing(true);
                                            setShowAddressList(false);
                                            setSelectedAddressId(null);
                                            setAddress({
                                                name: user?.name || "",
                                                phone: user?.phoneNumber || "",
                                                email: user?.email || "",
                                                fullAddress: "",
                                                city: "", district: "", ward: ""
                                            });
                                        }}
                                        className="w-full p-3 border-2 border-dashed border-gray-300 rounded-lg text-gray-600 hover:border-blue-500 hover:text-blue-600 transition-colors flex items-center justify-center gap-2"
                                    >
                                        <Plus size={18} /> Thêm địa chỉ mới
                                    </button>
                                </div>
                            )}

                            {/* Form nhập địa chỉ mới */}
                            {isEditing && (
                                <div className="animate-fade-in">
                                    <AddressForm address={address} setAddress={setAddress} />
                                    <div className="flex justify-end gap-3 p-4 border-t">
                                        {savedAddresses.length > 0 && (
                                            <button 
                                                onClick={() => {
                                                    setIsEditing(false);
                                                    setShowAddressList(true);
                                                }} 
                                                className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 font-medium"
                                            >
                                                Hủy
                                            </button>
                                        )}
                                        <button 
                                            onClick={() => setIsEditing(false)} 
                                            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium"
                                        >
                                            Xác nhận địa chỉ
                                        </button>
                                    </div>
                                </div>
                            )}

                            {/* Hiển thị địa chỉ đã chọn (khi không edit và không show list) */}
                            {!isEditing && !showAddressList && address.city && (
                                <div className="p-4">
                                    <div className="flex justify-between items-start">
                                        <div>
                                            <p className="font-bold text-gray-800 flex items-center gap-2">
                                                {address.name} <span className="text-gray-400">|</span> {address.phone}
                                            </p>
                                            <p className="text-sm text-gray-600 mt-1">
                                                {[address.fullAddress, address.ward, address.district, address.city].filter(Boolean).join(', ')}
                                            </p>
                                        </div>
                                        <button 
                                            onClick={() => setIsEditing(true)} 
                                            className="text-blue-600 text-sm font-medium flex items-center gap-1 hover:underline"
                                        >
                                            <Edit2 size={14}/> Sửa
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>

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

                            <button onClick={handlePlaceOrder} disabled={loading || isEditing || showAddressList} className={`w-full mt-6 py-3.5 rounded-xl font-bold text-white text-lg shadow-lg flex items-center justify-center gap-2 transition-all ${loading || isEditing || showAddressList ? 'bg-gray-400 cursor-not-allowed' : 'bg-red-600 hover:bg-red-700 shadow-red-200'}`}>
                                {loading ? 'Đang xử lý...' : ((isEditing || showAddressList) ? 'VUI LÒNG XÁC NHẬN ĐỊA CHỈ' : 'ĐẶT HÀNG NGAY')}
                            </button>
                            {(isEditing || showAddressList) && (
                                <p className="text-xs text-center text-orange-600 mt-2">⚠️ Bạn cần xác nhận địa chỉ giao hàng trước khi đặt hàng</p>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}