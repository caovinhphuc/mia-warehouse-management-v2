#!/bin/bash

# =============================================================================
# GitHub Setup Script for MIA.vn Google Integration
# =============================================================================

set -euo pipefail

# Colors
readonly RED='\033[0;31m'
readonly GREEN='\033[0;32m'
readonly YELLOW='\033[1;33m'
readonly BLUE='\033[0;34m'
readonly CYAN='\033[0;36m'
readonly NC='\033[0m'
xsa
# Configuration
readonly REPO_NAME="react-google-integration"
readonly REPO_DESCRIPTION="React Google Integration - Complete platform with Sheets, Drive, Email & Telegram alerts, and analytics dashboard"

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

log_success() {
    echo -e "${CYAN}[SUCCESS]${NC} $(date '+%Y-%m-%d %H:%M:%S') - $1"
}

# Banner
show_banner() {
    echo -e "${CYAN}╔══════════════════════════════════════════════════════════════╗${NC}"
    echo -e "${CYAN}║          🚀 React Google Integration                    ║${NC}"
    echo -e "${CYAN}║                GitHub Setup Script                          ║${NC}"
    echo -e "${CYAN}╚══════════════════════════════════════════════════════════════╝${NC}"
    echo ""
}

# Check prerequisites
check_prerequisites() {
    log_info "Checking prerequisites..."

    # Check Git
    if ! command -v git &> /dev/null; then
        log_error "Git not found. Please install Git first."
        exit 1
    fi

    # Check GitHub CLI
    if command -v gh &> /dev/null; then
        log_info "✅ GitHub CLI found"
        GITHUB_CLI_AVAILABLE=true
    else
        log_warn "GitHub CLI not found. Will use manual setup."
        GITHUB_CLI_AVAILABLE=false
    fi

    # Check if we're in a git repository
    if ! git rev-parse --git-dir > /dev/null 2>&1; then
        log_error "Not in a git repository. Please run 'git init' first."
        exit 1
    fi

    log_success "Prerequisites check completed"
}

# Get user input
get_user_input() {
    echo -e "${BLUE}📝 GitHub Setup Configuration${NC}"
    echo ""

    read -p "GitHub username: " GITHUB_USERNAME
    read -p "Repository name [$REPO_NAME]: " REPO_NAME_INPUT
    REPO_NAME=${REPO_NAME_INPUT:-$REPO_NAME}

    echo ""
    echo -e "${YELLOW}Repository will be created as:${NC}"
    echo -e "  • Username: ${GREEN}$GITHUB_USERNAME${NC}"
    echo -e "  • Repository: ${GREEN}$REPO_NAME${NC}"
    echo -e "  • URL: ${GREEN}https://github.com/$GITHUB_USERNAME/$REPO_NAME${NC}"
    echo ""

    read -p "Continue? (y/N): " CONFIRM
    if [[ ! "$CONFIRM" =~ ^[Yy]$ ]]; then
        log_info "Setup cancelled by user"
        exit 0
    fi
}

# Setup with GitHub CLI
setup_with_github_cli() {
    log_info "Setting up with GitHub CLI..."

    # Check authentication
    if ! gh auth status &> /dev/null; then
        log_info "Authenticating with GitHub..."
        gh auth login
    fi

    # Create repository
    log_info "Creating repository: $REPO_NAME"
    gh repo create "$REPO_NAME" \
        --description "$REPO_DESCRIPTION" \
        --public \
        --source=. \
        --remote=origin \
        --push

    log_success "Repository created and code pushed!"
}

# Setup manually
setup_manually() {
    log_info "Setting up manually..."

    # Add remote
    log_info "Adding remote repository..."
    git remote add origin "https://github.com/$GITHUB_USERNAME/$REPO_NAME.git"

    # Push code
    log_info "Pushing code to GitHub..."
    git push -u origin main

    log_success "Code pushed to GitHub!"
}

# Create GitHub Actions workflow
create_github_actions() {
    log_info "Creating GitHub Actions workflow..."

    mkdir -p .github/workflows

    cat > .github/workflows/deploy.yml << 'EOF'
name: Deploy MIA.vn Google Integration

on:
  push:
    branches: [ main ]
  pull_request:
    branches: [ main ]

jobs:
  test:
    runs-on: ubuntu-latest

    steps:
    - uses: actions/checkout@v4

    - name: Setup Node.js
      uses: actions/setup-node@v4
      with:
        node-version: '18'
        cache: 'npm'

    - name: Install dependencies
      run: npm ci

    - name: Run tests
      run: npm test

    - name: Build application
      run: npm run build:prod

    - name: Upload build artifacts
      uses: actions/upload-artifact@v4
      with:
        name: build-files
        path: build/

  deploy:
    needs: test
    runs-on: ubuntu-latest
    if: github.ref == 'refs/heads/main'

    steps:
    - uses: actions/checkout@v4

    - name: Setup Node.js
      uses: actions/setup-node@v4
      with:
        node-version: '18'
        cache: 'npm'

    - name: Install dependencies
      run: npm ci

    - name: Build application
      run: npm run build:prod

    - name: Deploy to production
      run: |
        echo "🚀 Deploying to production..."
        echo "Build completed successfully!"
        # Add your deployment commands here
EOF

    # Commit workflow
    git add .github/workflows/deploy.yml
    git commit -m "🔧 Add GitHub Actions workflow for CI/CD"

    if [[ "$GITHUB_CLI_AVAILABLE" == "true" ]]; then
        git push
    else
        log_info "GitHub Actions workflow created. Push manually with: git push"
    fi

    log_success "GitHub Actions workflow created!"
}

# Create deployment configuration
create_deployment_config() {
    log_info "Creating deployment configuration..."

    # Vercel configuration
    cat > vercel.json << 'EOF'
{
  "version": 2,
  "builds": [
    {
      "src": "package.json",
      "use": "@vercel/static-build",
      "config": {
        "distDir": "build"
      }
    }
  ],
  "routes": [
    {
      "src": "/static/(.*)",
      "headers": {
        "cache-control": "s-maxage=31536000,immutable"
      }
    },
    {
      "src": "/(.*)",
      "dest": "/index.html"
    }
  ]
}
EOF

    # Netlify configuration
    cat > netlify.toml << 'EOF'
[build]
  publish = "build"
  command = "npm run build:prod"

[build.environment]
  NODE_VERSION = "18"

[[redirects]]
  from = "/*"
  to = "/index.html"
  status = 200

[[headers]]
  for = "/static/*"
  [headers.values]
    Cache-Control = "public, max-age=31536000, immutable"
EOF

    # Commit configuration
    git add vercel.json netlify.toml
    git commit -m "🔧 Add deployment configuration for Vercel and Netlify"

    if [[ "$GITHUB_CLI_AVAILABLE" == "true" ]]; then
        git push
    else
        log_info "Deployment configuration created. Push manually with: git push"
    fi

    log_success "Deployment configuration created!"
}

# Show next steps
show_next_steps() {
    echo ""
    echo -e "${GREEN}🎉 GitHub Setup Completed Successfully!${NC}"
    echo -e "${GREEN}=================================================${NC}"
    echo ""
    echo -e "${BLUE}📋 Next Steps:${NC}"
    echo ""
    echo -e "1. ${YELLOW}Configure Environment Variables:${NC}"
    echo -e "   • Go to repository settings"
    echo -e "   • Add secrets for Google APIs"
    echo -e "   • Configure deployment environment"
    echo ""
    echo -e "2. ${YELLOW}Deploy to Production:${NC}"
    echo -e "   • Vercel: https://vercel.com/new"
    echo -e "   • Netlify: https://app.netlify.com/start"
    echo -e "   • Connect your GitHub repository"
    echo ""
    echo -e "3. ${YELLOW}Monitor Deployment:${NC}"
    echo -e "   • GitHub Actions: https://github.com/$GITHUB_USERNAME/$REPO_NAME/actions"
    echo -e "   • Repository: https://github.com/$GITHUB_USERNAME/$REPO_NAME"
    echo ""
    echo -e "4. ${YELLOW}Configure Domain:${NC}"
    echo -e "   • Add custom domain in deployment platform"
    echo -e "   • Configure SSL certificate"
    echo -e "   • Update DNS settings"
    echo ""
    echo -e "${CYAN}🔗 Quick Links:${NC}"
    echo -e "  • Repository: https://github.com/$GITHUB_USERNAME/$REPO_NAME"
    echo -e "  • Actions: https://github.com/$GITHUB_USERNAME/$REPO_NAME/actions"
    echo -e "  • Issues: https://github.com/$GITHUB_USERNAME/$REPO_NAME/issues"
    echo ""
    echo -e "${YELLOW}📚 Documentation:${NC}"
    echo -e "  • README.md: Project overview and setup"
    echo -e "  • docs/guides/: Detailed guides"
    echo -e "  • GITHUB_SETUP.md: This setup guide"
    echo ""
}

# Main function
main() {
    show_banner

    # Check prerequisites
    check_prerequisites

    # Get user input
    get_user_input

    # Setup repository
    if [[ "$GITHUB_CLI_AVAILABLE" == "true" ]]; then
        setup_with_github_cli
    else
        setup_manually
    fi

    # Create additional configurations
    create_github_actions
    create_deployment_config

    # Show next steps
    show_next_steps
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
        echo "  1. Check prerequisites"
        echo "  2. Get user input for repository setup"
        echo "  3. Create GitHub repository"
        echo "  4. Push code to GitHub"
        echo "  5. Create GitHub Actions workflow"
        echo "  6. Create deployment configuration"
        echo ""
        exit 0
        ;;
    --version|-v)
        echo "MIA.vn Google Integration - GitHub Setup Script v1.0.0"
        exit 0
        ;;
esac

# Run main function
main "$@"
