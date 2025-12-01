# PhoneWorld - E-commerce Platform
## Docker Deployment Guide

Hệ thống bán điện thoại trực tuyến với tích hợp chat real-time, thanh toán VNPay, và quản lý admin.

---

## 📋 Yêu Cầu Hệ Thống

- **Docker**: Phiên bản 20.10+
- **Docker Compose**: Phiên bản 2.0+
- **RAM**: Tối thiểu 4GB khuyến nghị
- **Disk Space**: Tối thiểu 5GB trống

Kiểm tra phiên bản:
```bash
docker --version
docker compose version
```

---

## 🚀 Hướng Dẫn Chạy Nhanh

### 1️⃣ Clone hoặc giải nén project

```bash
cd nodejsFinalProject-2
```

### 2️⃣ Cấu hình Environment Variables

Tạo file `.env` từ template:
```bash
cp .env.example .env
```

Mở file `.env` và điền các giá trị **BẮT BUỘC**:
```env
# JWT (BẮT BUỘC - tối thiểu 32 ký tự)
JWT_SECRET=your-super-secret-jwt-key-change-in-production-min-32-chars

# Cloudinary (BẮT BUỘC - để upload ảnh sản phẩm)
CLOUDINARY_CLOUD_NAME=your-cloudinary-cloud-name
CLOUDINARY_API_KEY=your-cloudinary-api-key
CLOUDINARY_API_SECRET=your-cloudinary-api-secret

# Email (TÙY CHỌN - để gửi email quên mật khẩu)
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-email-app-password

# VNPay (TÙY CHỌN - để thanh toán online)
VNPAY_TMN_CODE=your-vnpay-terminal-code
VNPAY_HASH_SECRET=your-vnpay-hash-secret

# OAuth (TÙY CHỌN - đăng nhập Google/Facebook)
REACT_APP_GOOGLE_CLIENT_ID=your-google-client-id
REACT_APP_FACEBOOK_APP_ID=your-facebook-app-id
```

**Lưu ý quan trọng:**
- `JWT_SECRET`: Phải có tối thiểu 32 ký tự ngẫu nhiên
- `CLOUDINARY_*`: Đăng ký tài khoản miễn phí tại [cloudinary.com](https://cloudinary.com)
- Các biến khác có thể để mặc định nếu không sử dụng tính năng đó

### 3️⃣ Chạy ứng dụng

**Khởi động tất cả services:**
```bash
docker compose up -d
```

Lệnh này sẽ:
- ✅ Tải các Docker images cần thiết
- ✅ Khởi tạo MongoDB với database `phoneworld`
- ✅ Khởi động Elasticsearch (cho tìm kiếm sản phẩm)
- ✅ Build và chạy Backend API (Node.js + Express)
- ✅ Build và chạy Frontend (React + Nginx)

**Thời gian build lần đầu:** 5-10 phút (tùy tốc độ mạng)

### 4️⃣ Kiểm tra trạng thái

```bash
docker compose ps
```

Tất cả services phải có trạng thái `healthy` hoặc `running`:
```
NAME                        STATUS
phoneworld-mongodb          Up (healthy)
phoneworld-elasticsearch    Up (healthy)
phoneworld-backend          Up (healthy)
phoneworld-frontend         Up (healthy)
```

### 5️⃣ Truy cập ứng dụng

- **Frontend (Website)**: http://localhost:3000
- **Backend API**: http://localhost:3001/api/health
- **MongoDB**: localhost:27017
- **Elasticsearch**: http://localhost:9200

---

## 👤 Tài Khoản Mặc Định

Sau khi chạy lần đầu, bạn cần:

1. **Tạo tài khoản Admin** bằng cách đăng ký trực tiếp trên website
2. Sau đó vào MongoDB để cập nhật role:

```bash
# Truy cập MongoDB shell
docker exec -it phoneworld-mongodb mongosh -u admin -p phoneworld123 --authenticationDatabase admin

# Trong mongosh:
use phoneworld
db.users.updateOne(
  { email: "your-email@example.com" },
  { $set: { role: "admin", isActive: true } }
)
exit
```

---

## 📊 Seed Dữ Liệu Mẫu (Optional)

Nếu muốn có dữ liệu sản phẩm mẫu:

```bash
# Truy cập backend container
docker exec -it phoneworld-backend sh

# Chạy seed scripts
node seedProducts.js
node seedOrder.js

# Thoát container
exit
```

---

## 🔍 Debug & Logs

**Xem logs tất cả services:**
```bash
docker compose logs -f
```

**Xem logs của một service cụ thể:**
```bash
docker compose logs -f backend
docker compose logs -f frontend
docker compose logs -f mongodb
```

**Truy cập vào container để debug:**
```bash
docker exec -it phoneworld-backend sh
docker exec -it phoneworld-mongodb mongosh -u admin -p phoneworld123
```

---

## 🛠️ Các Lệnh Hữu Ích

```bash
# Dừng tất cả services (giữ data)
docker compose stop

# Khởi động lại
docker compose start

# Dừng và xóa containers (giữ volumes/data)
docker compose down

# Dừng và xóa TOÀN BỘ (bao gồm database)
docker compose down -v

# Rebuild lại images (sau khi sửa code)
docker compose up -d --build

# Xem resource usage
docker stats

# Xóa unused images/containers
docker system prune -a
```

---

## 🏗️ Kiến Trúc Hệ Thống

```
┌─────────────────┐
│   User Browser  │
└────────┬────────┘
         │ http://localhost:3000
         ▼
┌─────────────────────────┐
│  Frontend (React+Nginx) │ :3000
│  - React SPA            │
│  - Socket.io Client     │
└────────┬────────────────┘
         │ API Calls
         │ WebSocket
         ▼
┌─────────────────────────┐
│  Backend (Node.js)      │ :3001
│  - Express REST API     │
│  - Socket.io Server     │
│  - Authentication       │
│  - Business Logic       │
└────┬──────────┬─────────┘
     │          │
     │          └──────────────┐
     ▼                         ▼
┌──────────────┐    ┌──────────────────┐
│   MongoDB    │    │  Elasticsearch   │
│  Database    │    │  Search Engine   │
│  :27017      │    │  :9200           │
└──────────────┘    └──────────────────┘
```

**Services:**
- **Frontend**: React app được build và serve bởi Nginx
- **Backend**: Node.js Express API với Socket.io
- **MongoDB**: NoSQL database cho data chính
- **Elasticsearch**: Full-text search cho sản phẩm

---

## 🔒 Security Notes

⚠️ **QUAN TRỌNG CHO PRODUCTION:**

1. **Đổi JWT_SECRET** thành chuỗi ngẫu nhiên mạnh:
   ```bash
   # Tạo secret mạnh:
   node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
   ```

2. **Đổi MongoDB credentials** trong `docker-compose.yml`:
   ```yaml
   MONGO_INITDB_ROOT_USERNAME: admin  # Đổi thành tên khác
   MONGO_INITDB_ROOT_PASSWORD: phoneworld123  # Đổi password mạnh
   ```

3. **Cấu hình CORS** cho domain thật trong `backend/server.js`

4. **Enable HTTPS** cho production (sử dụng Let's Encrypt)

---

## 🐛 Troubleshooting

### Lỗi: "Port already in use"
```bash
# Kiểm tra port đang dùng
netstat -ano | findstr :3000
netstat -ano | findstr :3001
netstat -ano | findstr :27017

# Đổi port trong docker-compose.yml nếu cần
```

### Lỗi: "Cannot connect to MongoDB"
```bash
# Kiểm tra MongoDB logs
docker compose logs mongodb

# Restart MongoDB
docker compose restart mongodb
```

### Lỗi: "Backend health check failed"
```bash
# Xem backend logs để biết lỗi cụ thể
docker compose logs backend

# Kiểm tra environment variables
docker exec -it phoneworld-backend env | grep MONGODB
```

### Frontend hiển thị lỗi API
- Kiểm tra backend có chạy: http://localhost:3001/api/health
- Xem browser console để biết lỗi cụ thể
- Kiểm tra CORS settings trong backend

---

## 📦 Container Details

### Backend Container
- **Base Image**: node:20-alpine
- **Working Dir**: /app
- **Port**: 3001
- **Health Check**: GET /api/health
- **Auto-restart**: Yes

### Frontend Container
- **Build Stage**: node:20-alpine (build React)
- **Runtime Stage**: nginx:alpine (serve static files)
- **Port**: 80 (mapped to 3000)
- **Health Check**: HTTP GET /
- **Auto-restart**: Yes

### MongoDB Container
- **Image**: mongo:7.0
- **Port**: 27017
- **Credentials**: admin/phoneworld123 (CẦN ĐỔI)
- **Volume**: Persistent storage
- **Init Script**: Creates indexes automatically

### Elasticsearch Container
- **Image**: elasticsearch:8.11.0
- **Port**: 9200
- **Mode**: Single-node
- **Memory**: 512MB heap
- **Security**: Disabled (for dev)

---

## 📝 Notes for Grading

**Yêu cầu đồ án:**
✅ Mỗi component trong container riêng (frontend, backend, database)
✅ File `docker-compose.yml` hoàn chỉnh
✅ Chạy được bằng lệnh `docker compose up -d`
✅ Không cần chạy `npm install` thủ công (đã config trong Dockerfile)
✅ Có health checks cho tất cả services
✅ Data persistent với volumes

**Để test:**
```bash
# Clone/Extract project
cd nodejsFinalProject-2

# Setup environment
cp .env.example .env
# Edit .env với credentials của bạn

# Run
docker compose up -d

# Wait for health checks (30-60s)
docker compose ps

# Access website
# Browser: http://localhost:3000
```

**Admin credentials**: Xem phần "Tài Khoản Mặc Định" ở trên

---

## 📞 Support

Nếu gặp vấn đề, kiểm tra:
1. Docker daemon có chạy không?
2. Ports 3000, 3001, 27017, 9200 có bị chiếm không?
3. File `.env` đã được tạo và điền đầy đủ chưa?
4. Xem logs: `docker compose logs -f`

**Repository**: https://github.com/Kteenguyen/nodejsFinalProject
