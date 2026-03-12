#!/bin/bash

# =============================================================================
# 📊 QUICK MONITORING SCRIPT
# =============================================================================
# Quick health check for all services
# =============================================================================

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

echo -e "${BLUE}═══════════════════════════════════════════════════════════════════${NC}"
echo -e "${BLUE}         📊 REACT OAS INTEGRATION - MONITORING DASHBOARD           ${NC}"
echo -e "${BLUE}═══════════════════════════════════════════════════════════════════${NC}"
echo ""

# Check if jq is installed
if ! command -v jq &> /dev/null; then
    echo -e "${YELLOW}⚠️  jq not found. Install: brew install jq (macOS) or apt-get install jq (Linux)${NC}"
    echo ""
fi

# Function to check service
check_service() {
    local name=$1
    local url=$2

    if curl -s --max-time 5 "$url" > /dev/null 2>&1; then
        echo -e "${GREEN}✓ $name${NC} - UP"
        return 0
    else
        echo -e "${RED}✗ $name${NC} - DOWN"
        return 1
    fi
}

# Check all services
echo -e "${BLUE}Service Status:${NC}"
check_service "Frontend    " "http://localhost:3000"
check_service "Backend     " "http://localhost:3001/health"
check_service "AI Service  " "http://localhost:8000"
echo ""

# Backend health details
echo -e "${BLUE}Backend Health:${NC}"
if curl -s --max-time 5 "http://localhost:3001/api/monitoring/health" > /dev/null 2>&1; then
    HEALTH=$(curl -s http://localhost:3001/api/monitoring/health)

    if command -v jq &> /dev/null; then
        STATUS=$(echo $HEALTH | jq -r '.status')
        UPTIME=$(echo $HEALTH | jq -r '.uptime')
        TOTAL_REQ=$(echo $HEALTH | jq -r '.requests.total')
        ERRORS=$(echo $HEALTH | jq -r '.requests.errors')
        ERROR_RATE=$(echo $HEALTH | jq -r '.requests.errorRate')
        MEM_USED=$(echo $HEALTH | jq -r '.process.memory.heapUsed')
        MEM_TOTAL=$(echo $HEALTH | jq -r '.process.memory.heapTotal')

        echo "  Status: $STATUS"
        echo "  Uptime: ${UPTIME}s"
        echo "  Requests: $TOTAL_REQ (Errors: $ERRORS - $ERROR_RATE)"
        echo "  Memory: ${MEM_USED}MB / ${MEM_TOTAL}MB"
    else
        echo "$HEALTH" | head -10
    fi
else
    echo -e "${RED}  Backend not responding${NC}"
fi
echo ""

# Performance metrics
echo -e "${BLUE}Performance Metrics:${NC}"
if curl -s --max-time 5 "http://localhost:3001/api/monitoring/metrics" > /dev/null 2>&1; then
    METRICS=$(curl -s http://localhost:3001/api/monitoring/metrics)

    if command -v jq &> /dev/null; then
        AVG_TIME=$(echo $METRICS | jq -r '.avgResponseTime')
        MAX_TIME=$(echo $METRICS | jq -r '.maxResponseTime')
        REQ_PER_MIN=$(echo $METRICS | jq -r '.requestsPerMinute')

        echo "  Avg Response: ${AVG_TIME}ms"
        echo "  Max Response: ${MAX_TIME}ms"
        echo "  Requests/min: $REQ_PER_MIN"
    else
        echo "$METRICS"
    fi
else
    echo -e "${RED}  Metrics not available${NC}"
fi
echo ""

# Active alerts
echo -e "${BLUE}Active Alerts:${NC}"
if curl -s --max-time 5 "http://localhost:3001/api/monitoring/alerts" > /dev/null 2>&1; then
    ALERTS=$(curl -s http://localhost:3001/api/monitoring/alerts)

    if command -v jq &> /dev/null; then
        ALERT_COUNT=$(echo $ALERTS | jq '.alerts | length')

        if [ "$ALERT_COUNT" -gt 0 ]; then
            echo -e "${YELLOW}  ⚠️  $ALERT_COUNT active alert(s)${NC}"
            echo $ALERTS | jq -r '.alerts[] | "  - [\(.level)] \(.message)"'
        else
            echo -e "${GREEN}  ✓ No active alerts${NC}"
        fi
    else
        echo "$ALERTS"
    fi
else
    echo -e "${RED}  Alerts not available${NC}"
fi
echo ""

# System info
echo -e "${BLUE}System Information:${NC}"
echo "  Time: $(date)"
if command -v uptime &> /dev/null; then
    echo "  Uptime: $(uptime | awk -F'up ' '{print $2}' | awk -F',' '{print $1}')"
fi
if command -v free &> /dev/null; then
    echo "  Memory: $(free -h | awk '/^Mem:/ {print $3 " / " $2}')"
elif command -v vm_stat &> /dev/null; then
    # macOS
    VM_STAT=$(vm_stat)
    PAGES_FREE=$(echo "$VM_STAT" | awk '/Pages free/ {print $3}' | tr -d '.')
    PAGES_ACTIVE=$(echo "$VM_STAT" | awk '/Pages active/ {print $3}' | tr -d '.')
    PAGE_SIZE=4096
    FREE_MB=$((PAGES_FREE * PAGE_SIZE / 1024 / 1024))
    ACTIVE_MB=$((PAGES_ACTIVE * PAGE_SIZE / 1024 / 1024))
    echo "  Memory: ${ACTIVE_MB}MB active / ${FREE_MB}MB free"
fi

echo ""
echo -e "${BLUE}═══════════════════════════════════════════════════════════════════${NC}"
echo ""

# Exit code based on service health
if check_service "Backend" "http://localhost:3001/health" > /dev/null 2>&1; then
    exit 0
else
    exit 1
fi

