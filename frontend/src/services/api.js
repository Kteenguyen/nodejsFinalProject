// frontend/src/services/api.js
import axios from 'axios';

// 1. Lấy URL từ biến môi trường (Logic của https.js cũ)
// Nếu không có biến môi trường thì fallback về localhost
export const API_BASE_URL = 
  (typeof process !== "undefined" && process.env.REACT_APP_API_BASE) || 
  'http://localhost:3001/api';

export const API_BASE = API_BASE_URL;

// Backend server URL (không có /api) - dùng cho static files như images
export const BACKEND_URL = API_BASE_URL.replace('/api', '');

// Helper: Chuyển đổi đường dẫn ảnh tương đối thành URL đầy đủ
export const getImageUrl = (imagePath) => {
  if (!imagePath) return '/img/placeholder.png';
  if (imagePath.startsWith('http')) return imagePath;
  if (imagePath.startsWith('/images')) return `${BACKEND_URL}${imagePath}`;
  return imagePath;
};

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
// Interceptor cho request: Tự động thêm token vào header (nếu có)
api.interceptors.request.use(
    (config) => {
        // Ưu tiên lấy token từ localStorage (nếu có)
        const token = localStorage.getItem('token');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        // Nếu không có token trong localStorage, backend sẽ tự động đọc từ cookie
        // do đã set withCredentials: true
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

api.interceptors.response.use(
    (response) => {
        // Trả về response thành công
        return response;
    },
    (error) => {
        // Xử lý lỗi chung tại đây (nếu cần)
        if (error.response) {
            // Chỉ redirect về login nếu là trang login/register bị 401
            // Không tự động logout ở các trang admin để tránh "bung tài khoản"
            if (error.response.status === 401) {
                const currentPath = window.location.pathname;
                console.warn("⚠️ Phiên đăng nhập hết hạn hoặc chưa xác thực.");
                
                // Chỉ redirect nếu đang ở trang public cần auth
                // KHÔNG redirect nếu đang ở trang admin (để hiện lỗi trên UI)
                if (!currentPath.includes('/admin') && !currentPath.includes('/login')) {
                    localStorage.removeItem('token');
                    window.location.href = '/login';
                }
            }
        }
        return Promise.reject(error);
    }
);

export default api;