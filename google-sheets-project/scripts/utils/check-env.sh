#!/bin/bash

# 🔍 ENVIRONMENT VARIABLES CHECKER
# Kiểm tra các env vars cần thiết trước khi deploy

set +e  # Don't exit on error, we want to check all vars

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
NC='\033[0m'

print_header() {
    echo -e "${CYAN}╔══════════════════════════════════════════════════════════════╗${NC}"
    echo -e "${CYAN}║         🔍 ENVIRONMENT VARIABLES CHECKER                   ║${NC}"
    echo -e "${CYAN}╚══════════════════════════════════════════════════════════════╝${NC}"
    echo ""
}

print_section() {
    echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
    echo -e "${BLUE}$1${NC}"
    echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
}

check_var() {
    local var_name=$1
    local required=${2:-false}
    local value=${!var_name}

    if [ -z "$value" ]; then
        if [ "$required" = "true" ]; then
            echo -e "  ${RED}❌${NC} ${var_name} ${RED}(REQUIRED - MISSING)${NC}"
            return 1
        else
            echo -e "  ${YELLOW}⚠️${NC}  ${var_name} ${YELLOW}(OPTIONAL - NOT SET)${NC}"
            return 0
        fi
    else
        # Mask sensitive values
        if [[ "$var_name" == *"KEY"* ]] || [[ "$var_name" == *"SECRET"* ]] || [[ "$var_name" == *"TOKEN"* ]] || [[ "$var_name" == *"PASSWORD"* ]]; then
            local masked=$(echo "$value" | sed 's/./*/g' | head -c 20)
            echo -e "  ${GREEN}✅${NC} ${var_name} = ${masked}... ${GREEN}(SET)${NC}"
        else
            local short_value=$(echo "$value" | head -c 50)
            echo -e "  ${GREEN}✅${NC} ${var_name} = ${short_value}... ${GREEN}(SET)${NC}"
        fi
        return 0
    fi
}

# Check if .env file exists
check_env_file() {
    print_section "📁 Checking .env files"

    if [ -f ".env" ]; then
        echo -e "  ${GREEN}✅${NC} .env file exists"
        # Note: .env file exists but we check system/env vars, not load .env directly
        # (Vercel/Railway use their own env vars, not .env file)
    else
        echo -e "  ${YELLOW}⚠️${NC}  .env file not found (using system env vars)"
    fi

    if [ -f "backend/.env" ]; then
        echo -e "  ${GREEN}✅${NC} backend/.env file exists"
    else
        echo -e "  ${YELLOW}⚠️${NC}  backend/.env file not found"
    fi
    echo ""
}

# Check Frontend Environment Variables
check_frontend_env() {
    print_section "🎨 FRONTEND Environment Variables (Vercel)"

    local missing=0

    if [ -n "${REACT_APP_API_BASE_URL:-}" ] || [ -n "${VITE_API_BASE_URL:-}" ]; then
        if [ -n "${REACT_APP_API_BASE_URL:-}" ]; then
            check_var "REACT_APP_API_BASE_URL" true
        else
            check_var "VITE_API_BASE_URL" true
        fi
    else
        echo -e "  ${RED}❌${NC} REACT_APP_API_BASE_URL / VITE_API_BASE_URL ${RED}(REQUIRED - MISSING)${NC}"
        missing=$((missing + 1))
    fi

    if [ -n "${REACT_APP_GOOGLE_SHEETS_SPREADSHEET_ID:-}" ] || [ -n "${VITE_GOOGLE_SHEETS_SPREADSHEET_ID:-}" ]; then
        if [ -n "${REACT_APP_GOOGLE_SHEETS_SPREADSHEET_ID:-}" ]; then
            check_var "REACT_APP_GOOGLE_SHEETS_SPREADSHEET_ID" true
        else
            check_var "VITE_GOOGLE_SHEETS_SPREADSHEET_ID" true
        fi
    else
        echo -e "  ${RED}❌${NC} REACT_APP_GOOGLE_SHEETS_SPREADSHEET_ID / VITE_GOOGLE_SHEETS_SPREADSHEET_ID ${RED}(REQUIRED - MISSING)${NC}"
        missing=$((missing + 1))
    fi

    check_var "REACT_APP_GOOGLE_DRIVE_FOLDER_ID" false
    check_var "VITE_GOOGLE_DRIVE_FOLDER_ID" false
    check_var "REACT_APP_AI_SERVICE_URL" false
    check_var "VITE_AI_SERVICE_URL" false

    echo ""
    if [ $missing -gt 0 ]; then
        echo -e "${RED}❌ Missing $missing required frontend variables${NC}"
        return 1
    else
        echo -e "${GREEN}✅ All required frontend variables are set${NC}"
        return 0
    fi
}

# Check Backend Environment Variables
check_backend_env() {
    print_section "⚙️  BACKEND Environment Variables (Railway)"

    local missing=0

    local has_file_credentials=0
    local has_inline_credentials=0

    if [ -n "${GOOGLE_CREDENTIALS_PATH:-}" ] || [ -n "${GOOGLE_APPLICATION_CREDENTIALS:-}" ] || [ -n "${GOOGLE_SERVICE_ACCOUNT_KEY_PATH:-}" ]; then
        has_file_credentials=1
        check_var "GOOGLE_CREDENTIALS_PATH" false
        check_var "GOOGLE_APPLICATION_CREDENTIALS" false
        check_var "GOOGLE_SERVICE_ACCOUNT_KEY_PATH" false
    fi

    if [ -n "${GOOGLE_SERVICE_ACCOUNT_EMAIL:-}" ] && [ -n "${GOOGLE_PRIVATE_KEY:-}" ]; then
        has_inline_credentials=1
        check_var "GOOGLE_SERVICE_ACCOUNT_EMAIL" true
        check_var "GOOGLE_PRIVATE_KEY" true
    fi

    if [ $has_file_credentials -eq 0 ] && [ $has_inline_credentials -eq 0 ]; then
        echo -e "  ${RED}❌${NC} Google credentials ${RED}(REQUIRED - set path OR service account env)${NC}"
        missing=$((missing + 1))
    fi

    check_var "JWT_SECRET" true || missing=$((missing + 1))
    check_var "GOOGLE_SHEETS_SPREADSHEET_ID" true || missing=$((missing + 1))
    check_var "GOOGLE_DRIVE_FOLDER_ID" false
    check_var "GOOGLE_PROJECT_ID" false
    check_var "PORT" false
    check_var "NODE_ENV" false

    echo ""
    if [ $missing -gt 0 ]; then
        echo -e "${RED}❌ Missing $missing required backend variables${NC}"
        return 1
    else
        echo -e "${GREEN}✅ All required backend variables are set${NC}"
        return 0
    fi
}

# Main
main() {
    print_header

    check_env_file

    local frontend_ok=0
    local backend_ok=0

    check_frontend_env && frontend_ok=1
    echo ""
    check_backend_env && backend_ok=1
    echo ""

    print_section "📊 SUMMARY"

    if [ $frontend_ok -eq 1 ] && [ $backend_ok -eq 1 ]; then
        echo -e "${GREEN}✅ All environment variables are properly configured!${NC}"
        echo -e "${GREEN}🚀 Ready to deploy!${NC}"
        exit 0
    else
        echo -e "${RED}❌ Some required environment variables are missing${NC}"
        echo -e "${YELLOW}⚠️  Please check the list above and set missing variables${NC}"
        echo ""
        echo -e "${CYAN}📖 See DEPLOY_ENV_CHECKLIST.md for detailed instructions${NC}"
        exit 1
    fi
}

main

