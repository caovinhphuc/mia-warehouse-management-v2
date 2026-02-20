#!/bin/bash

# 🚀 Script Cài đặt IDE cho React-OAS-Integration-v4.0
# Hỗ trợ VS Code và Cursor trên Mac

set -e

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
RED='\033[0;31m'
NC='\033[0m' # No Color

echo -e "${BLUE}🚀 Cài đặt Cấu hình IDE cho React-OAS-Integration-v4.0${NC}"
echo "=================================================="
echo ""

# Kiểm tra VS Code
if command -v code &> /dev/null; then
    echo -e "${GREEN}✅ VS Code đã được cài đặt${NC}"
    VS_CODE_VERSION=$(code --version | head -n 1)
    echo "   Phiên bản: $VS_CODE_VERSION"
else
    echo -e "${YELLOW}⚠️  VS Code chưa được cài đặt${NC}"
    echo "   Tải về tại: https://code.visualstudio.com/"
fi

echo ""

# Kiểm tra Cursor
if command -v cursor &> /dev/null; then
    echo -e "${GREEN}✅ Cursor đã được cài đặt${NC}"
    CURSOR_VERSION=$(cursor --version 2>/dev/null || echo "installed")
    echo "   Phiên bản: $CURSOR_VERSION"
else
    echo -e "${YELLOW}⚠️  Cursor chưa được cài đặt${NC}"
    echo "   Tải về tại: https://cursor.sh/"
fi

echo ""
echo "=================================================="
echo ""

# Cài đặt VS Code Extensions
if command -v code &> /dev/null; then
    echo -e "${BLUE}📦 Cài đặt VS Code Extensions...${NC}"

    EXTENSIONS=(
        "esbenp.prettier-vscode"
        "dbaeumer.vscode-eslint"
        "eamodio.gitlens"
        "ms-vscode.vscode-typescript-next"
        "bradlc.vscode-tailwindcss"
        "ms-python.python"
        "ms-toolsai.jupyter"
        "Prisma.prisma"
        "GraphQL.vscode-graphql"
        "pkief.material-icon-theme"
        "styled-components.vscode-styled-components"
        "csstools.postcss"
        "formulahendry.code-runner"
        "ms-python.black-formatter"
        "ms-python.flake8"
        "ms-python.isort"
    )

    INSTALLED=0
    SKIPPED=0

    for ext in "${EXTENSIONS[@]}"; do
        if code --list-extensions | grep -q "^${ext}$"; then
            echo -e "   ${GREEN}✓${NC} $ext (đã cài)"
            ((SKIPPED++))
        else
            echo -e "   ${YELLOW}→${NC} Đang cài $ext..."
            if code --install-extension "$ext" &> /dev/null; then
                echo -e "   ${GREEN}✓${NC} $ext (đã cài)"
                ((INSTALLED++))
            else
                echo -e "   ${RED}✗${NC} $ext (lỗi)"
            fi
        fi
    done

    echo ""
    echo -e "${GREEN}✅ Đã cài: $INSTALLED extensions${NC}"
    echo -e "${BLUE}ℹ️  Đã có: $SKIPPED extensions${NC}"
    echo ""
fi

# Kiểm tra Python
echo -e "${BLUE}🐍 Kiểm tra Python...${NC}"
if command -v python3 &> /dev/null; then
    PYTHON_VERSION=$(python3 --version)
    echo -e "${GREEN}✅ $PYTHON_VERSION${NC}"
    echo "   Path: $(which python3)"
else
    echo -e "${RED}✗ Python3 chưa được cài đặt${NC}"
    echo "   Cài đặt: brew install python3"
fi

echo ""

# Kiểm tra Node.js
echo -e "${BLUE}📦 Kiểm tra Node.js...${NC}"
if command -v node &> /dev/null; then
    NODE_VERSION=$(node --version)
    echo -e "${GREEN}✅ Node.js $NODE_VERSION${NC}"
    echo "   Path: $(which node)"

    if command -v npm &> /dev/null; then
        NPM_VERSION=$(npm --version)
        echo -e "${GREEN}✅ npm $NPM_VERSION${NC}"
    fi
else
    echo -e "${RED}✗ Node.js chưa được cài đặt${NC}"
    echo "   Cài đặt: brew install node"
fi

echo ""

# Kiểm tra Shell
echo -e "${BLUE}🐚 Kiểm tra Shell...${NC}"
CURRENT_SHELL=$(echo $SHELL)
echo "   Shell hiện tại: $CURRENT_SHELL"

if [[ "$CURRENT_SHELL" == *"zsh"* ]]; then
    echo -e "${GREEN}✅ Đang sử dụng zsh${NC}"
else
    echo -e "${YELLOW}⚠️  Khuyến nghị sử dụng zsh${NC}"
    echo "   Đổi sang zsh: chsh -s /bin/zsh"
fi

echo ""

# Kiểm tra cấu trúc thư mục
echo -e "${BLUE}📁 Kiểm tra Cấu trúc Thư mục...${NC}"

REQUIRED_DIRS=(
    ".vscode"
    ".cursor"
)

for dir in "${REQUIRED_DIRS[@]}"; do
    if [ -d "$dir" ]; then
        echo -e "${GREEN}✅ $dir/${NC}"
    else
        echo -e "${RED}✗ $dir/ (thiếu)${NC}"
    fi
done

REQUIRED_FILES=(
    ".vscode/settings.json"
    ".vscode/extensions.json"
    ".cursor/settings.json"
    ".cursor/extensions.json"
    ".editorconfig"
    "React-OAS-Integration-v4.0.code-workspace"
)

for file in "${REQUIRED_FILES[@]}"; do
    if [ -f "$file" ]; then
        echo -e "${GREEN}✅ $file${NC}"
    else
        echo -e "${RED}✗ $file (thiếu)${NC}"
    fi
done

echo ""
echo "=================================================="
echo ""

# Hướng dẫn mở workspace
echo -e "${GREEN}🎯 Hướng dẫn Mở Workspace:${NC}"
echo ""

if command -v code &> /dev/null; then
    echo -e "${BLUE}VS Code:${NC}"
    echo "  code React-OAS-Integration-v4.0.code-workspace"
    echo "  hoặc: code ."
    echo ""
fi

if command -v cursor &> /dev/null; then
    echo -e "${BLUE}Cursor:${NC}"
    echo "  cursor React-OAS-Integration-v4.0.code-workspace"
    echo "  hoặc: cursor ."
    echo ""
fi

echo "=================================================="
echo -e "${GREEN}✨ Hoàn tất!${NC}"
echo ""
echo "📚 Xem thêm hướng dẫn tại: README_SETUP.md"
echo ""
