#!/bin/bash
# Script để chạy main.py với virtual environment

cd "$(dirname "$0")"
AUTOMATION_ROOT="$(cd .. && pwd)"

# Activate virtual environment nếu có
if [ -f "$AUTOMATION_ROOT/venv/bin/activate" ]; then
    source "$AUTOMATION_ROOT/venv/bin/activate"
    echo "✅ Virtual environment activated"
elif [ -f "$AUTOMATION_ROOT/.venv/bin/activate" ]; then
    source "$AUTOMATION_ROOT/.venv/bin/activate"
    echo "✅ Virtual environment activated (.venv)"
fi

# Chạy main.py
echo "🚀 Starting OneAutomation System..."
python3 "$AUTOMATION_ROOT/src/main.py"

