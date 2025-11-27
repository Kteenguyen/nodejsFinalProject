// frontend/src/controllers/AuthController.jsx
import api from "../services/api";
import { toast } from 'react-toastify';

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
            return response.data; // { isAuthenticated: true, user: ... }
        } catch (error) {
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
    
    // Giữ nguyên logic Google/Facebook login nếu cần...
    googleLogin: async (accessToken) => {
         const res = await api.post("/auth/googleLogin", { accessToken });
         return res.data;
    },
    
    changePassword: async (oldPassword, newPassword) => {
        const res = await api.put("/auth/change-password", { oldPassword, newPassword });
        return res.data;
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