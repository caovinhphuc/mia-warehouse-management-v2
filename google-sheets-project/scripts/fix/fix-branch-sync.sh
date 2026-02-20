#!/bin/bash

# Fix missing files by syncing from current branch to main

set -e

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
BLUE='\033[0;34m'
NC='\033[0m'

log() { echo -e "${GREEN}[INFO]${NC} $1"; }
warn() { echo -e "${YELLOW}[WARN]${NC} $1"; }
error() { echo -e "${RED}[ERROR]${NC} $1"; }

CURRENT_BRANCH=$(git branch --show-current)
MAIN_BRANCH="main"

echo -e "${BLUE}"
cat << 'EOF'
╔════════════════════════════════════════════════════════════╗
║        🔧 FIX BRANCH SYNC - Đồng bộ files                  ║
╚════════════════════════════════════════════════════════════╝
EOF
echo -e "${NC}"

log "Branch hiện tại: $CURRENT_BRANCH"
log "Target branch: $MAIN_BRANCH"

# Files that need to be synced
FILES=(
  "src/components/automation/AutomationDashboard.jsx"
  "src/components/automation/AutomationDashboard.css"
)

echo ""
warn "Các file cần sync:"
for file in "${FILES[@]}"; do
  if [ -f "$file" ]; then
    echo "  ✅ $file"
  else
    echo "  ❌ $file - THIẾU"
  fi
done

echo ""
read -p "Bạn muốn làm gì? (1=Copy vào main, 2=Merge vào main, 3=Skip): " choice

case $choice in
  1)
    log "Option 1: Copy files vào main branch"

    # Check if main branch exists
    if ! git show-ref --verify --quiet refs/heads/$MAIN_BRANCH; then
      error "Branch $MAIN_BRANCH không tồn tại!"
      exit 1
    fi

    # Stash current changes
    git stash push -m "Stash before sync to main" 2>/dev/null || true

    # Switch to main
    git checkout $MAIN_BRANCH

    # Copy files from current branch
    for file in "${FILES[@]}"; do
      if git show $CURRENT_BRANCH:$file >/dev/null 2>&1; then
        git checkout $CURRENT_BRANCH -- "$file"
        log "✅ Copied: $file"
      fi
    done

    # Commit if there are changes
    if ! git diff --quiet; then
      git add "${FILES[@]}"
      git commit -m "fix: sync AutomationDashboard files from $CURRENT_BRANCH"
      log "✅ Đã commit vào $MAIN_BRANCH"

      read -p "Push lên GitHub? (y/n): " -n 1 -r
      echo ""
      if [[ $REPLY =~ ^[Yy]$ ]]; then
        git push origin $MAIN_BRANCH
        log "✅ Đã push lên GitHub!"
      fi
    else
      log "Không có thay đổi nào"
    fi

    # Switch back to original branch
    git checkout $CURRENT_BRANCH

    # Restore stash
    git stash pop 2>/dev/null || true

    log "✅ Hoàn tất! Đã copy files vào $MAIN_BRANCH"
    ;;

  2)
    log "Option 2: Merge $CURRENT_BRANCH vào $MAIN_BRANCH"

    # Stash current changes
    git stash push -m "Stash before merge" 2>/dev/null || true

    # Switch to main
    git checkout $MAIN_BRANCH

    # Merge
    git merge $CURRENT_BRANCH --no-edit || {
      error "Merge conflict! Vui lòng resolve manually."
      exit 1
    }

    log "✅ Đã merge thành công!"

    read -p "Push lên GitHub? (y/n): " -n 1 -r
    echo ""
    if [[ $REPLY =~ ^[Yy]$ ]]; then
      git push origin $MAIN_BRANCH
      log "✅ Đã push lên GitHub!"
    fi

    # Switch back
    git checkout $CURRENT_BRANCH

    # Restore stash
    git stash pop 2>/dev/null || true

    log "✅ Hoàn tất!"
    ;;

  *)
    warn "Skipped. Không có thay đổi nào."
    ;;
esac

echo ""
log "Bây giờ bạn có thể chạy lại deploy:"
echo "  ./deploy-vercel.sh --preview"

