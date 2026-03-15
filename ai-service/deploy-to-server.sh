#!/bin/bash

# =============================================================================
# 🚀 DEPLOY AI SERVICE TO PRODUCTION SERVER
# =============================================================================
# Script để deploy AI Service lên production server (VPS/Cloud)
# Sau khi deploy, các service khác sẽ dùng URL production này
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

# Configuration (sẽ hỏi nếu chưa set)
# Có thể set qua environment variables hoặc command line arguments
SERVER_HOST=${1:-${SERVER_HOST:-}}
SERVER_USER=${2:-${SERVER_USER:-root}}
SERVER_PORT=${3:-${SERVER_PORT:-22}}
SERVER_PATH=${4:-${SERVER_PATH:-/opt/mia-ai-service}}
SERVICE_PORT=${5:-${SERVICE_PORT:-8000}}
DEPLOY_MODE=${6:-${DEPLOY_MODE:-docker}}  # docker hoặc background

echo -e "${CYAN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${GREEN}🚀 DEPLOY AI SERVICE TO PRODUCTION SERVER${NC}"
echo -e "${CYAN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""

# Function to ask for input
ask_input() {
    local var_name=$1
    local prompt=$2
    local default=$3
    local value

    if [ -n "${!var_name}" ]; then
        value="${!var_name}"
        echo -e "${BLUE}$prompt${NC} [${YELLOW}$value${NC}]: "
    else
        if [ -n "$default" ]; then
            echo -e "${BLUE}$prompt${NC} [${YELLOW}$default${NC}]: "
            read value
            value=${value:-$default}
        else
            echo -e "${BLUE}$prompt${NC}: "
            read value
        fi
    fi

    eval "$var_name=\"$value\""
    export "$var_name"
}

# Get server configuration
if [ -z "$SERVER_HOST" ]; then
    echo -e "${YELLOW}📋 Nhập thông tin server production:${NC}"
    echo ""
    ask_input "SERVER_HOST" "Server host/IP hoặc domain" ""
    ask_input "SERVER_USER" "SSH User" "root"
    ask_input "SERVER_PORT" "SSH Port" "22"
    ask_input "SERVER_PATH" "Deployment path trên server" "/opt/mia-ai-service"
    ask_input "SERVICE_PORT" "Service port trên server" "8000"
    echo ""
fi

# Validate inputs
if [ -z "$SERVER_HOST" ]; then
    echo -e "${RED}❌ Server host không được để trống!${NC}"
    exit 1
fi

# Reject common placeholders
case "$SERVER_HOST" in
    YOUR_SERVER_IP|YOUR_IP|example.com)
        echo -e "${RED}❌ Sai host: '$SERVER_HOST' là placeholder, cần nhập IP/domain thật${NC}"
        echo -e "${YELLOW}   Ví dụ: 192.168.1.100 hoặc ai-service.mia.vn${NC}"
        exit 1
        ;;
esac

echo -e "${BLUE}📋 Configuration:${NC}"
echo -e "   Host: ${GREEN}$SERVER_HOST${NC}"
echo -e "   User: ${GREEN}$SERVER_USER${NC}"
echo -e "   Port: ${GREEN}$SERVER_PORT${NC}"
echo -e "   Path: ${GREEN}$SERVER_PATH${NC}"
echo -e "   Service Port: ${GREEN}$SERVICE_PORT${NC}"
echo -e "   Deploy Mode: ${GREEN}$DEPLOY_MODE${NC}"
echo ""

read -p "Tiếp tục deploy? (y/n): " -n 1 -r
echo
if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    echo -e "${YELLOW}Deploy bị hủy${NC}"
    exit 1
fi

echo ""

# Function to execute command on remote server
ssh_cmd() {
    ssh -p "$SERVER_PORT" "$SERVER_USER@$SERVER_HOST" "$@"
}

# Function to copy files to server
scp_cmd() {
    local src=$1
    local dst=$2
    scp -P "$SERVER_PORT" -r "$src" "$SERVER_USER@$SERVER_HOST:$dst"
}

# Step 1: Check SSH connection
echo -e "${BLUE}🔍 Kiểm tra kết nối SSH...${NC}"
if ssh_cmd "echo 'Connection OK'" > /dev/null 2>&1; then
    echo -e "${GREEN}✅ SSH connection OK${NC}"
else
    echo -e "${RED}❌ Không thể kết nối SSH đến server${NC}"
    echo -e "${YELLOW}💡 Kiểm tra:${NC}"
    echo -e "   - Server host/IP đúng chưa?"
    echo -e "   - SSH key đã được add chưa?"
    echo -e "   - Firewall cho phép port $SERVER_PORT chưa?"
    exit 1
fi

# Step 2: Prepare deployment directory
echo -e "${BLUE}📁 Chuẩn bị thư mục trên server...${NC}"
ssh_cmd "mkdir -p $SERVER_PATH" || true
ssh_cmd "mkdir -p $SERVER_PATH/logs" || true
echo -e "${GREEN}✅ Thư mục đã sẵn sàng${NC}"

# Step 3: Deploy based on mode
if [ "$DEPLOY_MODE" == "docker" ]; then
    echo -e "${BLUE}🐳 Deploy với Docker...${NC}"

    # Copy Dockerfile
    echo -e "${BLUE}📦 Copy Dockerfile...${NC}"
    scp_cmd "$SCRIPT_DIR/Dockerfile.ai" "$SERVER_PATH/"
    scp_cmd "$SCRIPT_DIR/requirements.txt" "$SERVER_PATH/"

    # Copy source code
    echo -e "${BLUE}📦 Copy source code...${NC}"
    ssh_cmd "mkdir -p $SERVER_PATH/ai-service" || true
    scp_cmd "$SCRIPT_DIR/ai_service.py" "$SERVER_PATH/ai-service/"

    # Build and run Docker container
    echo -e "${BLUE}🔨 Build và run Docker container...${NC}"
    ssh_cmd "cd $SERVER_PATH && docker build -f Dockerfile.ai -t mia-ai-service:latest ."

    # Stop existing container
    ssh_cmd "docker stop mia-ai-service 2>/dev/null || true"
    ssh_cmd "docker rm mia-ai-service 2>/dev/null || true"

    # Run new container
    ssh_cmd "docker run -d \
        --name mia-ai-service \
        --restart unless-stopped \
        -p $SERVICE_PORT:8000 \
        -v $SERVER_PATH/logs:/app/logs \
        mia-ai-service:latest"

    echo -e "${GREEN}✅ Docker deployment completed${NC}"

elif [ "$DEPLOY_MODE" == "background" ]; then
    echo -e "${BLUE}📦 Deploy như background service...${NC}"

    # Copy files
    echo -e "${BLUE}📦 Copy files...${NC}"
    scp_cmd "$SCRIPT_DIR/ai_service.py" "$SERVER_PATH/"
    scp_cmd "$SCRIPT_DIR/requirements.txt" "$SERVER_PATH/"
    scp_cmd "$SCRIPT_DIR/start_background.sh" "$SERVER_PATH/"
    scp_cmd "$SCRIPT_DIR/stop_background.sh" "$SERVER_PATH/"

    # Setup Python environment on server
    echo -e "${BLUE}🐍 Setup Python environment...${NC}"
    ssh_cmd "cd $SERVER_PATH && \
        python3 -m venv venv || true && \
        source venv/bin/activate && \
        pip install -q --upgrade pip && \
        pip install -q -r requirements.txt"

    # Create systemd service
    echo -e "${BLUE}⚙️  Tạo systemd service...${NC}"
    ssh_cmd "cat > /tmp/mia-ai-service.service << 'EOF'
[Unit]
Description=MIA AI Service
After=network.target

[Service]
Type=simple
User=$SERVER_USER
WorkingDirectory=$SERVER_PATH
Environment=\"PORT=$SERVICE_PORT\"
Environment=\"PYTHONUNBUFFERED=1\"
ExecStart=$SERVER_PATH/venv/bin/python $SERVER_PATH/ai_service.py
Restart=always
RestartSec=10

[Install]
WantedBy=multi-user.target
EOF
sudo mv /tmp/mia-ai-service.service /etc/systemd/system/ && \
sudo systemctl daemon-reload && \
sudo systemctl enable mia-ai-service && \
sudo systemctl restart mia-ai-service"

    echo -e "${GREEN}✅ Background service deployment completed${NC}"
fi

# Step 4: Wait and check health
echo -e "${BLUE}⏳ Chờ service khởi động...${NC}"
sleep 5

# Determine production URL
if [[ "$SERVER_HOST" =~ ^[0-9]+\.[0-9]+\.[0-9]+\.[0-9]+$ ]]; then
    PRODUCTION_URL="http://$SERVER_HOST:$SERVICE_PORT"
else
    # Domain
    PRODUCTION_URL="http://$SERVER_HOST:$SERVICE_PORT"
fi

# Check health
echo -e "${BLUE}🏥 Kiểm tra health...${NC}"
if curl -sf "$PRODUCTION_URL/health" > /dev/null 2>&1; then
    echo -e "${GREEN}✅ Service đã chạy thành công!${NC}"
else
    echo -e "${YELLOW}⚠️  Service đang khởi động, có thể cần đợi thêm...${NC}"
    echo -e "${BLUE}💡 Kiểm tra manual: curl $PRODUCTION_URL/health${NC}"
fi

# Step 5: Save configuration
CONFIG_FILE="$SCRIPT_DIR/.deploy-config"
cat > "$CONFIG_FILE" << EOF
# AI Service Production Deployment Configuration
# Generated: $(date)

SERVER_HOST=$SERVER_HOST
SERVER_USER=$SERVER_USER
SERVER_PORT=$SERVER_PORT
SERVER_PATH=$SERVER_PATH
SERVICE_PORT=$SERVICE_PORT
DEPLOY_MODE=$DEPLOY_MODE
PRODUCTION_URL=$PRODUCTION_URL
EOF

echo ""
echo -e "${CYAN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${GREEN}✨ DEPLOYMENT COMPLETED!${NC}"
echo -e "${CYAN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""
echo -e "${BLUE}📋 Production URL:${NC}"
echo -e "   ${GREEN}$PRODUCTION_URL${NC}"
echo ""
echo -e "${BLUE}🔗 Endpoints:${NC}"
echo -e "   Health: ${GREEN}$PRODUCTION_URL/health${NC}"
echo -e "   One TGA: ${GREEN}$PRODUCTION_URL/api/auth/verify-one-tga${NC}"
echo ""
echo -e "${YELLOW}📝 Bước tiếp theo:${NC}"
echo -e "   1. Cấu hình backend và frontend để dùng URL này:"
echo -e "      ${BLUE}AI_SERVICE_URL=$PRODUCTION_URL${NC}"
echo -e "   2. Test: curl $PRODUCTION_URL/health"
echo -e "   3. Xem logs trên server: ssh $SERVER_USER@$SERVER_HOST"
echo ""
echo -e "${GREEN}✅ Configuration saved to: $CONFIG_FILE${NC}"
echo ""

