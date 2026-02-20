# 🚀 Hướng dẫn Setup Nhanh

## Checklist - Các bước cần thiết

### ✅ 1. Google Cloud Setup

- [ ] Tạo Google Cloud Project
- [ ] Enable Google Sheets API
- [ ] Enable Google Drive API
- [ ] Tạo Service Account
- [ ] Download Service Account JSON key
- [ ] Ghi chú Service Account email: `_______________________`

### ✅ 2. Google Sheets Setup

- [ ] Tạo Google Sheet mới
- [ ] Copy Sheet ID từ URL: `_______________________`
- [ ] Chia sẻ Sheet với Service Account email (quyền Editor)
- [ ] Tạo các sheet con: Orders, Reports, Logs

### ✅ 3. Google Drive Setup

- [ ] Tạo thư mục trên Google Drive
- [ ] Copy Folder ID từ URL: `_______________________`
- [ ] Chia sẻ thư mục với Service Account email (quyền Editor)

### ✅ 4. Email Setup (Gmail)

- [ ] Bật 2-Step Verification
- [ ] Tạo App Password
- [ ] Ghi chú App Password: `_______________________`

### ✅ 5. Telegram Setup (Optional)

- [ ] Tạo Telegram Bot qua @BotFather
- [ ] Ghi chú Bot Token: `_______________________`
- [ ] Gửi tin nhắn đầu tiên cho bot
- [ ] Lấy Chat ID từ getUpdates API: `_______________________`

### ✅ 6. Cài đặt Project

- [ ] Copy tất cả file code vào thư mục dự án
- [ ] Chạy: `npm install`
- [ ] Chạy: `npm install express nodemailer node-cron cors dotenv`
- [ ] Copy `.env.example` thành `.env`
- [ ] Cấu hình tất cả biến môi trường trong `.env`

### ✅ 7. Test & Run

- [ ] Chạy backend: `node server.js`
- [ ] Chạy frontend: `npm start`
- [ ] Test từng tab: Sheets, Drive, Alerts, Reports

## ⚡ Lệnh nhanh

```bash
# Cài đặt dependencies
npm install
npm install express nodemailer node-cron cors dotenv

# Tạo file môi trường
cp .env.example .env

# Chạy ứng dụng
# Terminal 1:
node server.js

# Terminal 2:
npm start
```

## 🔧 Template .env nhanh

```env
# Google (REQUIRED)
REACT_APP_GOOGLE_CLIENT_EMAIL=your-service-account@project.iam.gserviceaccount.com
REACT_APP_GOOGLE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----
YOUR_PRIVATE_KEY_HERE
-----END PRIVATE KEY-----"
REACT_APP_GOOGLE_PROJECT_ID=your-project-id
REACT_APP_GOOGLE_SHEET_ID=your-sheet-id
REACT_APP_GOOGLE_DRIVE_FOLDER_ID=your-folder-id

# Email (REQUIRED for alerts)
REACT_APP_EMAIL_SERVICE=gmail
REACT_APP_EMAIL_USER=your-email@gmail.com
REACT_APP_EMAIL_PASS=your-app-password
REACT_APP_ALERT_EMAIL_TO=recipient@example.com

# Telegram (OPTIONAL)
REACT_APP_TELEGRAM_BOT_TOKEN=your-bot-token
REACT_APP_TELEGRAM_CHAT_ID=your-chat-id

# Settings
REACT_APP_API_BASE_URL=http://localhost:3001/api
REACT_APP_ALERT_THRESHOLD_LOW=10
REACT_APP_ALERT_THRESHOLD_HIGH=100
```

## 🎯 Test Data mẫu

Paste vào Google Sheets để test báo cáo:

**Sheet "Orders":**

```
date,product,quantity,total,status,customer_id
2024-01-01,Laptop Dell,1,15000000,completed,CUST001
2024-01-02,Mouse Logitech,2,500000,completed,CUST002
2024-01-03,Keyboard Mechanical,1,2000000,pending,CUST003
2024-01-04,Monitor 4K,1,8000000,completed,CUST001
2024-01-05,Webcam HD,3,1500000,completed,CUST004
```

## 🔍 Troubleshooting nhanh

| Lỗi                       | Giải pháp                                     |
| ------------------------- | --------------------------------------------- |
| `No key or keyFile set`   | Kiểm tra GOOGLE_PRIVATE_KEY, thay `           |
| `thành`\n`                |
| `Invalid login` email     | Dùng App Password, không dùng password thường |
| `Insufficient Permission` | Chia sẻ Sheet/Drive với Service Account       |
| `Chat not found` Telegram | Gửi tin nhắn cho bot trước khi lấy Chat ID    |
| `CORS error`              | Đảm bảo backend chạy trên port 3001           |

## 📱 URLs quan trọng

- **Google Cloud Console**: https://console.cloud.google.com/
- **Google Sheets**: https://sheets.google.com/
- **Google Drive**: https://drive.google.com/
- **Gmail App Passwords**: https://myaccount.google.com/apppasswords
- **Telegram Bot API**: https://api.telegram.org/bot{TOKEN}/getUpdates

---

⚡ **Nếu làm theo đúng checklist này, bạn sẽ có app hoạt động trong 30 phút!**
