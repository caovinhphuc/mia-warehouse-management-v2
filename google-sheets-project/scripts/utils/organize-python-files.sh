#!/bin/bash

# 🐍 Organize Python Files Script
# Tổ chức lại các file Python, xóa duplicates và sắp xếp theo mục đích

# Get script directory and change to project root
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "$SCRIPT_DIR/../../.." && pwd)"
cd "$PROJECT_ROOT"

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
RED='\033[0;31m'
CYAN='\033[0;36m'
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

DRY_RUN=${1:-true}

echo "🐍 Organizing Python Files..."
echo "===================================="
echo ""
echo "Mode: $([ "$DRY_RUN" = "true" ] && echo "DRY RUN (no changes)" || echo "LIVE (will make changes)")"
echo ""

# First, run analysis
print_status "Running analysis..."
python3 scripts/utils/analyze-python-files.py > /tmp/python_analysis.txt 2>&1
ANALYSIS_EXIT=$?
if [ $ANALYSIS_EXIT -eq 0 ]; then
    print_success "Analysis complete"
else
    print_warning "Analysis had warnings (exit code: $ANALYSIS_EXIT), continuing..."
fi

# Create backup directory
if [ "$DRY_RUN" != "true" ]; then
    BACKUP_DIR="backups/python-files-$(date +%Y%m%d_%H%M%S)"
    mkdir -p "$BACKUP_DIR"
    print_status "Created backup directory: $BACKUP_DIR"
fi

# List of files to remove (duplicates)
DUPLICATES_TO_REMOVE=(
    # Root level duplicates
    "./auth_service.py"
    "./auth_api_server.py"
    "./automation.py"
    "./automation_bridge.py"
    "./automation_bridge copy.py"
    "./google_sheets_config.py"
    "./google_sheets_config copy.py"
    "./inspect_sheets_data.py"
    "./test_auth_system.py"
    "./generate_summary.py"
    "./system_check.py"
    "./system_check copy.py"
    "./run_all_demo.py"
    "./run_automation_with_logging.py"
    "./run_complete_automation.py"
    "./dashboard.py"
    "./dashboard_integration.py"
    "./verify_authentication_and_user.py"
    "./verify_sheets.py"
    "./ui_debug_inspector.py"
    "./analyze_structure.py"
    "./test_google_sheets_verification.py"
    "./setup.py"
    
    # Automation duplicates
    "./automation/automation copy.py"
    "./automation/auth_service.py"
    "./automation/auth_api_server.py"
    "./automation/inspect_sheets_data.py"
    "./automation/test_auth_system.py"
    "./automation/generate_summary.py"
    "./automation/system_check.py"
    "./automation/run_all_demo.py"
    "./automation/dashboard.py"
    "./automation/dashboard_integration.py"
    "./automation/verify_authentication_and_user.py"
    "./automation/verify_sheets.py"
    "./automation/ui_debug_inspector.py"
    "./automation/analyze_structure.py"
    "./automation/test_google_sheets_verification.py"
    "./automation/setup.py"
    "./automation/automation_bridge.py"
    
    # Automation new duplicates
    "./automation/automation_new/auth_service.py"
    "./automation/automation_new/auth_api_server.py"
    "./automation/automation_new/automation.py"
    "./automation/automation_new/inspect_sheets_data.py"
    "./automation/automation_new/test_auth_system.py"
    "./automation/automation_new/system_check.py"
    "./automation/automation_new/run_all_demo.py"
    "./automation/automation_new/dashboard.py"
    "./automation/automation_new/verify_authentication_and_user.py"
    "./automation/automation_new/verify_sheets.py"
    "./automation/automation_new/test_google_sheets_verification.py"
    "./automation/automation_new/google_sheets_config.py"
    "./automation/automation_new/run_automation_with_logging.py"
    "./automation/automation_new/run_complete_automation.py"
    
    # Scripts duplicates
    "./scripts/automation_bridge.py"
    
    # Config duplicates
    "./config/settings.py"
    "./automation/config/settings.py"
    "./mia-warehouse-management-v1.0.0/config/settings.py"
    
    # Utils duplicates
    "./automation/utils/logger.py"
    "./mia-warehouse-management-v1.0.0/utils/logger.py"
    
    # Modules duplicates
    "./mia-warehouse-management-v1.0.0/modules/data_processor.py"
)

print_status "Files to remove: ${#DUPLICATES_TO_REMOVE[@]}"
echo ""

# Remove duplicates
REMOVED=0
NOT_FOUND=0
for file in "${DUPLICATES_TO_REMOVE[@]}"; do
    # Remove leading ./ if present for path check
    clean_file="${file#./}"
    if [ -f "$file" ] || [ -f "$clean_file" ]; then
        target_file="$file"
        [ ! -f "$target_file" ] && target_file="$clean_file"
        
        if [ "$DRY_RUN" = "true" ]; then
            size=$(stat -f%z "$target_file" 2>/dev/null || stat -c%s "$target_file" 2>/dev/null || echo "0")
            print_warning "Would remove: $target_file ($size bytes)"
        else
            # Backup first
            mkdir -p "$BACKUP_DIR/$(dirname "$target_file")" 2>/dev/null || true
            cp "$target_file" "$BACKUP_DIR/$target_file" 2>/dev/null || cp "$target_file" "$BACKUP_DIR/$(basename "$target_file")" 2>/dev/null || true
            rm -f "$target_file"
            print_status "Removed: $target_file"
        fi
        REMOVED=$((REMOVED + 1))
    else
        NOT_FOUND=$((NOT_FOUND + 1))
    fi
done

echo ""
if [ "$DRY_RUN" = "true" ]; then
    print_warning "DRY RUN: Would remove $REMOVED files"
    echo ""
    echo "To actually remove files, run:"
    echo "  ./scripts/utils/organize-python-files.sh false"
else
    print_success "Removed $REMOVED duplicate files"
    print_success "Backup saved to: $BACKUP_DIR"
fi

echo ""
print_success "✅ Organization complete!"
echo ""
echo "📊 Summary:"
echo "   Files analyzed: $(grep -c 'Python files' /tmp/python_analysis.txt 2>/dev/null || echo 'N/A')"
echo "   Duplicates found: $(grep -c 'Duplicate Group' /tmp/python_analysis.txt 2>/dev/null || echo 'N/A')"
echo "   Files removed: $REMOVED"
echo ""

