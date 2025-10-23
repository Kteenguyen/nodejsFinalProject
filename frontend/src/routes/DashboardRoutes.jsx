import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import DashboardHome from '../components/Dashboard/DashboardHome.jsx';
import DashboardLayout from '../components/Dashboard/DashboardLayout.jsx';
import UserManagement from '../components/Dashboard/UserManagement.jsx';
import ProducrManagement from '../components/Dashboard/ProductManagement.jsx';
import Settings from '../components/Dashboard/Settings.jsx';
const DashboardRoutes = () => {
    return (
        <Routes>
            <Route element={<DashboardLayout />}>
                <Route path="/admin/dashboard" element={<DashboardHome />} />
                <Route path="/admin/users" element={<UserManagement />} />
                <Route path="/admin/products" element={<ProducrManagement />} />
                <Route path="/admin/settings" element={<Settings />} />
                <Route path="*" element={<Navigate to="/admin/dashboard" />} />
            </Route>
        </Routes>
    );

}
export default DashboardRoutes;