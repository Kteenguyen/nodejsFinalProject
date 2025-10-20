import api from "../services/api";

const AuthController = {
    login: async (identifier, password) => {
        try {
            const response = await api.post("/auth/login", { identifier, password });

            // ✅ Lấy token từ phản hồi
            const { token } = response.data;

            if (token) {
                // 👉 Lưu token vào localStorage
                localStorage.setItem("token", token);

                // 👉 Phát sự kiện để Header hoặc các component khác nghe
                window.dispatchEvent(new Event("storage"));
            }

            return response.data;
        } catch (error) {
            console.error("Login failed:", error);
            throw error.response?.data || { message: "Đăng nhập thất bại" };
        }
    },
    register: async (formData) => {
        try {

            // ✅ Kiểm tra JSON formData trước khi gửi
            console.log("📦 JSON gửi đi:", formData);

            const response = await api.post("/auth/register", formData);

            return response.data;
        } catch (error) {
            console.error("Registration failed:", error);
            throw error.response?.data || { message: "Đăng ký thất bại" };
        }
    },
    //Đăng nhập bằng google
    googleLogin: async (idToken) => {
        try {
            console.log("Google credential:", idToken);
            const response = await api.post("/auth/googleLogin", { idToken });
            console.log("✅ Google login response:", response.data);
            return response.data;
        } catch (error) {
            console.error("Google login failed:", error);
            throw error.response?.data || { message: "Đăng nhập Google thất bại" };
        }
    },


    //Đang nhập bằng facebook
    facebookLogin: async (accessToken) => {
        const response = await api.post("/auth/facebookLogin", { accessToken });
        return response.data;
    },

    //Sau này có thể đổi sang gọi API để logout dùng cookie
    logout: async () => {
        try {
            // 👉 Xóa token khỏi localStorage
            localStorage.removeItem("token");

            // 👉 Phát sự kiện để các component khác (như Header) nghe thay đổi trạng thái
            window.dispatchEvent(new Event("storage"));

            // 👉 Chuyển hướng về trang đăng nhập
            window.location.href = "/login";
        } catch (error) {
            console.error("Logout failed:", error);
            throw { message: "Đăng xuất thất bại" };
        }
    },


    // Kiểm tra xem người dùng đã đăng nhập chưa
    checkAuth: () => {
        const token = localStorage.getItem("token");
        return !!token;
    }

}
export { AuthController };