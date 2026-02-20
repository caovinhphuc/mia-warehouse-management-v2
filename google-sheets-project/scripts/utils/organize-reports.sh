#!/bin/bash

# 📊 Organize Reports and Backups Script
# Tự động tổ chức các file reports và backups vào đúng thư mục

# Get script directory and change to project root
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "$SCRIPT_DIR/../../.." && pwd)"
cd "$PROJECT_ROOT"

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

echo "📊 Organizing Reports and Backups..."
echo "===================================="
echo ""

# Create directory structure
print_status "Creating directory structure..."
mkdir -p reports/{email,telegram,health,build,performance,lighthouse}
mkdir -p backups/{scripts,automation,backend,ai-service,venv}
print_success "Directory structure created"

# Move email test reports
print_status "Organizing email test reports..."
find . -name "email-test-report-*.json" -type f \
    ! -path "*/node_modules/*" \
    ! -path "*/.git/*" \
    ! -path "*/reports/*" \
    ! -path "*/venv/*" \
    -exec mv {} reports/email/ \; 2>/dev/null
EMAIL_COUNT=$(ls reports/email/*.json 2>/dev/null | wc -l | xargs)
print_success "Moved $EMAIL_COUNT email test reports"

# Move telegram test reports
print_status "Organizing telegram test reports..."
find . -name "telegram-test-report-*.json" -type f \
    ! -path "*/node_modules/*" \
    ! -path "*/.git/*" \
    ! -path "*/reports/*" \
    ! -path "*/venv/*" \
    -exec mv {} reports/telegram/ \; 2>/dev/null
TELEGRAM_COUNT=$(ls reports/telegram/*.json 2>/dev/null | wc -l | xargs)
print_success "Moved $TELEGRAM_COUNT telegram test reports"

# Move health reports
print_status "Organizing health reports..."
find . -name "health-report-*.json" -type f \
    ! -path "*/node_modules/*" \
    ! -path "*/.git/*" \
    ! -path "*/reports/*" \
    ! -path "*/venv/*" \
    -exec mv {} reports/health/ \; 2>/dev/null
HEALTH_COUNT=$(ls reports/health/*.json 2>/dev/null | wc -l | xargs)
print_success "Moved $HEALTH_COUNT health reports"

# Move build reports
print_status "Organizing build reports..."
find . -name "*build*report*.json" -o -name "*bundle*report*.json" -o -name "*setup*report*.json" | \
    grep -v node_modules | grep -v ".git" | grep -v reports | grep -v venv | \
    while read f; do mv "$f" reports/build/ 2>/dev/null; done
BUILD_COUNT=$(ls reports/build/*.json 2>/dev/null | wc -l | xargs)
print_success "Moved $BUILD_COUNT build reports"

# Move performance reports
print_status "Organizing performance reports..."
find . -name "*performance*report*.json" -o -name "*performance-budget*.json" | \
    grep -v node_modules | grep -v ".git" | grep -v reports | grep -v venv | \
    while read f; do mv "$f" reports/performance/ 2>/dev/null; done
PERF_COUNT=$(ls reports/performance/*.json 2>/dev/null | wc -l | xargs)
print_success "Moved $PERF_COUNT performance reports"

# Move lighthouse reports
print_status "Organizing lighthouse reports..."
find . -name "*lighthouse*.json" -type f \
    ! -path "*/node_modules/*" \
    ! -path "*/.git/*" \
    ! -path "*/reports/*" \
    ! -path "*/venv/*" | \
    while read f; do
        dir=$(dirname "$f" | sed 's|^\./||' | tr '/' '_')
        if [ "$dir" = "." ]; then dir="root"; fi
        mkdir -p "reports/lighthouse/$dir"
        mv "$f" "reports/lighthouse/$dir/" 2>/dev/null
    done
LIGHTHOUSE_COUNT=$(find reports/lighthouse -name "*.json" 2>/dev/null | wc -l | xargs)
print_success "Moved $LIGHTHOUSE_COUNT lighthouse reports"

# Move venv backups
print_status "Organizing venv backups..."
find . -name "*venv.backup*" -type d \
    ! -path "*/node_modules/*" \
    ! -path "*/.git/*" \
    ! -path "*/backups/*" | \
    while read d; do mv "$d" backups/venv/ 2>/dev/null; done
VENV_BACKUP_COUNT=$(ls -d backups/venv/* 2>/dev/null | wc -l | xargs)
print_success "Moved $VENV_BACKUP_COUNT venv backups"

# Summary
echo ""
echo "===================================="
print_success "✅ Organization complete!"
echo ""
echo "📊 Summary:"
echo "   Email reports:      $EMAIL_COUNT"
echo "   Telegram reports:   $TELEGRAM_COUNT"
echo "   Health reports:     $HEALTH_COUNT"
echo "   Build reports:      $BUILD_COUNT"
echo "   Performance reports: $PERF_COUNT"
echo "   Lighthouse reports: $LIGHTHOUSE_COUNT"
echo "   Venv backups:       $VENV_BACKUP_COUNT"
echo ""
echo "📁 Reports location: reports/"
echo "💾 Backups location: backups/"
echo ""

