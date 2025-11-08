import { Search, ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from "lucide-react"; import { useState, useEffect } from "react";
import { UserController } from "../../controllers/userController";
import UserDetail from "../../pages/UserDetail";
const Users = () => {
    const [search, setSearch] = useState("");
    const [users, setUsers] = useState([]);
    const [modalUser, setModalUser] = useState(null);

    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [loading, setLoading] = useState(true);

    const getUsersData = async () => {
        setLoading(true);
        const data = await UserController.getUsers({ page, limit: 5, search });
        setUsers(data.users);
        setTotalPages(data.totalPages);
        setLoading(false);
    };

    // Debounce Search
    useEffect(() => {
        const delay = setTimeout(() => {
            setPage(1);
            getUsersData();
        }, 500);
        return () => clearTimeout(delay);
    }, [search]);

    useEffect(() => {
        getUsersData();
    }, [page]);

    const openDetail = async (userId) => {
        const detail = await UserController.getUserDetail(userId);
        setModalUser(detail.user);
    };

    if (loading) return <p className="p-6">Đang tải...</p>;

    return (
        <div className="p-6">
            <div className="flex justify-between mb-6">
                <h2 className="text-2xl font-semibold">Quản lý tài khoản</h2>

                <div className="flex items-center bg-white px-4 py-2 rounded-lg shadow border">
                    <Search size={18} className="text-gray-500" />
                    <input
                        className="ml-2 outline-none bg-transparent text-sm"
                        placeholder="Tìm kiếm..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                    />
                </div>
            </div>

            <div className="bg-white rounded-xl shadow-lg overflow-hidden">
                <table className="w-full text-sm">
                    <thead className="bg-gray-50 text-gray-600">
                        <tr>
                            <th className="p-3 text-left">Người dùng</th>
                            <th className="p-3 text-center">Tuổi</th>
                            <th className="p-3 text-center">Số đơn hàng</th>
                            <th className="p-3 text-center">Tình trạng</th>
                        </tr>
                    </thead>

                    <tbody>
                        {users.map((u) => {
                            const totalOrders = u.delivered + u.pending + u.canceled;
                            return (
                                <tr
                                    key={u.userId}
                                    className="border-b hover:bg-blue-50 cursor-pointer transition"
                                    onClick={() => openDetail(u.userId)}
                                >
                                    <td className="p-3 flex items-center gap-3">
                                        <img
                                            src={u.avatar ? u.avatar : '/img/male_unknown_user.png'}
                                            className="w-10 h-10 rounded-lg"

                                            alt="No image"
                                        />
                                        {u.name}
                                    </td>

                                    <td className="p-3 text-center">{u.age || "–"}</td>

                                    <td className="p-3 text-center font-semibold">
                                        {totalOrders}
                                    </td>

                                    <td className="p-3 text-center">
                                        <div className="flex flex-col gap-1 items-center">

                                            {/* Delivered */}
                                            <span className="bg-green-100 text-green-700 px-3 py-1 rounded-full text-xs">
                                                Đã giao hàng ({u.delivered})
                                            </span>

                                            {/* Pending */}
                                            <span className="bg-yellow-100 text-yellow-700 px-3 py-1 rounded-full text-xs">
                                                Đang duyệt ({u.pending})
                                            </span>

                                            {/* Canceled */}
                                            <span className="bg-red-100 text-red-700 px-3 py-1 rounded-full text-xs">
                                                Hủy đơn ({u.canceled})
                                            </span>

                                        </div>
                                    </td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
            </div>

            {/* Pagination */}
            {/* --- Bắt đầu khối Pagination MỚI --- */}
            <div className="flex justify-center items-center gap-2 mt-6">

                {/* Nút Về Trang Đầu */}
                <button
                    disabled={page === 1}
                    onClick={() => setPage(1)}
                    className="p-2 w-10 h-10 flex justify-center items-center rounded-lg disabled:opacity-40 disabled:cursor-not-allowed hover:bg-gray-100 transition"
                    aria-label="Trang đầu"
                >
                    <ChevronsLeft size={18} />
                </button>

                {/* Nút Lùi 1 Trang */}
                <button
                    disabled={page === 1}
                    onClick={() => setPage(page - 1)}
                    className="p-2 w-10 h-10 flex justify-center items-center rounded-lg disabled:opacity-40 disabled:cursor-not-allowed hover:bg-gray-100 transition"
                    aria-label="Trang trước"
                >
                    <ChevronLeft size={18} />
                </button>

                {/* Hiển thị các số trang */}
                <div className="flex items-center gap-2">
                    {(() => {
                        // ----- Logic hiển thị số trang -----
                        const pagesToShow = 3; // Hiển thị 3 số trang (VD: 4, 5, 6)
                        let startPage = Math.max(1, page - Math.floor(pagesToShow / 2));
                        let endPage = Math.min(totalPages, startPage + pagesToShow - 1);
                        startPage = Math.max(1, endPage - pagesToShow + 1);

                        const pageButtons = [];

                        // Hiển thị '...' nếu không bắt đầu từ trang 1
                        if (startPage > 1) {
                            pageButtons.push(<span key="start-dots" className="px-2 py-1 text-gray-500">...</span>);
                        }

                        // Render các nút số trang
                        for (let i = startPage; i <= endPage; i++) {
                            pageButtons.push(
                                <button
                                    key={i}
                                    onClick={() => setPage(i)}
                                    className={`p-2 w-10 h-10 flex justify-center items-center rounded-lg transition font-medium
                            ${i === page
                                            ? 'bg-blue-600 text-white shadow-md' // Style cho trang hiện tại
                                            : 'hover:bg-gray-100' // Style cho trang khác
                                        }
                        `}
                                >
                                    {i}
                                </button>
                            );
                        }

                        // Hiển thị '...' nếu không kết thúc ở trang cuối
                        if (endPage < totalPages) {
                            pageButtons.push(<span key="end-dots" className="px-2 py-1 text-gray-500">...</span>);
                        }

                        return pageButtons;
                        // ----- Kết thúc logic -----
                    })()}
                </div>

                {/* Nút Tiến 1 Trang */}
                <button
                    disabled={page === totalPages}
                    onClick={() => setPage(page + 1)}
                    className="p-2 w-10 h-10 flex justify-center items-center rounded-lg disabled:opacity-40 disabled:cursor-not-allowed hover:bg-gray-100 transition"
                    aria-label="Trang sau"
                >
                    <ChevronRight size={18} />
                </button>

                {/* Nút Về Trang Cuối */}
                <button
                    disabled={page === totalPages}
                    onClick={() => setPage(totalPages)}
                    className="p-2 w-10 h-10 flex justify-center items-center rounded-lg disabled:opacity-40 disabled:cursor-not-allowed hover:bg-gray-100 transition"
                    aria-label="Trang cuối"
                >
                    <ChevronsRight size={18} />
                </button>
            </div>
            {/* --- Kết thúc khối Pagination MỚI --- */}

            <UserDetail user={modalUser} onClose={() => setModalUser(null)} />
        </div>
    );
};

export default Users;
