import api from "../services/api";

const AuthController = {
    login: async (identifier, password) => {
        try {
            const response = await api.post("/auth/login", { identifier, password });
            return response.data;
        } catch (error) {
            console.error("Login failed:", error);
            throw error.response?.data || { message: "Đăng nhập thất bại" };
        }
    },
    register: async (formData) => {
        try {
            const response = await api.post("/auth/register", { formData });
            return response.data;
        } catch (error) {
            console.error("Registration failed:", error);
            throw error.response?.data || { message: "Đăng ký thất bại" };
        }
    }
}
export { AuthController };