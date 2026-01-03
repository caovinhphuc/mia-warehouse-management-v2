#!/bin/bash

# =============================================================================
# 🔧 INSTALL & START AI SERVICE - MIA.vn Google Integration Platform
# =============================================================================
# Script tự động cài đặt dependencies và khởi động service
# =============================================================================

set -e

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
BLUE='\033[0;34m'
NC='\033[0m'

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$SCRIPT_DIR"

echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${GREEN}🔧 Cài Đặt & Khởi Động AI Service${NC}"
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""

# 1. Tạo virtual environment nếu chưa có
if [ ! -d "venv" ]; then
    echo -e "${BLUE}📦 Tạo virtual environment...${NC}"
    python3 -m venv venv
    echo -e "${GREEN}✅ Virtual environment đã được tạo${NC}"
fi

# 2. Kích hoạt virtual environment
echo -e "${BLUE}🔄 Kích hoạt virtual environment...${NC}"
source venv/bin/activate
echo -e "${GREEN}✅ Virtual environment đã được kích hoạt${NC}"

# 3. Upgrade pip
echo -e "${BLUE}📦 Nâng cấp pip...${NC}"
pip install --upgrade pip -q
echo -e "${GREEN}✅ Pip đã được nâng cấp${NC}"

# 4. Cài đặt dependencies
echo -e "${BLUE}📦 Cài đặt dependencies...${NC}"
pip install -r requirements.txt
echo -e "${GREEN}✅ Dependencies đã được cài đặt${NC}"

# 5. Kiểm tra cài đặt
echo -e "${BLUE}🔍 Kiểm tra cài đặt...${NC}"
if python3 -c "import fastapi; import uvicorn" 2>/dev/null; then
    echo -e "${GREEN}✅ FastAPI & Uvicorn: OK${NC}"
else
    echo -e "${RED}❌ FastAPI hoặc Uvicorn chưa được cài đặt${NC}"
    exit 1
fi

if python3 -c "import selenium" 2>/dev/null; then
    echo -e "${GREEN}✅ Selenium: OK${NC}"
else
    echo -e "${YELLOW}⚠️  Selenium chưa được cài đặt (sẽ không thể verify one.tga.com.vn)${NC}"
fi

# 6. Dừng service cũ nếu có
echo -e "${BLUE}🛑 Kiểm tra service cũ...${NC}"
if [ -f "ai-service.pid" ]; then
    OLD_PID=$(cat ai-service.pid)
    if ps -p "$OLD_PID" > /dev/null 2>&1; then
        echo -e "${YELLOW}⚠️  Service cũ đang chạy. Đang dừng...${NC}"
        kill "$OLD_PID" 2>/dev/null || true
        sleep 2
    fi
    rm -f ai-service.pid
fi

# 7. Dừng process trên port 8000 nếu có (Lưu ý: Backend có thể cũng dùng port 8000)
PORT=8000
if lsof -ti:$PORT > /dev/null 2>&1; then
    echo -e "${YELLOW}⚠️  Port $PORT đang được sử dụng. Đang dừng...${NC}"
    echo -e "${YELLOW}💡 Lưu ý: Nếu backend đang chạy trên port 8000, hãy dừng backend trước${NC}"
    lsof -ti:$PORT | xargs kill -9 2>/dev/null || true
    sleep 1
fi

echo ""
echo -e "${GREEN}✅ Cài đặt hoàn tất!${NC}"
echo ""
echo -e "${BLUE}🚀 Khởi động service...${NC}"
echo ""

# 8. Start service
./start_background.sh

echo ""
echo -e "${GREEN}✨ Hoàn tất!${NC}"

