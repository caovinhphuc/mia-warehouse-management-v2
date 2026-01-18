#!/bin/bash

# =============================================================================
# 🧹 CLEAN SCRIPT - Clean cache, node_modules, build files
# =============================================================================

set -e

# Source utilities
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
source "$SCRIPT_DIR/common.sh"

# Get project root
PROJECT_ROOT=$(get_project_root)
cd "$PROJECT_ROOT"

# Parse arguments
CLEAN_ALL=false
CLEAN_CACHE=false
CLEAN_MODULES=false
CLEAN_BUILD=false
CLEAN_VENV=false

show_usage() {
    echo "Usage: $0 [OPTIONS]"
    echo ""
    echo "Options:"
    echo "  --all        Clean everything (cache, modules, build, venv)"
    echo "  --cache      Clean npm and pip cache"
    echo "  --modules    Clean node_modules and lock files"
    echo "  --build      Clean build directories"
    echo "  --venv       Clean Python virtual environments"
    echo "  --help       Show this help message"
    echo ""
}

if [ $# -eq 0 ]; then
    CLEAN_ALL=true
fi

while [[ $# -gt 0 ]]; do
    case $1 in
        --all)
            CLEAN_ALL=true
            shift
            ;;
        --cache)
            CLEAN_CACHE=true
            shift
            ;;
        --modules)
            CLEAN_MODULES=true
            shift
            ;;
        --build)
            CLEAN_BUILD=true
            shift
            ;;
        --venv)
            CLEAN_VENV=true
            shift
            ;;
        --help)
            show_usage
            exit 0
            ;;
        *)
            log_error "Unknown option: $1"
            show_usage
            exit 1
            ;;
    esac
done

print_banner "CLEAN PROJECT" "v1.0"

# Clean cache
if [ "$CLEAN_ALL" = true ] || [ "$CLEAN_CACHE" = true ]; then
    log_step "XÓA CACHE"

    # npm cache
    if command_exists npm; then
        log_info "Xóa npm cache..."
        npm cache clean --force 2>/dev/null || true
        log_success "npm cache đã được xóa"
    fi

    # pip cache
    if command_exists pip3; then
        log_info "Xóa pip cache..."
        pip3 cache purge 2>/dev/null || true
        log_success "pip cache đã được xóa"
    fi

    echo ""
fi

# Clean modules
if [ "$CLEAN_ALL" = true ] || [ "$CLEAN_MODULES" = true ]; then
    log_step "XÓA NODE_MODULES VÀ LOCK FILES"

    log_info "Xóa node_modules..."
    find . -name "node_modules" -type d -prune -exec rm -rf {} + 2>/dev/null || true
    log_success "node_modules đã được xóa"

    log_info "Xóa lock files..."
    find . -name "package-lock.json" -type f -delete 2>/dev/null || true
    find . -name "yarn.lock" -type f -delete 2>/dev/null || true
    log_success "Lock files đã được xóa"

    echo ""
fi

# Clean build
if [ "$CLEAN_ALL" = true ] || [ "$CLEAN_BUILD" = true ]; then
    log_step "XÓA BUILD FOLDERS"

    log_info "Xóa build directories..."
    rm -rf build dist .next out coverage 2>/dev/null || true
    rm -rf backend/build frontend/build 2>/dev/null || true
    log_success "Build folders đã được xóa"

    echo ""
fi

# Clean venv
if [ "$CLEAN_ALL" = true ] || [ "$CLEAN_VENV" = true ]; then
    log_step "XÓA PYTHON VIRTUAL ENVIRONMENTS"

    log_info "Xóa Python virtual environments..."
    if [ -d "automation/venv" ]; then
        rm -rf automation/venv
        log_success "automation/venv đã được xóa"
    fi
    if [ -d "ai-service/venv" ]; then
        rm -rf ai-service/venv
        log_success "ai-service/venv đã được xóa"
    fi
    if [ -d "venv" ]; then
        rm -rf venv
        log_success "venv đã được xóa"
    fi

    # Clean Python cache
    log_info "Xóa Python cache..."
    find . -type d -name "__pycache__" -exec rm -r {} + 2>/dev/null || true
    find . -type f -name "*.pyc" -delete 2>/dev/null || true
    find . -type f -name "*.pyo" -delete 2>/dev/null || true
    log_success "Python cache đã được xóa"

    echo ""
fi

log_success "Clean hoàn tất!"
echo ""

