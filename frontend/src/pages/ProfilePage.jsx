// frontend/src/pages/ProfilePage.jsx
import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { FaUser, FaLock, FaMapMarkerAlt } from 'react-icons/fa';

// Import các component Tab (chúng ta sẽ tạo chúng ở dưới)
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
        return <div className="container mx-auto p-8 text-center">Đang tải thông tin...</div>;
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

    const TabButton = ({ tabKey, icon, label }) => (
        <button
            onClick={() => setActiveTab(tabKey)}
            className={`flex items-center gap-3 px-4 py-3 text-sm font-medium w-full text-left
                        ${activeTab === tabKey 
                            ? 'bg-accent-hover text-primary' // Màu khi active
                            : 'text-text-secondary hover:bg-background' // Màu mặc định
                        } 
                        transition-colors duration-200 rounded-lg`}
        >
            {icon}
            <span>{label}</span>
        </button>
    );
    
    const avatarUrl = user?.avatar || `https://ui-avatars.com/api/?name=${user.name || user.email}&background=76ABAE&color=222831`;

    return (
        // Dùng màu nền 'bg-background' (Be ngả trắng)
        <div className="container mx-auto p-4 md:p-8 bg-background min-h-screen">
            <h1 className="text-3xl font-bold mb-6 text-text-primary">Tài khoản của tôi</h1>
            
            <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
                
                {/* Cột trái: Sidebar (Avatar + Menu Tab) */}
                <aside className="md:col-span-1">
                    {/* Dùng màu 'bg-surface' (Trắng) */}
                    <div className="bg-surface p-4 rounded-lg shadow-lg text-center">
                        <img 
                            src={avatarUrl} 
                            alt="Avatar" 
                            className="w-24 h-24 rounded-full mx-auto mb-4 border-4 border-accent" // Viền màu Accent
                        />
                        <h2 className="text-xl font-semibold text-text-primary">{user.name}</h2>
                        <p className="text-sm text-text-secondary">{user.email}</p>
                    </div>
                    
                    <nav className="bg-surface p-4 rounded-lg shadow-lg mt-6 space-y-2">
                        <TabButton tabKey={TABS.PROFILE} icon={<FaUser />} label="Hồ sơ cá nhân" />
                        <TabButton tabKey={TABS.PASSWORD} icon={<FaLock />} label="Đổi mật khẩu" />
                        <TabButton tabKey={TABS.ADDRESSES} icon={<FaMapMarkerAlt />} label="Địa chỉ" />
                    </nav>
                </aside>

                {/* Cột phải: Nội dung Tab */}
                <main className="md:col-span-3 bg-surface p-6 rounded-lg shadow-lg">
                    {renderTabContent()}
                </main>
            </div>
        </div>
    );
};

export default ProfilePage;