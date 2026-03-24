# 📊 HƯỚNG DẪN SETUP GOOGLE SHEETS INTEGRATION

## 🎯 Mục tiêu

Tích hợp Google Sheets vào React OAS Integration project để quản lý dữ liệu, báo cáo và tự động hóa.

## 📋 Checklist Setup

### ✅ Bước 1: Tạo Google Cloud Project

1. Truy cập [Google Cloud Console](https://console.cloud.google.com/)
2. Tạo project mới hoặc chọn project hiện có
3. Enable các APIs sau:
   - **Google Sheets API**
   - **Google Drive API**

### ✅ Bước 2: Tạo Service Account

1. Vào **IAM & Admin** > **Service Accounts**
2. Nhấn **Create Service Account**
3. Điền thông tin:
   - **Name**: `react-oas-integration`
   - **Description**: `Service account for React OAS Integration`
4. Nhấn **Create and Continue**
5. Bỏ qua phần roles và nhấn **Done**

### ✅ Bước 3: Tạo Key cho Service Account

1. Nhấn vào Service Account vừa tạo
2. Vào tab **Keys** > **Add Key** > **Create New Key**
3. Chọn **JSON** và nhấn **Create**
4. File JSON sẽ được tải xuống - **BẢO MẬT FILE NÀY**

### ✅ Bước 4: Cập nhật Credentials File

1. Copy nội dung file JSON vừa tải xuống
2. Thay thế nội dung file `automation/config/google-credentials.json`
3. Đảm bảo các field sau có giá trị thực:
   - `project_id`
   - `client_email`
   - `private_key`

### ✅ Bước 5: Tạo Google Sheets

1. Truy cập [Google Sheets](https://sheets.google.com)
2. Tạo sheet mới với tên: **"React OAS Integration Data"**
3. Copy **Sheet ID** từ URL (giữa `/d/` và `/edit`)
4. Tạo các sheet tabs:
   - **Orders** (cho dữ liệu đơn hàng)
   - **Dashboard** (cho dữ liệu tổng quan)
   - **Analytics** (cho dữ liệu phân tích)

### ✅ Bước 6: Chia sẻ Google Sheets

1. Nhấn **Share** button trên Google Sheets
2. Thêm email của Service Account (từ credentials file)
3. Chọn quyền **Editor**
4. Nhấn **Send**

### ✅ Bước 7: Cập nhật Environment Variables

1. Mở file `.env`
2. Cập nhật các giá trị sau:
   ```env
   REACT_APP_GOOGLE_SHEET_ID=YOUR_ACTUAL_SHEET_ID
   GOOGLE_SHEETS_ID=YOUR_ACTUAL_SHEET_ID
   ```

### ✅ Bước 8: Test Connection

```bash
# Chạy test script
node test_google_sheets.js
```

## 🧪 Test Script Features

Script `test_google_sheets.js` sẽ:

- ✅ Kiểm tra credentials file
- ✅ Kiểm tra environment variables
- ✅ Test authentication với Google APIs
- ✅ Test kết nối với Google Sheets
- ✅ Tạo các sheet tabs cần thiết
- ✅ Thêm dữ liệu mẫu

## 📊 Dữ liệu mẫu sẽ được tạo

### Orders Sheet

| Ngày       | Sản phẩm   | Số lượng | Giá    | Trạng thái | Khách hàng   |
| ---------- | ---------- | -------- | ------ | ---------- | ------------ |
| 2025-09-13 | Sản phẩm A | 5        | 150000 | Hoàn thành | Nguyễn Văn A |
| 2025-09-13 | Sản phẩm B | 3        | 200000 | Đang xử lý | Trần Thị B   |

### Dashboard Sheet

| Metric        | Value      | Change | Status |
| ------------- | ---------- | ------ | ------ |
| Tổng đơn hàng | 1250       | +12%   | Tăng   |
| Doanh thu     | 1250000000 | +8%    | Tăng   |

## 🔧 Troubleshooting

### Lỗi: "No key or keyFile set"

- Kiểm tra credentials file có đúng format JSON không
- Đảm bảo `private_key` có đầy đủ `\n` characters

### Lỗi: "Insufficient Permission"

- Đảm bảo đã chia sẻ Google Sheets với Service Account email
- Kiểm tra quyền Editor đã được cấp

### Lỗi: "Spreadsheet not found"

- Kiểm tra Sheet ID có đúng không
- Đảm bảo Sheet ID không có khoảng trắng

## 🚀 Sau khi setup xong

1. **Test trong Frontend**: Truy cập `/google-sheets` để test integration
2. **Kiểm tra dữ liệu**: Xem dữ liệu mẫu đã được tạo trong Google Sheets
3. **Test các chức năng**: Đọc, ghi, thêm dữ liệu mới

## 📞 Hỗ trợ

Nếu gặp vấn đề:

1. Kiểm tra logs trong console
2. Verify các credentials
3. Test từng bước một
4. Kiểm tra network connectivity

---

🎉 **Chúc bạn setup thành công Google Sheets Integration!**
