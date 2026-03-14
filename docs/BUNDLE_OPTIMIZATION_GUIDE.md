# 📦 Bundle Optimization Guide

Complete guide for optimizing bundle size and improving application performance.

## 🎯 Overview

This guide implements comprehensive bundle optimization strategies that can reduce your initial bundle size by **70-80%** and improve load times by **3-5x**.

### Current Status

✅ **Đã triển khai:**

1. ✅ moment.js → dayjs (dateUtils.js)
2. ✅ Vite manualChunks (vendor splits)
3. ✅ lodashUtils.js, lazyLoad.js
4. ✅ Gzip + Brotli (vite-plugin-compression)
5. ✅ PWA (vite-plugin-pwa)

### Expected Impact

| Metric              | Before | After  | Improvement       |
| ------------------- | ------ | ------ | ----------------- |
| Initial Bundle      | ~2.5MB | ~500KB | **80% reduction** |
| First Load Time     | 8-10s  | 2-3s   | **3x faster**     |
| Time to Interactive | 12s    | 4s     | **3x faster**     |
| Lighthouse Score    | 60-70  | 90-95  | **+30 points**    |

---

## 🚀 Quick Start

### 1. Install Required Dependencies

```bash
# dayjs (đã có)
npm install dayjs

# Vite build - không cần babel-plugin-import/lodash (Vite xử lý ESM)
```

### 2. Verify Configuration

Build dùng **Vite** (`vite.config.mjs`). Các tối ưu đã có trong `vite.config.mjs`:
- `manualChunks` - Chia vendor (react, antd, redux, recharts...)
- `vite-plugin-compression` - Gzip + Brotli
- `optimizeDeps` - Pre-bundling

### 3. Run Bundle Analysis

```bash
# Phân tích dependencies (không cần build)
npm run analyze:deps

# Build Vite + xem kích thước
npm run build:prod && npm run analyze:size

# Phân tích đầy đủ (dùng craco - có thể cần cấu hình riêng)
npm run analyze
```

---

## 📚 Implementation Guide

### 1. Date Library Migration (moment.js → dayjs)

**Impact:** ~68KB reduction

#### What Changed

- Replaced moment.js (~70KB) with dayjs (~2KB)
- Updated [src/utils/dateUtils.js](../src/utils/dateUtils.js)
- All date formatting functions now use dayjs

#### Migration

```javascript
// ❌ Before (moment.js)
import moment from "moment";
const date = moment().format("DD/MM/YYYY");

// ✅ After (dayjs)
import dayjs from "dayjs";
const date = dayjs().format("DD/MM/YYYY");

// Or use utility functions
import { formatDate } from "@utils/dateUtils";
const date = formatDate(new Date());
```

#### Verification

```bash
# Check if moment is still in use
npm run analyze:deps | grep moment

# Should show: "⚠️ Consider replacing moment.js with dayjs"
```

---

### 2. Ant Design Optimization

**Impact:** ~200-300KB reduction with tree-shaking

#### Configuration

Ant Design v5 tree-shake tốt với named imports. Vite xử lý ESM tự động. Dùng named imports:

```javascript
// Ant Design v5 - tree-shaking qua ESM
```

#### Usage

```javascript
// ✅ Correct - Tree-shakeable
import { Button, Modal, Form } from "antd";

// ❌ Avoid - Imports everything
import antd from "antd";
```

#### Best Practices

- Import only components you use
- Use named imports: `import { Button } from 'antd'`
- Avoid `import * as antd from 'antd'`

---

### 3. Lodash Optimization

**Impact:** ~60KB reduction

#### Method 1: Use Utility Module (Recommended)

```javascript
// Import from centralized utility
import { debounce, throttle, get } from "@utils/lodashUtils";

// Use as normal
const debouncedFn = debounce(callback, 300);
const value = get(obj, "path.to.value");
```

#### Method 2: Direct Imports

```javascript
// Import specific functions
import debounce from "lodash/debounce";
import get from "lodash/get";
```

#### Method 3: Vite / ESM

Vite + lodash ESM tree-shake tốt. Hoặc dùng `@utils/lodashUtils` để centralize.

📖 **See:** [LODASH_OPTIMIZATION.md](./LODASH_OPTIMIZATION.md)

---

### 4. Code Splitting with React.lazy()

**Impact:** 70-80% initial bundle reduction

#### Setup

1. **Use Lazy Load Utility**

```javascript
import { lazyLoad } from "@utils/lazyLoad";

// Lazy load a component
const Dashboard = lazyLoad(() => import("./pages/Dashboard"));

// Use in routes
<Route path="/dashboard" element={<Dashboard />} />;
```

2. **Implement in Routes**

See [src/routes/lazyRoutes.example.js](../src/routes/lazyRoutes.example.js) for complete example.

```javascript
// Before: All components loaded at startup
import Dashboard from "./pages/Dashboard";
import Analytics from "./pages/Analytics";
import Reports from "./pages/Reports";

// After: Components loaded on-demand
const Dashboard = lazyLoad(() => import("./pages/Dashboard"));
const Analytics = lazyLoad(() => import("./pages/Analytics"));
const Reports = lazyLoad(() => import("./pages/Reports"));
```

#### Advanced: Preloading

```javascript
import { preloadComponent } from "@utils/lazyLoad";

// Preload on hover
<Link
  to="/analytics"
  onMouseEnter={() => preloadComponent(() => import("./pages/Analytics"))}
>
  Analytics
</Link>;

// Preload after initial load
useEffect(() => {
  setTimeout(() => {
    preloadComponent(() => import("./pages/Dashboard"));
  }, 2000);
}, []);
```

#### When to Split

✅ **Good candidates:**

- Route components (pages)
- Heavy libraries (charts, editors)
- Rarely used features
- Admin/settings panels
- Modal dialogs with heavy content

❌ **Don't split:**

- Small components (<10KB)
- Frequently used components
- Critical path components
- Components needed immediately

---

### 5. Vite Chunk Splitting

Đã cấu hình trong [vite.config.mjs](../vite.config.mjs) - `manualChunks`:

- `vendor-react` - react, react-dom
- `vendor-antd` - antd, @ant-design, rc-*
- `vendor-recharts` - recharts, d3-*
- `vendor-redux` - redux, react-redux
- `vendor-router` - react-router
- `vendor-mui` - @mui, @emotion
- `vendor-utils` - lodash, dayjs
- `vendor-socket` - socket.io

Xem `vite.config.mjs` → `build.rollupOptions.output.manualChunks`.

---

## 🔧 Tools & Scripts

### Analysis Scripts

| Script | Mô tả |
|--------|-------|
| `npm run analyze:deps` | Kiểm tra deps lớn, gợi ý tối ưu |
| `npm run analyze:size` | Build + hiển thị kích thước file (build/assets/) |
| `npm run analyze:performance` | Phân tích hiệu năng |
| `npm run analyze:sourcemap` | Source map (cần GENERATE_SOURCEMAP=true) |
| `npm run analyze` | Full (craco build - legacy) |

### Build Scripts (Vite)

```bash
# Production (Vite)
npm run build:prod

# Hoặc
npm run build
```

---

## 📊 Monitoring & Measurement

### Before Optimization

Run baseline analysis:

```bash
npm run build:prod
npm run analyze:size
```

Save the output for comparison.

### After Optimization

1. **Build and analyze:**

```bash
npm run analyze
```

2. **Check metrics:**

- Initial bundle size
- Number of chunks
- Largest chunks
- Vendor chunk sizes

3. **Test loading:**

```bash
npm run serve
# Open http://localhost:3000
# Check Network tab in DevTools
```

### Key Metrics to Monitor

| Metric                 | Target      | How to Check    |
| ---------------------- | ----------- | --------------- |
| Initial JS             | <500KB      | Network tab     |
| Initial CSS            | <50KB       | Network tab     |
| Vendor chunks          | <300KB each | Bundle analyzer |
| Route chunks           | <200KB each | Bundle analyzer |
| Time to Interactive    | <4s         | Lighthouse      |
| First Contentful Paint | <2s         | Lighthouse      |

---

## 🎯 Best Practices

### General Guidelines

1. **Lazy load routes** - Split by page/route
2. **Import specifically** - Avoid `import *`
3. **Use tree-shaking** - ESM imports only
4. **Analyze regularly** - Run `npm run analyze:deps` monthly
5. **Monitor bundle size** - Set CI/CD alerts

### Import Guidelines

```javascript
// ✅ Good - Specific imports
import { Button } from "antd";
import debounce from "lodash/debounce";
import { formatDate } from "@utils/dateUtils";

// ❌ Bad - Full imports
import antd from "antd";
import _ from "lodash";
import * as utils from "@utils/dateUtils";
```

### Code Splitting Guidelines

```javascript
// ✅ Good - Split heavy/rare components
const AdminPanel = lazy(() => import("./AdminPanel"));
const ChartingLibrary = lazy(() => import("./Charts"));

// ❌ Bad - Don't split critical/small components
const Button = lazy(() => import("./Button")); // Too small
const Header = lazy(() => import("./Header")); // Critical path
```

---

## 🔍 Troubleshooting

### Issue: Bundle still large after optimization

**Check:**

1. Run `npm run analyze` to see what's included
2. Check for duplicate dependencies
3. Verify babel plugins are active
4. Check if all imports are optimized

**Solution:**

```bash
# Check for unused deps
npx depcheck

# Check duplicate deps
npm ls [package-name]

# Rebuild node_modules
rm -rf node_modules package-lock.json
npm install
```

### Issue: Code splitting not working

**Check:**

1. Verify React version (18.2.0+)
2. Check for import errors
3. Verify webpack config

**Solution:**

```bash
# Check React version
npm ls react

# Update if needed
npm update react react-dom
```

### Issue: Module not found

**Vite** resolve ESM trực tiếp. Kiểm tra:
- Path alias trong `vite.config.mjs` → `resolve.alias`
- `@utils`, `@services` trỏ đúng `./src/`

---

## 📈 Expected Results

### Bundle Size Comparison

| Library   | Before    | After          | Savings         |
| --------- | --------- | -------------- | --------------- |
| moment.js | 70KB      | 0KB (replaced) | **70KB**        |
| dayjs     | 0KB       | 2KB            | +2KB            |
| lodash    | 70KB      | 10KB           | **60KB**        |
| antd      | 600KB     | 300KB          | **300KB**       |
| **Total** | **740KB** | **312KB**      | **428KB (58%)** |

### Performance Improvement

| Metric              | Before | After | Improvement     |
| ------------------- | ------ | ----- | --------------- |
| Initial Load        | 8-10s  | 2-3s  | **3x faster**   |
| Time to Interactive | 12s    | 4s    | **3x faster**   |
| Bundle Size         | 2.5MB  | 500KB | **80% smaller** |
| Lighthouse Score    | 60-70  | 90-95 | **+30 points**  |

---

## 🎓 Learning Resources

### Documentation

- [React Code Splitting](https://react.dev/reference/react/lazy)
- [Webpack Bundle Analyzer](https://github.com/webpack-contrib/webpack-bundle-analyzer)
- [dayjs Documentation](https://day.js.org/)
- [Ant Design Import on Demand](https://ant.design/docs/react/getting-started#import-on-demand)

### Internal Docs

- [LODASH_OPTIMIZATION.md](./LODASH_OPTIMIZATION.md) - Lodash optimization
- [BUNDLE_PHASE2_IMPLEMENTATION.md](./BUNDLE_PHASE2_IMPLEMENTATION.md) - PurgeCSS, Chart audit
- [BUNDLE_PHASE3_IMAGES.md](./BUNDLE_PHASE3_IMAGES.md) - Images, LazyImage, PWA
- [lazyLoad.js](../src/utils/lazyLoad.js) - Lazy loading
- [lazyRoutes.example.js](../src/routes/lazyRoutes.example.js) - Code splitting mẫu

---

## ✅ Checklist

### Đã triển khai

- [x] moment.js → dayjs (dateUtils.js)
- [x] lodashUtils.js
- [x] lazyLoad.js
- [x] Vite manualChunks (vite.config.mjs)
- [x] Gzip + Brotli (vite-plugin-compression)
- [x] PWA (vite-plugin-pwa)
- [x] lazyRoutes.example.js

### Tùy chọn

- [ ] Code splitting cho routes (áp dụng lazyRoutes pattern)
- [ ] Run `npm run analyze:size` để baseline
- [ ] CI/CD bundle size alerts

---

## 📞 Support

For questions or issues:

1. Check [Troubleshooting](#troubleshooting) section
2. Review [Learning Resources](#learning-resources)
3. Run `npm run analyze:deps` for current status
4. Check build logs for errors

---

**Last Updated:** March 14, 2026  
**Build:** Vite (vite.config.mjs)  
**Status:** Tối ưu chính đã triển khai; moment đã thay dayjs  
**Config tổng hợp:** [docs/CONFIG_STATUS.md](CONFIG_STATUS.md)
