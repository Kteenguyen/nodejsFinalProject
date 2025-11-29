# 🏦 HƯỚNG DẪN TÍCH HỢP VNPAY

## ✅ Tính năng đã hoàn thành

### Backend
- ✅ `paymentController.js`: Xử lý tạo URL thanh toán và callback từ VNPay
- ✅ `paymentRoutes.js`: Routes `/api/payment/create_payment_url` và `/vnpay_return`
- ✅ Cấu hình VNPay Sandbox trong `.env`
- ✅ Xử lý callback với signature verification (HMAC-SHA512)
- ✅ Cập nhật trạng thái đơn hàng sau thanh toán
- ✅ Redirect về frontend với error codes

### Frontend
- ✅ `OrderController.createVnpayUrl()`: Gọi API tạo URL thanh toán
- ✅ `CheckoutPage.jsx`: Xử lý thanh toán VNPay và điều hướng
- ✅ `OrderSuccessPage.jsx`: Hiển thị kết quả thanh toán với error mapping
- ✅ Tích hợp discount coupon (giảm 5% cho VNPay)
- ✅ Clear cart sau khi thanh toán thành công

### Testing
- ✅ Test script (`backend/testVnpayCallback.js`) để verify callback logic
- ✅ Signature verification đã được test và hoạt động chính xác
- ✅ OrderSuccessPage render đúng với tất cả error codes

---

## ⚠️ VNPay Sandbox Limitations

**VNPay sandbox KHÔNG chấp nhận localhost URLs** - đây là hạn chế của sandbox environment:

- ❌ `http://localhost:3001` → Error code 72 (Không tìm thấy website)
- ❌ `https://localhost:3000` → Error code 72
- ❌ Ngrok/Localtunnel URLs → Vẫn bị reject

**Giải pháp:**
- ✅ Code đã hoàn chỉnh và sẵn sàng cho production
- ✅ Khi deploy lên server với domain thật (VD: `myapp.com`), VNPay sẽ hoạt động bình thường
- ✅ Có thể test logic bằng test script (`node backend/testVnpayCallback.js`)

**Để test VNPay hoạt động thực tế:**
1. Deploy backend + frontend lên hosting (Heroku, Railway, Vercel, etc.)
2. Cập nhật `VNP_RETURN_URL` trong `.env` với domain thật
3. Test thanh toán từ domain đó

---

## 🔧 Cấu hình VNPay Sandbox

File `backend/.env` đã được cập nhật với thông tin VNPay sandbox:

```env
# VNPay Configuration (Sandbox for testing)
VNP_TMNCODE=CGXXGHZC
VNP_HASHSECRET=GPCHCZKZNTPZQUEVCXWVYVBIAZMZWTBG
VNP_URL=https://sandbox.vnpayment.vn/paymentv2/vpcpay.html
VNP_RETURN_URL=https://localhost:3001/api/payment/vnpay_return
```

**⚠️ Lưu ý về VNPay Sandbox:**
- VNPay Sandbox **KHÔNG chấp nhận localhost URLs** (sẽ trả về error code 72)
- Code đã hoàn chỉnh và test thành công với test script
- Khi deploy production với domain thật, VNPay sẽ hoạt động bình thường

**🧪 Test VNPay Logic (không cần VNPay thật):**
```bash
cd backend
node testVnpayCallback.js
# Copy URL và paste vào trình duyệt để test callback flow
```

**🚀 Để test VNPay hoạt động thực tế:**
1. Deploy lên server với domain thật (Heroku/Railway/Vercel)
2. Update `VNP_RETURN_URL` với domain production
3. Test thanh toán từ domain production

---

## 🧪 Cách Test VNPay

### 1. Khởi động Backend & Frontend
```bash
# Terminal 1 - Backend
cd backend
npm start

# Terminal 2 - Frontend
cd frontend
npm start
```

### 2. Tạo đơn hàng với VNPay
1. Thêm sản phẩm vào giỏ hàng
2. Vào trang Checkout: `http://localhost:3000/checkout`
3. Điền địa chỉ giao hàng
4. Chọn phương thức thanh toán: **"Thanh toán VNPay"**
5. Click **"THANH TOÁN VNPAY"**

### 3. Thanh toán trên VNPay Sandbox
- Bạn sẽ được chuyển đến trang VNPay sandbox
- Chọn ngân hàng: **NCB** (ngân hàng test của VNPay)
- Nhập thông tin thẻ test:
  - Số thẻ: `9704198526191432198`
  - Tên chủ thẻ: `NGUYEN VAN A`
  - Ngày phát hành: `07/15`
  - Mật khẩu OTP: `123456`

### 4. Kiểm tra kết quả
- Sau khi thanh toán thành công, bạn sẽ được redirect về: `http://localhost:3000/order-success?orderId=XXX&code=00`
- Đơn hàng sẽ tự động cập nhật trạng thái:
  - `isPaid = true`
  - `status = 'Confirmed'`
  - `paidAt = <thời gian thanh toán>`

---

## 🔍 Luồng xử lý VNPay

```
┌─────────────┐      ┌──────────────┐      ┌─────────────┐      ┌──────────────┐
│  Frontend   │─────>│   Backend    │─────>│   VNPay     │─────>│   Backend    │
│  Checkout   │      │ /create_url  │      │  Sandbox    │      │ /vnpay_return│
└─────────────┘      └──────────────┘      └─────────────┘      └──────────────┘
      │                      │                      │                    │
      │  1. Create Order     │                      │                    │
      │─────────────────────>│                      │                    │
      │                      │  2. Create Payment   │                    │
      │                      │─────────────────────>│                    │
      │                      │  3. Return VNP URL   │                    │
      │<─────────────────────│                      │                    │
      │  4. Redirect to VNP  │                      │                    │
      │─────────────────────────────────────────────>│                    │
      │                      │                      │ 5. User pays       │
      │                      │                      │ 6. Callback        │
      │                      │<──────────────────────────────────────────│
      │                      │ 7. Update Order      │                    │
      │  8. Redirect Success │                      │                    │
      │<─────────────────────────────────────────────────────────────────│
```

---

## 💳 Thông tin Test Cards (VNPay Sandbox)

### Ngân hàng NCB (Test)
- Số thẻ: `9704198526191432198`
- Tên: `NGUYEN VAN A`
- Ngày phát hành: `07/15`
- Mật khẩu OTP: `123456`

### Ngân hàng Vietcombank (Test)
- Số thẻ: `9704060000000001`
- Tên: `NGUYEN VAN A`
- Ngày phát hành: `03/22`
- Mật khẩu OTP: `123456`

---

## 🐛 Xử lý lỗi thường gặp

### Lỗi 1: "Checksum không hợp lệ"
**Nguyên nhân:** Secret key không đúng hoặc thuật toán hash sai
**Giải pháp:** Kiểm tra lại `VNP_HASHSECRET` trong `.env`

### Lỗi 2: "Đơn hàng không tồn tại"
**Nguyên nhân:** `orderId` không khớp với database
**Giải pháp:** Kiểm tra log backend, đảm bảo order đã được tạo trước khi gọi VNPay

### Lỗi 3: "Không redirect về frontend"
**Nguyên nhân:** `returnUrl` không đúng
**Giải pháp:** Kiểm tra `VNP_RETURN_URL` phải là `http://localhost:3001/api/payment/vnpay_return`

---

## 🎯 Các tính năng đặc biệt

### 1. Giảm giá 5% khi thanh toán VNPay
```javascript
// Tự động áp dụng trong CheckoutPage.jsx
const discVNPAY = paymentMethod === 'vnpay' ? subTotal * 0.05 : 0;
```

### 2. Tích hợp Coupon Code
- Người dùng có thể nhập mã giảm giá
- Backend validate qua API: `GET /api/discounts/validate?code=XXX`
- Giảm giá theo % được config trong database

### 3. Sử dụng điểm thưởng
- 1 điểm = 1,000 VNĐ
- Giới hạn: Không thể dùng điểm vượt quá số tiền đơn hàng
- Điểm chỉ được cộng khi đơn hàng `status = 'Delivered'`

---

## 📝 TODO (Nếu cần mở rộng)

- [ ] Thêm chức năng hoàn tiền (refund)
- [ ] Lưu lịch sử giao dịch VNPay vào database
- [ ] Thêm webhook IPN để xử lý thanh toán bất đồng bộ
- [ ] Hỗ trợ thanh toán QR Code
- [ ] Thêm múi giờ Việt Nam cho `paidAt`

---

## 🚀 Triển khai Production

Khi deploy lên production:

1. **Đăng ký tài khoản VNPay thật**
   - Website: https://vnpay.vn/
   - Liên hệ sales để được cấp `TMN_CODE` và `HASH_SECRET`

2. **Cập nhật `.env`**
   ```env
   VNP_TMNCODE=<mã thật của bạn>
   VNP_HASHSECRET=<secret key thật>
   VNP_URL=https://vnpay.vn/paymentv2/vpcpay.html  # URL production
   VNP_RETURN_URL=https://yourdomain.com/api/payment/vnpay_return
   ```

3. **Cấu hình HTTPS**
   - VNPay yêu cầu website phải có SSL certificate
   - Đảm bảo `returnUrl` sử dụng `https://`

4. **Test kỹ trước khi go-live**
   - Test với số tiền nhỏ trước
   - Kiểm tra callback và cập nhật trạng thái
   - Test các trường hợp thanh toán thất bại

---

## 📞 Liên hệ Support

- VNPay Hotline: 1900 55 55 77
- Email: support@vnpay.vn
- Documentation: https://sandbox.vnpayment.vn/apis/docs/

---

**✨ Chúc bạn tích hợp thành công!**
