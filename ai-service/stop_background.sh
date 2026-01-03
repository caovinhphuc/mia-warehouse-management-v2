#!/bin/bash

# =============================================================================
# 🛑 STOP AI SERVICE - MIA.vn Google Integration Platform
# =============================================================================

set -e

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
BLUE='\033[0;34m'
NC='\033[0m'

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PID_FILE="$SCRIPT_DIR/ai-service.pid"
PORT=${PORT:-8000}

echo -e "${BLUE}🛑 Dừng AI Service...${NC}"
echo ""

if [ -f "$PID_FILE" ]; then
    PID=$(cat "$PID_FILE")
    if ps -p "$PID" > /dev/null 2>&1; then
        echo -e "${BLUE}Đang dừng process với PID: $PID${NC}"
        kill "$PID" 2>/dev/null || true
        sleep 2

        # Force kill nếu vẫn chạy
        if ps -p "$PID" > /dev/null 2>&1; then
            echo -e "${YELLOW}Force killing...${NC}"
            kill -9 "$PID" 2>/dev/null || true
        fi

        echo -e "${GREEN}✅ Đã dừng AI Service${NC}"
    else
        echo -e "${YELLOW}⚠️  Process không chạy (PID: $PID)${NC}"
    fi
    rm -f "$PID_FILE"
else
    echo -e "${YELLOW}⚠️  PID file không tồn tại${NC}"
fi

# Kiểm tra port
if lsof -ti:$PORT > /dev/null 2>&1; then
    echo -e "${YELLOW}⚠️  Port $PORT vẫn được sử dụng. Đang dừng...${NC}"
    lsof -ti:$PORT | xargs kill -9 2>/dev/null || true
    sleep 1
fi

echo -e "${GREEN}✅ Hoàn tất${NC}"

