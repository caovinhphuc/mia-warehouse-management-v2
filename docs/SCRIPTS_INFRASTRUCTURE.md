# 🛠️ Scripts & Infrastructure — mia-warehouse-management-v2

> **Dự án:** mia-warehouse-management-v2 (MIA.vn Google Integration Platform)
> **Cập nhật:** 2026-03-12

---

## 📁 Cấu trúc scripts/

```
mia-warehouse-management-v2/
│
├── scripts/
│   ├── deploy/                          # Deploy scripts
│   │   ├── main.sh                      # Deploy chính (Netlify/Vercel/Docker)
│   │   ├── production.sh                # Deploy production server (PM2 + Nginx + SSL)
│   │   └── vercel.sh                    # Deploy Vercel chuyên biệt
│   │
│   ├── monitoring/                      # Giám sát services
│   │   ├── monitor.sh                   # Dashboard health check 1 lần
│   │   └── monitor-services.sh          # Real-time monitoring (loop mỗi 30s)
│   │
│   ├── setup/                           # Setup ban đầu
│   │   ├── main.sh                      # Setup chính
│   │   ├── https.sh                     # Tạo self-signed SSL cert cho localhost
│   │   └── google-credentials.sh        # Kiểm tra + hướng dẫn Google credentials
│   │
│   ├── start/                           # Khởi động services
│   │   ├── all.sh                       # Start tất cả services
│   │   ├── ai-platform.sh              # Start AI platform (frontend + backend + AI)
│   │   └── data-flow.sh                # Start data pipeline (Automation → Sheets → AI → Telegram)
│   │
│   ├── stop/
│   │   └── all.sh                       # Dừng tất cả services
│   │
│   ├── check/
│   │   └── health.sh                    # Health check tất cả integrations
│   │
│   ├── utils/
│   │   ├── common.sh                    # Shared functions (colors, logging)
│   │   ├── ports.sh                     # Kiểm tra ports đang dùng
│   │   └── clean.sh                     # Dọn cache, build artifacts
│   │
│   ├── analyze-bundle.js               # Phân tích webpack bundle
│   ├── analyze-bundle-deps.js          # Phân tích dependencies trong bundle
│   ├── build-optimize.js               # Build + optimization
│   ├── bundle-status.sh                # Báo cáo bundle size
│   ├── check-config.sh                 # Validate config files
│   ├── cleanup-healthcheck-artifacts.js # Dọn health check artifacts
│   ├── create-env-from-json.js         # Tạo .env từ JSON
│   ├── deploy.js                       # Deploy script (Node - multi platform)
│   ├── fix-docker-compose.sh           # Fix docker-compose issues
│   ├── fix-env-vars.js                 # Fix env variables
│   ├── format-and-lint.sh              # Format + lint all-in-one
│   ├── health-check.js                 # Health check (Node version)
│   ├── optimize-icons.sh               # Optimize icon assets
│   ├── performance-bundle.js           # Performance budget check
│   ├── save-webpack-stats.js           # Save webpack stats JSON
│   ├── setup.js                        # Setup (Node version)
│   ├── test-wrapper.sh                 # Test wrapper cho Jest
│   ├── testEmailService.js             # Test SendGrid email
│   ├── testGoogleConnection.js         # Test Google API connection
│   ├── testTelegramConnection.js       # Test Telegram bot
│   └── validate-config.js             # Validate project config
│
├── docs/env-reference/                  # Tham khảo env (chỉ đọc, KHÔNG chạy)
│   ├── railway-env-vars.txt             # Biến env cần set trên Railway
│   ├── vercel-env-update.txt            # Biến env cần set trên Vercel
│   └── local-driver-config.txt          # Selenium ChromeDriver local config
```

---

## 🐳 Docker Files

| File | Mô tả | Cách dùng |
|------|--------|-----------|
| `docker-compose.yml` | **Dev/default** — 3 services: frontend (3000), backend (3001), redis (6379) | `docker compose up -d` |
| `docker-compose.production.yml` | **Production** — 4 services: + monitoring (8080), resource limits | `docker compose -f docker-compose.production.yml up -d` |
| `compose.debug.yaml` | **Debug** — single service cho VS Code debug | `docker compose -f compose.debug.yaml up` |
| `Dockerfile` | Root Dockerfile (generic) | Dùng bởi docker-compose |
| `Dockerfile-frontend` | Frontend multi-stage: node build → nginx serve | Dùng bởi docker-compose |
| `backend/Dockerfile` | Backend Express | Dùng bởi docker-compose |
| `nginx.conf` | Nginx config cho frontend container (port 3000, gzip, security headers, API proxy) | Copy vào Docker image |

---

## 🌐 Deploy Configs

| File | Platform | Mô tả |
|------|----------|--------|
| `vercel.json` | **Vercel** | Routes: login.html, assets cache, SPA fallback |
| `app.yaml` | **Google App Engine** | Runtime nodejs16, env vars placeholder |
| `backend/railway.json` | **Railway** | Backend deploy config |
| `backend/render.yaml` | **Render** | Backend deploy: npm install → npm start, port 3001 |

---

## ⚙️ Build & Tooling Configs

| File | Tool | Ghi chú |
|------|------|---------|
| `vite.config.mjs` | **Vite 7** | Build chính, dev server, proxy, aliases |
| `craco.config.js` | **CRACO** | Legacy CRA override (webpack) |
| `craco-plugin-fix-devserver.js` | **CRACO Plugin** | Fix webpack-dev-server v3→v4 |
| `webpack.config.js` | **Webpack** | Standalone webpack config |
| `vitest.config.js` | **Vitest** | Test config cho Vite |
| `jest.config.js` | **Jest** | Test config cho CRACO/CRA |
| `babel.config.js` | **Babel** | Transform JSX, modern JS |
| `eslint.config.mjs` | **ESLint 9** | Flat config, React + hooks + a11y |
| `postcss.config.js` | **PostCSS** | Autoprefixer, etc. |
| `tsconfig.json` | **TypeScript** | Path aliases, strict mode |
| `.prettierrc` | **Prettier** | Double quotes, semi, 80 chars |
| `.prettierignore` | **Prettier** | Ignore patterns |
| `.editorconfig` | **EditorConfig** | UTF-8, LF, 2 spaces |
| `.nvmrc` | **fnm/nvm** | Node 22 (auto-switch) |

---

## 📄 Env Files

| File | Mục đích | Commit? |
|------|----------|---------|
| `.env` | Env vars thật cho local dev | ❌ KHÔNG (trong .gitignore) |
| `.env.template` | Template để tạo .env (copy rồi điền) | ✅ CÓ |
| `.env.vercel.example` | Hướng dẫn biến cần set trên Vercel | ✅ CÓ |
| `backend/.env` | Backend env vars | ❌ KHÔNG |
| `docs/env-reference/railway-env-vars.txt` | Tham khảo production Railway values | ✅ CÓ |
| `docs/env-reference/vercel-env-update.txt` | Tham khảo production Vercel URLs | ✅ CÓ |

---

## 🔌 Ports

| Service | Port | Config location |
|---------|------|-----------------|
| Frontend (Vite dev) | **3000** | `vite.config.mjs` → `server.port` |
| Backend (Express) | **3001** | `backend/server.js` + `.env` → `PORT` |
| AI Service (Python) | **5000** | `ai-service/` |
| Backend health (docker) | **8000** | `docker-compose.yml` → backend→REACT_APP_API_URL |
| Monitoring (nginx) | **8080** | `docker-compose.production.yml` |
| Redis | **6379** | `docker-compose.yml` |

---

## 🔄 Cách dùng từng nhóm scripts

### Deploy

```bash
# // Dự án: mia-warehouse-management-v2 — Deploy nhanh
npm run deploy                            # Chạy deploy.sh (tự chọn platform)

# // Dự án: mia-warehouse-management-v2 — Deploy cụ thể
npm run deploy:vercel                     # → scripts/deploy/vercel.sh
npm run deploy:production                 # → scripts/deploy/production.sh (PM2 + Nginx + SSL)
npm run deploy:netlify                    # → scripts/deploy/main.sh netlify
npm run deploy:docker                     # → deploy.sh docker
```

### Monitoring

```bash
# // Dự án: mia-warehouse-management-v2
npm run health-check                      # 1 lần check (shell)
npm run health-check:js                   # 1 lần check (Node, chi tiết hơn)
npm run monitor                           # Dashboard health (scripts/monitoring/monitor.sh)
npm run monitor:services                  # Auto-refresh mỗi 30s (Ctrl+C dừng)
```

### Setup (chạy 1 lần khi mới clone)

```bash
# // Dự án: mia-warehouse-management-v2
npm run setup                             # Setup chính
npm run setup:env                         # Tạo .env từ template
npm run setup:complete                    # Setup + install + health check

# // Dự án: mia-warehouse-management-v2 — Chạy trực tiếp
./scripts/setup/https.sh                  # Tạo SSL cert cho localhost
./scripts/setup/google-credentials.sh     # Kiểm tra Google credentials
```

### Start Services

```bash
# // Dự án: mia-warehouse-management-v2 — Đơn giản
npm start                                 # Frontend only (Vite)
npm run dev                               # Frontend + Backend

# // Dự án: mia-warehouse-management-v2 — Full stack
npm run start:all                         # Tất cả services (scripts/start/all.sh)
./scripts/start/ai-platform.sh            # Frontend + Backend + AI Service
./scripts/start/data-flow.sh              # Data pipeline (Automation → Sheets → AI → Telegram)
```

### Docker

```bash
# // Dự án: mia-warehouse-management-v2
docker compose up -d                                      # Dev (3 services)
docker compose -f docker-compose.production.yml up -d     # Production (4 services)
docker compose down                                       # Dừng
docker compose logs -f frontend                           # Logs frontend
docker compose ps                                         # Status
```
