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
    // 👉 Thêm hàm này nếu chưa có
    checkAuth: () => {
        const token = localStorage.getItem("token");
        return !!token;
    }

}
export { AuthController };