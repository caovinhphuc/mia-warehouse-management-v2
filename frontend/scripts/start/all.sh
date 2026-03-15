#!/usr/bin/env bash
# Legacy shim: delegates to canonical script in project-root scripts/.
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "$SCRIPT_DIR/../../.." && pwd)"
exec "$PROJECT_ROOT/scripts/start/all.sh" "$@"
