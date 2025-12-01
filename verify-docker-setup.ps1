# PhoneWorld - Docker Setup Verification (Windows)
# Chạy script này trước khi nộp bài để kiểm tra setup

Write-Host "🔍 PhoneWorld - Docker Setup Verification Script" -ForegroundColor Cyan
Write-Host "================================================" -ForegroundColor Cyan
Write-Host ""

$ErrorCount = 0

# Kiểm tra Docker
Write-Host "1️⃣ Checking Docker installation..." -ForegroundColor Yellow
try {
    $dockerVersion = docker --version
    Write-Host "✅ Docker version: $dockerVersion" -ForegroundColor Green
} catch {
    Write-Host "❌ Docker chưa được cài đặt hoặc không chạy" -ForegroundColor Red
    $ErrorCount++
}

# Kiểm tra Docker Compose
Write-Host ""
Write-Host "2️⃣ Checking Docker Compose..." -ForegroundColor Yellow
try {
    $composeVersion = docker compose version
    Write-Host "✅ Docker Compose version: $composeVersion" -ForegroundColor Green
} catch {
    Write-Host "❌ Docker Compose chưa được cài đặt" -ForegroundColor Red
    $ErrorCount++
}

# Kiểm tra file .env
Write-Host ""
Write-Host "3️⃣ Checking environment file..." -ForegroundColor Yellow
if (-Not (Test-Path .env)) {
    Write-Host "⚠️  File .env chưa tồn tại" -ForegroundColor Yellow
    if (Test-Path .env.example) {
        Write-Host "📝 Tạo file .env từ template..." -ForegroundColor Cyan
        Copy-Item .env.example .env
        Write-Host "✅ File .env đã được tạo. Vui lòng điền các giá trị cần thiết!" -ForegroundColor Green
        Write-Host ""
        Write-Host "Mở file .env và điền:" -ForegroundColor Yellow
        Write-Host "  - JWT_SECRET (bắt buộc)" -ForegroundColor White
        Write-Host "  - CLOUDINARY credentials (bắt buộc)" -ForegroundColor White
        Write-Host "  - Các biến khác (tùy chọn)" -ForegroundColor White
        exit 0
    } else {
        Write-Host "❌ Không tìm thấy .env.example" -ForegroundColor Red
        $ErrorCount++
    }
} else {
    Write-Host "✅ File .env tồn tại" -ForegroundColor Green
}

# Kiểm tra các file cần thiết
Write-Host ""
Write-Host "4️⃣ Checking required files..." -ForegroundColor Yellow
$requiredFiles = @(
    "docker-compose.yml",
    "backend\Dockerfile",
    "frontend\Dockerfile",
    "frontend\nginx.conf",
    "backend\init-mongo.js"
)

foreach ($file in $requiredFiles) {
    if (Test-Path $file) {
        Write-Host "   ✅ $file" -ForegroundColor Green
    } else {
        Write-Host "   ❌ Thiếu file: $file" -ForegroundColor Red
        $ErrorCount++
    }
}

# Test docker-compose syntax
Write-Host ""
Write-Host "5️⃣ Testing docker-compose.yml syntax..." -ForegroundColor Yellow
try {
    docker compose config | Out-Null
    Write-Host "✅ docker-compose.yml syntax OK" -ForegroundColor Green
} catch {
    Write-Host "❌ docker-compose.yml có lỗi cú pháp" -ForegroundColor Red
    $ErrorCount++
}

# Kiểm tra ports
Write-Host ""
Write-Host "6️⃣ Checking if ports are available..." -ForegroundColor Yellow
$ports = @(3000, 3001, 27017, 9200)
foreach ($port in $ports) {
    $connection = Get-NetTCPConnection -LocalPort $port -ErrorAction SilentlyContinue
    if ($connection) {
        Write-Host "   ⚠️  Port $port đang được sử dụng" -ForegroundColor Yellow
    } else {
        Write-Host "   ✅ Port $port available" -ForegroundColor Green
    }
}

# Tóm tắt
Write-Host ""
Write-Host "================================================" -ForegroundColor Cyan
if ($ErrorCount -eq 0) {
    Write-Host "✅ Verification completed! Setup OK!" -ForegroundColor Green
    Write-Host ""
    Write-Host "Để chạy ứng dụng:" -ForegroundColor Cyan
    Write-Host "   docker compose up -d" -ForegroundColor White
    Write-Host ""
    Write-Host "Để xem logs:" -ForegroundColor Cyan
    Write-Host "   docker compose logs -f" -ForegroundColor White
    Write-Host ""
    Write-Host "Để dừng:" -ForegroundColor Cyan
    Write-Host "   docker compose down" -ForegroundColor White
} else {
    Write-Host "❌ Có $ErrorCount lỗi cần khắc phục!" -ForegroundColor Red
    exit 1
}
