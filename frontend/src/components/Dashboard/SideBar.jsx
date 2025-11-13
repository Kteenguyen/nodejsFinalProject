// frontend/src/components/Dashboard/SideBar.jsx
import {
    LayoutDashboard, Users, ShoppingCart, Settings,
    Menu, ChevronLeft, LogOut, ClipboardList
} from "lucide-react";
import { useNavigate, useLocation } from "react-router-dom";
import { useState, useEffect } from "react";
import { useAuth } from "../../context/AuthContext"; // 👈 (Đảm bảo đường dẫn này đúng)

const menuItems = [
  { label: "Statistics", icon: LayoutDashboard, path: "/admin/dashboard" },
  { label: "Orders",    icon: ClipboardList,   path: "/admin/orders" },
  { label: "Users",     icon: Users,           path: "/admin/users" },
  { label: "Products",  icon: ShoppingCart,    path: "/admin/products" },
  { label: "Settings",  icon: Settings,        path: "/admin/settings" },
];

const SideBar = ({ onToggle }) => {
    const navigate = useNavigate();
    const location = useLocation();
    const { logout } = useAuth();

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

    // === (HÀM LOGOUT ĐÃ SỬA) ===
    const handleLogout = async () => {
        console.log("SideBar: Đang gọi logout...");
        try {
            await logout(); // (Hàm logout từ AuthContext sẽ gọi API và xóa cookie)
            console.log("SideBar: Đã gọi logout thành công.");
            navigate('/login');
        } catch (error) {
            console.error("SideBar: Lỗi khi logout:", error);
        }
    };

    return (
        // === SỬA LAYOUT: DÙNG 'fixed' ===
        <aside
            className={`
                fixed top-0 left-0 h-screen bg-white shadow-lg
                flex flex-col
                transition-all duration-300 ease-in-out
                ${collapsed ? "w-20" : "w-72"}
                z-40 
            `}
        >
            {/* ============================== */}

            {/* Khối Logo và Nút Toggle */}
            <div className={`
                flex items-center 
                ${collapsed ? "justify-center" : "justify-between"}
                p-4 h-[65px] border-b
            `}>
                {!collapsed && (
                    <h1
                        onClick={() => navigate('/')}
                        className="text-xl font-bold text-text-primary cursor-pointer"
                    >
                        FenShop
                    </h1>
                )}
                <button
                    onClick={toggleSidebar}
                    className="p-2 rounded-lg hover:bg-gray-100"
                >
                    {collapsed ? <Menu size={20} /> : <ChevronLeft size={20} />}
                </button>
            </div>

            {/* Khối Menu (Giữ nguyên logic của bạn) */}
            <nav className="flex-1 overflow-y-auto px-4 py-4 space-y-2">
                {menuItems.map((item) => {
                    const isActive = active.startsWith(item.path);
                    return (
                        <button
                            key={item.label}
                            onClick={() => navigate(item.path)}
                            className={`
                                flex items-center gap-3 w-full px-3 py-3 rounded-xl transition font-medium
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

            {/* Khối Logout (Giữ nguyên logic của bạn) */}
            <div className={`w-full transition-all duration-300 mt-auto
                 ${collapsed ? "flex justify-center" : "px-4"}
                 py-4 border-t`}>
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