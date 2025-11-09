// frontend/src/pages/ProfilePage.jsx
import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { FaUser, FaLock, FaMapMarkerAlt } from 'react-icons/fa';
import { motion } from 'framer-motion'; // 👈 THÊM MOTION

// Import các component Tab
import ProfileInfo from '../components/Profile/ProfileInfo';
import ChangePassword from '../components/Profile/ChangePassword';
import ManageAddresses from '../components/Profile/ManageAddresses';

const TABS = {
    PROFILE: 'profile',
    PASSWORD: 'password',
    ADDRESSES: 'addresses'
};

const ProfilePage = () => {
    const { user } = useAuth();
    const [activeTab, setActiveTab] = useState(TABS.PROFILE);

    if (!user) {
        // Dùng màu text-text-secondary từ config
        return <div className="container mx-auto p-8 text-center text-text-secondary">Đang tải thông tin...</div>;
    }

    const renderTabContent = () => {
        switch (activeTab) {
            case TABS.PROFILE:
                return <ProfileInfo user={user} />;
            case TABS.PASSWORD:
                return <ChangePassword />;
            case TABS.ADDRESSES:
                return <ManageAddresses />;
            default:
                return <ProfileInfo user={user} />;
        }
    };

    // === NÂNG CẤP TABBUTTON ===
    const TabButton = ({ tabKey, icon, label }) => {
        const isActive = activeTab === tabKey;
        return (
            <motion.button
                onClick={() => setActiveTab(tabKey)}
                // Dùng màu sắc từ Tailwind config:
                className={`
                    flex items-center gap-3 w-full px-4 py-3 rounded-lg text-left font-medium transition-colors duration-200
                    ${isActive 
                        ? 'bg-accent text-text-on-dark' // Màu active
                        : 'text-text-secondary hover:bg-background hover:text-text-accent' // Màu thường
                    }
                `}
                // Thêm motion
                whileHover={{ x: isActive ? 0 : 5 }} // Chỉ di chuyển khi không active
                whileTap={{ scale: 0.98 }}
            >
                {icon}
                <span>{label}</span>
            </motion.button>
        );
    };
    // ===========================

    // Ảnh đại diện (đã đúng)
    const avatarUrl = user.avatar || 'https://via.placeholder.com/100';

    return (
        // Dùng màu nền 'bg-background' từ config
        <div className="container mx-auto p-4 md:p-8 bg-background min-h-screen">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
               
                {/* Cột trái: Sidebar (Đã dùng màu 'bg-surface' và 'border-accent') */}
                <aside className="md:col-span-1">
                    <div className="bg-surface p-4 rounded-lg shadow-lg text-center">
                        <img 
                            src={avatarUrl} 
                            alt="Avatar" 
                            className="w-24 h-24 rounded-full mx-auto mb-4 border-4 border-accent"
                        />
                        <h2 className="text-xl font-semibold text-text-primary">{user.name}</h2>
                        <p className="text-sm text-text-secondary">{user.email}</p>
                    </div>
                    
                    {/* Menu (Đã dùng 'bg-surface') */}
                    <nav className="bg-surface p-4 rounded-lg shadow-lg mt-6 space-y-1">
                        <TabButton tabKey={TABS.PROFILE} icon={<FaUser />} label="Hồ sơ cá nhân" />
                        <TabButton tabKey={TABS.PASSWORD} icon={<FaLock />} label="Đổi mật khẩu" />
                        <TabButton tabKey={TABS.ADDRESSES} icon={<FaMapMarkerAlt />} label="Địa chỉ" />
                    </nav>
                </aside>

                {/* Cột phải: Nội dung (Đã dùng 'bg-surface') */}
                <main className="md:col-span-3 bg-surface p-6 rounded-lg shadow-lg">
                    {renderTabContent()}
                </main>
            </div>
        </div>
    );
};

export default ProfilePage;