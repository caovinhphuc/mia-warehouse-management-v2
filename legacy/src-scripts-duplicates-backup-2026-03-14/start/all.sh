#!/usr/bin/env bash
# =============================================================================
# Wrapper: Gọi script chuẩn từ project root
# =============================================================================
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "$SCRIPT_DIR/../../.." && pwd)"
exec "$PROJECT_ROOT/scripts/start/all.sh" "$@"
