#!/bin/bash

# =============================================================================
# 🧹 CLEANUP AI SERVICE - Dừng tất cả processes và cleanup
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

PORT=${PORT:-8000}
PID_FILE="$SCRIPT_DIR/ai-service.pid"

echo -e "${BLUE}🧹 Cleanup AI Service...${NC}"
echo ""

# 1. Dừng service từ PID file
if [ -f "$PID_FILE" ]; then
    PID=$(cat "$PID_FILE")
    if ps -p "$PID" > /dev/null 2>&1; then
        echo -e "${BLUE}Đang dừng process với PID: $PID${NC}"
        kill "$PID" 2>/dev/null || true
        sleep 2
        if ps -p "$PID" > /dev/null 2>&1; then
            kill -9 "$PID" 2>/dev/null || true
        fi
        echo -e "${GREEN}✅ Đã dừng process${NC}"
    fi
    rm -f "$PID_FILE"
fi

# 2. Dừng tất cả process trên port đang cấu hình
if lsof -ti:$PORT > /dev/null 2>&1; then
    echo -e "${BLUE}Đang dừng tất cả process trên port $PORT...${NC}"
    PIDS=$(lsof -ti:$PORT)
    for PID in $PIDS; do
        echo -e "${YELLOW}  - Dừng PID: $PID${NC}"
        kill -9 "$PID" 2>/dev/null || true
    done
    sleep 1
    echo -e "${GREEN}✅ Đã dừng tất cả process${NC}"
else
    echo -e "${GREEN}✅ Không có process nào trên port $PORT${NC}"
fi

echo ""
echo -e "${GREEN}✨ Cleanup hoàn tất!${NC}"

