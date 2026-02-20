#!/bin/bash
# Check if backend server is running

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

BACKEND_URL=${REACT_APP_API_URL:-"http://localhost:3001"}

echo "🔍 Checking Backend Server..."
echo "=============================="

# Check if backend is running
if curl -s "$BACKEND_URL/health" > /dev/null 2>&1; then
  echo -e "${GREEN}✅ Backend server is running${NC}"
  echo -e "   ${BLUE}URL: $BACKEND_URL${NC}"

  # Get health info
  HEALTH=$(curl -s "$BACKEND_URL/health" 2>/dev/null)
  if [ ! -z "$HEALTH" ]; then
    echo -e "   ${GREEN}Status: OK${NC}"
  fi

  exit 0
else
  echo -e "${RED}❌ Backend server is not running${NC}"
  echo ""
  echo -e "${YELLOW}💡 To start backend server:${NC}"
  echo "   1. cd backend && npm start"
  echo "   2. Or: npm run backend"
  echo "   3. Or: npm run dev (starts all services)"
  echo ""
  exit 1
fi

