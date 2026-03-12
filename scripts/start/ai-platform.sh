#!/bin/bash

# 🧠 React OAS Integration v3.0 - AI-Powered Platform Deployment Script
# This script starts all services for the complete AI integration

echo "🚀 Starting React OAS Integration v3.0 - AI-Powered Platform..."
echo ""

# Colors for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Function to check if port is in use
check_port() {
    if lsof -Pi :$1 -sTCP:LISTEN -t >/dev/null ; then
        echo -e "${YELLOW}⚠️  Port $1 is already in use${NC}"
        return 1
    else
        echo -e "${GREEN}✅ Port $1 is available${NC}"
        return 0
    fi
}

# Function to wait for service to be ready
wait_for_service() {
    local url=$1
    local service_name=$2
    local max_attempts=30
    local attempt=1

    echo "⏳ Waiting for $service_name to be ready..."

    while [ $attempt -le $max_attempts ]; do
        if curl -s $url > /dev/null 2>&1; then
            echo -e "${GREEN}✅ $service_name is ready!${NC}"
            return 0
        fi

        echo "   Attempt $attempt/$max_attempts..."
        sleep 2
        ((attempt++))
    done

    echo -e "${RED}❌ $service_name failed to start${NC}"
    return 1
}

echo "🔍 Checking system requirements..."

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo -e "${RED}❌ Node.js is not installed${NC}"
    exit 1
fi

# Check if Python3 is installed
if ! command -v python3 &> /dev/null; then
    echo -e "${RED}❌ Python3 is not installed${NC}"
    exit 1
fi

echo -e "${GREEN}✅ System requirements met${NC}"
echo ""

echo "🌐 Checking port availability..."
check_port 8080  # Frontend
check_port 3001  # Backend
check_port 8000  # AI Service
echo ""

echo "🚀 Starting all services..."
echo ""

# Start Backend WebSocket Server (Port 3001)
echo -e "${BLUE}📊 Starting Backend WebSocket Server...${NC}"
cd backend
if [ ! -d "node_modules" ]; then
    echo "📦 Installing backend dependencies..."
    npm install
fi

nohup node server.js > ../logs/backend.log 2>&1 &
BACKEND_PID=$!
echo "Backend PID: $BACKEND_PID"
cd ..

# Start AI/ML Service (Port 8000)
echo -e "${BLUE}🧠 Starting AI/ML Service...${NC}"
cd ai-service

# Use existing virtual environment
source ../ai-venv/bin/activate

nohup python3 -m uvicorn main_simple:app --host 0.0.0.0 --port 8000 > ../logs/ai-service.log 2>&1 &
AI_PID=$!
echo "AI Service PID: $AI_PID"
cd ..

# Build Frontend if needed
echo -e "${BLUE}🔨 Preparing Frontend Build...${NC}"
if [ ! -d "build" ] || [ ! -f "build/index.html" ]; then
    echo "📦 Building frontend with AI integration..."
    npm run build
fi

# Start Frontend Server (Port 8080)
echo -e "${BLUE}🌐 Starting Frontend Server...${NC}"
nohup serve build -l 8080 > logs/frontend.log 2>&1 &
FRONTEND_PID=$!
echo "Frontend PID: $FRONTEND_PID"

echo ""
echo "⏳ Waiting for all services to be ready..."

# Wait for services to be ready
wait_for_service "http://localhost:3001/health" "Backend API"
wait_for_service "http://localhost:8000/health" "AI/ML Service"
wait_for_service "http://localhost:8080" "Frontend App"

echo ""
echo "🎉 All services are now running!"
echo ""
echo -e "${GREEN}📊 System Status:${NC}"
echo "┌─────────────────────────────────────────────────────────────┐"
echo "│                   🚀 REACT OAS INTEGRATION v3.0            │"
echo "│                     AI-POWERED PLATFORM                    │"
echo "├─────────────────────────────────────────────────────────────┤"
echo "│ 🌐 Frontend:     http://localhost:8080                     │"
echo "│ 📊 Backend:      http://localhost:3001                     │"
echo "│ 🧠 AI Service:   http://localhost:8000                     │"
echo "├─────────────────────────────────────────────────────────────┤"
echo "│ 🏠 Home Dashboard                                           │"
echo "│ 📈 Live Dashboard  (Real-time WebSocket)                   │"
echo "│ 🧠 AI Analytics   (Predictive Intelligence)                │"
echo "└─────────────────────────────────────────────────────────────┘"
echo ""
echo -e "${BLUE}🔗 Quick Links:${NC}"
echo "   • Main App:      http://localhost:8080"
echo "   • Live Dashboard: http://localhost:8080 (Click 'Live Dashboard')"
echo "   • AI Analytics:   http://localhost:8080 (Click 'AI Analytics')"
echo "   • Backend API:    http://localhost:3001/health"
echo "   • AI Service:     http://localhost:8000/health"
echo ""
echo -e "${YELLOW}📋 Service PIDs (for stopping services):${NC}"
echo "   • Frontend: $FRONTEND_PID"
echo "   • Backend:  $BACKEND_PID"
echo "   • AI Service: $AI_PID"
echo ""
echo -e "${BLUE}📊 To view logs:${NC}"
echo "   tail -f logs/frontend.log"
echo "   tail -f logs/backend.log"
echo "   tail -f logs/ai-service.log"
echo ""
echo -e "${BLUE}🛑 To stop all services:${NC}"
echo "   kill $FRONTEND_PID $BACKEND_PID $AI_PID"
echo ""
echo -e "${GREEN}✅ React OAS Integration v3.0 is now fully operational!${NC}"
echo "🎊 Enjoy your AI-powered analytics platform!"
