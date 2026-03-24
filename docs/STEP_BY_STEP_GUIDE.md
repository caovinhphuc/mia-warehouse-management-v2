# 🚀 HƯỚNG DẪN THỰC HIỆN TỪNG BƯỚC - REACT OAS INTEGRATION

## 📋 **THỨ TỰ FILE MARKDOWN ĐỌC**

### **1️⃣ BẮT ĐẦU TẠI ĐÂY:**

1. **`README.md`** - Tổng quan dự án, mục đích sử dụng
2. **`QUICK_START_CHECKLIST.md`** - Checklist nhanh để bắt đầu

### **2️⃣ HƯỚNG DẪN CHI TIẾT:**

3. **`COMPREHENSIVE_GUIDE.md`** - Hướng dẫn toàn diện (cài đặt, deployment, tối ưu)
4. **`USER_GUIDE.md`** - Hướng dẫn sử dụng platform

### **3️⃣ BÁO CÁO & PHÂN TÍCH:**

5. **`PROJECT_ANALYSIS_REPORT.md`** - Báo cáo phân tích dự án
6. **`SYSTEM_COMPLETION_REPORT.md`** - Báo cáo hoàn thành hệ thống
7. **`DEVELOPMENT_ROADMAP_V3.md`** - Roadmap phát triển tương lai

---

## 🎯 **THỨ TỰ THỰC HIỆN TỪNG BƯỚC**

### **PHASE 1: CHUẨN BỊ (10 phút)**

#### **Bước 1.1: Kiểm tra hệ thống**

```bash
# Kiểm tra Node.js
node --version    # Cần >= 16.0.0
npm --version     # Cần >= 8.0.0

# Kiểm tra Python
python3 --version # Cần >= 3.8
pip3 --version    # Cần có pip3

# Kiểm tra Git
git --version     # Cần có Git
```

#### **Bước 1.2: Cài đặt thiếu (nếu cần)**

```bash
# Ubuntu/Debian
sudo apt update
sudo apt install nodejs npm python3 python3-pip git

# macOS
brew install node python3 git

# Windows
# Download từ nodejs.org, python.org, git-scm.com
```

### **PHASE 2: CÀI ĐẶT (5 phút)**

#### **Bước 2.1: Quick Setup (1 lệnh)**

```bash
# Di chuyển vào thư mục dự án
cd "/Users/phuccao/Desktop/Công việc/react-oas-integration-project"

# Chạy setup tự động
chmod +x quick-setup.sh
./quick-setup.sh
```

#### **Bước 2.2: Kiểm tra cài đặt**

```bash
# Kiểm tra services
curl http://localhost:8080         # Frontend
curl http://localhost:3001/health  # Backend
curl http://localhost:8000/health  # AI Service

# Kiểm tra logs
tail -f logs/frontend.log
tail -f logs/backend.log
tail -f logs/ai-service.log
```

### **PHASE 3: CẤU HÌNH (15 phút)**

#### **Bước 3.1: Environment Variables**

```bash
# Tạo file .env
cat > .env << EOF
NODE_ENV=development
PORT=3001
AI_SERVICE_URL=http://localhost:8000
JWT_SECRET=your-secret-key-here-$(date +%s)
GOOGLE_SHEETS_SPREADSHEET_ID=your-spreadsheet-id
# Legacy: GOOGLE_SHEETS_ID (đồng bộ cùng ID nếu còn dùng)
EOF
```

#### **Bước 3.2: Google Sheets Setup**

```bash
# Copy file credentials mẫu
cp automation/config/google-credentials.json.example automation/config/google-credentials.json

# Hướng dẫn setup Google Sheets:
# 1. Vào Google Cloud Console
# 2. Tạo Service Account
# 3. Download credentials JSON
# 4. Thay thế file automation/config/google-credentials.json
# 5. Share Google Sheets với service account email
```

#### **Bước 3.3: Test Configuration**

```bash
# Test Google Sheets connection
cd automation
python3 test_google_sheets.py
cd ..

# Test AI Service
curl -X POST http://localhost:8000/api/ml/predict \
  -H "Content-Type: application/json" \
  -d '{"timeframe": "1h", "metrics": ["response_time", "active_users"]}'
```

### **PHASE 4: SỬ DỤNG (10 phút)**

#### **Bước 4.1: Truy cập Platform**

```bash
# Mở trình duyệt và truy cập:
# Frontend: http://localhost:8080
# Backend API: http://localhost:3001
# AI Service: http://localhost:8000
# API Docs: http://localhost:8000/docs
```

#### **Bước 4.2: Test Features**

```bash
# Test Live Dashboard
# 1. Vào http://localhost:8080
# 2. Click "📊 Live Dashboard"
# 3. Xem real-time metrics

# Test AI Analytics
# 1. Click "🧠 AI Analytics"
# 2. Xem predictions và insights
# 3. Kiểm tra anomaly detection
```

### **PHASE 5: DEPLOYMENT (20 phút)**

#### **Bước 5.1: Production Build**

```bash
# Build production
npm run build

# Test production build
npm run preview
```

#### **Bước 5.2: Docker Deployment**

```bash
# Deploy với Docker
./deploy.sh start

# Kiểm tra status
./deploy.sh status

# Xem logs
./deploy.sh logs
```

#### **Bước 5.3: Cloud Deployment**

```bash
# Setup Git repository
./quick-setup.sh git

# Deploy to Vercel
npm run deploy:vercel

# Hoặc deploy to Railway
# 1. Connect GitHub repo to Railway
# 2. Auto-deploy từ main branch
```

### **PHASE 6: MONITORING & MAINTENANCE (5 phút)**

#### **Bước 6.1: Health Monitoring**

```bash
# Health check
./deploy.sh health

# Performance monitoring
./deploy.sh status

# Log monitoring
./deploy.sh logs
```

#### **Bước 6.2: Testing**

```bash
# Run all tests
./deploy.sh test

# Run specific tests
node integration_test.js
node end_to_end_test.js
node complete_system_test.js
```

---

## 🆘 **TROUBLESHOOTING**

### **Lỗi thường gặp:**

#### **1. Port đã được sử dụng**

```bash
# Tìm process sử dụng port
lsof -i :8080
lsof -i :3001
lsof -i :8000

# Kill process
kill -9 <PID>
```

#### **2. Dependencies lỗi**

```bash
# Reinstall dependencies
rm -rf node_modules package-lock.json
npm install --legacy-peer-deps

# Python dependencies
cd ai-service
pip3 install -r requirements.txt --force-reinstall
```

#### **3. Services không start**

```bash
# Restart all services
./deploy.sh stop
./deploy.sh start

# Hoặc restart manual
pkill -f "node|python|serve"
./quick-setup.sh deploy
```

---

## 📞 **HỖ TRỢ**

### **Khi gặp vấn đề:**

1. **Đọc logs**: `./deploy.sh logs`
2. **Check status**: `./deploy.sh status`
3. **Health check**: `./deploy.sh health`
4. **Run tests**: `./deploy.sh test`

### **Tài liệu tham khảo:**

- **README.md** - Tổng quan
- **COMPREHENSIVE_GUIDE.md** - Hướng dẫn chi tiết
- **USER_GUIDE.md** - Hướng dẫn sử dụng
- **QUICK_START_CHECKLIST.md** - Checklist nhanh

---

## ✅ **CHECKLIST HOÀN THÀNH**

- [ ] **Phase 1**: Kiểm tra hệ thống ✅
- [ ] **Phase 2**: Cài đặt dependencies ✅
- [ ] **Phase 3**: Cấu hình environment ✅
- [ ] **Phase 4**: Test platform ✅
- [ ] **Phase 5**: Deploy production ✅
- [ ] **Phase 6**: Monitoring setup ✅

**🎉 Chúc mừng! Bạn đã hoàn thành setup React OAS Integration!**
