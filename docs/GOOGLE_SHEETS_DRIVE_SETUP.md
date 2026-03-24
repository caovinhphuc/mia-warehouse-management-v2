# Cấu hình Google Sheets & Google Drive

Khi health check báo **Google Sheets / Google Drive initialization failed** với lỗi "Private key có vẻ là placeholder", nghĩa là backend chưa có **key thật** từ Google Cloud.

## Cách 1: Dùng file JSON (khuyến nghị)

### Bước 1: Tạo Service Account và tải key

1. Vào [Google Cloud Console](https://console.cloud.google.com/) → chọn project (hoặc tạo mới).
2. **APIs & Services** → **Enable APIs**: bật **Google Sheets API** và **Google Drive API**.
3. **IAM & Admin** → **Service accounts** → **Create service account** (tên tùy chọn) → **Create and continue** → (role có thể **Editor** hoặc custom) → **Done**.
4. Vào service account vừa tạo → tab **Keys** → **Add key** → **Create new key** → chọn **JSON** → **Create**. File JSON sẽ tải về.

### Bước 2: Đặt file key vào project

Chọn **một** trong các vị trí sau (theo thứ tự ưu tiên):

| Thứ tự | Vị trí | Ghi chú |
|--------|--------|--------|
| 1 | Biến env `GOOGLE_SERVICE_ACCOUNT_KEY_PATH` hoặc `GOOGLE_APPLICATION_CREDENTIALS` | Trỏ đường dẫn **tuyệt đối** tới file JSON (vd: `/Users/you/Downloads/project-xxx.json`). |
| 2 | `backend/config/service-account-key.json` | Copy file JSON tải từ GCP vào đây. **Không commit** file này (đã có trong .gitignore). |
| 3 | `automation/config/google-credentials.json` | Copy nội dung file JSON vào đây (ghi đè file cũ nếu đang là placeholder). |

**Lưu ý:** File JSON phải có trường `private_key` là **PEM đầy đủ** (nhiều dòng, bắt đầu `-----BEGIN PRIVATE KEY-----`), không phải chuỗi ngắn kiểu "Your private key here".

### Bước 3: Share Sheet / Drive với service account

- **Google Sheet:** Mở sheet → **Share** → thêm **email** trong JSON (trường `client_email`, dạng `xxx@yyy.iam.gserviceaccount.com`) với quyền **Editor**.
- **Google Drive folder:** Tương tự, share folder với `client_email` (Editor) nếu dùng Drive API.

### Bước 4: Restart backend

```bash
# Chạy local
npm run start:backend

# Hoặc Docker: cần mount file key vào container (xem docker-compose)
```

---

## Cách 2: Dùng biến môi trường (không dùng file JSON)

Trong `backend/.env` hoặc `.env` root, đặt:

```env
GOOGLE_SERVICE_ACCOUNT_EMAIL=your-sa@project.iam.gserviceaccount.com
GOOGLE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nMIIE...\n-----END PRIVATE KEY-----\n"
GOOGLE_PROJECT_ID=your-gcp-project-id
```

- `GOOGLE_PRIVATE_KEY`: lấy từ file JSON (trường `private_key`), giữ nguyên `\n` trong chuỗi hoặc paste nhiều dòng trong dấu ngoặc.
- Không dùng key placeholder; phải là key thật tải từ GCP.

Sau đó restart backend. Sheets và Drive service sẽ dùng env thay vì file.

---

## Docker production

Backend chạy trong container không thấy file trên máy host. Cần **một trong hai**:

1. **Mount file key:** Trong `docker-compose.production.yml`, thêm volume cho backend service:
   ```yaml
   volumes:
     - /path/on/host/service-account-key.json:/app/config/service-account-key.json:ro
   ```
   Và set `GOOGLE_APPLICATION_CREDENTIALS=/app/config/service-account-key.json` trong `environment` của backend.

2. **Dùng env:** Set `GOOGLE_SERVICE_ACCOUNT_EMAIL`, `GOOGLE_PRIVATE_KEY`, `GOOGLE_PROJECT_ID` trong `environment` hoặc `env_file` của backend (bí mật nên dùng env file không commit).

---

## Kiểm tra

Sau khi cấu hình và restart backend:

```bash
curl -s http://localhost:3001/health | jq .services.googleSheets
curl -s http://localhost:3001/health | jq .services.googleDrive
```

Trạng thái `healthy` là đã kết nối được.
