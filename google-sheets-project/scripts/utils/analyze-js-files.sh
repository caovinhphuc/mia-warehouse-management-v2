#!/bin/bash

# 📊 Analyze JavaScript Files Script
# Phân tích và phân loại các file JavaScript ở root level

# Get script directory and change to project root
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "$SCRIPT_DIR/../../.." && pwd)"
cd "$PROJECT_ROOT"

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
NC='\033[0m'

print_header() {
    echo -e "${CYAN}================================================================================${NC}"
    echo -e "${CYAN}📊 JavaScript Files Analysis${NC}"
    echo -e "${CYAN}================================================================================${NC}"
    echo ""
}

print_category() {
    echo -e "${BLUE}📁 $1${NC}"
    echo -e "${BLUE}--------------------------------------------------------------------------------${NC}"
}

print_file() {
    local file=$1
    local size=$2
    local desc=$3
    echo -e "  ${GREEN}📄${NC} $file ($size bytes)"
    if [ ! -z "$desc" ]; then
        echo -e "     └─ $desc"
    fi
}

print_header

# Find all JS files in root
JS_FILES=$(find . -maxdepth 1 -name "*.js" -type f ! -name "*.min.js" ! -name "*.bundle.js" | sort)

echo -e "${BLUE}Found ${#JS_FILES[@]} JavaScript files in root${NC}"
echo ""

# Categorize files
TEST_FILES=()
CONFIG_FILES=()
OTHER_FILES=()

for file in $JS_FILES; do
    filename=$(basename "$file")
    size=$(stat -f%z "$file" 2>/dev/null || stat -c%s "$file" 2>/dev/null || echo "0")

    # Check if it's a test file
    if [[ "$filename" == *"test"* ]] || [[ "$filename" == *"Test"* ]]; then
        TEST_FILES+=("$file|$size")
    # Check if it's a config file
    elif [[ "$filename" == *"config"* ]] || [[ "$filename" == *"Config"* ]] || [[ "$filename" == "lighthouserc.js" ]] || [[ "$filename" == "jest.config.js" ]] || [[ "$filename" == "babel.config.js" ]] || [[ "$filename" == "postcss.config.js" ]] || [[ "$filename" == "webpack.config.js" ]]; then
        CONFIG_FILES+=("$file|$size")
    else
        OTHER_FILES+=("$file|$size")
    fi
done

# Display Test Files
print_category "Test Files (should move to scripts/tests/)"
for item in "${TEST_FILES[@]}"; do
    IFS='|' read -r file size <<< "$item"
    filename=$(basename "$file")

    # Get description from first few lines
    desc=$(head -5 "$file" 2>/dev/null | grep -E "^//|^/\*|^#" | head -1 | sed 's/^[\/\*\# ]*//' | cut -c1-60)
    print_file "$filename" "$size" "$desc"
done
echo ""

# Display Config Files
print_category "Config Files (can stay in root or move to scripts/config/)"
for item in "${CONFIG_FILES[@]}"; do
    IFS='|' read -r file size <<< "$item"
    filename=$(basename "$file")
    print_file "$filename" "$size" "Configuration file"
done
echo ""

# Display Other Files
if [ ${#OTHER_FILES[@]} -gt 0 ]; then
    print_category "Other Files"
    for item in "${OTHER_FILES[@]}"; do
        IFS='|' read -r file size <<< "$item"
        filename=$(basename "$file")
        desc=$(head -5 "$file" 2>/dev/null | grep -E "^//|^/\*|^#" | head -1 | sed 's/^[\/\*\# ]*//' | cut -c1-60)
        print_file "$filename" "$size" "$desc"
    done
    echo ""
fi

# Recommendations
echo -e "${YELLOW}💡 RECOMMENDATIONS:${NC}"
echo -e "${YELLOW}$(printf '%.0s-' {1..80})${NC}"
echo ""
echo "1. Test Files → Move to scripts/tests/"
echo "   - end_to_end_test.js"
echo "   - integration_test.js"
echo "   - advanced_integration_test.js"
echo "   - complete_system_test.js"
echo "   - frontend_connection_test.js"
echo "   - test_google_sheets.js"
echo "   - ws-test.js"
echo ""
echo "2. Config Files → Keep in root (standard practice)"
echo "   - babel.config.js"
echo "   - jest.config.js"
echo "   - lighthouserc.js"
echo "   - postcss.config.js"
echo "   - webpack.config.js"
echo "   - env.config.js (can move to scripts/config/)"
echo ""
echo -e "${GREEN}✅ Analysis complete!${NC}"
echo ""

