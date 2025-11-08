// frontend/src/components/Profile/ProfileInfo.jsx
import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { UserController } from '../../controllers/userController';

const ProfileInfo = ({ user }) => {
    // ... (logic useState, handleChange, handleSubmit giữ nguyên) ...
    const { setUser } = useAuth();
    const [formData, setFormData] = useState({
        name: user.name || '',
        phoneNumber: user.phoneNumber || '',
        dateOfBirth: user.dateOfBirth ? user.dateOfBirth.split('T')[0] : '',
        avatar: user.avatar || ''
    });
    const handleChange = (e) => { /* ... */ };
    const handleSubmit = async (e) => { /* ... */ };

    return (
        <div>
            <h2 className="text-2xl font-semibold mb-4 text-text-primary">Hồ sơ cá nhân</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                    <label className="block text-sm font-medium text-text-secondary">Email</label>
                    <input 
                        type="email" 
                        value={user.email} 
                        disabled 
                        className="input-field-disabled" // 👈 Dùng class CSS chung
                    />
                </div>
                <div>
                    <label htmlFor="name" className="block text-sm font-medium text-text-secondary">Họ và Tên</label>
                    <input 
                        type="text" id="name" name="name"
                        value={formData.name} onChange={handleChange}
                        className="input-field" // 👈 Dùng class CSS chung
                    />
                </div>
                 <div>
                    <label htmlFor="avatar" className="block text-sm font-medium text-text-secondary">Link ảnh Avatar</label>
                    <input 
                        type="text" id="avatar" name="avatar"
                        value={formData.avatar} onChange={handleChange}
                        className="input-field" // 👈 Dùng class CSS chung
                        placeholder="https://your-image-url.com/avatar.png"
                    />
                </div>
                <div>
                    <label htmlFor="phoneNumber" className="block text-sm font-medium text-text-secondary">Số điện thoại</label>
                    <input 
                        type="tel" id="phoneNumber" name="phoneNumber"
                        value={formData.phoneNumber} onChange={handleChange}
                        className="input-field" // 👈 Dùng class CSS chung
                    />
                </div>
                <div>
                    <label htmlFor="dateOfBirth" className="block text-sm font-medium text-text-secondary">Ngày sinh</label>
                    <input 
                        type="date" id="dateOfBirth" name="dateOfBirth"
                        value={formData.dateOfBirth} onChange={handleChange}
                        className="input-field" // 👈 Dùng class CSS chung
                    />
                </div>
                <div>
                    <button type="submit" className="btn-accent-profile"> {/* 👈 Đổi tên class */}
                        Lưu thay đổi
                    </button>
                </div>
            </form>
            
            {/* 👈 FIX: XÓA TOÀN BỘ THẺ <style jsx> TỪ ĐÂY */}
            
        </div>
    );
};
export default ProfileInfo;