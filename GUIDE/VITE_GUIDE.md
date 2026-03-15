# ⚡ Vite Configuration Guide - MIA.vn Google Integration

## 📋 Tổng Quan

Hệ thống hỗ trợ cả **Create React App (CRA)** và **Vite** để build và development.

- **CRA (Craco)**: Build tool hiện tại (production)
- **Vite**: Build tool mới (nhanh hơn, modern)

---

## 🚀 Vite Features

### ✅ Đã Cấu Hình

1. **React Plugin** với Fast Refresh
2. **Code Splitting** tối ưu
3. **Gzip & Brotli Compression**
4. **HTML Plugin** với template variables
5. **Path Aliases** (@components, @utils, etc.)
6. **WebSocket Proxy** cho real-time
7. **Optimized Dependencies** pre-bundling
8. **Production Optimizations** (minify, drop console)

---

## 📦 Dependencies

### Core Vite Dependencies

```json
{
  "devDependencies": {
    "vite": "^5.4.0",
    "@vitejs/plugin-react": "^4.3.0",
    "vitest": "^2.1.0",
    "@vitest/ui": "^2.1.0",
    "jsdom": "^24.0.0",
    "vite-plugin-pwa": "^0.20.0",
    "vite-plugin-compression": "^0.5.1",
    "vite-plugin-html": "^3.2.2"
  }
}
```

---

## 🎯 Usage

### Development

```bash
# Start với Vite (nhanh hơn CRA)
npm run dev

# Hoặc
npm run dev:vite

# Start với CRA (hiện tại)
npm start
```

### Build

```bash
# Build với Vite
npm run build:vite

# Build production với Vite
npm run build:vite:prod

# Build với CRA (hiện tại)
npm run build
```

### Preview

```bash
# Preview build với Vite
npm run preview

# Hoặc
npm run preview:vite
```

### Testing

```bash
# Test với Vitest
npm run test:vite

# Test với UI
npm run test:vite:ui

# Test với coverage
npm run test:vite:coverage

# Test watch mode
npm run test:vite:watch

# Test với CRA (hiện tại)
npm run test
```

---

## ⚙️ Configuration

### vite.config.js

**Key Features:**

1. **Code Splitting Strategy:**
   - `vendor-react`: React core
   - `vendor-antd`: Ant Design
   - `vendor-google`: Google APIs (nên di chuyển backend)
   - `vendor-charts`: Chart libraries
   - `vendor-redux`: Redux
   - `vendor-router`: React Router
   - `vendor-dayjs`: Dayjs với timezone
   - `vendor-other`: Other vendors

2. **Compression:**
   - Gzip compression (`.gz`)
   - Brotli compression (`.br`)
   - Threshold: 1KB

3. **Optimizations:**
   - Pre-bundling dependencies
   - Tree shaking
   - Minification với Terser
   - Drop console in production

4. **Proxy:**
   - `/api` → `http://localhost:3001`
   - `/ws` → `ws://localhost:3002` (WebSocket)

5. **Path Aliases:**

   ```javascript
   @ → ./src
   @components → ./src/components
   @services → ./src/services
   @utils → ./src/utils
   @config → ./src/config
   @hooks → ./src/hooks
   @store → ./src/store
   @constants → ./src/constants
   ```

### vitest.config.js

**Key Features:**

1. **Test Environment:** jsdom
2. **Coverage:** v8 provider
3. **Thresholds:** 70% cho tất cả metrics
4. **Parallel Testing:** Enabled
5. **UI Mode:** Available với `--ui`

---

## 🔧 Advanced Configuration

### Environment Variables

```bash
# .env.development
VITE_API_URL=http://localhost:3001
VITE_WS_URL=ws://localhost:3002
VITE_ENABLE_ANALYTICS=true

# .env.production
VITE_API_URL=https://api.yourdomain.com
VITE_WS_URL=wss://ws.yourdomain.com
VITE_CDN_URL=https://cdn.yourdomain.com
```

### CDN Support

```javascript
// vite.config.js đã cấu hình CDN
// Set VITE_CDN_URL trong .env.production
VITE_CDN_URL=https://cdn.yourdomain.com
```

### PWA Support

```bash
# Cài đặt PWA plugin (đã có trong dependencies)
npm install vite-plugin-pwa --save-dev
```

```javascript

# Cấu hình trong vite.config.js
import { VitePWA } from 'vite-plugin-pwa'
```

---

## 📊 Performance Comparison

### Build Time

| Tool | Development Start | Production Build |
|------|------------------|------------------|
| CRA (Craco) | ~15-20s | ~45-60s |
| Vite | ~1-3s | ~10-15s |

### Bundle Size

- **CRA Build:** ~2.67 MB
- **Vite Build:** Tương tự (cùng code)
- **Optimization:** Code splitting tốt hơn với Vite

---

## 🎯 Migration Path

### Option 1: Keep Both (Recommended)

- Development: Dùng Vite (nhanh)
- Production: Dùng CRA (stable)
- Testing: Dùng cả hai

### Option 2: Migrate to Vite

1. Test với Vite development
2. Build và test production
3. Update CI/CD
4. Remove CRA dependencies

---

## 💡 Best Practices

### 1. Use Path Aliases

```javascript
// ❌ BAD
import Button from '../../../components/Common/Button'

// ✅ GOOD
import Button from '@components/Common/Button'
```

### 2. Optimize Imports

```javascript
// ❌ BAD - Import toàn bộ
import _ from 'lodash'
import * as antd from 'antd'

// ✅ GOOD - Import từng phần
import debounce from 'lodash/debounce'
import { Button } from 'antd'
```

### 3. Use Dynamic Imports

```javascript
// ✅ Lazy load components
const HeavyComponent = lazy(() => import('@components/HeavyComponent'))
```

---

## 🐛 Troubleshooting

### Issue: HMR không hoạt động

```bash
# Kiểm tra port
lsof -i :3000

# Restart dev server
npm run dev
```

### Issue: Build fails

```bash
# Clear cache
rm -rf node_modules/.vite
npm run build:vite
```

### Issue: Tests fail

```bash
# Clear test cache
rm -rf node_modules/.vitest
npm run test:vite
```

---

## 📚 Resources

- [Vite Documentation](https://vitejs.dev/)
- [Vitest Documentation](https://vitest.dev/)
- [Vite Plugin React](https://github.com/vitejs/vite-plugin-react)

---

**Last Updated:** November 24, 2025
**Version:** 1.0.0
