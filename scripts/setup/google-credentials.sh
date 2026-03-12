#!/bin/bash

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

echo "🔧 THIẾT LẬP VỊ TRÍ GOOGLE CREDENTIALS"
echo "====================================="
echo ""

# Tạo thư mục nếu chưa có
if [ ! -d "automation/config" ]; then
    echo -e "${BLUE}1. Tạo thư mục automation/config...${NC}"
    mkdir -p automation/config
    echo -e "   ${GREEN}✅ Đã tạo thư mục${NC}"
else
    echo -e "${GREEN}✅ Thư mục automation/config đã tồn tại${NC}"
fi

echo ""

# Kiểm tra file credentials
if [ -f "automation/config/google-credentials.json" ]; then
    echo -e "${GREEN}✅ File credentials đã có tại: automation/config/google-credentials.json${NC}"
    echo ""
    echo "📋 Thông tin file:"
    ls -lh automation/config/google-credentials.json
    echo ""
    echo "📋 Service Account:"
    python3 -c "import json; f=open('automation/config/google-credentials.json'); d=json.load(f); print(f\"   Email: {d.get('client_email', 'N/A')}\n   Project: {d.get('project_id', 'N/A')}\")" 2>/dev/null || echo "   (Không thể đọc)"
else
    echo -e "${YELLOW}⚠️  File credentials chưa có${NC}"
    echo ""
    echo "📝 HƯỚNG DẪN:"
    echo "   1. Tải file JSON từ Google Cloud Console"
    echo "   2. Đặt file vào: automation/config/google-credentials.json"
    echo "   3. File phải có các field:"
    echo "      - client_email"
    echo "      - project_id"
    echo "      - private_key"
    echo ""
    echo "💡 Ví dụ:"
    echo "   cp ~/Downloads/your-credentials.json automation/config/google-credentials.json"
fi

echo ""
echo "✅ Vị trí đúng: automation/config/google-credentials.json"
