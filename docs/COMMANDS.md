# 📋 Tất Cả Lệnh — mia-warehouse-management-v2

> **Dự án:** mia-warehouse-management-v2 (MIA.vn Google Integration Platform)
> **Package manager:** npm
> **Node version:** 22+ (auto-switch qua `.nvmrc`)
> **Cập nhật:** 2026-03-12

---

## 🚀 Development (chạy hàng ngày)

```bash
# // Dự án: mia-warehouse-management-v2 — Frontend React + Vite
npm start                     # Chạy frontend dev server (Vite, port 3000)
npm run dev                   # Chạy cả frontend + backend cùng lúc (concurrently)
npm run dev:full              # Giống npm run dev

# // Dự án: mia-warehouse-management-v2 — Backend Express
npm run start:backend         # Chạy backend riêng (port 3001)
npm run start:all             # Chạy tất cả services (scripts/start/all.sh)
```

## 🔨 Build

```bash
# // Dự án: mia-warehouse-management-v2 — Build với Vite
npm run build                 # Build production (Vite)
npm run build:prod            # Build production + sourcemap
npm run build:dev             # Build dev + sourcemap
npm run build:optimize        # Build + optimize (custom script)
npm run vercel-build          # Build cho Vercel deployment

# // Dự án: mia-warehouse-management-v2 — Build với CRACO (legacy)
npm run build:analyze         # Build + webpack bundle analyzer
npm run build:no-sourcemap    # Build không có sourcemap
npm run build:minimal         # Build tối giản nhất
```

## 🧪 Testing

```bash
# // Dự án: mia-warehouse-management-v2 — Unit tests (Jest)
npm test                      # Chạy tests qua wrapper script
npm run test:watch            # Chạy tests watch mode (craco)
npm run test:coverage         # Chạy tests + coverage report
npm run test:unit             # Chạy unit tests only
npm run test:all              # Chạy unit + integration tests

# // Dự án: mia-warehouse-management-v2 — Integration tests
npm run test:google           # Test Google Sheets/Drive connection
npm run test:telegram         # Test Telegram bot connection
npm run test:email            # Test SendGrid email connection
npm run test:integration      # Chạy tất cả integration tests
```

## 🎨 Code Quality

```bash
# // Dự án: mia-warehouse-management-v2 — ESLint
npm run lint                  # Lint + auto-fix
npm run lint:check            # Lint only (không fix)
npm run lint:fix              # Lint + fix

# // Dự án: mia-warehouse-management-v2 — Prettier
npm run format                # Format tất cả src/
npm run format:check          # Check format (không sửa)

# // Dự án: mia-warehouse-management-v2 — Pre-commit
npm run precommit             # lint:check + format:check + test:unit
npm run prepush               # lint:check + format:check + test:all
npm run typecheck             # TypeScript check (tsc --noEmit)
```

## 🚢 Deployment

```bash
# // Dự án: mia-warehouse-management-v2 — Deploy
npm run deploy                # Deploy qua deploy.sh (chọn platform)
npm run deploy:vercel         # Deploy lên Vercel
npm run deploy:netlify        # Deploy lên Netlify
npm run deploy:production     # Deploy production (Docker + PM2 + Nginx)
npm run deploy:docker         # Deploy bằng Docker
npm run deploy:js             # Deploy qua Node script (Vercel/Netlify/AWS/GCP)
npm run deploy:staging        # Build prod → deploy Vercel

# // Dự án: mia-warehouse-management-v2 — Rebuild + Deploy
npm run rebuild:deploy        # Full rebuild rồi deploy
npm run rebuild:deploy:docker # Full rebuild → Docker deploy
npm run rebuild:deploy:vercel # Full rebuild → Vercel deploy

# // Dự án: mia-warehouse-management-v2 — Git shortcuts
npm run commit:quick          # git add -A && git commit -m "message"
npm run commit:push           # commit + push
```

## ⚙️ Setup & Configuration

```bash
# // Dự án: mia-warehouse-management-v2 — Setup ban đầu
npm run setup                 # Setup script chính (setup.sh)
npm run setup:js              # Setup qua Node script
npm run setup:env             # Tạo .env từ JSON config
npm run setup:complete        # Setup + npm install + health check
```

## 🏥 Health & Monitoring

```bash
# // Dự án: mia-warehouse-management-v2 — Health checks
npm run health-check          # Check tất cả services (shell script)
npm run health-check:js       # Check tất cả services (Node script)
npm run health-check:backend  # Check backend (curl localhost:8000)
npm run health-check:frontend # Check frontend (curl localhost:3000)

# // Dự án: mia-warehouse-management-v2 — Monitoring
npm run monitor               # Dashboard health check tổng quan
npm run monitor:services      # Real-time monitor (auto refresh 30s)
npm run check:ports           # Kiểm tra ports đang dùng
npm run check:deps            # npm outdated
npm run check:security        # npm audit
npm run cleanup:healthcheck   # Dọn artifacts từ health check
```

## 📊 Analysis & Optimization

```bash
# // Dự án: mia-warehouse-management-v2 — Bundle analysis
npm run analyze               # CRACO build + analyze bundle
npm run analyze:webpack       # Webpack bundle analyzer
npm run analyze:webpack:interactive  # Webpack analyzer (interactive browser)
npm run analyze:sourcemap     # Vite build + source-map-explorer
npm run analyze:all           # Tất cả analysis tools
npm run analyze:simple        # Build + analyze (đơn giản)
```

## 🐳 Docker

```bash
# // Dự án: mia-warehouse-management-v2 — Docker commands (KHÔNG phải npm scripts)
docker compose up -d                                      # Dev stack (frontend + backend + redis)
docker compose -f docker-compose.production.yml up -d     # Production stack (+ monitoring)
docker compose down                                       # Dừng tất cả containers
docker compose logs -f                                    # Xem logs realtime
```

---

## ⚡ Quick Reference — Lệnh hay dùng nhất

```bash
fnm use 22                    # Đảm bảo Node 22 (tự động nếu có .nvmrc)
npm start                     # Chạy frontend
npm run dev                   # Chạy full-stack
npm run build                 # Build production
npm test                      # Chạy tests
npm run health-check          # Kiểm tra hệ thống
npm run deploy:vercel          # Deploy Vercel
```
