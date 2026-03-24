# Kiến trúc Production – 3 service & cách deploy đúng

## Có đúng là 3 server (service) không?

**Đúng.** Ứng dụng có **3 service chính**:

| # | Service      | Công nghệ   | Port (nội bộ) | Vai trò |
|---|--------------|-------------|----------------|---------|
| 1 | **Frontend** | Vite/React  | 80 (trong Docker) | Giao diện người dùng |
| 2 | **Backend** | Node.js     | 3001          | API, auth, proxy sang AI Service |
| 3 | **AI Service** | Python   | 8000          | One TGA, ML, automation |

Trên **một máy** (Docker), có thêm **reverse proxy (Nginx)** – tổng 4 container, nhưng “3 server” là 3 service ứng dụng ở bảng trên.

---

## Luồng request production

```
User → [Reverse Proxy :80]
         ├── /         → Frontend (static)
         ├── /api/*   → Backend (3001) → có thể gọi AI Service (8000)
         └── /ai/*    → AI Service (8000) trực tiếp (nếu cấu hình)
```

Backend gọi AI Service qua `AI_SERVICE_URL` (trong Docker: `http://ai-service:8000`).

---

## Cách 1: Production **một máy** (Docker Compose) – đơn giản nhất

Chạy đủ 3 service + Nginx trên **một server** (VPS, cloud VM).

### Bước chuẩn bị

- Cài Docker + Docker Compose.
- Có file `backend/.env` (hoặc env) với ít nhất: `JWT_SECRET`, `AI_SERVICE_URL=http://ai-service:8000` (Compose đã set sẵn).
- (Tùy chọn) Copy `deploy/nginx/reverse-proxy.conf` nếu muốn sửa Nginx.

### Lệnh deploy

```bash
# Từ thư mục gốc dự án
./scripts/deploy/main.sh docker
```

Script sẽ:

1. Lint, test, build frontend + backend.
2. `docker compose -f docker-compose.production.yml down` + xóa container `mia-ai-service` cũ (tránh conflict).
3. `docker compose -f docker-compose.production.yml up -d --build`.

Sau khi chạy xong:

- **User truy cập:** `http://<IP-máy>:80` (hoặc domain trỏ về IP).
- **Health:** `http://<IP>:80/healthz` (Nginx), Backend/AI đã được Nginx proxy.

### Kiểm tra nhanh

```bash
curl -s http://localhost/healthz          # Nginx
curl -s http://localhost/api/health       # Backend (qua proxy)
# AI Service thường chỉ Backend gọi nội bộ, không cần expose ra ngoài
```

---

## Cách 2: Production **nhiều nền tảng** (Vercel + Render, v.v.)

Mỗi service chạy ở một nơi: Frontend (Vercel), Backend (Render), AI Service (Render hoặc server riêng).

### Chuẩn bị

```bash
cp deploy/.env.multiservice.example deploy/.env.multiservice
```

Sửa `deploy/.env.multiservice`:

- `PROD_BACKEND_PUBLIC_URL` = URL Backend (vd: `https://xxx.onrender.com`)
- `PROD_AI_PUBLIC_URL` = URL AI Service (vd: `https://yyy.onrender.com`)
- Các deploy hook (Render, v.v.) nếu dùng.

### Deploy

```bash
# Xem kế hoạch trước
npm run deploy:multi:plan

# Deploy thật
npm run deploy:multi
# hoặc
./deploy-production-all.sh
```

Script sẽ ghi `frontend/.env.production` để frontend gọi đúng Backend và (nếu cần) AI Service. Chi tiết: `deploy/PRODUCTION_MULTI_DEPLOY.md`.

---

## Tóm tắt: Làm sao production “đúng”

| Mục tiêu | Cách làm |
|----------|----------|
| **Một máy, đơn giản** | Dùng **Cách 1**: `./scripts/deploy/main.sh docker` |
| **Frontend Vercel, Backend/AI Render (hoặc server khác)** | Dùng **Cách 2**: cấu hình `deploy/.env.multiservice` rồi chạy `./deploy-production-all.sh` |

Cả hai cách đều đảm bảo **đủ 3 service** (Frontend, Backend, AI Service) và **production đúng** khi:

- Frontend chỉ gọi Backend (qua `VITE_API_URL` / `VITE_API_BASE_URL`).
- Backend gọi AI Service qua `AI_SERVICE_URL`.
- Env (JWT, API keys, v.v.) được set đúng cho môi trường production.
