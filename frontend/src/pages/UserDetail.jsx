const UserDetail = ({ onClose, user }) => {
    if (!user) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex justify-center items-center z-50">
            <div className="bg-white rounded-xl p-6 w-[350px] animate-fadeIn">
                <h3 className="text-lg font-bold mb-4">Chi tiết người dùng</h3>

                <div className="flex items-center gap-3 mb-4">
                    <img
                        src={user.avatar}
                        className="w-12 h-12 rounded-lg border"
                    />
                    <div>
                        <p className="font-semibold">{user.name}</p>
                        <p className="text-gray-500 text-sm">{user.email}</p>
                    </div>
                </div>

                <p><strong>Tuổi:</strong> {user.age || "–"}</p>
                <p><strong>Số đơn hàng:</strong> {user.delivered + user.pending + user.canceled}</p>

                <button
                    className="w-full mt-5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg"
                    onClick={onClose}
                >
                    Đóng
                </button>
            </div>
        </div>
    );
};

export default UserDetail;
