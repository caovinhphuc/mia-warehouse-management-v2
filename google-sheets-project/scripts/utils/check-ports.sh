#!/bin/bash
# Check port availability and show status

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
NC='\033[0m'

echo -e "${CYAN}🔍 Checking Port Status${NC}"
echo "========================"
echo ""

PORTS="3000 3001 8000 8001"
ALL_FREE=true

for PORT in $PORTS; do
  PIDS=$(lsof -ti:$PORT 2>/dev/null)

  if [ -z "$PIDS" ]; then
    echo -e "${GREEN}✅ Port $PORT: FREE${NC}"
  else
    ALL_FREE=false
    echo -e "${YELLOW}⚠️  Port $PORT: IN USE${NC}"

    for PID in $PIDS; do
      PROCESS=$(ps -p $PID -o command= 2>/dev/null)
      PROCESS_NAME=$(echo "$PROCESS" | awk '{print $1}' | xargs basename 2>/dev/null || echo "Unknown")

      # Check if it's a development server
      if echo "$PROCESS" | grep -qE "(react-scripts|node.*server|npm.*start|uvicorn|python.*main)"; then
        echo -e "   ${RED}  └─ PID $PID: $PROCESS_NAME (Dev Server - can be killed)${NC}"
      elif echo "$PROCESS" | grep -qE "(Chrome|Safari|Firefox|Browser)"; then
        echo -e "   ${BLUE}  └─ PID $PID: $PROCESS_NAME (Browser - safe to ignore)${NC}"
      else
        echo -e "   ${YELLOW}  └─ PID $PID: $PROCESS_NAME${NC}"
      fi

      # Show first 80 chars of command
      CMD_PREVIEW=$(echo "$PROCESS" | cut -c1-80)
      echo -e "      ${CYAN}$CMD_PREVIEW...${NC}"
    done
    echo ""
  fi
done

echo "========================"
if [ "$ALL_FREE" = true ]; then
  echo -e "${GREEN}✅ All ports are free!${NC}"
  exit 0
else
  echo -e "${YELLOW}⚠️  Some ports are in use${NC}"
  echo ""
  echo "To fix port conflicts, run:"
  echo -e "  ${CYAN}npm run fix:ports${NC}"
  echo "  or"
  echo -e "  ${CYAN}bash scripts/fix-port-conflict.sh${NC}"
  exit 1
fi

