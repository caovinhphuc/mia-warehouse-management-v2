#!/bin/bash

# 📦 Organize JavaScript Files Script
# Di chuyển test files vào scripts/tests/ và config files vào scripts/config/

# Get script directory and change to project root
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "$SCRIPT_DIR/../../.." && pwd)"
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

DRY_RUN=${1:-true}

echo "📦 Organizing JavaScript Files..."
echo "===================================="
echo ""
echo "Mode: $([ "$DRY_RUN" = "true" ] && echo "DRY RUN" || echo "LIVE")"
echo ""

# Create directories
mkdir -p scripts/tests scripts/config
print_success "Created directories: scripts/tests/, scripts/config/"

# Test files to move
TEST_FILES=(
    "end_to_end_test.js"
    "integration_test.js"
    "advanced_integration_test.js"
    "complete_system_test.js"
    "frontend_connection_test.js"
    "test_google_sheets.js"
    "ws-test.js"
)

# Config files to move (optional - env.config.js only)
CONFIG_FILES=(
    "env.config.js"
)

MOVED=0
NOT_FOUND=0

# Move test files
print_status "Moving test files to scripts/tests/..."
for file in "${TEST_FILES[@]}"; do
    if [ -f "$file" ]; then
        size=$(stat -f%z "$file" 2>/dev/null || stat -c%s "$file" 2>/dev/null || echo "0")
        if [ "$DRY_RUN" = "true" ]; then
            print_warning "Would move: $file → scripts/tests/$file ($size bytes)"
        else
            mv "$file" "scripts/tests/$file"
            print_status "Moved: $file → scripts/tests/$file"
        fi
        MOVED=$((MOVED + 1))
    else
        NOT_FOUND=$((NOT_FOUND + 1))
    fi
done

# Move config files (only env.config.js)
print_status "Moving config files to scripts/config/..."
for file in "${CONFIG_FILES[@]}"; do
    if [ -f "$file" ]; then
        size=$(stat -f%z "$file" 2>/dev/null || stat -c%s "$file" 2>/dev/null || echo "0")
        if [ "$DRY_RUN" = "true" ]; then
            print_warning "Would move: $file → scripts/config/$file ($size bytes)"
        else
            mv "$file" "scripts/config/$file"
            print_status "Moved: $file → scripts/config/$file"
        fi
        MOVED=$((MOVED + 1))
    else
        NOT_FOUND=$((NOT_FOUND + 1))
    fi
done

echo ""
if [ "$DRY_RUN" = "true" ]; then
    print_warning "DRY RUN: Would move $MOVED files ($NOT_FOUND not found)"
    echo ""
    echo "To actually move files, run:"
    echo "  ./scripts/utils/organize-js-files.sh false"
else
    print_success "✅ Moved $MOVED files"
    print_status "   ($NOT_FOUND files not found - may have been moved already)"
fi

echo ""
print_success "✅ Organization complete!"
echo ""
echo "📊 Summary:"
echo "   Test files moved: $(echo "${TEST_FILES[@]}" | wc -w | xargs)"
echo "   Config files moved: $(echo "${CONFIG_FILES[@]}" | wc -w | xargs)"
echo "   Total moved: $MOVED"
echo ""
echo "📁 New locations:"
echo "   Test files: scripts/tests/"
echo "   Config files: scripts/config/"
echo ""

