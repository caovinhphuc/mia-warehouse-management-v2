#!/bin/bash

# =============================================================================
# 🚀 START AI SERVICE IN BACKGROUND - MIA.vn Google Integration Platform
# =============================================================================
# Script để chạy AI Service ở background với auto-restart
# =============================================================================

set -e

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$SCRIPT_DIR"

PORT=${PORT:-8000}
PID_FILE="$SCRIPT_DIR/ai-service.pid"
LOG_FILE="$SCRIPT_DIR/logs/ai-service.log"
STDERR_LOG="$SCRIPT_DIR/logs/ai-service-error.log"

# Tạo thư mục logs nếu chưa có
mkdir -p "$SCRIPT_DIR/logs"

echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${GREEN}🚀 MIA.vn AI Service - Background Mode${NC}"
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""

# Kiểm tra nếu service đã chạy
if [ -f "$PID_FILE" ]; then
    OLD_PID=$(cat "$PID_FILE")
    if ps -p "$OLD_PID" > /dev/null 2>&1; then
        echo -e "${YELLOW}⚠️  AI Service đã chạy với PID: $OLD_PID${NC}"
        echo -e "${YELLOW}💡 Để restart, chạy: ./stop_background.sh${NC}"
        exit 1
    else
        echo -e "${YELLOW}⚠️  PID file tồn tại nhưng process không chạy. Đang xóa...${NC}"
        rm -f "$PID_FILE"
    fi
fi

# Check port
if lsof -ti:$PORT > /dev/null 2>&1; then
    echo -e "${YELLOW}⚠️  Port $PORT đang được sử dụng${NC}"
    echo -e "${BLUE}Đang dừng process cũ...${NC}"
    lsof -ti:$PORT | xargs kill -9 2>/dev/null || true
    sleep 2
fi

# Activate virtual environment
if [ -f "venv/bin/activate" ]; then
    source venv/bin/activate
    echo -e "${GREEN}✅ Virtual environment activated${NC}"
elif [ -f "bin/activate" ]; then
    source bin/activate
    echo -e "${GREEN}✅ Virtual environment activated${NC}"
else
    echo -e "${YELLOW}⚠️  Virtual environment không tìm thấy. Sử dụng system Python.${NC}"
fi

# Check dependencies
echo -e "${BLUE}Đang kiểm tra dependencies...${NC}"
if ! python3 -c "import fastapi" 2>/dev/null; then
    echo -e "${YELLOW}⚠️  FastAPI chưa được cài đặt. Đang cài đặt...${NC}"
    pip install -q -r requirements.txt
    if [ $? -ne 0 ]; then
        echo -e "${RED}❌ Không thể cài đặt dependencies!${NC}"
        exit 1
    fi
    echo -e "${GREEN}✅ Dependencies đã được cài đặt${NC}"
fi

# Start service in background
echo -e "${BLUE}Đang khởi động AI Service trên port $PORT...${NC}"
echo ""

# Set environment
export PORT=$PORT
export PYTHONUNBUFFERED=1

# Start in background và lưu PID (sử dụng python3 từ virtual env nếu có)
PYTHON_CMD="python3"
if [ -f "venv/bin/activate" ] && [ -n "$VIRTUAL_ENV" ]; then
    PYTHON_CMD="$VIRTUAL_ENV/bin/python3"
fi

nohup $PYTHON_CMD ai_service.py > "$LOG_FILE" 2> "$STDERR_LOG" &
SERVICE_PID=$!

# Lưu PID
echo $SERVICE_PID > "$PID_FILE"

# Chờ một chút để service start
sleep 3

# Kiểm tra service đã start chưa
if ps -p $SERVICE_PID > /dev/null 2>&1; then
    echo -e "${GREEN}✅ AI Service đã khởi động thành công!${NC}"
    echo ""
    echo -e "${BLUE}📊 Thông tin:${NC}"
    echo -e "   PID: ${GREEN}$SERVICE_PID${NC}"
    echo -e "   Port: ${GREEN}$PORT${NC}"
    echo -e "   URL: ${GREEN}http://localhost:$PORT${NC}"
    echo -e "   Health: ${GREEN}http://localhost:$PORT/health${NC}"
    echo -e "   Logs: ${GREEN}$LOG_FILE${NC}"
    echo -e "   Error Logs: ${GREEN}$STDERR_LOG${NC}"
    echo ""
    echo -e "${BLUE}💡 Để dừng service:${NC}"
    echo -e "   ${YELLOW}./stop_background.sh${NC}"
    echo -e "   ${YELLOW}kill $SERVICE_PID${NC}"
    echo ""

    # Test health endpoint
    sleep 2
    if curl -sf "http://localhost:$PORT/health" > /dev/null 2>&1; then
        echo -e "${GREEN}✅ Health check: OK${NC}"
    else
        echo -e "${YELLOW}⚠️  Health check: Đang chờ service khởi động...${NC}"
    fi
else
    echo -e "${RED}❌ Không thể khởi động AI Service${NC}"
    echo -e "${YELLOW}💡 Xem logs: ${LOG_FILE}${NC}"
    rm -f "$PID_FILE"
    exit 1
fi

echo ""
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"

