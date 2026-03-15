#!/bin/bash

# =============================================================================
# 🔌 PORT CONFIGURATION - Standard ports for all services
# =============================================================================

# Source common utilities
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
source "$SCRIPT_DIR/common.sh"

# Standard Port Configuration (CHUẨN)
export FRONTEND_PORT=3000
export BACKEND_PORT=8000
export MONITORING_PORT=8080
export REDIS_PORT=6379
export DEV_BACKEND_PORT=3001
export DEV_FRONTEND_PORT=3004

# Function to display port configuration
show_port_config() {
    log_step "PORT CONFIGURATION"
    echo -e "  ${CYAN}Frontend:${NC}      Port ${FRONTEND_PORT}"
    echo -e "  ${CYAN}Backend:${NC}       Port ${BACKEND_PORT}"
    echo -e "  ${CYAN}Monitoring:${NC}    Port ${MONITORING_PORT}"
    echo -e "  ${CYAN}Redis:${NC}         Port ${REDIS_PORT} (optional)"
    echo -e "  ${CYAN}Dev Backend:${NC}   Port ${DEV_BACKEND_PORT}"
    echo -e "  ${CYAN}Dev Frontend:${NC}  Port ${DEV_FRONTEND_PORT}"
    echo ""
}

# Function to check all ports
check_all_ports() {
    log_step "KIỂM TRA TẤT CẢ PORTS"

    local ports=($FRONTEND_PORT $BACKEND_PORT $MONITORING_PORT $REDIS_PORT $DEV_BACKEND_PORT $DEV_FRONTEND_PORT)
    local in_use=()
    local free=()

    for port in "${ports[@]}"; do
        if check_port $port; then
            in_use+=($port)
            log_warning "Port $port đang được sử dụng"
        else
            free+=($port)
            log_success "Port $port đang trống ✓"
        fi
    done

    echo ""
    if [ ${#in_use[@]} -gt 0 ]; then
        log_warning "Ports đang được sử dụng: ${in_use[*]}"
        return 1
    else
        log_success "Tất cả ports đều trống"
        return 0
    fi
}

# Function to free all ports
free_all_ports() {
    log_step "GIẢI PHÓNG TẤT CẢ PORTS"

    local ports=($FRONTEND_PORT $BACKEND_PORT $MONITORING_PORT $REDIS_PORT $DEV_BACKEND_PORT $DEV_FRONTEND_PORT)

    for port in "${ports[@]}"; do
        kill_port $port
    done

    log_success "Đã kiểm tra và giải phóng tất cả ports"
}

