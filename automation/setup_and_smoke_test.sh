#!/usr/bin/env bash
set -euo pipefail

# One-command setup + smoke test for automation
# Usage:
#   cd automation && ./setup_and_smoke_test.sh
# Optional env:
#   INSTALL_AUTH=1              # install requirements_auth.txt
#   RUN_ONE_TGA_TEST=1          # run verify_one_tga.py (requires credentials)
#   ONE_TGA_EMAIL=you@example.com
#   ONE_TGA_PASSWORD=secret
#   RUN_REAL_AUTOMATION=1       # run one_automation_system/automation.py --run-once

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$ROOT_DIR"

PY_BIN="${PY_BIN:-python3}"
VENV_DIR="${VENV_DIR:-.venv}"

log() {
  printf "[%s] %s\n" "$(date '+%H:%M:%S')" "$*"
}

fail() {
  echo "ERROR: $*" >&2
  exit 1
}

command -v "$PY_BIN" >/dev/null 2>&1 || fail "Python not found: $PY_BIN"

log "Create/activate venv: $VENV_DIR"
if [[ ! -d "$VENV_DIR" ]]; then
  "$PY_BIN" -m venv "$VENV_DIR"
fi

# shellcheck disable=SC1091
source "$VENV_DIR/bin/activate"

log "Upgrade pip/setuptools/wheel"
python -m pip install --upgrade pip setuptools wheel

log "Install minimal dependencies"
python -m pip install -r requirements-minimal.txt

if [[ "${INSTALL_AUTH:-0}" == "1" ]]; then
  log "Install auth dependencies"
  python -m pip install -r requirements_auth.txt
fi

log "Smoke test: core imports"
python - <<'PY'
import selenium, pandas, dotenv, requests
print("OK: core imports")
PY

log "Smoke test: Google Sheets module import"
PYTHONPATH=. python - <<'PY'
from google_sheets_config import GoogleSheetsConfigService
print("OK: GoogleSheetsConfigService import")
PY

if [[ "${RUN_ONE_TGA_TEST:-0}" == "1" ]]; then
  [[ -n "${ONE_TGA_EMAIL:-}" ]] || fail "ONE_TGA_EMAIL is required when RUN_ONE_TGA_TEST=1"
  [[ -n "${ONE_TGA_PASSWORD:-}" ]] || fail "ONE_TGA_PASSWORD is required when RUN_ONE_TGA_TEST=1"

  log "Run one.tga verification test"
  python verify_one_tga.py <<EOF
{"email":"${ONE_TGA_EMAIL}","password":"${ONE_TGA_PASSWORD}"}
EOF
fi

if [[ "${RUN_REAL_AUTOMATION:-0}" == "1" ]]; then
  log "Run real automation once"
  cd one_automation_system
  python automation.py --run-once
fi

log "DONE: setup + smoke test completed"
