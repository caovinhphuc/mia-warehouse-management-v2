# 🔧 Vercel Config Guide - MIA.vn Warehouse Management

> **Cập nhật**: 2026-03-14 | **Framework**: Vite + React

---

## 📋 Tổng Quan

Cấu hình Vercel cho **MIA.vn** - Vite build, security headers, PWA caching.

---

## 🎯 Quick Start

```bash
# Deploy
npm run deploy:vercel

# Hoặc
./scripts/deploy/vercel.sh
```

---

## ⚙️ vercel.json (Đã nâng cấp)

### Build

- **Framework**: Vite (`npm run vercel-build` = `vite build`)
- **Output**: `build/` (vite.config.mjs: `outDir: "build"`)

### Cải tiến đã áp dụng (2026-03-14)

| Tính năng | Mô tả |
|-----------|-------|
| **Security headers** | X-Content-Type-Options, X-Frame-Options, X-XSS-Protection, Referrer-Policy |
| **PWA routing** | sw.js (no-cache), manifest.json, manifest.webmanifest (1d cache) |
| **Static caching** | /assets, /login/*, /static, *.js,css,ico,png... → 1 year immutable |
| **SPA fallback** | Tất cả route khác → index.html |

### Cấu trúc

```json
{
  "builds": [...],
  "headers": [/* security headers */],
  "routes": [
    /* PWA → static assets → SPA fallback */
  ]
}
```

---

## 🔐 Environment Variables

### Format

Dự án dùng **VITE_** (chính) và **REACT_APP_** (fallback qua importMetaEnv):

```env
# API (bắt buộc)
VITE_API_URL=https://your-backend.com
REACT_APP_API_URL=https://your-backend.com

# Google
VITE_GOOGLE_SHEETS_SPREADSHEET_ID=...
REACT_APP_GOOGLE_SHEETS_SPREADSHEET_ID=...
VITE_GOOGLE_DRIVE_FOLDER_ID=...
REACT_APP_GOOGLE_DRIVE_FOLDER_ID=...

# Telegram
VITE_TELEGRAM_CHAT_ID=...
REACT_APP_TELEGRAM_CHAT_ID=...

# WebSocket
VITE_WS_URL=wss://your-ws.com
REACT_APP_WS_URL=wss://your-ws.com

# Optional
VITE_SENTRY_DSN=...
VITE_AI_SERVICE_URL=...
```

### Cấu hình trong Vercel

1. **Dashboard**: Project → Settings → Environment Variables
2. Thêm biến cho **Production** (và Preview nếu cần)
3. **Redeploy** sau khi sửa

---

## 🚀 Build Settings (Vercel Dashboard)

| Setting | Value |
|---------|-------|
| Framework Preset | Other |
| Build Command | `npm run vercel-build` |
| Output Directory | `build` |
| Install Command | `npm install` |
| Node.js Version | 18.x |

---

## 📦 Deploy Script

```bash
npm run deploy:vercel
# → scripts/deploy/vercel.sh
```

Script thực hiện: check deps → build → `vercel --prod`

---

## 🔧 Troubleshooting

### Build fails

```bash
npm run vercel-build   # Test local
```

### Env vars không load

- Dùng `VITE_*` hoặc `REACT_APP_*`
- Redeploy sau khi thêm/sửa
- Kiểm tra Environment = Production

### API / Login lỗi

- Set `VITE_API_URL` / `REACT_APP_API_URL` đúng backend production
- Backend phải CORS cho domain Vercel

### 404 khi refresh

- Route `/(.*)` → `/index.html` đã có trong vercel.json
- Redeploy nếu mới thêm route mới

---

## 📚 Xem thêm

- `GUIDE/VERCEL_ENV_SETUP.md` - Chi tiết env vars
- `docs/VERCEL_GITHUB_DEPLOY.md` - GitHub auto deploy
