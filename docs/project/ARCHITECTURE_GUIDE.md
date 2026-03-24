# 🏗️ KIẾN TRÚC HỆ THỐNG VÀ PHÂN CHIA TRÁCH NHIỆM

> **Version**: 4.0 (Updated January 2026)
> **Scope**: React OAS Integration v4.0 - Chi tiết kiến trúc và trách nhiệm từng component

**Recent Improvements (Jan 2026)**:

- ✅ Development workflow with pre-commit hooks (Husky, lint-staged, Prettier)
- ✅ Bundle optimization tools and performance monitoring
- ✅ Git workflow configured with remote origin
- ✅ Comprehensive documentation updates
- ✅ Project cleanup and organization

---

## 🎯 TỔNG QUAN HỆ THỐNG

```
┌─────────────────────────────────────────────────────────────┐
│              REACT OAS INTEGRATION v4.0                      │
├─────────────────────────────────────────────────────────────┤
│                                                               │
│  ┌──────────────┐    ┌──────────────┐    ┌──────────────┐  │
│  │   FRONTEND   │───▶│   BACKEND    │───▶│  AI SERVICE │  │
│  │  (React)     │    │  (Node.js)   │    │  (FastAPI)  │  │
│  │  Port: 3000  │    │  Port: 3001  │    │  Port: 8000 │  │
│  └──────────────┘    └──────────────┘    └──────────────┘  │
│         │                   │                    │           │
│         │                   │                    │           │
│  ┌──────▼──────┐    ┌───────▼────────┐   ┌───────▼──────┐  │
│  │ AUTOMATION │───▶│ GOOGLE SHEETS  │◀──│  ANALYTICS   │  │
│  │  (Selenium)│    │  (Storage)     │   │  (Reports)   │  │
│  │ Port: 8001 │    │  (External)    │   │              │  │
│  └────────────┘    └─────────────────┘   └──────────────┘  │
│                                                               │
└─────────────────────────────────────────────────────────────┘
```

### 📊 Service Inventory

| Service            | Stack                               | Role                                 | Ports   | Status    |
| ------------------ | ----------------------------------- | ------------------------------------ | ------- | --------- |
| Main Frontend      | React 18 + Redux + Ant Design       | Main Dashboard UI                    | 3000    | ✅ Stable |
| Main Backend       | Node.js + Express + Socket.IO       | Auth, API Aggregation, Notifications | 3001    | ✅ Stable |
| AI Service         | Python FastAPI                      | ML inference / analytics             | 8000    | ✅ Stable |
| Automation Service | Python + Selenium                   | Data scraping & RPA                  | 8001    | ✅ Stable |
| Google Sheets      | External API                        | Primary structured datastore         | -       | ✅ Active |
| Notification Layer | Nodemailer, Telegram Bot, Socket.IO | Multi-channel alerts                 | 3001/ws | ✅ Active |
| Dev Tools          | Husky + lint-staged + Prettier      | Code quality & git hooks             | -       | ✅ Active |
| Bundle Analyzer    | webpack-bundle-analyzer + dayjs     | Performance optimization             | -       | ✅ Active |

---

## 1️⃣ AUTOMATION SYSTEM - 🤖 Người Thu Thập Dữ Liệu

### **Trách nhiệm chính:**

✅ **Thu thập dữ liệu tự động từ One Page**

- Login vào hệ thống ONE
- Scrape dữ liệu đơn hàng (orders)
- Lấy thông tin sản phẩm
- Thu thập thống kê và metrics

✅ **Xử lý dữ liệu thô**

- Làm sạch dữ liệu (data cleaning)
- Chuẩn hóa format
- Validate dữ liệu
- Transform dữ liệu

✅ **Chạy theo lịch trình (Scheduled Tasks)**

- Cron jobs hàng ngày/giờ
- Tự động retry khi lỗi
- Monitoring và logging

✅ **Lưu trữ vào Google Sheets**

- Đẩy dữ liệu đã xử lý vào Sheets
- Update real-time khi có data mới
- Backup và versioning

### **Công việc cụ thể:**

```python
# automation/automation.py
class OneAutomationSystem:
    - setup_driver()              # Khởi tạo Selenium WebDriver
    - login_to_one()              # Đăng nhập vào ONE
    - scrape_order_data()         # Lấy dữ liệu đơn hàng
    - process_order_data()        # Xử lý và chuẩn hóa
    - export_to_sheets()          # Lưu vào Google Sheets
```

### **Khi nào hoạt động:**

- ⏰ 6:00 AM hàng ngày → Tự động lấy dữ liệu mới
- ⏰ Hàng tuần → Tạo báo cáo tổng hợp
- 👤 User click "Sync Now" → Chạy ngay lập tức
- 🔄 Khi có lỗi → Retry tự động

---

## 3️⃣ GOOGLE SHEETS - 📊 Kho Lưu Trữ Dữ Liệu

### **Trách nhiệm chính:**

✅ **Lưu trữ dữ liệu tập trung**

- Dữ liệu đơn hàng (Orders)
- Thống kê và metrics
- Lịch sử hoạt động (History)
- Cấu hình hệ thống (Config)

✅ **Cung cấp dữ liệu cho các service khác**

- AI Service đọc để phân tích
- Frontend hiển thị dashboard
- Automation đọc để so sánh

✅ **Quản lý cấu hình động**

- SLA rules
- User settings
- System configuration

✅ **Backup và versioning**

- Lưu trữ lịch sử
- Recovery khi có vấn đề

### **Cấu trúc Sheets:**

```
📋 Google Spreadsheet
├── 📄 Orders          → Dữ liệu đơn hàng real-time
├── 📄 Analytics       → Metrics và statistics
├── 📄 SLA_Rules       → Cấu hình SLA monitoring
├── 📄 Config          → System configuration
├── 📄 Automation_Logs → Lịch sử chạy automation
└── 📄 Dashboard       → Aggregated data cho dashboard
```

### **Khi nào hoạt động:**

- 📥 Khi Automation đẩy dữ liệu mới → Lưu ngay
- 📤 Khi AI Service cần phân tích → Đọc dữ liệu
- 📊 Khi Frontend hiển thị → Query dữ liệu
- 🔄 Liên tục → Sync và update

---

## 4️⃣ AI SERVICE - 🧠 Bộ Não Phân Tích

### **Trách nhiệm chính:**

✅ **Phân tích dữ liệu thông minh**

- Đọc dữ liệu từ Google Sheets
- Phân tích xu hướng (trend analysis)
- Dự đoán tương lai (predictive analytics)
- Phát hiện bất thường (anomaly detection)

✅ **Tối ưu hóa hệ thống (Optimization)**

- COBYQA algorithm cho optimization problems
- Route optimization
- Resource allocation
- Performance tuning

✅ **Đề xuất giải pháp (Recommendations)**

- Phân tích dữ liệu và đưa ra insights
- Đề xuất hành động cải thiện
- Cảnh báo rủi ro
- Tối ưu quy trình

### **Các chức năng cụ thể:**

```python
# ai-service/ai_service.py
@app.post("/ai/analyze")
- analyze_trends()          # Phân tích xu hướng
- predict_future()          # Dự đoán
- detect_anomalies()        # Phát hiện bất thường
- optimize_system()         # Tối ưu hóa
- generate_recommendations() # Đề xuất giải pháp
```

### **Khi nào hoạt động:**

- 📊 Sau khi Automation cập nhật data → Phân tích ngay
- 🧠 Định kỳ (mỗi giờ) → Chạy phân tích sâu
- 👤 User request → Phân tích on-demand
- ⚠️ Khi có dữ liệu bất thường → Cảnh báo ngay

---

## 5️⃣ STATISTICS & ANALYTICS - 📈 Thống Kê và Phân Tích

> **Status**: ✅ Implemented trong v4.0

### **Trách nhiệm chính:**

✅ **Thống kê mô tả (Descriptive Statistics)**

- Tổng hợp số liệu (aggregation)
- Tính toán metrics (KPIs)
- So sánh theo thời gian
- Phân tích theo nhóm

✅ **Báo cáo tự động**

- Báo cáo hàng ngày/tuần/tháng
- Dashboard real-time
- Export PDF/Excel
- Email reports

✅ **Visualization**

- Charts và graphs
- Trends visualization
- Heat maps
- Interactive dashboards

### **Metrics được theo dõi:**

```
📊 Key Metrics:
├── 📦 Orders: Số đơn hàng, giá trị, trạng thái
├── ⏱️ SLA: Thời gian xử lý, tỷ lệ đúng hạn
├── 💰 Revenue: Doanh thu, chi phí, lợi nhuận
├── 👥 Performance: Hiệu suất hệ thống
└── 📈 Trends: Xu hướng tăng/giảm
```

---

## 6️⃣ RECOMMENDATIONS ENGINE - 💡 Đề Xuất Giải Pháp

> **Status**: 🚧 In Development

### **Trách nhiệm chính:**

✅ **Phân tích và đề xuất**

- Phân tích dữ liệu từ AI Service
- Đưa ra các đề xuất hành động
- Ưu tiên hóa các vấn đề
- Tính toán impact

✅ **Tự động hóa hành động**

- Tự động áp dụng các cải thiện
- Tối ưu hóa quy trình
- Điều chỉnh tham số tự động

### **Ví dụ đề xuất:**

```json
{
  "recommendations": [
    {
      "action": "Tăng số lượng nhân viên xử lý đơn hàng",
      "reason": "Tỷ lệ đơn hàng trễ hạn tăng 15%",
      "impact": "Giảm 20% đơn hàng trễ hạn",
      "priority": "high",
      "cost": "Low",
      "effort": "Medium"
    },
    {
      "action": "Tối ưu hóa route delivery",
      "reason": "Chi phí vận chuyển tăng 10%",
      "impact": "Tiết kiệm 15% chi phí",
      "priority": "medium",
      "cost": "Medium",
      "effort": "High"
    }
  ]
}
```

---

## 7️⃣ DEVELOPMENT WORKFLOW - 🛠️ Quy Trình Phát Triển

> **Status**: ✅ Implemented (Jan 2026)

### **Trách nhiệm chính:**

✅ **Code Quality Assurance**

- Pre-commit hooks (Husky)
- Auto-formatting (Prettier)
- Linting (ESLint)
- Staged file processing (lint-staged)

✅ **Bundle Optimization**

- Bundle size analysis
- Performance monitoring
- Dependency checking
- Tree shaking optimization

✅ **Git Workflow**

- Remote origin configured
- Merge conflict resolution
- Pre-commit validation
- Auto-format on commit

### **Development Flow:**

```
💻 Code → 🔍 Lint (ESLint) → 🎨 Format (Prettier) → ✅ Commit (Husky) → 📤 Push (GitHub) → 🚀 Deploy
```

### **Tools & Scripts:**

```bash
# Code quality
npm run lint          # Lint code
npm run lint:fix      # Auto-fix issues
npm run format        # Format code
npm run validate      # Full validation

# Bundle optimization
npm run bundle:stats  # Generate bundle stats
npm run perf:bundle   # Performance analysis
npm run analyze:all   # Comprehensive analysis

# Development
npm run check:tools   # Check all tools
```

---

## 🔄 LUỒNG DỮ LIỆU HOÀN CHỈNH

### **Luồng 1: Thu thập và Lưu trữ**

```
1. ⏰ Trigger (Schedule hoặc Manual)
   ↓
2. 🤖 Automation System
   - Login ONE
   - Scrape data
   - Process & clean
   ↓
3. 📊 Google Sheets
   - Store data
   - Update real-time
   ↓
4. ✅ Complete
```

### **Luồng 3: Phân tích và Đề xuất**

```
1. 📊 Google Sheets (có data mới)
   ↓
2. 🧠 AI Service (Port 8000)
   - Read data
   - Analyze trends
   - Detect anomalies
   - Optimize
   ↓
3. 🔧 Backend nhận kết quả
   ↓
4. 📈 Statistics Engine
   - Calculate metrics
   - Generate reports
   ↓
5. 📡 WebSocket emit events:
   - ai:update
   - metrics:update
   - notify:alert
   ↓
6. 🎨 Frontend cập nhật real-time
   ↓
7. 💡 Recommendations Engine (🚧 In Development)
   - Generate suggestions
   - Prioritize actions
```

### **Luồng 4: Tối ưu hóa**

```
1. 🧠 AI Service nhận optimization request
   ↓
2. 🔬 COBYQA Algorithm
   - Solve optimization problem
   - Find optimal solution
   ↓
3. 📊 Google Sheets
   - Update configuration
   - Store results
   ↓
4. 🤖 Automation System
   - Apply new settings
   - Run with optimized params
```

---

## 📋 BẢNG PHÂN CÔNG TRÁCH NHIỆM

| Component              | Trách nhiệm                  | Input             | Output                     | Trigger            | Port |
| ---------------------- | ---------------------------- | ----------------- | -------------------------- | ------------------ | ---- |
| **🎨 Frontend**        | Giao diện người dùng         | User interactions | UI updates                 | User actions       | 3000 |
| **🔧 Backend**         | API Gateway, Auth, Real-time | API requests      | Responses, Events          | HTTP/WebSocket     | 3001 |
| **🤖 Automation**      | Thu thập dữ liệu từ ONE      | ONE Page API      | Raw data → Processed data  | Schedule/Manual    | 8001 |
| **📊 Google Sheets**   | Lưu trữ dữ liệu              | Processed data    | Stored data                | Real-time          | -    |
| **🧠 AI Service**      | Phân tích thông minh         | Stored data       | Insights & Predictions     | Schedule/On-demand | 8000 |
| **📈 Statistics**      | Thống kê và báo cáo          | Insights          | Metrics & Reports          | Schedule           | -    |
| **💡 Recommendations** | Đề xuất giải pháp            | Analysis results  | Actionable recommendations | Continuous         | 🚧   |

---

## 🔒 SECURITY FEATURES (v4.0)

### **Đã Implement:**

✅ **Authentication**

- JWT access tokens
- Session management
- Token refresh mechanism

✅ **Multi-Factor Authentication (MFA)**

- TOTP-based 2FA
- QR code setup
- Backup codes

✅ **Single Sign-On (SSO)**

- OAuth 2.0 / OpenID Connect
- Google SSO
- GitHub SSO

✅ **Role-Based Access Control (RBAC)**

- User roles (admin, manager, user)
- Permission-based access
- Fine-grained permissions

✅ **Audit Logs**

- Comprehensive logging system
- User activity tracking
- Security event logging
- Real-time alerting

---

## 📡 REAL-TIME EVENTS (WebSocket)

### **Events đã implement:**

| Event            | Payload                   | Producer             | Consumer                    |
| ---------------- | ------------------------- | -------------------- | --------------------------- |
| `ai:update`      | { jobId, status, result } | AI Service → Backend | Frontend dashboards         |
| `sheets:refresh` | { sheet, timestamp }      | Automation / Manual  | Frontend tables             |
| `notify:alert`   | { type, level, message }  | Backend / Jobs       | User UI notification center |
| `job:status`     | { jobId, progress }       | Automation           | Monitoring panel            |
| `metrics:update` | { cpu, memory, users }    | Backend              | Live Dashboard              |
| `auth:session`   | { userId, action }        | Backend              | Security Dashboard          |
| `nlp:response`   | { query, result }         | NLP Service          | NLP Dashboard               |

---

## 🎯 ĐỀ XUẤT GIẢI PHÁP TỐI ƯU

### **1. Kiến trúc Microservices rõ ràng**

```
src/                 → Frontend React App
├── components/
├── store/
├── services/
└── App.jsx

backend/             → Node.js Backend
├── src/
│   └── server.js
└── package.json

ai-service/          → Phân tích và tối ưu
├── ai_service.py
├── optimization/
└── analysis/

automation/          → Thu thập dữ liệu
├── automation.py
├── main.py
└── services/

shared-services/     → Shared services
└── google-sheets/

analytics/           → Thống kê và báo cáo (✅ Implemented)
├── statistics.py
├── reports.py
└── recommendations.py (🚧 In Development)
```

### **2. Luồng dữ liệu chuẩn**

```
User → Frontend (3000) → Backend (3001) → AI Service (8000)
                                    ↓
                            Google Sheets
                                    ↓
                            Automation (8001) → ONE Page
                                    ↓
                            Analytics → Recommendations (🚧)
```

### **3. API Gateway để điều phối**

```python
# main-api-gateway.py
@app.post("/api/automation/sync")
async def sync_data():
    # Trigger automation
    # Return status

@app.get("/api/analytics/statistics")
async def get_statistics():
    # Read from Sheets
    # Calculate metrics
    # Return results

@app.get("/api/ai/recommendations")
async def get_recommendations():
    # AI analysis
    # Generate recommendations
    # Return suggestions
```

### **4. Real-time Updates**

- WebSocket cho real-time dashboard
- Event-driven architecture
- Message queue (Redis/RabbitMQ)

---

## 🚀 KẾ HOẠCH TRIỂN KHAI

### **Phase 1: Hoàn thiện Automation**

- ✅ Automation đã có
- ⚠️ Cần tối ưu performance
- ⚠️ Cần error handling tốt hơn

### **Phase 2: Tích hợp AI Service**

- ✅ AI Service đã có
- ⚠️ Cần kết nối với Google Sheets
- ⚠️ Cần implement analysis functions

### **Phase 3: Xây dựng Analytics Module**

- ✅ Đã có - Analytics Module
- ✅ Statistics engine
- ✅ Reports generator
- 🚧 Recommendations engine (In Development)

### **Phase 4: Tích hợp và Testing**

- 🔗 Connect all services
- 🧪 End-to-end testing
- 📊 Dashboard integration

---

## ✅ CHECKLIST HÀNH ĐỘNG

### **Đã hoàn thành:**

- [x] Tạo `analytics/` module
- [x] Implement statistics functions
- [x] Connect AI Service với Google Sheets
- [x] Tạo API Gateway (Backend)
- [x] Implement Security features (MFA, SSO, RBAC)
- [x] Implement WebSocket real-time
- [x] Implement NLP Dashboard
- [x] Implement Smart Automation
- [x] Setup development tools (Husky, lint-staged, Prettier) - NEW
- [x] Configure git workflow with remote origin - NEW
- [x] Install bundle optimization tools (dayjs, analyzers) - NEW
- [x] Project cleanup (removed 9 duplicate files) - NEW
- [x] Comprehensive documentation updates - NEW
- [x] Verify all npm scripts working - NEW

### **Trong tuần:**

- [ ] Hoàn thiện recommendations engine
- [ ] Xây dựng dashboard tích hợp
- [ ] Implement real-time updates
- [ ] Testing toàn bộ luồng
- [x] Implement route-based code splitting (in progress)
- [x] Replace moment.js with dayjs (in progress)

### **Trong tháng:**

- [ ] Optimization và performance tuning
- [ ] Monitoring và alerting
- [ ] Documentation đầy đủ
- [ ] Production deployment to Vercel
- [x] Bundle size optimization (in progress)

---

## 📝 TÓM TẮT

**🎨 Frontend** = Giao diện người dùng, hiển thị và tương tác (Port 3000)
**🔧 Backend** = Trung tâm điều khiển, API Gateway, Auth, Real-time (Port 3001)
**🤖 Automation** = Người lao động, thu thập dữ liệu (Port 8001)
**📊 Google Sheets** = Kho lưu trữ, trung tâm dữ liệu
**🧠 AI Service** = Bộ não, phân tích thông minh (Port 8000)
**📈 Analytics** = Thống kê, đo lường hiệu suất (✅ Implemented)
**💡 Recommendations** = Cố vấn, đề xuất giải pháp (🚧 In Development)
**🛠️ Dev Workflow** = Code quality, optimization, git workflow (✅ Implemented)

**Luồng hoạt động:**

```
Development Flow:
💻 Code → 🔍 Lint → 🎨 Format → ✅ Commit → 📤 Push → 🚀 Deploy

Data Flow:
User → Frontend → Backend → AI Service
                    ↓
            Google Sheets
                    ↓
            Automation → ONE Page
                    ↓
            Analytics → Recommendations (🚧)
```

**Mục tiêu:** Tự động hóa toàn bộ quy trình từ thu thập → phân tích → đề xuất → hành động!

---

## 🌐 DEPLOY PORT MAPPING (LOCAL VS PRODUCTION)

Trong local dev, từng service chạy trên port riêng:

- Frontend: `3000`
- Backend: `3001`
- AI Service: `8000`

Trong production, user chỉ truy cập qua reverse proxy (Nginx) ở cổng public:

- Public: `80/443` (domain chính)
- Internal private network:
  - `frontend:80`
  - `backend:3001`
  - `ai-service:8000`

Routing khuyến nghị:

- `/` → Frontend
- `/api/*` → Backend
- `/ai/*` → AI Service (nếu cần expose)

### Lệnh deploy chuẩn (1 máy, Docker + Nginx)

```bash
# From project root
docker compose -f docker-compose.production.yml up -d --build

# Check services
docker compose -f docker-compose.production.yml ps
```

Hoặc dùng script chuẩn của project:

```bash
./deploy.sh docker
```

> Script deploy hiện ưu tiên `docker-compose.production.yml` trước, sau đó mới fallback sang `docker-compose.yml`.

---

## 📚 LIÊN KẾT TÀI LIỆU

- [ARCHITECTURE.md](./ARCHITECTURE.md) - High-level architecture overview
- [README.md](./README.md) - Project overview và quick start
- [DEPLOYMENT_GUIDE.md](./DEPLOYMENT_GUIDE.md) - Hướng dẫn deployment
- [DEVELOPMENT_TOOLS_SETUP.md](./DEVELOPMENT_TOOLS_SETUP.md) - Development tools guide
- [BUNDLE_OPTIMIZATION_GUIDE.md](./BUNDLE_OPTIMIZATION_GUIDE.md) - Bundle optimization
- [COMPLETE_WORK_SUMMARY.md](./COMPLETE_WORK_SUMMARY.md) - Complete work summary

---

## 🔄 Recent Updates (January 21, 2026)

### Development Infrastructure

- ✅ Setup Husky (v9.0.11) for git hooks
- ✅ Configured lint-staged for auto-formatting
- ✅ Integrated Prettier (v3.2.5) for code formatting
- ✅ Pre-commit hooks tested and verified

### Performance & Optimization

- ✅ Installed dayjs (v1.11.19) to replace moment.js
- ✅ Setup bundle analysis tools
- ✅ Configured performance monitoring
- ✅ Verified all optimization scripts

### Git & Deployment

- ✅ Configured git remote origin (GitHub)
- ✅ Resolved merge conflicts
- ✅ Updated all deployment documentation
- ✅ Ready for production deployment

### Project Organization

- ✅ Cleaned up 9 duplicate files
- ✅ Organized scripts into logical folders
- ✅ Updated 20+ documentation files
- ✅ Verified all npm scripts working

---

**Initial Version**: 2025-01-27
**Last Updated**: January 21, 2026
**Version**: 4.0
**Status**: ✅ 97% Complete (up from 95%)
**Next Focus**: One Page integration + Real Google Sheets + Production deployment
