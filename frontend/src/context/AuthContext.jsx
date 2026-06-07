// frontend/src/context/AuthContext.jsx
import React, { createContext, useContext, useState, useEffect } from 'react';
// ❗ NÂNG CẤP: Import AuthController
import { AuthController } from '../controllers/AuthController';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);

    // ❗ NÂNG CẤP 1: Thêm state isLoading
    // State này rất quan trọng để "chờ" check session khi F5
    const [isLoading, setIsLoading] = useState(true);

    /**
     * useEffect chạy 1 LẦN KHI APP LOAD
     * Nhiệm vụ: Kiểm tra token trong localStorage và gọi API để lấy user info
     */
    const checkUserStatus = async () => {
        try {
            console.log('🔍 AuthContext: Checking session...');
            
            // Kiểm tra token trong localStorage
            const token = localStorage.getItem('token');
            if (!token) {
                console.log('❌ AuthContext: No token in localStorage');
                setUser(null);
                setIsLoading(false);
                return;
            }
            
            console.log('✅ AuthContext: Token found, checking session...');
            // Có token thì gọi API để lấy user info
            const response = await AuthController.checkSession();
            console.log('📡 AuthContext: checkSession response:', response);

            // Backend trả về { isAuthenticated: true, user: {...} }
            if (response.isAuthenticated && response.user) {
                console.log('✅ AuthContext: User restored:', response.user);
                setUser(response.user);
                // Lưu userData vào localStorage khi restore session
                localStorage.setItem('userData', JSON.stringify(response.user));
            } else {
                console.log('❌ AuthContext: No authenticated user');
                setUser(null);
                // Token không hợp lệ, xóa đi
                localStorage.removeItem('token');
                localStorage.removeItem('userData');
            }

        } catch (error) {
            // Token hết hạn hoặc không hợp lệ
            console.error('⚠️ AuthContext: Error checking session:', error);
            setUser(null);
            localStorage.removeItem('token');
            localStorage.removeItem('userData');
        } finally {
            // Báo là đã load xong, cho phép app render
            setIsLoading(false);
        }
    };

    useEffect(() => {
        checkUserStatus();

        // Đồng bộ hóa đăng nhập/đăng xuất giữa các tab trình duyệt
        const handleStorageChange = (e) => {
            if (e.key === 'token') {
                if (!e.newValue) {
                    setUser(null);
                } else {
                    checkUserStatus();
                }
            }
        };
        window.addEventListener('storage', handleStorageChange);
        return () => window.removeEventListener('storage', handleStorageChange);
    }, []); // Mảng rỗng = chỉ chạy 1 lần khi F5

    /**
     * Hàm login
     */
    const login = (userInfo) => {
        setUser(userInfo);
        // Lưu userData vào localStorage để dùng cho các tab khác
        localStorage.setItem('userData', JSON.stringify(userInfo));
        console.log('✅ User data saved to localStorage:', userInfo);
    };

    /**
     * Hàm logout (Phải gọi API)
     */
    const logout = async () => {
        try {
            await AuthController.logout(); // Gọi API logout
        } catch (error) {
            console.error("Lỗi khi gọi API logout:", error);
        } finally {
            setUser(null); // Xóa user khỏi state
            localStorage.removeItem('token');
            localStorage.removeItem('userData'); // Xóa userData
            localStorage.removeItem('cart'); // Xóa giỏ hàng khi logout
            console.log('✅ User logged out and userData removed');
        }
    };

    const isAuthenticated = !!user;

    const value = {
        user,
        setUser,
        login,
        logout,
        isAuthenticated,
        isLoading // 👈 Cung cấp state loading ra ngoài
    };

    // ❗ NÂNG CẤP 5: Khi đang check auth, hiển thị loading
    // Tránh việc F5 bị "giật" (render trang rồi mới đá về login)
    if (isLoading) {
        return (
            <div className="flex h-screen items-center justify-center">
                <h2>Đang tải dữ liệu...</h2> {/* (Bạn có thể thay bằng Spinner) */}
            </div>
        );
    }

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
};

// Hook (giữ nguyên)
export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error("useAuth phải được dùng bên trong AuthProvider");
    }
    return context;
};