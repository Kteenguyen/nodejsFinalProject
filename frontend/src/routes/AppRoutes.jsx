// frontend/src/routes/AppRoutes.jsx
import Header from "../components/Home/Header";
import Home from '../pages/Home';
import { useEffect } from "react"; // Chỉ cần useEffect cho LogoutRoute
import Login from '../pages/Login';
import Register from '../pages/Register';
import RegisterAddress from '../pages/RegisterAddress';
import { AuthController } from "../controllers/AuthController";
import { Route, Routes, useLocation, useNavigate } from 'react-router-dom';
import DashboardRoutes from "./DashboardRoutes";
import { useAuth } from "../context/AuthContext";

function App() {
    const location = useLocation();
    const navigate = useNavigate();
    const { logout, isLoadingAuth } = useAuth();
    const hideHeader =
        location.pathname.startsWith("/admin") ||
        location.pathname === "/login" ||
        location.pathname === "/register"||
        location.pathname === "/register-address";


    const LogoutRoute = () => {
        useEffect(() => {
            const handleLogout = async () => {
                try {
                    // 1. Gọi API (Backend xóa cookie)
                    await AuthController.logout();
                } catch (err) {
                    console.error("Logout API failed:", err);
                    // Dù API lỗi, vẫn ép logout ở frontend
                } finally {
                    // 2. Cập nhật AuthContext (Frontend xóa state)
                    logout();
                    // 3. Điều hướng về login
                    navigate("/login");
                }
            };
            handleLogout();
            // Thêm logout và navigate làm dependencies
        }, [logout, navigate]);

        return <p>Đang đăng xuất...</p>;
    };


    return (
        <div>
            {!hideHeader && <Header />}
            <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />
                <Route path="/register-address" element={<RegisterAddress />} />

                <Route path="/logout" element={<LogoutRoute />} />
                {/* Route admin bây giờ sẽ cần cơ chế bảo vệ riêng bên trong DashboardRoutes */}
                <Route path="/admin/*" element={<DashboardRoutes />} />
            </Routes>
        </div>
    );
}

export default App;