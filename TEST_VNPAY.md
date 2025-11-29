# 🧪 HƯỚNG DẪN TEST VNPAY (Không cần Localtunnel)

## ✅ Giải pháp mới - Dùng Popup + Polling

### Cách hoạt động:
1. User click "Đặt hàng" với VNPay
2. Frontend mở **popup** VNPay (không redirect toàn trang)
3. User thanh toán trên popup VNPay Sandbox
4. Frontend **tự động polling** (check mỗi 3 giây) để kiểm tra trạng thái đơn hàng
5. Khi phát hiện đơn đã thanh toán → Đóng popup, chuyển sang trang success

### Ưu điểm:
- ✅ Không cần localtunnel hay ngrok
- ✅ Không cần URL public
- ✅ Test được hoàn toàn trên localhost
- ✅ User experience tốt hơn (không mất trang hiện tại)

## 📋 Các bước test:

### 1. Khởi động Backend & Frontend
```bash
# Terminal 1 - Backend
cd backend
npm start

# Terminal 2 - Frontend  
cd frontend
npm start
```

### 2. Test thanh toán VNPay

1. Truy cập `http://localhost:3000`
2. Thêm sản phẩm vào giỏ hàng
3. Vào trang checkout
4. Chọn phương thức thanh toán **VNPay**
5. Click "Đặt hàng"
6. Popup VNPay sẽ mở ra
7. Thanh toán với thông tin test:

**Thông tin test VNPay Sandbox:**
- Ngân hàng: NCB
- Số thẻ: `9704198526191432198`
- Tên chủ thẻ: `NGUYEN VAN A`
- Ngày phát hành: `07/15`
- Mật khẩu OTP: `123456`

8. Sau khi thanh toán thành công, **chờ 3-6 giây**
9. Popup sẽ tự động đóng và chuyển sang trang Order Success

### 3. Cách giả lập thanh toán thành công thủ công

Nếu polling không hoạt động, bạn có thể cập nhật đơn hàng thủ công:

```bash
# Trong MongoDB Compass hoặc mongosh:
db.orders.updateOne(
  { orderId: "YOUR_ORDER_ID" },
  { 
    $set: { 
      isPaid: true, 
      paidAt: new Date(), 
      status: "Confirmed" 
    } 
  }
)
```

## 🔧 Troubleshooting

### Popup bị block
- Kiểm tra browser có block popup không
- Cho phép popup cho `localhost:3000`

### Polling không hoạt động
- Check console.log trong browser
- Kiểm tra API `/orders/status/:orderId` có hoạt động không
- Test trực tiếp: `http://localhost:3001/api/orders/status/YOUR_ORDER_ID`

### Đơn hàng không được cập nhật
- Kiểm tra backend logs
- Verify MongoDB connection
- Check orderId có đúng không

## 📝 Lưu ý

- Giải pháp này chỉ dùng cho **development/testing**
- Production cần dùng IPN (Instant Payment Notification) với URL public
- VNPay sandbox có giới hạn request, không spam quá nhiều

## 🚀 Production Deployment

Khi deploy production, cần:
1. Đăng ký tài khoản VNPay merchant thật
2. Cấu hình IPN URL trong dashboard VNPay
3. Update `VNP_RETURN_URL` trong `.env` với domain thật
4. Polling vẫn hoạt động nhưng IPN sẽ nhanh hơn và đáng tin cậy hơn
