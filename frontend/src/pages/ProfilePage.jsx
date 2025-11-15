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
// CHỈ IMPORT TOAST, KHÔNG IMPORT CONTAINER (Container đã có ở index.js)
import { toast } from 'react-toastify';
import Breadcrumb from '../components/common/Breadcrumb';

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

    const [isLoadingAvatar, setIsLoadingAvatar] = useState(false);
    const fileInputRef = useRef(null);
    const [avatarPreview, setAvatarPreview] = useState(user?.avatar || '/img/male_user.png');

    // Đồng bộ ảnh khi user context thay đổi
    useEffect(() => {
        if (user?.avatar) {
            setAvatarPreview(user.avatar);
        }
    }, [user]);

    const handleAvatarClick = () => {
        fileInputRef.current.click();
    };

    // === CẬP NHẬT LOGIC: GỌI API + TOAST ===
    const handleFileChange = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        // 1. Preview ảnh ngay lập tức (Optimistic UI)
        const reader = new FileReader();
        reader.onloadend = () => {
            setAvatarPreview(reader.result);
        };
        reader.readAsDataURL(file);

        setIsLoadingAvatar(true);
        try {
            const formData = new FormData();
            formData.append('avatar', file);

            // 2. Gọi API
            const response = await UserController.updateProfile(formData);

            // 3. SỬA LỖI TẠI ĐÂY:
            // Kiểm tra lỏng hơn: Nếu response tồn tại là OK. 
            // (UserController thường trả về data, nếu lỗi nó đã throw error rồi)
            if (response) {
                // API có thể trả về { success: true, user: ... } HOẶC chỉ trả về object User
                const newUser = response.user || response;

                // Cập nhật Context
                setUser(newUser);

                // Hiện Toast
                toast.success("Cập nhật ảnh đại diện thành công!");
            }

        } catch (error) {
            console.error("Lỗi upload avatar:", error);
            toast.error("Lỗi khi cập nhật ảnh đại diện.");
            // Revert lại ảnh cũ nếu lỗi
            setAvatarPreview(user?.avatar || '/img/male_user.png');
        } finally {
            setIsLoadingAvatar(false);
        }
    };
    // =================================================

    // Hàm render nội dung theo Tab
    const renderTabContent = () => {
        switch (activeTab) {
            case TABS.PROFILE:
                return (
                    <div className="space-y-6">
                        <div className="bg-surface p-6 rounded-lg shadow-md">
                            <h3 className="text-xl font-semibold text-text-primary mb-4 pb-2 border-b border-gray-100">
                                Thông tin cá nhân
                            </h3>
                            <UserDetail
                                context="user"
                                user={user}
                                onSave={(updatedUser) => {
                                    setUser(updatedUser);
                                    // UserDetail tự xử lý toast
                                }}
                            />
                        </div>
                    </div>
                );
            case TABS.PASSWORD:
                return (
                    <div className="bg-surface p-6 rounded-lg shadow-md">
                        <h3 className="text-xl font-semibold text-text-primary mb-4 pb-2 border-b border-gray-100">
                            Đổi mật khẩu
                        </h3>
                        <ChangePassword />
                    </div>
                );
            case TABS.ADDRESSES:
                return (
                    <div className="bg-surface p-6 rounded-lg shadow-md">
                        <h3 className="text-xl font-semibold text-text-primary mb-4 pb-2 border-b border-gray-100">
                            Sổ địa chỉ
                        </h3>
                        <ManageAddresses />
                    </div>
                );
            default:
                return null;
        }
    };

    const TabButton = ({ tabKey, icon, label }) => (
        <button
            onClick={() => setActiveTab(tabKey)}
            className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition-all duration-200
                ${activeTab === tabKey
                    ? 'bg-accent text-white shadow-md transform scale-105'
                    : 'text-text-secondary hover:bg-gray-100 hover:text-text-primary'
                }`}
        >
            <span className="text-lg">{icon}</span>
            <span className="font-medium">{label}</span>
        </button>
    );

    const breadcrumbs = [
        { label: "Tài khoản của tôi" }
    ];

    if (!user) return <LoadingSpinner />;

    return (
        <div className="min-h-screen bg-background py-8 px-4 sm:px-6 lg:px-8">
            <div className="max-w-6xl mx-auto">
                <Breadcrumb crumbs={breadcrumbs} />

                <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mt-6">
                    {/* Cột trái: Sidebar Menu + Avatar */}
                    <aside className="md:col-span-1 space-y-6">
                        <div className="sticky top-24 space-y-6">

                            {/* 1. Avatar Card */}
                            <div className="bg-surface p-6 rounded-lg shadow-lg flex flex-col items-center text-center">
                                <div className="relative group mb-4">
                                    <div className="w-28 h-28 rounded-full overflow-hidden ring-4 ring-accent/20">
                                        <img
                                            src={avatarPreview}
                                            alt="Profile"
                                            className={`w-full h-full object-cover transition-opacity duration-300 ${isLoadingAvatar ? 'opacity-50' : 'opacity-100'}`}
                                        />
                                        {isLoadingAvatar && (
                                            <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-30">
                                                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white"></div>
                                            </div>
                                        )}
                                    </div>

                                    {/* Nút upload ảnh */}
                                    {!isLoadingAvatar && (
                                        <div
                                            onClick={handleAvatarClick}
                                            className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50 rounded-full opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
                                        >
                                            <FaCamera className="text-white text-2xl" />
                                        </div>
                                    )}
                                    <input
                                        type="file"
                                        ref={fileInputRef}
                                        onChange={handleFileChange}
                                        className="hidden"
                                        accept="image/*"
                                    />
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

                    {/* Cột phải: Nội dung */}
                    <main className="md:col-span-3">
                        <motion.div
                            key={activeTab}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.3 }}
                        >
                            {renderTabContent()}
                        </motion.div>
                    </main>
                </div>
            </div>
        </div>
    );
};

export default ProfilePage;