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

echo "🚀 Starting legacy AI app (main_simple.py)..."
python3 main_simple.py

