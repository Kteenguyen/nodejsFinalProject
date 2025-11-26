// src/services/ordersApi.js
import { httpGet, httpPut } from './https';

const BASE = '/orders';

const OrdersApi = {
  list(params) {
    return httpGet(`${BASE}/admin/all`, { params });
  },

  // Chi tiết đơn
  detail(orderId) {
    return httpGet(`${BASE}/${orderId}`);
  },

  // Cập nhật trạng thái
  updateStatus(orderId, body) {
    return httpPut(`${BASE}/${orderId}/status`, body);
  },
};

export default OrdersApi;
export { OrdersApi };