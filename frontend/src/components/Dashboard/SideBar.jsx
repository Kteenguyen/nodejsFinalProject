// frontend/src/components/SideBar.jsx
import {
    LayoutDashboard,
    Users,
    ShoppingCart,
    Settings,
    Menu,
    ChevronLeft,
    LogOut
} from "lucide-react";

import { useNavigate, useLocation } from "react-router-dom";
import { useState, useEffect } from "react";
import { useAuth } from "../../context/AuthContext"; // 👈 BƯỚC 1: IMPORT useAuth

const menuItems = [
    { label: "Dashboard", icon: LayoutDashboard, path: "/admin/dashboard" },
    { label: "Users", icon: Users, path: "/admin/users" },
    { label: "Products", icon: ShoppingCart, path: "/admin/products" },
    { label: "Settings", icon: Settings, path: "/admin/settings" },
];

const SideBar = ({ onToggle }) => {
    const navigate = useNavigate();
    const location = useLocation();
    const { logout } = useAuth(); // 👈 BƯỚC 2: LẤY HÀM LOGOUT TỪ CONTEXT

    const [active, setActive] = useState(location.pathname);
    const [collapsed, setCollapsed] = useState(false);

    const toggleSidebar = () => {
        const newState = !collapsed;
        setCollapsed(newState);
        if (onToggle) onToggle(newState);
    };

    useEffect(() => {
        setActive(location.pathname);
    }, [location.pathname]);

    // 👇 BƯỚC 3: SỬA LẠI HÀM LOGOUT
    const handleLogout = async () => {
        try {
            await logout(); // Gọi hàm logout từ AuthContext (nó sẽ gọi API và clear state)
            console.log("SideBar: Đã gọi logout thành công.");
            navigate('/login'); // Chuyển hướng về trang đăng nhập
        } catch (error) {
            console.error("SideBar: Lỗi khi đăng xuất:", error);
            // Dù lỗi, vẫn ép chuyển hướng
            navigate('/login');
        }
    };

    return (
        <aside className={`flex flex-col h-screen bg-white shadow-lg
             transition-all duration-300 ease-in-out
             ${collapsed ? "w-20" : "w-64"}`}
        >
            {/* ... (Phần Logo và Nút Toggle giữ nguyên như file của fen) ... */}
            
            {/* Nút Toggle (ví dụ) */}
            <div className={`flex items-center border-b
                ${collapsed ? "justify-center" : "justify-between"}
                 px-4 py-4 h-[65px]`}>
                {!collapsed && (
                    <span className="font-semibold text-lg text-blue-600">Admin</span>
                )}
                <button onClick={toggleSidebar} className="text-gray-600 hover:text-blue-600">
                    {collapsed ? <Menu size={24} /> : <ChevronLeft size={24} />}
                </button>
            </div>

            {/* Menu */}
            <nav className="flex-1 px-4 py-4 space-y-2">
                {menuItems.map((item) => {
                    const isActive = active.startsWith(item.path);
                    return (
                        <button
                            key={item.label}
                            onClick={() => {
                                setActive(item.path);
                                navigate(item.path);
                            }}
                            className={`flex items-center gap-3 w-full px-3 py-3 rounded-xl transition font-medium
                                ${isActive ? "bg-blue-100 text-blue-600"
                                    : "text-gray-700 hover:text-blue-600 hover:bg-blue-50"}
                                ${collapsed ? "justify-center" : ""}
                            `}
                        >
                            <item.icon size={22} className={`${collapsed ? "" : "min-w-[22px]"}`} />
                            {!collapsed && <span>{item.label}</span>}
                        </button>
                    );
                })}
            </nav>

            {/* Khối Logout (Nút bấm đã gọi hàm handleLogout đã sửa) */}
            <div className={`w-full transition-all duration-300 mt-auto
                 ${collapsed ? "flex justify-center" : "px-4"}
                 py-4`}>
                <button
                    onClick={handleLogout}
                    className={`flex items-center gap-3 w-full py-3 rounded-xl transition font-medium
                        text-gray-700 hover:text-red-600 hover:bg-red-50
                        ${collapsed ? "justify-center" : "px-4"}
                    `}
                >
                    <LogOut size={22} className={`${collapsed ? "" : "min-w-[22px]"} rotate-180`} />
                    {!collapsed && <span>Đăng xuất</span>}
                </button>
            </div>
        </aside>
    );
};

export default SideBar;