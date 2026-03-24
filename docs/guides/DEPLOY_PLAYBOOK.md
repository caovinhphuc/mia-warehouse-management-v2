# Deploy Playbook (MIA Warehouse Management v2)

Tai lieu nay dung de deploy nhanh va dung theo stack hien tai.

## 1) Kien truc deploy dung

- Public chi mo cong `80/443`.
- Cac service noi bo:
  - Frontend: `frontend:80`
  - Backend: `backend:3001`
  - AI Service: `ai-service:8000`
- Reverse proxy (Nginx) dinh tuyen:
  - `/` -> Frontend
  - `/api/*` -> Backend
  - `/ai/*` -> AI Service

Tham chieu:

- `docker-compose.production.yml`
- `deploy/nginx/reverse-proxy.conf`

## 2) Chuan bi truoc khi deploy

1. Da cai Docker Desktop (macOS) va Docker daemon dang chay.
2. Co file env backend: `backend/.env`.
3. Dang o root project: `mia-warehouse-management-v2`.

## 3) Lenh deploy nhanh

### Cach A: Dung compose production truc tiep

```bash
docker compose -f docker-compose.production.yml up -d --build
```

### Cach B: Dung script cua project

```bash
./deploy.sh docker
```

Script se uu tien `docker-compose.production.yml`, neu khong co moi fallback sang `docker-compose.yml`.

## 4) Kiem tra sau deploy

```bash
docker compose -f docker-compose.production.yml ps
```

```bash
docker compose -f docker-compose.production.yml logs -f
```

Check nhanh:

```bash
curl -I http://localhost/
curl -I http://localhost/healthz
curl -I http://localhost/api/health
curl -I http://localhost/ai/health
```

## 5) Lenh van hanh hay dung

Stop:

```bash
docker compose -f docker-compose.production.yml down
```

Restart service:

```bash
docker compose -f docker-compose.production.yml restart backend
```

Rebuild 1 service:

```bash
docker compose -f docker-compose.production.yml up -d --build backend
```

## 6) Loi hay gap va cach xu ly

### Loi: Cannot connect to the Docker daemon

Dau hieu:

- `Cannot connect to the Docker daemon at unix:///.../docker.sock`

Cach xu ly:

1. Mo Docker Desktop.
2. Cho Docker startup xong (icon xanh).
3. Chay lai lenh deploy.

### Loi: Backend len nhung API khong thong

Kiem tra:

1. `backend/.env` da ton tai chua.
2. Log backend: `docker compose -f docker-compose.production.yml logs -f backend`.
3. Health backend: `http://localhost/api/health`.

Neu log co dong:

- `[FATAL] JWT_SECRET environment variable must be set in production`

Thi can dat bien moi truong `JWT_SECRET` truoc khi deploy, vi du:

```bash
export JWT_SECRET="$(node -e "console.log(require('crypto').randomBytes(64).toString('hex'))")"
docker compose -f docker-compose.production.yml up -d --build backend
```

### Loi: `bcrypt ... Exec format error`

Dau hieu:

- Log backend co dong: `Error loading shared library ... bcrypt_lib.node: Exec format error`.

Nguyen nhan:

- `node_modules` tu may local (macOS) bi copy vao image Linux, lam native binary sai kien truc.

Cach xu ly:

1. Dam bao co file `backend/.dockerignore` va co dong `node_modules`.
2. Rebuild backend khong cache:

```bash
docker compose -f docker-compose.production.yml build --no-cache backend
docker compose -f docker-compose.production.yml up -d backend
```

1. Kiem tra lai:

```bash
docker compose -f docker-compose.production.yml logs --tail=100 backend
docker compose -f docker-compose.production.yml ps
```

### Loi: AI service khong tra ve

Kiem tra:

1. Log ai-service: `docker compose -f docker-compose.production.yml logs -f ai-service`.
2. Health AI: `http://localhost/ai/health`.

## 7) Checklist truoc khi len production that

- [ ] Frontend build pass.
- [ ] Backend health pass.
- [ ] AI health pass.
- [ ] Route `/api/*` va `/ai/*` dung.
- [ ] Da gan domain + SSL (neu mo public).
- [ ] Da backup env/secrets.

## 8) Ghi chu quan trong

- Port `3000/3001/8000` la port noi bo service, khong phai port public cho end-user.
- End-user nen di qua reverse proxy va domain HTTPS.
