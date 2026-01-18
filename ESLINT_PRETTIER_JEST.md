# 🎨 ESLint, Prettier & Jest Configuration Guide

## ✅ Đã cài đặt và cấu hình

### 1. ESLint (Code Linting)

**File cấu hình:** `eslint.config.mjs` (ESLint 9+ flat config)

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

### 2. Prettier (Code Formatting)

**File cấu hình:** `.prettierrc`

**Settings:**

```json
{
  "semi": true, // Semicolons required
  "trailingComma": "es5", // Trailing commas where valid in ES5
  "singleQuote": false, // Use double quotes
  "printWidth": 80, // Line wrap at 80 characters
  "tabWidth": 2, // 2 spaces per indent
  "arrowParens": "always", // Always parentheses for arrow functions
  "endOfLine": "lf" // Unix line endings
}
```

### 3. Jest (Testing)

**File cấu hình:** `jest.config.js`

**Features:**

- jsdom test environment
- Path aliases matching Vite/CRACO config
- Coverage thresholds (50%)
- CSS/Asset mocking
- Transform ignore for specific packages
- Watch mode with typeahead
- Babel transformation

**Plugins:**

- ✅ `jest-watch-typeahead` - Better watch mode
- ✅ `babel-jest` - Transform modern JavaScript
- ✅ `identity-obj-proxy` - Mock CSS modules
- ✅ `jest-transform-stub` - Mock static assets

## 🚀 Sử dụng

### Formatting với Prettier

```bash
# Check formatting
npm run format:check

# Auto-format all files
npm run format

# Format specific files
npm run format:staged
```

### Linting với ESLint

```bash
# Check for linting errors
npm run lint:check

# Auto-fix linting errors
npm run lint:fix

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

## 🔧 VS Code Integration

### Recommended Extensions

```json
{
  "recommendations": [
    "dbaeumer.vscode-eslint",
    "esbenp.prettier-vscode",
    "firsttris.vscode-jest-runner",
    "orta.vscode-jest"
  ]
}
```

### Workspace Settings

Tạo file `.vscode/settings.json`:

```json
{
  "editor.formatOnSave": true,
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
```

## 🎯 ESLint Rules Overview

### Errors (Must Fix)

- `no-var` - Use let/const instead of var
- `semi` - Always use semicolons
- `react-hooks/rules-of-hooks` - Follow React Hooks rules

### Warnings (Should Fix)

- `no-console` - Remove console.log (except warn/error)
- `no-unused-vars` - Remove unused variables
- `prefer-const` - Use const when variable isn't reassigned
- `react-hooks/exhaustive-deps` - Include all dependencies in useEffect

### Disabled (Handled by Prettier)

- `quotes` - Quote style
- `comma-dangle` - Trailing commas
- `object-curly-spacing` - Object spacing
- `indent` - Indentation
- All other formatting rules

## 🧪 Jest Testing Best Practices

### Test File Naming

```
MyComponent.jsx          → MyComponent.test.jsx
myUtility.js            → myUtility.spec.js
__tests__/MyComponent.js
```

### Test Structure

```javascript
import { render, screen } from "@testing-library/react";
import MyComponent from "@components/MyComponent";

describe("MyComponent", () => {
  it("renders correctly", () => {
    render(<MyComponent />);
    expect(screen.getByText("Hello")).toBeInTheDocument();
  });

  it("handles click events", () => {
    const handleClick = jest.fn();
    render(<MyComponent onClick={handleClick} />);
    // ... test implementation
  });
});
```

### Path Aliases in Tests

```javascript
// All these work in tests:
import Component from "@/components/MyComponent";
import { myUtil } from "@utils/myUtility";
import config from "@config/app.config";
```

## 🔄 CI/CD Integration

### Pre-commit Hook (Husky)

```json
{
  "husky": {
    "hooks": {
      "pre-commit": "npm run precommit",
      "pre-push": "npm run prepush"
    }
  }
}
```

### GitHub Actions

```yaml
- name: Lint & Format Check
  run: |
    npm run lint:check
    npm run format:check

- name: Run Tests
  run: npm run test:coverage
```

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
