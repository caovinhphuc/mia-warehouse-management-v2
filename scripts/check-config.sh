#!/bin/bash

# =============================================================================
# 🔍 Quick Configuration Check
# =============================================================================

echo "🔍 CONFIGURATION STATUS"
echo "============================================================"
echo ""

# Check main files
echo "📁 Configuration Files:"
for file in package.json vite.config.js craco.config.js craco-plugin-fix-devserver.js babel.config.js postcss.config.js; do
    if [ -f "$file" ]; then
        echo "  ✅ $file"
    else
        echo "  ❌ $file - NOT FOUND"
    fi
done

echo ""
echo "📂 Directories:"
for dir in src public backend scripts build; do
    if [ -d "$dir" ]; then
        echo "  ✅ $dir"
    else
        echo "  ⚠️  $dir - NOT FOUND"
    fi
done

echo ""
echo "📦 Key Dependencies:"
echo "  Checking installed packages..."

# Check if node_modules exists
if [ -d "node_modules" ]; then
    echo "  ✅ node_modules installed"

    # Check specific packages
    for pkg in @craco/craco webpack vite terser-webpack-plugin vite-plugin-compression; do
        if [ -d "node_modules/$pkg" ]; then
            echo "  ✅ $pkg"
        else
            echo "  ❌ $pkg - NOT INSTALLED"
        fi
    done
else
    echo "  ❌ node_modules - Run 'npm install'"
fi

echo ""
echo "============================================================"
echo "✅ Configuration check complete!"
echo ""
