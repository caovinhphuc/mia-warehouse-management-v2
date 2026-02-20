#!/bin/bash

# ================================================
# MIA Warehouse Management - Auto Installation Script
# For macOS/Linux systems
# ================================================

set -e  # Exit on any error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Function to check if command exists
command_exists() {
    command -v "$1" >/dev/null 2>&1
}

# Function to check version
check_version() {
    local cmd=$1
    local min_version=$2
    local current_version=$3
    
    if [[ $(echo -e "$min_version\n$current_version" | sort -V | head -n1) != "$min_version" ]]; then
        return 1
    fi
    return 0
}

print_status "🚀 Starting MIA Warehouse Management Installation..."
echo "=================================================="

# Check system requirements
print_status "🔍 Checking system requirements..."

# Check Node.js
if command_exists node; then
    NODE_VERSION=$(node --version | sed 's/v//')
    if check_version "16.0.0" "$NODE_VERSION"; then
        print_success "✅ Node.js $NODE_VERSION found"
    else
        print_error "❌ Node.js version $NODE_VERSION is too old. Required: 16.0+"
        print_status "Please install Node.js 16+ from https://nodejs.org/"
        exit 1
    fi
else
    print_error "❌ Node.js not found"
    print_status "Please install Node.js from https://nodejs.org/"
    exit 1
fi

# Check Python
if command_exists python3; then
    PYTHON_VERSION=$(python3 --version | awk '{print $2}')
    if check_version "3.8.0" "$PYTHON_VERSION"; then
        print_success "✅ Python $PYTHON_VERSION found"
    else
        print_error "❌ Python version $PYTHON_VERSION is too old. Required: 3.8+"
        exit 1
    fi
else
    print_error "❌ Python 3 not found"
    print_status "Please install Python 3.8+ from https://python.org/"
    exit 1
fi

# Check Git
if command_exists git; then
    print_success "✅ Git found"
else
    print_error "❌ Git not found"
    print_status "Please install Git from https://git-scm.com/"
    exit 1
fi

# Check Google Chrome
if command_exists google-chrome || command_exists chromium-browser || [[ -f "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome" ]]; then
    print_success "✅ Google Chrome found"
else
    print_warning "⚠️ Google Chrome not found. Please install from https://google.com/chrome"
fi

print_success "🎯 All system requirements satisfied!"
echo ""

# Install frontend dependencies
print_status "📦 Installing frontend dependencies..."
if npm install; then
    print_success "✅ Frontend dependencies installed"
else
    print_error "❌ Failed to install frontend dependencies"
    exit 1
fi

# Create Python virtual environment
print_status "🐍 Setting up Python virtual environment..."
if python3 -m venv venv; then
    print_success "✅ Virtual environment created"
else
    print_error "❌ Failed to create virtual environment"
    exit 1
fi

# Activate virtual environment and install packages
print_status "📚 Installing Python dependencies..."
if source venv/bin/activate && pip install -r requirements.txt; then
    print_success "✅ Python dependencies installed"
else
    print_error "❌ Failed to install Python dependencies"
    exit 1
fi

# Install ChromeDriver (macOS with Homebrew)
if [[ "$OSTYPE" == "darwin"* ]] && command_exists brew; then
    print_status "🚗 Installing ChromeDriver..."
    if brew install chromedriver 2>/dev/null || brew upgrade chromedriver 2>/dev/null; then
        print_success "✅ ChromeDriver installed/updated"
    else
        print_warning "⚠️ ChromeDriver installation failed. You may need to install manually."
    fi
elif [[ "$OSTYPE" == "linux-gnu"* ]] && command_exists apt-get; then
    print_status "🚗 Installing ChromeDriver..."
    if sudo apt-get update && sudo apt-get install -y chromium-chromedriver; then
        print_success "✅ ChromeDriver installed"
    else
        print_warning "⚠️ ChromeDriver installation failed. You may need to install manually."
    fi
else
    print_warning "⚠️ Please install ChromeDriver manually from https://chromedriver.chromium.org/"
fi

# Setup environment file
print_status "⚙️ Setting up environment configuration..."
if [[ ! -f .env ]]; then
    if cp .env.example .env; then
        print_success "✅ Environment file created (.env)"
        print_warning "⚠️ Please edit .env file with your actual API keys and credentials"
    else
        print_error "❌ Failed to create environment file"
        exit 1
    fi
else
    print_success "✅ Environment file already exists"
fi

# Create necessary directories
print_status "📁 Creating necessary directories..."
mkdir -p logs data/exports config
print_success "✅ Directories created"

# Test installation
print_status "🧪 Testing installation..."

# Test Python imports
if source venv/bin/activate && python3 -c "import selenium, fastapi, pandas; print('Python packages OK')"; then
    print_success "✅ Python packages working"
else
    print_error "❌ Python packages test failed"
    exit 1
fi

# Test WebDriver (if available)
if source venv/bin/activate && python3 test_webdriver.py >/dev/null 2>&1; then
    print_success "✅ WebDriver test passed"
else
    print_warning "⚠️ WebDriver test failed - please check ChromeDriver installation"
fi

# Make scripts executable
print_status "🔧 Setting up execution permissions..."
chmod +x start_all.sh start_backend.sh update.sh run_all.sh 2>/dev/null || true
print_success "✅ Scripts made executable"

echo ""
echo "=================================================="
print_success "🎉 Installation completed successfully!"
echo ""
print_status "📋 Next steps:"
echo "1. Edit .env file with your actual credentials:"
echo "   - REACT_APP_GOOGLE_SHEETS_API_KEY"
echo "   - REACT_APP_GOOGLE_SHEETS_ID"
echo "   - ONE_USERNAME"
echo "   - ONE_PASSWORD"
echo ""
echo "2. Start the application:"
echo "   ./start_all.sh"
echo ""
echo "3. Or start components separately:"
echo "   Frontend: npm start"
echo "   Backend:  source venv/bin/activate && python automation_bridge.py"
echo ""
print_status "📚 Documentation:"
echo "   - Quick Start: QUICK_START.md"
echo "   - Full Guide:  INSTALLATION.md"
echo "   - Structure:   PROJECT_STRUCTURE.md"
echo ""
print_status "🆘 Support: warehouse@mia.vn"
echo "=================================================="