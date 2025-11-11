// frontend/src/pages/Admin/Dashboard.jsx
import { Outlet } from "react-router-dom";
import SideBar from "../components/Dashboard/SideBar"; // (Đường dẫn gốc của bạn)
import { useState } from "react";

const Dashboard = () => {
    const [isCollapsed, setSidebarCollapsed] = useState(false);

    return (
        // 1. Xóa 'flex'
        // (Đã đổi bg-gray-100 thành bg-background để dùng theme)
        <div className="min-h-screen bg-background">

            {/* 2. Sidebar được gọi, nó sẽ tự 'fixed' vào vị trí */}
            <SideBar onToggle={setSidebarCollapsed} />

            {/* 3. Nội dung chính (Outlet) */}
            <div
                className={`
                    flex flex-col
                    transition-all duration-300 ease-in-out
                    ${isCollapsed ? "ml-20" : "ml-72"} 
                `}
            >
                {/* (Đã thêm p-4 md:p-6 để responsive) */}
                <main className="p-4 md:p-6 w-full">
                    <Outlet />
                </main>
            </div>
        </div>
    );
};
export default Dashboard;