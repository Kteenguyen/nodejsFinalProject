// frontend/src/components/Profile/ChangePassword.jsx
import React, { useState } from 'react';
import { UserController } from '../../controllers/userController';
import { motion } from 'framer-motion';
import { toast } from 'react-toastify';

const ChangePassword = () => {
    const [formData, setFormData] = useState({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
    });
    const [isLoading, setIsLoading] = useState(false);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (formData.newPassword !== formData.confirmPassword) {
            toast.error("Mật khẩu mới không khớp!");
            return;
        }

        setIsLoading(true);
        try {
            const response = await UserController.changeMyPassword(formData);
            toast.success(response.message || "Đổi mật khẩu thành công!");
            setFormData({ currentPassword: '', newPassword: '', confirmPassword: '' });
        } catch (error) {
            // (userController.jsx đã tự động gọi toast.error)
            console.error("Lỗi đổi mật khẩu:", error);
        }
        setIsLoading(false);
    };

    return (
        // === BỌC NỀN TRẮNG (GIỐNG USERDETAIL) ===
        <div className="bg-surface rounded-lg shadow-md p-6">
            <h2 className="text-lg font-medium text-text-primary mb-4">Đổi mật khẩu</h2>
            <form onSubmit={handleSubmit} className="space-y-4 max-w-md">
                <div>
                    {/* (Giả sử bạn đã thêm 'label-field' vào index.css) */}
                    <label className="label-field">Mật khẩu hiện tại</label>
                    <input
                        type="password" id="currentPassword" name="currentPassword"
                        value={formData.currentPassword} onChange={handleChange}
                        required className="input-field" 
                    />
                </div>
                <div>
                    <label className="label-field">Mật khẩu mới</label>
                    <input
                        type="password" id="newPassword" name="newPassword"
                        value={formData.newPassword} onChange={handleChange}
                        required className="input-field" 
                    />
                </div>
                <div>
                    <label className="label-field">Xác nhận mật khẩu mới</label>
                    <input
                        type="password" id="confirmPassword" name="confirmPassword"
                        value={formData.confirmPassword} onChange={handleChange}
                        required className="input-field" 
                    />
                </div>
                <div>
                    <motion.button
                        type="submit"
                        className="btn-accent-profile" 
                        disabled={isLoading}
                        whileHover={{ scale: isLoading ? 1 : 1.05 }}
                        whileTap={{ scale: isLoading ? 1 : 0.95 }}
                    >
                        {isLoading ? 'Đang xử lý...' : 'Đổi mật khẩu'}
                    </motion.button>
                </div>
            </form>
        </div>
        // ======================================
    );
};
export default ChangePassword;