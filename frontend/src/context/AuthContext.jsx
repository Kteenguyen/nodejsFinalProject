// frontend/src/context/AuthContext.jsx
import { createContext, useContext, useState, useEffect, useCallback } from "react";
import { AuthController } from "../controllers/AuthController";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [isLoadingAuth, setIsLoadingAuth] = useState(true);

    // ✅ Hàm gọi API (/api/users/profile) để kiểm tra cookie
    const checkAuthStatus = useCallback(async () => {
        setIsLoadingAuth(true);
        try {
            const result = await AuthController.checkAuth();

            if (result.isAuthenticated && result.user) {
                setUser(result.user);
                setIsAuthenticated(true);
                console.log("AuthContext: User authenticated from cookie:", result.user.email);
            } else {
                setUser(null);
                setIsAuthenticated(false);
                console.log("AuthContext: User not authenticated.");
            }
        } catch (error) {
            // (Đã sửa ở bước trước: Chỉ log lỗi nếu không phải 401)
            if (error.response && error.response.status !== 401) {
                console.error("AuthContext: Error checking auth (not 401):", error);
            } else {
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

    // 👉 Hàm login (ĐÃ SỬA CONSOLE.LOG)
    const login = (userInfo) => {
        setUser(userInfo);
        setIsAuthenticated(true);

        // 👇👇👇 SỬA LẠI DÒNG NÀY ĐỂ DEBUG 👇👇👇
        // (Log cả object thay vì chỉ .email, vì 'register' có thể không trả về email)
        console.log("AuthContext: Login successful. Received userInfo object:", userInfo);
    };

    // 👉 Hàm logout (gọi API để backend xóa cookie)
    const logout = async () => {
        try {
            await AuthController.logout();
            setUser(null);
            setIsAuthenticated(false);
            console.log("AuthContext: User logged out.");
        } catch (error) {
            console.error("AuthContext: Error during logout:", error);
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
        checkAuthStatus
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