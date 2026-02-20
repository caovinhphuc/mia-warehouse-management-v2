#!/bin/bash
# Kill processes running on specified port(s)

PORT=${1:-3000}
PORTS=${@:-3000 3001 8000 8001}

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

echo "🔍 Checking for processes on ports: $PORTS"

for PORT in $PORTS; do
  PIDS=$(lsof -ti:$PORT 2>/dev/null)

  if [ -z "$PIDS" ]; then
    echo -e "${GREEN}✅ Port $PORT is free${NC}"
  else
    echo -e "${YELLOW}⚠️  Port $PORT is in use by PIDs: $PIDS${NC}"

    for PID in $PIDS; do
      PROCESS=$(ps -p $PID -o command= 2>/dev/null)
      echo -e "   ${BLUE}PID $PID: ${PROCESS:0:80}...${NC}"
    done

    read -p "Kill processes on port $PORT? (y/n) " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Yy]$ ]]; then
      echo -e "${YELLOW}Killing processes on port $PORT...${NC}"
      kill -9 $PIDS 2>/dev/null
      sleep 1

      # Verify
      REMAINING=$(lsof -ti:$PORT 2>/dev/null)
      if [ -z "$REMAINING" ]; then
        echo -e "${GREEN}✅ Port $PORT is now free${NC}"
      else
        echo -e "${RED}❌ Failed to kill all processes on port $PORT${NC}"
      fi
    fi
  fi
done

