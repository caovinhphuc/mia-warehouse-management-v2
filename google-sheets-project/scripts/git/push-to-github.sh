#!/bin/bash

# =============================================================================
# Script push code lên GitHub repository
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
    echo -e "${BLUE}  🚀 PUSH CODE LÊN GITHUB${NC}"
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

# Get project root
PROJECT_ROOT="$( cd "$( dirname "${BASH_SOURCE[0]}" )/.." && pwd )"
cd "$PROJECT_ROOT"

print_header

# 1. Kiểm tra Git status
print_info "Kiểm tra Git status..."
if ! git rev-parse --git-dir > /dev/null 2>&1; then
    print_error "Không phải Git repository! Chạy git init trước."
    exit 1
fi

# 2. Kiểm tra các file nhạy cảm
print_info "Kiểm tra file nhạy cảm..."
SENSITIVE_COUNT=$(git ls-files | grep -E '\.(env|pem|key|json)$' | grep -v node_modules | grep -E '(credentials|service_account|\.env$)' | wc -l | tr -d ' ')

if [ "$SENSITIVE_COUNT" -gt 0 ]; then
    print_warning "Phát hiện $SENSITIVE_COUNT file có thể nhạy cảm đã được staged!"
    git ls-files | grep -E '\.(env|pem|key|json)$' | grep -v node_modules | grep -E '(credentials|service_account|\.env$)'
    read -p "Bạn có muốn tiếp tục? (y/N): " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        print_error "Đã hủy!"
        exit 1
    fi
fi

# 3. Kiểm tra thay đổi
print_info "Kiểm tra thay đổi..."
CHANGED_FILES=$(git status --porcelain | wc -l | tr -d ' ')

if [ "$CHANGED_FILES" -eq 0 ]; then
    print_warning "Không có thay đổi để commit!"
    exit 0
fi

print_info "Có $CHANGED_FILES file đã thay đổi"

# 4. Hiển thị các file sẽ được commit
print_info "Các file sẽ được commit:"
git status --short | head -20

# 5. Hỏi xác nhận
echo ""
read -p "Bạn có muốn commit và push? (y/N): " -n 1 -r
echo
if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    print_error "Đã hủy!"
    exit 1
fi

# 6. Thêm files vào staging
print_info "Thêm files vào staging..."
git add .
print_success "Files đã được thêm vào staging"

# 7. Commit
print_info "Tạo commit..."
COMMIT_MESSAGE="${1:-feat: Update React OAS Integration v3.0

- Updated README with complete documentation
- Added LICENSE (MIT)
- Enhanced .gitignore for security
- Updated architecture guide and roadmap
- Improved project structure}"

git commit -m "$COMMIT_MESSAGE"
print_success "Commit thành công!"

# 8. Kiểm tra remote
print_info "Kiểm tra Git remote..."
if git remote | grep -q "^origin$"; then
    REMOTE_URL=$(git remote get-url origin)
    print_success "Remote 'origin': $REMOTE_URL"
else
    print_warning "Chưa có remote 'origin'"
    read -p "Nhập GitHub repository URL (hoặc Enter để bỏ qua): " REPO_URL
    if [ -n "$REPO_URL" ]; then
        git remote add origin "$REPO_URL"
        print_success "Đã thêm remote: $REPO_URL"
    else
        print_error "Không có remote URL. Vui lòng thêm remote trước."
        exit 1
    fi
fi

# 9. Đảm bảo branch là main
print_info "Kiểm tra branch..."
CURRENT_BRANCH=$(git branch --show-current)
if [ "$CURRENT_BRANCH" != "main" ]; then
    print_warning "Branch hiện tại: $CURRENT_BRANCH"
    read -p "Đổi sang branch 'main'? (y/N): " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        git branch -M main
        print_success "Đã đổi sang branch main"
    fi
fi

# 10. Push lên GitHub
print_info "Push lên GitHub..."
print_warning "Lần đầu push có thể cần xác thực GitHub!"

if git push -u origin main 2>&1; then
    print_success "✅ Push thành công lên GitHub!"
    echo ""
    print_info "Repository URL: $REMOTE_URL"
else
    print_error "❌ Push thất bại!"
    print_info "Có thể cần:"
    echo "  1. Xác thực GitHub (gh auth login hoặc SSH keys)"
    echo "  2. Kiểm tra quyền truy cập repository"
    echo "  3. Pull changes trước: git pull origin main --rebase"
    exit 1
fi

echo ""
print_success "🎉 Hoàn thành! Repository đã được cập nhật trên GitHub!"

