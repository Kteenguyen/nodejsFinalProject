// frontend/src/pages/Admin/Users.jsx

// === SỬA LỖI 1: GỘP IMPORT ===
import React, { useState, useEffect, useCallback } from 'react'; 
import { Search, ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from "lucide-react";
// =============================

import { UserController } from "../../controllers/userController";
import UserDetail from "../../pages/UserDetail"; // (Đảm bảo đường dẫn này đúng)

const Users = () => {
    const [users, setUsers] = useState([]); // Khởi tạo là mảng rỗng   
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [loading, setLoading] = useState(true);
    const [limit, setLimit] = useState(5); 

    // === SỬA LỖI 2: BỔ SUNG STATE THIẾU ===
    const [search, setSearch] = useState('');
    const [modalUser, setModalUser] = useState(null); 
    // ===================================

    // === SỬA LỖI 3: CẤU TRÚC LẠI useEffect/useCallback (Sửa lỗi ReferenceError) ===
    // 1. Định nghĩa hàm getUsersData bằng useCallback
    const getUsersData = useCallback(async () => {
        setLoading(true);
        try {
            // Lỗi 401 (Lỗi 1) sẽ xảy ra ở đây, nhưng hàm catch sẽ xử lý
            const data = await UserController.getUsers({ page, limit, search });
            
            if (data && data.users) {
                setUsers(data.users);
                setTotalPages(data.totalPages || 1);
            } else {
                setUsers([]); // Nếu API lỗi (401), set mảng rỗng
            }
        } catch (error) {
            console.error("Lỗi khi tải users:", error);
            setUsers([]); // Nếu API crash, set mảng rỗng
        }
        setLoading(false);
    }, [page, limit, search]); // 👈 Thêm dependencies

    // 2. Gọi hàm đó bên trong useEffect
    useEffect(() => {
        getUsersData();
    }, [getUsersData]); // 👈 Gọi theo dependencies
    // =================================

    // Hàm xử lý Search
    const handleSearch = (e) => {
        e.preventDefault();
        setPage(1); // Reset về trang 1 khi tìm kiếm
        // Không cần gọi getUsersData() ở đây, vì 'useEffect' sẽ tự chạy khi 'search' thay đổi (nếu bạn muốn)
        // Hoặc bạn gọi trực tiếp:
        getUsersData(); 
    };

    // Hàm format ngày (Giữ nguyên của bạn)
    const formatDateTime = (isoDate) => {
        if (!isoDate) return 'N/A';
        const date = new Date(isoDate);
        return date.toLocaleDateString('vi-VN', {
            day: '2-digit', month: '2-digit', year: 'numeric',
            hour: '2-digit', minute: '2-digit'
        });
    };

    // Hàm format vai trò (Giữ nguyên của bạn)
    const formatRole = (role) => {
        if (role === 'admin') return <span className="px-2 py-0.5 text-xs font-medium rounded-full bg-red-100 text-red-700">Quản trị viên</span>;
        if (role === 'staff') return <span className="px-2 py-0.5 text-xs font-medium rounded-full bg-blue-100 text-blue-700">Nhân viên</span>;
        return <span className="px-2 py-0.5 text-xs font-medium rounded-full bg-gray-100 text-gray-700">Khách hàng</span>;
    };
    
    // (Phần JSX giữ nguyên từ file gốc của bạn)
    return (
        <div className="p-4 md:p-6 bg-gray-50 min-h-screen">
            <h1 className="text-2xl font-semibold text-gray-800 mb-4">Quản lý Người dùng</h1>

            {/* Thanh Search */}
            <form onSubmit={handleSearch} className="mb-4 flex gap-2">
                <div className="relative flex-grow">
                    <input
                        type="text"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        placeholder="Tìm theo tên, email, SĐT..."
                        className="w-full pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-accent"
                    />
                    <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                </div>
                <button type="submit" className="px-4 py-2 bg-accent text-white rounded-lg hover:bg-accent-hover">
                    Tìm kiếm
                </button>
            </form>

            {/* Bảng dữ liệu */}
            <div className="bg-white shadow rounded-lg overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Người dùng</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email/SĐT</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Vai trò</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Ngày tạo</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Hành động</th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        {loading ? (
                            <tr><td colSpan="5" className="text-center py-4 text-gray-500">Đang tải...</td></tr>
                        ) : (
                            users.map(user => (
                                <tr key={user._id} className="hover:bg-gray-50">
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="flex items-center">
                                            <img className="h-10 w-10 rounded-full object-cover" src={user.avatar || 'https://via.placeholder.com/100'} alt={user.name} />
                                            <div className="ml-4">
                                                <div className="text-sm font-medium text-gray-900">{user.name}</div>
                                                <div className="text-sm text-gray-500">{user.userName}</div>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="text-sm text-gray-900">{user.email}</div>
                                        <div className="text-sm text-gray-500">{user.phoneNumber || 'Chưa cập nhật'}</div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">{formatRole(user.role)}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{formatDateTime(user.createdAt)}</td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <button 
                                            onClick={() => setModalUser(user)}
                                            className="text-accent hover:text-accent-hover font-medium"
                                        >
                                            Xem chi tiết
                                        </button>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>

            {/* Phân trang (Pagination) */}
            <div className="mt-4 flex justify-between items-center">
                <span className="text-sm text-gray-700">
                    Trang {page} trên {totalPages}
                </span>
                <div className="flex items-center space-x-1">
                    <button
                        disabled={page === 1}
                        onClick={() => setPage(1)}
                        className="p-2 w-10 h-10 flex justify-center items-center rounded-lg disabled:opacity-40 disabled:cursor-not-allowed hover:bg-gray-100 transition"
                        aria-label="Trang đầu"
                    >
                        <ChevronsLeft size={18} />
                    </button>
                    <button
                        disabled={page === 1}
                        onClick={() => setPage(page - 1)}
                        className="p-2 w-10 h-10 flex justify-center items-center rounded-lg disabled:opacity-40 disabled:cursor-not-allowed hover:bg-gray-100 transition"
                        aria-label="Trang trước"
                    >
                        <ChevronLeft size={18} />
                    </button>
                    
                    <div className="flex items-center space-x-1">
                        {(() => {
                            const pageButtons = [];
                            let startPage = Math.max(1, page - 2);
                            let endPage = Math.min(totalPages, page + 2);

                            if (page - 2 <= 1) {
                                endPage = Math.min(totalPages, 5);
                            }
                            if (page + 2 >= totalPages) {
                                startPage = Math.max(1, totalPages - 4);
                            }

                            if (startPage > 1) {
                                pageButtons.push(<span key="start-dots" className="px-2 py-1 text-gray-500">...</span>);
                            }

                            for (let i = startPage; i <= endPage; i++) {
                                pageButtons.push(
                                    <button
                                        key={i}
                                        onClick={() => setPage(i)}
                                        className={`p-2 w-10 h-10 flex justify-center items-center rounded-lg transition
                                            ${i === page 
                                                ? 'bg-accent text-white font-bold' 
                                                : 'hover:bg-gray-100 text-gray-700'
                                            }`}
                                    >
                                        {i}
                                    </button>
                                );
                            }

                            if (endPage < totalPages) {
                                pageButtons.push(<span key="end-dots" className="px-2 py-1 text-gray-500">...</span>);
                            }
                            return pageButtons;
                        })()}
                    </div>

                    <button
                        disabled={page === totalPages}
                        onClick={() => setPage(page + 1)}
                        className="p-2 w-10 h-10 flex justify-center items-center rounded-lg disabled:opacity-40 disabled:cursor-not-allowed hover:bg-gray-100 transition"
                        aria-label="Trang sau"
                    >
                        <ChevronRight size={18} />
                    </button>
                    <button
                        disabled={page === totalPages}
                        onClick={() => setPage(totalPages)}
                        className="p-2 w-10 h-10 flex justify-center items-center rounded-lg disabled:opacity-40 disabled:cursor-not-allowed hover:bg-gray-100 transition"
                        aria-label="Trang cuối"
                    >
                        <ChevronsRight size={18} />
                    </button>
                </div>
            </div>

            <UserDetail user={modalUser} onClose={() => setModalUser(null)} />
        </div>
    );
};

export default Users;