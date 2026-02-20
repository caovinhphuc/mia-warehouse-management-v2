#!/usr/bin/env bash
# =============================================================================
# 🚀 START ALL SERVICES - MIA.vn Google Integration Platform
# =============================================================================
# Chuẩn v2.0 - Khởi động tất cả services (Docker hoặc Manual)
# Usage: ./scripts/start/all.sh [--no-docker]
# =============================================================================

set -e

# Source utilities
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
source "$SCRIPT_DIR/../utils/common.sh"
source "$SCRIPT_DIR/../utils/ports.sh"

# Parse args
USE_DOCKER=true
for arg in "$@"; do
    case "$arg" in
        --no-docker) USE_DOCKER=false ;;
        -h|--help)
            echo "Usage: $0 [--no-docker]"
            echo "  --no-docker  Force manual mode (skip Docker Compose)"
            exit 0
            ;;
    esac
done

# Get project root
PROJECT_ROOT=$(get_project_root)
cd "$PROJECT_ROOT"

print_banner "START ALL SERVICES" "v2.0"

# -----------------------------------------------------------------------------
# 1. Kiểm tra ports
# -----------------------------------------------------------------------------
log_step "BƯỚC 1/4: KIỂM TRA PORTS"
if ! check_all_ports; then
    log_warning "Một số ports đang được sử dụng"
    log_info "Đang giải phóng ports..."
    free_all_ports
    sleep 2
fi
echo ""

# -----------------------------------------------------------------------------
# 2. Kiểm tra environment
# -----------------------------------------------------------------------------
log_step "BƯỚC 2/4: KIỂM TRA ENVIRONMENT"
if [ ! -f ".env" ]; then
    log_error "File .env không tồn tại!"
    log_info "Chạy trước: ./scripts/setup/main.sh"
    exit 1
fi
log_success "Environment file OK"
echo ""

# -----------------------------------------------------------------------------
# 3. Khởi động services
# -----------------------------------------------------------------------------
log_step "BƯỚC 3/4: KHỞI ĐỘNG SERVICES"

if [ "$USE_DOCKER" = true ]; then
    ensure_docker_in_path
    DOCKER_COMPOSE=$(get_docker_compose_cmd)
    if command_exists docker && [ -n "$DOCKER_COMPOSE" ] && [ -f "docker-compose.yml" ]; then
        log_info "Mode: Docker Compose"
        $DOCKER_COMPOSE -f docker-compose.yml up -d --build
        if [ $? -eq 0 ]; then
            log_success "Docker services đã khởi động"
            log_info "Đợi services ready..."
            sleep 10
            $DOCKER_COMPOSE -f docker-compose.yml ps
        else
            log_error "Docker build/start thất bại"
            exit 1
        fi
        # Docker ports: Frontend 3000, Backend 3001, Redis 6379
        DOCKER_BACKEND_PORT=$BACKEND_PORT
    else
        log_warning "Docker không khả dụng → chuyển sang Manual mode"
        USE_DOCKER=false
    fi
fi

if [ "$USE_DOCKER" = false ]; then
    log_info "Mode: Manual (Node.js + Python)"
    mkdir -p logs

    # Backend
    if [ -f "backend/package.json" ]; then
        log_info "Khởi động Backend (port $BACKEND_PORT)..."
        cd backend
        PORT=$BACKEND_PORT npm start > ../logs/backend.log 2>&1 &
        echo $! > ../backend.pid
        cd ..
        log_success "Backend PID: $(cat backend.pid)"
        wait_for_service "http://localhost:$BACKEND_PORT/health" 30
    fi

    # Frontend
    if [ -f "package.json" ] && grep -q "react-scripts" package.json; then
        log_info "Khởi động Frontend (port $FRONTEND_PORT)..."
        PORT=$FRONTEND_PORT npm start > logs/frontend.log 2>&1 &
        echo $! > frontend.pid
        log_success "Frontend PID: $(cat frontend.pid)"
        wait_for_service "http://localhost:$FRONTEND_PORT" 30
    fi

    # Automation (Python)
    if [ -f "automation/main.py" ] && [ -d "automation/venv" ]; then
        log_info "Khởi động Automation..."
        cd automation
        source venv/bin/activate
        python main.py > ../logs/automation.log 2>&1 &
        echo $! > ../automation.pid
        deactivate 2>/dev/null || true
        cd ..
        log_success "Automation PID: $(cat automation.pid)"
    fi
fi
echo ""

# -----------------------------------------------------------------------------
# 4. Hiển thị trạng thái
# -----------------------------------------------------------------------------
log_step "BƯỚC 4/4: TRẠNG THÁI"
show_port_config

log_info "Service URLs:"
if [ "$USE_DOCKER" = true ] && [ -n "${DOCKER_BACKEND_PORT:-}" ]; then
    echo -e "  ${CYAN}Frontend:${NC}   http://localhost:$FRONTEND_PORT"
    echo -e "  ${CYAN}Backend:${NC}    http://localhost:$DOCKER_BACKEND_PORT"
    echo -e "  ${CYAN}Redis:${NC}      localhost:$REDIS_PORT"
else
    echo -e "  ${CYAN}Frontend:${NC}   http://localhost:$FRONTEND_PORT"
    echo -e "  ${CYAN}Backend:${NC}    http://localhost:$BACKEND_PORT"
    echo -e "  ${CYAN}Monitoring:${NC} http://localhost:$MONITORING_PORT"
fi
echo ""

log_success "Services đã khởi động!"
echo -e "${YELLOW}💡${NC} Dừng: ${BLUE}./scripts/stop/all.sh${NC}  |  Health: ${BLUE}./scripts/check/health.sh${NC}"
echo ""
