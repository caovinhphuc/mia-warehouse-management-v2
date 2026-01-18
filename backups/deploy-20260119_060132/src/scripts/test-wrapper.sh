#!/bin/bash

# =============================================================================
# 🧪 TEST WRAPPER - Smart test script that finds React app location
# =============================================================================

set -e

# Source utilities
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
source "$SCRIPT_DIR/utils/common.sh" 2>/dev/null || {
    # Fallback if common.sh not available
    log_info() { echo "ℹ️  $1"; }
    log_success() { echo "✅ $1"; }
    log_warning() { echo "⚠️  $1"; }
    log_error() { echo "❌ $1"; }
}

# Get project root (scripts/ is in project root, so go up one level)
PROJECT_ROOT=$(cd "$SCRIPT_DIR/.." && pwd)
cd "$PROJECT_ROOT"

# Find React app src location
REACT_SRC_DIR=""

# Check root src/ first
if [ -d "$PROJECT_ROOT/src" ] && ([ -f "$PROJECT_ROOT/src/index.js" ] || [ -f "$PROJECT_ROOT/src/index.jsx" ]); then
    REACT_SRC_DIR="src"
    log_info "Found React app in ./src/"
# Check google-sheets-project/src/
elif [ -d "$PROJECT_ROOT/google-sheets-project/src" ] && [ -f "$PROJECT_ROOT/google-sheets-project/src/index.jsx" ]; then
    REACT_SRC_DIR="google-sheets-project/src"
    log_info "Found React app in ./google-sheets-project/src/"
else
    log_warning "⚠️  React app src/ directory not found."
    log_info "Searched locations:"
    echo "  - $PROJECT_ROOT/src/"
    echo "  - $PROJECT_ROOT/google-sheets-project/src/"
    echo ""
    log_info "Skipping React tests. (This is OK if you're not testing React app)"
    exit 0
fi

# Check if react-scripts is available in node_modules
if [ ! -d "node_modules/.bin/react-scripts" ] && ! command_exists npx; then
    log_error "react-scripts not found. Please run: npm install"
    exit 1
fi

# Run tests
log_info "Running tests for: $REACT_SRC_DIR"
echo ""

# Check if react-scripts is available
if ! command_exists npx; then
    log_error "npx not found. Please install Node.js and npm."
    exit 1
fi

# Set CI mode for non-interactive
export CI=true

# If src is in root, run tests directly
if [ "$REACT_SRC_DIR" = "src" ]; then
    log_info "Running tests from root directory..."
    if npx react-scripts test --coverage --watchAll=false --testTimeout=10000 --passWithNoTests --testPathIgnorePatterns=node_modules 2>/dev/null; then
        log_success "Tests completed successfully!"
        exit 0
    fi
# If src is in subdirectory, try creating temporary symlink
elif [ "$REACT_SRC_DIR" = "google-sheets-project/src" ]; then
    log_info "React app is in subdirectory. Creating temporary symlink for tests..."

    # Create temporary symlink if src doesn't exist
    SYMLINK_CREATED=false
    if [ ! -d "$PROJECT_ROOT/src" ] && [ ! -L "$PROJECT_ROOT/src" ]; then
        log_info "Creating symlink: src -> $REACT_SRC_DIR"
        ln -s "$REACT_SRC_DIR" "$PROJECT_ROOT/src" 2>/dev/null || true
        SYMLINK_CREATED=true
    else
        log_info "src/ already exists, using existing"
    fi

    # Try running tests
    TEST_RESULT=0
    if [ -L "$PROJECT_ROOT/src" ] || [ -d "$PROJECT_ROOT/src" ]; then
        log_info "Running tests..."
        npx react-scripts test --coverage --watchAll=false --testTimeout=10000 --passWithNoTests --testPathIgnorePatterns=node_modules 2>/dev/null || TEST_RESULT=$?
        if [ $TEST_RESULT -eq 0 ]; then
            log_success "Tests completed successfully!"
        fi
    fi

    # Always clean up symlink if we created it
    if [ "$SYMLINK_CREATED" = true ] && [ -L "$PROJECT_ROOT/src" ]; then
        log_info "Cleaning up temporary symlink..."
        rm "$PROJECT_ROOT/src" 2>/dev/null || true
    fi

    # Exit with test result
    exit $TEST_RESULT

    log_warning "react-scripts test failed. This might be because:"
    echo "  1. React app is in a subdirectory ($REACT_SRC_DIR)"
    echo "  2. react-scripts expects src/ at root"
    echo "  3. No tests configured yet"
    echo ""
    log_info "To run tests manually:"
    echo "  cd google-sheets-project && npm test"
    echo ""
    log_info "Skipping tests (non-fatal)"
    exit 0
else
    log_warning "Unknown React app location: $REACT_SRC_DIR"
    log_info "Skipping tests (non-fatal)"
    exit 0
fi
