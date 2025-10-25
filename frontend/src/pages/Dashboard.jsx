import { Outlet } from "react-router-dom";
import SideBar from "../components/Dashboard/SideBar";
import DashboardHeader from "../components/Dashboard/DashboardHeader"
import { useState } from "react";

const Dashboard = () => {
    const [isCollapsed, setSidebarCollapsed] = useState(false);

    return (
        <div className="flex min-h-screen bg-gray-100">
            <SideBar onToggle={setSidebarCollapsed} />

            <div
                className={`flex-1 flex flex-col transition-all duration-500 ease-in-out `}
            >

                <main className="p-6">
                    <Outlet />
                </main>
            </div>
        </div>
    );
};
export default Dashboard;
