# 🚀 HƯỚNG DẪN DEPLOY ĐỂ VNPAY HOẠT ĐỘNG

## 🎯 Mục tiêu
Deploy backend lên server có **domain thật** để VNPay sandbox chấp nhận return URL.

---

## ⚡ CÁCH NHANH NHẤT: Railway.app (2 phút)

### Bước 1: Đăng ký Railway
1. Vào https://railway.app
2. Click **"Login"** → Chọn **"GitHub"**
3. Authorize Railway

### Bước 2: Deploy Backend
1. Click **"New Project"**
2. Chọn **"Deploy from GitHub repo"**
3. Chọn repository `nodejsFinalProject`
4. Click **"Deploy Now"**

### Bước 3: Cấu hình
1. Click vào service vừa tạo
2. Vào tab **"Settings"**
3. Scroll xuống **"Root Directory"** → Nhập: `backend`
4. Scroll xuống **"Start Command"** → Nhập: `node server.js`

### Bước 4: Thêm Environment Variables
Vào tab **"Variables"** → Click **"New Variable"** → Thêm từng biến:

```
PORT=3001
MONGODB_URI=mongodb://localhost:27017/shop
JWT_SECRET=az0vSVBx2o
FRONTEND_URL=https://localhost:3000

CLOUDINARY_CLOUD_NAME=dzwt6oron
CLOUDINARY_API_KEY=365497676723449
CLOUDINARY_API_SECRET=D6lWFykgPbqeqs_z9ZrECVBrqDM

VNP_TMNCODE=CGXXGHZC
VNP_HASHSECRET=GPCHCZKZNTPZQUEVCXWVYVBIAZMZWTBG
VNP_URL=https://sandbox.vnpayment.vn/paymentv2/vpcpay.html
```

**⚠️ QUAN TRỌNG**: 
- Click vào service → Tab **"Settings"** → Copy **"Public Domain"** (dạng `your-app.up.railway.app`)
- Thêm biến `VNP_RETURN_URL` với giá trị: `https://your-app.up.railway.app/api/payment/vnpay_return`

### Bước 5: Đợi Deploy Xong
- Vào tab **"Deployments"** → Đợi status thành **"SUCCESS"** (khoảng 1-2 phút)
- Copy **Public URL**: `https://your-app.up.railway.app`

### Bước 6: Cập nhật Frontend
Mở file `frontend/src/services/api.js`:

```javascript
import axios from 'axios';

const api = axios.create({
    baseURL: 'https://your-app.up.railway.app/api', // ← Thay YOUR_APP bằng domain Railway
    timeout: 30000,
    headers: {
        'Content-Type': 'application/json',
    },
});

// ... giữ nguyên phần còn lại
```

### Bước 7: Restart Frontend
```bash
# Ctrl+C để stop frontend hiện tại
cd frontend
npm start
```

### Bước 8: Test VNPay
1. Vào `https://localhost:3000`
2. Thêm sản phẩm vào giỏ
3. Checkout → Chọn **"THANH TOÁN VNPAY"**
4. ✅ VNPay sẽ hoạt động 100%!

---

## 🗄️ BONUS: Dùng MongoDB Online (Để Backend hoạt động 100%)

Hiện tại backend dùng `mongodb://localhost:27017` → Sẽ lỗi khi deploy.

### MongoDB Atlas (Free, 5 phút setup)

1. Vào https://cloud.mongodb.com → Sign up
2. Click **"Create"** → Chọn **"Free"** (M0)
3. Chọn region gần VN: **Singapore** hoặc **Mumbai**
4. Click **"Create Cluster"**
5. Tạo user:
   - Username: `admin`
   - Password: `admin123` (hoặc password mạnh hơn)
   - Click **"Create User"**
6. Whitelist IP: Click **"Add My Current IP"** → Sau đó thêm `0.0.0.0/0` để cho phép tất cả IP
7. Click **"Connect"** → **"Connect your application"**
8. Copy connection string:
   ```
   mongodb+srv://admin:<password>@cluster0.xxxxx.mongodb.net/shop?retryWrites=true&w=majority
   ```
9. Thay `<password>` bằng password thật
10. Update biến `MONGODB_URI` trên Railway với connection string này

---

## 🎉 KẾT QUẢ

✅ Backend chạy trên domain thật: `your-app.up.railway.app`
✅ VNPay chấp nhận return URL từ Railway
✅ MongoDB chạy trên Atlas (online)
✅ Frontend localhost call API từ Railway
✅ **VNPay thanh toán hoạt động 100%!**

---

## 🐛 Troubleshooting

### Lỗi "Cannot connect to MongoDB"
→ Cập nhật `MONGODB_URI` với MongoDB Atlas connection string

### Frontend không call được API
→ Kiểm tra `api.js` đã update đúng Railway URL chưa
→ Kiểm tra CORS trong backend (đã có sẵn)

### VNPay vẫn lỗi code 72
→ Kiểm tra `VNP_RETURN_URL` đã đúng format: `https://your-app.up.railway.app/api/payment/vnpay_return`
→ Restart deployment trên Railway

### Backend deploy lâu
→ Check tab "Deployments" xem có lỗi không
→ Check logs: Tab "View Logs"

---

## 📝 Notes

- Railway free tier: 500 giờ/tháng (đủ để demo và test)
- Backend sẽ không sleep như Render
- Có thể deploy frontend lên Vercel nếu muốn toàn bộ online

**Bạn đã sẵn sàng deploy chưa?** Làm theo từng bước trên là VNPay sẽ hoạt động thật 100%! 🚀
