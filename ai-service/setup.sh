#!/bin/bash

echo "=== ONE Automation System - Production Setup ==="
echo "Thiết lập hệ thống tự động hóa ONE cho môi trường production"

# Kiểm tra Python
echo "Kiểm tra Python..."
if ! command -v python3 &> /dev/null; then
    echo "❌ Python3 không được tìm thấy. Vui lòng cài đặt Python3."
    exit 1
fi

echo "✅ Python3 đã được cài đặt: $(python3 --version)"

# Kiểm tra Node.js
echo "Kiểm tra Node.js..."
if ! command -v node &> /dev/null; then
    echo "❌ Node.js không được tìm thấy. Vui lòng cài đặt Node.js."
    exit 1
fi

echo "✅ Node.js đã được cài đặt: $(node --version)"

# Tạo virtual environment cho Python
echo "Tạo Python virtual environment..."
if [ ! -d "venv" ]; then
    python3 -m venv venv
    echo "✅ Virtual environment đã được tạo"
else
    echo "✅ Virtual environment đã tồn tại"
fi

# Kích hoạt virtual environment
echo "Kích hoạt virtual environment..."
source venv/bin/activate

# Cài đặt Python dependencies
echo "Cài đặt Python dependencies..."
pip install --upgrade pip
pip install -r requirements.txt
echo "✅ Python dependencies đã được cài đặt"

# Kiểm tra và cài đặt Node dependencies nếu cần
echo "Kiểm tra Node.js dependencies..."
if [ ! -d "node_modules" ]; then
    echo "Cài đặt Node.js dependencies..."
    npm install
    echo "✅ Node.js dependencies đã được cài đặt"
else
    echo "✅ Node.js dependencies đã tồn tại"
fi

# Tạo file .env từ template
echo "Thiết lập file cấu hình..."
if [ ! -f ".env" ]; then
    if [ -f ".env.template" ]; then
        cp .env.template .env
        echo "✅ File .env đã được tạo từ template"
        echo "⚠️  VUI LÒNG CẬP NHẬT THÔNG TIN ĐĂNG NHẬP TRONG FILE .env"
    else
        echo "❌ File .env.template không tồn tại"
    fi
else
    echo "✅ File .env đã tồn tại"
fi

# Tạo các thư mục cần thiết
echo "Tạo các thư mục cần thiết..."
mkdir -p logs
mkdir -p data
mkdir -p exports
echo "✅ Các thư mục đã được tạo"

# Kiểm tra cấu hình
echo "Kiểm tra cấu hình..."
if [ -f "config/config.json" ]; then
    echo "✅ File config.json đã tồn tại"
else
    echo "❌ File config/config.json không tồn tại"
fi

# Kiểm tra automation files
echo "Kiểm tra automation files..."
if [ -f "automation.py" ]; then
    echo "✅ automation.py đã tồn tại"
else
    echo "❌ automation.py không tồn tại"
fi

if [ -f "automation_bridge.py" ]; then
    echo "✅ automation_bridge.py đã tồn tại"
else
    echo "❌ automation_bridge.py không tồn tại"
fi

echo ""
echo "=== SETUP HOÀN TẤT ==="
echo ""
echo "📋 BƯỚC TIẾP THEO:"
echo "1. Cập nhật thông tin đăng nhập trong file .env:"
echo "   - ONE_USERNAME=your_username"
echo "   - ONE_PASSWORD=your_password"
echo "   - LOGIN_URL=your_login_url"
echo ""
echo "2. Khởi động hệ thống:"
echo "   Backend: ./start_backend.sh"
echo "   Frontend: npm start"
echo ""
echo "3. Test automation:"
echo "   source venv/bin/activate"
echo "   python automation.py"
echo ""
echo "⚠️  QUAN TRỌNG: Đây là môi trường PRODUCTION - không có demo mode!"
echo "   Hệ thống sẽ kết nối trực tiếp với hệ thống ONE thật."
echo ""
echo "✅ Hệ thống đã sẵn sàng cho production!"
