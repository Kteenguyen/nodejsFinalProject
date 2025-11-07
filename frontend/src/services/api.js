// frontend/src/services/api.js
import axios from 'axios';

const API_BASE_URL = 'https://localhost:3001/api';

const api = axios.create({
    baseURL: API_BASE_URL,
    withCredentials: true, // Quan trọng để gửi cookies (session, JWT)
    headers: {
        'Content-Type': 'application/json',
    },
});

// Có thể thêm interceptors ở đây để xử lý lỗi hoặc refresh token tự động
api.interceptors.response.use(
    (response) => response,
    (error) => {
        // Ví dụ: nếu token hết hạn (status 401), có thể thử refresh token
        // if (error.response && error.response.status === 401) {
        //     // Logic refresh token
        // }
        return Promise.reject(error);
    }
);

export default api;