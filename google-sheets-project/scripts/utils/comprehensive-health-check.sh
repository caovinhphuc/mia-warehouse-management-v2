#!/bin/bash

# 🏥 Comprehensive Health Check Script
# Kiểm tra tất cả services: Frontend, Backend, AI Service, Ports, Dependencies

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
    echo -e "${CYAN}🏥 Comprehensive Health Check${NC}"
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

# Counters
TOTAL_CHECKS=0
PASSED_CHECKS=0
FAILED_CHECKS=0
WARNING_CHECKS=0

check_service() {
    local name=$1
    local url=$2
    local port=$3
    
    TOTAL_CHECKS=$((TOTAL_CHECKS + 1))
    
    if command -v curl >/dev/null 2>&1; then
        if curl -f -s "$url" >/dev/null 2>&1; then
            print_success "$name (Port $port): Running"
            PASSED_CHECKS=$((PASSED_CHECKS + 1))
            return 0
        else
            print_error "$name (Port $port): Not running"
            FAILED_CHECKS=$((FAILED_CHECKS + 1))
            return 1
        fi
    else
        # Fallback: check if port is listening
        if lsof -Pi :$port -sTCP:LISTEN -t >/dev/null 2>&1; then
            print_success "$name (Port $port): Port in use"
            PASSED_CHECKS=$((PASSED_CHECKS + 1))
            return 0
        else
            print_error "$name (Port $port): Not running"
            FAILED_CHECKS=$((FAILED_CHECKS + 1))
            return 1
        fi
    fi
}

check_port() {
    local port=$1
    local name=$2
    
    TOTAL_CHECKS=$((TOTAL_CHECKS + 1))
    
    if lsof -Pi :$port -sTCP:LISTEN -t >/dev/null 2>&1; then
        local pid=$(lsof -Pi :$port -sTCP:LISTEN -t | head -1)
        print_success "$name (Port $port): In use (PID: $pid)"
        PASSED_CHECKS=$((PASSED_CHECKS + 1))
        return 0
    else
        print_warning "$name (Port $port): Available"
        WARNING_CHECKS=$((WARNING_CHECKS + 1))
        return 1
    fi
}

check_command() {
    local cmd=$1
    local name=$2
    
    TOTAL_CHECKS=$((TOTAL_CHECKS + 1))
    
    if command -v "$cmd" >/dev/null 2>&1; then
        local version=$($cmd --version 2>/dev/null | head -1 || echo "installed")
        print_success "$name: $version"
        PASSED_CHECKS=$((PASSED_CHECKS + 1))
        return 0
    else
        print_error "$name: Not installed"
        FAILED_CHECKS=$((FAILED_CHECKS + 1))
        return 1
    fi
}

check_directory() {
    local dir=$1
    local name=$2
    
    TOTAL_CHECKS=$((TOTAL_CHECKS + 1))
    
    if [ -d "$dir" ]; then
        print_success "$name: Exists"
        PASSED_CHECKS=$((PASSED_CHECKS + 1))
        return 0
    else
        print_error "$name: Not found"
        FAILED_CHECKS=$((FAILED_CHECKS + 1))
        return 1
    fi
}

check_file() {
    local file=$1
    local name=$2
    
    TOTAL_CHECKS=$((TOTAL_CHECKS + 1))
    
    if [ -f "$file" ]; then
        print_success "$name: Exists"
        PASSED_CHECKS=$((PASSED_CHECKS + 1))
        return 0
    else
        print_warning "$name: Not found"
        WARNING_CHECKS=$((WARNING_CHECKS + 1))
        return 1
    fi
}

print_header

# 1. Check Dependencies
print_section "Dependencies"

check_command "node" "Node.js"
check_command "npm" "npm"
check_command "python3" "Python 3"
check_command "git" "Git"

echo ""

# 2. Check Project Structure
print_section "Project Structure"

check_directory "src" "Frontend source"
check_directory "backend" "Backend directory"
check_directory "ai-service" "AI Service directory"
check_directory "automation" "Automation directory"
check_file "package.json" "package.json"
check_file "backend/package.json" "Backend package.json"

echo ""

# 3. Check Ports
print_section "Port Availability"

check_port 3000 "Frontend"
check_port 3001 "Backend"
check_port 8000 "AI Service"
check_port 8001 "Automation Service"

echo ""

# 4. Check Services
print_section "Service Health"

check_service "Frontend" "http://localhost:3000" 3000
check_service "Backend API" "http://localhost:3001/health" 3001
check_service "AI Service" "http://localhost:8000/health" 8000
check_service "Automation Service" "http://localhost:8001/health" 8001

echo ""

# 5. Check Environment
print_section "Environment Variables"

TOTAL_CHECKS=$((TOTAL_CHECKS + 1))
if [ -f ".env" ]; then
    print_success ".env file: Exists"
    PASSED_CHECKS=$((PASSED_CHECKS + 1))
    
    # Check key variables
    if grep -q "REACT_APP_GOOGLE_SHEET_ID" .env 2>/dev/null; then
        print_success "Google Sheets ID: Configured"
    else
        print_warning "Google Sheets ID: Not configured"
        WARNING_CHECKS=$((WARNING_CHECKS + 1))
    fi
else
    print_warning ".env file: Not found"
    WARNING_CHECKS=$((WARNING_CHECKS + 1))
fi

echo ""

# 6. Check Build
print_section "Build Status"

check_directory "build" "Frontend build"
check_file "backend/node_modules/.bin/node" "Backend dependencies" || check_directory "backend/node_modules" "Backend node_modules"

echo ""

# Summary
echo -e "${CYAN}================================================================================${NC}"
echo -e "${CYAN}📊 Summary${NC}"
echo -e "${CYAN}================================================================================${NC}"
echo ""

echo -e "${BLUE}Total Checks:${NC} $TOTAL_CHECKS"
echo -e "${GREEN}✅ Passed:${NC} $PASSED_CHECKS"
if [ $WARNING_CHECKS -gt 0 ]; then
    echo -e "${YELLOW}⚠️  Warnings:${NC} $WARNING_CHECKS"
fi
if [ $FAILED_CHECKS -gt 0 ]; then
    echo -e "${RED}❌ Failed:${NC} $FAILED_CHECKS"
fi

echo ""

# Overall status
if [ $FAILED_CHECKS -eq 0 ] && [ $WARNING_CHECKS -eq 0 ]; then
    echo -e "${GREEN}✅ All systems operational!${NC}"
    exit 0
elif [ $FAILED_CHECKS -eq 0 ]; then
    echo -e "${YELLOW}⚠️  System operational with warnings${NC}"
    exit 0
else
    echo -e "${RED}❌ Some systems are down. Please check failed services.${NC}"
    exit 1
fi

