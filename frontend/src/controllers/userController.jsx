// frontend/src/controllers/userController.jsx
import api from "../services/api";
import provinceApi from '../services/provinceApi';
import { toast } from 'react-toastify';

// === HÀM XỬ LÝ LỖI (Đã có toast.error) ===
// Hàm helper xử lý lỗi API (chung cho cả backend và Tỉnh/Thành)
const handleApiError = (error, customMessage = "Đã xảy ra lỗi") => {
    const message = error.response?.data?.message || error.message || customMessage;
    // Toast lỗi sẽ hiển thị từ đây
    toast.error(message);
    throw new Error(message);
};

export const UserController = {

    // =============================================================
    // === CÁC HÀM QUẢN LÝ ADMIN (Giữ nguyên logic của bạn) ===
    // =============================================================
    getUsers: async ({ page, limit, search }) => {
        try {
            const response = await api.get('/users', {
                params: { page, limit, search }
            });
            return response.data;
        } catch (error) {
            handleApiError(error, "Lỗi tải danh sách người dùng.");
        }
    },

    getUserById: async (userId) => {
        try {
            const response = await api.get(`/users/${userId}`);
            return response.data.user;
        } catch (error) {
            handleApiError(error, "Lỗi tải thông tin người dùng.");
        }
    },

    updateUserByAdmin: async (userId, userData) => {
        try {
            const response = await api.put(`/users/${userId}`, userData);
            return response.data.user;
        } catch (error) {
            handleApiError(error, "Lỗi cập nhật người dùng.");
        }
    },

    deleteUser: async (userId) => {
        try {
            const response = await api.delete(`/users/${userId}`);
            return response.data;
        } catch (error) {
            handleApiError(error, "Lỗi xóa người dùng.");
        }
    },

    // =============================================================
    // === CÁC HÀM TRANG PROFILE (Đã đúng) ===
    // =============================================================

    updateProfile: async (formData) => { // formData là đối tượng FormData
        try {
            // Gửi FormData (cho file upload)
            const response = await api.put('/users/me', formData);

            if (response.data?.success) {
                // Component (ProfileInfo.jsx) sẽ gọi toast.success()
                return response.data.user;
            } else {
                throw new Error(response.data?.message || "Cập nhật thất bại");
            }
        } catch (error) {
            handleApiError(error, "Lỗi khi cập nhật hồ sơ.");
        }
    },

    changeMyPassword: async (passwordData) => {
        try {
            const response = await api.put('/users/change-password', passwordData);
            if (response.data?.success) {
                // Component (ChangePassword.jsx) sẽ gọi toast.success()
                return response.data;
            } else {
                throw new Error(response.data?.message || "Đổi mật khẩu thất bại");
            }
        } catch (error) {
            handleApiError(error, "Lỗi khi đổi mật khẩu.");
        }
    },

    // =============================================================
    // === CÁC HÀM QUẢN LÝ ĐỊA CHỈ (Đã đúng) ===
    // =============================================================

    getMyAddresses: async () => {
        try {
            const response = await api.get('/users/addresses');
            return response.data;
        } catch (error) {
            handleApiError(error, "Lỗi tải danh sách địa chỉ.");
        }
    },

    addAddress: async (addressData) => {
        try {
            const response = await api.post('/users/addresses', addressData);
            // Component (ManageAddresses.jsx) sẽ gọi toast.success()
            return response.data;
        } catch (error) {
            handleApiError(error, "Lỗi thêm địa chỉ.");
        }
    },

    updateShippingAddress: async (addressId, addressData) => {
        try {
            const response = await api.put(`/users/addresses/${addressId}`, addressData);
            // Component (ManageAddresses.jsx) sẽ gọi toast.success()
            return response.data;
        } catch (error) {
            handleApiError(error, "Lỗi cập nhật địa chỉ.");
        }
    },

    deleteAddress: async (addressId) => {
        try {
            const response = await api.delete(`/users/addresses/${addressId}`);
            // Component (ManageAddresses.jsx) sẽ gọi toast.success()
            return response.data;
        } catch (error) {
            handleApiError(error, "Lỗi xóa địa chỉ.");
        }
    },

    // =============================================================
    // === API TỈNH/THÀNH (Đã đúng) ===
    // =============================================================
    getProvinces: async () => {
        try {
            const response = await provinceApi.get('p/');
            return response.data || [];
        } catch (error) {
            handleApiError(error, "Lỗi tải danh sách Tỉnh/Thành phố.");
            return [];
        }
    },

    getDistricts: async (provinceCode) => {
        if (!provinceCode) return [];
        try {
            const response = await provinceApi.get(`p/${provinceCode}`, {
                params: { depth: 2 }
            });
            return response.data?.districts || [];
        } catch (error) {
            handleApiError(error, "Lỗi tải danh sách Quận/Huyện.");
            return [];
        }
    },

    getWards: async (districtCode) => {
        if (!districtCode) return [];
        try {
            const response = await provinceApi.get(`d/${districtCode}`, {
                params: { depth: 2 }
            });
            return response.data?.wards || [];
        } catch (error) {
            handleApiError(error, "Lỗi tải danh sách Phường/Xã.");
            return [];
        }
    }
};