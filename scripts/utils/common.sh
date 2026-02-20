#!/bin/bash

# =============================================================================
# 🔧 COMMON UTILITIES - Shared functions for all scripts
# =============================================================================
# Colors, logging, and utility functions used across all scripts
# =============================================================================

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
PURPLE='\033[0;35m'
MAGENTA='\033[0;35m'
NC='\033[0m' # No Color

# Emojis
ROCKET="🚀"
CHECK="✅"
WARNING="⚠️"
ERROR="❌"
INFO="ℹ️"
GEAR="⚙️"
CLOUD="☁️"
PACKAGE="📦"
FOLDER="📁"
TOOLS="🔧"
FIRE="🔥"

# Logging functions
log_info() {
    echo -e "${BLUE}${INFO} [$(date +'%H:%M:%S')] $1${NC}"
}

log_success() {
    echo -e "${GREEN}${CHECK} [$(date +'%H:%M:%S')] $1${NC}"
}

log_warning() {
    echo -e "${YELLOW}${WARNING} [$(date +'%H:%M:%S')] $1${NC}"
}

log_error() {
    echo -e "${RED}${ERROR} [$(date +'%H:%M:%S')] $1${NC}"
}

log_step() {
    echo -e "${PURPLE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
    echo -e "${CYAN}${TOOLS} $1${NC}"
    echo -e "${PURPLE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
}

# Print banner
print_banner() {
    local title=$1
    local version=${2:-"v1.0"}
    # Only clear if running in interactive terminal
    if [ -t 1 ]; then
        clear 2>/dev/null || true
    fi
    echo -e "${CYAN}"
    echo "╔══════════════════════════════════════════════════════════════╗"
    echo "║                                                              ║"
    printf "║              %-52s ║\n" "${PURPLE}$title${CYAN}"
    printf "║              %-52s ║\n" "Version $version"
    echo "║              MIA.vn Google Integration Platform              ║"
    echo "║                                                              ║"
    echo "╚══════════════════════════════════════════════════════════════╝"
    echo -e "${NC}"
}

# Check if command exists
command_exists() {
    if command -v "$1" >/dev/null 2>&1; then
        return 0
    fi
    # macOS: Docker Desktop CLI often lives inside the app bundle, not in PATH
    if [[ "$1" == "docker" ]] && [[ "$OSTYPE" == "darwin"* ]]; then
        local docker_path="/Applications/Docker.app/Contents/Resources/bin/docker"
        if [ -x "$docker_path" ]; then
            return 0
        fi
    fi
    if [[ "$1" == "docker-compose" ]] && [[ "$OSTYPE" == "darwin"* ]]; then
        local dc_path="/Applications/Docker.app/Contents/Resources/bin/docker-compose"
        [ -x "$dc_path" ] && return 0
        command -v "docker" >/dev/null 2>&1 && docker compose version >/dev/null 2>&1 && return 0
    fi
    return 1
}

# Get path to docker (handles macOS Docker Desktop location)
get_docker_cmd() {
    if command -v docker >/dev/null 2>&1; then
        echo "docker"
        return
    fi
    if [[ "$OSTYPE" == "darwin"* ]] && [ -x "/Applications/Docker.app/Contents/Resources/bin/docker" ]; then
        echo "/Applications/Docker.app/Contents/Resources/bin/docker"
        return
    fi
    echo ""
}

# Check if port is in use
check_port() {
    local port=$1
    if lsof -Pi :$port -sTCP:LISTEN -t >/dev/null 2>&1; then
        return 0  # Port is in use
    else
        return 1  # Port is free
    fi
}

# Kill process on port
kill_port() {
    local port=$1
    if check_port $port; then
        log_warning "Port $port đang được sử dụng, đang dừng process..."
        local pids=$(lsof -ti:$port 2>/dev/null)
        if [ ! -z "$pids" ]; then
            echo "$pids" | xargs kill -9 2>/dev/null || true
            sleep 2
            log_success "Đã dừng process trên port $port"
        fi
    else
        log_info "Port $port đang trống ✓"
    fi
}

# Get project root directory
get_project_root() {
    local script_dir="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
    echo "$(cd "$script_dir/../.." && pwd)"
}

# Verify environment
verify_environment() {
    local missing_deps=()

    if ! command_exists node; then
        missing_deps+=("node")
    fi

    if ! command_exists npm; then
        missing_deps+=("npm")
    fi

    if ! command_exists python3; then
        missing_deps+=("python3")
    fi

    if [ ${#missing_deps[@]} -ne 0 ]; then
        log_error "Thiếu dependencies: ${missing_deps[*]}"
        return 1
    fi

    return 0
}

# Wait for service to be ready
wait_for_service() {
    local url=$1
    local max_attempts=${2:-30}
    local attempt=0

    log_info "Đợi service khởi động tại $url..."

    while [ $attempt -lt $max_attempts ]; do
        if curl -sf "$url" >/dev/null 2>&1; then
            log_success "Service đã sẵn sàng tại $url"
            return 0
        fi
        attempt=$((attempt + 1))
        sleep 2
    done

    log_error "Service không khởi động được sau $max_attempts attempts"
    return 1
}

# Check if running as root
check_root() {
    if [ "$EUID" -eq 0 ]; then
        log_error "Không chạy script này với quyền root!"
        exit 1
    fi
}

# Ensure docker is in PATH (macOS Docker Desktop)
ensure_docker_in_path() {
    if [[ "$OSTYPE" == "darwin"* ]] && [ -d "/Applications/Docker.app/Contents/Resources/bin" ]; then
        export PATH="/Applications/Docker.app/Contents/Resources/bin:$PATH"
    fi
}

# Compose file to use (avoid conflict when both compose.yaml and docker-compose.yml exist)
DOCKER_COMPOSE_FILE="docker-compose.yml"

# Get docker-compose command (docker-compose or docker compose)
get_docker_compose_cmd() {
    ensure_docker_in_path
    if command -v docker-compose >/dev/null 2>&1; then
        echo "docker-compose"
    elif docker compose version >/dev/null 2>&1; then
        echo "docker compose"
    else
        echo ""
    fi
}

# Export functions for use in other scripts
export -f log_info log_success log_warning log_error log_step print_banner
export -f command_exists check_port kill_port get_project_root verify_environment wait_for_service check_root
export -f get_docker_cmd ensure_docker_in_path get_docker_compose_cmd

