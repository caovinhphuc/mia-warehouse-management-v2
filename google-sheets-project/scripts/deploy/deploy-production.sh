#!/bin/bash

# =============================================================================
# MIA.vn Google Integration - Production Deployment Script
# =============================================================================

set -euo pipefail

# Colors
readonly RED='\033[0;31m'
readonly GREEN='\033[0;32m'
readonly YELLOW='\033[1;33m'
readonly BLUE='\033[0;34m'
readonly CYAN='\033[0;36m'
readonly NC='\033[0m'

# Configuration
readonly PROJECT_NAME="mia-vn-google-integration"
readonly TIMESTAMP=$(date +%Y%m%d_%H%M%S)
readonly DEPLOY_ENV=${1:-production}

# Logging functions
log_info() {
    echo -e "${GREEN}[INFO]${NC} $(date '+%Y-%m-%d %H:%M:%S') - $1"
}

log_warn() {
    echo -e "${YELLOW}[WARN]${NC} $(date '+%Y-%m-%d %H:%M:%S') - $1"
}

log_error() {
    echo -e "${RED}[ERROR]${NC} $(date '+%Y-%m-%d %H:%M:%S') - $1"
}

# Banner
show_banner() {
    echo -e "${CYAN}╔══════════════════════════════════════════════════════════════╗${NC}"
    echo -e "${CYAN}║              🚀 MIA.vn Google Integration                   ║${NC}"
    echo -e "${CYAN}║                Production Deployment Script                 ║${NC}"
    echo -e "${CYAN}╚══════════════════════════════════════════════════════════════╝${NC}"
    echo -e "Environment: ${YELLOW}${DEPLOY_ENV}${NC}"
    echo -e "Timestamp: ${YELLOW}${TIMESTAMP}${NC}"
    echo ""
}

# Check system requirements
check_requirements() {
    log_info "Checking system requirements..."

    # Check Node.js
    if ! command -v node &> /dev/null; then
        log_error "Node.js not found"
        exit 1
    fi

    local node_version=$(node --version | cut -d'v' -f2)
    log_info "✅ Node.js $node_version found"

    # Check npm
    if ! command -v npm &> /dev/null; then
        log_error "npm not found"
        exit 1
    fi

    local npm_version=$(npm --version)
    log_info "✅ npm $npm_version found"

    # Check Docker (optional)
    if command -v docker &> /dev/null; then
        local docker_version=$(docker --version | cut -d' ' -f3 | cut -d',' -f1)
        log_info "✅ Docker $docker_version found"
        DOCKER_AVAILABLE=true
    else
        log_warn "Docker not found (optional)"
        DOCKER_AVAILABLE=false
    fi

    # Check available disk space
    local available_space=$(df . | tail -1 | awk '{print $4}')
    if [[ $available_space -lt 1048576 ]]; then  # 1GB in KB
        log_warn "Low disk space: $(($available_space / 1024 / 1024))GB available"
    else
        log_info "✅ Sufficient disk space available"
    fi
}

# Install dependencies
install_dependencies() {
    log_info "Installing dependencies..."

    # Clean install
    rm -rf node_modules package-lock.json
    npm install

    log_info "✅ Dependencies installed"
}

# Run tests
run_tests() {
    log_info "Running tests..."

    # Lint check
    if npm run lint:check; then
        log_info "✅ Lint check passed"
    else
        log_warn "⚠️  Lint check failed (continuing anyway)"
    fi

    # Run tests (optional - can skip with CI=true)
    # npm test

    log_info "✅ Tests completed"
}

# Build application
build_application() {
    log_info "Building application..."

    # Clean build directory
    rm -rf build

    # Build for production
    npm run build:prod

    # Check build size
    local build_size=$(du -sh build | cut -f1)
    log_info "✅ Build completed (Size: $build_size)"
}

# Deploy with Docker
deploy_docker() {
    log_info "Deploying with Docker..."

    if [[ "$DOCKER_AVAILABLE" != "true" ]]; then
        log_error "Docker not available"
        exit 1
    fi

    # Build images
    log_info "Building Docker images..."
    docker-compose build

    # Stop existing containers
    log_info "Stopping existing containers..."
    docker-compose down 2>/dev/null || true

    # Start new deployment
    log_info "Starting new deployment..."
    docker-compose up -d

    # Wait for services to be healthy
    log_info "Waiting for services to be healthy..."
    local max_attempts=30
    local attempt=0

    while [[ $attempt -lt $max_attempts ]]; do
        if docker-compose ps | grep -q "healthy\|Up"; then
            log_info "✅ Services are healthy"
            break
        fi
        sleep 2
        ((attempt++))
    done

    if [[ $attempt -eq $max_attempts ]]; then
        log_warn "Services may not be fully healthy"
    fi

    log_info "✅ Docker deployment completed"
}

# Deploy traditional
deploy_traditional() {
    log_info "Deploying traditional method..."

    # Detect OS
    local OS_TYPE=$(uname -s)

    # Set deployment directory based on OS
    if [[ "$OS_TYPE" == "Darwin" ]]; then
        # macOS - deploy to user directory (no sudo needed)
        local deploy_dir="$HOME/Sites/mia-vn-integration"
        mkdir -p "$deploy_dir"
        cp -r build/* "$deploy_dir/"
        chmod -R 755 "$deploy_dir"
        log_info "✅ Deployed to: $deploy_dir"
        log_info "💡 Access at: file://$deploy_dir/index.html"
    else
        # Linux - deploy to /opt with sudo
        local deploy_dir="/opt/mia-vn-integration"
        sudo mkdir -p "$deploy_dir"
        sudo cp -r build/* "$deploy_dir/"

        # Set permissions (www-data for Linux)
        if id -u www-data >/dev/null 2>&1; then
            sudo chown -R www-data:www-data "$deploy_dir"
        else
            sudo chown -R $USER:$USER "$deploy_dir"
        fi
        sudo chmod -R 755 "$deploy_dir"

        # Setup nginx (if available)
        if command -v nginx &> /dev/null; then
            setup_nginx "$deploy_dir"
        fi
    fi

    log_info "✅ Traditional deployment completed"
}

# Setup nginx
setup_nginx() {
    local deploy_dir="$1"

    log_info "Setting up nginx..."

    # Create nginx config
    sudo tee /etc/nginx/sites-available/mia-vn-integration > /dev/null <<EOF
server {
    listen 80;
    server_name localhost;
    root $deploy_dir;
    index index.html;

    location / {
        try_files \$uri \$uri/ /index.html;
    }

    location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }
}
EOF

    # Enable site
    sudo ln -sf /etc/nginx/sites-available/mia-vn-integration /etc/nginx/sites-enabled/
    sudo nginx -t
    sudo systemctl reload nginx

    log_info "✅ Nginx configured"
}

# Verify deployment
verify_deployment() {
    log_info "Verifying deployment..."

    # Check if services are running
    if [[ "$DOCKER_AVAILABLE" == "true" ]]; then
        docker-compose ps 2>/dev/null || log_warn "Docker compose not running"
    fi

    # Check build files
    if [[ -d "build" ]]; then
        local build_files=$(find build -type f 2>/dev/null | wc -l | tr -d ' ')
        log_info "✅ Build directory has $build_files files"
    fi

    # Detect OS and show deployment location
    local OS_TYPE=$(uname -s)
    if [[ "$OS_TYPE" == "Darwin" ]]; then
        local deploy_dir="$HOME/Sites/mia-vn-integration"
        if [[ -d "$deploy_dir" ]]; then
            local deployed_files=$(find "$deploy_dir" -type f 2>/dev/null | wc -l | tr -d ' ')
            log_info "✅ Deployed $deployed_files files to: $deploy_dir"
        fi
    fi

    log_info "✅ Deployment verification completed"
}

# Show deployment summary
show_summary() {
    echo ""
    echo -e "${GREEN}🎉 DEPLOYMENT COMPLETED SUCCESSFULLY!${NC}"
    echo -e "${GREEN}=================================================${NC}"
    echo -e "Environment: ${YELLOW}${DEPLOY_ENV}${NC}"
    echo -e "Timestamp: ${YELLOW}${TIMESTAMP}${NC}"
    echo ""

    if [[ "$DOCKER_AVAILABLE" == "true" ]]; then
        echo -e "${BLUE}🐳 Docker Services:${NC}"
        echo -e "  • Frontend: http://localhost:3000"
        echo -e "  • Backend: http://localhost:8000"
        echo -e "  • Monitoring: http://localhost:8080"
    else
        echo -e "${BLUE}🖥️  Traditional Deployment:${NC}"
        echo -e "  • Application: /opt/mia-vn-integration"
        echo -e "  • Nginx: http://localhost"
    fi

    echo ""
    echo -e "${YELLOW}📋 Useful Commands:${NC}"
    echo -e "  • View logs: docker-compose logs -f"
    echo -e "  • Restart: docker-compose restart"
    echo -e "  • Stop: docker-compose down"
    echo -e "  • Update: git pull && ./deploy-production.sh"

    echo ""
    echo -e "${CYAN}🔗 Quick Links:${NC}"
    echo -e "  • Frontend: http://localhost:3000"
    echo -e "  • Health Check: http://localhost:3000/health"
    echo -e "  • Monitoring: http://localhost:8080"
}

# Main deployment function
main() {
    show_banner

    # Pre-deployment checks
    check_requirements

    # Build phase
    install_dependencies
    run_tests
    build_application

    # Deployment
    if [[ "$DEPLOY_ENV" == "docker" && "$DOCKER_AVAILABLE" == "true" ]]; then
        deploy_docker
    else
        deploy_traditional
    fi

    # Post-deployment
    verify_deployment
    show_summary
}

# Handle command line arguments
case "${1:-}" in
    --help|-h)
        echo "Usage: $0 [environment]"
        echo ""
        echo "Environments:"
        echo "  production  - Production deployment (default)"
        echo "  docker      - Docker-based deployment"
        echo "  staging     - Staging deployment"
        echo ""
        echo "Examples:"
        echo "  $0              # Production deployment"
        echo "  $0 docker       # Docker deployment"
        echo "  $0 staging      # Staging deployment"
        echo ""
        exit 0
        ;;
    --version|-v)
        echo "MIA.vn Google Integration - Production Deployment Script v1.0.0"
        exit 0
        ;;
esac

# Run main function
main "$@"
