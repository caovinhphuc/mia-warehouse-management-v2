#!/usr/bin/env bash
# Legacy shim: source canonical helpers from project-root scripts/utils.
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "$SCRIPT_DIR/../../.." && pwd)"
TARGET="$PROJECT_ROOT/scripts/utils/common.sh"

if [[ "${BASH_SOURCE[0]}" != "$0" ]]; then
  # shellcheck source=/dev/null
  source "$TARGET"
else
  exec bash "$TARGET" "$@"
fi
