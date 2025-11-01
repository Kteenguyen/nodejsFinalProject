// frontend/src/controllers/AuthController.js
import api from "../services/api";

const AuthController = {
    login: async (identifier, password) => {
        try {
            const response = await api.post("/auth/login", { identifier, password });
            // KHÔNG LƯU GÌ VÀO LOCALSTORAGE
            return response.data; // Trả về { message, user, token }
        } catch (error) {
            console.error("Login failed:", error.response?.data || error.message);
            throw new Error(error.response?.data?.message || "Đăng nhập thất bại");
        }
    },

    register: async (formData) => {
        try {
            const response = await api.post("/auth/register", formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
            return response.data;
        } catch (error) {
            console.error("Registration failed:", error.response?.data || error.message);
            throw new Error(error.response?.data?.message || "Đăng ký thất bại");
        }
    },

    googleLogin: async (accessToken) => {
        try {
            const response = await api.post("/auth/googleLogin", { accessToken });
            // KHÔNG LƯU GÌ VÀO LOCALSTORAGE
            return response.data; // Trả về { message, user, token }
        } catch (error) {
            console.error("Google Login failed:", error.response?.data || error.message);
            throw new Error(error.response?.data?.message || "Đăng nhập Google thất bại");
        }
    },

    logout: async () => {
        try {
            // Gọi API logout để backend xóa cookie
            const response = await api.post("/auth/logout");
            // KHÔNG XÓA GÌ TỪ LOCALSTORAGE
            return response.data;
        } catch (error) {
            console.error("Logout failed:", error.response?.data || error.message);
            throw new Error(error.response?.data?.message || "Đăng xuất thất bại");
        }
    },

    checkAuth: async () => {
        try {
            // API này dùng 'protect' middleware ở backend để xác thực cookie
            const response = await api.get("/users/profile"); 
            
            // Nếu thành công, backend trả về { user: {...} }
            // (Hãy đảm bảo backend/controllers/userController.js -> getUserProfile trả về { user: req.user })
            if (response.data.user) {
                 return { isAuthenticated: true, user: response.data.user };
            }
            // Trường hợp lạ
            return { isAuthenticated: false, user: null };

        } catch (error) {
            // Lỗi 404 (chưa đăng nhập) hoặc lỗi mạng...
            return { isAuthenticated: false, user: null };
        }
    },
    
};

export { AuthController };