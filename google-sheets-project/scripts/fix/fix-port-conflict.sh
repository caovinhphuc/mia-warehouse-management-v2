
#!/bin/bash
# Fix port conflicts by killing processes or changing ports

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

echo "🔧 Fix Port Conflicts"
echo "===================="

# Check common ports
PORTS="3000 3001 8000 8001"

for PORT in $PORTS; do
  PIDS=$(lsof -ti:$PORT 2>/dev/null)

  if [ ! -z "$PIDS" ]; then
    echo -e "${YELLOW}⚠️  Port $PORT is in use${NC}"

    for PID in $PIDS; do
      PROCESS=$(ps -p $PID -o command= 2>/dev/null | head -c 60)
      echo -e "   ${BLUE}PID $PID: $PROCESS...${NC}"
    done

    # Auto-kill if it's a React or Node process (but not Chrome/browser)
    for PID in $PIDS; do
      PROCESS=$(ps -p $PID -o command= 2>/dev/null)
      if echo "$PROCESS" | grep -qE "(react-scripts|node.*server|npm.*start|start.js|uvicorn)" && ! echo "$PROCESS" | grep -qE "(Chrome|Browser|Safari|Firefox)"; then
        echo -e "${YELLOW}   Killing development server PID $PID...${NC}"
        kill -9 $PID 2>/dev/null
        sleep 0.5
      elif echo "$PROCESS" | grep -qE "(Chrome|Browser|Safari|Firefox)"; then
        echo -e "${BLUE}   Skipping browser process PID $PID${NC}"
      fi
    done

    # Check again
    REMAINING=$(lsof -ti:$PORT 2>/dev/null)
    if [ -z "$REMAINING" ]; then
      echo -e "${GREEN}✅ Port $PORT is now free${NC}"
    fi
  else
    echo -e "${GREEN}✅ Port $PORT is free${NC}"
  fi
done

echo ""
echo -e "${BLUE}Current port status:${NC}"
for PORT in $PORTS; do
  PIDS=$(lsof -ti:$PORT 2>/dev/null)
  if [ -z "$PIDS" ]; then
    echo -e "   ${GREEN}Port $PORT: FREE${NC}"
  else
    echo -e "   ${RED}Port $PORT: IN USE (PIDs: $PIDS)${NC}"
  fi
done

