#!/bin/bash

# 🔧 AI Service Virtual Environment Setup
# Tự động tạo venv với Python 3.11 (tương thích với pydantic-core)

echo "🔧 Setting up AI Service Virtual Environment"
echo "================================================="

# Color codes
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

# Yêu cầu: Python 3.11+ (khuyến nghị 3.11 hoặc 3.12 để vận hành ổn định)
check_python_version() {
    local py="$1"
    local v=$($py -c 'import sys; print(f"{sys.version_info.major}.{sys.version_info.minor}")' 2>/dev/null)
    if [ -z "$v" ]; then return 1; fi
    local major=$($py -c 'import sys; print(sys.version_info.major)' 2>/dev/null)
    local minor=$($py -c 'import sys; print(sys.version_info.minor)' 2>/dev/null)
    [ "$major" -eq 3 ] && [ "$minor" -ge 11 ] && echo "$v" && return 0
    return 1
}

PYTHON_CMD=""
for candidate in python3.11 python3.12 python3.13 python3; do
    if command -v "$candidate" &> /dev/null; then
        ver=$(check_python_version "$candidate")
        if [ -n "$ver" ]; then
            PYTHON_CMD="$candidate"
            echo -e "${GREEN}✓${NC} Using $candidate (Python $ver)"
            break
        fi
    fi
done

if [ -z "$PYTHON_CMD" ]; then
    echo -e "${YELLOW}⚠${NC} Python 3.11+ not found. Install for stable operation:"
    echo "   macOS:  brew install python@3.11"
    echo "   Ubuntu: sudo apt install python3.11 python3.11-venv"
    exit 1
fi

# Backup old venv if exists
if [ -d "venv" ]; then
    echo -e "${BLUE}[INFO]${NC} Backing up old venv..."
    mv venv "venv.backup.$(date +%Y%m%d_%H%M%S)"
fi

# Create new venv
echo -e "${BLUE}[INFO]${NC} Creating virtual environment with $PYTHON_CMD..."
$PYTHON_CMD -m venv venv

# Activate and upgrade pip
echo -e "${BLUE}[INFO]${NC} Upgrading pip, setuptools, wheel..."
source venv/bin/activate
pip install --upgrade pip setuptools wheel

# Install dependencies
echo -e "${BLUE}[INFO]${NC} Installing dependencies..."
pip install -r requirements.txt

echo ""
echo -e "${GREEN}✓${NC} Setup completed successfully!"
echo ""
echo "To activate the virtual environment:"
echo "  source venv/bin/activate"
echo ""
echo "To start the AI service:"
echo "  python -m uvicorn main_simple:app --host 0.0.0.0 --port 8000 --reload"

