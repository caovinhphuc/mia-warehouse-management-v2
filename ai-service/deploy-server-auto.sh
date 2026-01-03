#!/bin/bash

# =============================================================================
# 🚀 AUTO DEPLOY AI SERVICE TO SERVER - With Parameters
# =============================================================================
# Usage: ./deploy-server-auto.sh SERVER_HOST [USER] [PORT] [PATH] [SERVICE_PORT]
# Example: ./deploy-server-auto.sh 192.168.1.100 root 22 /opt/mia-ai-service 8000
# =============================================================================

set -e

GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
NC='\033[0m'

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$SCRIPT_DIR"

# Get parameters
SERVER_HOST=${1:-}
SERVER_USER=${2:-root}
SERVER_PORT=${3:-22}
SERVER_PATH=${4:-/opt/mia-ai-service}
SERVICE_PORT=${5:-8000}
DEPLOY_MODE=${6:-docker}

if [ -z "$SERVER_HOST" ]; then
    echo -e "${RED}❌ Thiếu tham số SERVER_HOST!${NC}"
    echo ""
    echo -e "${BLUE}Usage:${NC}"
    echo -e "  $0 SERVER_HOST [USER] [SSH_PORT] [DEPLOY_PATH] [SERVICE_PORT] [MODE]"
    echo ""
    echo -e "${BLUE}Examples:${NC}"
    echo -e "  $0 192.168.1.100"
    echo -e "  $0 ai-service.mia.vn root 22 /opt/mia-ai-service 8000 docker"
    echo ""
    exit 1
fi

echo -e "${CYAN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${GREEN}🚀 AUTO DEPLOY AI SERVICE TO SERVER${NC}"
echo -e "${CYAN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""
echo -e "${BLUE}📋 Configuration:${NC}"
echo -e "   Host: ${GREEN}$SERVER_HOST${NC}"
echo -e "   User: ${GREEN}$SERVER_USER${NC}"
echo -e "   SSH Port: ${GREEN}$SERVER_PORT${NC}"
echo -e "   Deploy Path: ${GREEN}$SERVER_PATH${NC}"
echo -e "   Service Port: ${GREEN}$SERVICE_PORT${NC}"
echo -e "   Mode: ${GREEN}$DEPLOY_MODE${NC}"
echo ""

# Export for deploy-to-server.sh
export SERVER_HOST
export SERVER_USER
export SERVER_PORT
export SERVER_PATH
export SERVICE_PORT

# Call original script
exec ./deploy-to-server.sh "$DEPLOY_MODE"

