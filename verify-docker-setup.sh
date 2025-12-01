#!/bin/bash

# Script kiểm tra Docker setup trước khi nộp
echo "🔍 PhoneWorld - Docker Setup Verification Script"
echo "================================================"
echo ""

# Kiểm tra Docker
echo "1️⃣ Checking Docker installation..."
if ! command -v docker &> /dev/null; then
    echo "❌ Docker chưa được cài đặt"
    exit 1
fi
echo "✅ Docker version: $(docker --version)"

# Kiểm tra Docker Compose
echo ""
echo "2️⃣ Checking Docker Compose..."
if ! command -v docker compose &> /dev/null; then
    echo "❌ Docker Compose chưa được cài đặt"
    exit 1
fi
echo "✅ Docker Compose version: $(docker compose version)"

# Kiểm tra file .env
echo ""
echo "3️⃣ Checking environment file..."
if [ ! -f .env ]; then
    echo "⚠️  File .env chưa tồn tại"
    echo "📝 Tạo file .env từ template..."
    cp .env.example .env
    echo "✅ File .env đã được tạo. Vui lòng điền các giá trị cần thiết!"
    exit 0
fi
echo "✅ File .env tồn tại"

# Kiểm tra các file cần thiết
echo ""
echo "4️⃣ Checking required files..."
files=("docker-compose.yml" "backend/Dockerfile" "frontend/Dockerfile" "frontend/nginx.conf")
for file in "${files[@]}"; do
    if [ ! -f "$file" ]; then
        echo "❌ Thiếu file: $file"
        exit 1
    fi
    echo "   ✅ $file"
done

# Test build
echo ""
echo "5️⃣ Testing Docker build (dry run)..."
if docker compose config > /dev/null 2>&1; then
    echo "✅ docker-compose.yml syntax OK"
else
    echo "❌ docker-compose.yml có lỗi cú pháp"
    exit 1
fi

# Kiểm tra ports
echo ""
echo "6️⃣ Checking if ports are available..."
ports=(3000 3001 27017 9200)
for port in "${ports[@]}"; do
    if lsof -Pi :$port -sTCP:LISTEN -t >/dev/null 2>&1; then
        echo "   ⚠️  Port $port đang được sử dụng"
    else
        echo "   ✅ Port $port available"
    fi
done

echo ""
echo "================================================"
echo "✅ Verification completed!"
echo ""
echo "Để chạy ứng dụng:"
echo "   docker compose up -d"
echo ""
echo "Để xem logs:"
echo "   docker compose logs -f"
echo ""
echo "Để dừng:"
echo "   docker compose down"
