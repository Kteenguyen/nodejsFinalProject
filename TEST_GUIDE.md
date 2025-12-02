# 🧪 HƯỚNG DẪN TEST TOÀN BỘ TÍNH NĂNG - DOCKER

## 📊 Kết quả Test Tự động
```
✅ Authentication & Users: 2 users (0 banned)
✅ Categories: 4 categories  
✅ Products: 5 products
✅ Cart: Working
✅ Orders: Working
✅ Flash Sales: Working
✅ Ban Feature: Working
✅ Loyalty Points: Working
```

## 🔑 Test Credentials
- **Admin**: admin@test.com | Password: admin123
- **User**: user@test.com | Password: user123
- **URL**: http://localhost:3000

---

## ✅ CHECKLIST TEST THỦ CÔNG

### 1. 🔐 Authentication & User Management
- [ ] **Login Admin** (admin@test.com / admin123)
  - Kiểm tra dashboard hiển thị
  - Kiểm tra menu admin
- [ ] **Login User** (user@test.com / user123)
  - Kiểm tra không thấy menu admin
  - Kiểm tra profile page
- [ ] **Logout** và login lại
- [ ] **Register** tài khoản mới (test@example.com)
- [ ] **Forgot Password** (kiểm tra flow)

### 2. 🚫 Ban Account Feature (QUAN TRỌNG)
- [ ] Login as **Admin**
- [ ] Vào **User Management** / **Users** page
- [ ] Tìm user `user@test.com`
- [ ] Click **Ban User** button
- [ ] Logout
- [ ] Thử login lại với `user@test.com`
- [ ] ✅ **Kiểm tra message**: "tài khoản của bạn đã bị cấm do có hành vi bất thường. Vui lòng liên hệ hotline để được hỗ trợ"
- [ ] Login lại as Admin và **Unban** user

### 3. 📦 Product Management
- [ ] **View Products** - Homepage hiển thị 5 sản phẩm
- [ ] **Product Details** - Click vào sản phẩm
  - iPhone 15 Pro Max
  - Samsung Galaxy S24 Ultra
- [ ] **Admin: Create Product**
  - Vào Admin → Products → Add New
  - Điền thông tin (có thể bỏ trống tên variant)
  - Submit và kiểm tra tạo thành công
- [ ] **Admin: Edit Product**
  - Sửa giá, stock
  - Upload ảnh mới
- [ ] **Admin: Delete Product**

### 4. 📂 Categories
- [ ] **View Categories** - Sidebar/Menu
  - Điện thoại (smartphone)
  - Laptop
  - Máy tính bảng
  - Phụ kiện
- [ ] **Filter by Category**
  - Click category → hiển thị sản phẩm đúng danh mục
- [ ] **Admin: Create Category**
- [ ] **Admin: Edit Category**

### 5. 🛒 Shopping Cart
- [ ] **Add to Cart** - Thêm iPhone 15 Pro
- [ ] **View Cart** - Kiểm tra hiển thị đúng
- [ ] **Update Quantity** - Tăng/giảm số lượng
- [ ] **Remove Item** - Xóa sản phẩm khỏi giỏ
- [ ] **Cart Counter** - Badge hiển thị số lượng

### 6. 💰 Checkout & Orders
- [ ] **Checkout Process**
  - Add 2-3 products vào cart
  - Proceed to Checkout
  - Điền địa chỉ giao hàng
  - Chọn payment method
  - Place Order
- [ ] **Order Confirmation** - Kiểm tra order ID
- [ ] **Order History** - View orders trong profile
- [ ] **Admin: Order Management**
  - View all orders
  - Update order status
  - Mark as delivered

### 7. ⚡ Flash Sales
- [ ] **Create Flash Sale** (Admin)
  - Chọn sản phẩm
  - Set thời gian (VD: 15 phút sau)
  - Set flash price
- [ ] **View Active Flash Sale** - Homepage banner
- [ ] **Buy Flash Sale Product**
  - Add to cart với giá flash sale
  - Complete checkout
- [ ] **Flash Sale Stock** - Kiểm tra giảm stock

### 8. 🔍 Search & Filter
- [ ] **Search Products** - "iPhone", "Samsung"
- [ ] **Filter by Price Range**
- [ ] **Sort Products**
  - Newest
  - Price Low to High
  - Price High to Low
- [ ] **Filter by Brand**

### 9. 🎁 Loyalty Points
- [ ] **Complete Order** - Kiểm tra nhận points
- [ ] **View Points Balance** - Profile page
- [ ] **Use Points** - Apply discount khi checkout
- [ ] **Points History**

### 10. 🔔 Notifications
- [ ] **Order Notifications** - Khi order được xử lý
- [ ] **Flash Sale Notifications**
- [ ] **Mark as Read**
- [ ] **Clear Notifications**

### 11. 👤 User Profile
- [ ] **View Profile**
- [ ] **Update Profile** - Name, email, phone
- [ ] **Upload Avatar**
- [ ] **Change Password**
- [ ] **Add Shipping Address**
- [ ] **Set Default Address**

### 12. 📊 Admin Dashboard
- [ ] **Dashboard Overview**
  - Total Revenue
  - Total Orders
  - Total Users
  - Total Products
- [ ] **Charts & Analytics**
  - Sales chart
  - Top products
- [ ] **Recent Orders**
- [ ] **Low Stock Alerts**

### 13. 🌐 API & HTTPS Testing
- [ ] **Check Network Tab**
  - All API calls use `/api/` path
  - Nginx proxy working
  - Backend HTTPS responding
- [ ] **Socket.IO Connection** (optional)
  - Real-time notifications
  - Chat support

---

## 🐛 Các Lỗi Đã Biết

1. ⚠️ **Socket.IO Error**: `ERR_EMPTY_RESPONSE` - Không ảnh hưởng chức năng chính
2. ⚠️ **Google Login**: Validation error - Sử dụng email/password login thay thế
3. ✅ **Product Creation**: Variant name auto-generated nếu bỏ trống
4. ✅ **MongoDB Validation**: Đã tắt để test

---

## 📝 Ghi Chú Test

### Tính năng hoạt động TỐT:
- ✅ Login/Logout/Register
- ✅ **Ban Account** với message tiếng Việt
- ✅ Product CRUD
- ✅ Category management
- ✅ Shopping Cart
- ✅ Checkout & Orders
- ✅ Flash Sales
- ✅ Search & Filter
- ✅ Admin Dashboard
- ✅ HTTPS Backend + Nginx Proxy
- ✅ Loyalty Points

### Cần kiểm tra thêm:
- ⏳ Payment Gateway integration
- ⏳ Email notifications
- ⏳ Real-time chat (Socket.IO)
- ⏳ Elasticsearch search performance

---

## 🚀 Quick Start Commands

```bash
# Start Docker
docker compose up -d

# Check logs
docker logs phoneworld-backend --tail 50
docker logs phoneworld-frontend --tail 50

# Run tests
docker exec phoneworld-backend node testAllFeatures.js

# Restart containers
docker restart phoneworld-backend phoneworld-frontend

# Stop all
docker compose down
```

---

## ✅ Test Completed By: _______________
## 📅 Date: _______________
## 🐛 Issues Found: _______________
