// frontend/src/context/AuthContext.jsx
import { createContext, useContext, useState, useEffect, useCallback } from "react";
import { AuthController } from "../controllers/AuthController";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [isLoadingAuth, setIsLoadingAuth] = useState(true);

    const checkAuthStatus = useCallback(async () => {
        setIsLoadingAuth(true);
        try {
            const result = await AuthController.checkAuth();

            if (result.isAuthenticated && result.user) {
                setUser(result.user);
                setIsAuthenticated(true);
                // Log thành công chỉ 1 lần
                // console.log("AuthContext: User authenticated from cookie:", result.user.email); 
            } else {
                setUser(null);
                setIsAuthenticated(false);
            }
        } catch (error) {
            // 👇👇👇 KHỐI CODE ĐÃ SỬA ĐỂ XỬ LÝ LỖI 401 ÍT LƯU Ý HƠN 👇👇👇
            if (error.response && error.response.status === 401) {
                console.log("AuthContext: No active session (401 Unauthorized).");
            } else {
                // Log các lỗi khác một cách nghiêm túc hơn
                console.error("AuthContext: Error checking authentication status:", error);
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

    const login = (userInfo) => {
        setUser(userInfo);
        setIsAuthenticated(true);
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