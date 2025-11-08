// frontend/src/components/Profile/ChangePassword.jsx
import React, { useState } from 'react';
import { UserController } from '../../controllers/userController';

const ChangePassword = () => {
    // ... (logic useState, handleChange, handleSubmit giữ nguyên) ...
    const [formData, setFormData] = useState({ /* ... */ });
    const handleChange = (e) => { /* ... */ };
    const handleSubmit = async (e) => { /* ... */ };

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
                    <button type="submit" className="btn-accent-profile"> {/* 👈 Đổi tên class */}
                        Đổi mật khẩu
                    </button>
                </div>
            </form>            
        </div>
    );
};
export default ChangePassword;