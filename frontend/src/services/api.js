// frontend/src/services/api.js
import axios from 'axios';

// 1. Force lấy protocol hiện tại mỗi lần gọi (không cache)
const getBaseUrl = () => {
    const protocol = window.location.protocol; // 'http:' hoặc 'https:'
    return `${protocol}//localhost:3001/api`;
};

const getBackendUrl = () => {
    const protocol = window.location.protocol;
    return `${protocol}//localhost:3001`;
};

export const API_BASE_URL = getBaseUrl();
export const API_BASE = API_BASE_URL;
export const BACKEND_URL = getBackendUrl();

// Helper: Chuyển đổi đường dẫn ảnh tương đối thành URL đầy đủ
export const getImageUrl = (imagePath) => {
  if (!imagePath) return '/img/placeholder.png';
  if (imagePath.startsWith('http')) return imagePath;
  if (imagePath.startsWith('/images')) return `${getBackendUrl()}${imagePath}`;
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
        // Lấy token từ sessionStorage (mỗi tab riêng biệt)
        const token = sessionStorage.getItem('token');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        // Nếu không có token trong sessionStorage, backend sẽ tự động đọc từ cookie
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