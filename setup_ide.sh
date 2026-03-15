#!/bin/bash

# 🚀 Script Cài đặt IDE cho React-OAS-Integration-v4.0
# Hỗ trợ VS Code và Cursor trên Mac
# Updated: 2026-01-22
# Includes: Tailwind v3, Prettier, Babel, TypeScript, Coding Conventions

set -e

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
RED='\033[0;31m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

echo -e "${CYAN}╔════════════════════════════════════════════════════════╗${NC}"
echo -e "${CYAN}║  🚀 React-OAS-Integration-v4.0 IDE Setup             ║${NC}"
echo -e "${CYAN}║  📦 Tailwind v3 + Prettier + Babel + TypeScript      ║${NC}"
echo -e "${CYAN}╚════════════════════════════════════════════════════════╝${NC}"
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
        # Essential
        "esbenp.prettier-vscode"           # Code formatter
        "dbaeumer.vscode-eslint"           # JavaScript linter
        "bradlc.vscode-tailwindcss"        # Tailwind CSS IntelliSense

        # JavaScript/TypeScript
        "ms-vscode.vscode-typescript-next" # TypeScript support

        # Git & Version Control
        "eamodio.gitlens"                  # Git supercharged

        # Python (for AI service)
        "ms-python.python"                 # Python support
        "ms-python.black-formatter"        # Python formatter
        "ms-python.flake8"                 # Python linter
        "ms-python.isort"                  # Import sorter
        "ms-toolsai.jupyter"               # Jupyter notebooks

        # Database & API
        "Prisma.prisma"                    # Prisma ORM
        "GraphQL.vscode-graphql"           # GraphQL

        # Utilities
        "csstools.postcss"                 # PostCSS support
        "formulahendry.code-runner"        # Run code snippets
        "pkief.material-icon-theme"        # File icons
        "styled-components.vscode-styled-components" # Styled components
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

# Kiểm tra Dependencies
echo -e "${BLUE}📦 Kiểm tra Project Dependencies...${NC}"

if [ -f "package.json" ]; then
    echo -e "${GREEN}✅ package.json${NC}"

    # Check key packages
    KEY_PACKAGES=(
        "tailwindcss:Tailwind CSS v3"
        "prettier:Code Formatter"
        "@babel/preset-env:Babel ES6+"
        "@babel/preset-react:Babel React/JSX"
        "typescript:TypeScript Support"
        "@types/react:React Type Definitions"
    )

    for pkg_info in "${KEY_PACKAGES[@]}"; do
        pkg="${pkg_info%%:*}"
        label="${pkg_info##*:}"
        if grep -q "\"$pkg\"" package.json; then
            echo -e "   ${GREEN}✓${NC} $label"
        else
            echo -e "   ${YELLOW}⚠${NC} $label (chưa cài)"
        fi
    done
else
    echo -e "${RED}✗ package.json (thiếu)${NC}"
fi

echo ""

# Kiểm tra Config Files
echo -e "${BLUE}⚙️  Kiểm tra Configuration Files...${NC}"


# Verify Tailwind & Prettier
echo -e "${BLUE}🎨 Kiểm tra Tailwind & Prettier...${NC}"

if command -v npx &> /dev/null; then
    # Check Tailwind
    if [ -f "node_modules/.bin/tailwindcss" ]; then
        TAILWIND_VERSION=$(npx tailwindcss --help 2>&1 | grep "tailwindcss v" | head -1)
        if [ ! -z "$TAILWIND_VERSION" ]; then
            echo -e "${GREEN}✅ $TAILWIND_VERSION${NC}"
        else
            echo -e "${GREEN}✅ Tailwind CSS installed${NC}"
        fi
    else
        echo -e "${YELLOW}⚠️  Tailwind CSS chưa cài (chạy: npm install)${NC}"
    fi

    # Check Prettier
    if [ -f "node_modules/.bin/prettier" ]; then
        PRETTIER_VERSION=$(npx prettier --version 2>&1)
        echo -e "${GREEN}✅ Prettier $PRETTIER_VERSION${NC}"
    else
        echo -e "${YELLOW}⚠️  Prettier chưa cài (chạy: npm install)${NC}"
    fi
else
    echo -e "${YELLOW}⚠️  npx không có (cài Node.js)${NC}"
fi

echo ""
echo -e "${CYAN}════════════════════════════════════════════════════════${NC}"
echo ""

# Quick Commands
echo -e "${GREEN}🎯 Quick Commands:${NC}"
echo ""
echo -e "${BLUE}Development:${NC}"
echo "  npm start              # Start dev server"
echo "  npm run dev:simple     # Frontend + Backend"
echo "  npm run build          # Production build"
echo ""
echo -e "${BLUE}Code Quality:${NC}"
echo "  npm run lint           # Check linting"
echo "  npm run lint:fix       # Auto fix lint issues"
echo "  npm run format         # Format with Prettier"
echo "  npm run format:check   # Check formatting"
echo ""
echo -e "${BLUE}Type Checking:${NC}"
echo "  npm run type:check     # TypeScript check"
echo "  npx tsc --noEmit       # Full type check"
echo ""
echo -e "${BLUE}Open IDE:${NC}"

if command -v code &> /dev/null; then
    echo "  code .                 # Open in VS Code"
fi

if command -v cursor &> /dev/null; then
    echo "  cursor .               # Open in Cursor"
fi

echo ""
echo -e "${CYAN}════════════════════════════════════════════════════════${NC}"
echo ""

# Coding Conventions
echo -e "${GREEN}📝 Coding Conventions:${NC}"
echo ""
echo "  📄 Xem chi tiết: .vscode/CODE_CONVENTIONS.md"
echo ""
echo "  ✅ Files có JSX       → .jsx"
echo "  ✅ Files không có JSX → .js"
echo "  ✅ Sử dụng path aliases (@components, @utils, etc.)"
echo "  ✅ Format on save enabled"
echo ""

echo -e "${CYAN}════════════════════════════════════════════════════════${NC}"
echo -e "${GREEN}✨ Setup Complete!${NC}"
echo ""
echo "📚 Documentation:"
echo "   • Coding Conventions: .vscode/CODE_CONVENTIONS.md"
echo "   • Tailwind Setup:     TAILWIND_SETUP_GUIDE.md"
echo "   • Project Setup:      README_SETUP.md"
echo ""
echo -e "${CYAN}════════════════════════════════════════════════════════${NC}${NC}"

IDE_FILES=(
    ".vscode/settings.json:VSCode Settings"
    ".vscode/extensions.json:VSCode Extensions"
    ".vscode/CODE_CONVENTIONS.md:Coding Conventions"
    ".editorconfig:Editor Config"
    "React-OAS-Integration-v4.0.code-workspace:Workspace File"
)

for file_info in "${IDE_FILES[@]}"; do
    file="${file_info%%:*}"
    label="${file_info##*:}"
    if [ -f "$file" ]; then
        echo -e "${GREEN}✅ $label${NC}"
    else
        echo -e "${RED}✗ $label (thiếu)${NC}"
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
