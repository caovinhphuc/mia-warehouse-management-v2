#!/bin/bash

# =============================================================================
# ⚙️ SETUP SCRIPT - MIA.vn Google Integration Platform
# =============================================================================
# Script chính để setup toàn bộ hệ thống
# =============================================================================

set -e

# Source utilities
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
UTILS_DIR="$SCRIPT_DIR/../utils"

# Check if utils exist
if [ ! -f "$UTILS_DIR/common.sh" ]; then
    echo "❌ Lỗi: Không tìm thấy file common.sh tại $UTILS_DIR/common.sh"
    exit 1
fi

if [ ! -f "$UTILS_DIR/ports.sh" ]; then
    echo "❌ Lỗi: Không tìm thấy file ports.sh tại $UTILS_DIR/ports.sh"
    exit 1
fi

source "$UTILS_DIR/common.sh"
source "$UTILS_DIR/ports.sh"

# Get project root - go up 2 levels from scripts/setup
PROJECT_ROOT="$(cd "$SCRIPT_DIR/../.." && pwd)"
cd "$PROJECT_ROOT" || {
    echo "❌ Lỗi: Không thể chuyển đến thư mục project root: $PROJECT_ROOT"
    exit 1
}

# Print banner
print_banner "SETUP SYSTEM" "v2.0"

# Check prerequisites
log_step "BƯỚC 1/6: KIỂM TRA ĐIỀU KIỆN HỆ THỐNG"
if ! verify_environment; then
    log_error "Vui lòng cài đặt các dependencies cần thiết"
    exit 1
fi
log_success "Tất cả điều kiện hệ thống đã được đáp ứng"
echo ""

# Check ports
log_step "BƯỚC 2/6: KIỂM TRA PORTS"
show_port_config
if ! check_all_ports; then
    log_warning "Một số ports đang được sử dụng. Có muốn giải phóng không? (y/N)"
    read -p "> " answer
    if [[ "$answer" =~ ^[Yy]$ ]]; then
        free_all_ports
    fi
fi
echo ""

# Create directory structure
log_step "BƯỚC 3/6: TẠO CẤU TRÚC THƯ MỤC"
log_info "Tạo các thư mục cần thiết..."
mkdir -p backend/{routes,middleware,data,config,tests,logs}
mkdir -p automation/{modules,tests,logs}
mkdir -p ai-service/{api,data,logs,models}
mkdir -p logs backups exports
log_success "Cấu trúc thư mục đã được tạo"
echo ""

# Install dependencies
log_step "BƯỚC 4/6: CÀI ĐẶT DEPENDENCIES"

# Root dependencies
if [ -f "package.json" ]; then
    log_info "Cài đặt root dependencies..."
    npm install --no-audit --no-fund
    log_success "Root dependencies đã được cài đặt"
fi

# Backend dependencies
if [ -f "backend/package.json" ]; then
    log_info "Cài đặt backend dependencies..."
    cd backend
    npm install --no-audit --no-fund
    cd ..
    log_success "Backend dependencies đã được cài đặt"
fi

# Python automation dependencies
if [ -f "automation/requirements.txt" ]; then
    log_info "Cài đặt Python automation dependencies..."
    cd automation
    if [ ! -d "venv" ]; then
        python3 -m venv venv
    fi
    source venv/bin/activate
    pip install --upgrade pip >/dev/null 2>&1
    pip install -r requirements.txt >/dev/null 2>&1
    deactivate
    cd ..
    log_success "Automation dependencies đã được cài đặt"
fi

# AI service dependencies
if [ -f "ai-service/requirements.txt" ]; then
    log_info "Cài đặt AI service dependencies..."
    cd ai-service
    if [ ! -d "venv" ]; then
        python3 -m venv venv
    fi
    source venv/bin/activate
    pip install --upgrade pip >/dev/null 2>&1
    pip install -r requirements.txt >/dev/null 2>&1
    deactivate
    cd ..
    log_success "AI service dependencies đã được cài đặt"
fi

echo ""

# Setup environment
log_step "BƯỚC 5/6: CẤU HÌNH ENVIRONMENT"
if [ ! -f ".env" ]; then
    if [ -f "env.example" ]; then
        cp env.example .env
        log_success "Đã tạo .env từ env.example"
        log_warning "⚠️  Vui lòng cập nhật file .env với thông tin cấu hình thực tế"
    else
        log_warning "Không tìm thấy env.example để tạo .env"
    fi
else
    log_info "File .env đã tồn tại"
fi
echo ""

# Final verification
log_step "BƯỚC 6/6: XÁC MINH SETUP"
log_info "Kiểm tra lại setup..."

# Check if critical files exist
issues=0

if [ ! -f ".env" ]; then
    log_warning ".env file không tồn tại"
    issues=$((issues + 1))
fi

if [ ! -d "backend/node_modules" ]; then
    log_warning "Backend node_modules không tồn tại"
    issues=$((issues + 1))
fi

if [ $issues -eq 0 ]; then
    log_success "Setup hoàn tất thành công!"
else
    log_warning "Setup hoàn tất nhưng có $issues vấn đề cần xử lý"
fi

echo ""
echo -e "${GREEN}╔══════════════════════════════════════════════════════════════╗${NC}"
echo -e "${GREEN}║              🎉 SETUP HOÀN TẤT THÀNH CÔNG!                   ║${NC}"
echo -e "${GREEN}╚══════════════════════════════════════════════════════════════╝${NC}"
echo ""

# Ask if user wants to start frontend
if [ -f "package.json" ] && [ -d "node_modules" ]; then
    echo -e "${CYAN}🚀 BẠN CÓ MUỐN KHỞI ĐỘNG FRONTEND NGAY BÂY GIỜ?${NC}"
    echo -e "${YELLOW}   (Frontend sẽ chạy trên http://localhost:3000)${NC}"
    read -p "   Khởi động frontend? (Y/n): " start_frontend

    if [[ "$start_frontend" =~ ^[Yy]$ ]] || [ -z "$start_frontend" ]; then
        log_info "Đang khởi động frontend..."
        if check_port $FRONTEND_PORT; then
            log_warning "Port $FRONTEND_PORT đang được sử dụng. Dừng process hiện tại..."
            kill_port $FRONTEND_PORT 2>/dev/null || true
            sleep 2
        fi

        # Start frontend in background
        log_info "Khởi động React development server..."
        npm run start:frontend > /tmp/frontend-start.log 2>&1 &
        FRONTEND_PID=$!

        # Wait a bit for server to start
        sleep 5

        # Check if frontend is running
        if check_port $FRONTEND_PORT; then
            log_success "Frontend đã khởi động thành công!"
            log_info "   URL: ${BLUE}http://localhost:$FRONTEND_PORT${NC}"
            log_info "   PID: $FRONTEND_PID"
            log_info "   Logs: ${BLUE}/tmp/frontend-start.log${NC}"
        else
            log_warning "Frontend đang khởi động, vui lòng đợi thêm vài giây..."
            log_info "   Kiểm tra logs: ${BLUE}tail -f /tmp/frontend-start.log${NC}"
        fi
    else
        log_info "Bạn có thể khởi động frontend sau bằng lệnh: ${BLUE}npm run start:frontend${NC}"
    fi
    echo ""
fi

echo -e "${CYAN}📋 NEXT STEPS:${NC}"
echo -e "${YELLOW}1.${NC} Cập nhật file .env với thông tin cấu hình thực tế"
echo -e "   ${BLUE}   nano .env${NC} hoặc ${BLUE}vi .env${NC}"
echo -e "${YELLOW}2.${NC} Chạy health check: ${BLUE}npm run health-check${NC}"
echo -e "${YELLOW}3.${NC} Khởi động backend: ${BLUE}npm run start:backend${NC}"
echo -e "${YELLOW}4.${NC} Khởi động toàn bộ hệ thống: ${BLUE}./start-project.sh dev${NC}"
echo -e "${YELLOW}5.${NC} Truy cập frontend: ${BLUE}http://localhost:3000${NC}"
echo ""
echo -e "${CYAN}📚 TÀI LIỆU:${NC}"
echo -e "   - ${BLUE}SETUP_GUIDE.md${NC} - Hướng dẫn setup chi tiết"
echo -e "   - ${BLUE}USER_GUIDE.md${NC} - Hướng dẫn sử dụng"
echo -e "   - ${BLUE}README.md${NC} - Tổng quan dự án"
echo ""

