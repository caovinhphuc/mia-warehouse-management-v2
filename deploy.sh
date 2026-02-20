#!/bin/bash
# Deploy script - forwards to scripts/deploy/main.sh
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
exec "$SCRIPT_DIR/scripts/deploy/main.sh" "$@"
