# PhoneWorld E-commerce Platform

![Node.js](https://img.shields.io/badge/Node.js-20.x-green)
![React](https://img.shields.io/badge/React-18.x-blue)
![MongoDB](https://img.shields.io/badge/MongoDB-7.0-green)
![Docker](https://img.shields.io/badge/Docker-Ready-blue)

> Hệ thống bán điện thoại trực tuyến với tích hợp chat real-time, thanh toán VNPay, và quản lý admin.

## 📋 Tính Năng

### 🛍️ Khách Hàng
- ✅ Xem danh sách sản phẩm với phân trang
- ✅ Tìm kiếm sản phẩm (Elasticsearch)
- ✅ Lọc theo danh mục, thương hiệu, giá
- ✅ Giỏ hàng với session storage
- ✅ Đặt hàng và theo dõi trạng thái
- ✅ Thanh toán VNPay
- ✅ Chat real-time với admin
- ✅ Đánh giá và bình luận sản phẩm
- ✅ Đăng ký/Đăng nhập (Local + Google + Facebook OAuth)

### 👨‍💼 Admin
- ✅ Dashboard thống kê doanh thu
- ✅ Quản lý sản phẩm (CRUD)
- ✅ Quản lý đơn hàng
- ✅ Quản lý người dùng
- ✅ Quản lý mã giảm giá (Flash Sale)
- ✅ Chat với khách hàng real-time
- ✅ Upload ảnh lên Cloudinary

## 🚀 Quick Start (Docker - Khuyến Nghị)

### Yêu Cầu
- Docker Desktop 20.10+
- Docker Compose 2.0+

### Chạy Ứng Dụng

```bash
# 1. Clone repository
git clone <repo-url>
cd nodejsFinalProject-2

# 2. Tạo file .env
cp .env.example .env
# Mở .env và điền các giá trị cần thiết (xem hướng dẫn bên dưới)

# 3. Chạy kiểm tra setup (optional)
powershell -ExecutionPolicy Bypass -File verify-docker-setup.ps1

# 4. Khởi động ứng dụng
docker compose up -d

# 5. Chờ services khởi động (30-60s)
docker compose ps

# 6. Truy cập
# Frontend: http://localhost:3000
# Backend API: http://localhost:3001/api/health
```

### Cấu Hình Environment Variables

Mở file `.env` và điền các giá trị:

```env
# BẮT BUỘC
JWT_SECRET=your-32-character-random-secret-key-here
CLOUDINARY_CLOUD_NAME=your-cloudinary-name
CLOUDINARY_API_KEY=your-cloudinary-key
CLOUDINARY_API_SECRET=your-cloudinary-secret

# TÙY CHỌN (có thể bỏ trống nếu không dùng)
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-app-password
VNPAY_TMN_CODE=your-vnpay-code
VNPAY_HASH_SECRET=your-vnpay-secret
REACT_APP_GOOGLE_CLIENT_ID=your-google-client-id
REACT_APP_FACEBOOK_APP_ID=your-facebook-app-id
```

**Lấy Cloudinary credentials:**
1. Đăng ký miễn phí tại [cloudinary.com](https://cloudinary.com)
2. Dashboard → Copy: Cloud Name, API Key, API Secret

### Tạo Admin Account

```bash
# 1. Truy cập website và đăng ký tài khoản bình thường

# 2. Nâng cấp lên admin qua MongoDB
docker exec -it phoneworld-mongodb mongosh -u admin -p phoneworld123 --authenticationDatabase admin

# Trong mongosh:
use phoneworld
db.users.updateOne(
  { email: "your-email@example.com" },
  { $set: { role: "admin", isActive: true } }
)
exit
```

## 🛠️ Development Setup (Local)

Nếu muốn chạy trực tiếp không dùng Docker:

### Backend

```bash
cd backend
npm install

# Tạo .env trong thư mục backend
cp .env.example .env
# Điền MongoDB URI, JWT_SECRET, Cloudinary, etc.

npm run dev  # Chạy với nodemon
# hoặc
npm start    # Chạy production mode
```

### Frontend

```bash
cd frontend
npm install

# Tạo .env trong thư mục frontend
cp .env.example .env

npm run dev  # Development với Vite
# hoặc
npm run build && npm run preview  # Production build
```

### Database
- MongoDB: localhost:27017
- Elasticsearch: localhost:9200 (optional)

## 📚 Hướng Dẫn Chi Tiết

Xem file [DOCKER_DEPLOYMENT_GUIDE.md](./DOCKER_DEPLOYMENT_GUIDE.md) để biết:
- Kiến trúc hệ thống
- Troubleshooting
- Security best practices
- Các lệnh Docker hữu ích

## 🧪 Seed Dữ Liệu Mẫu

```bash
docker exec -it phoneworld-backend sh

# Trong container:
node seedProducts.js
node seedOrder.js
node seedCart.js

exit
```

## 📁 Cấu Trúc Project

```
nodejsFinalProject-2/
├── backend/
│   ├── config/          # DB, Cloudinary config
│   ├── controllers/     # Business logic
│   ├── middleware/      # Auth, validation
│   ├── models/          # MongoDB schemas
│   ├── routes/          # Express routes
│   ├── utils/           # Helpers
│   ├── Dockerfile
│   └── server.js        # Entry point
├── frontend/
│   ├── src/
│   │   ├── components/  # React components
│   │   ├── pages/       # Page components
│   │   ├── context/     # React Context
│   │   ├── controllers/ # API calls
│   │   ├── services/    # API, Socket service
│   │   └── routes/      # React Router
│   ├── Dockerfile
│   └── nginx.conf       # Nginx config
├── docker-compose.yml   # Docker orchestration
├── .env.example         # Environment template
└── README.md
```

## 🐛 Common Issues

### Port already in use
```bash
# Windows
netstat -ano | findstr :3000
netstat -ano | findstr :3001

# Đổi port trong docker-compose.yml
```

### Backend không kết nối MongoDB
```bash
# Xem logs
docker compose logs backend mongodb

# Restart
docker compose restart mongodb backend
```

### Frontend không gọi được API
- Kiểm tra backend: http://localhost:3001/api/health
- Xem browser console
- Kiểm tra CORS trong `backend/server.js`

## 📊 Tech Stack

**Frontend:**
- React 18
- React Router v6
- Axios
- Socket.io Client
- TailwindCSS
- Lucide React Icons

**Backend:**
- Node.js 20
- Express 5
- MongoDB (Mongoose)
- Socket.io
- JWT Authentication
- Cloudinary
- Elasticsearch

**DevOps:**
- Docker & Docker Compose
- Nginx
- Multi-stage builds

## 🔒 Security

⚠️ **Trước khi deploy production:**
1. Đổi `JWT_SECRET` thành chuỗi ngẫu nhiên mạnh
2. Đổi MongoDB credentials
3. Enable HTTPS (Let's Encrypt)
4. Cấu hình CORS cho domain thật
5. Review Cloudinary, VNPay credentials

## 📝 API Documentation

### Public Endpoints
- `GET /api/products` - Danh sách sản phẩm
- `GET /api/products/:id` - Chi tiết sản phẩm
- `POST /api/auth/login` - Đăng nhập
- `POST /api/auth/register` - Đăng ký

### Protected Endpoints
- `GET /api/users/profile` - Thông tin user
- `POST /api/orders` - Tạo đơn hàng
- `GET /api/orders/my-orders` - Đơn hàng của tôi

### Admin Endpoints
- `GET /api/admin/dashboard` - Thống kê
- `POST /api/admin/products` - Tạo sản phẩm
- `PUT /api/admin/orders/:id` - Cập nhật đơn hàng

## 🧑‍💻 Team

- **Repository**: https://github.com/Kteenguyen/nodejsFinalProject
- **Author**: Kteenguyen

## 📄 License

MIT License - Dự án học tập cho môn Web Development

---

## 🎓 Nộp Bài (Grading)

**Yêu cầu đồ án đã hoàn thành:**
- ✅ Containerization với Docker Compose
- ✅ Các component trong container riêng biệt
- ✅ Chạy được bằng lệnh: `docker compose up -d`
- ✅ Không cần `npm install` thủ công
- ✅ Health checks cho tất cả services
- ✅ Data persistence với volumes

**Để giảng viên test:**
```bash
cd nodejsFinalProject-2
cp .env.example .env
# Edit .env với Cloudinary credentials
docker compose up -d
# Wait 30-60s for health checks
# Access: http://localhost:3000
```

**Admin credentials**: Xem phần "Tạo Admin Account" ở trên

---

**🚀 Happy Coding!**
