#!/bin/bash

# 🔧 Fix Script Paths Script
# Kiểm tra và sửa các paths trong scripts để đảm bảo chúng chạy đúng

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

echo "🔧 Fixing Script Paths..."
echo "=========================="
echo ""

# Check wrapper scripts
print_status "Checking wrapper scripts..."

WRAPPER_SCRIPTS=(
    "start.sh:scripts/start-stop/start-all.sh"
    "stop.sh:scripts/start-stop/stop-all.sh"
    "setup.sh:scripts/setup/main-setup.sh"
    "deploy.sh:scripts/deploy/deploy-main.sh"
    "quick-deploy.sh:scripts/deploy/quick-deploy.sh"
)

for script_pair in "${WRAPPER_SCRIPTS[@]}"; do
    IFS=':' read -r wrapper target <<< "$script_pair"
    
    if [ -f "$wrapper" ]; then
        if grep -q "$target" "$wrapper" 2>/dev/null; then
            print_success "$wrapper → $target"
        else
            print_warning "$wrapper might not point to $target"
        fi
    else
        print_warning "$wrapper not found"
    fi
done

echo ""

# Check scripts in scripts/ directory
print_status "Checking scripts directory structure..."

REQUIRED_DIRS=(
    "scripts/setup"
    "scripts/start-stop"
    "scripts/deploy"
    "scripts/fix"
    "scripts/utils"
    "scripts/git"
    "scripts/tests"
    "scripts/config"
)

for dir in "${REQUIRED_DIRS[@]}"; do
    if [ -d "$dir" ]; then
        print_success "$dir exists"
    else
        print_warning "$dir missing"
        mkdir -p "$dir" && print_info "  → Created $dir"
    fi
done

echo ""

# Check executable permissions
print_status "Checking executable permissions..."

FIXED=0
while IFS= read -r -d '' file; do
    if [ ! -x "$file" ]; then
        chmod +x "$file" 2>/dev/null
        FIXED=$((FIXED + 1))
        print_info "Made executable: $file"
    fi
done < <(find scripts -name "*.sh" -type f -print0)

if [ $FIXED -gt 0 ]; then
    print_success "Fixed $FIXED scripts"
else
    print_success "All scripts are executable"
fi

echo ""
print_success "✅ Path checking complete!"

