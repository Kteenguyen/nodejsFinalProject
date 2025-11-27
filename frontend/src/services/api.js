// frontend/src/services/api.js
import axios from 'axios';

// 1. Lấy URL từ biến môi trường (Logic của https.js cũ)
// Nếu không có biến môi trường thì fallback về localhost
export const API_BASE_URL = 
  (typeof process !== "undefined" && process.env.REACT_APP_API_BASE) || 
  'https://localhost:3001/api';

export const API_BASE = API_BASE_URL;
// 2. Khởi tạo Axios Instance
const api = axios.create({
    baseURL: API_BASE_URL,
    withCredentials: true, // Quan trọng: Để gửi kèm Cookies (Session/JWT)
    headers: {
        'Content-Type': 'application/json',
    },
    // Lưu ý: Tôi đã bỏ "validateStatus" tùy chỉnh ở file cũ.
    // Để Axios hoạt động chuẩn: Nó sẽ ném lỗi (vào catch) khi gặp mã lỗi 4xx, 5xx.
    // Điều này giúp khối try/catch trong Controller của bạn bắt được lỗi chính xác.
});

// 3. Cấu hình Interceptors (Bộ đón chặn request/response)
api.interceptors.response.use(
    (response) => {
        // Trả về response thành công
        return response;
    },
    (error) => {
        // Xử lý lỗi chung tại đây (nếu cần)
        if (error.response) {
            // Ví dụ: Nếu token hết hạn (401), có thể log ra console
            if (error.response.status === 401) {
                console.warn("Phiên đăng nhập hết hạn hoặc chưa xác thực.");
                // Có thể thêm logic redirect về trang login tại đây nếu muốn
            }
        }
        return Promise.reject(error);
    }
);

export default api;