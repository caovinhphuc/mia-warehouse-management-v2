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

# Check Frontend (dev port 3000 hoặc production port 80 qua reverse proxy)
if check_port $FRONTEND_PORT; then
    if curl -sf "http://localhost:$FRONTEND_PORT" >/dev/null 2>&1; then
        log_success "Frontend: ✅ Healthy (http://localhost:$FRONTEND_PORT)"
    else
        log_warning "Frontend: ⚠️ Port $FRONTEND_PORT được sử dụng nhưng không phản hồi"
    fi
elif curl -sf "http://localhost:80/healthz" >/dev/null 2>&1 || curl -sf "http://localhost:80" >/dev/null 2>&1; then
    log_success "Frontend: ✅ Healthy (production, http://localhost:80)"
else
    log_warning "Frontend: ❌ Not running (Port $FRONTEND_PORT; nếu dùng Docker production thì truy cập http://localhost:80)"
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

# Check Docker services (ưu tiên production compose nếu có)
ensure_docker_in_path
DOCKER_COMPOSE=$(get_docker_compose_cmd)
COMPOSE_FILE="docker-compose.yml"
[ -f "docker-compose.production.yml" ] && COMPOSE_FILE="docker-compose.production.yml"
if command_exists docker && [ -n "$DOCKER_COMPOSE" ] && [ -f "$COMPOSE_FILE" ]; then
    log_info "Kiểm tra Docker services..."
    if $DOCKER_COMPOSE -f "$COMPOSE_FILE" ps 2>/dev/null | grep -q "Up"; then
        log_success "Docker services: ✅ Running"
        echo ""
        # Bảng dễ nhìn: Service | Status | Ports
        printf "${CYAN}%-24s %-28s %s${NC}\n" "SERVICE" "STATUS" "PORTS"
        printf "${PURPLE}────────────────────────────────────────────────────────────────────────────${NC}\n"
        docker ps --filter "name=mia-" --format "{{.Names}}\t{{.Status}}\t{{.Ports}}" 2>/dev/null | sort | while IFS=$'\t' read -r name status ports; do
            # Rút gọn status: (healthy) -> ✅ | (health: starting) -> ⏳ | Up -> ✅
            short_status="$status"
            [[ "$status" == *"healthy"* ]] && short_status="✅ healthy"
            [[ "$status" == *"starting"* ]] && short_status="⏳ starting"
            [[ "$status" == *"Up"* && "$short_status" == "$status" ]] && short_status="✅ up"
            # Ports: chỉ giữ phần host (vd 0.0.0.0:80->80)
            short_ports="${ports%% *}"
            printf "  %-22s %-26s %s\n" "$name" "$short_status" "$short_ports"
        done
        echo ""
    else
        log_warning "Docker services: ⚠️ Not running"
    fi
fi

echo ""
log_success "Health check hoàn tất!"
echo ""

