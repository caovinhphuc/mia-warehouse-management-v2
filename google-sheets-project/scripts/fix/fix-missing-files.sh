#!/bin/bash
# Fix missing files in main branch

echo "🔧 Đang fix missing files..."

# Check current branch
CURRENT_BRANCH=$(git branch --show-current)
echo "Branch hiện tại: $CURRENT_BRANCH"

# List of files that need to be in main
FILES=(
  "src/components/automation/AutomationDashboard.jsx"
  "src/components/automation/AutomationDashboard.css"
)

echo ""
echo "Đang kiểm tra các file..."
for file in "${FILES[@]}"; do
  if [ -f "$file" ]; then
    echo "✅ $file"
  else
    echo "❌ $file - THIẾU"
  fi
done

echo ""
read -p "Bạn có muốn commit và push các file này không? (y/n): " -n 1 -r
echo ""
if [[ $REPLY =~ ^[Yy]$ ]]; then
  git add "${FILES[@]}"
  git commit -m "fix: ensure AutomationDashboard files are tracked"
  git push origin "$CURRENT_BRANCH"
  echo "✅ Đã push lên branch: $CURRENT_BRANCH"
fi
