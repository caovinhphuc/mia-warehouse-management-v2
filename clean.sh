#!/bin/bash

# =============================================================================
# 🧹 CLEAN SCRIPT - Quick access from project root
# =============================================================================

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
exec "$SCRIPT_DIR/scripts/utils/clean.sh" "$@"

