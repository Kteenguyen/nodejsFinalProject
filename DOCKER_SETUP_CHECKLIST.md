# ✅ DOCKER SETUP CHECKLIST

## 📦 Files Đã Tạo

### Core Files
- ✅ `docker-compose.yml` - Orchestration chính
- ✅ `.env.example` - Template cho environment variables
- ✅ `.env` - File cấu hình thực (đã tạo từ example)

### Backend Files  
- ✅ `backend/Dockerfile` - Build backend container
- ✅ `backend/.dockerignore` - Exclude files khỏi build
- ✅ `backend/init-mongo.js` - Initialize MongoDB với indexes
- ✅ `backend/seedAdmin.js` - Script tạo admin user
- ✅ `backend/server.js` - Đã thêm health check endpoint

### Frontend Files
- ✅ `frontend/Dockerfile` - Multi-stage build (Node → Nginx)
- ✅ `frontend/.dockerignore` - Exclude files khỏi build
- ✅ `frontend/nginx.conf` - Nginx config với SPA routing + API proxy

### Documentation
- ✅ `README_DOCKER.md` - README đầy đủ với badges
- ✅ `DOCKER_DEPLOYMENT_GUIDE.md` - Hướng dẫn chi tiết + troubleshooting
- ✅ `QUICK_START_GUIDE.md` - Hướng dẫn nhanh cho giảng viên
- ✅ `DOCKER_SETUP_CHECKLIST.md` - File này

### Verification Scripts
- ✅ `verify-docker-setup.sh` - Bash script (Linux/Mac)
- ✅ `verify-docker-setup.ps1` - PowerShell script (Windows)

---

## 🏗️ Kiến Trúc Docker

```
┌─────────────────────┐
│  Frontend Container │ :3000
│  (React + Nginx)    │
└──────────┬──────────┘
           │
           ▼
┌─────────────────────┐
│  Backend Container  │ :3001
│  (Node.js + Express)│
└──────┬──────┬───────┘
       │      │
       ▼      ▼
   ┌────────┐ ┌──────────────┐
   │MongoDB │ │Elasticsearch │
   │  :27017│ │    :9200     │
   └────────┘ └──────────────┘
```

### Services
1. **mongodb**: MongoDB 7.0 với credentials, init script
2. **elasticsearch**: Single-node ES 8.11 cho search
3. **backend**: Node.js 20-alpine, auto-restart, health checks
4. **frontend**: Multi-stage build (Node build → Nginx serve)

### Networks
- `phoneworld-network`: Bridge network cho tất cả services

### Volumes (Persistent Data)
- `mongodb_data`: MongoDB database files
- `elasticsearch_data`: Elasticsearch indexes

---

## ⚙️ Environment Variables

### Backend (.env)
```env
# BẮT BUỘC
JWT_SECRET=your-32-character-secret
CLOUDINARY_CLOUD_NAME=your-name
CLOUDINARY_API_KEY=your-key
CLOUDINARY_API_SECRET=your-secret

# TÙY CHỌN
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-app-password
VNPAY_TMN_CODE=your-vnpay-code
VNPAY_HASH_SECRET=your-vnpay-secret
REACT_APP_GOOGLE_CLIENT_ID=your-google-id
REACT_APP_FACEBOOK_APP_ID=your-fb-id
```

### Auto-configured in docker-compose.yml
- `NODE_ENV=production`
- `PORT=3001`
- `MONGODB_URI=mongodb://admin:phoneworld123@mongodb:27017/phoneworld?authSource=admin`
- `ELASTIC_URL=http://elasticsearch:9200`

---

## 🔍 Health Checks

### Backend
- **Endpoint**: GET /api/health
- **Interval**: 30s
- **Timeout**: 10s
- **Retries**: 3
- **Start Period**: 40s

### Frontend
- **Method**: wget http://localhost:80/
- **Interval**: 30s
- **Timeout**: 10s
- **Retries**: 3

### MongoDB
- **Method**: mongosh ping command
- **Interval**: 10s
- **Timeout**: 5s
- **Retries**: 5

### Elasticsearch
- **Method**: curl cluster health
- **Interval**: 30s
- **Timeout**: 10s
- **Retries**: 5

---

## 🚀 Deployment Flow

### 1. Build Stage
```bash
docker compose up -d --build
```

**Xảy ra:**
1. Pull base images (node:20-alpine, mongo:7.0, elasticsearch:8.11, nginx:alpine)
2. Build backend image:
   - Copy package.json
   - Run npm ci --only=production
   - Copy source code
   - Create directories
3. Build frontend image:
   - Stage 1: npm ci + npm run build (Vite)
   - Stage 2: Copy dist → nginx
4. Create network và volumes

**Thời gian:** 5-10 phút (lần đầu)

### 2. Startup Sequence
```
1. MongoDB starts (giữ cho đến khi healthy)
2. Elasticsearch starts (giữ cho đến khi healthy)
3. Backend starts (depends_on: mongodb, elasticsearch)
4. Frontend starts (depends_on: backend)
```

### 3. Health Check Cascade
- MongoDB: 10s intervals → healthy sau ~30s
- Elasticsearch: 30s intervals → healthy sau ~60s
- Backend: Đợi dependencies → health check sau 40s start period
- Frontend: Health check ngay lập tức

**Tổng thời gian khởi động:** ~60-90 giây

---

## 🧪 Testing Checklist

### Pre-deployment Tests
- ✅ `docker compose config` - Validate syntax
- ✅ `verify-docker-setup.ps1` - Run verification script
- ✅ Check .env file có đầy đủ variables

### Post-deployment Tests
```bash
# 1. Check all services running
docker compose ps
# Expect: All services "Up" or "healthy"

# 2. Test backend API
curl http://localhost:3001/api/health
# Expect: {"status":"ok",...}

# 3. Test frontend
curl http://localhost:3000
# Expect: HTML content

# 4. Test MongoDB
docker exec -it phoneworld-mongodb mongosh -u admin -p phoneworld123 --eval "db.version()"
# Expect: MongoDB version number

# 5. Test Elasticsearch
curl http://localhost:9200
# Expect: JSON with cluster info

# 6. Check logs
docker compose logs -f
# Expect: No error messages
```

### Functional Tests
- ✅ Truy cập http://localhost:3000
- ✅ Đăng ký user mới
- ✅ Đăng nhập
- ✅ Xem danh sách sản phẩm
- ✅ Thêm vào giỏ hàng
- ✅ Tạo đơn hàng
- ✅ Nâng user lên admin
- ✅ Đăng nhập admin
- ✅ Test dashboard
- ✅ Test chat (2 browser windows)

---

## 🔒 Security Considerations

### Current Setup (Development)
- MongoDB credentials: hardcoded trong docker-compose.yml
- JWT_SECRET: từ .env file
- Elasticsearch: No authentication
- HTTP only (no HTTPS)

### For Production
1. **Change MongoDB credentials**
   ```yaml
   MONGO_INITDB_ROOT_USERNAME: strong_username
   MONGO_INITDB_ROOT_PASSWORD: strong_random_password
   ```

2. **Use strong JWT_SECRET** (32+ random chars)
   ```bash
   node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
   ```

3. **Enable Elasticsearch security**
   ```yaml
   xpack.security.enabled: true
   ```

4. **Add HTTPS** (Let's Encrypt + reverse proxy)

5. **Environment-specific .env files**
   - .env.development
   - .env.production

6. **Secrets management** (Docker secrets or external vault)

---

## 📊 Resource Usage

### Minimum Requirements
- **RAM**: 4GB (2GB cho Elasticsearch alone)
- **CPU**: 2 cores
- **Disk**: 5GB (images + volumes)

### Expected Usage
- **Frontend**: ~50MB RAM
- **Backend**: ~200MB RAM
- **MongoDB**: ~300MB RAM
- **Elasticsearch**: ~1.5GB RAM

**Total**: ~2GB RAM in use

---

## 🐛 Common Issues & Solutions

### Issue: Port already in use
**Solution:**
```bash
# Check ports
netstat -ano | findstr :3000
# Kill process or change port in docker-compose.yml
```

### Issue: MongoDB won't start
**Solution:**
```bash
# Check logs
docker compose logs mongodb
# Remove volume and restart
docker compose down -v
docker compose up -d
```

### Issue: Frontend shows API errors
**Solution:**
1. Check backend health: http://localhost:3001/api/health
2. Check browser console for CORS errors
3. Verify CORS settings in backend/server.js

### Issue: Elasticsearch fails to start
**Solution:**
```bash
# Increase Docker memory to 4GB+
# Or disable Elasticsearch (comment out in docker-compose.yml)
```

### Issue: Build fails with network error
**Solution:**
```bash
# Clear Docker cache
docker builder prune -a
# Rebuild
docker compose build --no-cache
```

---

## 📝 Maintenance Commands

```bash
# View logs
docker compose logs -f [service-name]

# Restart service
docker compose restart [service-name]

# Rebuild after code changes
docker compose up -d --build [service-name]

# Enter container shell
docker exec -it phoneworld-backend sh
docker exec -it phoneworld-mongodb mongosh -u admin -p phoneworld123

# Backup MongoDB
docker exec phoneworld-mongodb mongodump -u admin -p phoneworld123 --authenticationDatabase admin -o /backup

# Restore MongoDB
docker exec -i phoneworld-mongodb mongorestore -u admin -p phoneworld123 --authenticationDatabase admin /backup

# Clean up unused resources
docker system prune -a
docker volume prune
```

---

## ✅ Submission Checklist

Trước khi nộp bài, đảm bảo:

- [ ] File `.env` đã được tạo (nhưng KHÔNG commit vào git)
- [ ] File `.env.example` có đầy đủ template
- [ ] `docker compose config` chạy không lỗi
- [ ] `docker compose up -d` khởi động thành công
- [ ] Tất cả services có status "healthy"
- [ ] Frontend accessible tại http://localhost:3000
- [ ] Backend health check trả về 200 OK
- [ ] Đã test tạo user và nâng lên admin
- [ ] README có hướng dẫn rõ ràng
- [ ] QUICK_START_GUIDE.md có cho giảng viên
- [ ] Không có file nhạy cảm (credentials, keys) trong git

---

## 📚 Documentation Files

1. **README_DOCKER.md**: Overview + Quick Start + Tech Stack
2. **DOCKER_DEPLOYMENT_GUIDE.md**: Detailed setup + Architecture + Troubleshooting
3. **QUICK_START_GUIDE.md**: 3-step guide cho giảng viên
4. **DOCKER_SETUP_CHECKLIST.md**: File này - checklist đầy đủ

---

## 🎯 Yêu Cầu Đồ Án (Đã Hoàn Thành)

### Yêu cầu bắt buộc:
- ✅ **Docker Compose**: File hoàn chỉnh với 4 services
- ✅ **Separate Containers**: Frontend, Backend, MongoDB, Elasticsearch
- ✅ **One Command**: `docker compose up -d` là đủ
- ✅ **No Manual npm install**: Tất cả đã config trong Dockerfile
- ✅ **Clear Instructions**: 3 file documentation + scripts

### Tính năng bonus:
- ✅ Health checks cho tất cả services
- ✅ Multi-stage builds (frontend)
- ✅ Persistent volumes cho data
- ✅ Nginx reverse proxy
- ✅ Auto-restart policies
- ✅ Init scripts cho database
- ✅ Verification scripts

---

## 🏆 Điểm Mạnh Của Setup

1. **Production-ready**: Health checks, auto-restart, proper logging
2. **Optimized**: Multi-stage builds, .dockerignore, production deps only
3. **Maintainable**: Clear structure, good documentation
4. **Scalable**: Easy to add more services (Redis, etc.)
5. **Secure**: Environment variables, no hardcoded secrets (except MongoDB in demo)
6. **User-friendly**: One-command deployment, verification scripts

---

**✅ Docker Setup Complete & Ready for Submission!**

**Test một lần cuối:**
```bash
cd nodejsFinalProject-2
.\verify-docker-setup.ps1
docker compose up -d
docker compose ps
```

**Access:**
- Frontend: http://localhost:3000
- Backend API: http://localhost:3001/api/health
