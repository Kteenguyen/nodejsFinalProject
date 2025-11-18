// frontend/src/controllers/AuthController.js
import api from "../services/api";
import { toast } from 'react-toastify';
import axios from 'axios'; // Import axios để kiểm tra instance của lỗi

const handleApiError = (error, customMessage = "Đã xảy ra lỗi") => {
    const message = error.response?.data?.message || error.message || customMessage;
    toast.error(message);
    throw new Error(message);
};

export const AuthController = {
    login: async (identifier, password) => {
        try {
            const response = await api.post("/auth/login", { identifier, password });

            // 🛡️ BỔ SUNG: Kiểm tra status code thủ công (đề phòng axios không ném lỗi)
            if (response.status >= 400) {
                throw new Error(response.data?.message || "Đăng nhập thất bại");
            }

            // 🛡️ BỔ SUNG: Kiểm tra biến success từ backend
            if (response.data && !response.data.success) {
                throw new Error(response.data.message || "Đăng nhập thất bại");
            }

            return response.data;
        } catch (error) {
            console.error("Login failed:", error.response?.data || error.message);
            // Ném lỗi ra để Login.jsx bắt được
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
            console.error("Registration failed:", error.response?.data || error.message);
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
            console.error("Logout failed:", error.response?.data || error.message);
            throw new Error(error.response?.data?.message || "Đăng xuất thất bại");
        }
    },
    // HÀM MỚI ĐỂ GỌI KHI F5
    checkSession: () => api.get('/auth/check-session'),
    // =========================================================
    // === 🔴 FIX HOÀN TOÀN checkAuth KHÔNG NÉM LỖI KHI 401 🔴 ===
    // =========================================================
    checkAuth: async () => {
        try {
            const response = await api.get("/users/me");

            // Nếu API trả về 200 (OK)
            // (Giả định response.data có user và là đã xác thực)
            return { isAuthenticated: true, user: response.data.user };

        } catch (error) {
            // Khi API trả về 401, Axios sẽ ném lỗi vào khối catch này.

            if (error.response?.status === 401) {
                // Đây là trường hợp người dùng CHƯA ĐĂNG NHẬP.
                // ✅ Thay vì ném lỗi, chúng ta CHỈ TRẢ VỀ một đối tượng báo hiệu chưa xác thực.
                return { isAuthenticated: false, user: null };
            }


            return { isAuthenticated: false, user: null };
        }
    },    // =========================================================

    forgotPassword: async (email) => {
        try {
            const response = await api.post('/auth/forgot-password', { email });
            toast.success(response.data.message || "Yêu cầu thành công, kiểm tra email!");
            return true;
        } catch (error) {
            handleApiError(error, "Lỗi yêu cầu đặt lại mật khẩu!");
            return false;
        }
    },

    resetPassword: async (token, passwordData) => {
        try {
            const response = await api.put(`/auth/reset-password/${token}`, passwordData);
            toast.success(response.data.message || "Đặt lại mật khẩu thành công!");
            return true;
        } catch (error) {
            handleApiError(error, "Lỗi đặt lại mật khẩu!");
            return false;
        }
    }
};