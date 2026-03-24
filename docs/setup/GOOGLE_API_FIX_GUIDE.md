# HƯỚNG DẪN KHẮC PHỤC LỖI GOOGLE API

Cập nhật: 2026-02-06 | Project: mia-warehouse-management-v2

---

## 🔥 CÁC LỖI THƯỜNG GẶP

### 1. Google Sheets / Drive API – ERR_OSSL_UNSUPPORTED

```
error:1E08010C:DECODER routines::unsupported
Code: ERR_OSSL_UNSUPPORTED
```

**Nguyên nhân:** Private key trong service account JSON dùng định dạng RSA cũ (`BEGIN RSA PRIVATE KEY`). Node.js 17+ với OpenSSL 3 yêu cầu PKCS#8 (`BEGIN PRIVATE KEY`).

**Đã xử lý trong code:** Backend tự convert RSA → PKCS#8 khi load credentials (file `backend/utils/googleAuthUtils.js`). Nếu vẫn lỗi, tạo lại key mới theo bước dưới.

### 2. SendGrid – 401 Unauthorized

API key sai hoặc chưa verify sender.

### 3. Telegram Bot – 404

Token sai hoặc bot chưa được start.

---

## ✅ GIẢI PHÁP GOOGLE API (ĐÃ TRIỂN KHAI)

### Code đã thêm

- **`backend/utils/googleAuthUtils.js`**: Chuẩn hóa private key (RSA → PKCS#8).
- **`backend/services/googleSheetsService.js`**: Gọi `normalizeCredentials()` khi load JSON hoặc env.
- **`backend/services/googleDriveService.js`**: Tương tự.

Path ưu tiên cho key file:

1. `GOOGLE_SERVICE_ACCOUNT_KEY_PATH` (env)
2. `GOOGLE_APPLICATION_CREDENTIALS` (env)
3. `backend/service-account-key.json` (mặc định)

### Cấu hình .env (project root)

Tạo/sửa `.env` ở **thư mục gốc project** (cùng cấp với `backend/`):

```env
# Google – chọn 1 trong 2 cách

# Cách 1: Đường dẫn file JSON (khuyến nghị)
GOOGLE_SERVICE_ACCOUNT_KEY_PATH=./backend/service-account-key.json
# Hoặc đường dẫn tuyệt đối:
# GOOGLE_SERVICE_ACCOUNT_KEY_PATH=/path/to/mia-warehouse-management-v2/backend/service-account-key.json

# Cách 2: Cùng biến với Google SDK
GOOGLE_APPLICATION_CREDENTIALS=./backend/service-account-key.json

# Spreadsheet ID (dùng cho Sheets)
GOOGLE_SHEET_ID=18B1PIhCDmBWyHZytvOcfj_1QbYBwczLf1x1Qbu0E5As
VITE_GOOGLE_SHEETS_SPREADSHEET_ID=18B1PIhCDmBWyHZytvOcfj_1QbYBwczLf1x1Qbu0E5As

# Drive folder (tùy chọn)
GOOGLE_DRIVE_FOLDER_ID=
```

### Đặt file key trong project

```bash
# Copy file JSON từ Google Cloud vào backend
cp ~/Downloads/mia-logistics-469406-*.json backend/service-account-key.json

# Kiểm tra (không commit file này)
ls -la backend/service-account-key.json
```

**Lưu ý:** Thêm `backend/service-account-key.json` vào `.gitignore` nếu chưa có.

### Nếu vẫn lỗi OpenSSL – tạo key mới

1. Vào [Google Cloud Console → Service Accounts](https://console.cloud.google.com/iam-admin/serviceaccounts).
2. Chọn project (vd: **mia-logistics-469406**).
3. Chọn service account → tab **KEYS** → **ADD KEY** → **Create new key** → **JSON**.
4. Tải file và đặt thành `backend/service-account-key.json`.
5. Key mới từ Google đã là PKCS#8 (`BEGIN PRIVATE KEY`).

Kiểm tra format:

```bash
grep "BEGIN" backend/service-account-key.json
# Mong đợi: "-----BEGIN PRIVATE KEY-----" (không có RSA)
```

---

## 📁 GOOGLE DRIVE (list/upload không hoạt động)

Drive dùng **cùng service account** với Sheets. Nếu Sheets OK mà Drive lỗi:

### 1. Bật Google Drive API

1. [Google Cloud Console → APIs & Services → Library](https://console.cloud.google.com/apis/library)
2. Tìm **Google Drive API** → Enable

### 2. Cấu hình Folder ID (bắt buộc cho upload)

Service account không có dung lượng Drive riêng. Cần folder được share:

1. Tạo folder trên [Google Drive](https://drive.google.com) (hoặc dùng folder có sẵn)
2. **Share** folder với **service account email** (xem trong `backend/config/service-account-key.json` → `client_email`)
3. Quyền: **Editor**
4. Copy **Folder ID** từ URL: `https://drive.google.com/drive/folders/FOLDER_ID`
5. Thêm vào `.env`:
   ```
   GOOGLE_DRIVE_FOLDER_ID=1abc123xyz...
   ```

### 3. Restart backend

```bash
./scripts/stop/all.sh
./scripts/start/all.sh --no-docker
```

---

## 🔐 SENDGRID (401)

1. [SendGrid API Keys](https://app.sendgrid.com/settings/api_keys) → Create API Key.
2. Verify sender: [Sender Auth](https://app.sendgrid.com/settings/sender_auth).
3. Trong `.env`:

```env
SENDGRID_API_KEY=SG.xxxx...
SENDGRID_FROM_EMAIL=kho.1@mia.vn
SENDGRID_FROM_NAME=MIA Logistics Manager
```

---

## 📱 TELEGRAM (404)

Lỗi 404 = token sai/placeholder (không phải token thật từ BotFather).

### Bước cấu hình

1. Mở Telegram → tìm **@BotFather**.
2. Gửi `/newbot` (tạo bot mới) hoặc `/mybots` (xem bot có sẵn) → chọn bot → **API Token**.
3. Mở chat với bot của bạn → gửi `/start`.
4. Lấy Chat ID:
   ```bash
   curl "https://api.telegram.org/bot<TOKEN>/getUpdates"
   ```
   Trong JSON trả về: tìm `result[].message.chat.id`.
5. Sửa `.env` (thay placeholder bằng giá trị thật):

```env
TELEGRAM_BOT_TOKEN=1234567890:ABCdef...
TELEGRAM_CHAT_ID=123456789
```

### Test nhanh

```bash
node scripts/testTelegramConnection.js
# Nếu lỗi placeholder:
node scripts/testTelegramConnection.js --help
```

---

## 🧪 KIỂM TRA SAU KHI CẤU HÌNH

### Backend (Google Sheets/Drive)

```bash
cd backend
node -e "
const svc = require('./services/googleSheetsService');
svc.initialize()
  .then(() => console.log('✅ Google Sheets OK'))
  .catch(e => console.error('❌', e.message));
"
```

### Health check toàn bộ

```bash
# Từ project root (ports + integrations: Sheets, Drive, Telegram, Email)
./scripts/check/health.sh

# Cần jq để xem chi tiết integrations: brew install jq
```

Backend `/health` trả về trạng thái từng integration (khi backend đang chạy):

```bash
curl -s http://localhost:3001/health | jq '.services'
# → googleSheets, googleDrive, telegram, email, googleAppsScript...
```

### Restart services

```bash
./scripts/stop/all.sh
./scripts/start/all.sh
```

---

## 📁 CẤU TRÚC PROJECT (THAM KHẢO)

```
mia-warehouse-management-v2/
├── .env                          # Biến môi trường (GOOGLE_*, SENDGRID_*, TELEGRAM_*)
├── backend/
│   ├── service-account-key.json  # Key Google (không commit)
│   ├── services/
│   │   ├── googleSheetsService.js
│   │   └── googleDriveService.js
│   └── utils/
│       └── googleAuthUtils.js    # Convert RSA → PKCS#8
├── scripts/
│   ├── start/all.sh
│   ├── check/health.sh          # Health v1.1: ports + integrations
│   └── testTelegramConnection.js # Test Telegram: node scripts/testTelegramConnection.js
└── GOOGLE_API_FIX_GUIDE.md       # File này
```

---

## ✅ CHECKLIST

- [ ] Đặt file JSON key vào `backend/service-account-key.json` (hoặc path trong env).
- [ ] Cấu hình `GOOGLE_SERVICE_ACCOUNT_KEY_PATH` hoặc `GOOGLE_APPLICATION_CREDENTIALS` trong `.env`.
- [ ] Nếu lỗi OpenSSL: tạo key mới từ Google Cloud (JSON) và thay file.
- [ ] SendGrid: API key + verify sender + cập nhật `.env`.
- [ ] Telegram: token + chat ID + cập nhật `.env`; test: `node scripts/testTelegramConnection.js`.
- [ ] Chạy `./scripts/check/health.sh` và kiểm tra UI sidebar "Trạng thái kết nối".

---

**Cập nhật lần cuối:** 2026-02-06  
**Trạng thái:** Google (Sheets, Drive) + Telegram đã kết nối. Health check v1.1 bổ sung integrations.
