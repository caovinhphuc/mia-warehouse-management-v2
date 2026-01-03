# 🚀 AI Service - Quick Start Guide

## ⚡ Khởi Động Nhanh

### **Bước 1: Cài Đặt Dependencies**

```bash
cd ai-service
source venv/bin/activate  # Kích hoạt virtual environment
pip install -r requirements.txt
```

Hoặc chạy setup script:

```bash
cd ai-service
./setup.sh
```

### **Bước 2: Khởi Động Service**

```bash
cd ai-service
./start_background.sh
```

Service sẽ chạy trên port **5000** (mặc định).

### **Bước 3: Kiểm Tra**

```bash
# Health check
curl http://localhost:5000/health

# Xem logs
tail -f logs/ai-service.log
```

### **Bước 4: Dừng Service**

```bash
cd ai-service
./stop_background.sh
```

## 🐛 Troubleshooting

### **Lỗi: Port 5000 đã được sử dụng**

```bash
# Tìm process đang dùng port 5000
lsof -ti:5000

# Dừng process
lsof -ti:5000 | xargs kill -9

# Hoặc dùng script
./stop_background.sh
```

### **Lỗi: ModuleNotFoundError: No module named 'fastapi'**

```bash
# Kích hoạt virtual environment
source venv/bin/activate

# Cài đặt lại dependencies
pip install -r requirements.txt
```

### **Lỗi: Virtual environment không tìm thấy**

```bash
# Tạo virtual environment mới
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt
```

## 📝 Notes

- Service chạy ở **background mode**
- Logs được lưu trong `logs/` folder
- PID được lưu trong `ai-service.pid`
- Port có thể thay đổi bằng `PORT` env variable

---

**✨ Ready to use!**
