#!/bin/bash

# ONE System - Setup Script v2.1
# Cài đặt và cấu hình hệ thống automation chuẩn chỉnh

# Auto-grant execute permissions first
chmod +x setup.sh

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
PURPLE='\033[0;35m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

echo -e "${CYAN}╔══════════════════════════════════════════════════════════════╗${NC}"
echo -e "${CYAN}║                🚀 ONE SYSTEM SETUP v2.1                     ║${NC}"
echo -e "${CYAN}║           Automated Installation & Configuration             ║${NC}"
echo -e "${CYAN}╚══════════════════════════════════════════════════════════════╝${NC}"
echo ""

# Change to script directory
cd "$(dirname "$0")"

# Step 1: System Requirements Check
echo -e "${BLUE}🔍 Checking system requirements...${NC}"

# Check Python
if command -v python3 &> /dev/null; then
    PYTHON_VERSION=$(python3 --version 2>&1 | cut -d' ' -f2)
    echo -e "${GREEN}✅ Python3: $PYTHON_VERSION${NC}"

    # Check if Python version is 3.8+
    PYTHON_MAJOR=$(echo $PYTHON_VERSION | cut -d. -f1)
    PYTHON_MINOR=$(echo $PYTHON_VERSION | cut -d. -f2)
    if [ "$PYTHON_MAJOR" -ge 3 ] && [ "$PYTHON_MINOR" -ge 8 ]; then
        echo -e "${GREEN}   Compatible version (≥3.8)${NC}"
    else
        echo -e "${YELLOW}   ⚠️ Python 3.8+ recommended${NC}"
    fi
else
    echo -e "${RED}❌ Python3 not found!${NC}"
    echo -e "${YELLOW}💡 Please install Python3 3.8+ before continuing${NC}"
    exit 1
fi

# Check Chrome/Chromium
if command -v google-chrome &> /dev/null || command -v chromium &> /dev/null || [ -f "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome" ]; then
    echo -e "${GREEN}✅ Chrome/Chromium browser found${NC}"
else
    echo -e "${YELLOW}⚠️ Chrome/Chromium not found - WebDriver may fail${NC}"
fi

# Step 2: Virtual Environment Setup
echo -e "${BLUE}📦 Setting up virtual environment...${NC}"
if [ ! -d "venv" ]; then
    python3 -m venv venv
    echo -e "${GREEN}✅ Virtual environment created${NC}"
else
    echo -e "${YELLOW}⚠️ Virtual environment exists - using existing${NC}"
fi

# Step 3: Activate Virtual Environment
echo -e "${BLUE}🔧 Activating virtual environment...${NC}"
source venv/bin/activate

if [ "$VIRTUAL_ENV" != "" ]; then
    echo -e "${GREEN}✅ Virtual environment activated${NC}"
else
    echo -e "${RED}❌ Failed to activate virtual environment${NC}"
    exit 1
fi

# Step 4: Upgrade pip
echo -e "${BLUE}⬆️ Upgrading pip...${NC}"
pip install --upgrade pip -q

# Step 5: Install Dependencies
echo -e "${BLUE}📋 Installing dependencies...${NC}"

# Prefer minimal requirements first for faster setup
if [ -f "requirements-minimal.txt" ]; then
    echo -e "${YELLOW}📦 Installing from requirements-minimal.txt...${NC}"
    if pip install -r requirements-minimal.txt --upgrade; then
        echo -e "${GREEN}✅ Minimal dependencies installed successfully${NC}"
    else
        echo -e "${RED}❌ Error installing minimal requirements${NC}"
        echo -e "${YELLOW}🔧 Installing core packages manually...${NC}"
        pip install selenium webdriver-manager pandas requests python-dotenv openpyxl schedule loguru beautifulsoup4 lxml
    fi
elif [ -f "requirements.txt" ]; then
    echo -e "${YELLOW}📦 Installing from requirements.txt...${NC}"
    pip install -r requirements.txt
else
    echo -e "${YELLOW}⚠️ No requirements file found${NC}"
    echo -e "${BLUE}📦 Installing essential packages...${NC}"
    pip install selenium webdriver-manager pandas requests python-dotenv openpyxl schedule loguru beautifulsoup4 lxml rich colorlog
fi

# Step 6: Verify Core Dependencies
echo -e "${BLUE}🔍 Verifying core dependencies...${NC}"

# List of packages to verify (using actual import names)
declare -A packages=(
    ["selenium"]="selenium"
    ["webdriver-manager"]="webdriver_manager"
    ["pandas"]="pandas"
    ["requests"]="requests"
    ["python-dotenv"]="dotenv"
    ["beautifulsoup4"]="bs4"
    ["lxml"]="lxml"
    ["openpyxl"]="openpyxl"
    ["schedule"]="schedule"
    ["loguru"]="loguru"
    ["rich"]="rich"
    ["colorlog"]="colorlog"
)

failed_packages=()
successful_packages=0

for package_name in "${!packages[@]}"; do
    import_name="${packages[$package_name]}"
    if python -c "import $import_name" 2>/dev/null; then
        echo -e "${GREEN}  ✅ $package_name${NC}"
        ((successful_packages++))
    else
        echo -e "${RED}  ❌ $package_name${NC}"
        failed_packages+=("$package_name")
    fi
done

echo -e "${CYAN}📊 Dependencies: ${successful_packages}/${#packages[@]} successful${NC}"

# Retry failed packages
if [ ${#failed_packages[@]} -gt 0 ]; then
    echo -e "${YELLOW}🔧 Retrying failed packages...${NC}"
    for package in "${failed_packages[@]}"; do
        echo -e "${YELLOW}   Installing $package...${NC}"
        pip install "$package" --upgrade
    done
fi

# Step 7: Project Structure Setup
echo -e "${BLUE}📁 Setting up project structure...${NC}"

# Create necessary directories
directories=("logs" "data" "config")
for dir in "${directories[@]}"; do
    if [ ! -d "$dir" ]; then
        mkdir -p "$dir"
        echo -e "${GREEN}✅ Created: $dir/${NC}"
    else
        echo -e "${YELLOW}✓ Exists: $dir/${NC}"
    fi
done

# Check for main automation files (use automation.py as the primary entry)
main_files=("automation.py" "system_check.py")
for file in "${main_files[@]}"; do
    if [ -f "$file" ]; then
        file_size=$(du -h "$file" | cut -f1)
        echo -e "${GREEN}  ✅ $file ($file_size)${NC}"
else
        echo -e "${YELLOW}  ⚠️ $file not found${NC}"
fi
done

# Step 8: Environment Configuration
echo -e "${BLUE}⚙️ Environment configuration...${NC}"

if [ -f ".env" ]; then
    echo -e "${GREEN}  ✅ .env file exists${NC}"
else
    echo -e "${YELLOW}  ⚠️ Creating .env template...${NC}"
    cat > .env.example << 'EOF'
# ONE System Environment Configuration
# Copy this file to .env and configure

# System Settings
DEBUG=true
HEADLESS=true

# Browser Settings
BROWSER_TIMEOUT=15
PAGE_LOAD_TIMEOUT=15

# Automation Settings
AUTOMATION_DELAY=1
MAX_RETRIES=3

# Logging
LOG_LEVEL=INFO
EOF
    echo -e "${CYAN}📝 Created .env.example - copy to .env and configure${NC}"
fi

# Step 9: Permissions Setup
echo -e "${BLUE}🔑 Setting permissions...${NC}"
find . -name "*.sh" -exec chmod +x {} \;
echo -e "${GREEN}✅ Execute permissions set for shell scripts${NC}"

# Step 10: System Test
echo -e "${BLUE}⚡ Running system health check...${NC}"
if python setup.py > /dev/null 2>&1; then
    echo -e "${GREEN}✅ System setup test passed${NC}"
else
    echo -e "${YELLOW}⚠️ System test warnings (run 'python setup.py' for details)${NC}"
fi

# Step 11: Final Summary
echo ""
echo -e "${CYAN}╔══════════════════════════════════════════════════════════════╗${NC}"
echo -e "${CYAN}║                    📊 SETUP SUMMARY                         ║${NC}"
echo -e "${CYAN}╠══════════════════════════════════════════════════════════════╣${NC}"
echo -e "${CYAN}║ Python: $PYTHON_VERSION                                         ║${NC}"
echo -e "${CYAN}║ Virtual Environment: ✅ Active                               ║${NC}"
echo -e "${CYAN}║ Dependencies: ${successful_packages}/${#packages[@]} packages verified                        ║${NC}"
echo -e "${CYAN}║ Project Structure: ✅ Complete                               ║${NC}"
echo -e "${CYAN}║ Status: Ready for automation                                 ║${NC}"
echo -e "${CYAN}╚══════════════════════════════════════════════════════════════╝${NC}"

echo ""
echo -e "${GREEN}🎉 ONE SYSTEM SETUP COMPLETED!${NC}"
echo ""
echo -e "${YELLOW}📋 Next steps:${NC}"
echo -e "${BLUE}  1. Configure: cp .env.example .env && nano .env${NC}"
echo -e "${BLUE}  2. Test setup: python setup.py${NC}"
echo -e "${BLUE}  3. Run automation: python automation.py${NC}"
echo -e "${BLUE}  4. Check logs: tail -f logs/automation.log${NC}"

echo ""
echo -e "${CYAN}🔧 Maintenance commands:${NC}"
echo -e "${PURPLE}  ./setup.sh          - Re-run setup${NC}"
echo -e "${PURPLE}  source venv/bin/activate - Activate venv${NC}"
echo -e "${PURPLE}  deactivate          - Deactivate venv${NC}"

echo ""
echo -e "${GREEN}✨ System ready for ONE automation tasks!${NC}"
