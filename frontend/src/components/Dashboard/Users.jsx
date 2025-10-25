import { Search } from "lucide-react";
import { useState, useEffect } from "react";
import { fetchUsers, fetchUserDetail } from "../../controllers/userController";

const Users = () => {
    const [search, setSearch] = useState("");
    const [users, setUsers] = useState([]);
    const [modalUser, setModalUser] = useState(null);

    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [loading, setLoading] = useState(true);

    const getUsersData = async () => {
        setLoading(true);
        const data = await fetchUsers({ page, limit: 5, search });
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
        const detail = await fetchUserDetail(userId);
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
                                        <img src={u.avatar} className="w-10 h-10 rounded-lg" />
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
            <div className="flex justify-center gap-3 mt-5">
                <button
                    disabled={page === 1}
                    onClick={() => setPage(page - 1)}
                    className="px-3 py-2 border rounded-lg disabled:opacity-40 hover:bg-gray-100"
                >
                    Trước
                </button>
                <span className="font-medium">Trang {page}/{totalPages}</span>
                <button
                    disabled={page === totalPages}
                    onClick={() => setPage(page + 1)}
                    className="px-3 py-2 border rounded-lg disabled:opacity-40 hover:bg-gray-100"
                >
                    Sau
                </button>
            </div>

            <UserDetailModal user={modalUser} onClose={() => setModalUser(null)} />
        </div>
    );
};

export default Users;
