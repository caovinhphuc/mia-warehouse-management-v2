#!/bin/bash

# Quick Run - Chạy automation nhanh (20-30 giây)

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
RED='\033[0;31m'
NC='\033[0m'

echo -e "${CYAN}╔══════════════════════════════════════════════════════════════╗${NC}"
echo -e "${CYAN}║                    ⚡ QUICK RUN MODE                        ║${NC}"
echo -e "${CYAN}║                  Fast Automation (20-30s)                   ║${NC}"
echo -e "${CYAN}╚══════════════════════════════════════════════════════════════╝${NC}"
echo ""

# Change to script directory
cd "$(dirname "$0")"

# Check if virtual environment exists
if [ ! -d "venv" ]; then
    echo -e "${RED}❌ Virtual environment chưa được tạo${NC}"
    echo -e "${YELLOW}🔧 Chạy './setup.sh' trước...${NC}"
    exit 1
fi

# Activate virtual environment
source venv/bin/activate

# Check if .env exists
if [ ! -f ".env" ]; then
    echo -e "${RED}❌ File .env chưa tồn tại${NC}"
    echo -e "${YELLOW}🔧 Chạy './quick_config.sh' để cấu hình...${NC}"
    exit 1
fi

echo -e "${BLUE}⚡ Bắt đầu Quick Run Automation...${NC}"
echo ""

# Run quick test first
echo -e "${YELLOW}🧪 Quick system check...${NC}"
python quick_test.py --quiet

if [ $? -ne 0 ]; then
    echo -e "${RED}❌ System check failed${NC}"
    echo -e "${YELLOW}💡 Chạy './start.sh' → '3. Test hệ thống' để xem chi tiết${NC}"
    exit 1
fi

echo -e "${GREEN}✅ System check passed${NC}"
echo ""

# Run automation with quick mode
echo -e "${BLUE}🚀 Chạy automation mode QUICK...${NC}"
echo ""

# Timer start
start_time=$(date +%s)

# Run enhanced automation in test mode (faster)
python automation_enhanced.py --mode test

# Capture exit code
automation_result=$?

# Timer end
end_time=$(date +%s)
duration=$((end_time - start_time))

echo ""
echo -e "${CYAN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"

if [ $automation_result -eq 0 ]; then
    echo -e "${GREEN}🎉 QUICK RUN THÀNH CÔNG!${NC}"
    echo -e "${GREEN}⏱️  Thời gian: ${duration}s${NC}"
    echo ""

    # Show results
    if [ -f "data/orders_latest.csv" ]; then
        order_count=$(wc -l < data/orders_latest.csv)
        order_count=$((order_count - 1))  # Subtract header
        echo -e "${BLUE}📊 KẾT QUẢ:${NC}"
        echo -e "${GREEN}   📦 Đơn hàng: $order_count${NC}"
        echo -e "${GREEN}   📁 File: data/orders_latest.csv${NC}"
        echo ""

        # Preview first 3 orders
        echo -e "${BLUE}🔍 Preview 3 đơn đầu:${NC}"
        head -4 data/orders_latest.csv | tail -3
        echo ""
    fi

    echo -e "${CYAN}📋 GỢI Ý TIẾP THEO:${NC}"
    echo "   • Xem chi tiết: './start.sh' → '7. Xem kết quả data'"
    echo "   • Chạy đầy đủ: './start.sh' → '5. Chạy automation đầy đủ'"
    echo "   • SLA monitor: './start.sh' → '6. Chạy với SLA monitoring'"

else
    echo -e "${RED}❌ QUICK RUN THẤT BẠI!${NC}"
    echo -e "${RED}⏱️  Thời gian: ${duration}s${NC}"
    echo ""
    echo -e "${YELLOW}💡 TROUBLESHOOTING:${NC}"
    echo "   • Kiểm tra credentials: './start.sh' → '2. Cấu hình credentials'"
    echo "   • Test hệ thống: './start.sh' → '3. Test hệ thống'"
    echo "   • Xem logs: ls -la logs/"
    echo "   • Chạy chi tiết: './start.sh' → '5. Automation đầy đủ'"
fi

echo -e "${CYAN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
