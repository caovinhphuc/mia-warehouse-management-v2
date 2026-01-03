#!/bin/bash

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo "╔════════════════════════════════════════════════════════════╗"
echo "║        TEST HỆ THỐNG REACT OAS INTEGRATION               ║"
echo "╚════════════════════════════════════════════════════════════╝"
echo ""

# Test Backend
echo -e "${BLUE}1. Testing Backend (Port 3001)...${NC}"
if curl -s http://localhost:3001/health > /dev/null; then
    echo -e "${GREEN}   ✅ Backend: OK${NC}"
    curl -s http://localhost:3001/health | python3 -m json.tool 2>/dev/null | head -5
else
    echo -e "${RED}   ❌ Backend: FAILED${NC}"
fi
echo ""

# Test AI Service
echo -e "${BLUE}2. Testing AI Service (Port 8000)...${NC}"
if curl -s http://localhost:8000/health > /dev/null; then
    echo -e "${GREEN}   ✅ AI Service: OK${NC}"
    curl -s http://localhost:8000/health | python3 -m json.tool 2>/dev/null | head -5
else
    echo -e "${RED}   ❌ AI Service: FAILED${NC}"
fi
echo ""

# Test Google Backend
echo -e "${BLUE}3. Testing Google Backend (Port 3003)...${NC}"
if curl -s http://localhost:3003/api/health > /dev/null; then
    echo -e "${GREEN}   ✅ Google Backend: OK${NC}"
    curl -s http://localhost:3003/api/health | python3 -m json.tool 2>/dev/null | head -5
else
    echo -e "${RED}   ❌ Google Backend: FAILED${NC}"
fi
echo ""

# Test Google Frontend
echo -e "${BLUE}4. Testing Google Frontend (Port 3002)...${NC}"
if curl -s http://localhost:3002 > /dev/null; then
    echo -e "${GREEN}   ✅ Google Frontend: OK${NC}"
else
    echo -e "${YELLOW}   ⚠️  Google Frontend: Not running (optional)${NC}"
fi
echo ""

# Test WebSocket
echo -e "${BLUE}5. Testing WebSocket Connection...${NC}"
if node test_websocket.js 2>&1 | grep -q "kết nối thành công"; then
    echo -e "${GREEN}   ✅ WebSocket: OK${NC}"
else
    echo -e "${YELLOW}   ⚠️  WebSocket: Test manually${NC}"
fi
echo ""

echo "╔════════════════════════════════════════════════════════════╗"
echo "║                    TỔNG KẾT                                ║"
echo "╚════════════════════════════════════════════════════════════╝"
echo ""
echo "📋 URLs để truy cập:"
echo "   🌐 Google Sheets Frontend: http://localhost:3002"
echo "   📊 Backend API: http://localhost:3001"
echo "   🤖 AI Service: http://localhost:8000"
echo "   📚 AI API Docs: http://localhost:8000/docs"
echo "   📋 Google Backend API: http://localhost:3003"
echo ""
