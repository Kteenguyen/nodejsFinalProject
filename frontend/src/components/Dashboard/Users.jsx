// frontend/src/pages/Admin/Users.jsx

import React, { useState, useEffect, useCallback } from 'react'; 
import {
    Search, UserX, PackageCheck, Truck, ArchiveRestore,
    Home, ChevronRight,
    PlusCircle, // (Icon cho nút Tạo)
    X as XIcon // (Icon X cho Modal)
} from "lucide-react";
import { motion, AnimatePresence } from 'framer-motion'; // (Import AnimatePresence)
import { toast } from 'react-toastify';

import { UserController } from "../../controllers/userController";
import Pagination from '../../components/common/Pagination';
import Breadcrumb from '../../components/common/Breadcrumb';
import UserDetail from '../../components/common/UserDetail'; 
// (Giả sử đường dẫn đến Register.jsx - Sửa nếu cần)
import Register from '../../pages/Register';
import { getAvatarUrl } from '../../services/api';

// === CÁC HÀM HELPER (Đã an toàn) ===
const calculateAge = (dobString) => {
    if (!dobString) return 'N/A';
    try {
        const birthDate = new Date(dobString.replace(/-/g, '/')); 
        if (isNaN(birthDate.getTime())) return 'N/A';
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
        <div className="flex flex-col gap-1.5 p-3 bg-gray-100 rounded-md">
            {stats.delivered > 0 && (
                <span className="flex items-center text-xs font-medium px-2 py-0.5 rounded-full bg-green-100 text-green-700">
                    <PackageCheck size={14} className="mr-1.5" />
                    Đã giao: <strong className="ml-1">{stats.delivered}</strong>
                </span>
            )}
            {stats.processing > 0 && (
                <span className="flex items-center text-xs font-medium px-2 py-0.5 rounded-full bg-yellow-100 text-yellow-700">
                    <Truck size={14} className="mr-1.5" />
                    Đang xử lý: <strong className="ml-1">{stats.processing}</strong>
                </span>
            )}
            {stats.returned > 0 && (
                <span className="flex items-center text-xs font-medium px-2 py-0.5 rounded-full bg-red-100 text-red-700">
                    <ArchiveRestore size={14} className="mr-1.5" />
                    Đã hoàn/Hủy: <strong className="ml-1">{stats.returned}</strong>
                </span>
            )}
        </div>
    );
};
// ===================================

const Users = () => {
    // (State)
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [search, setSearch] = useState("");
    const [modalUser, setModalUser] = useState(null);
    const [currentIndex, setCurrentIndex] = useState(null); 
    const [isRegisterOpen, setIsRegisterOpen] = useState(false); // (State cho Modal Tạo)

    // (Hàm lấy dữ liệu)
    const getUsersData = useCallback(async (currentPage, currentSearch) => {
        setLoading(true);
        try {
            const data = await UserController.getUsers({ 
                page: currentPage, 
                limit: 10, 
                search: currentSearch 
            });
            if (data && data.users) {
                setUsers(data.users);
                setTotalPages(data.totalPages);
            }
        } catch (error) {
            console.error("Lỗi tải danh sách users:", error);
        } finally {
            setLoading(false);
        }
    }, []);

    // (useEffect)
    useEffect(() => {
        const handler = setTimeout(() => {
            getUsersData(page, search);
        }, 300); 
        return () => clearTimeout(handler);
    }, [page, search, getUsersData]);

    const handleSearch = (e) => {
        setSearch(e.target.value);
        setPage(1); 
    };
    
    // (Hàm mở Modal)
    const handleRowClick = (user, index) => {
        setModalUser(user);
        setCurrentIndex(index); 
    };
    
    // (Hàm Next/Prev cho Modal)
    const handleNextUser = () => {
        if (users.length === 0) return;
        const nextIndex = (currentIndex + 1) % users.length; 
        setCurrentIndex(nextIndex);
        setModalUser(users[nextIndex]);
    };
    const handlePrevUser = () => {
        if (users.length === 0) return;
        const prevIndex = (currentIndex - 1 + users.length) % users.length;
        setCurrentIndex(prevIndex);
        setModalUser(users[prevIndex]);
    };

    // (Hàm callback khi Modal (UserDetail) lưu hoặc cấm)
    const handleAdminSave = (updatedUser) => {
        setUsers(prev => prev.map(u => u._id === updatedUser._id ? updatedUser : u));
        setModalUser(updatedUser); 
    };
    
    // (Hàm Cấm/Gỡ cấm - Đã kích hoạt)
    const handleBanUser = async (e, user) => {
        e.stopPropagation(); 
        
        const actionText = user.isBanned ? 'GỠ CẤM' : 'CẤM';
        const confirmBan = window.confirm(
            `Bạn có chắc muốn ${actionText} người dùng [${user.name}]?`
        );
        if (!confirmBan) return;

        try {
            const data = await UserController.banUser(user._id);
            toast.success(data.message);
            setUsers(prevUsers => 
                prevUsers.map(u => 
                    u._id === user._id ? { ...u, isBanned: data.isBanned } : u
                )
            );
        } catch (error) {
            console.error("Lỗi khi cấm user:", error);
        }
    };

    // (Hàm xử lý khi Tạo User thành công)
    const handleRegisterSuccess = () => {
        setIsRegisterOpen(false); 
        setPage(1); 
        setSearch(""); 
        getUsersData(1, ""); 
        toast.success("Tạo người dùng mới thành công!");
    };
    
    // (Breadcrumbs - Đã sửa lỗi 'items' thành 'crumbs')
    const breadcrumbs = [
        { label: "Người dùng" } 
    ];
    
    // (Animation)
    const motionVariants = {
        hidden: { opacity: 0, y: 20 },
        visible: { opacity: 1, y: 0 },
    };
    const backdropVariants = {
        hidden: { opacity: 0 },
        visible: { opacity: 1, transition: { duration: 0.3 } },
        exit: { opacity: 0, transition: { duration: 0.2 } }
    };
    const modalVariants = {
        hidden: { opacity: 0, scale: 0.9, y: 50 },
        visible: { 
            opacity: 1, scale: 1, y: 0,
            transition: { type: "spring", stiffness: 400, damping: 30 }
        },
        exit: { opacity: 0, scale: 0.9, y: 50 }
    };

    // === GIAO DIỆN ===
    return (
        <div className="p-4 md:p-6 bg-background min-h-screen">
            
            <Breadcrumb crumbs={breadcrumbs} /> 

            {/* Nút Quay lại */}
            <div className="mb-4">
                <button
                    onClick={() => window.location.href = "/admin/management"}
                    className="px-3 py-2 rounded bg-gray-300 text-gray-800 hover:bg-gray-400 transition flex items-center gap-2"
                    title="Quay lại Management Hub"
                >
                    ← Quay lại
                </button>
            </div>

            {/* 1. Tiêu đề và Search + Tạo User */}
            <motion.div 
                className="flex flex-col md:flex-row justify-between items-center mb-4 gap-4"
                variants={motionVariants}
                initial="hidden"
                animate="visible"
            >
                <h1 className="text-2xl font-bold text-text-primary">Quản lý Người dùng</h1>
                
                <div className="flex flex-col sm:flex-row gap-4 w-full md:w-auto">
                    <div className="relative w-full md:w-72">
                        <input 
                            type="text"
                            placeholder="Tìm kiếm tên hoặc email..."
                            value={search}
                            onChange={handleSearch}
                            className="input-field w-full pl-10" 
                        />
                        <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-secondary" />
                    </div>
                    
                    <motion.button
                        onClick={() => setIsRegisterOpen(true)}
                        className="btn-accent-profile w-full sm:w-auto flex items-center justify-center gap-2"
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                    >
                        <PlusCircle size={18} />
                        Tạo User
                    </motion.button>
                </div>
            </motion.div>


            {/* === 3. SỬA LỖI RESPONSIVE (Giao diện Bảng) === */}
            {/* Thêm 'hidden' (ẩn ở mobile) và 'md:block' (hiện ở medium trở lên) */}
            <motion.div
                className="hidden md:block bg-surface rounded-lg shadow-md overflow-hidden"
                variants={motionVariants}
                initial="hidden"
                animate="visible"
                transition={{ delay: 0.1 }}
            >
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                        <tr>
                            <th className="th-table">Người dùng</th>
                            <th className="th-table">Tuổi</th>
                            <th className="th-table">Tổng đơn</th>
                            <th className="th-table">Tình trạng</th>
                            <th className="th-table">Hành động</th>
                        </tr>
                    </thead>
                    <tbody className="bg-surface divide-y divide-gray-200">
                        {loading ? (
                            <tr><td colSpan="5" className="text-center py-4 text-text-secondary">Đang tải...</td></tr>
                        ) : (
                            users.map((user, index) => ( 
                                <tr 
                                    key={user._id} 
                                    className={user.isBanned 
                                        ? "bg-red-50 text-red-700 hover:bg-red-100 cursor-pointer" 
                                        : "hover:bg-gray-50 cursor-pointer"
                                    }
                                    onClick={() => handleRowClick(user, index)} 
                                >
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="flex items-center">
                                            <img className="h-10 w-10 rounded-full object-cover" src={getAvatarUrl(user.avatar)} alt={user.name} />
                                            <div className="ml-4">
                                                <div className="text-sm font-medium text-text-primary">{user.name}</div>
                                                <div className="text-sm text-text-secondary">{user.email}</div>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-text-secondary">
                                        {calculateAge(user.dateOfBirth)}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-text-secondary">
                                        {(user.orderStats?.delivered || 0) + (user.orderStats?.processing || 0) + (user.orderStats?.returned || 0)}
                                    </td>
                                    <td className="px-6 py-4">
                                        {formatOrderStatusBadges(user.orderStats)}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                        <motion.button
                                            onClick={(e) => handleBanUser(e, user)} 
                                            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md transition-colors 
                                                ${user.isBanned 
                                                    ? "text-yellow-600 hover:bg-yellow-100" 
                                                    : "text-red-600 hover:bg-red-100"
                                                }`}
                                            whileHover={{ scale: 1.05 }}
                                            whileTap={{ scale: 0.95 }}
                                        >
                                            <UserX size={14} />
                                            {user.isBanned ? "Gỡ cấm" : "Cấm"}
                                        </motion.button>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </motion.div>

            {/* === 4. SỬA LỖI RESPONSIVE (Giao diện Thẻ Mobile) === */}
            {/* Thêm 'md:hidden' (ẩn ở medium trở lên) và 'space-y-4' (xếp 1 cột) */}
            <motion.div
                variants={motionVariants}
                initial="hidden"
                animate="visible"
                transition={{ delay: 0.1 }}
                className="md:hidden space-y-4" 
            >
                {loading ? (
                     <div className="text-center py-4 text-text-secondary">Đang tải...</div>
                ) : (
                    users.map((user, index) => ( 
                        <div
                            key={user._id}
                            className={`rounded-lg shadow-md p-4 cursor-pointer ${user.isBanned ? 'bg-red-50' : 'bg-surface'}`}
                            onClick={() => handleRowClick(user, index)} 
                        >
                            <div className="flex items-center mb-4 pb-4 border-b border-gray-200">
                                <img className="h-10 w-10 rounded-full object-cover" src={getAvatarUrl(user.avatar)} alt={user.name} />
                                <div className="ml-4">
                                    <div className={`text-sm font-medium ${user.isBanned ? 'text-red-700' : 'text-text-primary'}`}>{user.name}</div>
                                    <div className={`text-sm ${user.isBanned ? 'text-red-500' : 'text-text-secondary'}`}>{user.email}</div>
                                </div>
                                {user.isBanned && (
                                     <span className="ml-auto text-xs font-bold px-2 py-1 rounded-full bg-red-600 text-white">ĐÃ BỊ CẤM</span>
                                )}
                            </div>
                            <div className="grid grid-cols-2 gap-4 mb-4">
                                <div>
                                    <div className="text-xs text-text-secondary">Tuổi</div>
                                    <div className="text-sm font-medium text-text-primary">{calculateAge(user.dateOfBirth)}</div>
                                </div>
                                <div>
                                    <div className="text-xs text-text-secondary">Tình trạng đơn</div>
                                    {formatOrderStatusBadges(user.orderStats)}
                                </div>
                            </div>
                            
                            <div>
                                <motion.button
                                    onClick={(e) => handleBanUser(e, user)} 
                                    className={`w-full flex items-center justify-center gap-1.5 px-3 py-2 rounded-md transition-colors 
                                        ${user.isBanned 
                                            ? "text-yellow-700 bg-yellow-100 hover:bg-yellow-200" 
                                            : "text-red-600 bg-red-50 hover:bg-red-100"
                                        }`}
                                    whileHover={{ scale: 1.02 }}
                                    whileTap={{ scale: 0.98 }}
                                >
                                    <UserX size={14} />
                                    {user.isBanned ? "Gỡ cấm" : "Cấm người dùng"}
                                </motion.button>
                            </div>
                        </div>
                    ))
                )}
            </motion.div>
            {/* ================================== */}
            
            {/* 5. Phân trang (Đã gọi) */}
            {!loading && totalPages > 1 && (
                <Pagination
                    currentPage={page}
                    totalPages={totalPages}
                    onPageChange={setPage} 
                />
            )}

            {/* 6. Modal Detail (Đã truyền đúng props) */}
            {modalUser && (
                <UserDetail
                    user={modalUser}
                    onClose={() => setModalUser(null)}
                    onSave={handleAdminSave}
                    context="admin"
                    onNext={handleNextUser}
                    onPrev={handlePrevUser}
                />
            )}
            
            {/* 7. MODAL TẠO USER MỚI (GỌI REGISTER) */}
            <AnimatePresence>
                {isRegisterOpen && (
                    <motion.div
                        className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50"
                        variants={backdropVariants}
                        initial="hidden"
                        animate="visible"
                        exit="hidden"
                        onClick={() => setIsRegisterOpen(false)} 
                    >
                        <motion.div
                            className="bg-surface rounded-lg shadow-xl w-full max-w-lg max-h-[90vh] overflow-y-auto" 
                            variants={modalVariants}
                            initial="hidden"
                            animate="visible"
                            exit="exit"
                            onClick={(e) => e.stopPropagation()} 
                        >
                            <div className="flex items-center justify-between p-4 border-b border-gray-200">
                                <h2 className="text-lg font-semibold text-text-primary">
                                    Tạo Người dùng Mới
                                </h2>
                                <button onClick={() => setIsRegisterOpen(false)} className="text-text-secondary hover:text-accent">
                                    <XIcon size={24} />
                                </button>
                            </div>
                            <div className="p-6">
                                {/* Truyền 'context' để ẩn ảnh và 'onSuccess' để tải lại list */}
                                <Register 
                                    onSuccess={handleRegisterSuccess}
                                    onClose={() => setIsRegisterOpen(false)}
                                    context="admin" 
                                />
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
            {/* ================================== */}

        </div>
    );
};

export default Users;