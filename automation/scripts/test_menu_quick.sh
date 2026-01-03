#!/bin/bash

# Test menu nhanh

echo "🧪 Testing Menu in automation_new..."
echo ""

# Test files exist
echo "📋 Checking files..."
if [ -f "warehouse-dashboard-enterprise.html" ]; then
    echo "✅ warehouse-dashboard-enterprise.html exists"
else
    echo "❌ warehouse-dashboard-enterprise.html missing"
fi

if [ -f "shopee_analysis_report.html" ]; then
    echo "✅ shopee_analysis_report.html exists"
else
    echo "❌ shopee_analysis_report.html missing"
fi

echo ""
echo "📋 Menu preview (lines 35-50):"
echo "----------------------------------------"
sed -n '35,50p' start.sh
echo "----------------------------------------"

echo ""
echo "🚀 Ready to test! Run: ./start.sh"
