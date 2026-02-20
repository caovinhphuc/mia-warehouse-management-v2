#!/bin/bash

# 🛑 React OAS Integration v4.0 - Stop All Services
# Stop Frontend, Backend, AI Service, and Automation

# Get script directory and change to project root
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "$SCRIPT_DIR/../.." && pwd)"
cd "$PROJECT_ROOT"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

# Function to kill process on port
kill_port() {
    local port=$1
    local pids=$(lsof -ti:$port 2>/dev/null)
    if [ ! -z "$pids" ]; then
        print_status "Stopping processes on port $port..."
        echo "$pids" | xargs kill -9 2>/dev/null || true
        sleep 1
        print_success "Port $port cleared ✅"
    else
        print_status "Port $port is already free"
    fi
}

# Function to kill by process name
kill_by_name() {
    local pattern=$1
    local name=$2
    pkill -f "$pattern" 2>/dev/null && print_success "$name stopped ✅" || print_status "$name not running"
}

echo "🛑 React OAS Integration v4.0 - Stopping All Services"
echo "================================================="
echo ""

# Stop services from PID files (if exist)
if [ -f "logs/frontend.pid" ]; then
    PID=$(cat logs/frontend.pid)
    kill $PID 2>/dev/null || true
    rm -f logs/frontend.pid
    print_success "Frontend stopped (from PID file)"
fi

if [ -f "logs/backend.pid" ]; then
    PID=$(cat logs/backend.pid)
    kill $PID 2>/dev/null || true
    rm -f logs/backend.pid
    print_success "Backend stopped (from PID file)"
fi

if [ -f "logs/ai-service.pid" ]; then
    PID=$(cat logs/ai-service.pid)
    kill $PID 2>/dev/null || true
    rm -f logs/ai-service.pid
    print_success "AI Service stopped (from PID file)"
fi

if [ -f "logs/automation.pid" ]; then
    PID=$(cat logs/automation.pid)
    kill $PID 2>/dev/null || true
    rm -f logs/automation.pid
    print_success "Automation stopped (from PID file)"
fi

# Kill by process name
print_status "Killing processes by name..."
kill_by_name "react-scripts start" "Frontend"
kill_by_name "node.*server.js" "Backend"
kill_by_name "uvicorn.*main" "AI Service"
kill_by_name "python.*main.py" "Automation"

# Kill by ports
print_status "Killing processes on ports..."
kill_port 3000  # Frontend
kill_port 3001  # Backend
kill_port 8000  # AI Service
kill_port 8001  # Automation

sleep 2

# Verify all ports are free
print_status "Verifying all ports are free..."
ALL_FREE=true
for PORT in 3000 3001 8000 8001; do
    if lsof -ti:$PORT >/dev/null 2>&1; then
        print_warning "Port $PORT still in use"
        ALL_FREE=false
    fi
done

if [ "$ALL_FREE" = true ]; then
    print_success "🎯 All services stopped successfully!"
else
    print_warning "Some ports may still be in use. Check manually with: lsof -i :PORT"
fi

echo ""
