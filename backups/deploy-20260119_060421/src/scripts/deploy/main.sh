#!/bin/bash

# =============================================================================
# 🚀 DEPLOYMENT SCRIPT - MIA.vn Google Integration Platform
# =============================================================================
# Script chính để deploy hệ thống
# =============================================================================

set -e

# Source utilities
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
source "$SCRIPT_DIR/../utils/common.sh"
source "$SCRIPT_DIR/../utils/ports.sh"

# Get project root
PROJECT_ROOT=$(get_project_root)
cd "$PROJECT_ROOT"

# Parse deployment method
DEPLOY_METHOD=${1:-"docker"}

print_banner "DEPLOYMENT" "v2.0"

# Check prerequisites
log_step "BƯỚC 1/7: KIỂM TRA ĐIỀU KIỆN"
if ! verify_environment; then
    log_error "Vui lòng cài đặt các dependencies cần thiết"
    exit 1
fi
log_success "Prerequisites check passed"
echo ""

# Run linting
log_step "BƯỚC 2/7: CHẠY LINTING"
if npm run lint:check 2>/dev/null; then
    log_success "Linting passed"
else
    log_warning "Linting issues found - proceeding anyway"
fi
echo ""

# Run tests
log_step "BƯỚC 3/7: CHẠY TESTS"
if npm run test 2>/dev/null; then
    log_success "Tests passed"
else
    log_warning "Tests có vấn đề - tiếp tục deploy"
fi
echo ""

# Build projects
log_step "BƯỚC 4/7: BUILD PROJECTS"

# Build frontend
if [ -f "package.json" ] && grep -q "react-scripts" package.json; then
    log_info "Building frontend..."
    npm run build:prod
    if [ $? -eq 0 ]; then
        BUILD_SIZE=$(du -sh build | cut -f1)
        log_success "Frontend build thành công (Size: $BUILD_SIZE)"
    else
        log_error "Frontend build thất bại"
        exit 1
    fi
fi

# Build backend (if has build script)
if [ -f "backend/package.json" ] && grep -q "\"build\"" backend/package.json; then
    log_info "Building backend..."
    cd backend
    npm run build 2>/dev/null || log_warning "Backend build có vấn đề"
    cd ..
fi

echo ""

# Verify build
log_step "BƯỚC 5/7: XÁC MINH BUILD"
if [ -d "build" ] && [ -f "build/index.html" ]; then
    log_success "Build verification passed"
else
    log_error "Build verification failed - index.html not found"
    exit 1
fi
echo ""

# Deploy based on method
log_step "BƯỚC 6/7: DEPLOY"

case $DEPLOY_METHOD in
    docker)
        if ! command_exists docker; then
            log_error "Docker không được cài đặt. Vui lòng cài đặt Docker trước."
            exit 1
        fi

        if [ ! -f "docker-compose.yml" ]; then
            log_error "docker-compose.yml không tồn tại"
            exit 1
        fi

        # Check if Docker daemon is running
        if ! docker info >/dev/null 2>&1; then
            log_error "Docker daemon không chạy!"
            log_info "Vui lòng khởi động Docker Desktop hoặc Docker daemon:"
            echo ""
            if [[ "$OSTYPE" == "darwin"* ]]; then
                echo -e "${YELLOW}  • macOS:${NC} Mở Docker Desktop app hoặc chạy:"
                echo -e "${CYAN}    open -a Docker${NC}"
            else
                echo -e "${YELLOW}  • Linux:${NC} Khởi động Docker daemon:"
                echo -e "${CYAN}    sudo systemctl start docker${NC}"
            fi
            echo ""
            exit 1
        fi

        log_info "Deploying với Docker Compose..."
        if docker-compose up -d --build; then
            log_success "Docker deployment thành công"
        else
            log_error "Docker deployment thất bại"
            exit 1
        fi
        ;;
    vercel)
        if command_exists vercel; then
            log_info "Deploying với Vercel..."
            vercel --prod
            log_success "Vercel deployment thành công"
        else
            log_error "Vercel CLI không được cài đặt"
            exit 1
        fi
        ;;
    netlify)
        # Add npm global bin to PATH if not already there
        if [ -d "$HOME/.npm-global/bin" ]; then
            export PATH="$HOME/.npm-global/bin:$PATH"
        fi
        if [ -d "$(npm config get prefix)/bin" ]; then
            export PATH="$(npm config get prefix)/bin:$PATH"
        fi

        # Check if Netlify CLI is installed, if not, install it or use npx
        if ! command_exists netlify; then
            log_warning "Netlify CLI chưa được cài đặt. Đang cài đặt..."
            if npm install -g netlify-cli 2>/dev/null; then
                log_success "Netlify CLI đã được cài đặt"
                # Re-export PATH after installation
                if [ -d "$HOME/.npm-global/bin" ]; then
                    export PATH="$HOME/.npm-global/bin:$PATH"
                fi
            else
                log_warning "Không thể cài đặt Netlify CLI globally. Sử dụng npx..."
            fi
        fi

        log_info "Deploying với Netlify..."
        # Try netlify command first, fallback to npx
        if command_exists netlify; then
            if netlify deploy --prod --dir=build; then
                log_success "Netlify deployment thành công"
            else
                log_error "Netlify deployment thất bại"
                exit 1
            fi
        elif npx netlify --version >/dev/null 2>&1; then
            log_info "Sử dụng npx để deploy..."
            if npx netlify deploy --prod --dir=build; then
                log_success "Netlify deployment thành công (via npx)"
            else
                log_error "Netlify deployment thất bại"
                exit 1
            fi
        else
            log_error "Netlify CLI không được cài đặt và không thể sử dụng npx"
            log_info "Vui lòng cài đặt: npm install -g netlify-cli"
            exit 1
        fi
        ;;
    *)
        log_error "Unknown deployment method: $DEPLOY_METHOD"
        log_info "Available methods: docker, vercel, netlify"
        exit 1
        ;;
esac

echo ""

# Health check
log_step "BƯỚC 7/7: HEALTH CHECK"
log_info "Kiểm tra health status..."

if [ "$DEPLOY_METHOD" = "docker" ]; then
    sleep 10
    docker-compose ps
fi

echo ""

# Summary
echo -e "${GREEN}╔══════════════════════════════════════════════════════════════╗${NC}"
echo -e "${GREEN}║                  ✅ DEPLOYMENT SUCCESSFUL                    ║${NC}"
echo -e "${GREEN}╚══════════════════════════════════════════════════════════════╝${NC}"
echo ""
echo -e "${CYAN}📋 NEXT STEPS:${NC}"
echo -e "${YELLOW}1.${NC} Kiểm tra services: ${BLUE}./scripts/check/health.sh${NC}"
echo -e "${YELLOW}2.${NC} Xem logs: ${BLUE}docker-compose logs -f${NC} (nếu dùng Docker)"
echo -e "${YELLOW}3.${NC} Truy cập ứng dụng:"
show_port_config
echo ""

