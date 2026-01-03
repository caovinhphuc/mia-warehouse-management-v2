#!/bin/bash

# COMPONENT ANALYZER & EXTRACTION SUGGESTER
# Phân tích file lớn và suggest cách tách cụ thể

PROJECT_DIR="$HOME/Workspace/mia-vn/warehouse-main"
TARGET_FILE="$1"

if [ -z "$TARGET_FILE" ]; then
  echo "Usage: ./analyze-component.sh <file-path>"
  echo "Example: ./analyze-component.sh src/components/google/GoogleDriveIntegration.jsx"
  exit 1
fi

cd "$PROJECT_DIR"

if [ ! -f "$TARGET_FILE" ]; then
  echo "❌ File not found: $TARGET_FILE"
  exit 1
fi

FILENAME=$(basename "$TARGET_FILE")
echo "🔍 ANALYZING: $FILENAME"
echo "=================================="
echo ""

# 1. FILE STATS
echo "📊 FILE STATISTICS:"
TOTAL_LINES=$(wc -l < "$TARGET_FILE")
echo "   Total lines: $TOTAL_LINES"

IMPORTS=$(grep -c "^import" "$TARGET_FILE" 2>/dev/null || echo 0)
echo "   Imports: $IMPORTS"

COMPONENTS=$(grep -c "^const.*=.*=>.*{$\|^function.*Component\|^export.*function" "$TARGET_FILE" 2>/dev/null || echo 0)
echo "   Components/Functions: $COMPONENTS"

USESTATE=$(grep -c "useState" "$TARGET_FILE" 2>/dev/null || echo 0)
echo "   useState hooks: $USESTATE"

USEEFFECT=$(grep -c "useEffect" "$TARGET_FILE" 2>/dev/null || echo 0)
echo "   useEffect hooks: $USEEFFECT"

echo ""

# 2. FIND LARGE FUNCTIONS
echo "🎯 LARGE FUNCTIONS (>50 lines):"
echo ""

awk '
/^const.*=.*=>.*{$|^function/ {
  fname = $0
  start = NR
  brace_count = 0
  in_function = 1
}
in_function {
  brace_count += gsub(/{/, "&")
  brace_count -= gsub(/}/, "&")
  if (brace_count == 0 && in_function) {
    lines = NR - start + 1
    if (lines > 50) {
      print "   📦 Line " start ": " lines " lines"
      print "      " fname
      print ""
    }
    in_function = 0
  }
}
' "$TARGET_FILE"

# 3. JSX BLOCKS
echo "🎨 JSX RETURN BLOCKS:"
echo ""

grep -n "return (" "$TARGET_FILE" | while IFS=: read line_num content; do
  # Count lines in JSX block
  echo "   📄 Line $line_num: JSX block starts"
done
echo ""

# 4. SUGGEST EXTRACTIONS
echo "💡 EXTRACTION SUGGESTIONS:"
echo ""

# Check for file-related operations
if grep -q "FileList\|FileUpload\|FilePreview" "$TARGET_FILE"; then
  echo "   ✂️  Extract: File operations (upload, list, preview)"
fi

# Check for folder operations
if grep -q "Folder\|Directory\|Tree" "$TARGET_FILE"; then
  echo "   ✂️  Extract: Folder/tree navigation"
fi

# Check for form handling
if grep -q "handleSubmit\|onSubmit\|FormData" "$TARGET_FILE"; then
  echo "   ✂️  Extract: Form handling logic"
fi

# Check for modals
if grep -q "Modal\|Dialog\|showModal" "$TARGET_FILE"; then
  echo "   ✂️  Extract: Modal components"
fi

# Check for tables
if grep -q "Table\|DataGrid\|columns\|rows" "$TARGET_FILE"; then
  echo "   ✂️  Extract: Table/grid components"
fi

# Check for API calls
if grep -q "fetch\|axios\|api\." "$TARGET_FILE"; then
  echo "   ✂️  Extract: API service logic → custom hook"
fi

# Check for complex state
if [ "$USESTATE" -gt 5 ]; then
  echo "   ✂️  Extract: State management → custom hook or context"
fi

echo ""

# 5. GENERATE EXTRACTION COMMANDS
OUTPUT_DIR="$HOME/Desktop/refactor-$(basename $TARGET_FILE .jsx)"
mkdir -p "$OUTPUT_DIR"

cat > "$OUTPUT_DIR/extraction-guide.md" << EOF
# Extraction Guide for $FILENAME

Generated: $(date)

## File Analysis
- Total Lines: $TOTAL_LINES
- Imports: $IMPORTS
- Components: $COMPONENTS
- useState: $USESTATE
- useEffect: $USEEFFECT

## Recommended Splits

### 1. Extract UI Components

Create separate files for each major UI section:

\`\`\`bash
# Example extractions:
touch src/components/google/drive/FileList.jsx
touch src/components/google/drive/FileUpload.jsx
touch src/components/google/drive/FilePreview.jsx
touch src/components/google/drive/FolderTree.jsx
\`\`\`

### 2. Extract Business Logic

Move logic to custom hooks:

\`\`\`bash
touch src/hooks/google/useDriveOperations.js
touch src/hooks/google/useFolderNavigation.js
\`\`\`

### 3. Extract Constants & Utils

\`\`\`bash
touch src/constants/driveConstants.js
touch src/utils/driveHelpers.js
\`\`\`

## Step-by-Step Process

1. **Identify section** (e.g., FileList rendering)
2. **Create new file** (e.g., FileList.jsx)
3. **Copy JSX + related logic**
4. **Define props interface**
5. **Update imports in parent**
6. **Test compilation**
7. **Repeat for next section**

## Testing After Each Step

\`\`\`bash
cd ~/Workspace/mia-vn/warehouse-main
pnpm dev
# Check if app runs
# Check console for errors
\`\`\`

EOF

echo "✅ Extraction guide saved to: $OUTPUT_DIR/extraction-guide.md"
echo ""

# 6. CREATE STARTER FILES
cat > "$OUTPUT_DIR/FileList.jsx" << 'COMPONENT'
import React from 'react';

/**
 * FileList Component
 * Displays list of files from Google Drive
 */
const FileList = ({ 
  files = [], 
  onFileSelect,
  onFileDelete,
  loading = false 
}) => {
  if (loading) {
    return <div>Loading files...</div>;
  }

  if (files.length === 0) {
    return <div>No files found</div>;
  }

  return (
    <div className="file-list">
      {files.map(file => (
        <div 
          key={file.id} 
          className="file-item"
          onClick={() => onFileSelect(file)}
        >
          <span>{file.name}</span>
          <button onClick={(e) => {
            e.stopPropagation();
            onFileDelete(file.id);
          }}>
            Delete
          </button>
        </div>
      ))}
    </div>
  );
};

export default FileList;
COMPONENT

cat > "$OUTPUT_DIR/useDriveOperations.js" << 'HOOK'
import { useState, useCallback } from 'react';

/**
 * useDriveOperations
 * Handles Google Drive operations
 */
const useDriveOperations = () => {
  const [files, setFiles] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchFiles = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      // TODO: Implement actual API call
      const response = await fetch('/api/drive/files');
      const data = await response.json();
      setFiles(data.files);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  const uploadFile = useCallback(async (file) => {
    // TODO: Implement upload logic
    console.log('Uploading:', file.name);
  }, []);

  const deleteFile = useCallback(async (fileId) => {
    // TODO: Implement delete logic
    setFiles(prev => prev.filter(f => f.id !== fileId));
  }, []);

  return {
    files,
    loading,
    error,
    fetchFiles,
    uploadFile,
    deleteFile,
  };
};

export default useDriveOperations;
HOOK

echo "✅ Example components created in: $OUTPUT_DIR/"
echo ""

echo "======================================"
echo "✅ ANALYSIS COMPLETE!"
echo "======================================"
echo ""
echo "📁 Output directory: $OUTPUT_DIR"
echo ""
echo "📄 Files created:"
echo "   - extraction-guide.md (detailed plan)"
echo "   - FileList.jsx (example component)"
echo "   - useDriveOperations.js (example hook)"
echo ""
echo "🎯 NEXT STEPS:"
echo "1. Review: $OUTPUT_DIR/extraction-guide.md"
echo "2. Open original file: code $TARGET_FILE"
echo "3. Start extracting using examples as templates"
echo "4. Test after each extraction: pnpm dev"
echo ""
