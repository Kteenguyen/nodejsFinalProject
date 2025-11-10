// frontend/src/pages/Admin/Users.jsx

// === IMPORT (Đã sửa lỗi lặp, bổ sung icon và motion) ===
import React, { useState, useEffect, useCallback } from 'react';
import {
    Search, UserX, PackageCheck, Truck, ArchiveRestore,
    Home, ChevronRight
} from "lucide-react";
import { motion } from 'framer-motion'; // 👈 Đã import
import { toast } from 'react-toastify';
// ===================================

import { UserController } from "../../controllers/userController"; // 👈 Đã import
import Pagination from '../../components/common/Pagination';
import Breadcrumb from '../../components/common/Breadcrumb';
import UserDetail from '../../components/common/UserDetail'; // 👈 Đã sửa đường dẫn

// === CÁC HÀM HELPER (Giữ nguyên) ===
const calculateAge = (dobString) => {
    if (!dobString) return 'N/A';
    try {
        const birthDate = new Date(dobString);
        const today = new Date();
        let age = today.getFullYear() - birthDate.getFullYear();
        const m = today.getMonth() - birthDate.getMonth();
        if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
            age--;
        }
        return age;
    } catch (e) { return 'N/A'; }
};

const formatOrderStatusBadges = (stats) => {
    if (!stats || (stats.delivered === 0 && stats.processing === 0 && stats.returned === 0)) {
        return <span className="text-text-secondary text-xs">Chưa có đơn</span>;
    }
    return (
        <div className="flex flex-col gap-1.5">
            {stats.delivered > 0 && (
                <span className="flex items-center text-xs font-medium px-2 py-0.5 rounded-full bg-green-100 text-green-700">
                    <PackageCheck size={14} className="mr-1.5 flex-shrink-0" />
                    Đã giao: <strong className="ml-1">{stats.delivered}</strong>
                </span>
            )}
            {stats.processing > 0 && (
                <span className="flex items-center text-xs font-medium px-2 py-0.5 rounded-full bg-yellow-100 text-yellow-700">
                    <Truck size={14} className="mr-1.5 flex-shrink-0" />
                    Đang xử lý: <strong className="ml-1">{stats.processing}</strong>
                </span>
            )}
            {stats.returned > 0 && (
                <span className="flex items-center text-xs font-medium px-2 py-0.5 rounded-full bg-red-100 text-red-700">
                    <ArchiveRestore size={14} className="mr-1.5 flex-shrink-0" />
                    Đã hoàn/Hủy: <strong className="ml-1">{stats.returned}</strong>
                </span>
            )}
        </div>
    );
};
// ===================================

const Users = () => {
    // === LOGIC STATE (Đã sửa lỗi thiếu state) ===
    const [users, setUsers] = useState([]);
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [loading, setLoading] = useState(true);
    const [limit, setLimit] = useState(5);
    const [search, setSearch] = useState('');
    const [modalUser, setModalUser] = useState(null);
    // ================================

    // === LOGIC FETCH DATA (Đã sửa lỗi useEffect) ===
    const getUsersData = useCallback(async () => {
        setLoading(true);
        try {
            const data = await UserController.getUsers({ page, limit, search });

            if (data && data.users) {
                // (Mock data cho UI mới)
                const usersWithMockData = data.users.map((user, index) => ({
                    ...user,
                    dateOfBirth: user.dateOfBirth || `19${80 + index % 20}-10-20`,
                    totalOrders: user.totalOrders || (index * 3 + 5),
                    orderStats: user.orderStats || {
                        delivered: (index * 2 + 1),
                        processing: (index % 3),
                        returned: (index % 4 === 0 ? 1 : 0)
                    }
                }));
                setUsers(usersWithMockData);
                setTotalPages(data.totalPages || 1);
            } else {
                setUsers([]);
            }
        } catch (error) {
            console.error("Lỗi khi tải users:", error);
            setUsers([]);
        }
        setLoading(false);
    }, [page, limit, search]);

    useEffect(() => {
        getUsersData();
    }, [getUsersData]);
    // =================================

    // Hàm xử lý Search
    const handleSearch = (e) => {
        e.preventDefault();
        setPage(1);
        getUsersData();
    };

    // Hàm xử lý Cấm (Ban)
    const handleBanUser = (e, user) => {
        e.stopPropagation();
        toast.error(`Chức năng cấm [${user.name}] chưa được cài đặt!`);
    };

    // Hàm callback khi Admin lưu trong Modal
    const handleAdminSave = (updatedUser) => {
        setUsers(prevUsers =>
            prevUsers.map(u => u._id === updatedUser._id ? updatedUser : u)
        );
    };

    // Cấu hình Breadcrumb
    const breadcrumbs = [
        { label: 'Quản lý Người dùng' }
    ];

    // Cấu hình cho animation "nổi" lên
    const motionVariants = {
        hidden: { opacity: 0, y: 20 },
        visible: { opacity: 1, y: 0, transition: { duration: 0.5 } }
    };

    // === PHẦN GIAO DIỆN (ĐÃ NÂNG CẤP) ===
    return (
        <div className="p-4 md:p-6 bg-background min-h-screen">

            {/* 1. Breadcrumb (Thay thế H1) */}
            <Breadcrumb crumbs={breadcrumbs} />

            {/* 2. Thanh Search */}
            <form onSubmit={handleSearch} className="mb-4 flex gap-2">
                <div className="relative flex-grow">
                    <input
                        type="text"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        placeholder="Tìm theo tên, email..."
                        className="input-field pl-10"
                    />
                    <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-secondary" />
                </div>
                <motion.button
                    type="submit"
                    className="btn-accent-profile"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                >
                    Tìm kiếm
                </motion.button>
            </form>

            {/* 3. Giao diện Bảng (TABLE) - Dành cho Desktop (md trở lên) */}
            <motion.div
                variants={motionVariants}
                initial="hidden"
                animate="visible"
                className="hidden md:block bg-surface shadow-md rounded-lg overflow-x-auto"
            >
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-text-secondary uppercase tracking-wider">Người dùng</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-text-secondary uppercase tracking-wider">Tuổi</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-text-secondary uppercase tracking-wider">Tổng đơn</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-text-secondary uppercase tracking-wider">Tình trạng đơn hàng</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-text-secondary uppercase tracking-wider">Hành động</th>
                        </tr>
                    </thead>
                    <tbody className="bg-surface divide-y divide-gray-200">
                        {loading ? (
                            <tr><td colSpan="5" className="text-center py-4 text-text-secondary">Đang tải...</td></tr>
                        ) : (
                            users.map(user => (
                                <tr
                                    key={user._id}
                                    className="hover:bg-gray-50 cursor-pointer"
                                    onClick={() => setModalUser(user)} // 👈 Click vào hàng
                                >
                                    {/* Cột User */}
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="flex items-center">
                                            <img className="h-10 w-10 rounded-full object-cover" src={user.avatar || '/img/male_user.png'} alt={user.name} />
                                            <div className="ml-4">
                                                <div className="text-sm font-medium text-text-primary">{user.name}</div>
                                                <div className="text-sm text-text-secondary">{user.email}</div>
                                            </div>
                                        </div>
                                    </td>
                                    {/* Cột Tuổi */}
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-text-primary">
                                        {calculateAge(user.dateOfBirth)}
                                    </td>
                                    {/* Cột Tổng đơn */}
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-text-primary font-medium">
                                        {user.totalOrders}
                                    </td>
                                    {/* Cột Tình trạng */}
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        {formatOrderStatusBadges(user.orderStats)}
                                    </td>
                                    {/* Cột Hành động */}
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                        <motion.button
                                            onClick={(e) => handleBanUser(e, user)}
                                            className="flex items-center gap-1.5 px-3 py-1.5 rounded-md text-red-600 hover:bg-red-100 transition-colors"
                                            whileHover={{ scale: 1.05 }}
                                            whileTap={{ scale: 0.95 }}
                                        >
                                            <UserX size={14} />
                                            Cấm
                                        </motion.button>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </motion.div>

            {/* 4. Giao diện Thẻ (CARD) - Dành cho Mobile (dưới md) */}
            <motion.div
                variants={motionVariants}
                initial="hidden"
                animate="visible"
                className="md:hidden space-y-4"
            >
                {loading ? (
                    <div className="text-center py-4 text-text-secondary">Đang tải...</div>
                ) : (
                    users.map(user => (
                        <div
                            key={user._id}
                            className="bg-surface rounded-lg shadow-md p-4 cursor-pointer"
                            onClick={() => setModalUser(user)}
                        >
                            {/* Hàng 1: User Info */}
                            <div className="flex items-center mb-4 pb-4 border-b border-gray-200">
                                <img className="h-10 w-10 rounded-full object-cover" src={user.avatar || '/img/male_user.png'} alt={user.name} />
                                <div className="ml-4">
                                    <div className="text-sm font-medium text-text-primary">{user.name}</div>
                                    <div className="text-sm text-text-secondary">{user.email}</div>
                                </div>
                            </div>

                            {/* Hàng 2: Data (Tuổi, Tổng đơn) */}
                            <div className="grid grid-cols-2 gap-4 mb-4 text-sm">
                                <div>
                                    <div className="text-xs text-text-secondary uppercase">Tuổi</div>
                                    <div className="text-text-primary font-medium">{calculateAge(user.dateOfBirth)}</div>
                                </div>
                                <div>
                                    <div className="text-xs text-text-secondary uppercase">Tổng đơn</div>
                                    <div className="text-text-primary font-medium">{user.totalOrders}</div>
                                </div>
                            </div>

                            {/* Hàng 3: Tình trạng (3 Badges) */}
                            <div className="mb-4">
                                <div className="text-xs text-text-secondary uppercase mb-2">Tình trạng đơn hàng</div>
                                {formatOrderStatusBadges(user.orderStats)}
                            </div>

                            {/* Hàng 4: Hành động */}
                            <div>
                                <motion.button
                                    onClick={(e) => handleBanUser(e, user)}
                                    className="w-full flex items-center justify-center gap-1.5 px-3 py-2 rounded-md text-red-600 bg-red-50 hover:bg-red-100 transition-colors"
                                    whileHover={{ scale: 1.02 }}
                                    whileTap={{ scale: 0.98 }}
                                >
                                    <UserX size={14} />
                                    Cấm người dùng
                                </motion.button>
                            </div>
                        </div>
                    ))
                )}
            </motion.div>

            {/* 5. Phân trang */}
            {!loading && totalPages > 1 && (
                <Pagination
                    currentPage={page}
                    totalPages={totalPages}
                    onPageChange={setPage}
                />
            )}

            {/* 6. Modal Detail (Đã truyền đúng props) */}
            <UserDetail
                user={modalUser}
                onClose={() => setModalUser(null)}
                onSave={handleAdminSave} // 👈 Truyền hàm callback
                context="admin" // 👈 Báo cho component biết đây là Admin
            />
        </div>
    );
};

export default Users;