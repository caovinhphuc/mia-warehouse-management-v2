# Làm gì tiếp sau khi deploy

## 1. Đợi deploy xong

- Nếu đang chạy `./deploy.sh`: đợi đến khi thấy **"✅ AI Service đã được deploy thành công"** hoặc **"✨ Hoàn tất deploy!"**.
- Nếu chạy `deploy-to-server.sh`: đợi build frontend + backend xong, script báo hoàn tất.

---

## 2. Kiểm tra service (local)

```bash
# AI Service (8000)
curl -s http://localhost:8000/health | jq .

# Backend (3001) — nếu đã start
curl -s http://localhost:3001/api/health 2>/dev/null || echo "Backend chưa chạy"
```

---

## 3. Chạy đủ 2 process (để Frontend dùng được AI / One TGA)

| Process      | Lệnh / Cách chạy              | Port |
|-------------|---------------------------------|------|
| **AI Service** | `cd ai-service && ./start_background.sh` hoặc `./deploy.sh` | 8000 |
| **Backend**     | Từ root: `npm run start:backend` hoặc `node backend/server.js` | 3001 |

Trong `.env` (root hoặc backend): `AI_SERVICE_URL=http://localhost:8000`.

---

## 4. Test nhanh

- **Frontend**: mở app (Vite dev hoặc build), đăng nhập One TGA (nếu có), mở AI Dashboard.
- **One TGA**: Backend gọi `POST http://localhost:8000/api/auth/verify-one-tga`.
- **AI APIs**: Backend proxy `/api/ai/predict`, `/api/ai/anomalies`, `/api/ai/optimize` sang AI Service.

---

## 5. Deploy lên server (nếu cần)

- Đọc `DEPLOY_SERVER.md`.
- Dùng `./deploy-to-server.sh` (hoặc scp/rsync + chạy `install_and_start.sh` trên server).

---

## 6. Log & debug

```bash
tail -f ai-service/logs/ai-service.log
tail -f ai-service/logs/ai-service-error.log
```
