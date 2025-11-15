// Dùng các hàm named từ https.js (KHÔNG có default export)
import { httpGet, httpPut } from './https';

const BASE = '/api/orders';

const OrdersApi = {
  // Admin list – backend hiện tại là GET /api/orders/admin/all
  list(params) {
    return httpGet(`${BASE}/admin/all`, { params });
  },
  // Chi tiết đơn
  detail(orderId) {
    return httpGet(`${BASE}/${orderId}`);
  },
  // Cập nhật trạng thái / isPaid (Admin)
  updateStatus(orderId, body) {
    return httpPut(`${BASE}/${orderId}/status`, body);
  },
};

export default OrdersApi;
export { OrdersApi };
