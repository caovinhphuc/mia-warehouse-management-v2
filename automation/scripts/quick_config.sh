#!/bin/bash

# Quick Config - Cấu hình nhanh credentials cho hệ thống

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
RED='\033[0;31m'
NC='\033[0m'

echo -e "${CYAN}╔══════════════════════════════════════════════════════════════╗${NC}"
echo -e "${CYAN}║                   ⚙️ QUICK CONFIGURATION                    ║${NC}"
echo -e "${CYAN}║              Cấu hình nhanh credentials                     ║${NC}"
echo -e "${CYAN}╚══════════════════════════════════════════════════════════════╝${NC}"
echo ""

# Change to script directory
cd "$(dirname "$0")"

# Create .env file if not exists
if [ ! -f ".env" ]; then
    echo -e "${BLUE}📝 Tạo file .env từ template...${NC}"
    cp .env.example .env
    echo -e "${GREEN}✅ Đã tạo file .env${NC}"
fi

echo -e "${YELLOW}🔐 CẤU HÌNH ONE SYSTEM CREDENTIALS${NC}"
echo ""

# Get ONE credentials
echo -e "${BLUE}Nhập thông tin đăng nhập ONE System:${NC}"
read -p "👤 Username: " one_username
echo -n "🔑 Password: "
read -s one_password
echo ""

# Update .env file
echo -e "${BLUE}💾 Lưu credentials vào .env...${NC}"

# Backup current .env
cp .env .env.backup.$(date +%Y%m%d_%H%M%S)

# Update credentials in .env
if [[ "$OSTYPE" == "darwin"* ]]; then
    # macOS
    sed -i '' "s/ONE_USERNAME=.*/ONE_USERNAME=$one_username/" .env
    sed -i '' "s/ONE_PASSWORD=.*/ONE_PASSWORD=$one_password/" .env
else
    # Linux
    sed -i "s/ONE_USERNAME=.*/ONE_USERNAME=$one_username/" .env
    sed -i "s/ONE_PASSWORD=.*/ONE_PASSWORD=$one_password/" .env
fi

echo -e "${GREEN}✅ Đã lưu credentials${NC}"
echo ""

# Optional: Google Sheets setup
echo -e "${YELLOW}📊 GOOGLE SHEETS INTEGRATION (Tùy chọn)${NC}"
read -p "Bạn có muốn cấu hình Google Sheets? (y/n): " setup_sheets

if [[ $setup_sheets =~ ^[Yy] ]]; then
    echo ""
    echo -e "${BLUE}📋 Hướng dẫn cấu hình Google Sheets:${NC}"
    echo "1. Truy cập: https://console.cloud.google.com/"
    echo "2. Tạo Service Account và tải JSON credentials"
    echo "3. Đặt file JSON vào: config/service_account.json"
    echo "4. Share Google Sheet với email của Service Account"
    echo ""

    read -p "📎 Đường dẫn đến file credentials JSON: " json_path

    if [ -f "$json_path" ]; then
        mkdir -p config
        cp "$json_path" config/service_account.json
        echo -e "${GREEN}✅ Đã sao chép file credentials${NC}"

        # Update .env
        if [[ "$OSTYPE" == "darwin"* ]]; then
            sed -i '' "s/GOOGLE_SHEETS_ENABLED=.*/GOOGLE_SHEETS_ENABLED=true/" .env
        else
            sed -i "s/GOOGLE_SHEETS_ENABLED=.*/GOOGLE_SHEETS_ENABLED=true/" .env
        fi
    else
        echo -e "${RED}❌ File không tồn tại: $json_path${NC}"
        echo -e "${YELLOW}⚠️ Bỏ qua Google Sheets integration${NC}"
    fi
fi

echo ""
echo -e "${YELLOW}📧 EMAIL NOTIFICATIONS (Tùy chọn)${NC}"
read -p "Bạn có muốn cấu hình email notifications? (y/n): " setup_email

if [[ $setup_email =~ ^[Yy] ]]; then
    echo ""
    read -p "📧 Email gửi (Gmail): " email_from
    echo -n "🔑 App Password: "
    read -s email_password
    echo ""
    read -p "📫 Email nhận: " email_to

    # Update .env
    if [[ "$OSTYPE" == "darwin"* ]]; then
        sed -i '' "s/EMAIL_ENABLED=.*/EMAIL_ENABLED=true/" .env
        sed -i '' "s/EMAIL_USERNAME=.*/EMAIL_USERNAME=$email_from/" .env
        sed -i '' "s/EMAIL_PASSWORD=.*/EMAIL_PASSWORD=$email_password/" .env
        sed -i '' "s/EMAIL_FROM=.*/EMAIL_FROM=$email_from/" .env
        sed -i '' "s/EMAIL_TO=.*/EMAIL_TO=$email_to/" .env
    else
        sed -i "s/EMAIL_ENABLED=.*/EMAIL_ENABLED=true/" .env
        sed -i "s/EMAIL_USERNAME=.*/EMAIL_USERNAME=$email_from/" .env
        sed -i "s/EMAIL_PASSWORD=.*/EMAIL_PASSWORD=$email_password/" .env
        sed -i "s/EMAIL_FROM=.*/EMAIL_FROM=$email_from/" .env
        sed -i "s/EMAIL_TO=.*/EMAIL_TO=$email_to/" .env
    fi

    echo -e "${GREEN}✅ Đã cấu hình email notifications${NC}"
fi

echo ""
echo -e "${GREEN}🎉 CÁU HÌNH HOÀN THÀNH!${NC}"
echo ""
echo -e "${BLUE}📁 File đã tạo/cập nhật:${NC}"
echo "   ✅ .env (credentials)"
if [ -f "config/service_account.json" ]; then
    echo "   ✅ config/service_account.json (Google Sheets)"
fi
echo ""
echo -e "${YELLOW}🔒 BẢO MẬT:${NC}"
echo "   • Không commit file .env vào git"
echo "   • Không chia sẻ credentials với người khác"
echo "   • Thay đổi password định kỳ"
echo ""
echo -e "${CYAN}⭐ Tiếp theo: Chạy './start.sh' để bắt đầu sử dụng${NC}"
