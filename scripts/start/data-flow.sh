#!/bin/bash

# =============================================================================
# 🚀 DATA FLOW STARTUP SCRIPT
# =============================================================================
# Script chuyên biệt cho luồng xử lý dữ liệu:
# One Page → Automation → Google Sheets → AI Analysis → Email/Telegram
# =============================================================================

# Màu sắc
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
PURPLE='\033[0;35m'
CYAN='\033[0;36m'
WHITE='\033[1;37m'
NC='\033[0m'

# Biến
LOG_DIR="logs"
MAIN_PROJECT_DIR="main-project"
GOOGLE_SHEETS_DIR="google-sheets-project"

print_header() {
    clear
    echo -e "${CYAN}"
    echo "╔══════════════════════════════════════════════════════════════════════════════╗"
    echo "║                        🚀 DATA FLOW STARTUP SCRIPT                         ║"
    echo "║                    One Page → Automation → AI → Notifications              ║"
    echo "╚══════════════════════════════════════════════════════════════════════════════╝"
    echo -e "${NC}"
}

print_flow() {
    echo -e "${WHITE}📊 LUỒNG XỬ LÝ DỮ LIỆU:${NC}"
    echo -e "${CYAN}┌─────────────────────────────────────────────────────────────┐${NC}"
    echo -e "${CYAN}│${NC} 📄 One Page → 🤖 Automation → 📋 Google Sheets → 🧠 AI → 📧/📱 ${CYAN}│${NC}"
    echo -e "${CYAN}└─────────────────────────────────────────────────────────────┘${NC}"
    echo ""
}

print_menu() {
    echo -e "${WHITE}📋 MENU KHỞI ĐỘNG THEO LUỒNG:${NC}"
    echo -e "${GREEN}  1.${NC} 🏗️  Khởi động nền tảng (Backend + Google Sheets + AI)"
    echo -e "${GREEN}  2.${NC} 🔄 Khởi động Automation Service"
    echo -e "${GREEN}  3.${NC} 🎨 Khởi động Frontend (Google Sheets)"
    echo -e "${GREEN}  4.${NC} 🎯 Khởi động Main Frontend (Dashboard)"
    echo -e "${GREEN}  5.${NC} 🔥 Khởi động toàn bộ hệ thống"
    echo -e "${GREEN}  6.${NC} 🔧 Kiểm tra trạng thái"
    echo -e "${GREEN}  7.${NC} 🛑 Dừng tất cả"
    echo -e "${GREEN}  8.${NC} 🚪 Thoát"
    echo ""
}

check_dependencies() {
    echo -e "${YELLOW}🔍 Kiểm tra dependencies...${NC}"

    if ! command -v node &> /dev/null; then
        echo -e "${RED}❌ Node.js chưa được cài đặt!${NC}"
        return 1
    fi

    if ! command -v python3 &> /dev/null; then
        echo -e "${RED}❌ Python3 chưa được cài đặt!${NC}"
        return 1
    fi

    echo -e "${GREEN}✅ Dependencies OK${NC}"
    return 0
}

check_ports() {
    echo -e "${YELLOW}🔍 Kiểm tra ports...${NC}"

    local ports=(3000 3001 3002 3003 8000)
    local occupied_ports=()

    for port in "${ports[@]}"; do
        if lsof -i :$port &> /dev/null; then
            occupied_ports+=($port)
        fi
    done

    if [ ${#occupied_ports[@]} -gt 0 ]; then
        echo -e "${RED}❌ Ports đang được sử dụng: ${occupied_ports[*]}${NC}"
        echo -e "${YELLOW}💡 Sử dụng option 7 để dừng tất cả${NC}"
        return 1
    fi

    echo -e "${GREEN}✅ Ports OK${NC}"
    return 0
}

create_log_dir() {
    if [ ! -d "$LOG_DIR" ]; then
        mkdir -p "$LOG_DIR"
    fi
}

start_backend() {
    echo -e "${BLUE}🔧 Khởi động Main Backend...${NC}"
    cd "$MAIN_PROJECT_DIR/backend"
    npm install --silent
    nohup node src/server.js > "../../$LOG_DIR/main-backend.log" 2>&1 &
    echo $! > "../../$LOG_DIR/main-backend.pid"
    sleep 2
    if kill -0 $! 2>/dev/null; then
        echo -e "${GREEN}✅ Main Backend OK (Port 3001)${NC}"
    else
        echo -e "${RED}❌ Main Backend FAILED${NC}"
        return 1
    fi
    cd - > /dev/null
}

start_google_backend() {
    echo -e "${BLUE}📊 Khởi động Google Sheets Backend...${NC}"
    cd "$GOOGLE_SHEETS_DIR"
    npm install --legacy-peer-deps --silent
    nohup node server.js > "../$LOG_DIR/google-backend.log" 2>&1 &
    echo $! > "../$LOG_DIR/google-backend.pid"
    sleep 2
    if kill -0 $! 2>/dev/null; then
        echo -e "${GREEN}✅ Google Backend OK (Port 3003)${NC}"
    else
        echo -e "${RED}❌ Google Backend FAILED${NC}"
        return 1
    fi
    cd - > /dev/null
}

start_ai_service() {
    echo -e "${BLUE}🤖 Khởi động AI Service...${NC}"
    cd "$MAIN_PROJECT_DIR/ai-service"
    pip install -r requirements.txt --quiet
    nohup python3 main.py > "../../$LOG_DIR/ai-service.log" 2>&1 &
    echo $! > "../../$LOG_DIR/ai-service.pid"
    sleep 3
    if kill -0 $! 2>/dev/null; then
        echo -e "${GREEN}✅ AI Service OK (Port 8000)${NC}"
    else
        echo -e "${RED}❌ AI Service FAILED${NC}"
        return 1
    fi
    cd - > /dev/null
}

start_automation() {
    echo -e "${BLUE}🔄 Khởi động Automation Service...${NC}"
    cd "$MAIN_PROJECT_DIR/automation"
    pip install -r requirements.txt --quiet
    nohup python3 run_automation.py > "../../$LOG_DIR/automation.log" 2>&1 &
    echo $! > "../../$LOG_DIR/automation.pid"
    sleep 2
    if kill -0 $! 2>/dev/null; then
        echo -e "${GREEN}✅ Automation Service OK${NC}"
    else
        echo -e "${RED}❌ Automation Service FAILED${NC}"
        return 1
    fi
    cd - > /dev/null
}

start_google_frontend() {
    echo -e "${BLUE}📋 Khởi động Google Sheets Frontend...${NC}"
    cd "$GOOGLE_SHEETS_DIR"
    PORT=3002 nohup npm start > "../$LOG_DIR/google-frontend.log" 2>&1 &
    echo $! > "../$LOG_DIR/google-frontend.pid"
    sleep 5
    if kill -0 $! 2>/dev/null; then
        echo -e "${GREEN}✅ Google Frontend OK (Port 3002)${NC}"
    else
        echo -e "${RED}❌ Google Frontend FAILED${NC}"
        return 1
    fi
    cd - > /dev/null
}

start_main_frontend() {
    echo -e "${BLUE}🎨 Khởi động Main Frontend...${NC}"
    cd "$MAIN_PROJECT_DIR"
    npm install --legacy-peer-deps --silent
    nohup npm start > "../$LOG_DIR/main-frontend.log" 2>&1 &
    echo $! > "../$LOG_DIR/main-frontend.pid"
    sleep 5
    if kill -0 $! 2>/dev/null; then
        echo -e "${GREEN}✅ Main Frontend OK (Port 3000)${NC}"
    else
        echo -e "${RED}❌ Main Frontend FAILED${NC}"
        return 1
    fi
    cd - > /dev/null
}

launch_foundation() {
    echo -e "${PURPLE}🏗️  KHỞI ĐỘNG NỀN TẢNG${NC}"
    echo -e "${CYAN}========================${NC}"

    if ! check_dependencies || ! check_ports; then
        return 1
    fi

    create_log_dir

    echo -e "${YELLOW}📋 Thứ tự: Backend → Google Backend → AI Service${NC}"
    echo ""

    start_backend
    start_google_backend
    start_ai_service

    echo ""
    echo -e "${GREEN}🎉 NỀN TẢNG ĐÃ SẴN SÀNG!${NC}"
    echo -e "${BLUE}🌐 Main API: http://localhost:3001${NC}"
    echo -e "${BLUE}🌐 Google API: http://localhost:3003${NC}"
    echo -e "${BLUE}🌐 AI Service: http://localhost:8000${NC}"
}

launch_automation() {
    echo -e "${PURPLE}🔄 KHỞI ĐỘNG AUTOMATION${NC}"
    echo -e "${CYAN}========================${NC}"

    start_automation

    echo ""
    echo -e "${GREEN}🎉 AUTOMATION ĐÃ KHỞI ĐỘNG!${NC}"
    echo -e "${BLUE}📊 Sẽ tự động lấy dữ liệu từ One Page${NC}"
    echo -e "${BLUE}📋 Và lưu vào Google Sheets${NC}"
}

launch_google_frontend() {
    echo -e "${PURPLE}📋 KHỞI ĐỘNG GOOGLE SHEETS FRONTEND${NC}"
    echo -e "${CYAN}====================================${NC}"

    start_google_frontend

    echo ""
    echo -e "${GREEN}🎉 GOOGLE SHEETS FRONTEND ĐÃ KHỞI ĐỘNG!${NC}"
    echo -e "${BLUE}🌐 App: http://localhost:3002${NC}"
    echo -e "${BLUE}📊 Quản lý dữ liệu Google Sheets${NC}"
}

launch_main_frontend() {
    echo -e "${PURPLE}🎨 KHỞI ĐỘNG MAIN FRONTEND${NC}"
    echo -e "${CYAN}============================${NC}"

    start_main_frontend

    echo ""
    echo -e "${GREEN}🎉 MAIN FRONTEND ĐÃ KHỞI ĐỘNG!${NC}"
    echo -e "${BLUE}🌐 Dashboard: http://localhost:3000${NC}"
    echo -e "${BLUE}📊 Xem AI Analytics và Reports${NC}"
}

launch_full_system() {
    echo -e "${PURPLE}🔥 KHỞI ĐỘNG TOÀN BỘ HỆ THỐNG${NC}"
    echo -e "${CYAN}================================${NC}"

    if ! check_dependencies || ! check_ports; then
        return 1
    fi

    create_log_dir

    echo -e "${YELLOW}📋 Thứ tự: Nền tảng → Automation → Frontends${NC}"
    echo ""

    # Phase 1: Nền tảng
    start_backend
    start_google_backend
    start_ai_service

    # Phase 2: Automation
    start_automation

    # Phase 3: Frontends
    start_google_frontend
    start_main_frontend

    echo ""
    echo -e "${GREEN}🎉 TOÀN BỘ HỆ THỐNG ĐÃ KHỞI ĐỘNG!${NC}"
    echo -e "${CYAN}┌─────────────────────────────────────────────────────────────┐${NC}"
    echo -e "${CYAN}│${NC} 🌐 Dashboard:     ${BLUE}http://localhost:3000${NC}                    ${CYAN}│${NC}"
    echo -e "${CYAN}│${NC} 📊 Google Sheets: ${BLUE}http://localhost:3002${NC}                    ${CYAN}│${NC}"
    echo -e "${CYAN}│${NC} 🔧 Main API:      ${BLUE}http://localhost:3001${NC}                    ${CYAN}│${NC}"
    echo -e "${CYAN}│${NC} 📋 Google API:    ${BLUE}http://localhost:3003${NC}                    ${CYAN}│${NC}"
    echo -e "${CYAN}│${NC} 🤖 AI Service:    ${BLUE}http://localhost:8000${NC}                    ${CYAN}│${NC}"
    echo -e "${CYAN}└─────────────────────────────────────────────────────────────┘${NC}"
}

stop_all() {
    echo -e "${RED}🛑 DỪNG TẤT CẢ DỊCH VỤ${NC}"
    echo -e "${CYAN}======================${NC}"

    local pids=()

    for pid_file in "$LOG_DIR"/*.pid; do
        if [ -f "$pid_file" ]; then
            local pid=$(cat "$pid_file")
            if kill -0 "$pid" 2>/dev/null; then
                pids+=("$pid")
            fi
            rm -f "$pid_file"
        fi
    done

    if [ ${#pids[@]} -gt 0 ]; then
        echo -e "${YELLOW}📋 Đang dừng ${#pids[@]} dịch vụ...${NC}"
        for pid in "${pids[@]}"; do
            kill -TERM "$pid" 2>/dev/null
            sleep 1
            if kill -0 "$pid" 2>/dev/null; then
                kill -KILL "$pid" 2>/dev/null
            fi
        done
        echo -e "${GREEN}✅ Đã dừng tất cả dịch vụ${NC}"
    else
        echo -e "${YELLOW}⚠️  Không có dịch vụ nào đang chạy${NC}"
    fi

    pkill -f "node.*server.js" 2>/dev/null
    pkill -f "python.*main.py" 2>/dev/null
    pkill -f "python.*run_automation.py" 2>/dev/null
    pkill -f "npm start" 2>/dev/null
}

show_status() {
    echo -e "${BLUE}📊 TRẠNG THÁI DỊCH VỤ:${NC}"
    echo -e "${CYAN}┌─────────────────────────────────────────────────────────────┐${NC}"

    local services=(
        "Main Backend:$LOG_DIR/main-backend.pid:3001"
        "Google Backend:$LOG_DIR/google-backend.pid:3003"
        "AI Service:$LOG_DIR/ai-service.pid:8000"
        "Automation:$LOG_DIR/automation.pid:Automation"
        "Google Frontend:$LOG_DIR/google-frontend.pid:3002"
        "Main Frontend:$LOG_DIR/main-frontend.pid:3000"
    )

    for service in "${services[@]}"; do
        local name=$(echo "$service" | cut -d: -f1)
        local pid_file=$(echo "$service" | cut -d: -f2)
        local port=$(echo "$service" | cut -d: -f3)

        if [ -f "$pid_file" ] && kill -0 $(cat "$pid_file") 2>/dev/null; then
            echo -e "${CYAN}│${NC} $name ${GREEN}✅ RUNNING${NC} (Port $port)                    ${CYAN}│${NC}"
        else
            echo -e "${CYAN}│${NC} $name ${RED}❌ STOPPED${NC} (Port $port)                    ${CYAN}│${NC}"
        fi
    done

    echo -e "${CYAN}└─────────────────────────────────────────────────────────────┘${NC}"
    echo ""
}

main() {
    while true; do
        print_header
        print_flow
        show_status
        print_menu

        read -p "Nhập lựa chọn (1-8): " choice
        echo ""

        case $choice in
            1) launch_foundation ;;
            2) launch_automation ;;
            3) launch_google_frontend ;;
            4) launch_main_frontend ;;
            5) launch_full_system ;;
            6) show_status ;;
            7) stop_all ;;
            8)
                echo -e "${YELLOW}🛑 Dừng tất cả dịch vụ trước khi thoát...${NC}"
                stop_all
                echo -e "${GREEN}👋 Cảm ơn bạn đã sử dụng!${NC}"
                exit 0
                ;;
            *)
                echo -e "${RED}❌ Lựa chọn không hợp lệ. Vui lòng chọn 1-8.${NC}"
                ;;
        esac

        echo ""
        read -p "Nhấn Enter để tiếp tục..." dummy
    done
}

# Xử lý signal
trap 'echo -e "\n${YELLOW}🛑 Đang dừng tất cả dịch vụ...${NC}"; stop_all; exit 0' INT TERM

# Chạy main function
if [[ "${BASH_SOURCE[0]}" == "${0}" ]]; then
    main
fi
