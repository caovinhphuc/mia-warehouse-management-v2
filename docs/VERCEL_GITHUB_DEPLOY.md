# 🚀 Hướng dẫn Deploy Vercel + GitHub

**Ngày tạo:** 2025-02-06
**Tác giả:** AI Assistant

---

## 📋 Tổng quan kiến trúc

Dự án MIA Warehouse có **2 phần**:

| Thành phần   | Tech stack        | Host đề xuất                  | Ghi chú                                |
| ------------ | ----------------- | ----------------------------- | -------------------------------------- |
| **Frontend** | React + Vite      | **Vercel**                    | Static/SPA, deploy từ GitHub           |
| **Backend**  | Node.js + Express | **Railway / Render / Fly.io** | API server, WebSocket, Google/Telegram |

### Production URLs (hiện tại)

- **Frontend (Netlify)**: https://fabulous-klepon-ad4aa7.netlify.app
- **Login**: https://fabulous-klepon-ad4aa7.netlify.app/login.html
- **Backend (Render)**: https://react-google-backend.onrender.com

### Luồng hoạt động

```
GitHub (monorepo)
    ├── push main → Vercel auto-deploy Frontend
    └── push main → Railway/Render auto-deploy Backend (nếu dùng)
```

---

## 1️⃣ Cấu trúc chia tách (đề xuất)

### Option A: Monorepo – 1 repo, 2 deploy (Khuyến nghị)

```
mia-warehouse-management-v2/
├── src/              ← Frontend (Vercel deploy)
├── backend/          ← Backend (Railway/Render deploy riêng)
├── vercel.json       ← Chỉ build frontend
└── .github/          ← Workflows nếu cần
```

- **Vercel**: Root project, build command `npm run build`, output `build/`
- **Railway/Render**: Chọn thư mục `backend/` làm Root Directory

### Option B: Tách repo (nếu team lớn)

- Repo `mia-warehouse-frontend` → Vercel
- Repo `mia-warehouse-backend` → Railway/Render

---

## 2️⃣ Cấu hình Vercel

### Bước 1: Kết nối GitHub

1. Đăng nhập [vercel.com](https://vercel.com)
2. **Add New Project** → Import từ GitHub
3. Chọn repo `mia-warehouse-management-v2`

### Bước 2: Build Settings

| Setting          | Giá trị         |
| ---------------- | --------------- |
| Framework Preset | Vite            |
| Root Directory   | `./` (để trống) |
| Build Command    | `npm run build` |
| Output Directory | `build`         |
| Install Command  | `npm install`   |

**Ghi chú:** Project dùng Vite (`vite build`), output vào `build/`. Biến env phải có prefix `VITE_` để được embed vào bundle.

### Bước 3: Environment Variables (Vercel Dashboard)

Vào **Project → Settings → Environment Variables**, thêm:

#### Biến bắt buộc (Frontend)

| Name                                    | Value                                       | Environment         |
| --------------------------------------- | ------------------------------------------- | ------------------- |
| `VITE_API_URL` hoặc `VITE_API_BASE_URL` | `https://react-google-backend.onrender.com` | Production, Preview |
| `VITE_GOOGLE_SHEETS_SPREADSHEET_ID`     | `...`                                       | Production, Preview |
| `VITE_GOOGLE_DRIVE_FOLDER_ID`           | `...`                                       | Production, Preview |

#### Biến tùy chọn

| Name                          | Value                            |
| ----------------------------- | -------------------------------- |
| `VITE_GOOGLE_APPS_SCRIPT_URL` | URL Apps Script                  |
| `VITE_TELEGRAM_CHAT_ID`       | Chat ID Telegram                 |
| `VITE_AI_SERVICE_URL`         | URL AI service (nếu có)          |
| `VITE_WEBSOCKET_URL`          | `wss://your-backend.railway.app` |

**Lưu ý:** Vite chỉ nhúng biến có prefix `VITE_` vào bundle. Codebase hỗ trợ cả `VITE_*` và `REACT_APP_*` (fallback), nhưng trên Vercel dùng `VITE_*`.

---

## 3️⃣ Environment Variables – Chiến lược

### Nguyên tắc

1. Không commit `.env` vào Git.
2. Dùng `.env.example` làm mẫu (không có giá trị thật).
3. Mỗi môi trường (local, vercel, backend host) cấu hình env riêng.

### File `.env.example` (thêm vào repo)

```env
# === FRONTEND (Vercel) - Chỉ VITE_* được embed vào build ===
VITE_API_URL=https://react-google-backend.onrender.com
VITE_API_BASE_URL=https://react-google-backend.onrender.com/api
VITE_GOOGLE_SHEETS_SPREADSHEET_ID=
VITE_GOOGLE_DRIVE_FOLDER_ID=
VITE_GOOGLE_APPS_SCRIPT_URL=
VITE_TELEGRAM_CHAT_ID=
VITE_AI_SERVICE_URL=

# === BACKEND (Railway/Render) - Không dùng trên Vercel ===
# GOOGLE_SERVICE_ACCOUNT_KEY_PATH=
# GOOGLE_DRIVE_FOLDER_ID=
# TELEGRAM_BOT_TOKEN=
# TELEGRAM_CHAT_ID=
```

### Phân chia theo môi trường

| Biến                                | Local                   | Vercel (Frontend)                           | Backend Host |
| ----------------------------------- | ----------------------- | ------------------------------------------- | ------------ |
| `VITE_API_URL`                      | `http://localhost:3001` | `https://react-google-backend.onrender.com` | —            |
| `VITE_GOOGLE_SHEETS_SPREADSHEET_ID` | ✓                       | ✓                                           | —            |
| `GOOGLE_PRIVATE_KEY`                | ✓                       | ✗                                           | ✓            |
| `TELEGRAM_BOT_TOKEN`                | ✓                       | ✗                                           | ✓            |
| `REACT_APP_*`                       | ✓                       | Dùng `VITE_*` thay                          | —            |

---

## 4️⃣ Deploy Backend (Railway / Render)

### Railway

1. Tạo project mới
2. **Deploy from GitHub** → chọn repo
3. **Root Directory**: `backend`
4. **Build Command**: `npm install`
5. **Start Command**: `node server.js` hoặc `npm start`
6. Thêm env: `GOOGLE_*`, `TELEGRAM_*`, `PORT`, v.v.
7. Lấy URL: `https://xxx.railway.app`

### Render

1. **New Web Service** → connect GitHub
2. **Root Directory**: `backend`
3. **Build**: `npm install`
4. **Start**: `npm start`
5. Thêm env variables tương tự Railway

---

## 5️⃣ Cập nhật `vercel.json` (nếu cần)

File hiện tại đã dùng `@vercel/static-build` với `distDir: "build"`. Vite output vào `build/assets/` (không phải `static/`). Có thể cập nhật route cache cho assets:

```json
{
  "version": 2,
  "name": "mia-warehouse",
  "builds": [
    {
      "src": "package.json",
      "use": "@vercel/static-build",
      "config": { "distDir": "build" }
    }
  ],
  "routes": [
    {
      "src": "/assets/(.*)",
      "headers": { "cache-control": "s-maxage=31536000, immutable" }
    },
    { "src": "/(.*)", "dest": "/index.html" }
  ]
}
```

---

## 6️⃣ Checklist trước khi deploy

- [ ] `.env` đã nằm trong `.gitignore`
- [ ] Tạo `.env.example` (không có secret)
- [ ] `VITE_API_URL` trên Vercel trỏ đúng backend URL
- [ ] Backend đã deploy và chạy ổn định
- [ ] CORS trên backend cho phép domain Vercel (`*.vercel.app`)

---

## 7️⃣ Cấu hình CORS (Backend)

Trong `backend/server.js`, thêm domain Vercel:

```js
const allowedOrigins = [
  "http://localhost:3000",
  "https://mia-warehouse-*.vercel.app",
  "https://your-custom-domain.com",
];
```

---

## 8️⃣ Tóm tắt luồng

```
Developer
    ↓ git push main
GitHub
    ├→ Vercel (webhook) → Build frontend → Deploy
    └→ Railway/Render (webhook) → Build backend → Deploy

User → https://xxx.vercel.app (Frontend)
         ↓ API calls
       https://xxx.railway.app (Backend)
```

---

## 📎 Tham khảo

- [Vercel Env Vars](https://vercel.com/docs/concepts/projects/environment-variables)
- [Vite Env](https://vitejs.dev/guide/env-and-mode.html)
- [Railway Docs](https://docs.railway.app/)
- [Render Docs](https://render.com/docs)
