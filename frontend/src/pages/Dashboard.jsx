import { Outlet } from "react-router-dom";
import { useState } from "react";
import SideBar from "../components/Dashboard/SideBar";

const Dashboard = () => {
  const [isCollapsed, setSidebarCollapsed] = useState(false);

  return (
    <div className="min-h-screen bg-gray-50"> {/* dùng bg-gray-50 nếu bạn chưa map 'bg-background' */}
      {/* Sidebar cố định, truyền callback để toggle */}
      <SideBar onToggle={setSidebarCollapsed} />

      {/* Nội dung chính */}
      <div
        className={`flex flex-col transition-all duration-300 ease-in-out ${
          isCollapsed ? "ml-20" : "ml-72"
        }`}
      >
        <main className="p-4 md:p-6 w-full">
          <Outlet />
        </main>
      </div>
    </div>
  );
};
export default Dashboard;
