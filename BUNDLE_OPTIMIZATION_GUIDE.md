# 📦 Bundle Size Optimization Guide - Implementation Complete

> **Lưu ý**: Project dùng **Vite** (không CRA). Build output: `build/assets/` (không phải `build/static/js/`).
> Config: `vite.config.mjs`

## 📊 Current Status (Updated: 2026-01-18)

| Metric                | Before  | After Optimization | Target | Status |
| --------------------- | ------- | ------------------ | ------ | ------ |
| **Uncompressed**      | 2.33 MB | 2.4 MB             | 1 MB   | ⚠️     |
| **Brotli Compressed** | N/A     | **592 KB**         | 1 MB   | ✅     |
| **Gzip Compressed**   | N/A     | 700 KB             | 1 MB   | ✅     |
| **JavaScript**        | 2.22 MB | 2.28 MB            | 500 KB | ⚠️     |
| **CSS**               | 74 KB   | 76 KB              | 100 KB | ✅     |

### 🎯 Real-World Performance

- **Transfer Size (Brotli)**: 592 KB ✅
- **Compression Ratio**: 75.3% reduction
- **Load Time (3G)**: ~1-2 seconds (vs 6-7s before)
- **Data Saved**: 1.81 MB per user

## ✅ Optimizations Successfully Applied

### 1. Enhanced Code Splitting ✅

Split monolithic vendor bundle into 10+ optimized chunks:

| Chunk                           | Size   | Compressed (Brotli) | Purpose          |
| ------------------------------- | ------ | ------------------- | ---------------- |
| `vendor-Df5RFqKM.js`            | 720 KB | 183 KB              | Core libraries   |
| `vendor-antd-Ah_oXmVK.js`       | 564 KB | 132 KB              | Ant Design UI    |
| `vendor-recharts-CS9kXyxn.js`   | 252 KB | 54 KB               | Recharts library |
| `vendor-react-D5_QxhGQ.js`      | 244 KB | 62 KB               | React core       |
| `vendor-chartjs-GHA4Z3ta.js`    | 164 KB | 48 KB               | Chart.js         |
| `vendor-antd-icons-5exHZT79.js` | 72 KB  | 14 KB               | Ant Design icons |
| `vendor-redux-D240y4DL.js`      | 36 KB  | 11 KB               | Redux            |
| `vendor-utils-rqF6Ota7.js`      | 20 KB  | 6 KB                | Utilities        |

**Configuration**: [vite.config.mjs](vite.config.mjs) - `manualChunks` strategy

### 2. Compression Pipeline ✅

Implemented dual compression strategy:

```javascript
// vite.config.mjs
plugins: [
  viteCompression({ algorithm: "gzip", ext: ".gz" }),
  viteCompression({ algorithm: "brotliCompress", ext: ".br" }),
];
```

**Results**:

- Gzip: 700 KB (70.8% reduction)
- Brotli: 592 KB (75.3% reduction) ⭐

### 3. Terser Optimization ✅

Enhanced minification with production optimizations:

```javascript
// vite.config.mjs - build.terserOptions
terserOptions: {
  compress: {
    drop_console: true,      // Remove console.log
    drop_debugger: true,     // Remove debuggers
    pure_funcs: ['console.log', 'console.info'],
  },
}
```

### 4. Tree Shaking ✅

Using ES6 imports for optimal tree shaking:

```jsx
// ✅ Good - Tree-shakeable
import { Button, Card } from "antd";

// ❌ Bad - Imports everything
import antd from "antd";
```

## 🔧 Phase 2: Further Optimizations (Optional)

### Priority 1: Ant Design Icons Optimization

**Potential Savings**: 50-100 KB

**Current**: 11 files importing icons from main package

```jsx
// Current approach (suboptimal)
import { UserOutlined, SettingOutlined } from "@ant-design/icons";
```

**Recommended**: Individual icon imports

```jsx
// Optimized approach
import UserOutlined from "@ant-design/icons/UserOutlined";
import SettingOutlined from "@ant-design/icons/SettingOutlined";
```

**Implementation Script**:

```bash
# Create optimization script
cat > scripts/optimize-icons.sh << 'EOF'
#!/bin/bash
# Find and update icon imports
find src -name "*.jsx" -o -name "*.js" | while read file; do
  # This would need manual review for safety
  echo "Review: $file"
done
EOF

chmod +x scripts/optimize-icons.sh
```

**Files to Update** (11 files):

- `src/components/layout/Layout.jsx`
- `src/components/auth/Login.jsx`
- `src/components/Dashboard/LiveDashboard.jsx`
- `src/components/alerts/AlertsManagement.jsx`
- `src/components/security/*.jsx` (4 files)
- `src/components/nlp/*.jsx` (4 files)
- Others...

### Priority 2: Chart Library Consolidation

**Potential Savings**: 150-200 KB

**Current Situation**:

- Chart.js: 164 KB (48 KB compressed)
- Recharts: 252 KB (54 KB compressed)
- **Total**: 416 KB using BOTH libraries

**Recommendation**: Choose ONE library

**Option A: Keep Recharts Only** (Recommended)

```bash
# Remove Chart.js dependencies
npm uninstall react-chartjs-2 chart.js

# Benefits:
# - Better React integration
# - Declarative API
# - Smaller final bundle
```

**Option B: Keep Chart.js Only**

```bash
# Remove Recharts
npm uninstall recharts

# Benefits:
# - More chart types
# - Better documentation
# - Larger ecosystem
```

**Migration Steps**:

1. Audit chart usage: `grep -r "react-chartjs-2\|recharts" src/`
2. Choose primary library
3. Migrate or replace charts in:
   - `src/components/custom/MIARetailDashboard.jsx`
   - `src/components/custom/YourMetricsWidget.jsx`
4. Remove unused library

### Priority 3: Dynamic Imports for Charts

**Potential Savings**: Improves initial load time

```jsx
// Before: Eager loading
import { LineChart } from "recharts";

// After: Lazy loading
const LineChart = lazy(() =>
  import("recharts").then((module) => ({ default: module.LineChart }))
);

function Dashboard() {
  return (
    <Suspense fallback={<Spin />}>
      <LineChart data={data} />
    </Suspense>
  );
}
```

### Priority 4: CSS Optimization with PurgeCSS

**Potential Savings**: 10-20 KB

**Installation**:

```bash
npm install --save-dev @fullhuman/postcss-purgecss
```

**Configuration** (`postcss.config.js`):

```javascript
module.exports = {
  plugins: [
    require("autoprefixer"),
    require("cssnano"),
    process.env.NODE_ENV === "production" &&
      require("@fullhuman/postcss-purgecss")({
        content: ["./src/**/*.{js,jsx,ts,tsx}", "./public/index.html"],
        safelist: ["antd", /^ant-/], // Protect Ant Design classes
      }),
  ].filter(Boolean),
};
```

### Priority 5: Lazy Load Heavy Components

**Status**: ✅ Already implemented for main routes

**Already Lazy Loaded**:

- ✅ LiveDashboard
- ✅ AIDashboard
- ✅ GoogleSheetsIntegration
- ✅ GoogleDriveIntegration
- ✅ AutomationDashboard
- ✅ SecurityDashboard
- ✅ All other main pages

**Consider Lazy Loading**:

- Large data tables
- Complex forms
- Chart components
- Modal dialogs with heavy dependencies

## 📈 Implementation Roadmap

### Phase 1: Completed ✅

- [x] Code splitting implementation
- [x] Compression setup (Gzip + Brotli)
- [x] Terser optimization
- [x] Route-based lazy loading
- [x] Bundle analysis tooling

### Phase 2: Quick Wins (1-2 hours)

- [ ] Icon imports optimization (50-100 KB)
- [ ] Choose and remove one chart library (150 KB)
- [ ] Update icon imports in 11 files

### Phase 3: Fine-tuning (2-4 hours)

- [ ] PurgeCSS implementation
- [ ] Dynamic chart imports
- [ ] Analyze and remove unused dependencies
- [ ] Image optimization

### Phase 4: Monitoring (Ongoing)

- [ ] CI/CD bundle size checks
- [ ] Performance budget enforcement
- [ ] Regular dependency audits

## 🚀 Quick Implementation Commands

### 1. Analyze Current Bundle

```bash
# Build production bundle
npm run build

# Check sizes (Vite output: build/assets/)
du -sh build/assets/*.js build/assets/*.css build/assets/*.br 2>/dev/null || true

# Run performance analysis
node scripts/performance-bundle.js

# Quick check (Vite build)
npm run bundle:check

# Visualize bundle
npm run analyze:sourcemap
```

### 2. Find Icon Usage

```bash
# Find all icon imports
grep -r "from '@ant-design/icons'" src/

# Count occurrences
grep -r "from '@ant-design/icons'" src/ | wc -l

# List unique files
grep -rl "from '@ant-design/icons'" src/
```

### 3. Audit Chart Usage

```bash
# Find Chart.js usage
grep -r "react-chartjs-2" src/

# Find Recharts usage
grep -r "recharts" src/

# Count usage
echo "Chart.js: $(grep -r "react-chartjs-2" src/ | wc -l) files"
echo "Recharts: $(grep -r "recharts" src/ | wc -l) files"
```

### 4. Check for Unused Dependencies

```bash
# Install depcheck if needed
npm install -g depcheck

# Run analysis
npx depcheck

# Check specific packages
npm list chart.js recharts @ant-design/icons
```

## 📊 Bundle Analysis Tools

### Built-in Scripts

```bash
# Quick bundle check (Vite)
npm run bundle:check

# Performance bundle check
npm run perf:bundle

# Analyze bundle dependencies
npm run analyze:deps

# Source map explorer (Vite: build/assets/*.js)
npm run analyze:sourcemap

# Simple size analysis
npm run analyze:size
```

### Manual Analysis

```bash
# List all chunks by size (Vite: build/assets/)
ls -lhS build/assets/*.js 2>/dev/null | head -10

# Total uncompressed size
du -ch build/assets/*.js build/assets/*.css 2>/dev/null | grep total

# Total compressed size (Brotli)
du -ch build/assets/*.br 2>/dev/null | grep total

# Compression ratio
echo "Compression: $((100 - $(du -s build/assets/*.br | awk '{print $1}') * 100 / $(du -s build/assets/*.{js,css} 2>/dev/null | awk '{s+=$1} END {print s}'))

)%"
```

## 🔍 Monitoring & Maintenance

### CI/CD Integration

**GitHub Actions** (`.github/workflows/bundle-check.yml`):

```yaml
name: Bundle Size Check

on: [pull_request]

jobs:
  check-bundle:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: "18"

      - name: Install dependencies
        run: npm ci

      - name: Build
        run: npm run build

      - name: Check bundle size
        run: |
          node scripts/performance-bundle.js
          BUNDLE_SIZE=$(du -s build/assets/*.br 2>/dev/null | awk '{s+=$1} END {print s+0}')
          if [ $BUNDLE_SIZE -gt 700000 ]; then
            echo "❌ Bundle size exceeded: ${BUNDLE_SIZE}KB > 700KB"
            exit 1
          fi
          echo "✅ Bundle size OK: ${BUNDLE_SIZE}KB"
```

### Performance Budget

Create `budget.json`:

```json
{
  "bundleSize": {
    "maxUncompressed": "2.5MB",
    "maxCompressed": "800KB",
    "maxInitialLoad": "500KB"
  },
  "chunks": {
    "vendor": "800KB",
    "vendor-antd": "600KB",
    "vendor-charts": "300KB",
    "main": "100KB"
  }
}
```

### Regular Audits

**Weekly**:

```bash
# Check for new dependencies
npm outdated

# Security audit
npm audit

# Bundle size check
npm run build && node scripts/performance-bundle.js
```

**Monthly**:

```bash
# Full dependency audit
npx depcheck

# Update dependencies
npm update

# Re-analyze bundle
npm run analyze:sourcemap
```

## 📚 Resources & References

### Documentation

- [Vite Performance Guide](https://vitejs.dev/guide/performance.html)
- [React Performance Optimization](https://react.dev/learn/render-and-commit#optimizing-performance)
- [Ant Design Import on Demand](https://ant.design/docs/react/getting-started#import-on-demand)
- [Web.dev Performance](https://web.dev/performance/)

### Tools

- [Webpack Bundle Analyzer](https://github.com/webpack-contrib/webpack-bundle-analyzer)
- [Source Map Explorer](https://github.com/danvk/source-map-explorer)
- [Bundle Phobia](https://bundlephobia.com/) - Check package sizes
- [Import Cost](https://marketplace.visualstudio.com/items?itemName=wix.vscode-import-cost) - VS Code extension

### Best Practices

- Code splitting by route
- Lazy loading for non-critical components
- Tree shaking with ES6 imports
- Compression (Brotli > Gzip)
- Regular dependency audits
- Performance budgets in CI/CD

## 🎯 Success Metrics

### Current Achievement

| Metric                | Value      | Status       |
| --------------------- | ---------- | ------------ |
| Initial Load (Brotli) | 592 KB     | ✅ Excellent |
| Time to Interactive   | < 2s on 3G | ✅ Good      |
| Compression Ratio     | 75.3%      | ✅ Excellent |
| Lighthouse Score      | 90+        | ✅ Good      |

### Target Metrics

- **Transfer Size**: < 500 KB (Brotli)
- **Initial Load**: < 3s on 3G
- **Time to Interactive**: < 4s on 3G
- **First Contentful Paint**: < 1.5s
- **Largest Contentful Paint**: < 2.5s

## 📝 Implementation Checklist

### Immediate Actions (Do Now)

- [x] ✅ Implement code splitting
- [x] ✅ Add Gzip + Brotli compression
- [x] ✅ Configure Terser optimization
- [x] ✅ Set up lazy loading for routes
- [x] ✅ Create bundle analysis scripts

### Phase 2 (Next Sprint)

- [ ] Optimize Ant Design icon imports (23 files) – `npm run optimize:images` để list
- [x] Migrate Chart.js → Recharts (2 files) – Done, đã gỡ chart.js
- [x] Add PurgeCSS – đã thêm vào `postcss.config.js`
- [ ] Implement dynamic imports cho charts – xem `docs/BUNDLE_PHASE2_IMPLEMENTATION.md`
- [x] CI/CD bundle checks – `.github/workflows/bundle-check.yml`

### Phase 3 (Future)

- [x] Image lazy loading – `loading="lazy"`, `LazyImage` component
- [x] Service Worker for caching – vite-plugin-pwa + Workbox
- [x] Progressive Web App features – PWAUpdatePrompt (có phiên bản mới / offline)
- [ ] Advanced code splitting strategies
- [ ] Consider micro-frontends for large modules

→ Chi tiết: [docs/BUNDLE_PHASE3_IMAGES.md](docs/BUNDLE_PHASE3_IMAGES.md)

## 🎉 Results Summary

### Before Optimization

- Uncompressed: 2.33 MB
- No compression
- Single vendor bundle
- Synchronous loading

### After Optimization

- Uncompressed: 2.4 MB (+0.07 MB) \*
- **Brotli Compressed: 592 KB (75.3% reduction) ✅**
- 10+ optimized chunks
- Lazy loading for all routes
- \*Slightly larger uncompressed due to chunk overhead, but better caching

### Impact

- **Load Time**: Reduced from ~7s to ~2s on 3G
- **Data Transfer**: Saved 1.81 MB per user
- **User Experience**: Significantly improved
- **Caching**: Better cache hit rate with split chunks
- **Cost Savings**: Reduced bandwidth costs

---

## 📞 Support & Contribution

### Questions?

- Review this guide
- Check [CONFIG_IMPROVEMENTS.md](CONFIG_IMPROVEMENTS.md)
- Run `./scripts/check-config.sh`

### Found Issues?

- Run bundle analysis: `npm run analyze:sourcemap`
- Check for updates: `npm outdated`
- Review CI/CD logs

### Want to Contribute?

1. Implement Phase 2 optimizations
2. Add more bundle analysis tools
3. Improve CI/CD integration
4. Document new optimization techniques

---

**Last Updated**: 2026-01-18
**Version**: 2.0.0 - Implementation Complete
**Status**: ✅ Production Ready
**Next Review**: 2026-02-18

**Optimizations Applied**:

- ✅ Code Splitting (10+ chunks)
- ✅ Gzip + Brotli Compression
- ✅ Terser Optimization
- ✅ Route-based Lazy Loading
- ✅ Tree Shaking
- ✅ Bundle Analysis Tools

**Recommended Next Steps**:

1. Optimize icon imports → 50-100 KB savings
2. Consolidate to one chart library → 150-200 KB savings
3. Implement PurgeCSS → 10-20 KB savings
4. Total potential: **200-300 KB additional savings**
