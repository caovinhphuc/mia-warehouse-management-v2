#!/bin/bash

# Multi-service production deploy orchestrator
# - Frontend: Vercel
# - Backend: Render deploy hook
# - AI Service: Render deploy hook
# - Automation: Render deploy hook
#
# Usage:
#   ./scripts/deploy/multiservice.sh
#   ./scripts/deploy/multiservice.sh --plan

set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"
ENV_FILE="$ROOT_DIR/deploy/.env.multiservice"
PLAN_ONLY="false"

if [[ "${1:-}" == "--plan" ]]; then
  PLAN_ONLY="true"
fi

if [[ ! -f "$ENV_FILE" ]]; then
  echo "❌ Missing config: $ENV_FILE"
  echo "👉 Copy deploy/.env.multiservice.example -> deploy/.env.multiservice rồi điền giá trị thật."
  exit 1
fi

# shellcheck disable=SC1090
source "$ENV_FILE"

# Defaults
DEPLOY_FRONTEND=${DEPLOY_FRONTEND:-true}
DEPLOY_BACKEND=${DEPLOY_BACKEND:-true}
DEPLOY_AI_SERVICE=${DEPLOY_AI_SERVICE:-true}
DEPLOY_AUTOMATION=${DEPLOY_AUTOMATION:-true}
FRONTEND_PLATFORM=${FRONTEND_PLATFORM:-vercel}
FRONTEND_DIR=${FRONTEND_DIR:-frontend}

# Validation
if [[ -z "${PROD_BACKEND_PUBLIC_URL:-}" ]]; then
  echo "❌ PROD_BACKEND_PUBLIC_URL is required"
  exit 1
fi
if [[ -z "${PROD_AI_PUBLIC_URL:-}" ]]; then
  echo "❌ PROD_AI_PUBLIC_URL is required"
  exit 1
fi

# Prepare shared API contract for frontend build
FRONTEND_ENV_FILE="$ROOT_DIR/$FRONTEND_DIR/.env.production"
cat > "$FRONTEND_ENV_FILE" <<EOF
VITE_API_URL=${PROD_BACKEND_PUBLIC_URL}/api
VITE_API_BASE_URL=${PROD_BACKEND_PUBLIC_URL}/api
VITE_AI_SERVICE_URL=${PROD_AI_PUBLIC_URL}
EOF

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "🚀 Multi-service Production Deploy"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "Frontend platform      : $FRONTEND_PLATFORM"
echo "Frontend dir           : $FRONTEND_DIR"
echo "Backend public URL     : $PROD_BACKEND_PUBLIC_URL"
echo "AI service public URL  : $PROD_AI_PUBLIC_URL"
echo "Plan mode              : $PLAN_ONLY"
echo ""
echo "✅ Shared API contract written: $FRONTEND_ENV_FILE"
echo ""

run_or_plan() {
  local desc="$1"
  local cmd="$2"
  echo "• $desc"
  if [[ "$PLAN_ONLY" == "true" ]]; then
    echo "  PLAN: $cmd"
  else
    eval "$cmd"
  fi
  echo ""
}

# 1) Frontend
if [[ "$DEPLOY_FRONTEND" == "true" ]]; then
  if [[ "$FRONTEND_PLATFORM" == "vercel" ]]; then
    if ! command -v vercel >/dev/null 2>&1; then
      echo "❌ vercel CLI not found. Install: npm i -g vercel"
      exit 1
    fi
    run_or_plan "Deploy Frontend -> Vercel" "cd '$ROOT_DIR/$FRONTEND_DIR' && vercel --prod"
  else
    echo "❌ Unsupported FRONTEND_PLATFORM: $FRONTEND_PLATFORM"
    exit 1
  fi
fi

# 2) Backend
if [[ "$DEPLOY_BACKEND" == "true" ]]; then
  if [[ -z "${BACKEND_DEPLOY_HOOK_URL:-}" ]]; then
    echo "❌ BACKEND_DEPLOY_HOOK_URL is required when DEPLOY_BACKEND=true"
    exit 1
  fi
  run_or_plan "Deploy Backend -> Render" "curl -fsS -X POST '$BACKEND_DEPLOY_HOOK_URL'"
fi

# 3) AI Service
if [[ "$DEPLOY_AI_SERVICE" == "true" ]]; then
  if [[ -z "${AI_SERVICE_DEPLOY_HOOK_URL:-}" ]]; then
    echo "❌ AI_SERVICE_DEPLOY_HOOK_URL is required when DEPLOY_AI_SERVICE=true"
    exit 1
  fi
  run_or_plan "Deploy AI Service -> Render" "curl -fsS -X POST '$AI_SERVICE_DEPLOY_HOOK_URL'"
fi

# 4) Automation
if [[ "$DEPLOY_AUTOMATION" == "true" ]]; then
  if [[ -z "${AUTOMATION_DEPLOY_HOOK_URL:-}" ]]; then
    echo "❌ AUTOMATION_DEPLOY_HOOK_URL is required when DEPLOY_AUTOMATION=true"
    exit 1
  fi
  run_or_plan "Deploy Automation -> Render" "curl -fsS -X POST '$AUTOMATION_DEPLOY_HOOK_URL'"
fi

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "✅ Done"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
if [[ "$PLAN_ONLY" == "false" ]]; then
  echo "🔎 Verify URLs:"
  echo "- Frontend   : deploy output from Vercel"
  echo "- Backend    : ${PROD_BACKEND_PUBLIC_URL}/api/health"
  echo "- AI Service : ${PROD_AI_PUBLIC_URL}/health"
fi
