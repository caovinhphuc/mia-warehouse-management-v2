#!/bin/bash
# Script để chạy main_simple.py với virtual environment

cd "$(dirname "$0")"

# Activate virtual environment nếu có
if [ -f "bin/activate" ]; then
    source bin/activate
    echo "✅ Virtual environment activated"
elif [ -f "venv/bin/activate" ]; then
    source venv/bin/activate
    echo "✅ Virtual environment activated (venv)"
fi

# Chạy main.py
echo "🚀 Starting OneAutomation System..."
python3 main_simple.py

