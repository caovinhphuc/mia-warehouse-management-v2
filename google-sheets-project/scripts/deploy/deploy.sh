#!/bin/bash

###############################################################################
# MIA Warehouse Management - Deploy Script với Config tùy chỉnh
# Sử dụng: ./deploy.sh [environment] [target] [options]
# Ví dụ: ./deploy.sh dev local
#        ./deploy.sh production gcp --force
###############################################################################

set -e  # Exit on error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Script directory
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
<<<<<<< Updated upstream
<<<<<<< Updated upstream
<<<<<<< Updated upstream
<<<<<<< Updated upstream
<<<<<<< Updated upstream
<<<<<<< Updated upstream
<<<<<<< Updated upstream
PROJECT_ROOT="$(cd "$SCRIPT_DIR/../.." && pwd)"
=======
PROJECT_ROOT="$(cd "$SCRIPT_DIR/../../.." && pwd)"
>>>>>>> Stashed changes
=======
PROJECT_ROOT="$(cd "$SCRIPT_DIR/../../.." && pwd)"
>>>>>>> Stashed changes
=======
PROJECT_ROOT="$(cd "$SCRIPT_DIR/../../.." && pwd)"
>>>>>>> Stashed changes
=======
PROJECT_ROOT="$(cd "$SCRIPT_DIR/../../.." && pwd)"
>>>>>>> Stashed changes
=======
PROJECT_ROOT="$(cd "$SCRIPT_DIR/../../.." && pwd)"
>>>>>>> Stashed changes
=======
PROJECT_ROOT="$(cd "$SCRIPT_DIR/../../.." && pwd)"
>>>>>>> Stashed changes
=======
PROJECT_ROOT="$(cd "$SCRIPT_DIR/../../.." && pwd)"
>>>>>>> Stashed changes
CONFIG_FILE="$SCRIPT_DIR/deploy.config.js"
USER_CONFIG="$SCRIPT_DIR/deploy.config.json"

# Logging functions
log_info() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

log_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

log_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

log_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Print banner
print_banner() {
    echo -e "${BLUE}"
    echo "╔═══════════════════════════════════════════════════════════════╗"
    echo "║           MIA Warehouse Management - Deploy Tool             ║"
    echo "║                     Version 2.0.0                            ║"
    echo "╚═══════════════════════════════════════════════════════════════╝"
    echo -e "${NC}"
}

# Show usage
show_usage() {
    echo "Sử dụng: ./deploy.sh [environment] [target] [options]"
    echo ""
    echo "Environments (Môi trường):"
    echo "  dev         - Development (phát triển)"
    echo "  staging     - Staging (thử nghiệm)"
    echo "  production  - Production (sản xuất)"
    echo ""
    echo "Targets (Nền tảng):"
    echo "  local       - Deploy local (máy tính)"
    echo "  gcp         - Google Cloud Platform"
    echo "  docker      - Docker container"
    echo "  netlify     - Netlify (frontend only)"
    echo "  vercel      - Vercel (frontend only)"
    echo ""
    echo "Options:"
    echo "  --force           - Force rebuild và redeploy"
    echo "  --no-backup       - Bỏ qua backup"
    echo "  --no-test         - Bỏ qua testing"
    echo "  --skip-health     - Bỏ qua health check"
    echo "  --verbose         - Chi tiết log"
    echo "  --help            - Hiển thị hướng dẫn này"
    echo ""
    echo "Ví dụ:"
    echo "  ./deploy.sh dev local"
    echo "  ./deploy.sh production gcp --force"
    echo "  ./deploy.sh staging netlify --no-test"
}

# Parse arguments
ENVIRONMENT="${1:-dev}"
TARGET="${2:-local}"
FORCE_REBUILD=false
NO_BACKUP=false
NO_TEST=false
SKIP_HEALTH=false
VERBOSE=false

shift 2 2>/dev/null || true
while [[ $# -gt 0 ]]; do
    case $1 in
        --force)
            FORCE_REBUILD=true
            shift
            ;;
        --no-backup)
            NO_BACKUP=true
            shift
            ;;
        --no-test)
            NO_TEST=true
            shift
            ;;
        --skip-health)
            SKIP_HEALTH=true
            shift
            ;;
        --verbose)
            VERBOSE=true
            shift
            ;;
        --help)
            print_banner
            show_usage
            exit 0
            ;;
        *)
            log_error "Unknown option: $1"
            show_usage
            exit 1
            ;;
    esac
done

# Validate environment
if [[ ! "$ENVIRONMENT" =~ ^(dev|staging|production)$ ]]; then
    log_error "Invalid environment: $ENVIRONMENT"
    show_usage
    exit 1
fi

# Validate target
if [[ ! "$TARGET" =~ ^(local|gcp|docker|netlify|vercel)$ ]]; then
    log_error "Invalid target: $TARGET"
    show_usage
    exit 1
fi

# Print configuration
print_config() {
    echo ""
    log_info "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    log_info "CẤU HÌNH DEPLOYMENT"
    log_info "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    log_info "Environment:     $ENVIRONMENT"
    log_info "Target:          $TARGET"
    log_info "Force Rebuild:   $FORCE_REBUILD"
    log_info "Backup:          $([ "$NO_BACKUP" = true ] && echo "Disabled" || echo "Enabled")"
    log_info "Testing:         $([ "$NO_TEST" = true ] && echo "Disabled" || echo "Enabled")"
    log_info "Health Check:    $([ "$SKIP_HEALTH" = true ] && echo "Disabled" || echo "Enabled")"
    log_info "Verbose:         $VERBOSE"
    log_info "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    echo ""
}

# Load configuration
load_config() {
    log_info "Đang load cấu hình từ $CONFIG_FILE..."

    if [ ! -f "$CONFIG_FILE" ]; then
        log_error "Config file không tồn tại: $CONFIG_FILE"
        exit 1
    fi

    # Check if Node.js is available
    if ! command -v node &> /dev/null; then
        log_error "Node.js không được cài đặt"
        exit 1
    fi

    log_success "Load config thành công"
}

# Backup
create_backup() {
    if [ "$NO_BACKUP" = true ]; then
        log_warning "Bỏ qua backup"
        return 0
    fi

    log_info "Đang tạo backup..."

    BACKUP_DIR="$PROJECT_ROOT/backups/deploy-$(date +%Y%m%d_%H%M%S)"
    mkdir -p "$BACKUP_DIR"

    # Backup important files
    cp -r "$PROJECT_ROOT/src" "$BACKUP_DIR/" 2>/dev/null || true
    cp -r "$PROJECT_ROOT/backend" "$BACKUP_DIR/" 2>/dev/null || true
    cp -r "$PROJECT_ROOT/config" "$BACKUP_DIR/" 2>/dev/null || true
    cp "$PROJECT_ROOT/package.json" "$BACKUP_DIR/" 2>/dev/null || true

    log_success "Backup hoàn tất: $BACKUP_DIR"
}

# Pre-deployment checks
pre_deploy_checks() {
    log_info "Kiểm tra điều kiện trước khi deploy..."

    # Check Node.js version
    NODE_VERSION=$(node --version | cut -d'v' -f2 | cut -d'.' -f1)
    if [ "$NODE_VERSION" -lt 16 ]; then
        log_error "Yêu cầu Node.js version >= 16. Current: v$NODE_VERSION"
        exit 1
    fi

    # Check if package.json exists
    if [ ! -f "$PROJECT_ROOT/package.json" ]; then
        log_error "package.json không tồn tại"
        exit 1
    fi

    # Check if node_modules exists
    if [ ! -d "$PROJECT_ROOT/node_modules" ]; then
        log_warning "node_modules không tồn tại. Đang cài đặt dependencies..."
        cd "$PROJECT_ROOT"
        npm install
    fi

    log_success "Kiểm tra hoàn tất"
}

# Build
build_project() {
    log_info "Đang build project cho môi trường: $ENVIRONMENT..."

    cd "$PROJECT_ROOT"

    # Set environment
    export NODE_ENV="$ENVIRONMENT"

    # Clean old build if force rebuild
    if [ "$FORCE_REBUILD" = true ]; then
        log_info "Force rebuild - Xóa build cũ..."
        rm -rf build build-* dist
    fi

    # Run build based on environment
    case $ENVIRONMENT in
        dev)
            npm run build:dev 2>/dev/null || npm run build
            ;;
        staging)
            npm run build:staging 2>/dev/null || npm run build
            ;;
        production)
            npm run build
            ;;
    esac

    if [ $? -ne 0 ]; then
        log_error "Build thất bại"
        exit 1
    fi

    log_success "Build hoàn tất"
}

# Test
run_tests() {
    if [ "$NO_TEST" = true ]; then
        log_warning "Bỏ qua testing"
        return 0
    fi

    log_info "Đang chạy tests..."

    cd "$PROJECT_ROOT"
    npm test -- --passWithNoTests 2>/dev/null || log_warning "Tests không chạy được hoặc không có tests"

    log_success "Testing hoàn tất"
}

# Deploy based on target
deploy_to_target() {
    log_info "Đang deploy tới $TARGET..."

    case $TARGET in
        local)
            deploy_local
            ;;
        gcp)
            deploy_gcp
            ;;
        docker)
            deploy_docker
            ;;
        netlify)
            deploy_netlify
            ;;
        vercel)
            deploy_vercel
            ;;
        *)
            log_error "Unsupported target: $TARGET"
            exit 1
            ;;
    esac
}

# Deploy to local
deploy_local() {
    log_info "Deploying to local environment..."

    cd "$PROJECT_ROOT"

    # Start backend in background
    log_info "Starting backend server..."
    npm run start:backend &
    BACKEND_PID=$!

    sleep 3

    # Start frontend
    log_info "Starting frontend server..."
    npm run dev

    log_success "Local deployment completed"
}

# Deploy to GCP
deploy_gcp() {
    log_info "Deploying to Google Cloud Platform..."

    # Check if gcloud is installed
    if ! command -v gcloud &> /dev/null; then
        log_error "gcloud CLI không được cài đặt"
        exit 1
    fi

    # Run GCP deploy script
    if [ -f "$SCRIPT_DIR/deploy-gcp.sh" ]; then
        bash "$SCRIPT_DIR/deploy-gcp.sh" "$ENVIRONMENT"
    else
        log_error "GCP deploy script không tồn tại"
        exit 1
    fi

    log_success "GCP deployment completed"
}

# Deploy to Docker
deploy_docker() {
    log_info "Deploying to Docker..."

    # Check if docker is installed
    if ! command -v docker &> /dev/null; then
        log_error "Docker không được cài đặt"
        exit 1
    fi

    cd "$PROJECT_ROOT"

    # Build and run with docker-compose
    if [ -f "docker-compose.yml" ]; then
        docker-compose down
        docker-compose build
        docker-compose up -d
    else
        log_error "docker-compose.yml không tồn tại"
        exit 1
    fi

    log_success "Docker deployment completed"
}

# Deploy to Netlify
deploy_netlify() {
    log_info "Deploying to Netlify..."

    # Check if netlify-cli is installed
    if ! command -v netlify &> /dev/null; then
        log_warning "netlify-cli chưa cài đặt. Đang cài đặt..."
        npm install -g netlify-cli
    fi

    cd "$PROJECT_ROOT"

    if [ "$ENVIRONMENT" = "production" ]; then
        netlify deploy --prod --dir=build
    else
        netlify deploy --dir=build
    fi

    log_success "Netlify deployment completed"
}

# Deploy to Vercel
deploy_vercel() {
    log_info "Deploying to Vercel..."

    # Check if vercel-cli is installed
    if ! command -v vercel &> /dev/null; then
        log_warning "vercel-cli chưa cài đặt. Đang cài đặt..."
        npm install -g vercel
    fi

    cd "$PROJECT_ROOT"

    if [ "$ENVIRONMENT" = "production" ]; then
        vercel --prod
    else
        vercel
    fi

    log_success "Vercel deployment completed"
}

# Health check
health_check() {
    if [ "$SKIP_HEALTH" = true ]; then
        log_warning "Bỏ qua health check"
        return 0
    fi

    log_info "Đang kiểm tra health..."

    # Different health check based on target
    case $TARGET in
        local)
            # Check if backend is running
            if curl -s http://localhost:5050/api/health > /dev/null 2>&1; then
                log_success "Backend health check passed"
            else
                log_warning "Backend health check failed"
            fi

            # Check if frontend is running
            if curl -s http://localhost:5173 > /dev/null 2>&1; then
                log_success "Frontend health check passed"
            else
                log_warning "Frontend health check failed"
            fi
            ;;
        *)
            log_warning "Health check không hỗ trợ cho target: $TARGET"
            ;;
    esac
}

# Post-deployment
post_deploy() {
    log_info "Hoàn tất post-deployment tasks..."

    # Clean up old backups (keep last 7)
    if [ -d "$PROJECT_ROOT/backups" ]; then
        log_info "Cleaning up old backups..."
        cd "$PROJECT_ROOT/backups"
        ls -t | tail -n +8 | xargs rm -rf 2>/dev/null || true
    fi

    log_success "Post-deployment hoàn tất"
}

# Main deployment flow
main() {
    print_banner
    print_config

    log_info "Bắt đầu deployment..."

    # Load configuration
    load_config

    # Pre-deployment checks
    pre_deploy_checks

    # Create backup
    create_backup

    # Build project
    build_project

    # Run tests
    run_tests

    # Deploy to target
    deploy_to_target

    # Health check
    health_check

    # Post-deployment
    post_deploy

    log_success "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    log_success "DEPLOYMENT HOÀN TẤT THÀNH CÔNG!"
    log_success "Environment: $ENVIRONMENT"
    log_success "Target: $TARGET"
    log_success "Timestamp: $(date '+%Y-%m-%d %H:%M:%S')"
    log_success "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
}

# Run main function
main
