// frontend/src/components/common/UserDetail.jsx
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Save, UserX, PackageCheck, Truck, ArchiveRestore, ClipboardList } from 'lucide-react';
import { toast } from 'react-toastify';
import { UserController } from '../../controllers/userController'; 
import { useAuth } from '../../context/AuthContext'; 

// === IMPORT LỊCH MỚI ===
import DatePicker from 'react-datepicker';
// (CSS đã được import ở index.js)
// =========================

// === 1. HÀM HELPER BỊ THIẾU (SỬA LỖI TẠI ĐÂY) ===
const calculateAge = (dobString) => {
    if (!dobString) return 'N/A';
    try {
        const birthDate = new Date(dobString.replace(/-/g, '/')); // (replace để tránh lỗi timezone)
        const today = new Date();
        let age = today.getFullYear() - birthDate.getFullYear();
        const m = today.getMonth() - birthDate.getMonth();
        if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
            age--;
        }
        return age;
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

const UserDetail = ({ user, onClose, onSave, context }) => {
    
    // === PHÂN QUYỀN SỬA ===
    const isReadOnlyPersonal = context === 'admin';
    const isReadOnlySystem = context === 'user';
    // ========================
    
    // State để lưu trữ form
    const [formData, setFormData] = useState(user || {});

    // useEffect (Đã sửa lỗi crash 'slice')
    useEffect(() => {
        if (user) {
            const safeId = user._id || user.userId || 'defaultId'; 
            setFormData({
                ...user,
                dateOfBirth: user.dateOfBirth ? new Date(user.dateOfBirth).toISOString().split('T')[0] : '',
                loyaltyPoints: user.loyaltyPoints || 0, 
                orderStats: user.orderStats || { 
                    delivered: (safeId.slice(-1).charCodeAt(0) % 3 + 1), 
                    processing: (safeId.slice(-2).charCodeAt(0) % 2), 
                    returned: 0 
                } 
            });
        }
    }, [user]);

    if (!user) return null;

    // === CÁC HÀM XỬ LÝ ===
    const handleChange = (e) => {
        const { name, value, type } = e.target;
        setFormData(prev => ({ 
            ...prev, 
            [name]: type === 'number' ? Number(value) : value 
        }));
    };
    
    // Hàm xử lý riêng cho DatePicker
    const handleDateChange = (date) => {
        setFormData(prev => ({
            ...prev,
            dateOfBirth: date ? date.toISOString().split('T')[0] : '' // Lưu lại dạng YYYY-MM-DD
        }));
    };

    const handleSave = async (e) => {
        e.preventDefault();
        try {
            if (context === 'admin') {
                toast.info(`(UI) Admin đã cập nhật ${formData.name}`);
            } else if (context === 'user') {
                toast.success("Cập nhật hồ sơ thành công!");
            }
            if (onSave) onSave(formData); 
            if (onClose) onClose(); 
        } catch (error) {
            toast.error("Lỗi khi cập nhật.");
        }
    };
    
    const handleAdminBan = (e) => {
        e.stopPropagation();
        toast.error(`Chức năng cấm [${user.name}] chưa được cài đặt!`);
        if (onClose) onClose(); 
    };
    
    const handleViewOrders = () => {
         toast.info("Chức năng 'Danh sách đơn hàng' chưa phát triển.");
    };
    // ===================================

    // == Cấu hình Animation cho Modal ==
    const backdropVariants = { hidden: { opacity: 0 }, visible: { opacity: 1 } };
    const modalVariants = {
        hidden: { opacity: 0, scale: 0.9 },
        visible: { opacity: 1, scale: 1, transition: { type: 'spring', stiffness: 300, damping: 25 } },
        exit: { opacity: 0, scale: 0.9, transition: { duration: 0.2 } }
    };

    // == Nội dung Form (Layout 3 cột) ==
    const FormContent = () => (
        <form onSubmit={handleSave} className="grid grid-cols-1 md:grid-cols-3 gap-x-6 gap-y-4">
            
            {/* === CỘT 1: THÔNG TIN CÁ NHÂN (USER SỬA) === */}
            <fieldset className="md:col-span-1 space-y-4">
                <legend className="text-lg font-medium text-text-primary mb-2">Thông tin cá nhân</legend>
                
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
                
                {/* === NÂNG CẤP LỊCH === */}
                <div>
                    <label className="label-field">Ngày sinh</label>
                    <DatePicker
                        selected={formData.dateOfBirth ? new Date(formData.dateOfBirth.replace(/-/g, '/')) : null}
                        onChange={handleDateChange}
                        className={isReadOnlyPersonal ? "input-field-disabled" : "input-field"}
                        readOnly={isReadOnlyPersonal}
                        dateFormat="dd/MM/yyyy"
                        placeholderText="Chọn ngày sinh"
                        showYearDropdown
                        scrollableYearDropdown
                        yearDropdownItemNumber={100}
                        dropdownMode="select"
                    />
                </div>
                {/* ===================== */}

                 <div>
                    <label className="label-field">Tuổi (Tự tính)</label>
                    <input 
                        type="text" 
                        value={calculateAge(formData.dateOfBirth)} // 👈 LỖI XẢY RA Ở ĐÂY
                        className="input-field-disabled"
                        readOnly
                    />
                </div>
            </fieldset>

            {/* === CỘT 2: THÔNG TIN HỆ THỐNG (ADMIN SỬA) === */}
            <fieldset className="md:col-span-1 space-y-4">
                <legend className="text-lg font-medium text-text-primary mb-2">Thông tin hệ thống</legend>

                {/* === CẬP NHẬT ĐIỂM TÍCH LŨY === */}
                <div>
                    <label className="label-field">Điểm tích lũy</label>
                    {context === 'admin' ? (
                        <input 
                            type="number" name="loyaltyPoints"
                            value={formData.loyaltyPoints || 0}
                            onChange={handleChange}
                            className="input-field" 
                            readOnly={false}
                        />
                    ) : (
                        <div className="mt-1 block w-full px-3 py-2 bg-gray-100 rounded-md text-text-primary font-medium">
                            {formData.loyaltyPoints || 0}
                        </div>
                    )}
                </div>
                {/* ============================== */}
                
                {/* === CẬP NHẬT ROLE (ẨN CHO USER) === */}
                {context === 'admin' && (
                    <div>
                        <label className="label-field">Vai trò (Role)</label>
                        <select
                            name="role"
                            value={formData.role || 'user'}
                            onChange={handleChange}
                            className="input-field"
                            disabled={false}
                        >
                            <option value="user">User</option>
                            <option value="staff">Staff</option>
                            <option value="admin">Admin</option>
                        </select>
                    </div>
                )}
                {/* ============================== */}

            </fieldset>

            {/* === CỘT 3: THÔNG TIN ĐƠN HÀNG (CHỈ XEM) === */}
            <fieldset className="md:col-span-1 space-y-4">
                 <legend className="text-lg font-medium text-text-primary mb-2">Thông tin đơn hàng</legend>

                 <div>
                    <label className="label-field">Tình trạng đơn hàng (Chỉ xem)</label>
                    {formatOrderStatusBadges(formData.orderStats)}
                </div>

                <div>
                    <label className="label-field">Danh sách đơn hàng (Chỉ xem)</label>
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

    // === NÚT BẤM (Giữ nguyên) ===
    const ActionButtons = () => (
        <div className="mt-6 flex flex-col md:flex-row gap-3">
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
                    Cấm người dùng
                </motion.button>
            )}
            
            {onClose && (
                <button
                    type="button"
                    onClick={onClose}
                    className="btn-secondary-profile w-full md:w-auto md:ml-auto" 
                >
                    Đóng
                </button>
            )}
        </div>
    );

    // === RENDER (Giữ nguyên) ===
    // Nếu là 'user', render trực tiếp (cho trang Profile)
    if (context === 'user') {
        return (
            <div className="bg-surface rounded-lg shadow-md p-6">
                <FormContent />
                <ActionButtons />
            </div>
        );
    }

    // Nếu là 'admin', render Modal
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
                    <motion.div
                        className="bg-surface rounded-lg shadow-xl w-full max-w-5xl max-h-[90vh] overflow-y-auto" // (max-w-5xl cho 3 cột)
                        variants={modalVariants}
                        exit="exit"
                        onClick={(e) => e.stopPropagation()} 
                    >
                        <div className="flex items-center justify-between p-4 border-b border-gray-200">
                            <h2 className="text-lg font-semibold text-text-primary">
                                Chi tiết Người dùng (Admin)
                            </h2>
                            <button onClick={onClose} className="text-text-secondary hover:text-accent">
                                <X size={24} />
                            </button>
                        </div>
                        
                        <div className="p-6">
                            <FormContent />
                            <ActionButtons />
                        </div>
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    );
};

export default UserDetail;