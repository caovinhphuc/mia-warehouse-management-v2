#!/bin/bash

# =============================================================================
# 🚀 START ALL SERVICES - MIA.vn Google Integration Platform
# =============================================================================
# Khởi động tất cả services
# =============================================================================

set -e

# Source utilities
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
source "$SCRIPT_DIR/../utils/common.sh"
source "$SCRIPT_DIR/../utils/ports.sh"

# Get project root
PROJECT_ROOT=$(get_project_root)
cd "$PROJECT_ROOT"

# Print banner
print_banner "START ALL SERVICES" "v1.0"

log_step "KIỂM TRA PORTS"

# Check if ports are available
if ! check_all_ports; then
    log_warning "Một số ports đang được sử dụng"
    log_info "Đang giải phóng ports..."
    free_all_ports
    sleep 2
fi

echo ""

# Check .env file
log_step "KIỂM TRA ENVIRONMENT"
if [ ! -f ".env" ]; then
    log_error "File .env không tồn tại!"
    log_info "Vui lòng chạy: ./scripts/setup/main.sh trước"
    exit 1
fi
log_success "Environment file đã tồn tại"
echo ""

# Start Docker services (if docker-compose.yml exists)
if command_exists docker && [ -f "docker-compose.yml" ]; then
    log_step "KHỞI ĐỘNG DOCKER SERVICES"
    log_info "Starting Docker Compose..."
    docker-compose up -d --build
    if [ $? -eq 0 ]; then
        log_success "Docker services đã khởi động"

        # Wait for services
        log_info "Đợi services khởi động..."
        sleep 10

        # Show status
        docker-compose ps
    else
        log_error "Lỗi khi khởi động Docker services"
        exit 1
    fi
    echo ""
else
    log_step "KHỞI ĐỘNG SERVICES (MANUAL MODE)"

    # Start Backend
    if [ -f "backend/package.json" ]; then
        log_info "Khởi động Backend..."
        cd backend
        npm start > ../logs/backend.log 2>&1 &
        BACKEND_PID=$!
        echo $BACKEND_PID > ../backend.pid
        cd ..
        log_success "Backend đã khởi động (PID: $BACKEND_PID)"

        # Wait for backend
        wait_for_service "http://localhost:$BACKEND_PORT/health" 30
    fi

    # Start Frontend (if exists)
    if [ -f "package.json" ] && grep -q "react-scripts" package.json; then
        log_info "Khởi động Frontend..."
        PORT=$FRONTEND_PORT npm start > logs/frontend.log 2>&1 &
        FRONTEND_PID=$!
        echo $FRONTEND_PID > frontend.pid
        log_success "Frontend đã khởi động (PID: $FRONTEND_PID)"

        # Wait for frontend
        wait_for_service "http://localhost:$FRONTEND_PORT" 30
    fi

    # Start Automation (if exists)
    if [ -f "automation/main.py" ] && [ -d "automation/venv" ]; then
        log_info "Khởi động Automation..."
        cd automation
        source venv/bin/activate
        python main.py > ../logs/automation.log 2>&1 &
        AUTOMATION_PID=$!
        echo $AUTOMATION_PID > ../automation.pid
        deactivate
        cd ..
        log_success "Automation đã khởi động (PID: $AUTOMATION_PID)"
    fi

    echo ""
fi

# Show service status
log_step "TRẠNG THÁI SERVICES"
show_port_config

log_info "Service URLs:"
echo -e "  ${CYAN}Frontend:${NC}     http://localhost:$FRONTEND_PORT"
echo -e "  ${CYAN}Backend:${NC}      http://localhost:$BACKEND_PORT"
echo -e "  ${CYAN}Monitoring:${NC}   http://localhost:$MONITORING_PORT"
echo ""

log_success "Tất cả services đã được khởi động!"
echo ""
echo -e "${YELLOW}💡 Tip:${NC} Dừng services với: ${BLUE}./scripts/stop/all.sh${NC}"
echo ""

