#!/bin/bash

# =============================================================================
# 🚀 DEPLOY AI SERVICE - MIA.vn Google Integration Platform
# =============================================================================
# Script để deploy AI Service lên production (background hoặc Docker)
# =============================================================================

set -e

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
NC='\033[0m'

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$SCRIPT_DIR"

PORT=${PORT:-8000}
DEPLOY_MODE=${1:-background}

echo -e "${CYAN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${GREEN}🚀 DEPLOY AI SERVICE${NC}"
echo -e "${CYAN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${BLUE}Mode: ${YELLOW}${DEPLOY_MODE}${NC}"
echo -e "${BLUE}Port: ${YELLOW}${PORT}${NC}"
echo ""

# Function to check port
check_port() {
    local port=$1
    if lsof -ti:$port > /dev/null 2>&1; then
        echo -e "${YELLOW}⚠️  Port $port đang được sử dụng${NC}"
        lsof -ti:$port | while read pid; do
            local process=$(ps -p $pid -o comm= 2>/dev/null || echo "unknown")
            echo -e "   Process ID: $pid ($process)"
        done
        return 1
    else
        echo -e "${GREEN}✅ Port $port available${NC}"
        return 0
    fi
}

# Function to kill port
kill_port() {
    local port=$1
    echo -e "${YELLOW}🛑 Đang dừng process trên port $port...${NC}"
    lsof -ti:$port | xargs kill -9 2>/dev/null || true
    sleep 2
    if lsof -ti:$port > /dev/null 2>&1; then
        echo -e "${RED}❌ Không thể dừng process trên port $port${NC}"
        return 1
    else
        echo -e "${GREEN}✅ Đã dừng process trên port $port${NC}"
        return 0
    fi
}

# Function to deploy background
deploy_background() {
    echo -e "${BLUE}📦 Deploy AI Service (Background Mode)...${NC}"
    echo ""

    # Check port
    if ! check_port $PORT; then
        read -p "Bạn có muốn dừng process đang dùng port $PORT? (y/n): " -n 1 -r
        echo
        if [[ $REPLY =~ ^[Yy]$ ]]; then
            kill_port $PORT
        else
            echo -e "${RED}❌ Deploy bị hủy${NC}"
            exit 1
        fi
    fi

    # Stop existing service
    if [ -f "stop_background.sh" ]; then
        echo -e "${BLUE}🛑 Dừng service cũ...${NC}"
        ./stop_background.sh || true
    fi

    # Start service
    if [ -f "start_background.sh" ]; then
        echo -e "${BLUE}🚀 Khởi động service mới...${NC}"
        ./start_background.sh

        # Wait a bit and check
        sleep 3
        if curl -sf "http://localhost:$PORT/health" > /dev/null 2>&1; then
            echo -e "${GREEN}✅ AI Service đã được deploy thành công!${NC}"
            echo -e "${GREEN}   Health: http://localhost:$PORT/health${NC}"
        else
            echo -e "${YELLOW}⚠️  Service đang khởi động, vui lòng đợi...${NC}"
        fi
    else
        echo -e "${RED}❌ Không tìm thấy start_background.sh${NC}"
        exit 1
    fi
}

# Function to deploy with Docker
deploy_docker() {
    echo -e "${BLUE}🐳 Deploy AI Service (Docker Mode)...${NC}"
    echo ""

    # Check Docker
    if ! command -v docker &> /dev/null; then
        echo -e "${RED}❌ Docker chưa được cài đặt${NC}"
        exit 1
    fi

    # Stop existing container
    if docker ps -a --format '{{.Names}}' | grep -q "mia-ai-service"; then
        echo -e "${BLUE}🛑 Dừng container cũ...${NC}"
        docker stop mia-ai-service 2>/dev/null || true
        docker rm mia-ai-service 2>/dev/null || true
    fi

    # Build image
    echo -e "${BLUE}🔨 Đang build Docker image...${NC}"
    docker build -f Dockerfile.ai -t mia-ai-service:latest .

    # Run container
    echo -e "${BLUE}🚀 Khởi động container...${NC}"
    docker run -d \
        --name mia-ai-service \
        --restart unless-stopped \
        -p $PORT:8000 \
        mia-ai-service:latest

    # Wait and check
    sleep 5
    if docker ps | grep -q "mia-ai-service"; then
        echo -e "${GREEN}✅ AI Service đã được deploy thành công (Docker)!${NC}"
        echo -e "${GREEN}   Container: mia-ai-service${NC}"
        echo -e "${GREEN}   Health: http://localhost:$PORT/health${NC}"
        echo ""
        echo -e "${BLUE}📋 Logs:${NC}"
        echo -e "   docker logs -f mia-ai-service"
    else
        echo -e "${RED}❌ Container không khởi động được${NC}"
        docker logs mia-ai-service
        exit 1
    fi
}

# Main deployment
case "$DEPLOY_MODE" in
    background|bg)
        deploy_background
        ;;
    docker|d)
        deploy_docker
        ;;
    *)
        echo -e "${YELLOW}Usage: $0 [background|docker]${NC}"
        echo ""
        echo -e "${BLUE}Options:${NC}"
        echo -e "  background, bg  - Deploy như background service (default)"
        echo -e "  docker, d       - Deploy với Docker"
        echo ""
        echo -e "${BLUE}Examples:${NC}"
        echo -e "  $0              # Deploy background (default)"
        echo -e "  $0 background   # Deploy background"
        echo -e "  $0 docker       # Deploy với Docker"
        exit 1
        ;;
esac

echo ""
echo -e "${CYAN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${GREEN}✨ Hoàn tất deploy!${NC}"
echo -e "${CYAN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"

