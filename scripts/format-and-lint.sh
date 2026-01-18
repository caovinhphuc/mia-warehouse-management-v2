#!/bin/bash

# =============================================================================
# 🎨 Format & Lint - MIA.vn Project
# =============================================================================

set -e

echo "🎨 CODE QUALITY CHECK"
echo "============================================================"
echo ""

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Step 1: Prettier Format
echo "📝 Step 1: Running Prettier..."
echo "------------------------------------------------------------"
if npm run format:check; then
    echo -e "${GREEN}✅ Prettier: All files formatted correctly${NC}"
else
    echo -e "${YELLOW}⚠️  Prettier: Some files need formatting${NC}"
    echo "   Running auto-format..."
    npm run format
    echo -e "${GREEN}✅ Files formatted successfully${NC}"
fi
echo ""

# Step 2: ESLint Check
echo "🔍 Step 2: Running ESLint..."
echo "------------------------------------------------------------"
if npm run lint:check; then
    echo -e "${GREEN}✅ ESLint: No issues found${NC}"
else
    echo -e "${YELLOW}⚠️  ESLint: Issues found${NC}"
    echo "   Attempting auto-fix..."
    npm run lint:fix
    echo -e "${GREEN}✅ ESLint auto-fix completed${NC}"
fi
echo ""

# Step 3: TypeScript Check (if applicable)
echo "🔷 Step 3: TypeScript Check..."
echo "------------------------------------------------------------"
if [ -f "tsconfig.json" ]; then
    if npm run typecheck; then
        echo -e "${GREEN}✅ TypeScript: No type errors${NC}"
    else
        echo -e "${RED}❌ TypeScript: Type errors found${NC}"
        echo "   Please fix type errors manually"
    fi
else
    echo -e "${YELLOW}⚠️  No tsconfig.json found, skipping TypeScript check${NC}"
fi
echo ""

# Step 4: Summary
echo "============================================================"
echo "📊 CODE QUALITY SUMMARY"
echo "============================================================"
echo -e "${GREEN}✅ Format check completed${NC}"
echo -e "${GREEN}✅ Lint check completed${NC}"
echo ""
echo "💡 Tips:"
echo "   • Run 'npm run format' to format all files"
echo "   • Run 'npm run lint:fix' to auto-fix ESLint issues"
echo "   • Run 'npm test' to run tests"
echo ""
echo "🎉 Code quality check completed!"
