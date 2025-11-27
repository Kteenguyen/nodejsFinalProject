import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import api from "../services/api"; // Import api instance chuẩn

const fmtVND = (n) => new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(n);
const fmtDate = (d) => new Date(d).toLocaleString('vi-VN');

export default function AdminOrderDetail() {
  const { id } = useParams(); // id này chính là orderId (VD: OD-2025...)
  const navigate = useNavigate();

  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [newStatus, setNewStatus] = useState("");
  const [error, setError] = useState(""); // Thêm state lỗi

  // Load chi tiết đơn hàng
  useEffect(() => {
    const fetchOrder = async () => {
      try {
        setLoading(true);
        // Gọi API lấy chi tiết
        const res = await api.get(`/orders/${id}`);
        
        // Kiểm tra dữ liệu trả về có hợp lệ không
        const data = res.data || res;
        if (data.success && data.order) {
          setOrder(data.order);
          setNewStatus(data.order.status);
        } else {
          setError(data.message || "Không tìm thấy thông tin đơn hàng");
        }
      } catch (err) {
        console.error("Lỗi tải chi tiết:", err);
        const msg = err.response?.data?.message || err.message || "Lỗi kết nối";
        setError(msg);
      } finally {
        setLoading(false);
      }
    };
    fetchOrder();
  }, [id]);

  // Xử lý cập nhật trạng thái
  const handleUpdateStatus = async () => {
    if (!newStatus) return;
    try {
      setUpdating(true);
      const res = await api.put(`/orders/${id}/status`, { status: newStatus });
      const data = res.data || res;
      
      if (data.success) {
        toast.success(`Cập nhật trạng thái thành công: ${newStatus}`);
        setOrder(data.order); 
      } else {
        toast.error(data.message || "Cập nhật thất bại");
      }
    } catch (err) {
      toast.error(err.response?.data?.message || "Lỗi cập nhật trạng thái");
    } finally {
      setUpdating(false);
    }
  };

  // --- RENDER CÁC TRẠNG THÁI ---

  if (loading) return (
    <div className="p-10 text-center">
      <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-blue-500 border-t-transparent"></div>
      <p className="mt-2 text-gray-500">Đang tải dữ liệu...</p>
    </div>
  );

  if (error) return (
    <div className="p-10 text-center">
      <div className="text-red-500 text-xl font-bold mb-2">⚠️ Đã xảy ra lỗi</div>
      <p className="text-gray-600 mb-4">{error}</p>
      <button onClick={() => navigate("/admin/orders")} className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700">
        Quay lại danh sách
      </button>
    </div>
  );

  if (!order) return (
    <div className="p-10 text-center text-gray-500">
      Dữ liệu trống. <button onClick={() => navigate("/admin/orders")} className="text-blue-600 underline">Quay lại</button>
    </div>
  );

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-6 gap-4">
        <div>
          <button onClick={() => navigate("/admin/orders")} className="text-sm text-gray-500 hover:text-blue-600 mb-1 flex items-center gap-1">
            <span>⬅</span> Quay lại danh sách
          </button>
          <h1 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
            Đơn hàng <span className="text-blue-600 font-mono text-xl">{order.orderId}</span>
          </h1>
          <p className="text-sm text-gray-500">Ngày đặt: {fmtDate(order.createdAt)}</p>
        </div>
        
        <div className={`px-4 py-2 rounded-lg font-bold text-white shadow-sm text-center ${
            order.status === 'Delivered' ? 'bg-green-600' :
            order.status === 'Cancelled' ? 'bg-red-600' :
            order.status === 'Shipping' ? 'bg-blue-600' :
            'bg-yellow-500'
        }`}>
            {order.status}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* CỘT TRÁI: DANH SÁCH SẢN PHẨM */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white rounded-lg shadow-sm border overflow-hidden">
            <div className="px-6 py-4 border-b bg-gray-50 font-semibold text-gray-700">
              Sản phẩm ({order.items?.length || 0})
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left">
                <thead className="bg-gray-50 text-gray-600">
                  <tr>
                    <th className="px-6 py-3">Sản phẩm</th>
                    <th className="px-6 py-3 text-right">Đơn giá</th>
                    <th className="px-6 py-3 text-center">SL</th>
                    <th className="px-6 py-3 text-right">Tổng</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {order.items?.map((item, idx) => (
                    <tr key={idx} className="hover:bg-gray-50">
                      <td className="px-6 py-4">
                        <div className="font-medium text-gray-900">{item.name}</div>
                        {item.variantId && <div className="text-xs text-gray-500">Mã: {item.variantId}</div>}
                      </td>
                      <td className="px-6 py-4 text-right">{fmtVND(item.price)}</td>
                      <td className="px-6 py-4 text-center">{item.quantity}</td>
                      <td className="px-6 py-4 text-right font-semibold">{fmtVND(item.price * item.quantity)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Tổng kết thanh toán */}
          <div className="bg-white rounded-lg shadow-sm border p-6">
            <h3 className="font-semibold text-gray-700 mb-4 border-b pb-2">Thanh toán</h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between text-gray-600">
                <span>Tạm tính:</span>
                <span>{fmtVND(order.subTotal)}</span>
              </div>
              <div className="flex justify-between text-gray-600">
                <span>Phí vận chuyển:</span>
                <span>{fmtVND(order.shippingPrice)}</span>
              </div>
              {order.tax > 0 && (
                <div className="flex justify-between text-gray-600">
                  <span>Thuế:</span>
                  <span>{fmtVND(order.tax)}</span>
                </div>
              )}
              
              {order.discount?.amount > 0 && (
                <div className="flex justify-between text-green-600">
                  <span>Giảm giá {order.discount.code ? `(${order.discount.code})` : ''}:</span>
                  <span>- {fmtVND(order.discount.amount)}</span>
                </div>
              )}

              <div className="flex justify-between text-lg font-bold border-t pt-3 mt-2">
                <span>Tổng cộng:</span>
                <span className="text-red-600 text-xl">{fmtVND(order.totalPrice)}</span>
              </div>
              
              <div className="mt-4 pt-3 border-t flex justify-between items-center bg-gray-50 p-3 rounded">
                 <span className="font-medium text-gray-700">Trạng thái thanh toán:</span>
                 <div className="flex items-center gap-2">
                   <span className="text-xs text-gray-500 italic">({order.paymentMethod})</span>
                   {order.isPaid ? (
                      <span className="text-green-700 font-bold bg-green-100 px-3 py-1 rounded border border-green-200">
                        ✔ Đã thanh toán
                      </span>
                   ) : (
                      <span className="text-orange-700 font-bold bg-orange-100 px-3 py-1 rounded border border-orange-200">
                        Chưa thanh toán
                      </span>
                   )}
                 </div>
              </div>
            </div>
          </div>
        </div>

        {/* CỘT PHẢI: THÔNG TIN KHÁCH & ACTION */}
        <div className="space-y-6">
          
          {/* Cập nhật trạng thái */}
          <div className="bg-white rounded-lg shadow-sm border p-6">
            <h3 className="font-semibold text-gray-700 mb-4 flex items-center gap-2">
              <span>⚙️</span> Xử lý đơn hàng
            </h3>
            <div className="mb-4">
                <label className="block text-sm text-gray-600 mb-2 font-medium">Cập nhật trạng thái:</label>
                <select 
                    value={newStatus} 
                    onChange={(e) => setNewStatus(e.target.value)}
                    className="w-full border rounded px-3 py-2 outline-none focus:ring-2 focus:ring-blue-500 bg-gray-50"
                    disabled={order.status === 'Cancelled'}
                >
                    <option value="Pending">Pending (Chờ xử lý)</option>
                    <option value="Confirmed">Confirmed (Đã xác nhận)</option>
                    <option value="Shipping">Shipping (Đang giao)</option>
                    <option value="Delivered">Delivered (Đã giao hàng)</option>
                    <option value="Cancelled">Cancelled (Hủy đơn)</option>
                </select>
            </div>
            <button 
                onClick={handleUpdateStatus}
                disabled={updating || newStatus === order.status || order.status === 'Cancelled'}
                className="w-full bg-blue-600 text-white py-2.5 rounded hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium shadow-sm"
            >
                {updating ? "Đang lưu..." : "Cập nhật ngay"}
            </button>
            {order.status === 'Cancelled' && (
              <p className="text-xs text-red-500 mt-2 text-center italic">Đơn hàng đã hủy, không thể cập nhật.</p>
            )}
          </div>

          {/* Thông tin khách hàng */}
          <div className="bg-white rounded-lg shadow-sm border p-6">
            <h3 className="font-semibold text-gray-700 mb-4 border-b pb-2 flex items-center gap-2">
              <span>👤</span> Thông tin Khách hàng
            </h3>
            <div className="space-y-3 text-sm">
                <div>
                    <div className="text-gray-500 text-xs uppercase font-bold">Họ tên</div>
                    <div className="font-medium text-lg text-gray-900">{order.guestInfo?.name || order.shippingAddress?.recipientName || "Khách vãng lai"}</div>
                </div>
                <div>
                    <div className="text-gray-500 text-xs uppercase font-bold">Email</div>
                    <div className="text-blue-600 break-all">{order.guestInfo?.email || "N/A"}</div>
                </div>
                {order.accountId && (
                    <div className="bg-blue-50 p-2 rounded border border-blue-100 mt-2">
                        <div className="text-xs text-blue-500 font-bold uppercase">Tài khoản thành viên</div>
                        <div className="text-xs text-gray-600 font-mono break-all">{order.accountId}</div>
                    </div>
                )}
            </div>
          </div>

          {/* Địa chỉ giao hàng */}
          <div className="bg-white rounded-lg shadow-sm border p-6">
            <h3 className="font-semibold text-gray-700 mb-4 border-b pb-2 flex items-center gap-2">
              <span>📍</span> Địa chỉ giao hàng
            </h3>
            <div className="space-y-3 text-sm">
                <div className="flex items-start gap-3">
                    <div className="min-w-[24px] text-gray-400">User:</div>
                    <div className="font-medium">{order.shippingAddress?.recipientName}</div>
                </div>
                <div className="flex items-start gap-3">
                    <div className="min-w-[24px] text-gray-400">Tel:</div>
                    <div className="font-mono">{order.shippingAddress?.phoneNumber}</div>
                </div>
                <div className="flex items-start gap-3">
                    <div className="min-w-[24px] text-gray-400">Add:</div>
                    <div>
                      {order.shippingAddress?.street}, {order.shippingAddress?.city}
                    </div>
                </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}