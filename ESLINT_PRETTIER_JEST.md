# 🎨 ESLint, Prettier & Jest Configuration Guide

## ✅ Consolidated Configuration (Single Source of Truth)

**Philosophy:** One configuration file per tool, strictly enforced across all environments.

### 1. ESLint (Code Linting) - ENFORCED

**Primary Config:** `eslint.config.mjs` (ESLint 9+ flat config only)

**DEPRECATED FILES (Remove these):**

- ❌ `.eslintrc.json` - Old format, not used
- ❌ `eslint.config.js` - Old flat config, not used
- ✅ `eslint.config.mjs` - **ONLY THIS FILE IS ACTIVE**

**Strict Rules Enforced:**

```javascript
// eslint.config.mjs - Consolidated rules
export default [
  {
    rules: {
      // ERRORS (Block commit)
      "no-var": "error", // Must use let/const
      semi: "error", // Always use semicolons
      "no-undef": "error", // No undefined variables
      "no-duplicate-imports": "error", // No duplicate imports
      "prefer-const": "error", // Use const when possible

      // WARNINGS (Should fix before merge)
      "no-console": ["warn", { allow: ["warn", "error"] }],
      "no-unused-vars": [
        "warn",
        {
          argsIgnorePattern: "^_",
          varsIgnorePattern: "^_",
        },
      ],
      "require-await": "warn",

      // React specific
      "react/jsx-uses-react": "off", // React 17+ doesn't need import
      "react/react-in-jsx-scope": "off",
      "react-hooks/rules-of-hooks": "error",
      "react-hooks/exhaustive-deps": "warn",
    },
  },
];
```

**Ignore Patterns (Consolidated):**

```javascript
ignores: [
  "**/node_modules/**",
  "**/build/**",
  "**/dist/**",
  "**/coverage/**",
  "**/*.min.js",
  "**/scripts/**/*.js", // Scripts can use console
  "**/*.test.js", // Tests have different rules
];
```

**Plugins đã cài:**

- ✅ `eslint-plugin-react` - React rules
- ✅ `eslint-plugin-react-hooks` - React Hooks rules
- ✅ `eslint-plugin-jsx-a11y` - Accessibility rules
- ✅ `eslint-plugin-import` - Import/export rules
- ✅ `eslint-config-prettier` - Tắt rules conflict với Prettier
- ✅ `@babel/eslint-parser` - Parse modern JavaScript

**Features:**

- React 17+ JSX Runtime (không cần import React)
- React Hooks validation
- Accessibility checks
- Import organization
- Unused variables warnings
- Console.log warnings (production)

### 2. Prettier (Code Formatting) - AUTO-ENFORCED

**Primary Config:** `.prettierrc` (JSON format only)

**Settings (LOCKED - Do not modify):**

````json
{
  "semi": true,
  "trailingComma": "es5",
  "singleQuote": false,
  "printWidth": 80,
  "tabWidth": 2,
  "arrowParens": "always",
  "endOfLine": "lf",
  "useTabs": false,
  "bracketSpacing": true,
  "jsxBracketSameLine": false
} - STRICT COVERAGE

**Primary Config:** `jest.config.js` (CommonJS format)

**Strict Coverage Thresholds:**

```javascript
coverageThreshold: {
  global: {
    branches: 70,      // Increased from 50%
    functions: 70,     // Increased from 50%
    lines: 70,         // Increased from 50%
    statements: 70     // Increased from 50%
  }
}
````

**Required Test Patterns:**

- ✅ `*.test.js` - Unit tests
- ✅ `*.spec.js` - Integration tests
- ✅ `__tests__/*.js` - Test suites
  Enforced Workflow

### Auto-fix on Save (VS Code Required Settings)

Update `.vscode/settings.json`:

```json
{
  "editor.formatOnSave": true,
  "editor.defaultFormatter": "esbenp.prettier-vscode",
  "editor.codeActionsOnSave": {
    "source.fixAll.eslint": "explicit",
    "source.organizeImports": "never"
  },
  "eslint.validate": [
    "javascript",
    "javascriptreact",
    "typescript",
    "typescriptreact"
  ],
  "eslint.codeActionsOnSave.mode": "all",
  "files.eol": "\n",
  "files.insertFinalNewline": true,
  "files.trimTrailingWhitespace": true
}
```

### Pre-commit Hook (MANDATORY)

Install Husky + lint-staged:

```bash
npm install --save-dev husky lint-staged

# Setup husky
npx husky init
npx husky add .husky/pre-commit "npx lint-staged"
```

**lint-staged config in package.json:**

```json
{
  "lint-staged": {
    "*.{js,jsx}": ["prettier --write", "eslint --fix --max-warnings=0"],
    "*.{json,md,css,scss}": ["prettier --write"]
  }
}
```

### StConsolidated File Structure (Single Source)

```
project-root/
├── eslint.config.mjs       # ✅ ONLY ESLint config (ESLint 9+)
├── .prettierrc             # ✅ ONLY Prettier config (JSON)
├── .prettierignore         # ✅ Prettier ignore patterns
├── jest.config.js          # ✅ ONLY Jest config (CommonJS)
├── babel.config.js         # ✅ Babel for Jest/Build
├── vite.config.js          # ✅ Vite build config
├── .vscode/
│   └── settings.json       # ✅ Editor enforcement
├── .husky/
│   └── pre-commit          # ✅ Git hooks
└── package.json
    └── lint-staged         # ✅ Pre-commit rules

❌ REMOVE THESE DEPRECATED FILES:
├── .eslintrc.json          # Old format
├── .eslintrc.js            # Old format
├── eslint.config.js        # Old flat config
└── craco.config.js         # Use vite.config.js instead

# Lint with warnings allowed
npm run lint
```

### Testing với Jest

```bash
# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Run tests with coverage
npm run test:coverage

# Run unit tests only
npm run test:unit
```

### All-in-One Quality Check

```bash
# Run format + lint + typecheck
./scripts/format-and-lint.sh

# Or run precommit checks
npm run precommit
```

## 📁 File Structure

```
project-root/
├── .eslintrc.json          # (deprecated) Old ESLint config
├── eslint.config.js        # (deprecated) Old flat config
├── eslint.config.mjs       # ✅ Current ESLint 9+ config
├── .prettierrc             # ✅ Prettier configuration
├── .prettierignore         # Files to ignore in formatting
├── jest.config.js          # ✅ Jest testing configuration
├── babel.config.js         # Babel configuration
└── scripts/
    ├── format-and-lint.sh  # ✅ Quality check script
    └── check-config.sh     # Configuration validation
```

## 🔧 Strict Rule Enforcement

### ESLint Rules (ERRORS - Block Commit)

| Rule                         | Level | Description                    | Auto-fix |
| ---------------------------- | ----- | ------------------------------ | -------- |
| `no-var`                     | error | Must use let/const             | ✅       |
| `semi`                       | error | Always use semicolons          | ✅       |
| `no-undef`                   | error | No undefined variables         | ❌       |
| `no-duplicate-imports`       | error | No duplicate imports           | ✅       |
| `prefer-const`               | error | Use const when possible        | ✅       |
| `no-case-declarations`       | error | No declarations in case blocks | ❌       |
| `react-hooks/rules-of-hooks` | error | Follow React Hooks rules       | ❌       |

### ESLint Warnings (Should Fix Before Merge)

| Rule                          | Level | Description                           | Auto-fix |
| ----------------------------- | ----- | ------------------------------------- | -------- |
| `no-console`                  | warn  | Remove console.log (allow warn/error) | ❌       |
| `no-unused-vars`              | warn  | Remove unused variables               | ❌       |
| `require-await`               | warn  | Async functions must use await        | ❌       |
| `react-hooks/exhaustive-deps` | warn  | Include all dependencies              | ❌       |

### Prettier Rules (AUTO-FIX Always)

- ✅ `semi: true` - Semicolons required
- ✅ `singleQuote: false` - Double quotes only
- ✅ `trailingComma: "es5"` - Trailing commas where valid
- ✅ `printWidth: 80` - Max line length 80
- ✅ `tabWidth: 2` - 2 spaces per indent
- ✅ `endOfLine: "lf"` - Unix line endings only

### Jest Requirements (MANDATORY)

- ✅ 70% branch coverage
- ✅ 70% function coverage
- ✅ 70% line coverage
- ✅ 70% statement coverage
- ✅ All tests must pass before commite,
  "editor.defaultFormatter": "esbenp.prettier-vscode",
  "editor.codeActionsOnSave": {
  "source.fixAll.eslint": true,
  "source.organizeImports": false
  },
  "eslint.validate": [
  "javascript",
  "javascriptreact",
  "typescript",
  "typescriptreact"
  ],
  "jest.autoRun": "off",
  "jest.showCoverageOnLoad": false
  }

````

## 🎯 ESLint Rules Overview

### Errors (Must Fix)

- `no-var` - Use let/const instead of var
- `semi` - Always use semicolons
- `react-hooks/rules-of-hooks` - Follow React Hooks rules
 (ENFORCED)

### GitHub Actions (Required)

```yaml
name: Quality Check

on: [push, pull_request]

jobs:
  quality:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3

      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '18'
          cache: 'npm'

      - name: Install dependencies
        run: npm ci

      - name: Format check (BLOCKING)
        run: npm run format:check

      - name: Lint check (ZERO warnings)
        run: npm run lint:check -- --max-warnings=0

      - name: Test with coverage (70% required)
        run: npm run test:coverage

      - name: Build check
        run: npm run build
````

### Pre-commit Hook (AUTO-INSTALLED)

````bash
#!/bin/sh
. "$(dirname "$Requirements (STRICT)

**Current Enforced Thresholds:**

```javascript
// jest.config.js
coverageThreshold: {
  global: {
    branches: 70,      // ✅ 70% minimum (increased from 50%)
    functions: 70,     // ✅ 70% minimum (increased from 50%)
    lines: 70,         // ✅ 70% minimum (increased from 50%)
    statements: 70     // ✅ 70% minimum (increased from 50%)
  }
}
````

**Per-directory enforcement:**

```javascript
coverageThreshold: {
  './src/services/': {
    branches: 80,
    functions: 80,
    lines: 80,
    statements: 80
  },
  './src/utils/': {
    branches: 90,
    functions: 90,
    lines: 90,
    statements: 90
  }
}
```

**Coverage reports MUST be committed:**

````gitignore
# DO NOT ignore these
!coverage/coverage-summary.json
!coverage/lcov.info echo "❌ Lint check failed. Run 'npm run lint:fix' to fix."
  exit 1
}

# Test check
npm run test:unit || {
  echo "❌ Tests failed. Fix tests before committing."
  exit 1
}

echo "✅ Pre-commit checks passed!"

### Test Structure

```javascript
import { render, screen } from "@testing-library/react";
import MyComponent from "@components/MyComponent";

describe("MyComponent", () => {
  it("renders correctly", () => {
    reStrict Workflow (MANDATORY)

### 1. Development Workflow

```bash
# Start development (with auto-fix on save enabled)
npm run dev

# Before committing ANY code:
npm run format        # Format code (REQUIRED)
npm run lint:fix      # Fix lint errors (REQUIRED)
npm run test          # Run all tests (REQUIRED)
npm run test:coverage # Verify coverage ≥70% (REQUIRED)

# Commit (pre-commit hook runs automatically)
git add .
git commit -m "feat: your message"  # Blocks if checks fail
````

### 2. Code Review Checklist (ALL MUST PASS)

- ✅ No ESLint errors (zero tolerance)
- ✅ No ESLint warnings in new code
- ✅ Code formatted with Prettier
- ✅ All tests passing
- ✅ Coverage ≥70% maintained
- ✅ No console.logs except console.warn/console.error
- ✅ No unused variables/imports
- ✅ No `any` types (if using TypeScript)
- ✅ All async functions use await
- ✅ React hooks follow rules

### 3. Merge Requirements

**BLOCKING conditions (PR cannot merge):**

- ❌ ESLint errors exist
- ❌ Tests failing
- ❌ Coverage below 70%
- ❌ Format check fails
- ❌ Build fails

**WARNING conditions (should fix before merge):**

- ⚠️ EEssential Commands (Use These Only)

```bash
# ============================================
# FORMATTING (Run first, always)
# ============================================
npm run format                 # Auto-fix all formatting
npm run format:check           # Check formatting (CI)

# ============================================
# LINTING (Run second, fix errors)
# ============================================
npm run lint:fix               # Auto-fix lint errors
npm run lint:check             # Check linting (CI)
npm run lint:check -- --max-warnings=0  # Strict mode (CI)

# ============================================
# TESTING (Run third, verify coverage)
# ============================================
npm test                       # Run all tests
npm run test:coverage          # With coverage report
npm run test:watch             # Watch mode (development)

# ============================================
# ALL-IN-ONE (Run before commit)
# ============================================
npm run precommit              # Format + Lint + Test (REQUIRED)

# ============================================
# BUILD (Run before deploy)
# ============================================
npm run build                  # Production build
npm run build && npm run analyze  # Build + analyze bundle
```

## 🚨 Troubleshooting Enforced Rules

### Error: "Unexpected console statement"

```bash
# Option 1: Use console.warn or console.error instead
console.warn('This is allowed');

# Option 2: Add eslint-disable comment
// eslint-disable-next-line no-console
console.log('Debug info');

# Option 3: Move to scripts/ folder (console allowed there)
```

### Error: "No undefined variables (no-undef)"

```bash
# Add global comment at top of file
/* global Intl, AbortController */

# Or better: Import from proper source
import { AbortController } from 'node-abort-controller';
```

### Error: "Async function has no await"

```bash
# Option 1: Add await
async function fetchData() {
  return await axios.get('/api');  // Added await
}

# Option 2: Remove async
function fetchData() {
  return axios.get('/api');  // Not async
}
```

### Error: "Duplicate imports"

```bash
# Bad:
import { Button } from 'antd';
import { Table } from 'antd';

# Good:
import { Button, Table } from 'antd';
```

### Error: "Coverage threshold not met"

```bash
# Add tests to increase coverage
npm run test:coverage -- --collectCoverageFrom='src/**/*.js' --verbose

# View coverage report
open coverage/lcov-report/index.html
```

---

**Version:** 3.0.0 (Enforced Rules)  
**Last Updated:** 2026-01-19  
**Status:** ✅ Strict Mode Enabled  
**Enforcement:** Zero tolerance for errors, warnings reviewed  
**Tools:** ESLint 9+, Prettier 3+, Jest 29+, Husky, lint-staged
"hooks": {
"pre-commit": "npm run precommit",
"pre-push": "npm run prepush"
}
}
}

````

### GitHub Actions

```yaml
- name: Lint & Format Check
  run: |
    npm run lint:check
    npm run format:check

- name: Run Tests
  run: npm run test:coverage
````

## 📊 Coverage Thresholds

Current settings in `jest.config.js`:

```javascript
coverageThreshold: {
  global: {
    branches: 50,    // 50% branch coverage
    functions: 50,   // 50% function coverage
    lines: 50,       // 50% line coverage
    statements: 50   // 50% statement coverage
  }
}
```

## 🐛 Troubleshooting

### ESLint không hoạt động

```bash
# Clear cache
rm -rf node_modules/.cache

# Reinstall
npm install

# Check config
npx eslint --print-config src/App.jsx
```

### Prettier conflict với ESLint

```bash
# Đã được xử lý với eslint-config-prettier
# Prettier chạy riêng, ESLint không check formatting
npm run format
npm run lint:fix
```

### Jest không tìm thấy modules

```bash
# Check aliases in jest.config.js
# Must match vite.config.js and craco.config.js

# Clear Jest cache
npm test -- --clearCache
```

### Watch mode không hoạt động

```bash
# Install watchman (macOS)
brew install watchman

# Or use polling
npm test -- --watchAll --usePolling
```

## 📚 Best Practices

### 1. Commit Workflow

```bash
# Before commit
npm run format        # Format code
npm run lint:fix      # Fix lint errors
npm test             # Run tests
npm run precommit    # Run all checks
```

### 2. Code Review Checklist

- [ ] No ESLint errors
- [ ] Code formatted with Prettier
- [ ] Tests passing
- [ ] Coverage maintained/improved
- [ ] No console.logs in production code

### 3. Ignore Patterns

**ESLint:** Check `eslint.config.mjs` ignores section
**Prettier:** Check `.prettierignore` file
**Jest:** Check `testPathIgnorePatterns` in `jest.config.js`

## 🎉 Quick Commands

```bash
# Full quality check
./scripts/format-and-lint.sh

# Format + Lint + Test
npm run precommit

# Watch mode for development
npm run test:watch

# Coverage report
npm run test:coverage
open coverage/lcov-report/index.html
```

---

**Version:** 2.0.0  
**Last Updated:** 2026-01-18  
**Status:** ✅ Production Ready  
**Tools:** ESLint 9+, Prettier 3+, Jest 29+
