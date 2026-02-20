#!/bin/bash

# 🧹 Cleanup Python Duplicates - Simple & Direct
# Xóa các file Python trùng lặp đã được xác định

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

echo "🧹 Python Duplicates Cleanup"
echo "============================"
echo ""
echo "Mode: $([ "$DRY_RUN" = "true" ] && echo "DRY RUN" || echo "LIVE")"
echo ""

# Create backup
if [ "$DRY_RUN" != "true" ]; then
    BACKUP_DIR="backups/python-files-$(date +%Y%m%d_%H%M%S)"
    mkdir -p "$BACKUP_DIR"
    print_status "Backup directory: $BACKUP_DIR"
fi

# Files to remove
FILES_TO_REMOVE=(
    # Root level
    "auth_service.py"
    "auth_api_server.py"
    "automation.py"
    "automation_bridge.py"
    "automation_bridge copy.py"
    "google_sheets_config.py"
    "google_sheets_config copy.py"
    "inspect_sheets_data.py"
    "test_auth_system.py"
    "generate_summary.py"
    "system_check.py"
    "system_check copy.py"
    "run_all_demo.py"
    "run_automation_with_logging.py"
    "run_complete_automation.py"
    "dashboard.py"
    "dashboard_integration.py"
    "verify_authentication_and_user.py"
    "verify_sheets.py"
    "ui_debug_inspector.py"
    "analyze_structure.py"
    "test_google_sheets_verification.py"
    "setup.py"
    
    # Automation
    "automation/automation copy.py"
    "automation/auth_service.py"
    "automation/auth_api_server.py"
    "automation/inspect_sheets_data.py"
    "automation/test_auth_system.py"
    "automation/generate_summary.py"
    "automation/system_check.py"
    "automation/run_all_demo.py"
    "automation/dashboard.py"
    "automation/dashboard_integration.py"
    "automation/verify_authentication_and_user.py"
    "automation/verify_sheets.py"
    "automation/ui_debug_inspector.py"
    "automation/analyze_structure.py"
    "automation/test_google_sheets_verification.py"
    "automation/setup.py"
    "automation/automation_bridge.py"
    
    # Automation new
    "automation/automation_new/auth_service.py"
    "automation/automation_new/auth_api_server.py"
    "automation/automation_new/automation.py"
    "automation/automation_new/inspect_sheets_data.py"
    "automation/automation_new/test_auth_system.py"
    "automation/automation_new/system_check.py"
    "automation/automation_new/run_all_demo.py"
    "automation/automation_new/dashboard.py"
    "automation/automation_new/verify_authentication_and_user.py"
    "automation/automation_new/verify_sheets.py"
    "automation/automation_new/test_google_sheets_verification.py"
    "automation/automation_new/google_sheets_config.py"
    "automation/automation_new/run_automation_with_logging.py"
    "automation/automation_new/run_complete_automation.py"
    
    # Scripts
    "scripts/automation_bridge.py"
    
    # Config
    "config/settings.py"
    "automation/config/settings.py"
    "mia-warehouse-management-v1.0.0/config/settings.py"
    
    # Utils
    "automation/utils/logger.py"
    "mia-warehouse-management-v1.0.0/utils/logger.py"
    
    # Modules
    "mia-warehouse-management-v1.0.0/modules/data_processor.py"
)

REMOVED=0
NOT_FOUND=0

print_status "Checking ${#FILES_TO_REMOVE[@]} files..."
echo ""

for file in "${FILES_TO_REMOVE[@]}"; do
    if [ -f "$file" ]; then
        size=$(stat -f%z "$file" 2>/dev/null || stat -c%s "$file" 2>/dev/null || echo "0")
        if [ "$DRY_RUN" = "true" ]; then
            print_warning "Would remove: $file ($size bytes)"
        else
            # Backup
            mkdir -p "$BACKUP_DIR/$(dirname "$file")" 2>/dev/null || true
            cp "$file" "$BACKUP_DIR/$file" 2>/dev/null || cp "$file" "$BACKUP_DIR/$(basename "$file")" 2>/dev/null || true
            rm -f "$file"
            print_status "Removed: $file"
        fi
        REMOVED=$((REMOVED + 1))
    else
        NOT_FOUND=$((NOT_FOUND + 1))
    fi
done

echo ""
if [ "$DRY_RUN" = "true" ]; then
    print_warning "DRY RUN: Would remove $REMOVED files ($NOT_FOUND not found)"
    echo ""
    echo "To actually remove, run:"
    echo "  ./scripts/utils/cleanup-python-duplicates.sh false"
else
    print_success "✅ Removed $REMOVED duplicate files"
    print_success "📦 Backup saved to: $BACKUP_DIR"
    print_status "   ($NOT_FOUND files not found - may have been removed already)"
fi

echo ""

