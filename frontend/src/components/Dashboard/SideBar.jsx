import {
    LayoutDashboard,
    Users,
    ShoppingCart,
    Settings,
    Menu,
    ChevronLeft
} from "lucide-react";

import { useNavigate, useLocation } from "react-router-dom";
import { useState, useEffect } from "react";

const menuItems = [
    { label: "Dashboard", icon: LayoutDashboard, path: "/admin/dashboard" },
    { label: "Users", icon: Users, path: "/admin/users" },
    { label: "Products", icon: ShoppingCart, path: "/admin/products" },
    { label: "Settings", icon: Settings, path: "/admin/settings" },
];

const SideBar = ({ onToggle }) => {
    const navigate = useNavigate();
    const location = useLocation();

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

    return (
        <div className={`min-h-screen bg-white shadow-xl border-r flex flex-col
            transition-all duration-500 ease-in-out mt-6 rounded-r-2xl
            ${collapsed ? "w-20" : "w-64"}`}>

            {/* Top Section */}
            <div className="flex flex-col items-center w-full py-4 space-y-3">

                {/* Avatar */}
                <img
                    src="/img/logo.png"
                    alt="Admin"
                    className="w-14 h-14 object-cover rounded-lg border border-gray-300 shadow"
                />

                {/* Admin Info */}
                {!collapsed && (
                    <div className="text-center">
                        <p className="font-semibold text-gray-800 text-sm">Nguyễn Khoa Tài</p>
                        <p className="text-xs text-gray-500 -mt-1">Administrator</p>
                    </div>
                )}

                {/* Toggle Button */}
                <button
                    onClick={toggleSidebar}
                    className="p-2 hover:bg-gray-200 rounded-lg transition"
                >
                    {collapsed ? <Menu size={22} /> : <ChevronLeft size={22} />}
                </button>

            </div>

            {/* Menu */}
            <nav className={`flex flex-col gap-2 w-full transition-all duration-300
                ${collapsed ? "items-center" : "items-start px-4"}`}>

                {menuItems.map((item) => {
                    const Icon = item.icon;
                    const isActive = active === item.path;

                    return (
                        <button
                            key={item.path}
                            onClick={() => navigate(item.path)}
                            className={`flex items-center gap-3 w-full py-3 rounded-xl transition font-medium
                                ${isActive ? "bg-blue-100 text-blue-600"
                                    : "text-gray-700 hover:text-blue-600 hover:bg-blue-50"}
                                ${collapsed ? "justify-center" : ""}
                            `}
                        >
                            <Icon size={22} className={`${collapsed ? "" : "min-w-[22px]"}`} />
                            {!collapsed && <span>{item.label}</span>}
                        </button>
                    );
                })}
            </nav>

        </div>
    );
};

export default SideBar;
