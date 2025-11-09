// frontend/src/components/Profile/ChangePassword.jsx
import React, { useState } from 'react';
import { UserController } from '../../controllers/userController';
// === THÊM MỚI ===
import { motion } from 'framer-motion';
import { toast } from 'react-toastify';
// =================

const ChangePassword = () => {
    const [formData, setFormData] = useState({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
    });
    const [isLoading, setIsLoading] = useState(false); // Thêm state loading

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (formData.newPassword !== formData.confirmPassword) {
            toast.error("Mật khẩu mới không khớp!"); // 👈 DÙNG TOAST
            return;
        }

        setIsLoading(true); // Bắt đầu loading
        try {
            // (Giả sử bạn có hàm changePassword trong UserController)
            const response = await UserController.changeMyPassword(formData); // Dùng hàm từ file của bạn

            toast.success(response.message || "Đổi mật khẩu thành công!"); // 👈 DÙNG TOAST
            setFormData({ currentPassword: '', newPassword: '', confirmPassword: '' });
        } catch (error) {
            console.error("Lỗi đổi mật khẩu:", error);
            toast.error(error.message || "Đổi mật khẩu thất bại."); // 👈 DÙNG TOAST
        } finally {
            setIsLoading(false); // Dừng loading
        }
    };

    return (
        <div>
            <h2 className="text-2xl font-semibold mb-4 text-text-primary">Đổi mật khẩu</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                    <label htmlFor="currentPassword" className="block text-sm font-medium text-text-secondary">Mật khẩu hiện tại</label>
                    <input
                        type="password" id="currentPassword" name="currentPassword"
                        value={formData.currentPassword} onChange={handleChange}
                        required className="input-field" // 👈 Dùng class CSS chung
                    />
                </div>
                <div>
                    <label htmlFor="newPassword" className="block text-sm font-medium text-text-secondary">Mật khẩu mới</label>
                    <input
                        type="password" id="newPassword" name="newPassword"
                        value={formData.newPassword} onChange={handleChange}
                        required className="input-field" // 👈 Dùng class CSS chung
                    />
                </div>
                <div>
                    <label htmlFor="confirmPassword" className="block text-sm font-medium text-text-secondary">Xác nhận mật khẩu mới</label>
                    <input
                        type="password" id="confirmPassword" name="confirmPassword"
                        value={formData.confirmPassword} onChange={handleChange}
                        required className="input-field" // 👈 Dùng class CSS chung
                    />
                </div>
                <div>
                    {/* === THÊM MOTION === */}
                    <motion.button
                        type="submit"
                        className="btn-accent-profile" // 👈 Dùng class CSS chung
                        disabled={isLoading} // Khóa nút khi đang gửi
                        whileHover={{ scale: isLoading ? 1 : 1.05 }}
                        whileTap={{ scale: isLoading ? 1 : 0.95 }}
                    >
                        {isLoading ? 'Đang xử lý...' : 'Đổi mật khẩu'}
                    </motion.button>
                    {/* =================== */}
                </div>
            </form>
        </div>
    );
};
export default ChangePassword;