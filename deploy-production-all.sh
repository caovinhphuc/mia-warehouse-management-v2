#!/bin/bash

# Root wrapper for multiservice production deploy
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
exec "$SCRIPT_DIR/scripts/deploy/multiservice.sh" "$@"
