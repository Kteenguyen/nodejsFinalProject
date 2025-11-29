import { Route, Routes, Navigate } from "react-router-dom";
import Dashboard from "../pages/Dashboard";
import Users from "../components/Dashboard/Users";
import ProductManagement from "../components/Dashboard/ProductManagement";
import Settings from "../components/Dashboard/Settings";
import DashboardAdvanced from "../pages/DashboardAdvanced";
import AdminOrders from "../pages/AdminOrders";
import AdminProductEditPage from "../pages/AdminProductEditPage";
import AdminProductNewPage from "../pages/AdminProductNewPage";
import AdminOrderDetail from "../pages/AdminOrderDetail";
import DiscountManagement from "../pages/DiscountManagement";
import AdminManagement from "../pages/AdminManagement";
import CategoriesManagement from "../pages/CategoriesManagement";
import OrderDetailPage from "../pages/OrderDetailPage";

export default function DashboardRoutes() {
  return (
    <Routes>
      <Route path="/" element={<Dashboard />}>

        {/* Route mặc định: Chuyển hướng về /admin/dashboard */}
        <Route index element={<Navigate to="/admin/dashboard" replace />} />

        {/* Các trang chức năng */}
        <Route path="dashboard" element={<DashboardAdvanced />} />
        <Route path="management" element={<AdminManagement />} />
        <Route path="users" element={<Users />} />
        <Route path="settings" element={<Settings />} />
        <Route path="categories" element={<CategoriesManagement />} />

        {/* --- QUẢN LÝ SẢN PHẨM --- */}
        <Route path="products" element={<ProductManagement />} />
        <Route path="products/new" element={<AdminProductNewPage />} />
        <Route path="products/:id/edit" element={<AdminProductEditPage />} />

        {/* --- QUẢN LÝ ĐƠN HÀNG --- */}
        {/* 1. Danh sách đơn hàng */}
        <Route path="orders" element={<AdminOrders />} />

        {/* 2. Chi tiết đơn hàng (Lưu ý: path tương đối, không có /admin ở đầu) */}
        <Route path="orders/:id" element={<AdminOrderDetail />} />

        {/* --- CỤM DISCOUNT (QUAN TRỌNG) --- */}
        <Route path="discounts" element={<DiscountManagement />} />

        {/* --- FALLBACK (CHỐNG LỖI LẶP) --- */}
        {/* Nếu đường dẫn sai, buộc quay về trang chủ Dashboard tuyệt đối */}
        <Route path="*" element={<Navigate to="/admin/dashboard" replace />} />

      </Route>
    </Routes>
  );
}