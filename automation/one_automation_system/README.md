# 🤖 ONE Automation System

Hệ thống tự động hóa truy cập và lấy dữ liệu từ hệ thống ONE bằng Selenium WebDriver.

## ✨ Tính năng chính

- 🔐 **Tự động đăng nhập**: Đăng nhập vào hệ thống ONE tự động
- 📊 **Thu thập dữ liệu**: Lấy dữ liệu đơn hàng từ web interface
- 🔄 **Xử lý dữ liệu**: Làm sạch và chuẩn hóa dữ liệu
- 📤 **Xuất báo cáo**: Hỗ trợ CSV, Excel, JSON
- 📧 **Thông báo email**: Gửi báo cáo qua email tự động
- ⏰ **Lập lịch**: Chạy theo lịch định kỳ
- 📈 **Dashboard**: Giao diện theo dõi hiệu suất
- 🛡️ **Error handling**: Xử lý lỗi và retry logic

## 🚀 Cài đặt nhanh

### Bước 1: Clone và setup

```bash
# Giải nén project
cd one_automation_system

# Chạy script setup (Linux/Mac)
chmod +x setup.sh
./setup.sh

# Hoặc Windows
setup.bat
```

### Bước 2: Cấu hình

```bash
# Chỉnh sửa file .env với thông tin thực tế
cp .env.template .env
nano .env
```

Nội dung file .env:

```env
ONE_USERNAME=your_username
ONE_PASSWORD=your_password
SENDER_EMAIL=your_email@gmail.com
SENDER_PASSWORD=your_app_password
HEADLESS=false
```

### Bước 3: Chạy thử

```bash
# Kích hoạt virtual environment
source venv/bin/activate  # Linux/Mac
# venv\Scripts\activate  # Windows

# Chạy một lần
python automation.py --run-once

# Chạy theo lịch
python automation.py --schedule
```

## 📋 Cấu hình chi tiết

### config/config.json

```json
{
  "system": {
    "one_url": "https://one.example.com",
    "login_timeout": 30,
    "page_load_timeout": 20,
    "implicit_wait": 10,
    "retry_attempts": 3,
    "retry_delay": 5
  },
  "schedule": {
    "enabled": true,
    "frequency": "daily",
    "time": "08:00",
    "timezone": "Asia/Ho_Chi_Minh"
  },
  "notifications": {
    "email": {
      "enabled": true,
      "smtp_server": "smtp.gmail.com",
      "smtp_port": 587,
      "recipients": ["admin@company.com"]
    }
  },
  "data_processing": {
    "export_format": ["csv", "excel", "json"],
    "data_validation": true,
    "backup_enabled": true
  }
}
```

## 🎛️ Sử dụng

### Chạy automation

```bash
# Chạy một lần
python automation.py --run-once

# Chạy theo lịch (daemon mode)
python automation.py --schedule
```

### Utilities và monitoring

```bash
# Xem hiệu suất 7 ngày qua
python utils.py --performance 7

# Tạo dashboard HTML
python utils.py --dashboard

# Dọn dẹp file cũ (30 ngày)
python utils.py --cleanup 30
```

## 📁 Cấu trúc project

```
one_automation_system/
├── automation.py          # Script chính
├── utils.py              # Utilities và monitoring
├── requirements.txt      # Python dependencies
├── setup.sh             # Setup script (Linux/Mac)
├── setup.bat            # Setup script (Windows)
├── .env.template        # Template biến môi trường
├── config/
│   └── config.json      # File cấu hình chính
├── data/                # Dữ liệu xuất ra
├── logs/                # Log files
└── reports/             # Báo cáo và dashboard
```

## 🔧 Tùy chỉnh

### Thêm selector mới

Chỉnh sửa trong `automation.py`:

```python
# Thêm selector cho các element
order_selectors = [
    "a[href*='order']",
    ".your-custom-selector",
    # ...
]
```

### Thêm field dữ liệu

```python
# Trong hàm scrape_order_data()
try:
    custom_field = row.find_element(By.CSS_SELECTOR, ".custom-field")
    order_data['custom_field'] = custom_field.text.strip()
except:
    order_data['custom_field'] = ""
```

## 🚨 Xử lý lỗi

### Lỗi thường gặp

1. **Selenium WebDriver không khởi tạo được**

   ```bash
   # Cài đặt Chrome browser
   # Ubuntu/Debian
   sudo apt-get install google-chrome-stable
   ```

2. **Lỗi đăng nhập**
   - Kiểm tra username/password trong .env
   - Kiểm tra URL hệ thống ONE
   - Kiểm tra selector các element đăng nhập

3. **Không lấy được dữ liệu**
   - Kiểm tra selector các element bảng
   - Tăng timeout trong config
   - Kiểm tra log files

4. **Lỗi gửi email**
   - Kiểm tra SMTP settings
   - Sử dụng App Password cho Gmail
   - Kiểm tra firewall/network

### Debug mode

```bash
# Chạy với headless=false để xem browser
export HEADLESS=false
python automation.py --run-once
```

## 📊 Monitoring và báo cáo

### Log files

- Lưu tại `logs/automation_YYYYMMDD.log`
- Rotation tự động
- Level: INFO, ERROR, WARNING

### Dashboard

```bash
# Tạo dashboard HTML
python utils.py --dashboard
# Mở file trong reports/ để xem
```

### Performance metrics

- Số lần chạy thành công/thất bại
- Số đơn hàng thu thập được
- Thời gian thực thi
- Tỷ lệ thành công

## 🔒 Bảo mật

- Sử dụng biến môi trường cho credentials
- Không lưu password trong code
- Log không chứa thông tin nhạy cảm
- HTTPS cho tất cả kết nối

## 📞 Hỗ trợ

- 📧 Email: <support@company.com>
- 📱 Slack: #automation-support
- 📖 Wiki: [Link to internal wiki]

## 📝 Changelog

### v1.0.0 (2024-12-15)

- ✨ Phiên bản đầu tiên
- 🔐 Tự động đăng nhập ONE
- 📊 Thu thập dữ liệu đơn hàng
- 📧 Thông báo email
- ⏰ Lập lịch chạy định kỳ
- 📈 Dashboard monitoring

## 📄 License

MIT License - xem file LICENSE để biết thêm chi tiết.

---

**🚀 ONE Automation System - Tự động hóa thông minh cho doanh nghiệp!**
