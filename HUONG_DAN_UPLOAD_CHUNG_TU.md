# 📸 HƯỚNG DẪN UPLOAD & XÁC NHẬN CHỨNG TỪ CHUYỂN KHOẢN

## 🔴 Vấn đề hiện tại:

1. **Ảnh sản phẩm bị mất** ✅ ĐÃ SỬA (đổi `https` → `http` trong api.js)
2. **Không thấy ảnh chứng từ** → Vì khách hàng chưa upload

---

## ✅ CÁC BƯỚC ĐỂ TEST UPLOAD CHỨNG TỪ:

### BƯỚC 1: Khách hàng đặt hàng với "Chuyển khoản ngân hàng"

1. Truy cập: `http://localhost:3000`
2. Thêm sản phẩm vào giỏ → Checkout
3. Chọn **"Chuyển khoản ngân hàng"**
4. Điền địa chỉ → Đặt hàng

### BƯỚC 2: Khách hàng upload ảnh chứng từ

Sau khi đặt hàng thành công, trang **Order Success** sẽ hiển thị:
- ✅ Thông tin tài khoản ngân hàng
- ✅ Nội dung chuyển khoản
- ✅ **Nút Upload ảnh chứng từ** (dưới cùng)

**Làm theo:**
1. Chụp ảnh/screenshot bill chuyển khoản
2. Click vào ô "**Upload ảnh chứng từ chuyển khoản**"
3. Chọn file ảnh (JPG/PNG, tối đa 5MB)
4. Đợi upload xong → Hiển thị "✓ Đã upload ảnh chứng từ"

### BƯỚC 3: Admin xác nhận thanh toán

1. Đăng nhập Admin: `http://localhost:3000/login`
   - Email: `admin@example.com`
   - Pass: `admin123`

2. Vào **Đơn hàng** → Click vào đơn hàng vừa tạo

3. Trong phần **"Thanh toán"**, bạn sẽ thấy:
   ```
   Trạng thái thanh toán: Chưa thanh toán (banking)
   
   📸 Chứng từ chuyển khoản:
   [Hiển thị ảnh khách upload]
   Upload lúc: ...
   ```

4. Bên phải, trong mục **"Xử lý đơn hàng"**, có nút màu xanh:
   ```
   ✓ Xác nhận đã thanh toán
   ```

5. Click nút đó → Đơn hàng cập nhật:
   - `isPaid: true`
   - `status: Confirmed`
   - Ảnh chứng từ có dấu "✓ Đã xác nhận"

---

## 🎯 VỊ TRÍ HIỂN THỊ ẢNH CHỨNG TỪ TRONG ADMIN:

Ảnh chứng từ sẽ hiển thị ở **2 vị trí** trong trang Admin Order Detail:

### 1. Trong phần "Thanh toán" (Cột trái)
```
┌─────────────────────────────────────┐
│ Thanh toán                          │
├─────────────────────────────────────┤
│ Tạm tính: 3.500.000 đ              │
│ Phí vận chuyển: 50.000 đ           │
│ Tổng cộng: 3.550.000 đ             │
│                                     │
│ Trạng thái: Chưa thanh toán (banking)│
│                                     │
│ 📸 Chứng từ chuyển khoản:          │
│ [HIỂN THỊ ẢNH Ở ĐÂY]               │ ← ẢNH Ở ĐÂY!
│ Upload lúc: 29/11/2025 17:50       │
└─────────────────────────────────────┘
```

### 2. Trong phần "Xử lý đơn hàng" (Cột phải)
```
┌─────────────────────────────────────┐
│ ⚙️ Xử lý đơn hàng                  │
├─────────────────────────────────────┤
│ [Nút xác nhận thanh toán]          │ ← NÚT Ở ĐÂY!
│ ✓ Xác nhận đã thanh toán           │
│                                     │
│ Cập nhật trạng thái:               │
│ [Dropdown menu]                    │
│ [Button Cập nhật ngay]             │
└─────────────────────────────────────┘
```

---

## ⚠️ LƯU Ý:

1. **Ảnh chỉ hiển thị khi:**
   - ✅ `paymentMethod === 'banking'`
   - ✅ Khách đã upload (`paymentProof.imageUrl` có giá trị)

2. **Nếu không thấy ảnh:**
   - Check console.log trong browser (F12)
   - Kiểm tra Network tab xem API có trả về `paymentProof` không
   - Thử refresh lại trang (Ctrl+F5)

3. **Nút xác nhận chỉ hiển thị khi:**
   - ✅ `isPaid === false` (chưa thanh toán)
   - ✅ Có ảnh chứng từ đã upload

---

## 🔧 KHẮC PHỤC SỰ CỐ:

### Frontend không cập nhật sau khi sửa code?
```bash
# Dừng frontend
Ctrl+C

# Xóa cache
cd frontend
npm run build  # (hoặc chỉ cần khởi động lại)

# Khởi động lại
npm start
```

### Ảnh sản phẩm vẫn bị mất?
- Đã sửa `api.js` (https → http)
- Refresh trang (Ctrl+Shift+R)
- Clear cache browser
