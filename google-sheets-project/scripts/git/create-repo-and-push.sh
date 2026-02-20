#!/bin/bash

# =============================================================================
# Create GitHub Repository and Push Code
# =============================================================================

set -euo pipefail

# Colors
readonly GREEN='\033[0;32m'
readonly YELLOW='\033[1;33m'
readonly BLUE='\033[0;34m'
readonly RED='\033[0;31m'
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

# Banner
echo -e "${BLUE}🚀 MIA.vn Google Integration - Create Repository & Push${NC}"
echo -e "${BLUE}=====================================================${NC}"
echo ""

# Check if GitHub CLI is available
if command -v gh &> /dev/null; then
    log_info "GitHub CLI found. Using automated setup..."

    # Check authentication
    if ! gh auth status &> /dev/null; then
        log_info "Authenticating with GitHub..."
        gh auth login
    fi

    # Create repository
    log_info "Creating repository: mia-vn-google-integration"
    gh repo create mia-vn-google-integration \
        --description "MIA.vn Google Integration Platform - Comprehensive automation and data management system" \
        --public \
        --source=. \
        --remote=origin \
        --push

    log_info "✅ Repository created and code pushed successfully!"

else
    log_warn "GitHub CLI not found. Using manual setup..."

    echo ""
    echo -e "${YELLOW}📝 Manual Setup Required:${NC}"
    echo ""
    echo "1. Go to: https://github.com/new"
    echo "2. Repository name: mia-vn-google-integration"
    echo "3. Description: MIA.vn Google Integration Platform - Comprehensive automation and data management system"
    echo "4. Visibility: Public"
    echo "5. DO NOT check 'Initialize with README'"
    echo "6. Click 'Create repository'"
    echo ""

    read -p "Press Enter after creating the repository..."

    # Add remote and push
    log_info "Adding remote repository..."
    git remote remove origin 2>/dev/null || true
    git remote add origin https://github.com/caovinhphuc/mia-vn-google-integration.git

    log_info "Pushing code to GitHub..."
    git push -u origin main

    log_info "✅ Code pushed successfully!"
fi

echo ""
echo -e "${GREEN}🎉 Repository Setup Completed!${NC}"
echo ""
echo -e "${BLUE}📋 Next Steps:${NC}"
echo "1. Configure environment variables in repository settings"
echo "2. Deploy to Vercel/Netlify:"
echo "   • Vercel: https://vercel.com/new"
echo "   • Netlify: https://app.netlify.com/start"
echo "3. Connect your GitHub repository"
echo "4. Configure environment variables"
echo ""
echo -e "${BLUE}🔗 Repository URL:${NC} https://github.com/caovinhphuc/mia-vn-google-integration"
echo ""
