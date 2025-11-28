// frontend/src/controllers/AuthController.jsx
import api from "../services/api";
export const AuthController = {
    login: async (identifier, password) => {
        try {
            const response = await api.post("/auth/login", { identifier, password });
            if (response.status >= 400 || (response.data && !response.data.success)) {
                throw new Error(response.data?.message || "Đăng nhập thất bại");
            }
            return response.data;
        } catch (error) {
            const msg = error.response?.data?.message || error.message || "Đăng nhập thất bại";
            throw new Error(msg);
        }
    },

    register: async (formData) => {
        try {
            const response = await api.post("/auth/register", formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
            return response.data;
        } catch (error) {
            throw new Error(error.response?.data?.message || "Đăng ký thất bại");
        }
    },

    googleLogin: async (accessToken) => {
        try {
            const response = await api.post("/auth/googleLogin", { accessToken });
            return response.data;
        } catch (error) {
            console.error("Google login failed:", error.response?.data || error.message);
            throw new Error(error.response?.data?.message || "Đăng nhập Google thất bại");
        }
    },

    facebookLogin: async (accessToken, userID) => {
        try {
            const response = await api.post("/auth/facebookLogin", { accessToken, userID });
            return response.data;
        } catch (error) {
            console.error("Facebook login failed:", error.response?.data || error.message);
            throw new Error(error.response?.data?.message || "Đăng nhập Facebook thất bại");
        }
    },
    changePassword: async (oldPassword, newPassword) => {
        try {
            // Gọi endpoint /change-password chúng ta vừa tạo
            const response = await api.put("/auth/change-password", {
                oldPassword,
                newPassword
            });
            return response.data;
        } catch (error) {
            // Bắt lỗi từ backend (ví dụ: Sai mật khẩu cũ)
            const message = error.response?.data?.message || "Đổi mật khẩu thất bại";
            throw new Error(message);
        }
    },
    logout: async () => {
        try {
            const response = await api.post("/auth/logout");
            return response.data;
        } catch (error) {
            throw new Error("Đăng xuất thất bại");
        }
    },

    // Tích hợp logic checkSession vào đây
    checkSession: async () => {
        try {
            const response = await api.get('/auth/check-session');
            console.log('🔌 AuthController.checkSession - Full response:', response);
            return response.data; // { isAuthenticated: true, user: ... }
        } catch (error) {
            console.error('🔌 AuthController.checkSession - Error:', error);
            return { isAuthenticated: false, user: null };
        }
    },

    // Tích hợp logic getMe vào đây
    checkAuth: async () => {
        try {
            // Thay thế getMe() bằng gọi trực tiếp
            const response = await api.get("/auth/me");
            return { isAuthenticated: true, user: response.data.user || response.data };
        } catch (error) {
            // Check lỗi 401
            if (error.response?.status === 401) {
                return { isAuthenticated: false, user: null };
            }
            return { isAuthenticated: false, user: null };
        }
    },

    forgotPassword: async (email) => {
        try {
            const res = await api.post('/auth/forgot-password', { email });
            toast.success(res.data.message);
            return true;
        } catch (e) {
            toast.error(e.response?.data?.message || "Lỗi");
            return false;
        }
    },

    resetPassword: async (token, data) => {
        try {
            const res = await api.put(`/auth/reset-password/${token}`, data);
            toast.success(res.data.message);
            return true;
        } catch (e) {
            toast.error(e.response?.data?.message || "Lỗi");
            return false;
        }
    }
};