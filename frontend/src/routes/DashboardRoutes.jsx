import { Route, Routes, Navigate } from "react-router-dom";
import Dashboard from "../pages/Dashboard";
import Users from "../components/Dashboard/Users";
import ProductManagement from "../components/Dashboard/ProductManagement";
import Settings from "../components/Dashboard/Settings";
import DashboardAdvanced from "../pages/DashboardAdvanced";
import AdminOrders from "../pages/AdminOrders";

export default function DashboardRoutes() {
  return (
    <Routes>
      <Route path="/" element={<Dashboard />}>
        {/* dùng Advanced */}
        <Route path="dashboard" element={<DashboardAdvanced />} />
        <Route path="users" element={<Users />} />
        <Route path="orders" element={<AdminOrders />} />
        <Route path="products" element={<ProductManagement />} />
        <Route path="settings" element={<Settings />} />
        <Route path="*" element={<Navigate to="dashboard" replace />} />
      </Route>
    </Routes>
  );
}