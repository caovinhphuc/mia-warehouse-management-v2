#!/bin/bash

# =============================================================================
# 🛑 STOP ALL SERVICES - MIA.vn Google Integration Platform
# =============================================================================
# Dừng tất cả services và giải phóng ports
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
print_banner "STOP ALL SERVICES" "v1.0"

log_step "DỪNG TẤT CẢ SERVICES"

# Stop Docker containers
if command_exists docker && [ -f "docker-compose.yml" ]; then
    log_info "Dừng Docker containers..."
    docker-compose down 2>/dev/null || true
    log_success "Docker containers đã dừng"
fi

# Stop Node.js processes
log_info "Dừng Node.js processes..."
pkill -f "node.*server.js" 2>/dev/null || true
pkill -f "npm.*start" 2>/dev/null || true
pkill -f "react-scripts.*start" 2>/dev/null || true
log_success "Node.js processes đã dừng"

# Stop Python processes
log_info "Dừng Python processes..."
pkill -f "python.*main.py" 2>/dev/null || true
pkill -f "python.*automation" 2>/dev/null || true
pkill -f "uvicorn" 2>/dev/null || true
log_success "Python processes đã dừng"

# Stop by PID files
log_info "Dừng services theo PID files..."
if [ -f "automation.pid" ]; then
    if kill -0 $(cat automation.pid) 2>/dev/null; then
        kill $(cat automation.pid) 2>/dev/null || true
        log_success "Đã dừng automation service"
    fi
    rm -f automation.pid
fi

if [ -f "backend.pid" ]; then
    if kill -0 $(cat backend.pid) 2>/dev/null; then
        kill $(cat backend.pid) 2>/dev/null || true
        log_success "Đã dừng backend service"
    fi
    rm -f backend.pid
fi

if [ -f "frontend.pid" ]; then
    if kill -0 $(cat frontend.pid) 2>/dev/null; then
        kill $(cat frontend.pid) 2>/dev/null || true
        log_success "Đã dừng frontend service"
    fi
    rm -f frontend.pid
fi

# Free all ports
log_step "GIẢI PHÓNG TẤT CẢ PORTS"
free_all_ports

echo ""
log_success "Tất cả services đã được dừng hoàn toàn!"
echo ""

