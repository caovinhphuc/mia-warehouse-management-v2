#!/bin/bash

# Start Backend Server Script
# Khởi động automation_bridge.py backend

echo "🚀 Starting Shipping SLA Backend Server..."
echo "📍 Backend API: http://localhost:8000"
echo "📍 API Documentation: http://localhost:8000/docs"
echo "🔗 Health Check: http://localhost:8000/health"
echo ""

# Check if Python is installed
if ! command -v python3 &> /dev/null; then
    echo "❌ Python 3 is not installed. Please install Python 3."
    exit 1
fi

# Check if required packages are installed
echo "📦 Checking dependencies..."

# Install required packages if not present
pip3 install --quiet fastapi uvicorn pandas openpyxl python-multipart

echo "✅ Dependencies checked"
echo ""

# Start the server
echo "🔄 Starting automation_bridge.py server..."
echo "Press Ctrl+C to stop the server"
echo ""

python3 automation_bridge.py
