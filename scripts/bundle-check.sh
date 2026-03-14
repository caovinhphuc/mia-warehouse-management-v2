#!/bin/bash
# Bundle size check - tương thích Vite build (BUNDLE_OPTIMIZATION_GUIDE)
set -e
echo "📦 Bundle Size Check"
echo "===================="

[ -d "build" ] || { echo "Chạy npm run build trước"; exit 1; }

echo ""
echo "📊 Chunks (build/assets/):"
du -sh build/assets/*.js 2>/dev/null | sort -h | tail -15

echo ""
echo "📊 CSS:"
du -sh build/assets/*.css 2>/dev/null || true

echo ""
echo "📊 Brotli (transfer size):"
if ls build/assets/*.br 1>/dev/null 2>&1; then
  du -ch build/assets/*.br | tail -1
else
  echo "  (chưa có .br - build với vite-plugin-compression)"
fi

echo ""
node scripts/performance-bundle.js 2>/dev/null || echo "Chạy: npm run perf:bundle"
