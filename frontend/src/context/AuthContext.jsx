import { createContext, useContext, useState, useEffect } from "react";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);

    // ✅ Kiểm tra đăng nhập khi load lại trang
    useEffect(() => {
        const token = localStorage.getItem("token");
        if (token) {
            setUser({ token }); // Có thể decode JWT để lấy thêm thông tin
        }
    }, []);

    // 👉 Hàm login chung (dùng cho Google, Facebook, hoặc thường)
    const login = (token, userInfo) => {
        localStorage.setItem("token", token);
        setUser({ ...userInfo, token });
    };

    // 👉 Hàm logout chung
    const logout = () => {
        localStorage.removeItem("token");
        setUser(null);
    };

    return (
        <AuthContext.Provider value={{ user, login, logout }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);
