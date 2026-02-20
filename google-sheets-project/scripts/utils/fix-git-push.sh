#!/bin/bash

# 🔧 Fix Git Push Issues Script
# Xử lý các vấn đề git push (non-fast-forward, conflicts, etc.)

# Get script directory and change to project root
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "$SCRIPT_DIR/../.." && pwd)"
cd "$PROJECT_ROOT"

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
RED='\033[0;31m'
NC='\033[0m'

print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

echo "🔧 Fixing Git Push Issues..."
echo "============================"
echo ""

# Check if git repo
if ! git rev-parse --git-dir > /dev/null 2>&1; then
    print_error "Not a git repository!"
    exit 1
fi

# Get current branch
CURRENT_BRANCH=$(git branch --show-current)
print_status "Current branch: $CURRENT_BRANCH"

# Check if remote exists
if ! git remote get-url origin > /dev/null 2>&1; then
    print_warning "No remote 'origin' configured"
    exit 1
fi

# Fetch latest
print_status "Fetching latest from remote..."
if git fetch origin "$CURRENT_BRANCH" 2>&1; then
    print_success "Fetched successfully"
else
    print_error "Failed to fetch from remote"
    exit 1
fi

# Check if behind
LOCAL=$(git rev-parse @)
REMOTE=$(git rev-parse @{u} 2>/dev/null || echo "")

if [ -z "$REMOTE" ]; then
    print_warning "No upstream branch set"
    print_status "Setting upstream..."
    git push -u origin "$CURRENT_BRANCH" && print_success "Upstream set" || print_error "Failed to set upstream"
    exit 0
fi

if [ "$LOCAL" = "$REMOTE" ]; then
    print_success "Local branch is up to date with remote"
    print_status "Attempting push..."
    if git push origin "$CURRENT_BRANCH"; then
        print_success "Push successful!"
        exit 0
    else
        print_error "Push failed"
        exit 1
    fi
fi

# Check if ahead or behind
BASE=$(git merge-base @ @{u})
AHEAD=$(git rev-list --count @ ^@{u} 2>/dev/null || echo "0")
BEHIND=$(git rev-list --count @{u} ^@ 2>/dev/null || echo "0")

if [ "$BEHIND" -gt 0 ]; then
    print_warning "Local branch is $BEHIND commits behind remote"
    print_status "Attempting to merge..."
    
    # Try merge
    if git pull --no-rebase origin "$CURRENT_BRANCH" 2>&1 | tee /tmp/git-merge.log; then
        print_success "Merge successful!"
        rm -f /tmp/git-merge.log
        
        # Now push
        print_status "Pushing merged changes..."
        if git push origin "$CURRENT_BRANCH"; then
            print_success "Push successful!"
            exit 0
        else
            print_error "Push failed after merge"
            exit 1
        fi
    else
        if grep -q "CONFLICT" /tmp/git-merge.log; then
            print_error "Merge conflict detected!"
            print_status "Please resolve conflicts manually:"
            echo ""
            echo "  1. Resolve conflicts in files"
            echo "  2. git add ."
            echo "  3. git commit -m 'Resolve merge conflicts'"
            echo "  4. git push origin $CURRENT_BRANCH"
            echo ""
            rm -f /tmp/git-merge.log
            exit 1
        else
            print_error "Merge failed"
            cat /tmp/git-merge.log
            rm -f /tmp/git-merge.log
            exit 1
        fi
    fi
fi

if [ "$AHEAD" -gt 0 ]; then
    print_status "Local branch is $AHEAD commits ahead of remote"
    print_status "Attempting push..."
    if git push origin "$CURRENT_BRANCH"; then
        print_success "Push successful!"
        exit 0
    else
        print_error "Push failed"
        exit 1
    fi
fi

print_success "✅ Git push issues resolved!"

