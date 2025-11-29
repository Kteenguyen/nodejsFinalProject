# 🚀 Deploy để VNPay hoạt động thật

## Vấn đề hiện tại
VNPay Sandbox **KHÔNG chấp nhận localhost** → Cần domain thật để test

## Giải pháp: Deploy Backend lên Render.com (FREE)

### Bước 1: Chuẩn bị Backend cho Deploy

1. **Tạo file `render.yaml`** trong thư mục root:

```yaml
services:
  - type: web
    name: phoneworld-backend
    runtime: node
    buildCommand: cd backend && npm install
    startCommand: cd backend && node server.js
    envVars:
      - key: PORT
        value: 3001
      - key: MONGODB_URI
        sync: false
      - key: JWT_SECRET
        sync: false
      - key: VNP_TMNCODE
        value: CGXXGHZC
      - key: VNP_HASHSECRET
        value: GPCHCZKZNTPZQUEVCXWVYVBIAZMZWTBG
      - key: VNP_URL
        value: https://sandbox.vnpayment.vn/paymentv2/vpcpay.html
      - key: VNP_RETURN_URL
        generateValue: true
      - key: FRONTEND_URL
        sync: false
```

### Bước 2: Push code lên GitHub

```bash
git add .
git commit -m "Prepare for Render deployment"
git push origin main
```

### Bước 3: Deploy trên Render.com

1. Vào https://render.com → Sign up (free)
2. Click **"New +"** → **"Web Service"**
3. Connect GitHub repository: `Kteenguyen/nodejsFinalProject`
4. Cấu hình:
   - **Name**: `phoneworld-backend`
   - **Root Directory**: `backend`
   - **Build Command**: `npm install`
   - **Start Command**: `node server.js`
   - **Instance Type**: Free

5. Thêm Environment Variables:
   ```
   MONGODB_URI=mongodb+srv://your-mongodb-uri
   JWT_SECRET=az0vSVBx2o
   FRONTEND_URL=https://localhost:3000
   VNP_TMNCODE=CGXXGHZC
   VNP_HASHSECRET=GPCHCZKZNTPZQUEVCXWVYVBIAZMZWTBG
   VNP_URL=https://sandbox.vnpayment.vn/paymentv2/vpcpay.html
   VNP_RETURN_URL=https://phoneworld-backend.onrender.com/api/payment/vnpay_return
   ```

6. Click **"Create Web Service"**

### Bước 4: Lấy Backend URL

Sau khi deploy xong, bạn sẽ có URL dạng:
```
https://phoneworld-backend.onrender.com
```

### Bước 5: Cập nhật Frontend

Sửa file `frontend/src/services/api.js`:

```javascript
const BASE_URL = 'https://phoneworld-backend.onrender.com/api';
```

### Bước 6: Test VNPay

1. Truy cập frontend: `https://localhost:3000`
2. Thêm sản phẩm vào giỏ hàng
3. Checkout → Chọn VNPay
4. VNPay sẽ redirect về backend Render → Sau đó về frontend localhost

---

## 🎯 Kết quả

✅ Backend chạy trên domain thật: `phoneworld-backend.onrender.com`
✅ VNPay chấp nhận return URL từ Render
✅ Callback hoạt động 100%
✅ Frontend vẫn chạy localhost để dev

---

## 🔄 Alternative: Deploy cả Frontend lên Vercel

Nếu muốn toàn bộ online:

```bash
cd frontend
npm run build
npx vercel --prod
```

Vercel sẽ cho bạn domain: `phoneworld.vercel.app`

Update `VNP_RETURN_URL` để redirect về Vercel thay vì localhost.

---

## 💡 Tips

- **Render Free Tier**: Backend sẽ sleep sau 15 phút không dùng → khởi động lại khi có request (chậm ~30s lần đầu)
- **MongoDB**: Dùng MongoDB Atlas (free) thay vì localhost
- **Logs**: Xem logs real-time trên Render dashboard để debug

---

## ⚡ Quick Deploy (5 phút)

Nếu muốn deploy ngay:

1. Tạo MongoDB Atlas cluster (free): https://cloud.mongodb.com
2. Push code lên GitHub
3. Deploy backend lên Render
4. Update `api.js` với Render URL
5. Test VNPay → Sẽ hoạt động!
