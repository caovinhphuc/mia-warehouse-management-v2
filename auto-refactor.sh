#!/bin/bash

# AUTO REFACTOR LARGE COMPONENTS
# Tách các files lớn thành components nhỏ hơn

set -e

PROJECT_DIR="$HOME/Workspace/mia-vn/warehouse-main"
cd "$PROJECT_DIR"

echo "🚀 AUTO REFACTOR - MIA WAREHOUSE"
echo "=================================="
echo ""

# 1. BACKUP
echo "💾 Step 1: Creating backup..."
BACKUP_DIR="$HOME/Desktop/refactor-backup-$(date +%Y%m%d_%H%M%S)"
mkdir -p "$BACKUP_DIR"
cp -R src/ "$BACKUP_DIR/"
echo "✅ Backup saved to: $BACKUP_DIR"
echo ""

# 2. ANALYZE FILES
echo "🔍 Step 2: Analyzing files..."
echo ""

analyze_file() {
  local file=$1
  local lines=$(wc -l < "$file")
  echo "📄 $(basename $file): $lines lines"
  
  # Count imports, functions, components
  local imports=$(grep -c "^import" "$file" 2>/dev/null || echo 0)
  local functions=$(grep -c "^const.*=.*=>\\|^function" "$file" 2>/dev/null || echo 0)
  local exports=$(grep -c "^export" "$file" 2>/dev/null || echo 0)
  
  echo "   - Imports: $imports"
  echo "   - Functions/Components: $functions"
  echo "   - Exports: $exports"
  echo ""
}

# Analyze target files
if [ -f "src/components/google/GoogleDriveIntegration.jsx" ]; then
  analyze_file "src/components/google/GoogleDriveIntegration.jsx"
fi

if [ -f "src/components/ai/AIDashboard.jsx" ]; then
  analyze_file "src/components/ai/AIDashboard.jsx"
fi

# 3. CREATE REFACTORED STRUCTURE
echo "✂️  Step 3: Creating new structure..."
echo ""

# Create subdirectories
mkdir -p src/components/google/drive
mkdir -p src/components/ai/dashboard
mkdir -p src/hooks/google
mkdir -p src/hooks/ai

echo "✅ Created directory structure"
echo ""

# 4. GENERATE REFACTORING PLAN
cat > "$HOME/Desktop/refactor-plan.md" << 'EOF'
# REFACTORING PLAN - MIA Warehouse

## Target Files

### 1. GoogleDriveIntegration.jsx (970 lines)

**Split into:**
```
src/components/google/
├── GoogleDriveIntegration.jsx (150 lines - main orchestrator)
└── drive/
    ├── DriveFileList.jsx (200 lines)
    ├── DriveFileUpload.jsx (150 lines)
    ├── DriveFilePreview.jsx (120 lines)
    ├── DriveFolderTree.jsx (150 lines)
    └── DriveToolbar.jsx (100 lines)

src/hooks/google/
└── useDriveOperations.js (150 lines)
```

**Components to extract:**
- File list display → DriveFileList.jsx
- Upload functionality → DriveFileUpload.jsx
- File preview modal → DriveFilePreview.jsx
- Folder tree navigation → DriveFolderTree.jsx
- Toolbar actions → DriveToolbar.jsx
- Business logic → useDriveOperations hook

### 2. AIDashboard.jsx (941 lines)

**Split into:**
```
src/components/ai/
├── AIDashboard.jsx (120 lines - main)
└── dashboard/
    ├── AIAnalytics.jsx (200 lines)
    ├── AIModelSelector.jsx (150 lines)
    ├── AIResponsePanel.jsx (200 lines)
    ├── AISettings.jsx (150 lines)
    └── AIHistory.jsx (120 lines)

src/hooks/ai/
└── useAIService.js (150 lines)
```

**Components to extract:**
- Analytics/metrics → AIAnalytics.jsx
- Model selection UI → AIModelSelector.jsx
- Response display → AIResponsePanel.jsx
- Settings panel → AISettings.jsx
- Conversation history → AIHistory.jsx
- AI API logic → useAIService hook

## Refactoring Rules

1. **Component Size**: Max 300 lines per file
2. **Single Responsibility**: Each component does ONE thing
3. **Custom Hooks**: Extract business logic
4. **Props Interface**: Clear, typed props
5. **Import Organization**: Grouped by type

## Next Steps

1. Review this plan
2. Run manual refactoring OR
3. Use AI-assisted extraction tools
4. Test after each extraction
5. Update imports gradually

EOF

echo "📄 Refactoring plan saved to: ~/Desktop/refactor-plan.md"
echo ""

# 5. MANUAL EXTRACTION HELPERS
echo "🛠️  Step 4: Creating helper scripts..."

# Create extraction template
cat > "$HOME/Desktop/component-template.jsx" << 'TEMPLATE'
import React from 'react';

/**
 * [COMPONENT_NAME]
 * 
 * Purpose: [DESCRIBE RESPONSIBILITY]
 * 
 * Props:
 * - [prop1]: [description]
 * - [prop2]: [description]
 */
const [COMPONENT_NAME] = ({ 
  // Define props here
}) => {
  // Component logic here
  
  return (
    <div className="[component-name]">
      {/* JSX here */}
    </div>
  );
};

export default [COMPONENT_NAME];
TEMPLATE

echo "✅ Component template created: ~/Desktop/component-template.jsx"
echo ""

# Create hook template
cat > "$HOME/Desktop/hook-template.js" << 'HOOK'
import { useState, useEffect, useCallback } from 'react';

/**
 * [HOOK_NAME]
 * 
 * Purpose: [DESCRIBE WHAT THIS HOOK DOES]
 * 
 * Returns:
 * - [property1]: [description]
 * - [method1]: [description]
 */
const [HOOK_NAME] = () => {
  const [state, setState] = useState(null);
  
  // Effects
  useEffect(() => {
    // Side effects here
  }, []);
  
  // Methods
  const handleAction = useCallback(() => {
    // Action logic
  }, []);
  
  return {
    state,
    handleAction,
  };
};

export default [HOOK_NAME];
HOOK

echo "✅ Hook template created: ~/Desktop/hook-template.js"
echo ""

# 6. TEST PREPARATION
echo "🧪 Step 5: Preparing tests..."

cat > "$HOME/Desktop/refactor-checklist.md" << 'CHECKLIST'
# Refactoring Checklist

## Before Starting
- [x] Backup created
- [ ] Read refactor-plan.md
- [ ] Understand current structure

## During Refactoring

### For Each Component:
- [ ] Create new file in correct location
- [ ] Copy relevant code
- [ ] Extract props interface
- [ ] Update imports
- [ ] Remove from original file
- [ ] Test compilation: `pnpm dev`

### After Each Component:
- [ ] App still runs
- [ ] No console errors
- [ ] Functionality works

## Quality Checks
- [ ] All files < 300 lines
- [ ] Clear component names
- [ ] Organized imports
- [ ] No duplicate code
- [ ] Props documented

## Final Steps
- [ ] Full test: `pnpm dev`
- [ ] Check all features work
- [ ] Run build: `pnpm build`
- [ ] Commit changes: `git add . && git commit -m "refactor: split large components"`

CHECKLIST

echo "✅ Checklist created: ~/Desktop/refactor-checklist.md"
echo ""

# 7. SUMMARY
echo "======================================"
echo "✅ PREPARATION COMPLETE!"
echo "======================================"
echo ""
echo "📁 Created:"
echo "   - Backup: $BACKUP_DIR"
echo "   - Plan: ~/Desktop/refactor-plan.md"
echo "   - Template: ~/Desktop/component-template.jsx"
echo "   - Hook Template: ~/Desktop/hook-template.js"
echo "   - Checklist: ~/Desktop/refactor-checklist.md"
echo ""
echo "📁 New directories:"
echo "   - src/components/google/drive/"
echo "   - src/components/ai/dashboard/"
echo "   - src/hooks/google/"
echo "   - src/hooks/ai/"
echo ""
echo "🎯 NEXT STEPS:"
echo ""
echo "Option 1 - MANUAL (Recommended for learning):"
echo "   1. Open ~/Desktop/refactor-plan.md"
echo "   2. Pick one component to extract"
echo "   3. Use component-template.jsx as base"
echo "   4. Test after each extraction"
echo ""
echo "Option 2 - SEMI-AUTO (Faster):"
echo "   cd ~/Workspace/mia-vn/warehouse-main"
echo "   code src/components/google/GoogleDriveIntegration.jsx"
echo "   # Use VS Code refactoring tools"
echo ""
echo "Option 3 - AI-ASSISTED:"
echo "   # Ask Claude to help extract specific sections"
echo "   # Paste code snippets for analysis"
echo ""
echo "💡 TIP: Start with GoogleDriveIntegration.jsx (biggest file)"
echo "💡 Extract ONE component at a time"
echo "💡 Test after EACH extraction"
echo ""
