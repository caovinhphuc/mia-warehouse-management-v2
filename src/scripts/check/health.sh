#!/bin/bash

# =============================================================================
# 🏥 HEALTH CHECK - MIA.vn Google Integration Platform
# =============================================================================
# Kiểm tra health status của tất cả services
# =============================================================================

set -e

# Source utilities
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
source "$SCRIPT_DIR/../utils/common.sh"
source "$SCRIPT_DIR/../utils/ports.sh"

# Get project root
PROJECT_ROOT=$(get_project_root)
cd "$PROJECT_ROOT"

print_banner "HEALTH CHECK" "v1.0"

log_step "KIỂM TRA HEALTH STATUS"

# Check ports
log_info "Kiểm tra ports..."
show_port_config

# Check services
log_info "Kiểm tra services..."

# Check Frontend
if check_port $FRONTEND_PORT; then
    if curl -sf "http://localhost:$FRONTEND_PORT" >/dev/null 2>&1; then
        log_success "Frontend: ✅ Healthy (http://localhost:$FRONTEND_PORT)"
    else
        log_warning "Frontend: ⚠️ Port $FRONTEND_PORT được sử dụng nhưng không phản hồi"
    fi
else
    log_warning "Frontend: ❌ Not running (Port $FRONTEND_PORT)"
fi

# Check Backend
if check_port $BACKEND_PORT; then
    if curl -sf "http://localhost:$BACKEND_PORT/health" >/dev/null 2>&1; then
        log_success "Backend: ✅ Healthy (http://localhost:$BACKEND_PORT)"
    else
        log_warning "Backend: ⚠️ Port $BACKEND_PORT được sử dụng nhưng không phản hồi"
    fi
else
    log_warning "Backend: ❌ Not running (Port $BACKEND_PORT)"
fi

# Check Monitoring
if check_port $MONITORING_PORT; then
    if curl -sf "http://localhost:$MONITORING_PORT" >/dev/null 2>&1; then
        log_success "Monitoring: ✅ Healthy (http://localhost:$MONITORING_PORT)"
    else
        log_warning "Monitoring: ⚠️ Port $MONITORING_PORT được sử dụng nhưng không phản hồi"
    fi
else
    log_info "Monitoring: ⚪ Not running (Port $MONITORING_PORT)"
fi

# Check Docker services
if command_exists docker && [ -f "docker-compose.yml" ]; then
    log_info "Kiểm tra Docker services..."
    if docker-compose ps | grep -q "Up"; then
        log_success "Docker services: ✅ Running"
        docker-compose ps
    else
        log_warning "Docker services: ⚠️ Not running"
    fi
fi

echo ""
log_success "Health check hoàn tất!"
echo ""

