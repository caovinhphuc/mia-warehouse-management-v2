#!/bin/bash

# =============================================================================
# Vercel Deployment Script for MIA.vn Google Integration
# =============================================================================

set -euo pipefail

# Colors
readonly GREEN='\033[0;32m'
readonly YELLOW='\033[1;33m'
readonly BLUE='\033[0;34m'
readonly RED='\033[0;31m'
readonly CYAN='\033[0;36m'
readonly NC='\033[0m'

# Logging functions
log_info() {
    echo -e "${GREEN}[INFO]${NC} $1"
}

log_warn() {
    echo -e "${YELLOW}[WARN]${NC} $1"
}

log_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

log_success() {
    echo -e "${CYAN}[SUCCESS]${NC} $1"
}

# Banner
show_banner() {
    echo -e "${CYAN}╔══════════════════════════════════════════════════════════════╗${NC}"
    echo -e "${CYAN}║              🚀 MIA.vn Google Integration                   ║${NC}"
    echo -e "${CYAN}║                Vercel Deployment Script                     ║${NC}"
    echo -e "${CYAN}╚══════════════════════════════════════════════════════════════╝${NC}"
    echo ""
}

# Check prerequisites
check_prerequisites() {
    log_info "Checking prerequisites..."

    # Check Node.js
    if ! command -v node &> /dev/null; then
        log_error "Node.js not found. Please install Node.js first."
        exit 1
    fi

    local node_version=$(node --version | cut -d'v' -f2)
    log_info "✅ Node.js $node_version found"

    # Check npm
    if ! command -v npm &> /dev/null; then
        log_error "npm not found. Please install npm first."
        exit 1
    fi

    local npm_version=$(npm --version)
    log_info "✅ npm $npm_version found"

    # Check Vercel CLI
    if command -v vercel &> /dev/null; then
        local vercel_version=$(vercel --version)
        log_info "✅ Vercel CLI $vercel_version found"
        VERCEL_CLI_AVAILABLE=true
    else
        log_warn "Vercel CLI not found. Will install it."
        VERCEL_CLI_AVAILABLE=false
    fi

    log_success "Prerequisites check completed"
}

# Install Vercel CLI
install_vercel_cli() {
    if [[ "$VERCEL_CLI_AVAILABLE" == "false" ]]; then
        log_info "Installing Vercel CLI..."
        npm install -g vercel
        log_success "Vercel CLI installed successfully"
    fi
}

# Build application
build_application() {
    log_info "Building application for production..."

    # Clean previous build
    if [[ -d "build" ]]; then
        rm -rf build
        log_info "Cleaned previous build"
    fi

    # Clean node_modules to avoid ENOTEMPTY errors
    if [[ -d "node_modules" ]]; then
        log_info "Cleaning node_modules..."
        rm -rf node_modules
        log_info "Cleaned node_modules"
    fi

    # Install dependencies
    log_info "Installing dependencies..."
    npm ci

    # Build for production
    log_info "Building for production..."
    npm run build:prod

    # Check build size
    local build_size=$(du -sh build | cut -f1)
    log_success "Build completed successfully (Size: $build_size)"
}

# Deploy to Vercel
deploy_to_vercel() {
    log_info "Deploying to Vercel..."

    # Remove .vercel directory if exists to avoid project settings error
    if [[ -d ".vercel" ]]; then
        log_info "Removing existing .vercel directory to reset project link..."
        rm -rf .vercel
    fi

    # Login to Vercel (if not already logged in)
    if ! vercel whoami &> /dev/null; then
        log_info "Logging in to Vercel..."
        vercel login
    fi

    # Link project - Vercel will prompt for project name
    # Use valid name: mia-vn-google-integration (lowercase, no invalid chars)
    if [[ ! -d ".vercel" ]]; then
        log_info "Linking project..."
        log_info "⚠️  IMPORTANT: When prompted for project name, enter: ${CYAN}mia-vn-google-integration${NC}"
        log_info "   (Project names must be lowercase and cannot contain '---')"
        vercel link
    fi

    # Deploy
    log_info "Deploying application..."
    if vercel --prod --yes; then
        log_success "Deployment completed!"
    else
        log_error "Deployment failed. If error is about project name:"
        log_info "1. Run: ${CYAN}rm -rf .vercel${NC}"
        log_info "2. Run: ${CYAN}vercel link${NC}"
        log_info "3. When prompted, enter project name: ${CYAN}mia-vn-google-integration${NC}"
        log_info "4. Run: ${CYAN}vercel --prod${NC}"
        return 1
    fi
}

# Setup environment variables
setup_environment_variables() {
    log_info "Setting up environment variables..."

    echo ""
    echo -e "${YELLOW}📝 Environment Variables Setup${NC}"
    echo ""
    echo "You need to configure the following environment variables in Vercel:"
    echo ""
    echo -e "${BLUE}Required Variables:${NC}"
    echo "  • REACT_APP_GOOGLE_SHEETS_SPREADSHEET_ID"
    echo "  • REACT_APP_GOOGLE_DRIVE_FOLDER_ID"
    echo "  • REACT_APP_API_URL"
    echo ""
    echo -e "${BLUE}Optional Variables:${NC}"
    echo "  • REACT_APP_FEATURE_GOOGLE_SHEETS=true"
    echo "  • REACT_APP_FEATURE_GOOGLE_DRIVE=true"
    echo "  • REACT_APP_FEATURE_AUTOMATION=true"
    echo "  • REACT_APP_LANGUAGE=vi"
    echo "  • REACT_APP_TIMEZONE=Asia/Ho_Chi_Minh"
    echo ""
    echo -e "${YELLOW}To configure:${NC}"
    echo "1. Go to Vercel Dashboard"
    echo "2. Select your project"
    echo "3. Go to Settings → Environment Variables"
    echo "4. Add the variables above"
    echo "5. Redeploy the application"
    echo ""
}

# Show deployment summary
show_deployment_summary() {
    echo ""
    echo -e "${GREEN}🎉 Vercel Deployment Completed Successfully!${NC}"
    echo -e "${GREEN}=================================================${NC}"
    echo ""
    echo -e "${BLUE}📋 Deployment Information:${NC}"
    echo ""

    # Get deployment URL
    local deployment_url=$(vercel ls --json | jq -r '.[0].url' 2>/dev/null || echo "https://your-app.vercel.app")

    echo -e "  • Application URL: ${CYAN}$deployment_url${NC}"
    echo -e "  • Dashboard: ${CYAN}https://vercel.com/dashboard${NC}"
    echo -e "  • GitHub Repository: ${CYAN}https://github.com/caovinhphuc/mia-vn-google-integration${NC}"
    echo ""

    echo -e "${BLUE}🔧 Next Steps:${NC}"
    echo ""
    echo "1. Configure environment variables in Vercel Dashboard"
    echo "2. Setup Google Service Account credentials"
    echo "3. Test all features and integrations"
    echo "4. Setup custom domain (optional)"
    echo "5. Configure monitoring and analytics"
    echo ""

    echo -e "${BLUE}🔗 Quick Links:${NC}"
    echo ""
    echo "  • Vercel Dashboard: https://vercel.com/dashboard"
    echo "  • Project Settings: https://vercel.com/dashboard"
    echo "  • Environment Variables: https://vercel.com/dashboard"
    echo "  • Deployment Logs: https://vercel.com/dashboard"
    echo ""

    echo -e "${YELLOW}📚 Documentation:${NC}"
    echo ""
    echo "  • README.md: Project overview and setup"
    echo "  • docs/guides/: Detailed guides"
    echo "  • DEPLOYMENT_GUIDE.md: Complete deployment guide"
    echo ""
}

# Main function
main() {
    show_banner

    # Check prerequisites
    check_prerequisites

    # Install Vercel CLI if needed
    install_vercel_cli

    # Build application
    build_application

    # Deploy to Vercel
    deploy_to_vercel

    # Setup environment variables
    setup_environment_variables

    # Show deployment summary
    show_deployment_summary
}

# Handle command line arguments
case "${1:-}" in
    --help|-h)
        echo "Usage: $0 [options]"
        echo ""
        echo "Options:"
        echo "  --help, -h     Show this help message"
        echo "  --version, -v  Show version information"
        echo ""
        echo "This script will:"
        echo "  1. Check prerequisites (Node.js, npm, Vercel CLI)"
        echo "  2. Build the application for production"
        echo "  3. Deploy to Vercel"
        echo "  4. Setup environment variables"
        echo "  5. Show deployment summary"
        echo ""
        exit 0
        ;;
    --version|-v)
        echo "MIA.vn Google Integration - Vercel Deployment Script v1.0.0"
        exit 0
        ;;
esac

# Run main function
main "$@"
