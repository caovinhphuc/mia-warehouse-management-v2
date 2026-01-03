chmod +x scripts/setup.sh#!/bin/bash

## OneAutomation System - Setup Script
## Tự động cài đặt và cấu hình hệ thống
set -e

echo "🚀 OneAutomation System Setup Script"
echo "======================================"
## Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color
## Function to print colored output
print_status() {
echo -e "${GREEN}[INFO]${NC} $1"
}
print_warning() {
echo -e "${YELLOW}[WARNING]${NC} $1"
}
print_error() {
echo -e "${RED}[ERROR]${NC} $1"
}
print_step() {
echo -e "${BLUE}[STEP]${NC} $1"
}
## Check system requirements
check_requirements() {
print_step "Checking system requirements..."
# Check Node.js
if command -v node &> /dev/null; then
    NODE_VERSION=$(node --version)
    print_status "Node.js found: $NODE_VERSION"
else
    print_error "Node.js not found. Please install Node.js 16+ first."
    exit 1
fi

# Check Python
if command -v python3 &> /dev/null; then
    PYTHON_VERSION=$(python3 --version)
    print_status "Python found: $PYTHON_VERSION"
else
    print_error "Python3 not found. Please install Python 3.8+ first."
    exit 1
fi

# Check Docker (optional)
if command -v docker &> /dev/null; then
    DOCKER_VERSION=$(docker --version)
    print_status "Docker found: $DOCKER_VERSION"
    DOCKER_AVAILABLE=true
else
    print_warning "Docker not found. Manual installation will be used."
    DOCKER_AVAILABLE=false
fi
}

## Setup environment file
setup_environment() {
print_step "Setting up environment configuration..."
if [ ! -f ".env" ]; then
    if [ -f ".env.example" ]; then
        cp .env.example .env
        print_status "Created .env file from template"
        print_warning "Please edit .env file with your actual configuration"
    else
        print_error ".env.example not found"
        exit 1
    fi
else
    print_status ".env file already exists"
fi
}

## Create necessary directories
create_directories() {
print_step "Creating necessary directories..."
mkdir -p config
mkdir -p logs
mkdir -p data
mkdir -p scripts

print_status "Directories created successfully"
}

## Install dependencies
install_dependencies() {
print_step "Installing dependencies..."
# Backend dependencies
print_status "Installing backend dependencies..."
cd backend
npm install
cd ..

# Frontend dependencies
print_status "Installing frontend dependencies..."
cd frontend
npm install
cd ..

# Python dependencies
print_status "Installing Python dependencies..."
cd automation

# Create virtual environment if it doesn't exist
if [ ! -d "venv" ]; then
    python3 -m venv venv
    print_status "Created Python virtual environment"
fi

# Activate virtual environment and install dependencies
source venv/bin/activate
pip install --upgrade pip
pip install -r requirements.txt
cd ..

print_status "All dependencies installed successfully"
}

## Setup Google Sheets configuration
setup_google_sheets() {
print_step "Setting up Google Sheets configuration..."
if [ ! -f "config/service-account-key.json" ]; then
    print_warning "Google Service Account key not found."
    print_warning "Please follow these steps:"
    echo "1. Go to Google Cloud Console"
    echo "2. Create a Service Account"
    echo "3. Download the JSON key file"
    echo "4. Save it as ./config/service-account-key.json"
    echo "5. Update GOOGLE_SPREADSHEET_ID in .env file"

    read -p "Press Enter to continue after setting up Google credentials..."
else
    print_status "Google Service Account key found"
fi
}

## Test installation
test_installation() {
print_step "Testing installation..."
# Test backend
print_status "Testing backend..."
cd backend
if npm run test --if-present; then
    print_status "Backend tests passed"
else
    print_warning "Backend tests failed or not configured"
fi
cd ..

# Test frontend
print_status "Testing frontend..."
cd frontend
if npm run test -- --watchAll=false --passWithNoTests; then
    print_status "Frontend tests passed"
else
    print_warning "Frontend tests failed or not configured"
fi
cd ..

print_status "Installation test completed"
}

## Setup completion message
setup_complete() {
print_step "Setup completed successfully! 🎉"
echo ""
echo "Next steps:"
echo "==========="
echo "1. Edit .env file with your actual configuration"
echo "2. Setup Google Sheets API credentials"
echo "3. Configure email SMTP settings (optional)"
echo ""
echo "To start the application:"
echo "========================"
if [ "$DOCKER_AVAILABLE" = true ]; then
echo "Using Docker (Recommended):"
echo " docker-compose up --build"
echo ""
fi
echo "Manual startup:"
echo " # Terminal 1 - Backend"
echo " cd backend && npm run dev"
echo ""
echo " # Terminal 2 - Frontend"
echo " cd frontend && npm start"
echo ""
echo " # Terminal 3 - Python Automation"
echo " cd automation && source venv/bin/activate && python src/main.py"
echo ""
echo "Application will be available at:"
echo "- Frontend: http://localhost:3000"
echo "- Backend API: http://localhost:5000"
echo "- Python API: http://localhost:8000"
echo ""
echo "Default login credentials:"
echo "- Username: admin"
echo "- Password: admin123"
}
## Main setup function
main() {
echo "Starting OneAutomation System setup..."
echo ""
check_requirements
setup_environment
create_directories
install_dependencies
setup_google_sheets
test_installation
setup_complete
}

## Run main function
main "$@"
