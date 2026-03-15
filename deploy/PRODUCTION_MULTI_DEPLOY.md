# Production Multi-Service Deploy

Muc tieu: deploy tung service o tung nen tang khac nhau nhung van dong bo chung API contract.

## 1) Chuan bi config

Copy file mau:

```bash
cp deploy/.env.multiservice.example deploy/.env.multiservice
```

Sua file `deploy/.env.multiservice`:

- `PROD_BACKEND_PUBLIC_URL`
- `PROD_AI_PUBLIC_URL`
- `BACKEND_DEPLOY_HOOK_URL`
- `AI_SERVICE_DEPLOY_HOOK_URL`
- `AUTOMATION_DEPLOY_HOOK_URL`

## 2) Xem ke hoach truoc khi deploy

```bash
npm run deploy:multi:plan
```

## 3) Deploy that

```bash
npm run deploy:multi
```

Hoac:

```bash
./deploy-production-all.sh
```

## 4) Kien truc deploy

- Frontend -> Vercel
- Backend -> Render (deploy hook)
- AI Service -> Render (deploy hook)
- Automation -> Render (deploy hook)

Script se tu dong ghi `frontend/.env.production` de dam bao frontend goi dung API:

- `VITE_API_URL={PROD_BACKEND_PUBLIC_URL}/api`
- `VITE_API_BASE_URL={PROD_BACKEND_PUBLIC_URL}/api`
- `VITE_AI_SERVICE_URL={PROD_AI_PUBLIC_URL}`

## 5) Verify sau deploy

- Backend: `{PROD_BACKEND_PUBLIC_URL}/api/health`
- AI service: `{PROD_AI_PUBLIC_URL}/health`
- Frontend: URL Vercel tra ve sau khi deploy
