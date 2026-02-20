#!/bin/bash

# =============================================================================
# Script chuẩn bị repository cho GitHub
# =============================================================================

set -e

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

print_header() {
    echo -e "\n${BLUE}═══════════════════════════════════════════════════════════${NC}"
    echo -e "${BLUE}  🚀 CHUẨN BỊ REPOSITORY CHO GITHUB${NC}"
    echo -e "${BLUE}═══════════════════════════════════════════════════════════${NC}\n"
}

print_success() {
    echo -e "${GREEN}✅ $1${NC}"
}

print_warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

print_error() {
    echo -e "${RED}❌ $1${NC}"
}

print_info() {
    echo -e "${BLUE}ℹ️  $1${NC}"
}

# Get script directory
SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
PROJECT_ROOT="$( cd "$SCRIPT_DIR/.." && pwd )"

cd "$PROJECT_ROOT"

print_header

# 1. Kiểm tra Git
print_info "Kiểm tra Git repository..."
if ! git rev-parse --git-dir > /dev/null 2>&1; then
    print_info "Khởi tạo Git repository..."
    git init
    print_success "Git repository đã được khởi tạo"
else
    print_success "Git repository đã tồn tại"
fi

# 2. Kiểm tra .gitignore
print_info "Kiểm tra .gitignore..."
if [ ! -f .gitignore ]; then
    print_warning ".gitignore chưa tồn tại - đã được tạo tự động"
fi

# 3. Kiểm tra LICENSE
print_info "Kiểm tra LICENSE..."
if [ ! -f LICENSE ]; then
    print_warning "LICENSE chưa tồn tại - sẽ được tạo"
    # File đã được tạo ở trên
fi

# 4. Kiểm tra các file nhạy cảm
print_info "Kiểm tra các file nhạy cảm..."

SENSITIVE_FILES=(
    ".env"
    "automation/config/google-credentials.json"
    "automation/config/service_account.json"
    "one_automation_system/config/service_account.json"
)

HAS_SENSITIVE=false
for file in "${SENSITIVE_FILES[@]}"; do
    if [ -f "$file" ]; then
        # Check if file is in .gitignore
        if git check-ignore -q "$file" 2>/dev/null; then
            print_success "$file được ignore (OK)"
        else
            print_warning "$file tồn tại nhưng chưa được ignore!"
            HAS_SENSITIVE=true
        fi
    fi
done

# 5. Kiểm tra README.md
print_info "Kiểm tra README.md..."
if [ ! -f README.md ]; then
    print_error "README.md không tồn tại!"
else
    print_success "README.md đã có"
fi

# 6. Hiển thị trạng thái Git
echo ""
print_info "Trạng thái Git hiện tại:"
git status --short | head -20 || true

# 7. Kiểm tra remote
echo ""
print_info "Kiểm tra Git remote..."
if git remote | grep -q "^origin$"; then
    REMOTE_URL=$(git remote get-url origin)
    print_success "Remote 'origin' đã tồn tại: $REMOTE_URL"
else
    print_warning "Chưa có remote 'origin'"
    echo ""
    print_info "Để thêm remote, chạy:"
    echo "  git remote add origin https://github.com/USERNAME/REPO_NAME.git"
fi

# 8. Tóm tắt
echo ""
echo -e "${BLUE}═══════════════════════════════════════════════════════════${NC}"
echo -e "${GREEN}📋 TÓM TẮT${NC}"
echo -e "${BLUE}═══════════════════════════════════════════════════════════${NC}"
echo ""
print_success "Repository đã sẵn sàng!"

if [ "$HAS_SENSITIVE" = true ]; then
    print_warning "Một số file nhạy cảm chưa được ignore - hãy kiểm tra lại!"
fi

echo ""
print_info "Các bước tiếp theo:"
echo ""
echo "1. Kiểm tra các thay đổi:"
echo "   ${BLUE}git status${NC}"
echo ""
echo "2. Thêm các file vào staging:"
echo "   ${BLUE}git add .${NC}"
echo ""
echo "3. Commit changes:"
echo "   ${BLUE}git commit -m 'Initial commit: React OAS Integration v3.0'${NC}"
echo ""
echo "4. Tạo repository mới trên GitHub:"
echo "   - Truy cập: https://github.com/new"
echo "   - Repository name: React-OAS-Integration-v3.0"
echo "   - Description: AI-Powered Automation Platform"
echo "   - Visibility: Public hoặc Private"
echo ""
echo "5. Push lên GitHub:"
echo "   ${BLUE}git remote add origin https://github.com/USERNAME/REPO_NAME.git${NC}"
echo "   ${BLUE}git branch -M main${NC}"
echo "   ${BLUE}git push -u origin main${NC}"
echo ""

