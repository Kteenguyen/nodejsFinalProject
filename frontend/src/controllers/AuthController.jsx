// frontend/src/controllers/AuthController.js
import api from "../services/api";
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
    facebookLogin: async (accessToken) => { 
        try {
            const response = await api.post("/auth/facebookLogin", { accessToken });
            return response.data;
        } catch (error) {
            console.error("Facebook Login failed (Controller):", error.response?.data || error.message);
            throw new Error(error.response?.data?.message || "Đăng nhập Facebook thất bại.");
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
            // 👇 SỬA LẠI: Gọi route mới (luôn trả về 200 OK)
            const response = await api.get("/auth/check-session");

            // response.data giờ sẽ là:
            // { isAuthenticated: true, user: {...} } 
            // HOẶC
            // { isAuthenticated: false, user: null }

            // (Không cần sửa logic bên dưới, nó đã khớp)
            if (response.data.isAuthenticated && response.data.user) {
                return { isAuthenticated: true, user: response.data.user };
            }

            return { isAuthenticated: false, user: null };

        } catch (error) {
            // Lỗi này giờ CHỈ xảy ra nếu backend sập (500) hoặc mất mạng
            // Sẽ không bao giờ là lỗi 401 nữa
            console.error("checkAuth (check-session) failed:", error.message);
            return { isAuthenticated: false, user: null };
        }
    },
    getProvinces: async () => {
        try {
            // 👇 SỬA LẠI ĐƯỜNG DẪN
            const response = await provinceApi.get("/province");
            // API GHN trả về { data: [...] }
            return response.data.data; // 👈 SỬA LẠI
        } catch (error) {
            console.error("Lỗi khi lấy danh sách Tỉnh/Thành (GHN):", error);
            throw new Error("Không thể tải danh sách Tỉnh/Thành.");
        }
    },

    getDistricts: async (provinceCode) => {
        try {
            // 👇 SỬA LẠI ĐƯỜNG DẪN VÀ PARAMS
            const response = await provinceApi.get("/district", {
                params: { province_id: provinceCode }
            });
            return response.data.data; // 👈 SỬA LẠI
        } catch (error) {
            console.error("Lỗi khi lấy danh sách Quận/Huyện (GHN):", error);
            throw new Error("Không thể tải danh sách Quận/Huyện.");
        }
    },

    getWards: async (districtCode) => {
        try {
            // 👇 SỬA LẠI ĐƯỜNG DẪN VÀ PARAMS
            const response = await provinceApi.get("/ward", {
                params: { district_id: districtCode }
            });
            return response.data.data; // 👈 SỬA LẠI
        } catch (error) {
            console.error("Lỗi khi lấy danh sách Phường/Xã (GHN):", error);
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