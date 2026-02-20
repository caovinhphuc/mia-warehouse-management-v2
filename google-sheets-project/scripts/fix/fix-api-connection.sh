#!/bin/bash

# 🔧 Script để fix lỗi kết nối API
# Fix: "Không thể kết nối đến server"

set -e

GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
BLUE='\033[0;34m'
NC='\033[0m'

PROJECT_ROOT="$(cd "$(dirname "$0")/.." && pwd)"
ENV_FILE="$PROJECT_ROOT/.env"

echo -e "${BLUE}🔧 Fix API Connection...${NC}"
echo "================================================="

# Bước 1: Kiểm tra và thêm REACT_APP_API_URL vào .env
echo -e "${BLUE}📝 Bước 1: Kiểm tra .env file...${NC}"

if [ ! -f "$ENV_FILE" ]; then
    echo -e "${YELLOW}⚠️  File .env không tồn tại. Đang tạo mới...${NC}"
    touch "$ENV_FILE"
fi

# Kiểm tra xem REACT_APP_API_URL đã có chưa
if grep -q "REACT_APP_API_URL" "$ENV_FILE" 2>/dev/null; then
    echo -e "${YELLOW}⚠️  REACT_APP_API_URL đã tồn tại trong .env${NC}"
    echo -e "${BLUE}📋 Giá trị hiện tại:${NC}"
    grep "REACT_APP_API_URL" "$ENV_FILE" || true
else
    echo -e "${YELLOW}➕ Đang thêm REACT_APP_API_URL vào .env...${NC}"
    echo "" >> "$ENV_FILE"
    echo "# Backend API URL" >> "$ENV_FILE"
    echo "REACT_APP_API_URL=http://localhost:3001" >> "$ENV_FILE"
    echo -e "${GREEN}✅ Đã thêm REACT_APP_API_URL=http://localhost:3001${NC}"
fi

# Bước 2: Kiểm tra backend server
echo ""
echo -e "${BLUE}📡 Bước 2: Kiểm tra backend server...${NC}"

if lsof -ti:3001 >/dev/null 2>&1; then
    echo -e "${GREEN}✅ Backend server đang chạy trên port 3001${NC}"

    # Test health endpoint
    if curl -s http://localhost:3001/health > /dev/null 2>&1; then
        echo -e "${GREEN}✅ Backend server phản hồi tốt!${NC}"
    else
        echo -e "${YELLOW}⚠️  Backend đang chạy nhưng chưa phản hồi. Vui lòng đợi...${NC}"
    fi
else
    echo -e "${RED}❌ Backend server KHÔNG chạy!${NC}"
    echo -e "${BLUE}🚀 Đang start backend server...${NC}"

    # Chạy script start backend
    if [ -f "$PROJECT_ROOT/scripts/start-backend.sh" ]; then
        bash "$PROJECT_ROOT/scripts/start-backend.sh"
    else
        echo -e "${RED}❌ Script start-backend.sh không tồn tại!${NC}"
        echo -e "${YELLOW}💡 Chạy thủ công:${NC}"
        echo "   cd backend && npm start"
        exit 1
    fi
fi

# Bước 3: Hiển thị thông tin
echo ""
echo -e "${GREEN}✅ Hoàn tất!${NC}"
echo "================================================="
echo -e "${BLUE}📋 Cấu hình:${NC}"
echo "   - REACT_APP_API_URL: http://localhost:3001"
echo "   - Backend Health: http://localhost:3001/health"
echo ""
echo -e "${BLUE}💡 Lưu ý:${NC}"
echo "   - Frontend cần restart để load biến môi trường mới"
echo "   - Chạy: npm start (hoặc restart dev server)"
echo ""

