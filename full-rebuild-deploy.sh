#!/bin/bash

# =============================================================================
# 🔄 FULL REBUILD & DEPLOY SCRIPT - MIA.vn Google Integration Platform
# =============================================================================
# Script toàn diện: Xóa cache → Cài đặt lại → Đảm bảo port chuẩn → Build → Deploy
# =============================================================================

set -e

# Source utilities
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
source "$SCRIPT_DIR/scripts/utils/common.sh"
source "$SCRIPT_DIR/scripts/utils/ports.sh"

# Get project root
PROJECT_ROOT=$(get_project_root)
cd "$PROJECT_ROOT"

# Print banner
print_banner "FULL REBUILD & DEPLOY" "v2.0"

# Parse deployment method
DEPLOY_METHOD=${1:-"docker"}

# Main function
main() {
    # Step 1: Stop all services
    log_step "BƯỚC 1/8: DỪNG TẤT CẢ SERVICES"
    "$SCRIPT_DIR/scripts/stop/all.sh" >/dev/null 2>&1 || true
    log_success "Tất cả services đã được dừng"
    echo ""

    # Step 2: Clean everything
    log_step "BƯỚC 2/8: XÓA TẤT CẢ CACHE"
    "$SCRIPT_DIR/scripts/utils/clean.sh" --all
    log_success "Tất cả cache đã được xóa"
    echo ""

    # Step 3: Ensure standard ports in config
    log_step "BƯỚC 3/8: ĐẢM BẢO PORT CHUẨN TRONG CONFIG"

    # Update docker-compose.yml
    if [ -f "docker-compose.yml" ]; then
        log_info "Cập nhật docker-compose.yml..."
        if [[ "$OSTYPE" == "darwin"* ]]; then
            sed -i '' "s/\"3000:3000\"/\"${FRONTEND_PORT}:3000\"/g" docker-compose.yml 2>/dev/null || true
            sed -i '' "s/\"8000:8000\"/\"${BACKEND_PORT}:8000\"/g" docker-compose.yml 2>/dev/null || true
            sed -i '' "s/\"8080:80\"/\"${MONITORING_PORT}:80\"/g" docker-compose.yml 2>/dev/null || true
        else
            sed -i.bak "s/\"3000:3000\"/\"${FRONTEND_PORT}:3000\"/g" docker-compose.yml 2>/dev/null || true
            sed -i.bak "s/\"8000:8000\"/\"${BACKEND_PORT}:8000\"/g" docker-compose.yml 2>/dev/null || true
            sed -i.bak "s/\"8080:80\"/\"${MONITORING_PORT}:80\"/g" docker-compose.yml 2>/dev/null || true
            rm -f docker-compose.yml.bak 2>/dev/null || true
        fi
        log_success "docker-compose.yml đã được cập nhật"
    fi

    # Update backend server.js
    if [ -f "backend/server.js" ]; then
        log_info "Cập nhật backend/server.js..."
        if [[ "$OSTYPE" == "darwin"* ]]; then
            sed -i '' "s/const PORT = process.env.PORT || 3001;/const PORT = process.env.PORT || ${BACKEND_PORT};/g" backend/server.js 2>/dev/null || true
        else
            sed -i.bak "s/const PORT = process.env.PORT || 3001;/const PORT = process.env.PORT || ${BACKEND_PORT};/g" backend/server.js 2>/dev/null || true
            rm -f backend/server.js.bak 2>/dev/null || true
        fi
        log_success "backend/server.js đã được cập nhật"
    fi

    log_success "Tất cả config đã được điều chỉnh với port chuẩn"
    echo ""

    # Step 4: Setup system
    log_step "BƯỚC 4/8: SETUP HỆ THỐNG"
    "$SCRIPT_DIR/scripts/setup/main.sh" >/dev/null 2>&1 || {
        log_error "Setup thất bại"
        exit 1
    }
    log_success "Setup hoàn tất"
    echo ""

    # Step 5: Build all projects
    log_step "BƯỚC 5/8: BUILD TẤT CẢ PROJECTS"

    # Build frontend
    if [ -f "package.json" ] && grep -q "react-scripts" package.json; then
        log_info "Building frontend..."
        npm run build:prod
        BUILD_SIZE=$(du -sh build | cut -f1)
        log_success "Frontend build thành công (Size: $BUILD_SIZE)"
    fi

    # Build backend (if has build script)
    if [ -f "backend/package.json" ] && grep -q "\"build\"" backend/package.json; then
        log_info "Building backend..."
        cd backend
        npm run build 2>/dev/null || log_warning "Backend build có vấn đề"
        cd ..
    fi

    log_success "Build process đã hoàn tất"
    echo ""

    # Step 6: Verify ports
    log_step "BƯỚC 6/8: XÁC MINH PORT CONFIGURATION"
    show_port_config
    if ! check_all_ports; then
        log_warning "Một số ports đang được sử dụng"
    fi
    echo ""

    # Step 7: Deploy
    log_step "BƯỚC 7/8: DEPLOY"
    "$SCRIPT_DIR/scripts/deploy/main.sh" "$DEPLOY_METHOD" >/dev/null 2>&1 || {
        log_error "Deploy thất bại"
        exit 1
    }
    log_success "Deploy hoàn tất"
    echo ""

    # Step 8: Final config adjustments
    log_step "BƯỚC 8/8: ĐIỀU CHỈNH CONFIG CUỐI CÙNG"

    # Create .env from template if not exists
    if [ ! -f ".env" ]; then
        if [ -f "env.example" ]; then
            cp env.example .env
            log_warning "Đã tạo .env từ env.example - VUI LÒNG CẬP NHẬT CÁC GIÁ TRỊ!"
        fi
    fi

    show_port_config
    log_success "Config đã được điều chỉnh hoàn tất"
    echo ""

    # Completion message
    show_completion
}

show_completion() {
    echo ""
    echo -e "${GREEN}╔══════════════════════════════════════════════════════════════╗${NC}"
    echo -e "${GREEN}║                                                              ║${NC}"
    echo -e "${GREEN}║          🎉 REBUILD & DEPLOY HOÀN TẤT THÀNH CÔNG!           ║${NC}"
    echo -e "${GREEN}║                                                              ║${NC}"
    echo -e "${GREEN}╚══════════════════════════════════════════════════════════════╝${NC}"
    echo ""
    echo -e "${CYAN}📋 NEXT STEPS:${NC}"
    echo ""
    echo -e "${YELLOW}1.${NC} Kiểm tra services:"
    echo -e "   ${BLUE}./scripts/check/health.sh${NC}     # Health check"
    echo -e "   ${BLUE}./check-ports.sh${NC}              # Check ports"
    echo ""
    echo -e "${YELLOW}2.${NC} Truy cập ứng dụng:"
    show_port_config
    echo ""
    echo -e "${YELLOW}3.${NC} Xem logs:"
    echo -e "   ${BLUE}docker-compose logs -f${NC}       # Docker logs"
    echo ""
    echo -e "${GREEN}💡 Tip: Đảm bảo file .env đã được cấu hình đúng!${NC}"
    echo ""
}

# Run main function
main "$@"
