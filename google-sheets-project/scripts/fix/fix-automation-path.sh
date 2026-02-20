#!/bin/bash
# Fix automation service path issue

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

echo "🔧 Fixing Automation Service Path"
echo "=================================="
echo ""

# Check if automation/src/main.py exists
if [ -f "automation/src/main.py" ]; then
    echo -e "${GREEN}✅ automation/src/main.py exists${NC}"
else
    echo -e "${YELLOW}⚠️  automation/src/main.py NOT found${NC}"
fi

# Check if one_automation_system/main.py exists
if [ -f "one_automation_system/main.py" ]; then
    echo -e "${GREEN}✅ one_automation_system/main.py exists${NC}"
else
    echo -e "${RED}❌ one_automation_system/main.py NOT found${NC}"
fi

# Check if automation/main.py exists
if [ -f "automation/main.py" ]; then
    echo -e "${GREEN}✅ automation/main.py exists${NC}"
else
    echo -e "${YELLOW}⚠️  automation/main.py NOT found${NC}"
fi

echo ""
echo "💡 Scripts should use: one_automation_system/main.py"
echo "   (FastAPI service with uvicorn)"

