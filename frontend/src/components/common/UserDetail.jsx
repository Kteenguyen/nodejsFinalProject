// frontend/src/components/common/UserDetail.jsx
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
// (Import đầy đủ icon)
import { X, Save, UserX, PackageCheck, Truck, ArchiveRestore, ClipboardList, Calendar, ChevronLeft, ChevronRight } from 'lucide-react';
import { toast } from 'react-toastify';
import { UserController } from '../../controllers/userController';
import { useAuth } from '../../context/AuthContext';
import Flatpickr from 'react-flatpickr';
// (CSS của Flatpickr đã import ở index.js)

// === CÁC HÀM HELPER (calculateAge, formatVND, formatDate, formatOrderStatusBadges) ===
const calculateAge = (dobString) => {
    if (!dobString) return 'N/A';
    try {
        const birthDate = new Date(dobString.replace(/-/g, '/'));
        if (isNaN(birthDate.getTime())) return 'N/A';
        const today = new Date();
        let age = today.getFullYear() - birthDate.getFullYear();
        const m = today.getMonth() - birthDate.getMonth();
        if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
            age--;
        }
        return age;
    } catch (e) { return 'N/A'; }
};
const formatVND = (amount) => {
    if (typeof amount !== 'number') return '0 ₫';
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount);
};
const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    try {
        const [y, m, d] = dateString.split('-');
        return `${d}/${m}/${y}`;
    } catch (e) { return 'N/A'; }
};
const formatOrderStatusBadges = (stats) => {
    if (!stats || (stats.delivered === 0 && stats.processing === 0 && stats.returned === 0)) {
        return <span className="text-text-secondary text-xs">Chưa có đơn</span>;
    }
    return (
        <div className="flex flex-col gap-1.5 p-3 bg-gray-100 rounded-md">
            {stats.delivered > 0 && (
                <span className="flex items-center text-xs font-medium px-2 py-0.5 rounded-full bg-green-100 text-green-700">
                    <PackageCheck size={14} className="mr-1.5" />
                    Đã giao: <strong className="ml-1">{stats.delivered}</strong>
                </span>
            )}
            {stats.processing > 0 && (
                <span className="flex items-center text-xs font-medium px-2 py-0.5 rounded-full bg-yellow-100 text-yellow-700">
                    <Truck size={14} className="mr-1.5" />
                    Đang xử lý: <strong className="ml-1">{stats.processing}</strong>
                </span>
            )}
            {stats.returned > 0 && (
                <span className="flex items-center text-xs font-medium px-2 py-0.5 rounded-full bg-red-100 text-red-700">
                    <ArchiveRestore size={14} className="mr-1.5" />
                    Đã hoàn/Hủy: <strong className="ml-1">{stats.returned}</strong>
                </span>
            )}
        </div>
    );
};
// ===================================

const UserDetail = ({ user, onClose, onSave, context, onNext, onPrev }) => {

    // (Phân quyền: Admin sửa tất cả, User sửa cột 1)
    const isReadOnlyPersonal = false;
    const isReadOnlySystem = context === 'user';

    // (State, setUser, useEffect parse ngày an toàn...)
    const [formData, setFormData] = useState(user || {});
    const { setUser } = useAuth();
    useEffect(() => {
        if (user) {
            const safeId = user._id || user.userId || 'defaultId';

            const parseDateOfBirth = (dob) => {
                if (!dob) return '';
                const yyyyMmDdRegex = /^\d{4}-\d{2}-\d{2}$/;
                if (typeof dob === 'string' && yyyyMmDdRegex.test(dob)) {
                    return dob;
                }
                try {
                    const dateObj = new Date(dob);
                    if (isNaN(dateObj.getTime())) {
                        return '';
                    }
                    return dateObj.toISOString().split('T')[0];
                } catch (e) {
                    return '';
                }
            };

            setFormData({
                ...user,
                dateOfBirth: parseDateOfBirth(user.dateOfBirth),
                loyaltyPoints: user.loyaltyPoints || 0,
                orderStats: user.orderStats || {
                    delivered: (safeId.slice(-1).charCodeAt(0) % 3 + 1),
                    processing: (safeId.slice(-2).charCodeAt(0) % 2),
                    returned: (safeId.slice(-3).charCodeAt(0) % 2),
                    // totalSpent: (safeId.slice(-2).charCodeAt(0) % 500) * 10000 + 150000,
                    // firstOrderDate: `2024-0${safeId.slice(-1).charCodeAt(0) % 9 + 1}-10`, 
                    // lastOrderDate: `2025-10-${safeId.slice(-1).charCodeAt(0) % 20 + 10}`
                }
            });
        }
    }, [user]);
    // ===================================

    if (!user) return null;

    // === CÁC HÀM XỬ LÝ (handleChange, handleDateChange) ===
    const handleChange = (e) => {
        const { name, value, type } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: type === 'number' ? Number(value) : value
        }));
    };

    const handleDateChange = (dateArray) => {
        const date = dateArray[0];
        setFormData(prev => ({
            ...prev,
            dateOfBirth: date ? date.toISOString().split('T')[0] : ''
        }));
    };

    // === (Hàm Save - GỌI API TRỰC TIẾP) ===
    const handleSave = async (e) => {
        e.preventDefault();

        try {
            if (context === 'user') {
                // === CONTEXT NGƯỜI DÙNG (/profile) ===
                const formDataInstance = new FormData();
                Object.keys(formData).forEach(key => {
                    if (key !== 'avatar' && formData[key] !== null && formData[key] !== undefined) {
                        formDataInstance.append(key, formData[key]);
                    }
                });

                const response = await UserController.updateProfile(formDataInstance);

                if (response.success && response.user) {
                    toast.success("Cập nhật hồ sơ thành công!");
                    setUser(response.user); // 👈 Cập nhật context
                    if (onSave) onSave(response.user);
                }

            } else if (context === 'admin') {
                // === CONTEXT ADMIN (/admin/users) ===
                const response = await UserController.adminUpdateUser(user._id, formData);

                if (response.success && response.user) {
                    toast.success(`Đã cập nhật ${response.user.name}`);
                    if (onSave) onSave(response.user); // Báo cho Users.jsx cập nhật list
                    if (onClose) onClose(); // Tự động đóng Modal
                }
            }

        } catch (error) {
            console.error("Lỗi khi lưu UserDetail:", error);
            // (toast.error đã được controller xử lý)
        }
    };
    // ==============================

    // === (Hàm Ban - GỌI API TRỰC TIẾP) ===
    const handleAdminBan = async (e) => {
        e.stopPropagation();

        const confirmBan = window.confirm(
            `Bạn có chắc muốn ${formData.isBanned ? 'GỠ CẤM' : 'CẤM'} người dùng [${formData.name}]?`
        );
        if (!confirmBan) return;

        try {
            const data = await UserController.banUser(formData._id);
            toast.success(data.message); // 👈 TOAST

            if (onSave) {
                // Báo cho Users.jsx cập nhật list VÀ data trong modal
                onSave({ ...formData, isBanned: data.isBanned });
            }
            if (onClose) onClose(); // Tự động đóng

        } catch (error) {
            console.error("Lỗi khi cấm user:", error);
            // (toast.error đã được controller xử lý)
        }
    };
    // ==============================

    const handleViewOrders = () => { /* ... (Code 'view order' của bạn) ... */ };
    // ===================================

    // === (Animation "Nảy ra") ===
    const backdropVariants = {
        hidden: { opacity: 0 },
        visible: { opacity: 1, transition: { duration: 0.3 } },
        exit: { opacity: 0, transition: { duration: 0.2 } }
    };

    const modalVariants = {
        hidden: { opacity: 0, scale: 0.9, y: 50 },
        visible: {
            opacity: 1, scale: 1, y: 0,
            transition: { type: "spring", stiffness: 400, damping: 30 }
        },
        exit: {
            opacity: 0, scale: 0.9, y: 50,
            transition: { duration: 0.2 }
        }
    };
    // ===================================

    // == Nội dung Form (Layout 3 cột) ==
    const FormContent = () => (
        <form onSubmit={handleSave} className="grid grid-cols-1 md:grid-cols-3 gap-x-6 gap-y-4">

            {/* === CỘT 1: THÔNG TIN CÁ NHÂN (Admin/User sửa) === */}
            <fieldset className="md:col-span-1 space-y-4">
                <legend className="text-lg font-medium text-text-primary mb-2">Thông tin cá nhân</legend>

                {/* (Input Họ tên) */}
                <div>
                    <label className="label-field">Họ tên</label>
                    <input
                        type="text" name="name"
                        value={formData.name || ''}
                        onChange={handleChange}
                        className={isReadOnlyPersonal ? "input-field-disabled" : "input-field"}
                        readOnly={isReadOnlyPersonal}
                    />
                </div>
                {/* (Input Email) */}
                <div>
                    <label className="label-field">Email</label>
                    <input
                        type="email" name="email"
                        value={formData.email || ''}
                        onChange={handleChange}
                        className={isReadOnlyPersonal ? "input-field-disabled" : "input-field"}
                        readOnly={isReadOnlyPersonal}
                    />
                </div>
                {/* (Input SĐT) */}
                <div>
                    <label className="label-field">Số điện thoại</label>
                    <input
                        type="tel" name="phoneNumber"
                        value={formData.phoneNumber || ''}
                        onChange={handleChange}
                        className={isReadOnlyPersonal ? "input-field-disabled" : "input-field"}
                        readOnly={isReadOnlyPersonal}
                    />
                </div>

                {/* (Flatpickr cho Ngày sinh) */}
                <div>
                    <label className="label-field">Ngày sinh</label>
                    <div className="relative">
                        <Flatpickr
                            value={formData.dateOfBirth}
                            onChange={handleDateChange}
                            options={{
                                altInput: true,
                                altFormat: "d/m/Y",
                                dateFormat: "Y-m-d",
                                placeholder: "Chọn ngày sinh",
                                disableMobile: true,
                                animate: true
                            }}
                            className={isReadOnlyPersonal ? "input-field-disabled w-full pl-10" : "input-field w-full pl-10"}
                            disabled={isReadOnlyPersonal}
                        />
                        <Calendar
                            size={18}
                            className="absolute left-3 top-1/2 -translate-y-1/2 text-text-secondary pointer-events-none"
                        />
                    </div>
                </div>

                {/* (Tuổi - Admin thấy) */}
                {context === 'admin' && (
                    <div>
                        <label className="label-field">Tuổi (Tự tính)</label>
                        <input
                            type="text"
                            value={calculateAge(formData.dateOfBirth)}
                            className="input-field-disabled"
                            readOnly
                        />
                    </div>
                )}
            </fieldset>

            {/* === CỘT 2: QUÀ CỦA BẠN / HỆ THỐNG === */}
            <fieldset className="md:col-span-1 space-y-4">
                <legend className="text-lg font-medium text-text-primary mb-2">
                    {context === 'user' ? "Quà của bạn" : "Thông tin hệ thống"}
                </legend>

                {/* (Phân quyền Điểm) */}
                <div>
                    <label className="label-field">Điểm tích lũy</label>
                    <input
                        type="number" name="loyaltyPoints"
                        value={formData.loyaltyPoints || 0}
                        onChange={handleChange}
                        className={isReadOnlySystem ? "input-field-disabled" : "input-field"}
                        readOnly={isReadOnlySystem}
                    />
                </div>

                {/* (Phân quyền Role - Chỉ Admin thấy) */}
                {context === 'admin' && (
                    <div>
                        <label className="label-field">Vai trò (Role)</label>
                        <select
                            name="role"
                            value={formData.role || 'user'}
                            onChange={handleChange}
                            className="input-field"
                            disabled={isReadOnlySystem}
                        >
                            <option value="user">User</option>
                            <option value="staff">Staff</option>
                            <option value="admin">Admin</option>
                        </select>
                    </div>
                )}
            </fieldset>

            {/* === CỘT 3: THÔNG TIN ĐƠN HÀNG (DEMO) === */}
            <fieldset className="md:col-span-1 space-y-4">
                <legend className="text-lg font-medium text-text-primary mb-2">Thông tin đơn hàng</legend>

                <div>
                    <label className="label-field">Tình trạng (Demo)</label>
                    {formatOrderStatusBadges(formData.orderStats)}
                </div>


                <div>
                    <label className="label-field">Lịch sử đơn hàng</label>
                    <button
                        type="button"
                        onClick={handleViewOrders}
                        className="btn-secondary-profile w-full justify-center"
                    >
                        <ClipboardList size={18} className="mr-2" />
                        Xem lịch sử đơn hàng
                    </button>
                </div>
            </fieldset>

        </form>
    );

    // === NÚT BẤM (Tách biệt Trái/Phải) ===
    const ActionButtons = () => (
        <div className="mt-6 flex flex-col md:flex-row md:justify-between gap-3">

            {/* Nhóm bên trái (Nút Đóng) */}
            <div>
                {onClose && (
                    <button
                        type="button"
                        onClick={onClose}
                        className="btn-secondary-profile w-full md:w-auto"
                    >
                        Đóng
                    </button>
                )}
            </div>

            {/* Nhóm bên phải (Cấm, Lưu) */}
            <div className="flex flex-col-reverse md:flex-row gap-3">
                <motion.button
                    type="button"
                    onClick={handleSave}
                    className="btn-accent-profile w-full md:w-auto"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                >
                    <Save size={18} className="mr-2" />
                    Lưu thay đổi
                </motion.button>

                {context === 'admin' && (
                    <motion.button
                        type="button"
                        onClick={handleAdminBan}
                        className="flex items-center justify-center gap-2 w-full md:w-auto px-4 py-2 bg-red-100 text-red-700 rounded-lg hover:bg-red-200"
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                    >
                        <UserX size={18} />
                        {formData.isBanned ? "Gỡ cấm" : "Cấm người dùng"}
                    </motion.button>
                )}
            </div>
        </div>
    );
    // =====================================

    // === RENDER (Đã chính xác) ===
    // (Render Div cho 'user')
    if (context === 'user') {
        return (
            <div className="bg-surface rounded-lg shadow-md p-6">
                <FormContent />
                <ActionButtons />
            </div>
        );
    }

    // (Render Modal (Cửa sổ nổi) cho 'admin')
    return (
        <AnimatePresence>
            {user && (
                <motion.div
                    className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50"
                    variants={backdropVariants}
                    initial="hidden"
                    animate="visible"
                    exit="hidden"
                    onClick={onClose}
                >

                    {/* === MODAL NỘI DUNG (THÊM 'key' ĐỂ CÓ HIỆU ỨNG CHUYỂN) === */}
                    <motion.div
                        key={user._id} // 👈 QUAN TRỌNG: Giúp F-Motion biết user đã đổi
                        className="bg-surface rounded-lg shadow-xl w-full max-w-5xl max-h-[90vh] overflow-y-auto relative" // 👈 Thêm 'relative'
                        variants={modalVariants}
                        initial="hidden"
                        animate="visible"
                        exit="exit"
                        onClick={(e) => e.stopPropagation()}
                    >
                        {/* === NÚT CHUYỂN TRÁI (PREV) === */}
                        {context === 'admin' && onPrev && (
                            <motion.button
                                className="absolute left-4 top-1/2 -translate-y-1/2 z-10 p-2 bg-black/20 rounded-full text-white hover:bg-black/50 transition-colors"
                                onClick={(e) => {
                                    e.stopPropagation();
                                    onPrev(); // 👈 Gọi hàm của Cha
                                }}
                                whileHover={{ scale: 1.1 }}
                                whileTap={{ scale: 0.9 }}
                                aria-label="Người dùng trước"
                            >
                                <ChevronLeft size={32} />
                            </motion.button>
                        )}
                        {/* ================================== */}

                        {/* (Header) */}
                        <div className="flex items-center justify-between p-4 border-b border-gray-200 sticky top-0 bg-surface z-0">
                            <h2 className="text-lg font-semibold text-text-primary">
                                Chi tiết Người dùng (Admin)
                            </h2>
                            <button onClick={onClose} className="text-text-secondary hover:text-accent">
                                <X size={24} />
                            </button>
                        </div>

                        {/* (Content) */}
                        <div className="p-6">
                            <FormContent />
                            <ActionButtons />
                        </div>

                        {/* === NÚT CHUYỂN PHẢI (NEXT) === */}
                        {context === 'admin' && onNext && (
                            <motion.button
                                className="absolute right-4 top-1/2 -translate-y-1/2 z-10 p-2 bg-black/20 rounded-full text-white hover:bg-black/50 transition-colors"
                                onClick={(e) => {
                                    e.stopPropagation();
                                    onNext(); // 👈 Gọi hàm của Cha
                                }}
                                whileHover={{ scale: 1.1 }}
                                whileTap={{ scale: 0.9 }}
                                aria-label="Người dùng kế tiếp"
                            >
                                <ChevronRight size={32} />
                            </motion.button>
                        )}
                        {/* =================================== */}
                    </motion.div>
                    {/* ============================= */}

                </motion.div>
            )}
        </AnimatePresence>
    );
};

export default UserDetail;