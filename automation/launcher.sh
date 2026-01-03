#!/bin/bash
# Thêm vào launcher.sh

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
