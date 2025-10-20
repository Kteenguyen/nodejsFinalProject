import { LayoutDashboard, Globe, ShoppingCart, Layers, Settings } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useState } from "react";

const menuItems = [
    { label: "Dashboard", icon: LayoutDashboard, path: "/admin/dashboard" },
    { label: "Modern", icon: Globe, path: "/admin/modern" },
    { label: "eCommerce", icon: ShoppingCart, path: "/admin/ecommerce" },
    { label: "Frontend pages", icon: Layers, path: "/admin/pages" },
    { label: "Settings", icon: Settings, path: "/admin/settings" },
];

const SideBar = () => {
    const navigate = useNavigate();
    const [active, setActive] = useState("/admin/dashboard");

    const handleClick = (path) => {
        setActive(path);
        navigate(path);
    };

    return (
        <div className="min-h-screen w-64 bg-[#f8f9fa] shadow-md flex flex-col p-4">


            {/* Menu */}
            <nav className="flex flex-col gap-1">
                {menuItems.map((item) => {
                    const Icon = item.icon;
                    const isActive = active === item.path;
                    return (
                        <button
                            key={item.path}
                            onClick={() => handleClick(item.path)}
                            className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors duration-200
                ${isActive ? "bg-blue-50 text-blue-600" : "text-gray-700 hover:text-blue-600 hover:bg-blue-50"}
              `}
                        >
                            <Icon size={18} />
                            {item.label}
                        </button>
                    );
                })}
            </nav>
        </div>
    );
};

export default SideBar;
