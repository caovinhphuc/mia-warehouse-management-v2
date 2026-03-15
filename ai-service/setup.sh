#!/bin/bash

set -e

GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
RED='\033[0;31m'
NC='\033[0m'

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$SCRIPT_DIR"

echo -e "${BLUE}=== MIA AI Service Setup ===${NC}"

if ! command -v python3 > /dev/null 2>&1; then
    echo -e "${RED}❌ Python3 không được tìm thấy.${NC}"
    exit 1
fi

echo -e "${GREEN}✅ Python: $(python3 --version)${NC}"

if [ ! -d "venv" ]; then
    echo -e "${BLUE}📦 Tạo virtual environment...${NC}"
    python3 -m venv venv
fi

source venv/bin/activate

echo -e "${BLUE}📦 Nâng cấp pip và cài dependencies...${NC}"
python3 -m pip install --upgrade pip >/dev/null
python3 -m pip install -r requirements.txt

mkdir -p logs data exports

echo -e "${BLUE}🔎 Kiểm tra dependencies chính...${NC}"
python3 - <<'PY'
from importlib.util import find_spec
import sys

required_modules = ["fastapi", "uvicorn", "pydantic"]
optional_modules = ["selenium", "numpy", "pandas", "sklearn"]

missing_required = [name for name in required_modules if find_spec(name) is None]
missing_optional = [name for name in optional_modules if find_spec(name) is None]

if missing_required:
    print("Missing required modules:", ", ".join(missing_required))
    sys.exit(1)

if missing_optional:
    print("Missing optional modules:", ", ".join(missing_optional))
PY

echo ""
echo -e "${GREEN}✅ Setup hoàn tất.${NC}"
echo -e "${BLUE}Bước tiếp theo:${NC}"
echo "1. Kích hoạt môi trường: source venv/bin/activate"
echo "2. Chạy service nền: ./start_background.sh"
echo "3. Hoặc chạy foreground: ./run_ai_service.sh"
echo "4. Health check: curl http://localhost:${PORT:-8000}/health"
