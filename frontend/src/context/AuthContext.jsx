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
     * ❗ NÂNG CẤP 2: useEffect chạy 1 LẦN KHI APP LOAD
     * Nhiệm vụ: Gọi API /auth/check-session để khôi phục user
     */
    useEffect(() => {
        const checkUserStatus = async () => {
            try {
                console.log('🔍 AuthContext: Checking session...');
                // Chúng ta gọi API /auth/check-session mà backend đã có
                const response = await AuthController.checkSession();
                console.log('📡 AuthContext: checkSession response:', response);

                // Backend trả về { isAuthenticated: true, user: {...} }
                if (response.isAuthenticated && response.user) {
                    console.log('✅ AuthContext: User restored:', response.user);
                    setUser(response.user);
                } else {
                    console.log('❌ AuthContext: No authenticated user');
                    setUser(null);
                }

            } catch (error) {
                // Nếu cookie không hợp lệ hoặc hết hạn, coi như chưa login
                console.error('⚠️ AuthContext: Error checking session:', error);
                setUser(null);
            } finally {
                // Báo là đã load xong, cho phép app render
                setIsLoading(false);
            }
        };

        checkUserStatus();
    }, []); // Mảng rỗng = chỉ chạy 1 lần khi F5

    /**
     * ❗ NÂNG CẤP 3: Hàm login (Đơn giản hóa)
     * Giờ chỉ cần set state (không cần localStorage)
     * Backend đã tự set cookie
     */
    const login = (userInfo) => {
        setUser(userInfo);
    };

    /**
     * ❗ NÂNG CẤP 4: Hàm logout (Phải gọi API)
     * Phải gọi API /auth/logout để server xóa HttpOnly cookie
     */
    const logout = async () => {
        try {
            await AuthController.logout(); // Gọi API logout
        } catch (error) {
            console.error("Lỗi khi gọi API logout:", error);
        } finally {
            setUser(null); // Xóa user khỏi state
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