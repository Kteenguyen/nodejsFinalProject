// frontend/src/pages/ProfilePage.jsx
import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { FaUser, FaLock, FaMapMarkerAlt } from 'react-icons/fa';
import { motion } from 'framer-motion';

// Import các component Tab
import ChangePassword from '../components/Profile/ChangePassword';
import ManageAddresses from '../components/Profile/ManageAddresses';
import UserDetail from '../components/common/UserDetail'; // 👈 Import component tái sử dụng

const TABS = {
    PROFILE: 'profile',
    PASSWORD: 'password',
    ADDRESSES: 'addresses'
};

// (Component Loading, hoặc import từ file khác)
const LoadingSpinner = () => (
    <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-accent"></div>
    </div>
);

const ProfilePage = () => {
    const { user, setUser } = useAuth(); // 👈 Lấy hàm setUser
    const [activeTab, setActiveTab] = useState(TABS.PROFILE);

    // === SỬA LỖI LOGIC: Dùng setUser, không dùng setFormData ===
    const handleProfileSave = (updatedData) => {
        try {
            // Cập nhật lại AuthContext để user thấy thay đổi
            setUser(prev => ({...prev, ...updatedData})); 
            // (toast.success đã được gọi từ bên trong UserDetail)
        } catch (error) {
            console.error("Lỗi lưu profile:", error);
        }
    };
    // =================================

    if (!user) {
        return <LoadingSpinner />;
    }

    const renderTabContent = () => {
        switch (activeTab) {
            case TABS.PROFILE:
                return (
                    <UserDetail 
                        user={user} 
                        context="user" // 👈 Báo đây là User
                        onSave={handleProfileSave} // 👈 Truyền hàm callback
                    />
                );
            case TABS.PASSWORD:
                return <ChangePassword />; // 👈 Component này sẽ được bọc nền trắng (File 2)
            case TABS.ADDRESSES:
                return <ManageAddresses />; // 👈 Component này sẽ được bọc nền trắng (File 3)
            default:
                return (
                    <UserDetail 
                        user={user} 
                        context="user" 
                        onSave={handleProfileSave} 
                    />
                );
        }
    };

    // JSX cho nút Tab
    const TabButton = ({ tabKey, icon, label }) => (
        <motion.button
            onClick={() => setActiveTab(tabKey)}
            className={`w-full flex items-center p-3 rounded-lg text-left transition-colors
                ${activeTab === tabKey 
                    ? 'bg-accent-hover text-white shadow-lg' 
                    : 'text-text-primary hover:bg-gray-100'
                }`}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
        >
            {React.cloneElement(icon, { className: "mr-3" })}
            {label}
        </motion.button>
    );

    return (
        <div className="bg-background min-h-screen py-8 md:py-12">
            <div className="container mx-auto px-4 grid grid-cols-1 md:grid-cols-4 gap-6 md:gap-8">
                
                {/* === CỘT TRÁI (SIDEBAR) ĐÃ NÂNG CẤP === */}
                <aside className="md:col-span-1">
                    {/* Thêm 1 div wrapper với class 'sticky' */}
                    <div className="sticky top-6 space-y-6">
                        {/* 1. Card Info */}
                        <div className="bg-surface p-4 rounded-lg shadow-lg text-center">
                            <img 
                                src={user.avatar || '/img/male_user.png'} 
                                alt="Avatar" 
                                className="w-24 h-24 rounded-full mx-auto mb-4 border-4 border-accent"
                            />
                            <h2 className="text-xl font-semibold text-text-primary">{user.name}</h2>
                            <p className="text-sm text-text-secondary">{user.email}</p>
                        </div>
                        
                        {/* 2. Menu (bỏ mt-6 vì đã có space-y-6) */}
                        <nav className="bg-surface p-4 rounded-lg shadow-lg space-y-1">
                            <TabButton tabKey={TABS.PROFILE} icon={<FaUser />} label="Hồ sơ cá nhân" />
                            <TabButton tabKey={TABS.PASSWORD} icon={<FaLock />} label="Đổi mật khẩu" />
                            <TabButton tabKey={TABS.ADDRESSES} icon={<FaMapMarkerAlt />} label="Địa chỉ" />
                        </nav>
                    </div>
                </aside>
                {/* ================================== */}


                {/* Cột phải: Nội dung */}
                <main className="md:col-span-3">
                    {renderTabContent()}
                </main>
            </div>
        </div>
    );
};

export default ProfilePage;