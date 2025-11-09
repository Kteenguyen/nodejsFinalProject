// frontend/src/components/Profile/ProfileInfo.jsx
import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { UserController } from '../../controllers/userController';
import { FiCamera } from "react-icons/fi"; // Thêm icon camera cho đẹp
import { motion } from 'framer-motion';
import { toast } from 'react-toastify';
const ProfileInfo = ({ user }) => {
    const { login } = useAuth();

    // === THAY ĐỔI 1: Tách state ===
    // State cho các trường text
    const [formData, setFormData] = useState({
        name: user.name || '',
        phoneNumber: user.phoneNumber || '',
        dateOfBirth: user.dateOfBirth ? user.dateOfBirth.split('T')[0] : '',
        // Xóa 'avatar' khỏi đây
    });

    // State riêng cho file avatar (giống Register.jsx)
    const [avatarFile, setAvatarFile] = useState(null);
    // State cho ảnh xem trước (lấy ảnh hiện tại của user làm mặc định)
    const [avatarPreview, setAvatarPreview] = useState(user.avatar || 'https://via.placeholder.com/100');
    // =============================

    // Lấy hạng thành viên (từ logic trước)
    const membershipTier = user.membershipTier || 'Đồng';

    // Hàm xử lý cho các trường text
    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    // === THÊM MỚI 2: Hàm xử lý upload ảnh (giống Register.jsx) ===
    const handleAvatarChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setAvatarFile(file); // Lưu file
            // Tạo link xem trước
            const reader = new FileReader();
            reader.onloadend = () => {
                setAvatarPreview(reader.result);
            };
            reader.readAsDataURL(file);
        }
    };
    // ====================================================

    // === THAY ĐỔI 3: Cập nhật handleSubmit để gửi FormData ===
    const handleSubmit = async (e) => {
        e.preventDefault();

        const data = new FormData();
        data.append('name', formData.name);
        data.append('phoneNumber', formData.phoneNumber);
        data.append('dateOfBirth', formData.dateOfBirth);
        if (avatarFile) {
            data.append('avatar', avatarFile);
        }

        try {
            const updatedUser = await UserController.updateProfile(data);

            if (updatedUser) {
                login(updatedUser); // Cập nhật context
                setAvatarFile(null);
                // === THÊM MỚI: Thông báo thành công ===
                toast.success("Cập nhật hồ sơ thành công!");
            }
        } catch (error) {
            // === SỬA LẠI: Thông báo lỗi ===
            console.error("Lỗi khi cập nhật hồ sơ:", error);
            toast.error(error.message || "Có lỗi xảy ra khi cập nhật.");
        }
    };
    // =======================================================

    return (
        <div>
            <h2 className="text-2xl font-semibold mb-4 text-text-primary">Hồ sơ cá nhân</h2>

            <form onSubmit={handleSubmit} className="space-y-4">

                {/* === THAY ĐỔI 4: GIAO DIỆN UPLOAD AVATAR (Giống Register.jsx) === */}
                <div className="flex justify-center mb-4">
                    <label
                        htmlFor="avatar-upload"
                        className="relative cursor-pointer group"
                        title="Đổi ảnh đại diện"
                    >
                        <img
                            src={avatarPreview} // Dùng state xem trước
                            alt="Avatar"
                            className="w-24 h-24 rounded-full object-cover border-2 border-gray-300"
                        />
                        <div className="absolute inset-0 w-full h-full bg-black bg-opacity-30 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                            <FiCamera className="text-white w-6 h-6" />
                        </div>
                    </label>
                    <input
                        type="file"
                        id="avatar-upload"
                        accept="image/*" // Chỉ chấp nhận file ảnh
                        onChange={handleAvatarChange}
                        className="hidden" // Ẩn input đi
                    />
                </div>
                {/* ======================================================== */}

                <div>
                    <label className="block text-sm font-medium text-text-secondary">Email</label>
                    <input
                        type="email"
                        value={user.email}
                        disabled
                        className="input-field-disabled"
                    />
                </div>

                {/* (Giữ nguyên) Thông tin điểm và hạng */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-text-secondary">Điểm tích lũy</label>
                        <input
                            type="text"
                            value={user.loyaltyPoints || 0}
                            disabled
                            className="input-field-disabled"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-text-secondary">Hạng thành viên</label>
                        <input
                            type="text"
                            value={membershipTier}
                            disabled
                            className="input-field-disabled"
                        />
                    </div>
                </div>

                {/* (Giữ nguyên) Các trường text */}
                <div>
                    <label htmlFor="name" className="block text-sm font-medium text-text-secondary">Họ và Tên</label>
                    <input
                        type="text" id="name" name="name"
                        value={formData.name} onChange={handleChange}
                        className="input-field"
                    />
                </div>
                <div>
                    <label htmlFor="phoneNumber" className="block text-sm font-medium text-text-secondary">Số điện thoại</label>
                    <input
                        type="tel" id="phoneNumber" name="phoneNumber"
                        value={formData.phoneNumber} onChange={handleChange}
                        className="input-field"
                    />
                </div>
                <div>
                    <label htmlFor="dateOfBirth" className="block text-sm font-medium text-text-secondary">Ngày sinh</label>
                    <input
                        type="date" id="dateOfBirth" name="dateOfBirth"
                        value={formData.dateOfBirth} onChange={handleChange}
                        className="input-field"
                    />
                </div>
                <div>
                    <motion.button
                        type="submit"
                        className="btn-accent-profile" // Class này từ index.css
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                    >
                        Lưu thay đổi
                    </motion.button>
                </div>
            </form>
        </div>
    );
};
export default ProfileInfo;