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

print_banner "HEALTH CHECK" "v1.1"

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
BACKEND_HEALTHY=false
if check_port $BACKEND_PORT; then
    if curl -sf "http://localhost:$BACKEND_PORT/health" >/dev/null 2>&1; then
        log_success "Backend: ✅ Healthy (http://localhost:$BACKEND_PORT)"
        BACKEND_HEALTHY=true
    else
        log_warning "Backend: ⚠️ Port $BACKEND_PORT được sử dụng nhưng không phản hồi"
    fi
else
    log_warning "Backend: ❌ Not running (Port $BACKEND_PORT)"
fi

# Integrations (Google Sheets, Drive, Telegram, Email) - khi backend healthy
if [ "$BACKEND_HEALTHY" = true ]; then
    log_info "Kiểm tra integrations..."
    HEALTH_JSON=$(curl -sf "http://localhost:$BACKEND_PORT/health" 2>/dev/null || echo "{}")
    if command_exists jq; then
        for svc in googleSheets googleDrive telegram email; do
            status=$(echo "$HEALTH_JSON" | jq -r ".services.${svc}.status // \"unknown\"")
            msg=$(echo "$HEALTH_JSON" | jq -r ".services.${svc}.message // \"\"")
            case "$status" in
                healthy) log_success "  ${svc}: ✅ $msg" ;;
                degraded|unhealthy) log_warning "  ${svc}: ⚠️ $msg" ;;
                warning) log_info "  ${svc}: ⚪ $msg" ;;
                *) log_info "  ${svc}: ⚪ $msg" ;;
            esac
        done
    else
        log_info "  (Cài jq để xem chi tiết: brew install jq)"
    fi
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
ensure_docker_in_path
DOCKER_COMPOSE=$(get_docker_compose_cmd)
if command_exists docker && [ -n "$DOCKER_COMPOSE" ] && [ -f "docker-compose.yml" ]; then
    log_info "Kiểm tra Docker services..."
    if $DOCKER_COMPOSE -f docker-compose.yml ps | grep -q "Up"; then
        log_success "Docker services: ✅ Running"
        $DOCKER_COMPOSE -f docker-compose.yml ps
    else
        log_warning "Docker services: ⚠️ Not running"
    fi
fi

echo ""
log_success "Health check hoàn tất!"
echo ""

