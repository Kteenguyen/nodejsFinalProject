// frontend/src/services/api.js

import axios from "axios";

const api = axios.create({
    baseURL: "https://localhost:3001/api", // backend server
    withCredentials: true,
});


// Thêm một Interceptor để xử lý lỗi một cách "thanh lịch"
api.interceptors.response.use(
    (response) => response, // Nếu request thành công, chỉ cần trả về response
    (error) => {
        // Nếu lỗi là 401 (Unauthorized)
        if (error.response && error.response.status === 401) {
        } else if (error.response && error.response.status === 403) {
            console.error("axiosInstance: Bị lỗi 403 Forbidden:", error.response.data);
        } else {
            // Log tất cả các lỗi khác (lỗi mạng, lỗi server 5xx, lỗi khác 4xx)
            console.error("axiosInstance: Bị lỗi khác:", error.message, error.response?.data);
        }
        return Promise.reject(error); // Vẫn từ chối Promise để các component gọi API có thể bắt lỗi
    }
);
export default api;