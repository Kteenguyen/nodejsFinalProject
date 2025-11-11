// frontend/src/pages/ProfilePage.jsx
import React, { useState, useRef, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { FaUser, FaLock, FaMapMarkerAlt, FaCamera } from 'react-icons/fa';
import { motion } from 'framer-motion';

// Import các component Tab
import ChangePassword from '../components/Profile/ChangePassword';
import ManageAddresses from '../components/Profile/ManageAddresses';
import UserDetail from '../components/common/UserDetail';
import { UserController } from '../controllers/userController';
import { toast } from 'react-toastify';
import Breadcrumb from '../components/common/Breadcrumb'; // 👈 Import Breadcrumb

const TABS = {
    PROFILE: 'profile',
    PASSWORD: 'password',
    ADDRESSES: 'addresses'
};

const LoadingSpinner = () => (
    <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-accent"></div>
    </div>
);

const ProfilePage = () => {
    const { user, setUser } = useAuth();
    const [activeTab, setActiveTab] = useState(TABS.PROFILE);

    // === (State cho Avatar) ===
    const [isLoadingAvatar, setIsLoadingAvatar] = useState(false);
    const fileInputRef = useRef(null);
    const [avatarPreview, setAvatarPreview] = useState('/img/male_user.png');

    // (useEffect sửa lỗi crash user: null)
    useEffect(() => {
        if (user && user.avatar) {
            setAvatarPreview(user.avatar);
        } else if (user) {
            setAvatarPreview('/img/male_user.png');
        }
    }, [user]);
    // =============================

    // (Guard clause SAU KHI gọi hooks)
    if (!user) {
        return (
            <div className="bg-background min-h-screen py-8 md:py-12">
                <div className="container mx-auto px-4">
                    {/* (Vẫn hiển thị breadcrumb tĩnh khi loading) */}
                    <Breadcrumb crumbs={[{ label: 'Hồ sơ của tôi' }]} />
                    <LoadingSpinner />
                </div>
            </div>
        );
    }
    // =============================

    // === CÁC HÀM XỬ LÝ (Tự động upload avatar) ===
    const handleAvatarClick = () => {
        if (isLoadingAvatar) return;
        fileInputRef.current.click();
    };

    const handleFileChange = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        setAvatarPreview(URL.createObjectURL(file));
        setIsLoadingAvatar(true);

        try {
            const formData = new FormData();
            formData.append('avatar', file);

            const response = await UserController.updateProfile(formData);

            if (response.success && response.user) {
                setUser(response.user);
                setAvatarPreview(response.user.avatar || '/img/male_user.png');
                toast.success("Cập nhật avatar thành công!");
            }
        } catch (error) {
            console.error("Lỗi upload avatar:", error);
            setAvatarPreview(user.avatar || '/img/male_user.png');
        }

        setIsLoadingAvatar(false);
        e.target.value = null;
    };

    // (Hàm này giờ CHỈ LƯU TEXT từ UserDetail)
    const handleProfileSave = async (updatedData) => {
        try {
            const formData = new FormData();
            Object.keys(updatedData).forEach(key => {
                if (key !== 'avatar' && updatedData[key] !== null && updatedData[key] !== undefined) {
                    formData.append(key, updatedData[key]);
                }
            });

            const response = await UserController.updateProfile(formData);

            if (response.success && response.user) {
                setUser(response.user);
                toast.success("Cập nhật hồ sơ thành công!");
            }
        } catch (error) {
            console.error("Lỗi lưu profile:", error);
        }
    };
    // =================================

    const renderTabContent = () => {
        switch (activeTab) {
            case TABS.PROFILE:
                return <UserDetail user={user} context="user" onSave={handleProfileSave} />;
            case TABS.PASSWORD:
                return <ChangePassword />;
            case TABS.ADDRESSES:
                return <ManageAddresses />;
            default:
                return <UserDetail user={user} context="user" onSave={handleProfileSave} />;
        }
    };

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

    // === NÂNG CẤP: BREADCRUMB ĐỘNG ===
    const breadcrumbPaths = {
        [TABS.PROFILE]: [
            { label: 'Hồ sơ của tôi' } // Trang gốc, không click được
        ],
        [TABS.PASSWORD]: [
            { label: 'Hồ sơ của tôi', href: '/profile' }, // Click về trang gốc
            { label: 'Đổi mật khẩu' }
        ],
        [TABS.ADDRESSES]: [
            { label: 'Hồ sơ của tôi', href: '/profile' }, // Click về trang gốc
            { label: 'Quản lý địa chỉ' }
        ]
    };
    // Tự động chọn breadcrumb đúng dựa trên state
    const currentCrumbs = breadcrumbPaths[activeTab] || breadcrumbPaths[TABS.PROFILE];
    // ================================

    return (
        <div className="bg-background min-h-screen py-8 md:py-12">
            <div className="container mx-auto px-4">

                {/* === NÂNG CẤP: GỌI BREADCRUMB ĐỘNG === */}
                <Breadcrumb crumbs={currentCrumbs} />

                <div className="grid grid-cols-1 md:grid-cols-4 gap-6 md:gap-8 mt-4">

                    {/* === CỘT TRÁI (SIDEBAR) === */}
                    <aside className="md:col-span-1">
                        <div className="sticky top-6 space-y-6">

                            {/* 1. Card Info (Đã cập nhật Avatar) */}
                            <div className="bg-surface p-4 rounded-lg shadow-lg text-center">

                                <input
                                    type="file"
                                    accept="image/*"
                                    ref={fileInputRef}
                                    onChange={handleFileChange}
                                    className="hidden"
                                />

                                <div
                                    className="relative w-24 h-24 mx-auto mb-4 group cursor-pointer"
                                    onClick={handleAvatarClick}
                                >
                                    <img
                                        src={avatarPreview}
                                        alt="Avatar"
                                        className={`w-24 h-24 rounded-full object-cover border-4 border-accent transition-opacity ${isLoadingAvatar ? 'opacity-50 cursor-wait' : 'group-hover:opacity-70'}`}
                                    />

                                    {isLoadingAvatar && (
                                        <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50 rounded-full">
                                            <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-white"></div>
                                        </div>
                                    )}

                                    {!isLoadingAvatar && (
                                        <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50 rounded-full opacity-0 group-hover:opacity-100 transition-opacity">
                                            <FaCamera className="text-white text-2xl" />
                                        </div>
                                    )}
                                </div>

                                <h2 className="text-xl font-semibold text-text-primary">{user.name}</h2>
                                <p className="text-sm text-text-secondary">{user.email}</p>
                            </div>

                            {/* 2. Menu */}
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
        </div>
    );
};

export default ProfilePage;