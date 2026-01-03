# 📊 DỰ ÁN GOOGLE SHEETS - Google Sheets Integration

## 📋 Tổng quan

Dự án Google Sheets cung cấp tích hợp chuyên sâu với Google Sheets API, bao gồm authentication, đọc/ghi dữ liệu, và quản lý spreadsheet.

## 🏗️ Cấu trúc dự án

```
google-sheets-project/
├── src/                    # Frontend React
├── server.js              # Backend Node.js (Port 3003)
├── package.json           # Dependencies
├── start.sh              # Script khởi động
└── env.config.js         # Cấu hình môi trường
```

## 🚀 Khởi động dự án

### Cách 1: Sử dụng script tự động

```bash
cd google-sheets-project
./start.sh
```

### Cách 2: Khởi động thủ công

```bash
# 1. Cài đặt dependencies
npm install --legacy-peer-deps

# 2. Khởi động Backend
node server.js

# 3. Khởi động Frontend
PORT=3002 npm start
```

## 🌐 Ports

- **Frontend**: http://localhost:3002
- **Backend API**: http://localhost:3003

## 🔧 Tính năng chính

- ✅ Google Sheets Authentication
- ✅ Đọc/Ghi dữ liệu từ Google Sheets
- ✅ Google Drive Integration
- ✅ Alert System
- ✅ Real-time Data Sync
- ✅ Material-UI Interface

## 📊 Dependencies chính

- React 18
- Material-UI v5
- Google APIs Client
- Axios
- Node.js Express

## 🔑 Cấu hình Google Sheets

1. Tạo Google Cloud Project
2. Enable Google Sheets API
3. Tạo Service Account
4. Download JSON key
5. Cập nhật `env.config.js`
