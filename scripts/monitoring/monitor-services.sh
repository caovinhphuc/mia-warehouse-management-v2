#!/bin/bash

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

echo "📊 MONITORING SERVICES"
echo "======================"
echo ""

while true; do
  clear
  echo "📊 Services Status - $(date '+%Y-%m-%d %H:%M:%S')"
  echo "=========================="
  echo ""
  
  # Backend
  if curl -s http://localhost:3001/health > /dev/null 2>&1; then
    echo -e "✅ Backend (3001): ${GREEN}OK${NC}"
  else
    echo -e "❌ Backend (3001): ${RED}FAILED${NC}"
  fi
  
  # AI Service
  if curl -s http://localhost:8000/health > /dev/null 2>&1; then
    echo -e "✅ AI Service (8000): ${GREEN}OK${NC}"
  else
    echo -e "❌ AI Service (8000): ${RED}FAILED${NC}"
  fi
  
  # Google Backend
  if curl -s http://localhost:3003/api/health > /dev/null 2>&1; then
    echo -e "✅ Google Backend (3003): ${GREEN}OK${NC}"
  else
    echo -e "❌ Google Backend (3003): ${RED}FAILED${NC}"
  fi
  
  # Google Frontend
  if curl -s http://localhost:3002 > /dev/null 2>&1; then
    echo -e "✅ Google Frontend (3002): ${GREEN}OK${NC}"
  else
    echo -e "⚠️  Google Frontend (3002): ${YELLOW}Not Running${NC}"
  fi
  
  # Main Frontend
  if curl -s http://localhost:3000 > /dev/null 2>&1; then
    echo -e "✅ Main Frontend (3000): ${GREEN}OK${NC}"
  else
    echo -e "⚠️  Main Frontend (3000): ${YELLOW}Not Running${NC}"
  fi
  
  echo ""
  echo "Press Ctrl+C to stop"
  sleep 5
done
