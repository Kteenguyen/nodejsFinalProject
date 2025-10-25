import { Route, Routes, Navigate } from "react-router-dom";
import Dashboard from "../pages/Dashboard";
import DashboardHome from "../components/Dashboard/DashboardHome";
import Users from "../components/Dashboard/Users";
import ProductManagement from "../components/Dashboard/ProductManagement";
import Settings from "../components/Dashboard/Settings";

const DashboardRoutes = () => {
    return (
        <Routes>
            <Route path="/" element={<Dashboard />}>
                <Route path="dashboard" element={<DashboardHome />} />
                <Route path="users" element={<Users />} />
                <Route path="products" element={<ProductManagement />} />
                <Route path="settings" element={<Settings />} />
                <Route path="*" element={<Navigate to="dashboard" />} />
            </Route>
        </Routes>
    );
};

export default DashboardRoutes;
