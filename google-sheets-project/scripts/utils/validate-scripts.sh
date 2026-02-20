#!/bin/bash

# ✅ Validate All Scripts
# Kiểm tra và validate tất cả scripts để đảm bảo chúng hoạt động đúng

# Get script directory and change to project root
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "$SCRIPT_DIR/../.." && pwd)"
cd "$PROJECT_ROOT"

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
RED='\033[0;31m'
CYAN='\033[0;36m'
NC='\033[0m'

print_header() {
    echo -e "${CYAN}================================================================================${NC}"
    echo -e "${CYAN}✅ Scripts Validation Report${NC}"
    echo -e "${CYAN}================================================================================${NC}"
    echo ""
}

print_section() {
    echo -e "${BLUE}📋 $1${NC}"
    echo -e "${BLUE}--------------------------------------------------------------------------------${NC}"
}

print_success() {
    echo -e "${GREEN}✅${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}⚠️${NC} $1"
}

print_error() {
    echo -e "${RED}❌${NC} $1"
}

print_info() {
    echo -e "${BLUE}ℹ️${NC} $1"
}

print_header

# Test 1: Wrapper Scripts
print_section "Wrapper Scripts (Root Level)"

WRAPPER_SCRIPTS=(
    "start.sh"
    "stop.sh"
    "setup.sh"
    "deploy.sh"
    "quick-deploy.sh"
)

WRAPPER_PASSED=0
WRAPPER_FAILED=0

for script in "${WRAPPER_SCRIPTS[@]}"; do
    if [ -f "$script" ]; then
        if bash -n "$script" 2>/dev/null; then
            if [ -x "$script" ]; then
                print_success "$script - Valid"
                WRAPPER_PASSED=$((WRAPPER_PASSED + 1))
            else
                chmod +x "$script"
                print_warning "$script - Made executable"
                WRAPPER_PASSED=$((WRAPPER_PASSED + 1))
            fi
        else
            print_error "$script - Syntax error"
            WRAPPER_FAILED=$((WRAPPER_FAILED + 1))
        fi
    else
        print_warning "$script - Not found"
    fi
done

echo ""

# Test 2: Core Scripts
print_section "Core Scripts (scripts/)"

CORE_SCRIPTS=(
    "scripts/start-stop/start-all.sh"
    "scripts/start-stop/stop-all.sh"
    "scripts/setup/main-setup.sh"
    "scripts/deploy/deploy-main.sh"
    "scripts/deploy/quick-deploy.sh"
)

CORE_PASSED=0
CORE_FAILED=0

for script in "${CORE_SCRIPTS[@]}"; do
    if [ -f "$script" ]; then
        if bash -n "$script" 2>/dev/null; then
            if [ -x "$script" ]; then
                print_success "$(basename "$script") - Valid"
                CORE_PASSED=$((CORE_PASSED + 1))
            else
                chmod +x "$script"
                print_warning "$(basename "$script") - Made executable"
                CORE_PASSED=$((CORE_PASSED + 1))
            fi
        else
            print_error "$(basename "$script") - Syntax error"
            CORE_FAILED=$((CORE_FAILED + 1))
        fi
    else
        print_warning "$(basename "$script") - Not found"
    fi
done

echo ""

# Test 3: Utility Scripts
print_section "Utility Scripts (scripts/utils/)"

UTIL_SCRIPTS=(
    "scripts/utils/organize-reports.sh"
    "scripts/utils/cleanup-python-duplicates.sh"
    "scripts/utils/organize-js-files.sh"
    "scripts/utils/generate-complete-docs.js"
    "scripts/utils/analyze-python-files.py"
)

UTIL_PASSED=0
UTIL_FAILED=0

for script in "${UTIL_SCRIPTS[@]}"; do
    if [ -f "$script" ]; then
        filename=$(basename "$script")
        ext="${filename##*.}"
        
        if [ "$ext" = "sh" ]; then
            if bash -n "$script" 2>/dev/null; then
                print_success "$filename - Valid"
                UTIL_PASSED=$((UTIL_PASSED + 1))
            else
                print_error "$filename - Syntax error"
                UTIL_FAILED=$((UTIL_FAILED + 1))
            fi
        elif [ "$ext" = "py" ]; then
            if python3 -m py_compile "$script" 2>/dev/null; then
                print_success "$filename - Valid"
                UTIL_PASSED=$((UTIL_PASSED + 1))
                rm -f "${script}c" 2>/dev/null
            else
                print_error "$filename - Syntax error"
                UTIL_FAILED=$((UTIL_FAILED + 1))
            fi
        elif [ "$ext" = "js" ]; then
            if node --check "$script" 2>/dev/null; then
                print_success "$filename - Valid"
                UTIL_PASSED=$((UTIL_PASSED + 1))
            else
                print_error "$filename - Syntax error"
                UTIL_FAILED=$((UTIL_FAILED + 1))
            fi
        fi
    else
        print_warning "$(basename "$script") - Not found"
    fi
done

echo ""

# Test 4: Python Scripts
print_section "Python Scripts (Key Files)"

PYTHON_SCRIPTS=(
    "scripts/utils/analyze-python-files.py"
)

PYTHON_PASSED=0
PYTHON_FAILED=0

for script in "${PYTHON_SCRIPTS[@]}"; do
    if [ -f "$script" ]; then
        if python3 -m py_compile "$script" 2>/dev/null; then
            print_success "$(basename "$script") - Valid"
            PYTHON_PASSED=$((PYTHON_PASSED + 1))
            rm -f "${script}c" 2>/dev/null
        else
            print_error "$(basename "$script") - Syntax error"
            PYTHON_FAILED=$((PYTHON_FAILED + 1))
        fi
    fi
done

echo ""

# Summary
echo -e "${CYAN}================================================================================${NC}"
echo -e "${CYAN}📊 Summary${NC}"
echo -e "${CYAN}================================================================================${NC}"
echo ""

TOTAL_PASSED=$((WRAPPER_PASSED + CORE_PASSED + UTIL_PASSED + PYTHON_PASSED))
TOTAL_FAILED=$((WRAPPER_FAILED + CORE_FAILED + UTIL_FAILED + PYTHON_FAILED))

echo -e "${BLUE}Wrapper Scripts:${NC} ✅ $WRAPPER_PASSED / ❌ $WRAPPER_FAILED"
echo -e "${BLUE}Core Scripts:${NC} ✅ $CORE_PASSED / ❌ $CORE_FAILED"
echo -e "${BLUE}Utility Scripts:${NC} ✅ $UTIL_PASSED / ❌ $UTIL_FAILED"
echo -e "${BLUE}Python Scripts:${NC} ✅ $PYTHON_PASSED / ❌ $PYTHON_FAILED"
echo ""

if [ $TOTAL_FAILED -eq 0 ]; then
    echo -e "${GREEN}✅ All key scripts are valid!${NC}"
    exit 0
else
    echo -e "${RED}❌ Some scripts have errors. Please review and fix them.${NC}"
    exit 1
fi

