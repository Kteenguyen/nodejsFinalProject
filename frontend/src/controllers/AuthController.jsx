// frontend/src/controllers/AuthController.jsx
import api from "../services/api";
import { toast } from 'react-toastify'; // 👈 BẮT BUỘC PHẢI CÓ DÒNG NÀY
export const AuthController = {
    login: async (identifier, password) => {
        try {
            const response = await api.post("/auth/login", { identifier, password });
            if (response.status >= 400 || (response.data && !response.data.success)) {
                throw new Error(response.data?.message || "Đăng nhập thất bại");
            }

            // Lưu token vào localStorage để giữ đăng nhập
            if (response.data.token) {
                localStorage.setItem('token', response.data.token);
                console.log('✅ Token saved to localStorage');
            }

            return response.data;
        } catch (error) {
            // 👈 NÂNG CẤP: Kiểm tra status code 403 (ban) và truyền flag
            if (error.response?.status === 403) {
                const err = new Error(error.response?.data?.message || "Tài khoản đã bị cấm");
                err.isBanned = true;
                err.statusCode = 403;
                throw err;
            }
            const msg = error.response?.data?.message || error.message || "Đăng nhập thất bại";
            throw new Error(msg);
        }
    },

    register: async (formData) => {
        try {
            const response = await api.post("/auth/register", formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });

            // Lưu token sau khi đăng ký thành công
            if (response.data.token) {
                localStorage.setItem('token', response.data.token);
                console.log('✅ Token saved to localStorage after registration');
            }

            return response.data;
        } catch (error) {
            throw new Error(error.response?.data?.message || "Đăng ký thất bại");
        }
    },

    googleLogin: async (accessToken) => {
        try {
            const response = await api.post("/auth/googleLogin", { accessToken });

            // Lưu token sau khi đăng nhập Google thành công
            if (response.data.token) {
                localStorage.setItem('token', response.data.token);
                console.log('✅ Token saved to localStorage after Google login');
            }

            return response.data;
        } catch (error) {
            // 👈 NÂNG CẤP: Kiểm tra status code 403 (ban)
            if (error.response?.status === 403) {
                const err = new Error(error.response?.data?.message || "Tài khoản đã bị cấm");
                err.isBanned = true;
                err.statusCode = 403;
                throw err;
            }
            console.error("Google login failed:", error.response?.data || error.message);
            throw new Error(error.response?.data?.message || "Đăng nhập Google thất bại");
        }
    },

    facebookLogin: async (accessToken, userID) => {
        try {
            const response = await api.post("/auth/facebookLogin", { accessToken, userID });

            // Lưu token sau khi đăng nhập Facebook thành công
            if (response.data.token) {
                localStorage.setItem('token', response.data.token);
                console.log('✅ Token saved to localStorage after Facebook login');
            }

            return response.data;
        } catch (error) {
            // 👈 NÂNG CẤP: Kiểm tra status code 403 (ban)
            if (error.response?.status === 403) {
                const err = new Error(error.response?.data?.message || "Tài khoản đã bị cấm");
                err.isBanned = true;
                err.statusCode = 403;
                throw err;
            }
            console.error("Facebook login failed:", error.response?.data || error.message);
            throw new Error(error.response?.data?.message || "Đăng nhập Facebook thất bại");
        }
    },

    logout: async () => {
        try {
            await api.post("/auth/logout");
            // Xóa token khỏi localStorage
            localStorage.removeItem('token');
            console.log('✅ Token removed from localStorage');
            return { success: true };
        } catch (error) {
            // Vẫn xóa token dù API lỗi
            localStorage.removeItem('token');
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
            // Trả về object kết quả thành công
            return { success: true };
        } catch (e) {
            // Lấy data lỗi từ backend
            const errorData = e.response?.data;

            // Kiểm tra xem có phải lỗi do tài khoản Social không (dựa vào flag isSocial từ backend)
            if (errorData && errorData.isSocial) {
                // Trả về kết quả đặc biệt để component xử lý chuyển hướng
                return {
                    success: false,
                    isSocial: true,
                    message: errorData.message
                };
            }

            // Các lỗi khác (404, 500...)
            toast.error(errorData?.message || "Lỗi gửi yêu cầu khôi phục mật khẩu.");
            return { success: false, isSocial: false };
        }
    },
    resetPassword: async (token, password) => {
        try {
            // SAI: await api.put(url, password); -> Backend nhận được chuỗi, không đọc được
            // ĐÚNG: Gói vào object
            const response = await api.put(`/auth/reset-password/${token}`, {
                password: password
            });
            return response.data;
        } catch (error) {
            const message = error.response?.data?.message || "Đặt lại mật khẩu thất bại.";
            throw new Error(message);
        }
    },

    changePassword: async (oldPassword, newPassword) => {
        try {
            const response = await api.put("/auth/change-password", {
                oldPassword,
                newPassword
            });
            return response.data;
        } catch (error) {
            const message = error.response?.data?.message || "Đổi mật khẩu thất bại";
            throw new Error(message);
        }
    },
};