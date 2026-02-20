#!/bin/bash

# =============================================================================
# Serve Production Build - Quick Server Script
# =============================================================================

set -e

# Colors
readonly GREEN='\033[0;32m'
readonly BLUE='\033[0;34m'
readonly YELLOW='\033[1;33m'
readonly CYAN='\033[0;36m'
readonly NC='\033[0m'

# Configuration
PORT=${1:-3000}
BUILD_DIR=${2:-"$HOME/Sites/mia-vn-integration"}

# Check if build directory exists
if [[ ! -d "$BUILD_DIR" ]]; then
    echo -e "${YELLOW}⚠️  Build directory not found: $BUILD_DIR${NC}"
    echo -e "${BLUE}💡 Run deployment first:${NC}"
    echo -e "   ./deploy-production.sh"
    exit 1
fi

echo -e "${CYAN}╔══════════════════════════════════════════════════════════════╗${NC}"
echo -e "${CYAN}║           🚀 Serving Production Build                      ║${NC}"
echo -e "${CYAN}╚══════════════════════════════════════════════════════════════╝${NC}"
echo ""
echo -e "${BLUE}📁 Build directory:${NC} $BUILD_DIR"
echo -e "${BLUE}🌐 Port:${NC} $PORT"
echo ""

# Try different serving methods
if command -v npx &> /dev/null; then
    echo -e "${GREEN}✅ Using npx serve${NC}"
    echo -e "${BLUE}🌐 Access at:${NC} ${CYAN}http://localhost:$PORT${NC}"
    echo ""
    npx serve -s "$BUILD_DIR" -p "$PORT"
elif command -v python3 &> /dev/null; then
    echo -e "${GREEN}✅ Using Python HTTP server${NC}"
    echo -e "${BLUE}🌐 Access at:${NC} ${CYAN}http://localhost:$PORT${NC}"
    echo ""
    cd "$BUILD_DIR"
    python3 -m http.server "$PORT"
elif command -v python &> /dev/null; then
    echo -e "${GREEN}✅ Using Python HTTP server${NC}"
    echo -e "${BLUE}🌐 Access at:${NC} ${CYAN}http://localhost:$PORT${NC}"
    echo ""
    cd "$BUILD_DIR"
    python -m SimpleHTTPServer "$PORT"
else
    echo -e "${YELLOW}⚠️  No server tool found${NC}"
    echo -e "${BLUE}💡 Install serve:${NC}"
    echo -e "   npm install -g serve"
    echo ""
    echo -e "${BLUE}💡 Or open directly in browser:${NC}"
    echo -e "   open file://$BUILD_DIR/index.html"
    exit 1
fi

