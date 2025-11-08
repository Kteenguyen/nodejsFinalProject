// frontend/src/controllers/userController.js
import api from "../services/api"; // Cho các API liên quan đến User (Backend của mình)
// === FIX 1: SỬA ĐƯỜNG DẪN (BỎ 1 CHỮ 'services') ===
import provinceApi from '../services/provinceApi';
import { toast } from 'react-toastify';

// Hàm helper xử lý lỗi API (chung cho cả backend và GHN)
const handleApiError = (error, customMessage = "Đã xảy ra lỗi") => {
    const message = error.response?.data?.message || error.message || customMessage;
    toast.error(message);
    throw new Error(message);
};

// (File này chỉ chứa logic Quản lý User và API Tỉnh/Thành)
export const UserController = {
    // =============================================================
    // === CÁC HÀM QUẢN LÝ USER ===
    // =============================================================

    // === FIX 2: BỔ SUNG HÀM 'fetchUsers' (CHO ADMIN DASHBOARD) ===
    fetchUsers: async ({ page, limit, search }) => {
        try {
            // Fen cần đảm bảo có API này ở backend
            const response = await api.get('/admin/users', {
                params: { page, limit, search }
            });
            return response.data; // Giả sử trả về { users: [], totalPages: 1 }
        } catch (error) {
            handleApiError(error, "Lỗi tải danh sách người dùng!");
        }
    },

    // === FIX 3: BỔ SUNG HÀM 'fetchUserDetail' (CHO ADMIN DASHBOARD) ===
    fetchUserDetail: async (userId) => {
        try {
            // Fen cần đảm bảo có API này ở backend
            const response = await api.get(`/admin/users/${userId}`);
            return response.data; // Giả sử trả về { user: {...} }
        } catch (error) {
            handleApiError(error, "Lỗi tải chi tiết người dùng!");
        }
    },

    // Cập nhật thông tin (name, phone, dob, avatar)
    updateProfile: async (profileData) => {
        try {
            const response = await api.put('/users/me', profileData);
            toast.success("Cập nhật thông tin thành công!");
            return response.data.user; // Trả về user đã cập nhật
        } catch (error) {
            handleApiError(error, "Lỗi cập nhật hồ sơ!");
        }
    },

    // Đổi mật khẩu
    changePassword: async (passwordData) => {
        try {
            const response = await api.put('/users/change-password', passwordData);
            toast.success("Đổi mật khẩu thành công!");
            return response.data;
        } catch (error) {
            handleApiError(error, "Lỗi đổi mật khẩu!");
        }
    },

    // Lấy địa chỉ
    getAddresses: async () => {
        try {
            const response = await api.get('/users/addresses');
            return response.data.addresses;
        } catch (error) {
            handleApiError(error, "Lỗi tải địa chỉ!");
        }
    },

    // Thêm địa chỉ
    addAddress: async (addressData) => {
        try {
            const response = await api.post('/users/addresses', addressData);
            toast.success("Thêm địa chỉ mới thành công!");
            return response.data.addresses; // Trả về danh sách địa chỉ mới
        } catch (error) {
            handleApiError(error, "Lỗi thêm địa chỉ!");
        }
    },

    // Cập nhật địa chỉ
    updateAddress: async (addressId, addressData) => {
        try {
            const response = await api.put(`/users/addresses/${addressId}`, addressData);
            toast.success("Cập nhật địa chỉ thành công!");
            return response.data.addresses;
        } catch (error) {
            handleApiError(error, "Lỗi cập nhật địa chỉ!");
        }
    },

    // Xóa địa chỉ
    deleteAddress: async (addressId) => {
        try {
            const response = await api.delete(`/users/addresses/${addressId}`);
            toast.success("Xóa địa chỉ thành công!");
            return response.data.addresses;
        } catch (error) {
            handleApiError(error, "Lỗi xóa địa chỉ!");
        }
    },

    // =============================================================
    // === CÁC HÀM API TỈNH/THÀNH (ĐÃ SỬA CHO API MỚI) ===
    // =============================================================

    getProvinces: async () => {
        try {
            // API mới không cần endpoint /province
            const response = await provinceApi.get('p/');
            // API mới trả về [ { code, name, ... } ], nên không cần response.data?.data
            return response.data || [];
        } catch (error) {
            handleApiError(error, "Lỗi tải danh sách Tỉnh/Thành phố.");
            return [];
        }
    },

    getDistricts: async (provinceCode) => { // Dùng CODE thay vì ID
        if (!provinceCode) return [];
        try {
            // API mới dùng /p/:code?depth=2
            const response = await provinceApi.get(`p/${provinceCode}`, {
                params: { depth: 2 }
            });
            // API mới trả về { districts: [ { code, name, ... } ] }
            return response.data?.districts || [];
        } catch (error) {
            handleApiError(error, "Lỗi tải danh sách Quận/Huyện.");
            return [];
        }
    },

    getWards: async (districtCode) => { // Dùng CODE thay vì ID
        if (!districtCode) return [];
        try {
            // API mới dùng /d/:code?depth=2
            const response = await provinceApi.get(`d/${districtCode}`, {
                params: { depth: 2 }
            });
            // API mới trả về { wards: [ { code, name, ... } ] }
            return response.data?.wards || [];
        } catch (error) {
            handleApiError(error, "Lỗi tải danh sách Phường/Xã.");
            return [];
        }
    }
};