// frontend/src/controllers/AuthController.js
import  api  from "../services/api";
import provinceApi from "../services/provinceApi";
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
    /**
     * Lấy danh sách Tỉnh/Thành phố
     */
    getProvinces: async () => {
        try {
            const response = await provinceApi.get("/p/");
            return response.data; // Mảng các Tỉnh/Thành
        } catch (error) {
            console.error("Lỗi khi lấy danh sách Tỉnh/Thành:", error);
            throw new Error("Không thể tải danh sách Tỉnh/Thành.");
        }
    },

    /**
     * Lấy danh sách Quận/Huyện từ mã Tỉnh
     */
    getDistricts: async (provinceCode) => {
        try {
            const response = await provinceApi.get(`/p/${provinceCode}?depth=2`);
            return response.data.districts; // Mảng các Quận/Huyện
        } catch (error) {
            console.error("Lỗi khi lấy danh sách Quận/Huyện:", error);
            throw new Error("Không thể tải danh sách Quận/Huyện.");
        }
    },

    /**
     * Lấy danh sách Phường/Xã từ mã Quận
     */
    getWards: async (districtCode) => {
        try {
            const response = await provinceApi.get(`/d/${districtCode}?depth=2`);
            return response.data.wards; // Mảng các Phường/Xã
        } catch (error) {
            console.error("Lỗi khi lấy danh sách Phường/Xã:", error);
            throw new Error("Không thể tải danh sách Phường/Xã.");
        }
    },

    /**
     * Lưu địa chỉ giao hàng mới vào backend
     * (Sử dụng route POST /users/shipping-address đã có, cần Auth)
     * @param {Object} addressData Dữ liệu địa chỉ { fullName, phoneNumber, addressDetail, ward, district, city, isDefault }
     */
    addShippingAddress: async (addressData) => {
        try {
            // Gọi API backend của fen (route này được 'protect' nên cần cookie)
            const response = await api.post("/users/shipping-address", addressData);
            return response.data;
        } catch (error) {
            console.error("Lỗi khi lưu địa chỉ:", error.response?.data || error.message);
            throw new Error(error.response?.data?.message || "Lưu địa chỉ thất bại.");
        }
    }
};


export { AuthController };