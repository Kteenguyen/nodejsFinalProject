// frontend/src/routes/AppRoutes.jsx
import Header from "../components/Home/Header";
import Home from '../pages/Home';
import { useEffect } from "react"; // chỉ cần useEffect cho LogoutRoute
import Login from '../pages/Login';
import Register from '../pages/Register';
import RegisterAddress from '../pages/RegisterAddress';
import { AuthController } from "../controllers/AuthController";
import { Route, Routes, useLocation, useNavigate, useParams } from 'react-router-dom';
import DashboardRoutes from "./DashboardRoutes";
import ForgotPassword from '../pages/ForgotPassword';
import ResetPassword from '../pages/ResetPassword';
import { useAuth } from "../context/AuthContext";
import ProfilePage from '../pages/ProfilePage';
import ProductsPage from '../pages/ProductsPage';
import ProductDetail from '../pages/ProductDetail';
import ProductsSearch from "../pages/ProductsSearch";
import CartPage from "../pages/CartPage";
import CategoryProducts from '../components/Home/CategoryProducts';
import RequireAdmin from "./RequireAdmin";

function App() {
  const location = useLocation();
  const navigate = useNavigate();
  const { logout } = useAuth();

  const hideHeader =
    location.pathname.startsWith("/admin") ||
    location.pathname === "/login" ||
    location.pathname === "/register" ||
    location.pathname === "/register-address";

  const LogoutRoute = () => {
    const { logout } = useAuth();
    const navigate = useNavigate();

    useEffect(() => {
      let cancelled = false;
      (async () => {
        try {
          await logout(); // gọi API + clear state
          if (!cancelled) navigate("/login", { replace: true });
        } catch (err) {
          console.error("Logout failed:", err);
          if (!cancelled) navigate("/login", { replace: true });
        }
      })();
      return () => { cancelled = true; };
    }, [logout, navigate]); // ✅ deps hợp lệ, không cảnh báo

    return <p>Đang đăng xuất...</p>;
  };

  // ====== NEW: wrapper lấy :id và truyền vào ProductDetail ======
  const ProductDetailRoute = () => {
    const { id } = useParams(); // /products/:id
    return <ProductDetail productId={id} />;
  };

  // ====== NEW: wrapper cho trang danh mục dùng CategoryProducts ======
  const CategoryRoute = () => {
    const { categoryId } = useParams(); // /category/:categoryId
    const title = `Danh mục: ${categoryId}`;
    return <CategoryProducts categoryId={categoryId} title={title} />;
  };

  return (
    <div>
      {!hideHeader && <Header />}
      <Routes>
        {/* Public */}
        <Route path="/" element={<Home />} />
        <Route path="/products" element={<ProductsPage />} />
        <Route path="/search" element={<ProductsSearch />} />
        <Route path="/products/:id" element={<ProductDetail />} />  {/* #11 */}
        <Route path="/cart" element={<CartPage />} />                     {/* #17 */}
        <Route path="/category/:categoryId" element={<CategoryRoute />} />{/* #16 (ordering trong component) */}
        <Route path="/profile" element={<ProfilePage />} />

        {/* Auth */}
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/register-address" element={<RegisterAddress />} />
        <Route path="/logout" element={<LogoutRoute />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/reset-password/:token" element={<ResetPassword />} />
        {/* Admin */}
        <Route path="/admin/*" element={<DashboardRoutes />} />
      </Routes>
    </div>
  );
}

export default App;
