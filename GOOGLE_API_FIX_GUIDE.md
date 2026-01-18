# HƯỚNG DẪN KHẮC PHỤC LỖI GOOGLE API

Generated: 2026-01-19

## 🔥 CÁC LỖI HIỆN TẠI

### 1. ❌ Google Sheets API Error

```
error:1E08010C:DECODER routines::unsupported
Code: ERR_OSSL_UNSUPPORTED
```

### 2. ❌ Google Drive API Error

```
error:1E08010C:DECODER routines::unsupported
Code: ERR_OSSL_UNSUPPORTED
```

### 3. ❌ SendGrid API Error

```
Request failed with status code 401
```

### 4. ❌ Telegram Bot Error

```
Request failed with status code 404
```

---

## 📊 PHÂN TÍCH LỖI GOOGLE API

### Nguyên nhân

Lỗi `error:1E08010C:DECODER routines::unsupported` xảy ra do:

1. **Private key format cũ**: Service account JSON sử dụng định dạng RSA cũ (`BEGIN RSA PRIVATE KEY`)
2. **Node.js >= 17**: Yêu cầu PKCS#8 format (`BEGIN PRIVATE KEY`)
3. **OpenSSL incompatible**: Không thể decode định dạng RSA cũ

### Kiểm tra Private Key hiện tại

File: `/Users/phuccao/Projects/mia-warehouse-management-v2/mia-logistics-manager/backend/mia-logistics-469406-eec521c603c0.json`

```bash
# Kiểm tra xem file có tồn tại không
ls -la /Users/phuccao/Projects/mia-warehouse-management-v2/mia-logistics-manager/backend/*.json

# Kiểm tra định dạng private key
grep "BEGIN" /Users/phuccao/Projects/mia-warehouse-management-v2/mia-logistics-manager/backend/mia-logistics-469406-eec521c603c0.json
```

Nếu kết quả là `BEGIN RSA PRIVATE KEY` → Cần tạo lại key

---

## ✅ GIẢI PHÁP: TẠO LẠI SERVICE ACCOUNT KEY

### Bước 1: Vào Google Cloud Console

https://console.cloud.google.com/iam-admin/serviceaccounts

Hoặc:

1. Mở https://console.cloud.google.com/
2. Chọn project: **mia-logistics-469406**
3. Menu → IAM & Admin → Service Accounts

### Bước 2: Chọn Service Account

Tìm và click vào:

```
mia-logistics-service@mia-logistics-469406.iam.gserviceaccount.com
```

### Bước 3: Tạo Key mới

1. Click tab **"KEYS"**
2. Click **"ADD KEY"** → **"Create new key"**
3. Chọn format: **JSON**
4. Click **"CREATE"**
5. File JSON sẽ được download tự động

### Bước 4: Xóa Key cũ (Optional nhưng recommended)

1. Trong tab KEYS, tìm key cũ
2. Click menu (⋮) → Delete
3. Confirm deletion

### Bước 5: Lưu file mới

```bash
# Copy file từ Downloads
mv ~/Downloads/mia-logistics-469406-*.json \
  /Users/phuccao/Projects/mia-warehouse-management-v2/mia-logistics-manager/backend/service-account-key.json

# Hoặc giữ tên gốc
mv ~/Downloads/mia-logistics-469406-*.json \
  /Users/phuccao/Projects/mia-warehouse-management-v2/mia-logistics-manager/backend/

# Kiểm tra file
cat /Users/phuccao/Projects/mia-warehouse-management-v2/mia-logistics-manager/backend/service-account-key.json | grep "BEGIN PRIVATE KEY"
```

**Kết quả mong đợi**: Phải thấy `-----BEGIN PRIVATE KEY-----` (không có RSA)

### Bước 6: Cập nhật .env

```bash
# Edit .env file
nano /Users/phuccao/Projects/mia-warehouse-management-v2/.env
```

Cập nhật hoặc thêm:

```env
GOOGLE_SERVICE_ACCOUNT_KEY_PATH=/Users/phuccao/Projects/mia-warehouse-management-v2/mia-logistics-manager/backend/service-account-key.json
GOOGLE_APPLICATION_CREDENTIALS=/Users/phuccao/Projects/mia-warehouse-management-v2/mia-logistics-manager/backend/service-account-key.json
```

### Bước 7: Test lại

```bash
cd /Users/phuccao/Projects/mia-warehouse-management-v2
node mia-logistics-manager/scripts/health-check.js
```

---

## 🔐 SỬA LỖI SENDGRID (401 UNAUTHORIZED)

### Bước 1: Vào SendGrid Dashboard

https://app.sendgrid.com/settings/api_keys

### Bước 2: Tạo API Key mới

1. Click **"Create API Key"**
2. Name: `MIA Logistics Manager`
3. Permissions: **Full Access** (hoặc tối thiểu Mail Send)
4. Click **"Create & View"**

### Bước 3: Copy API Key

⚠️ **QUAN TRỌNG**: API Key chỉ hiển thị 1 lần duy nhất!

Copy ngay key có dạng: `SG.xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx`

### Bước 4: Update .env

```env
SENDGRID_API_KEY=SG.xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
SENDGRID_FROM_EMAIL=kho.1@mia.vn
SENDGRID_FROM_NAME=MIA Logistics Manager
```

### Bước 5: Verify Sender Identity

Nếu chưa verify email sender:

1. Vào https://app.sendgrid.com/settings/sender_auth
2. Verify Single Sender → Add kho.1@mia.vn
3. Check email inbox và click link verify

### Bước 6: Test

```bash
# Test email service
curl -X POST http://localhost:3001/api/test-email
```

---

## 📱 SỬA LỖI TELEGRAM BOT (404 NOT FOUND)

### Bước 1: Kiểm tra Bot Token hiện tại

```bash
# Lấy token từ .env
grep TELEGRAM_BOT_TOKEN /Users/phuccao/Projects/mia-warehouse-management-v2/.env

# Test token
curl "https://api.telegram.org/bot<YOUR_TOKEN>/getMe"
```

Nếu lỗi 404 → Token không hợp lệ

### Bước 2: Tạo hoặc lấy Bot Token mới

1. Mở Telegram app
2. Tìm: **@BotFather**
3. Start chat với BotFather

**Nếu đã có bot:**

```
/mybots
→ Chọn bot của bạn
→ API Token
→ Copy token
```

**Nếu tạo bot mới:**

```
/newbot
→ Nhập tên bot: MIA Logistics Manager
→ Nhập username: mia_logistics_bot
→ Copy token nhận được
```

### Bước 3: Start Bot

1. Mở chat với bot của bạn (tìm @mia_logistics_bot)
2. Gửi: `/start`
3. Bot phải reply (nếu không reply → check code)

### Bước 4: Get Chat ID

```bash
# Replace với token thực
curl "https://api.telegram.org/bot<YOUR_TOKEN>/getUpdates"
```

Tìm trong response:

```json
{
  "message": {
    "chat": {
      "id": 123456789 // ← Đây là CHAT_ID
    }
  }
}
```

### Bước 5: Update .env

```env
TELEGRAM_BOT_TOKEN=1234567890:ABCdefGHIjklMNOpqrsTUVwxyz
TELEGRAM_CHAT_ID=123456789
```

### Bước 6: Test

```bash
# Test telegram service
curl -X POST http://localhost:3001/api/test-telegram \
  -H "Content-Type: application/json" \
  -d '{"message": "Test from MIA Logistics"}'
```

---

## ⚙️ CẤU HÌNH MÔI TRƯỜNG ĐẦY ĐỦ

File: `/Users/phuccao/Projects/mia-warehouse-management-v2/.env`

```env
# Google Cloud
GOOGLE_SERVICE_ACCOUNT_KEY_PATH=/path/to/service-account-key.json
GOOGLE_APPLICATION_CREDENTIALS=/path/to/service-account-key.json
GOOGLE_SERVICE_ACCOUNT_EMAIL=mia-logistics-service@mia-logistics-469406.iam.gserviceaccount.com
GOOGLE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----"

# Google Sheets
REACT_APP_GOOGLE_SHEETS_SPREADSHEET_ID=18B1PIhCDmBWyHZytvOcfj_1QbYBwczLf1x1Qbu0E5As
VITE_GOOGLE_SHEETS_SPREADSHEET_ID=18B1PIhCDmBWyHZytvOcfj_1QbYBwczLf1x1Qbu0E5As

# SendGrid
SENDGRID_API_KEY=SG.xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
SENDGRID_FROM_EMAIL=kho.1@mia.vn
SENDGRID_FROM_NAME=MIA Logistics Manager

# Telegram
TELEGRAM_BOT_TOKEN=1234567890:ABCdefGHIjklMNOpqrsTUVwxyz
TELEGRAM_CHAT_ID=123456789

# SMTP (Backup cho email)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password

# Other
REDIS_URL=redis://localhost:6379
```

---

## 🧪 KIỂM TRA SAU KHI FIX

### 1. Health Check

```bash
cd /Users/phuccao/Projects/mia-warehouse-management-v2
node mia-logistics-manager/scripts/health-check.js
```

### 2. Test từng service riêng lẻ

```bash
# Test Google Sheets
node -e "
const { google } = require('googleapis');
const auth = new google.auth.GoogleAuth({
  keyFile: '/path/to/service-account-key.json',
  scopes: ['https://www.googleapis.com/auth/spreadsheets']
});
auth.getClient().then(() => console.log('✅ Google Sheets OK')).catch(e => console.error('❌', e.message));
"

# Test SendGrid
curl -X POST https://api.sendgrid.com/v3/mail/send \
  -H "Authorization: Bearer $SENDGRID_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "personalizations": [{"to": [{"email": "test@example.com"}]}],
    "from": {"email": "kho.1@mia.vn"},
    "subject": "Test",
    "content": [{"type": "text/plain", "value": "Test"}]
  }'

# Test Telegram
curl "https://api.telegram.org/bot$TELEGRAM_BOT_TOKEN/sendMessage?chat_id=$TELEGRAM_CHAT_ID&text=Test"
```

### 3. Restart services

```bash
# Backend
cd mia-logistics-manager/backend
npm run dev

# Frontend
cd /Users/phuccao/Projects/mia-warehouse-management-v2
npm start
```

---

## 📚 TÀI LIỆU THAM KHẢO

- **Google Cloud Console**: https://console.cloud.google.com/
- **Google Sheets API**: https://developers.google.com/sheets/api
- **SendGrid Dashboard**: https://app.sendgrid.com/
- **Telegram Bot API**: https://core.telegram.org/bots/api
- **Node.js OpenSSL**: https://nodejs.org/api/crypto.html

---

## 🆘 TROUBLESHOOTING

### Vẫn lỗi OpenSSL sau khi tạo key mới?

1. Kiểm tra Node.js version:

   ```bash
   node --version  # Phải >= 16
   ```

2. Kiểm tra format key:

   ```bash
   cat service-account-key.json | jq -r .private_key | head -1
   # Phải là: -----BEGIN PRIVATE KEY-----
   ```

3. Clear cache:
   ```bash
   rm -rf node_modules package-lock.json
   npm install
   ```

### SendGrid vẫn 401?

1. Check API key có khoảng trắng hoặc ký tự lạ
2. Verify sender identity
3. Check billing (có thể bị suspend)

### Telegram vẫn 404?

1. Check bot có bị delete không
2. Test với curl trước
3. Đảm bảo đã /start bot

---

## ✅ CHECKLIST HOÀN THÀNH

- [ ] Tạo service account key mới từ Google Cloud Console
- [ ] Lưu file vào đúng vị trí backend folder
- [ ] Cập nhật GOOGLE_SERVICE_ACCOUNT_KEY_PATH trong .env
- [ ] Tạo SendGrid API key mới
- [ ] Verify sender email trong SendGrid
- [ ] Cập nhật SENDGRID_API_KEY trong .env
- [ ] Lấy Telegram bot token từ BotFather
- [ ] Start bot và get chat ID
- [ ] Cập nhật TELEGRAM_BOT_TOKEN và TELEGRAM_CHAT_ID trong .env
- [ ] Chạy health check - tất cả services pass
- [ ] Restart backend và frontend
- [ ] Test các chức năng chính

---

**Cập nhật lần cuối**: 2026-01-19  
**Status**: Đang chờ fix
