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

# Check for Python 3.11
if command -v python3.11 &> /dev/null; then
    PYTHON_CMD="python3.11"
    echo -e "${GREEN}✓${NC} Found Python 3.11"
elif command -v python3.12 &> /dev/null; then
    PYTHON_CMD="python3.12"
    echo -e "${YELLOW}!${NC} Using Python 3.12 (Python 3.11 recommended)"
elif command -v python3.13 &> /dev/null; then
    PYTHON_CMD="python3.13"
    echo -e "${YELLOW}!${NC} Using Python 3.13 (Python 3.11 recommended)"
else
    echo -e "${YELLOW}⚠${NC} Python 3.11 not found. Please install Python 3.11:"
    echo "   brew install python@3.11"
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

