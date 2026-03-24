#!/bin/bash
# Launcher - MIA Dynamic Dashboard
# Fragment: option 12 - Mở MIA Dynamic Dashboard

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
NC='\033[0m'

case "${1:-12}" in
12)
    echo -e "${BLUE}🌐 Mở MIA Dynamic Dashboard...${NC}"
    if [ -f "mia_dynamic_dashboard.html" ]; then
        echo -e "${GREEN}📊 Khởi động Dynamic Dashboard...${NC}"
        echo -e "${CYAN}🔄 Features:${NC}"
        echo -e "   • Real-time data từ automation"
        echo -e "   • Auto-refresh mỗi 30s"
        echo -e "   • Google Sheets integration"
        echo -e "   • SLA monitoring alerts"
        echo -e "   • Export functionality"
        echo ""

        # Mở dashboard
        if command -v open >/dev/null 2>&1; then
            open "mia_dynamic_dashboard.html"
        elif command -v xdg-open >/dev/null 2>&1; then
            xdg-open "mia_dynamic_dashboard.html"
        elif command -v start >/dev/null 2>&1; then
            start "mia_dynamic_dashboard.html"
        fi

        echo -e "${GREEN}✅ Dynamic Dashboard đã được mở!${NC}"
    else
        echo -e "${RED}❌ File dashboard không tìm thấy!${NC}"
    fi
    ;;
*)
    echo "Usage: $0 [12]"
    echo "  12 - Mở MIA Dynamic Dashboard"
    exit 1
    ;;
esac
