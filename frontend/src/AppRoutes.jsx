import Header from "./components/Home/Header";
import Home from './pages/Home';
import { useEffect } from "react";
import Login from './pages/Login';
import Register from './pages/Register';
import { AuthController } from "./controllers/AuthController";
import { Route, Routes, useLocation, useNavigate } from 'react-router-dom';
function App() {
    const location = useLocation();
    const navigate = useNavigate();
    // Ẩn header ở /login và /register
    const hideHeader =
        location.pathname === "/login" || location.pathname === "/register";


    //  Kiểm tra auth khi load app
    useEffect(() => {
        const isAuth = AuthController.checkAuth();
        if (!isAuth && window.location.pathname !== "/login" && window.location.pathname !== "/register") {
            navigate('/');
        }
    }, [navigate]);

    // Route logout → tự động gọi controller và điều hướng
    const LogoutRoute = () => {
        useEffect(() => {
            const handleLogout = async () => {
                await AuthController.logout();
                navigate("/login");
            };
            handleLogout();
        }, [navigate]);

        return <p>Đang đăng xuất...</p>;
    };

    return (
        <div>
            {!hideHeader && <Header />}
            <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />
                <Route path="/logout" element={<LogoutRoute />} />
                {/* Thêm các route khác ở đây */}
            </Routes>
        </div>
    );
}

export default App;
