# 🔧 Backend Setup Guide - MIA Warehouse Management V2

## 📋 Tổng Quan

Backend chạy trên **Express.js** với **Socket.io + WebSocket** để realtime updates.

## 🎯 Yêu Cầu

- **Node.js**: >= 16.0.0
- **npm**: >= 8.0.0
- **Google Service Account**: Credentials JSON file

## ⚙️ Cấu Hình Backend

### 1. Google Service Account Setup

#### Bước 1: Tạo Service Account

1. Truy cập [Google Cloud Console](https://console.cloud.google.com/)
2. Chọn project hoặc tạo mới
3. Vào **IAM & Admin** → **Service Accounts**
4. Click **CREATE SERVICE ACCOUNT**
5. Nhập tên: `mia-warehouse-service`
6. Click **CREATE AND CONTINUE**

#### Bước 2: Cấp Quyền

Enable các APIs sau:

- ✅ Google Sheets API
- ✅ Google Drive API
- ✅ Google Apps Script API

Cấp roles:

- ✅ Editor (hoặc custom roles với quyền cần thiết)

#### Bước 3: Tạo JSON Key

1. Click vào Service Account vừa tạo
2. Tab **KEYS** → **ADD KEY** → **Create new key**
3. Chọn **JSON** → **CREATE**
4. File JSON sẽ được download

#### Bước 4: Đặt File JSON

**Option 1: Đặt vào automation/config/ (Recommended)**

```bash
# Tạo folder nếu chưa có
mkdir -p automation/config

# Copy file vừa download
cp ~/Downloads/your-service-account-key.json automation/config/google-credentials.json

# Set permissions
chmod 600 automation/config/google-credentials.json
```

**Option 2: Dùng Environment Variables**

```bash
# Thêm vào .env (root project)
GOOGLE_SERVICE_ACCOUNT_KEY_PATH=/path/to/your/service-account.json
```

### 2. Chia Sẻ Google Sheets

**Quan trọng:** Phải share Google Sheets với Service Account email!

1. Mở Google Sheets của bạn
2. Click **Share** button
3. Paste email từ JSON file (field `client_email`):
   ```
   mia-warehouse-service@project-id.iam.gserviceaccount.com
   ```
4. Chọn quyền: **Editor**
5. Uncheck "Notify people" (vì đây là service account)
6. Click **Share**

### 3. Environment Variables

Cập nhật file `.env` ở root project:

```dotenv
# Backend Port
BACKEND_PORT=3001

# Google Service Account
GOOGLE_SERVICE_ACCOUNT_KEY_PATH=./automation/config/google-credentials.json
GOOGLE_PROJECT_ID=your-project-id
GOOGLE_SERVICE_ACCOUNT_EMAIL=mia-warehouse-service@project-id.iam.gserviceaccount.com

# Google Sheets
GOOGLE_SHEET_ID=your_spreadsheet_id_here
VITE_GOOGLE_SHEETS_SPREADSHEET_ID=your_spreadsheet_id_here

# Security
JWT_SECRET=your_jwt_secret_minimum_32_characters
SESSION_SECRET=your_session_secret_minimum_32_characters

# CORS
FRONTEND_URL=http://localhost:3000
CORS_ORIGIN=http://localhost:3000
```

### 4. Cài Đặt Dependencies

```bash
# Từ thư mục backend/
cd backend
npm install

# Hoặc từ root project
npm run install:backend
```

### 5. Kiểm Tra Cấu Hình

```bash
# Test Google Authentication
cd backend
node test-google-auth.js

# Check environment variables
node check_env.js
```

## 🚀 Khởi Động Backend

### Development Mode

**Option 1: Từ root project**

```bash
npm run start:backend
# hoặc
npm run dev  # Start cả frontend + backend
```

**Option 2: Từ thư mục backend**

```bash
cd backend
npm start
# hoặc
node server.js
```

### Kiểm Tra Backend Running

```bash
# Check health endpoint
curl http://localhost:3001/health

# Expected response:
{
  "status": "healthy",
  "timestamp": "2026-01-19T...",
  "services": {
    "googleSheets": { "status": "healthy" },
    "googleDrive": { "status": "healthy" }
  }
}
```

## 🔍 API Endpoints

### Authentication

- `POST /api/auth/login` - Login
- `POST /api/auth/register` - Register
- `POST /api/auth/logout` - Logout
- `GET /api/auth/verify-token` - Verify JWT token

### Google Sheets

- `GET /api/sheets/all` - Get all sheets
- `GET /api/sheets/:sheetId/data` - Get sheet data
- `POST /api/sheets/:sheetId/data` - Add row
- `PUT /api/sheets/:sheetId/data/:rowIndex` - Update row

### Google Drive

- `GET /api/drive/files` - List files
- `POST /api/drive/upload` - Upload file
- `POST /api/drive/folder` - Create folder
- `DELETE /api/drive/files/:fileId` - Delete file

### WebSocket Events

- `connection` - Client connected
- `dashboard:update` - Real-time dashboard updates
- `notification` - System notifications
- `disconnect` - Client disconnected

## 🐛 Troubleshooting

### Lỗi "No key or keyFile set"

**Nguyên nhân:** Backend không tìm thấy Google Service Account credentials

**Giải pháp:**

```bash
# 1. Check file tồn tại
ls -la automation/config/google-credentials.json

# 2. Check .env có đúng path không
grep GOOGLE_SERVICE_ACCOUNT_KEY_PATH .env

# 3. Restart backend
pkill -f "node.*server.js"
npm run start:backend
```

### Lỗi "Permission denied" khi access Sheets

**Nguyên nhân:** Chưa share Sheets với Service Account

**Giải pháp:**

1. Mở Google Sheets
2. Share với email: `client_email` từ JSON file
3. Quyền: **Editor**

### Port 3001 đã sử dụng

```bash
# Kill process trên port 3001
lsof -ti:3001 | xargs kill -9

# Hoặc dùng
pkill -f "node.*server.js"
```

## 📝 Backend Structure

```
backend/
├── server.js              # Main entry point
├── package.json           # Backend dependencies
├── routes/
│   ├── authRoutes.js      # Authentication
│   ├── sheetsRoutes.js    # Google Sheets
│   └── driveRoutes.js     # Google Drive
├── services/
│   ├── googleSheetsService.js
│   ├── googleDriveService.js
│   ├── authService.js
│   ├── socketService.js   # Socket.io
│   └── wsService.js       # Native WebSocket
├── middleware/
│   └── auth.js            # JWT authentication
└── tests/
    ├── test-google-auth.js
    └── test-websocket.js
```

## 🔐 Security Best Practices

1. **NEVER commit** `google-credentials.json` to Git
2. Add to `.gitignore`:
   ```
   automation/config/google-credentials.json
   *.json
   !package*.json
   ```
3. Use environment variables for secrets
4. Rotate JWT secrets regularly
5. Enable CORS only for trusted origins

## 📚 Tài Liệu Tham Khảo

- [Google Sheets API Docs](https://developers.google.com/sheets/api)
- [Google Drive API Docs](https://developers.google.com/drive/api)
- [Service Account Auth](https://cloud.google.com/iam/docs/service-accounts)
- [Socket.io Documentation](https://socket.io/docs/)
