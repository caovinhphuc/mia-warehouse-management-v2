#!/bin/bash

# Sync all component files from current branch to main branch

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
║        🔄 SYNC TO MAIN - Đồng bộ files vào main           ║
╚════════════════════════════════════════════════════════════╝
EOF
echo -e "${NC}"

log "Branch hiện tại: $CURRENT_BRANCH"
log "Target branch: $MAIN_BRANCH"

# Check if main branch exists
if ! git show-ref --verify --quiet refs/heads/$MAIN_BRANCH; then
  error "Branch $MAIN_BRANCH không tồn tại!"
  exit 1
fi

# All components directories that need to be synced
COMPONENT_DIRS=(
  "src/components/automation"
  "src/components/smart-automation"
  "src/components/custom"
  "src/components/Alerts"
  "src/components/analytics"
  "src/components/nlp"
  "src/components/security"
)

# Files that might be missing
CRITICAL_FILES=(
  "src/components/automation/AutomationDashboard.jsx"
  "src/components/automation/AutomationDashboard.css"
)

echo ""
warn "Các files/directories sẽ được sync:"
for dir in "${COMPONENT_DIRS[@]}"; do
  if [ -d "$dir" ]; then
    file_count=$(find "$dir" -type f \( -name "*.jsx" -o -name "*.css" \) 2>/dev/null | wc -l)
    echo "  📁 $dir ($file_count files)"
  fi
done

echo ""
log "Bắt đầu sync..."

# Stash current changes
if ! git diff --quiet || ! git diff --cached --quiet; then
  warn "Có uncommitted changes. Đang stash..."
  git stash push -m "Auto-stash before sync to main $(date +%Y%m%d-%H%M%S)"
  STASHED=true
else
  STASHED=false
fi

# Switch to main
log "Switching to $MAIN_BRANCH branch..."
git checkout $MAIN_BRANCH

# Sync all component directories
SYNCED_COUNT=0
for dir in "${COMPONENT_DIRS[@]}"; do
  if git show $CURRENT_BRANCH:$dir >/dev/null 2>&1 || [ -d "../$CURRENT_BRANCH/$dir" ] 2>/dev/null; then
    # Check if directory exists in current branch
    if git ls-tree -r --name-only $CURRENT_BRANCH | grep -q "^$dir/"; then
      # Copy entire directory
      git checkout $CURRENT_BRANCH -- "$dir/" 2>/dev/null || {
        # Fallback: copy individual files
        files=$(git ls-tree -r --name-only $CURRENT_BRANCH | grep "^$dir/")
        for file in $files; do
          if git show $CURRENT_BRANCH:$file >/dev/null 2>&1; then
            git checkout $CURRENT_BRANCH -- "$file" 2>/dev/null || true
          fi
        done
      }
      log "✅ Synced: $dir"
      SYNCED_COUNT=$((SYNCED_COUNT + 1))
    fi
  fi
done

# Also sync critical files individually
for file in "${CRITICAL_FILES[@]}"; do
  if git show $CURRENT_BRANCH:$file >/dev/null 2>&1; then
    git checkout $CURRENT_BRANCH -- "$file" 2>/dev/null && {
      log "✅ Synced: $file"
      SYNCED_COUNT=$((SYNCED_COUNT + 1))
    } || true
  fi
done

# Check if there are changes to commit
if ! git diff --quiet || ! git diff --cached --quiet; then
  log "Đang commit changes..."
  git add "${COMPONENT_DIRS[@]}" "${CRITICAL_FILES[@]}" 2>/dev/null || true

  # Add all changes
  git add -A

  if git diff --cached --quiet; then
    log "Không có thay đổi nào để commit"
  else
    git commit -m "fix: sync component files from $CURRENT_BRANCH to main

- Sync all component directories
- Fix missing AutomationDashboard and other components
- Ensure Vercel build has all required files" || {
      error "Commit failed!"
      git checkout $CURRENT_BRANCH
      [ "$STASHED" = true ] && git stash pop || true
      exit 1
    }

    log "✅ Đã commit vào $MAIN_BRANCH"

    echo ""
    read -p "🚀 Push lên GitHub? (y/n): " -n 1 -r
    echo ""
    if [[ $REPLY =~ ^[Yy]$ ]]; then
      git push origin $MAIN_BRANCH
      log "✅ Đã push lên GitHub!"
      echo ""
      log "🎉 Sync hoàn tất! Bây giờ chạy lại deploy:"
      echo "   ./deploy-vercel.sh --preview"
    else
      warn "Chưa push. Bạn có thể push sau bằng:"
      echo "   git push origin $MAIN_BRANCH"
    fi
  fi
else
  log "Không có thay đổi nào cần sync"
fi

# Switch back to original branch
log "Switching back to $CURRENT_BRANCH..."
git checkout $CURRENT_BRANCH

# Restore stash
if [ "$STASHED" = true ]; then
  log "Restoring stashed changes..."
  git stash pop 2>/dev/null || warn "Could not restore stash (might be empty)"
fi

echo ""
log "✅ Hoàn tất! Đã sync $SYNCED_COUNT items vào $MAIN_BRANCH"

