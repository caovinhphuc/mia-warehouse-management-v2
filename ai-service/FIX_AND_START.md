# 🔧 Fix & Start AI Service

## 🐛 Vấn Đề Đã Gặp

1. **Port 5000 đã được sử dụng** - Có process khác đang dùng port
2. **FastAPI chưa được cài đặt** - Dependencies thiếu
3. **Virtual environment chưa được kích hoạt** - Script không sử dụng venv đúng cách

## ✅ Giải Pháp

### **Cách 1: Dùng Script Tự Động (Khuyến nghị)**

```bash
cd ai-service
./install_and_start.sh
```

Script này sẽ:

- ✅ Tạo virtual environment (nếu chưa có)
- ✅ Cài đặt tất cả dependencies
- ✅ Dừng service cũ (nếu có)
- ✅ Khởi động service mới

### **Cách 2: Thủ Công**

#### **Bước 1: Dừng Process Cũ**

```bash
cd ai-service

# Dừng service cũ
./stop_background.sh

# Hoặc kill process trên port 5000
lsof -ti:5000 | xargs kill -9
```

#### **Bước 2: Cài Đặt Dependencies**

```bash
# Kích hoạt virtual environment
source venv/bin/activate

# Cài đặt dependencies
pip install -r requirements.txt
```

#### **Bước 3: Khởi Động Service**

```bash
# Đảm bảo virtual environment được kích hoạt
source venv/bin/activate

# Start service
./start_background.sh
```

## 🔍 Kiểm Tra

```bash
# Health check
curl http://localhost:5000/health

# Xem logs
tail -f logs/ai-service.log

# Xem error logs
tail -f logs/ai-service-error.log
```

## 📝 Notes

- **Virtual environment**: Luôn kích hoạt `source venv/bin/activate` trước khi chạy
- **Port conflict**: Nếu port 5000 bị dùng, dùng `./stop_background.sh` để dừng
- **Dependencies**: Nếu thiếu, chạy `pip install -r requirements.txt` trong venv

---

**✨ Service sẵn sàng sau khi chạy `./install_and_start.sh`!**
