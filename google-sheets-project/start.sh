#!/bin/bash

echo "🚀 KHỞI ĐỘNG DỰ ÁN GOOGLE SHEETS"
echo "================================="
echo ""

# Kiểm tra Node.js
if ! command -v node &> /dev/null; then
    echo "❌ Node.js chưa được cài đặt!"
    exit 1
fi

echo "✅ Node.js: $(node --version)"
echo ""

# Cài đặt dependencies
echo "📦 Cài đặt dependencies..."
npm install --legacy-peer-deps

# Khởi động Backend
echo "🔧 Khởi động Backend (Port 3003)..."
node server.js &
BACKEND_PID=$!

# Khởi động Frontend
echo "🎨 Khởi động Frontend (Port 3002)..."
PORT=3002 npm start &
FRONTEND_PID=$!

echo ""
echo "🎉 DỰ ÁN GOOGLE SHEETS ĐÃ KHỞI ĐỘNG!"
echo "===================================="
echo "📋 Frontend: http://localhost:3002"
echo "📋 Backend API: http://localhost:3003"
echo ""
echo "💡 Để dừng tất cả dịch vụ, nhấn Ctrl+C"

# Chờ tín hiệu dừng
trap "echo '🛑 Đang dừng tất cả dịch vụ...'; kill $BACKEND_PID $FRONTEND_PID; exit" INT
wait
