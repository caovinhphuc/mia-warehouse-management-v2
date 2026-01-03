# ⚠️ Port 8000 - Lưu Ý Quan Trọng

## 📋 Cấu Hình Port

AI Service đã được cấu hình để chạy trên **port 8000** để khớp với `Dockerfile.ai`.

## ⚠️ Lưu Ý Quan Trọng

### **Conflict với Backend Node.js**

Khi chạy **local development** (không dùng Docker):

- ❌ **Backend Node.js** thường chạy trên port 8000
- ❌ **AI Service** cũng chạy trên port 8000
- ⚠️ **Sẽ có conflict!**

### **Giải Pháp**

#### **Cách 1: Chạy Backend và AI Service ở port khác nhau (Local Dev)**

```bash
# Backend chạy trên port 8000
cd backend
PORT=8000 npm start

# AI Service chạy trên port khác (ví dụ 8001)
cd ai-service
PORT=8001 ./start_background.sh
```

Và cập nhật backend config:

```bash
# backend/.env
AI_SERVICE_URL=http://localhost:8001
```

#### **Cách 2: Dùng Docker (Khuyến nghị)**

Trong Docker, mỗi service chạy trong container riêng, không có conflict:

```bash
docker-compose up
```

Backend và AI Service có thể cùng dùng port 8000 vì chúng ở trong containers khác nhau.

## 📝 Files Đã Cập Nhật

✅ `ai-service/ai_service.py` - Default port 8000
✅ `ai-service/start_background.sh` - PORT=8000
✅ `ai-service/stop_background.sh` - PORT=8000
✅ `ai-service/cleanup.sh` - PORT=8000
✅ `backend/routes/authRoutes.js` - AI_SERVICE_URL port 8000

## 🐳 Docker Configuration

Dockerfile.ai đã config đúng:

```dockerfile
EXPOSE 8000
CMD ["uvicorn", "ai-service.main:app", "--host", "0.0.0.0", "--port", "8000"]
```

## ✅ Kết Luận

- ✅ **Docker**: Port 8000 hoàn toàn OK (containers riêng biệt)
- ⚠️ **Local Dev**: Cần chạy backend và AI service trên ports khác nhau, hoặc dùng Docker

---

**✨ Đã cấu hình xong!**
