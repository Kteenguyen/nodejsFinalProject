// frontend/src/services/api.js
import axios from 'axios';

// Auto-detect environment: Production vs Local development
const getBaseUrl = () => {
    // Production: use relative path
    // Local dev: trực tiếp tới localhost:3001
    if (process.env.NODE_ENV === 'production' || window.location.hostname !== 'localhost') {
        return '/api';
    } else {
        // Local development - backend luôn chạy HTTPS
        return 'https://localhost:3001/api';
    }
};

const getBackendUrl = () => {
    if (process.env.NODE_ENV === 'production' || window.location.hostname !== 'localhost') {
        return '';
    } else {
        // Backend luôn chạy HTTPS trên localhost:3001
        return 'https://localhost:3001';
    }
};

export const API_BASE_URL = getBaseUrl();
export const API_BASE = API_BASE_URL;
export const BACKEND_URL = getBackendUrl();

// Helper: Chuyển đổi đường dẫn ảnh tương đối thành URL đầy đủ
export const getImageUrl = (imagePath) => {
  if (!imagePath) return '/img/placeholder.png';
  if (imagePath.startsWith('http')) {
    if (imagePath.includes('cloudinary.com') || imagePath.includes('image-proxy')) {
      return imagePath;
    }
    return `${getBackendUrl()}/api/image-proxy?url=${encodeURIComponent(imagePath)}`;
  }
  
  // Fix cho payment images: nếu path là /images/payment-... thì chuyển thành /images/payment-confirmations/payment-...
  if (imagePath.startsWith('/images/payment-') && !imagePath.includes('payment-confirmations')) {
    imagePath = imagePath.replace('/images/', '/images/payment-confirmations/');
  }
  
  // Ảnh từ backend (bắt đầu bằng /images/) → thêm backend URL  
  if (imagePath.startsWith('/images')) return `${getBackendUrl()}${imagePath}`;
  return imagePath;
};

// Helper: Chuyển đổi avatar path thành URL đầy đủ
export const getAvatarUrl = (avatarPath) => {
  if (!avatarPath) return '/img/male_user.png';
  if (avatarPath.startsWith('http')) return avatarPath;
  // Avatar từ backend (bắt đầu bằng /images/) → thêm backend URL
  if (avatarPath.startsWith('/images')) return `${getBackendUrl()}${avatarPath}`;
  return avatarPath;
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
        console.log('🔑 API Request - Token in sessionStorage:', token ? `${token.substring(0, 20)}...` : 'NO TOKEN');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
            console.log('✅ API Request - Authorization header set');
        } else {
            console.warn('⚠️ API Request - No token found, request may fail for protected routes');
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
            if (error.response.status === 401) {
                console.warn("⚠️ Phiên đăng nhập hết hạn hoặc chưa xác thực.");
                // KHÔNG tự động redirect - để component/context tự xử lý
                // Việc redirect tự động gây ra lỗi "bung tài khoản" khi cart sync fail
            }
        }
        return Promise.reject(error);
    }
);

export default api;