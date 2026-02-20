#!/bin/bash

# 🔄 Auto Update Documentation Script
# Tự động cập nhật docs.html khi có thay đổi trong markdown files

# Get script directory and change to project root
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "$SCRIPT_DIR/../.." && pwd)"
cd "$PROJECT_ROOT"

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

WATCH_MODE=${1:-false}

echo "🔄 Auto Update Documentation"
echo "============================"
echo ""

# Generate docs
print_status "Generating docs.html..."
node scripts/utils/generate-complete-docs.js

if [ $? -eq 0 ]; then
    print_success "✅ Documentation updated!"
    echo ""
    echo "📄 File: docs.html"
    echo "🌐 Open in browser to view"
    echo ""

    if [ "$WATCH_MODE" = "true" ]; then
        print_status "Watching for changes..."
        echo "Press Ctrl+C to stop"
        echo ""

        # Watch for changes in markdown files
        fswatch -o . -e ".*" -i "\\.md$" | while read f; do
            print_status "Change detected, regenerating..."
            node scripts/utils/generate-complete-docs.js
            print_success "✅ Updated!"
        done
    fi
else
    echo "❌ Failed to generate documentation"
    exit 1
fi

