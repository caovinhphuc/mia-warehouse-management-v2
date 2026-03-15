#!/bin/bash

set -e

cd "$(dirname "$0")"

if [ -f "bin/activate" ]; then
    source bin/activate
    echo "✅ Virtual environment activated"
elif [ -f "venv/bin/activate" ]; then
    source venv/bin/activate
    echo "✅ Virtual environment activated (venv)"
fi

echo "🚀 Starting MIA AI Service (ai_service.py)..."
python3 ai_service.py

