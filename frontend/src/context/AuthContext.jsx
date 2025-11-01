// frontend/src/context/AuthContext.jsx
import { createContext, useContext, useState, useEffect, useCallback } from "react";
import { AuthController } from "../controllers/AuthController"; // Import AuthController

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [isLoadingAuth, setIsLoadingAuth] = useState(true); // State loading

    // ✅ Hàm gọi API (/api/users/profile) để kiểm tra cookie
    const checkAuthStatus = useCallback(async () => {
        setIsLoadingAuth(true);
        try {
            const result = await AuthController.checkAuth();

            if (result.isAuthenticated && result.user) {
                // ... (logic thành công) ...
                console.log("AuthContext: User authenticated from cookie:", result.user.email);
            } else {
                // ... (logic thất bại) ...
                console.log("AuthContext: User not authenticated."); // ✅ Chỉ log thông báo này, không phải lỗi đỏ
            }
        } catch (error) {
            // ✅ Chỉ log lỗi ra console nếu nó KHÔNG phải 401
            if (error.response && error.response.status !== 401) {
                console.error("AuthContext: Error checking auth (not 401):", error);
            } else {
                // Nếu là lỗi 401, không cần log lỗi đỏ nữa
                console.log("AuthContext: No valid authentication token found.");
            }
            setUser(null);
            setIsAuthenticated(false);
        } finally {
            setIsLoadingAuth(false);
        }
    }, []);

    // ✅ Tự động kiểm tra khi app tải lần đầu
    useEffect(() => {
        checkAuthStatus();
    }, [checkAuthStatus]);

    // 👉 Hàm login (chỉ cần nhận userInfo)
    // (Vì backend đã set cookie khi gọi API login/googleLogin)
    const login = (userInfo) => {
        setUser(userInfo);
        setIsAuthenticated(true);
        console.log("AuthContext: Login successful for user:", userInfo.email);
    };

    // 👉 Hàm logout (gọi API để backend xóa cookie)
    const logout = async () => {
        try {
            await AuthController.logout(); // Gọi API /logout
            setUser(null);
            setIsAuthenticated(false);
            console.log("AuthContext: User logged out.");
        } catch (error) {
            console.error("AuthContext: Error during logout:", error);
            // Dù lỗi API, frontend vẫn clear state
            setUser(null);
            setIsAuthenticated(false);
        }
    };

    // Giá trị cung cấp cho các component con
    const authContextValue = {
        user,
        isAuthenticated,
        isLoadingAuth,
        login,
        logout,
        checkAuthStatus // Dùng để refresh
    };

    // Hiển thị loading trong khi kiểm tra auth lần đầu
    if (isLoadingAuth) {
        return <div>Đang tải dữ liệu người dùng...</div>;
    }

    return (
        <AuthContext.Provider value={authContextValue}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);