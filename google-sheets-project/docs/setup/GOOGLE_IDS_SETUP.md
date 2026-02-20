# 🆔 HƯỚNG DẪN LẤY GOOGLE IDs

## 📊 GOOGLE SHEETS ID

### Cách lấy ID:

1. **Tạo Google Sheet mới**:

   - Truy cập: https://sheets.google.com/
   - Nhấn "+ Blank" để tạo sheet mới
   - Đặt tên: "React Integration Data"

2. **Copy ID từ URL**:

   ```
   URL: https://docs.google.com/spreadsheets/d/1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs74OgvE2upms/edit
   ID:  1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs74OgvE2upms
   ```

3. **Cấu hình trong .env**:
   ```env
   REACT_APP_GOOGLE_SHEET_ID=1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs74OgvE2upms
   ```

### Chuẩn bị dữ liệu mẫu:

Tạo sheet "Orders" với header:

```
date,product,quantity,total,status,customer_id
2024-01-01,Sản phẩm A,2,200000,completed,CUST001
2024-01-02,Sản phẩm B,1,150000,pending,CUST002
```

---

## 📁 GOOGLE DRIVE FOLDER ID

### Cách lấy ID:

1. **Tạo thư mục mới**:

   - Truy cập: https://drive.google.com/
   - Nhấn "+ New" → "Folder"
   - Đặt tên: "React App Files"

2. **Copy ID từ URL**:

   ```
   URL: https://drive.google.com/drive/folders/1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs74OgvE2upms
   ID:  1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs74OgvE2upms
   ```

3. **Cấu hình trong .env**:
   ```env
   REACT_APP_GOOGLE_DRIVE_FOLDER_ID=1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs74OgvE2upms
   ```

---

## 🔐 GOOGLE SERVICE ACCOUNT

### Bước 1: Tạo Google Cloud Project

1. Truy cập: https://console.cloud.google.com/
2. Tạo project mới: "React Integration"
3. Enable APIs:
   - Google Sheets API
   - Google Drive API

### Bước 2: Tạo Service Account

1. Vào **IAM & Admin** → **Service Accounts**
2. Nhấn **"Create Service Account"**
3. Điền tên: "react-integration-service"
4. Tạo và download JSON key

### Bước 3: Chia sẻ quyền

1. **Google Sheet**: Share với service account email (Editor)
2. **Google Drive Folder**: Share với service account email (Editor)

### Bước 4: Cấu hình .env

```env
REACT_APP_GOOGLE_CLIENT_EMAIL=react-integration-service@your-project.iam.gserviceaccount.com
REACT_APP_GOOGLE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nYour-Private-Key-Here\n-----END PRIVATE KEY-----"
REACT_APP_GOOGLE_PROJECT_ID=your-project-id
```

---

## ✅ KIỂM TRA CẤU HÌNH

Sau khi thiết lập, chạy ứng dụng:

```bash
# Terminal 1: Backend
node server.js

# Terminal 2: Frontend
node server.js
```

Truy cập: http://localhost:3000

- Nếu thấy ⚠️ "Configuration Required" → cần cấu hình thêm
- Nếu thấy status "OK" → đã sẵn sàng sử dụng

---

## 🔧 TROUBLESHOOTING

### Lỗi "No key or keyFile set"

- Kiểm tra GOOGLE_PRIVATE_KEY có `\n` thay vì xuống dòng thật

### Lỗi "Insufficient Permission"

- Đảm bảo đã share Sheet/Folder với Service Account
- Kiểm tra quyền Editor được cấp

### Lỗi "Invalid login"

- Verify Service Account email chính xác
- Kiểm tra Private Key format
