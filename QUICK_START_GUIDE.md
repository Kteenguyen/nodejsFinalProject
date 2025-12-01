# 🎓 HƯỚNG DẪN CHẠY ĐỒ ÁN - DÀNH CHO GIẢNG VIÊN

## ⚡ Quick Start (3 bước)

### Bước 1: Cấu hình Environment
```bash
# Tạo file .env
copy .env.example .env

# Mở file .env và điền 2 giá trị BẮT BUỘC:
# JWT_SECRET=any-random-32-character-string-here
# CLOUDINARY_CLOUD_NAME=demo  (hoặc credentials thật nếu có)
# CLOUDINARY_API_KEY=demo
# CLOUDINARY_API_SECRET=demo
```

### Bước 2: Chạy Docker
```bash
docker compose up -d
```

**Lưu ý:** Lần đầu tiên sẽ tải images và build (~5-10 phút tùy mạng)

### Bước 3: Đợi Services Khởi Động
```bash
# Chờ 30-60 giây để health checks pass
docker compose ps

# Tất cả services phải có trạng thái "healthy" hoặc "running"
```

---

## 🌐 Truy Cập Ứng Dụng

- **Website**: http://localhost:3000
- **API Health Check**: http://localhost:3001/api/health

---

## 👤 Đăng Nhập Admin

### Cách 1: Tạo Admin Mới (Khuyến Nghị)

1. Truy cập http://localhost:3000 và đăng ký tài khoản bình thường
2. Nâng cấp lên admin:

```bash
docker exec -it phoneworld-mongodb mongosh -u admin -p phoneworld123 --authenticationDatabase admin

# Trong mongosh, chạy:
use phoneworld
db.users.updateOne(
  { email: "email-vua-dang-ky@example.com" },
  { $set: { role: "admin", isActive: true } }
)
exit
```

### Cách 2: Dùng Tài Khoản Mẫu (Nếu đã seed data)

```bash
docker exec -it phoneworld-backend sh
node seedAdmin.js
exit

# Đăng nhập với:
# Email: admin@phoneworld.com
# Password: Admin@123
```

---

## 📊 Test Các Tính Năng

### ✅ Tính năng có thể test ngay:
- Xem danh sách sản phẩm
- Tìm kiếm sản phẩm
- Thêm vào giỏ hàng
- Đăng ký/Đăng nhập
- Chat với admin (cần 2 browser/incognito)
- Đặt hàng (thanh toán COD)
- Admin: Dashboard, quản lý sản phẩm, đơn hàng

### ⚠️ Tính năng cần cấu hình thêm:
- **Upload ảnh sản phẩm**: Cần Cloudinary credentials thật
- **Thanh toán VNPay**: Cần VNPay sandbox account
- **Email reset password**: Cần Gmail App Password
- **OAuth Google/Facebook**: Cần client IDs

---

## 🐛 Troubleshooting

### Lỗi: Port already in use
```bash
# Kiểm tra port đang dùng
netstat -ano | findstr :3000
netstat -ano | findstr :3001

# Hoặc đổi port trong docker-compose.yml:
# ports:
#   - "8080:80"  # Thay vì 3000:80
```

### Lỗi: Docker daemon not running
```bash
# Mở Docker Desktop và đợi nó khởi động
# Sau đó chạy lại: docker compose up -d
```

### Lỗi: Cannot connect to database
```bash
# Xem logs
docker compose logs mongodb backend

# Restart services
docker compose restart mongodb backend
```

### Website hiển thị lỗi API
```bash
# 1. Kiểm tra backend có chạy
curl http://localhost:3001/api/health
# hoặc mở browser: http://localhost:3001/api/health

# 2. Xem logs backend
docker compose logs backend -f

# 3. Kiểm tra file .env đã điền đúng chưa
```

---

## 📝 Xem Logs

```bash
# Tất cả services
docker compose logs -f

# Chỉ backend
docker compose logs backend -f

# Chỉ database
docker compose logs mongodb -f
```

---

## 🛑 Dừng Ứng Dụng

```bash
# Dừng nhưng giữ data
docker compose stop

# Dừng và xóa containers (giữ data)
docker compose down

# Xóa tất cả kể cả data
docker compose down -v
```

---

## 📁 Files Quan Trọng

```
nodejsFinalProject-2/
├── docker-compose.yml          # ⭐ Cấu hình Docker chính
├── .env                        # ⭐ Environment variables (cần tạo)
├── .env.example               # Template cho .env
├── DOCKER_DEPLOYMENT_GUIDE.md # Hướng dẫn chi tiết
├── README_DOCKER.md           # README đầy đủ
├── backend/
│   ├── Dockerfile             # ⭐ Build backend
│   └── init-mongo.js          # Init MongoDB
└── frontend/
    ├── Dockerfile             # ⭐ Build frontend
    └── nginx.conf             # Nginx config
```

---

## ✅ Checklist Đánh Giá

- ✅ Docker Compose file hoàn chỉnh
- ✅ Mỗi component trong container riêng (frontend, backend, mongodb, elasticsearch)
- ✅ Chạy được bằng lệnh `docker compose up -d`
- ✅ Không cần `npm install` thủ công (đã tích hợp trong Dockerfile)
- ✅ Health checks cho các services
- ✅ Data persistence với volumes
- ✅ Hướng dẫn rõ ràng cho người dùng

---

## 🎯 Các Tính Năng Đã Triển Khai

### Khách Hàng:
- ✅ Xem/Tìm kiếm sản phẩm
- ✅ Giỏ hàng
- ✅ Đặt hàng
- ✅ Thanh toán (COD + VNPay)
- ✅ Chat real-time với admin
- ✅ Đánh giá sản phẩm
- ✅ OAuth (Google, Facebook)

### Admin:
- ✅ Dashboard thống kê
- ✅ Quản lý sản phẩm (CRUD + Upload ảnh)
- ✅ Quản lý đơn hàng
- ✅ Quản lý người dùng
- ✅ Quản lý Flash Sale
- ✅ Chat với khách hàng

### Technical:
- ✅ Socket.io real-time
- ✅ JWT Authentication
- ✅ Elasticsearch search
- ✅ Cloudinary image storage
- ✅ MongoDB indexes
- ✅ Docker containerization
- ✅ Nginx reverse proxy

---

## 📞 Hỗ Trợ

Nếu gặp vấn đề:
1. Kiểm tra logs: `docker compose logs -f`
2. Verify .env file có đầy đủ JWT_SECRET và Cloudinary
3. Đảm bảo ports 3000, 3001, 27017, 9200 không bị chiếm
4. Restart: `docker compose restart`

**Repository**: https://github.com/Kteenguyen/nodejsFinalProject

---

**⏱️ Tổng thời gian setup: ~5 phút (sau khi Docker tải xong images)**
