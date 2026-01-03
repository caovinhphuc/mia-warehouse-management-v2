#!/bin/bash

# 🚀 START - Launcher đơn giản cho Warehouse Automation
# Chỉ cần click để chạy tất cả

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
RED='\033[0;31m'
NC='\033[0m'

clear

echo -e "${CYAN}╔══════════════════════════════════════════════════════════════╗${NC}"
echo -e "${CYAN}║              🏭 WAREHOUSE AUTOMATION LAUNCHER               ║${NC}"
echo -e "${CYAN}║                     Click & Run System                      ║${NC}"
echo -e "${CYAN}╚══════════════════════════════════════════════════════════════╝${NC}"
echo ""

# Change to script directory
cd "$(dirname "$0")"

# Check if virtual environment exists
if [ ! -d "venv" ]; then
    echo -e "${RED}❌ Virtual environment chưa được tạo${NC}"
    echo -e "${YELLOW}🔧 Chạy setup trước...${NC}"
    ./setup.sh
fi

# Activate virtual environment
source venv/bin/activate

# Load environment from .env if exists
if [ -f .env ]; then
    set -a
    # shellcheck disable=SC1091
    source .env
    set +a
fi

# Menu
while true; do
    echo -e "${BLUE}📋 CHỌN CHỨC NĂNG:${NC}"
    echo ""
    echo -e "${YELLOW}  1.${NC} ⚙️  Setup & Cài đặt hệ thống"
    echo -e "${YELLOW}  2.${NC} 🔧 Cấu hình nhanh credentials"
    echo -e "${YELLOW}  3.${NC} 🧪 Test hệ thống"
    echo -e "${YELLOW}  4.${NC} ⚡ Chạy automation nhanh (20-30s)"
    echo -e "${YELLOW}  5.${NC} 🚀 Chạy automation đầy đủ"
    echo -e "${YELLOW}  6.${NC} 📊 Chạy với SLA monitoring"
    echo -e "${YELLOW}  7.${NC} 📈 Xem kết quả data"
    echo -e "${YELLOW}  8.${NC} 🌐 Mở Dashboard Web"
    echo -e "${YELLOW}  9.${NC} 🏭 Enterprise Dashboard (Real-time)"
    echo -e "${YELLOW} 10.${NC} 📊 Shopee Analysis Report"
    echo -e "${YELLOW} 11.${NC} 🔍 Kiểm tra system health"
    echo -e "${YELLOW} 12.${NC} 🌐 Mở MIA Dynamic Dashboard"
    echo -e "${YELLOW}  0.${NC} 👋 Thoát"
    echo ""

    read -p "Chọn (0-12): " choice
    echo ""

    case $choice in
        1)
            echo -e "${BLUE}🔧 Chạy setup hệ thống...${NC}"
            ./setup.sh
            ;;
        2)
            echo -e "${BLUE}⚙️ Cấu hình credentials...${NC}"
            ./quick_config.sh
            ;;
        3)
            echo -e "${BLUE}🧪 Test hệ thống...${NC}"
            python quick_test.py
            ;;
        4)
            echo -e "${BLUE}⚡ Chạy automation nhanh...${NC}"
            echo -e "${CYAN}⚙️ Sử dụng giới hạn từ config: data_processing.max_rows_for_testing (nếu có)${NC}"
            ./quick_run.sh
            ;;
        5)
            echo -e "${BLUE}🚀 Chạy automation đầy đủ...${NC}"
            python automation.py
            ;;
        6)
            echo -e "${BLUE}📊 Chạy với SLA monitoring...${NC}"
            echo -e "${CYAN}⚙️ Sử dụng config từ: config/config.json${NC}"
            python automation_enhanced.py --mode sla --config config/config.json
            ;;
        7)
            echo -e "${BLUE}📈 Xem kết quả data...${NC}"
            if [ -f "data/orders_latest.csv" ]; then
                echo -e "${GREEN}📁 File data mới nhất:${NC}"
                ls -la data/orders_latest.csv
                echo ""
                echo -e "${GREEN}📊 Số dòng dữ liệu:${NC}"
                wc -l data/orders_latest.csv
                echo ""
                echo -e "${GREEN}🔍 Preview 5 dòng đầu:${NC}"
                head -5 data/orders_latest.csv
            else
                echo -e "${YELLOW}⚠️ Chưa có dữ liệu. Chạy automation trước.${NC}"
            fi
            ;;
        8)
            echo -e "${BLUE}🌐 Mở Dashboard Web...${NC}"
            ./start_dashboard.sh
            ;;
        9)
            echo -e "${BLUE}🏭 Mở Enterprise Dashboard Real-time...${NC}"
            if [ -f "warehouse-dashboard-enterprise.html" ]; then
                echo -e "${GREEN}📊 Khởi động Enterprise Dashboard...${NC}"
                echo -e "${CYAN}🌐 Dashboard Features:${NC}"
                echo -e "   • Real-time SLA monitoring"
                echo -e "   • Multi-platform tracking (Shopee/TikTok/Tiki)"
                echo -e "   • Advanced filtering & export"
                echo -e "   • Critical alerts & notifications"
                echo -e "   • Performance analytics"
                echo ""

                # Mở dashboard trong browser mặc định
                if command -v open >/dev/null 2>&1; then
                    # macOS
                    open "warehouse-dashboard-enterprise.html"
                elif command -v xdg-open >/dev/null 2>&1; then
                    # Linux
                    xdg-open "warehouse-dashboard-enterprise.html"
                elif command -v start >/dev/null 2>&1; then
                    # Windows
                    start "warehouse-dashboard-enterprise.html"
                else
                    echo -e "${YELLOW}⚠️ Không thể tự động mở browser${NC}"
                    echo -e "${CYAN}💡 Thủ công mở file:${NC}"
                    echo "   $(pwd)/warehouse-dashboard-enterprise.html"
                fi

                echo -e "${GREEN}✅ Enterprise Dashboard đã được mở!${NC}"
                echo -e "${CYAN}📋 Dashboard URL:${NC} file://$(pwd)/warehouse-dashboard-enterprise.html"
            else
                echo -e "${RED}❌ File dashboard không tìm thấy!${NC}"
                echo -e "${YELLOW}💡 Đảm bảo file warehouse-dashboard-enterprise.html có trong thư mục này${NC}"
            fi
            ;;
        10)
            echo -e "${BLUE}📊 Mở Shopee Analysis Report...${NC}"
            if [ -f "shopee_analysis_report.html" ]; then
                echo -e "${GREEN}📈 Khởi động Shopee Analysis Report...${NC}"
                echo -e "${CYAN}📊 Report Features:${NC}"
                echo -e "   • Shopee event impact analysis (15-16/06/2025)"
                echo -e "   • Sales performance tracking"
                echo -e "   • Order trend analysis by hour"
                echo -e "   • Top products & colors analysis"
                echo -e "   • Regional performance insights"
                echo -e "   • Predictive analytics for 24/06/2025"
                echo ""

                # Mở report trong browser mặc định
                if command -v open >/dev/null 2>&1; then
                    # macOS
                    open "shopee_analysis_report.html"
                elif command -v xdg-open >/dev/null 2>&1; then
                    # Linux
                    xdg-open "shopee_analysis_report.html"
                elif command -v start >/dev/null 2>&1; then
                    # Windows
                    start "shopee_analysis_report.html"
                else
                    echo -e "${YELLOW}⚠️ Không thể tự động mở browser${NC}"
                    echo -e "${CYAN}💡 Thủ công mở file:${NC}"
                    echo "   $(pwd)/shopee_analysis_report.html"
                fi

                echo -e "${GREEN}✅ Shopee Analysis Report đã được mở!${NC}"
                echo -e "${CYAN}📋 Report URL:${NC} file://$(pwd)/shopee_analysis_report.html"
            else
                echo -e "${RED}❌ File report không tìm thấy!${NC}"
                echo -e "${YELLOW}💡 Đảm bảo file shopee_analysis_report.html có trong thư mục này${NC}"
            fi
            ;;
        11)
            echo -e "${BLUE}🔍 Kiểm tra system health...${NC}"
            python system_check.py
            ;;
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

                # Mở dashboard trong browser mặc định
                if command -v open >/dev/null 2>&1; then
                    open "mia_dynamic_dashboard.html"
                elif command -v xdg-open >/dev/null 2>&1; then
                    xdg-open "mia_dynamic_dashboard.html"
                elif command -v start >/dev/null 2>&1; then
                    start "mia_dynamic_dashboard.html"
                else
                    echo -e "${YELLOW}⚠️ Không thể tự động mở browser${NC}"
                    echo -e "${CYAN}💡 Thủ công mở file:${NC}"
                    echo "   $(pwd)/mia_dynamic_dashboard.html"
                fi

                echo -e "${GREEN}✅ Dynamic Dashboard đã được mở!${NC}"
            else
                echo -e "${RED}❌ File dashboard không tìm thấy!${NC}"
                echo -e "${YELLOW}💡 Đảm bảo file mia_dynamic_dashboard.html có trong thư mục này${NC}"
            fi
            ;;
        0)
            echo -e "${GREEN}👋 Tạm biệt!${NC}"
            break
            ;;
        *)
            echo -e "${RED}❌ Lựa chọn không hợp lệ!${NC}"
            ;;
    esac

    echo ""
    echo -e "${CYAN}────────────────────────────────────────────────────────────────${NC}"
    echo ""
    read -p "Nhấn Enter để tiếp tục..."
    clear

    echo -e "${CYAN}╔══════════════════════════════════════════════════════════════╗${NC}"
    echo -e "${CYAN}║              🏭 WAREHOUSE AUTOMATION LAUNCHER               ║${NC}"
    echo -e "${CYAN}║                     Click & Run System                      ║${NC}"
    echo -e "${CYAN}╚══════════════════════════════════════════════════════════════╝${NC}"
    echo ""
done
