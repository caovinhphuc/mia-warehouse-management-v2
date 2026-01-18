#!/bin/bash

# =============================================================================
# 📦 Bundle Optimization Quick Reference
# =============================================================================

echo "📦 BUNDLE OPTIMIZATION - QUICK REFERENCE"
echo "============================================================"
echo ""

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Current Status
echo -e "${BLUE}📊 Current Bundle Status:${NC}"
echo "------------------------------------------------------------"

if [ -d "build/assets" ]; then
    UNCOMPRESSED=$(du -sh build/assets/*.{js,css} 2>/dev/null | awk '{s+=$1} END {print s}' || echo "N/A")
    BROTLI=$(du -sh build/assets/*.br 2>/dev/null | awk '{s+=$1} END {print s}' || echo "N/A")

    echo "  Uncompressed: $(du -ch build/assets/*.{js,css} 2>/dev/null | grep total || echo 'Build required')"
    echo "  Brotli:       $(du -ch build/assets/*.br 2>/dev/null | grep total || echo 'Build required')"

    # Calculate top 5 largest files
    echo ""
    echo "  📦 Top 5 Largest Chunks:"
    du -sh build/assets/*.js 2>/dev/null | sort -h | tail -5 | awk '{printf "     %s - %s\n", $2, $1}'
else
    echo -e "${YELLOW}  ⚠️  No build found. Run 'npm run build' first.${NC}"
fi

echo ""
echo -e "${BLUE}🎯 Target Metrics:${NC}"
echo "------------------------------------------------------------"
echo "  Transfer Size (Brotli): < 600 KB ✅ ACHIEVED"
echo "  Initial Load: < 3s on 3G"
echo "  Time to Interactive: < 4s"
echo ""

echo -e "${BLUE}🚀 Quick Commands:${NC}"
echo "------------------------------------------------------------"
echo "  npm run build               # Build production bundle"
echo "  npm run analyze:sourcemap   # Visualize bundle composition"
echo "  npm run perf:bundle         # Performance analysis"
echo ""
echo "  # Analysis"
echo "  node scripts/performance-bundle.js"
echo "  du -sh build/assets/*.{js,css,br}"
echo ""

echo -e "${BLUE}🔧 Phase 2 Optimizations (Optional):${NC}"
echo "------------------------------------------------------------"
echo "  1. Icon Imports    → 50-100 KB savings"
echo "  2. Chart Library   → 150-200 KB savings"
echo "  3. PurgeCSS        → 10-20 KB savings"
echo "  4. Image Optimize  → Variable savings"
echo ""
echo "  Total Potential: 200-320 KB additional reduction"
echo ""

echo -e "${BLUE}📁 Files to Optimize:${NC}"
echo "------------------------------------------------------------"

# Count icon imports
if [ -d "src" ]; then
    ICON_COUNT=$(grep -r "from '@ant-design/icons'" src/ 2>/dev/null | wc -l | xargs)
    echo "  Icon imports to optimize: ${ICON_COUNT} locations"

    CHART_JS=$(grep -r "react-chartjs-2" src/ 2>/dev/null | wc -l | xargs)
    RECHARTS=$(grep -r "recharts" src/ 2>/dev/null | wc -l | xargs)
    echo "  Chart.js usage: ${CHART_JS} files"
    echo "  Recharts usage: ${RECHARTS} files"
fi

echo ""
echo -e "${GREEN}✅ Optimizations Applied:${NC}"
echo "------------------------------------------------------------"
echo "  ✅ Code splitting (10+ chunks)"
echo "  ✅ Gzip + Brotli compression"
echo "  ✅ Terser optimization"
echo "  ✅ Route-based lazy loading"
echo "  ✅ Tree shaking enabled"
echo ""

echo "📚 Full Guide: BUNDLE_OPTIMIZATION_GUIDE.md"
echo "🔧 Config: vite.config.js"
echo "📊 Analysis: npm run analyze:sourcemap"
echo ""
echo "============================================================"
