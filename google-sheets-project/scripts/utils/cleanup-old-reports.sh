#!/bin/bash

# 🧹 Cleanup Old Reports Script
# Xóa các reports cũ hơn X ngày để tiết kiệm dung lượng

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

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Default: keep reports for 30 days
DAYS_TO_KEEP=${1:-30}
DRY_RUN=${2:-false}

echo "🧹 Cleanup Old Reports"
echo "====================="
echo ""
echo "Days to keep: $DAYS_TO_KEEP"
echo "Dry run: $DRY_RUN"
echo ""

if [ "$DRY_RUN" != "true" ] && [ "$DRY_RUN" != "false" ]; then
    print_error "Invalid dry-run value. Use 'true' or 'false'"
    exit 1
fi

# Function to cleanup directory
cleanup_dir() {
    local dir=$1
    local type=$2
    
    if [ ! -d "$dir" ]; then
        return
    fi
    
    print_status "Cleaning up $type reports in $dir..."
    
    local count=0
    local total_size=0
    
    find "$dir" -name "*.json" -type f -mtime +$DAYS_TO_KEEP | while read f; do
        size=$(stat -f%z "$f" 2>/dev/null || stat -c%s "$f" 2>/dev/null || echo 0)
        total_size=$((total_size + size))
        count=$((count + 1))
        
        if [ "$DRY_RUN" = "true" ]; then
            print_warning "Would delete: $f ($(numfmt --to=iec-i --suffix=B $size 2>/dev/null || echo "${size}B"))"
        else
            rm -f "$f"
            print_status "Deleted: $f"
        fi
    done
    
    if [ "$DRY_RUN" = "true" ]; then
        print_warning "Would delete $count files ($(numfmt --to=iec-i --suffix=B $total_size 2>/dev/null || echo "${total_size}B"))"
    else
        print_success "Deleted $count $type reports"
    fi
}

# Cleanup each report type
cleanup_dir "reports/email" "email"
cleanup_dir "reports/telegram" "telegram"
cleanup_dir "reports/health" "health"
cleanup_dir "reports/build" "build"
cleanup_dir "reports/performance" "performance"
cleanup_dir "reports/lighthouse" "lighthouse"

# Cleanup old backups
print_status "Cleaning up old backups..."
find backups -type d -name "*venv.backup*" -mtime +$DAYS_TO_KEEP | while read d; do
    if [ "$DRY_RUN" = "true" ]; then
        print_warning "Would delete backup directory: $d"
    else
        rm -rf "$d"
        print_status "Deleted backup: $d"
    fi
done

echo ""
if [ "$DRY_RUN" = "true" ]; then
    print_warning "Dry run complete. No files were deleted."
    echo "Run without 'true' to actually delete files."
else
    print_success "✅ Cleanup complete!"
fi
echo ""

