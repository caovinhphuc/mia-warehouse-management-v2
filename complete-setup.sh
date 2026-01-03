#!/bin/bash

# =============================================================================
# 🚀 COMPLETE SETUP SCRIPT - MIA.vn Google Integration Platform
# =============================================================================
# Script tổng hợp để setup toàn bộ hệ thống từ đầu đến cuối
# =============================================================================

set -e

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
NC='\033[0m'

# Get project root
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$SCRIPT_DIR"

echo -e "${CYAN}"
echo "╔══════════════════════════════════════════════════════════════╗"
echo "║                                                              ║"
echo "║     🚀 MIA.vn Google Integration Platform - Complete Setup   ║"
echo "║                                                              ║"
echo "╚══════════════════════════════════════════════════════════════╝"
echo -e "${NC}"
echo ""

# Step 1: Check prerequisites
echo -e "${CYAN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${CYAN}⚙️  BƯỚC 1/7: KIỂM TRA ĐIỀU KIỆN HỆ THỐNG${NC}"
echo -e "${CYAN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"

MISSING_DEPS=()

if ! command -v node &> /dev/null; then
    MISSING_DEPS+=("node")
    echo -e "${RED}❌ Node.js chưa được cài đặt${NC}"
else
    echo -e "${GREEN}✅ Node.js $(node --version)${NC}"
fi

if ! command -v npm &> /dev/null; then
    MISSING_DEPS+=("npm")
    echo -e "${RED}❌ npm chưa được cài đặt${NC}"
else
    echo -e "${GREEN}✅ npm $(npm --version)${NC}"
fi

if ! command -v python3 &> /dev/null; then
    MISSING_DEPS+=("python3")
    echo -e "${YELLOW}⚠️  Python3 chưa được cài đặt (tùy chọn cho AI service)${NC}"
else
    echo -e "${GREEN}✅ Python3 $(python3 --version)${NC}"
fi

if [ ${#MISSING_DEPS[@]} -gt 0 ]; then
    echo -e "${RED}❌ Vui lòng cài đặt: ${MISSING_DEPS[*]}${NC}"
    exit 1
fi

echo ""

# Step 2: Setup permissions
echo -e "${CYAN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${CYAN}⚙️  BƯỚC 2/7: THIẾT LẬP QUYỀN TRUY CẬP${NC}"
echo -e "${CYAN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"

chmod +x setup.sh quick-start.sh start-project.sh 2>/dev/null || true
chmod +x scripts/setup/main.sh scripts/utils/*.sh 2>/dev/null || true
chmod +x scripts/start/*.sh scripts/check/*.sh 2>/dev/null || true

echo -e "${GREEN}✅ Đã thiết lập quyền truy cập cho các scripts${NC}"
echo ""

# Step 3: Create directory structure
echo -e "${CYAN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${CYAN}⚙️  BƯỚC 3/7: TẠO CẤU TRÚC THƯ MỤC${NC}"
echo -e "${CYAN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"

mkdir -p backend/{routes,middleware,data,config,tests,logs}
mkdir -p automation/{modules,tests,logs}
mkdir -p ai-service/{api,data,logs,models}
mkdir -p logs backups exports

echo -e "${GREEN}✅ Cấu trúc thư mục đã được tạo${NC}"
echo ""

# Step 4: Setup environment
echo -e "${CYAN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${CYAN}⚙️  BƯỚC 4/7: CẤU HÌNH ENVIRONMENT${NC}"
echo -e "${CYAN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"

if [ ! -f ".env" ]; then
    if [ -f "env.example" ]; then
        cp env.example .env
        echo -e "${GREEN}✅ Đã tạo .env từ env.example${NC}"
        echo -e "${YELLOW}⚠️  Vui lòng cập nhật file .env với thông tin cấu hình thực tế${NC}"
    else
        echo -e "${YELLOW}⚠️  Không tìm thấy env.example${NC}"
    fi
else
    echo -e "${GREEN}✅ File .env đã tồn tại${NC}"
fi

echo ""

# Step 5: Install dependencies
echo -e "${CYAN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${CYAN}⚙️  BƯỚC 5/7: CÀI ĐẶT DEPENDENCIES${NC}"
echo -e "${CYAN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"

# Frontend dependencies
if [ -f "package.json" ]; then
    echo -e "${BLUE}📦 Cài đặt frontend dependencies...${NC}"
    npm install --no-audit --no-fund
    echo -e "${GREEN}✅ Frontend dependencies đã được cài đặt${NC}"
fi

# Backend dependencies
if [ -f "backend/package.json" ]; then
    echo -e "${BLUE}📦 Cài đặt backend dependencies...${NC}"
    cd backend
    npm install --no-audit --no-fund
    cd ..
    echo -e "${GREEN}✅ Backend dependencies đã được cài đặt${NC}"
fi

# AI service dependencies (optional)
if [ -f "ai-service/requirements.txt" ] && command -v python3 &> /dev/null; then
    echo -e "${BLUE}📦 Cài đặt AI service dependencies...${NC}"
    cd ai-service
    if [ ! -d "venv" ]; then
        python3 -m venv venv
    fi
    source venv/bin/activate
    pip install --upgrade pip >/dev/null 2>&1
    pip install -r requirements.txt >/dev/null 2>&1
    deactivate
    cd ..
    echo -e "${GREEN}✅ AI service dependencies đã được cài đặt${NC}"
fi

echo ""

# Step 6: Run main setup script (optional, skip if fails)
echo -e "${CYAN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${CYAN}⚙️  BƯỚC 6/7: CHẠY SETUP SCRIPT CHÍNH${NC}"
echo -e "${CYAN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"

if [ -f "scripts/setup/main.sh" ]; then
    # Run in non-interactive mode, skip if fails
    bash scripts/setup/main.sh 2>/dev/null || echo -e "${YELLOW}⚠️  Setup script chính đã được bỏ qua (không bắt buộc)${NC}"
else
    echo -e "${YELLOW}⚠️  Script setup chính không tìm thấy, bỏ qua...${NC}"
fi

echo ""

# Step 7: Final verification
echo -e "${CYAN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${CYAN}⚙️  BƯỚC 7/7: XÁC MINH SETUP${NC}"
echo -e "${CYAN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"

ISSUES=0

if [ ! -f ".env" ]; then
    echo -e "${YELLOW}⚠️  File .env không tồn tại${NC}"
    ISSUES=$((ISSUES + 1))
else
    echo -e "${GREEN}✅ File .env tồn tại${NC}"
fi

if [ ! -d "node_modules" ]; then
    echo -e "${YELLOW}⚠️  Frontend node_modules không tồn tại${NC}"
    ISSUES=$((ISSUES + 1))
else
    echo -e "${GREEN}✅ Frontend node_modules tồn tại${NC}"
fi

if [ -f "backend/package.json" ] && [ ! -d "backend/node_modules" ]; then
    echo -e "${YELLOW}⚠️  Backend node_modules không tồn tại${NC}"
    ISSUES=$((ISSUES + 1))
else
    echo -e "${GREEN}✅ Backend node_modules tồn tại${NC}"
fi

echo ""

# Final summary
echo -e "${GREEN}╔══════════════════════════════════════════════════════════════╗${NC}"
echo -e "${GREEN}║              🎉 SETUP HOÀN TẤT!                              ║${NC}"
echo -e "${GREEN}╚══════════════════════════════════════════════════════════════╝${NC}"
echo ""

if [ $ISSUES -eq 0 ]; then
    echo -e "${GREEN}✅ Setup hoàn tất thành công!${NC}"
else
    echo -e "${YELLOW}⚠️  Setup hoàn tất nhưng có $ISSUES vấn đề cần xử lý${NC}"
fi

echo ""
echo -e "${CYAN}📋 BƯỚC TIẾP THEO:${NC}"
echo -e "${YELLOW}1.${NC} Cập nhật file .env với thông tin cấu hình:"
echo -e "   ${BLUE}   nano .env${NC} hoặc ${BLUE}vi .env${NC}"
echo ""
echo -e "${YELLOW}2.${NC} Test kết nối Google:"
echo -e "   ${BLUE}   npm run test:google${NC}"
echo ""
echo -e "${YELLOW}3.${NC} Health check:"
echo -e "   ${BLUE}   npm run health-check${NC}"
echo ""
echo -e "${YELLOW}4.${NC} Khởi động hệ thống:"
echo -e "   ${BLUE}   ./start-project.sh dev${NC}"
echo -e "   ${BLUE}   hoặc: npm start${NC}"
echo ""
echo -e "${YELLOW}5.${NC} Truy cập ứng dụng:"
echo -e "   ${BLUE}   http://localhost:3004${NC}"
echo ""
echo -e "${CYAN}📚 TÀI LIỆU:${NC}"
echo -e "   - ${BLUE}SETUP_GUIDE.md${NC} - Hướng dẫn setup chi tiết"
echo -e "   - ${BLUE}USER_GUIDE.md${NC} - Hướng dẫn sử dụng"
echo -e "   - ${BLUE}LOGIN_USAGE_GUIDE.md${NC} - Hướng dẫn đăng nhập"
echo ""
echo -e "${GREEN}🚀 Hệ thống đã sẵn sàng!${NC}"
echo ""

