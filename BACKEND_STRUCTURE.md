# 🔧 BACKEND STRUCTURE ANALYSIS

**Backend Location:** `/Users/phuccao/Projects/mia-warehouse-management-v2/backend/`  
**Server:** Express.js + Socket.io + Native WebSocket  
**Port:** 3001 (currently running ✅)  
**Analysis Date:** January 19, 2026

---

## 📊 BACKEND OVERVIEW

### **Tech Stack**

```yaml
Framework: Express.js 4.18.2
WebSocket: Socket.io 4.8.1 + Native WS 8.18.3
Runtime: Node.js
Language: JavaScript (CommonJS)
Authentication: JWT + bcrypt
APIs: Google Sheets API, Google Drive API
```

### **Current Status**

```
✅ Server Running: Port 3001
✅ Socket.io: Initialized
✅ Native WebSocket: Ready on /ws
✅ Auto-created accounts: admin@mia.vn, user@mia.vn
⚠️ Email service: Not configured (SendGrid)
```

---

## 🗂️ DIRECTORY STRUCTURE

```
backend/
├── 📁 api/                    → External API integrations
│   ├── data-receiver.js       → Data ingestion endpoint
│   ├── scraper-controller.js  → Python scraper controller
│   └── scraper-routes.js      → Scraper API routes
│
├── 📁 config/                 → Configuration files (empty)
│
├── 📁 data/                   → Data storage (runtime data)
│
├── 📁 logs/                   → Application logs
│   └── audit/                 → Audit trail logs
│
├── 📁 middleware/             → Express middleware
│   └── auth.js                → Authentication middleware (JWT verification)
│
├── 📁 public/                 → Static files
│   ├── stylesheets/           → CSS files
│   └── index.html             → Landing page
│
├── 📁 routes/                 → API route handlers
│   ├── aiRoutes.js            → AI/ML endpoints
│   ├── alertRoutes.js         → Alert management
│   ├── auditRoutes.js         → Audit logging API
│   ├── authRoutes.js          → Authentication (Login, MFA, SSO)
│   ├── automationRoutes.js    → Automation workflows
│   ├── custom-metrics.js      → Custom business metrics
│   ├── driveRoutes.js         → Google Drive operations
│   ├── index.js               → Route index
│   ├── retail-metrics.js      → Retail-specific metrics
│   ├── scriptRoutes.js        → Google Apps Script
│   ├── sheetsRoutes.js        → Google Sheets operations
│   ├── users.js               → User management
│   └── webhookRoutes.js       → Webhook handling
│
├── 📁 services/               → Business logic layer
│   ├── alertService.js        → Alert/notification service
│   ├── auditService.js        → Audit logging service
│   ├── authService.js         → Authentication service
│   ├── encryptionService.js   → Encryption utilities
│   ├── googleDriveService.js  → Google Drive integration
│   ├── googleSheetsService.js → Google Sheets integration
│   ├── socketService.js       → Socket.io service
│   ├── ssoService.js          → SSO integration (Google, MS, GitHub)
│   └── wsService.js           → Native WebSocket service
│
├── 📁 tests/                  → Test files
│   └── testAlerts.js          → Alert system tests
│
├── 📁 utils/                  → Utility functions
│   └── dateUtils.js           → Date formatting utilities
│
├── 📄 server.js               → Main server entry point ✅
├── 📄 package.json            → Dependencies & scripts
├── 📄 Dockerfile              → Docker configuration
├── 📄 railway.json            → Railway deployment config
├── 📄 check_env.js            → Environment checker
├── 📄 test-google-auth.js     → Google auth test
├── 📄 test-websocket.js       → WebSocket test
├── 📄 ws-health-check.js      → WebSocket health check
└── 📄 WEBSOCKET_GUIDE.md      → WebSocket documentation
```

---

## 🛣️ API ROUTES (13 Route Groups)

### **1. Authentication Routes** (`/api/auth`)

```javascript
POST   /api/auth/login              → User login (email/password)
POST   /api/auth/register           → User registration
POST   /api/auth/verify             → Session verification
POST   /api/auth/logout             → User logout
POST   /api/auth/refresh            → Token refresh
POST   /api/auth/mfa/setup          → MFA setup
POST   /api/auth/mfa/verify         → MFA verification
GET    /api/auth/sso/:provider      → SSO auth URL (Google, MS, GitHub)
POST   /api/auth/sso/callback       → SSO callback handler
```

**Features:**

- ✅ JWT authentication
- ✅ bcrypt password hashing
- ✅ MFA support (speakeasy)
- ✅ SSO integration (Google, Microsoft, GitHub)
- ✅ Session management
- ✅ Demo accounts auto-created

---

### **2. Audit Routes** (`/api/audit`)

```javascript
GET    /api/audit/logs             → Get audit logs
POST   /api/audit/log              → Create audit entry
GET    /api/audit/user/:userId     → User-specific logs
GET    /api/audit/action/:action   → Action-specific logs
```

**Features:**

- ✅ Complete activity tracking
- ✅ User action logging
- ✅ File-based audit trail
- ✅ Searchable logs

---

### **3. Google Sheets Routes** (`/api/sheets`)

```javascript
GET    /api/sheets/list            → List all sheets
GET    /api/sheets/:id             → Get sheet data
POST   /api/sheets/:id/append      → Append rows
PUT    /api/sheets/:id/update      → Update cells
DELETE /api/sheets/:id/rows        → Delete rows
POST   /api/sheets/create          → Create new sheet
GET    /api/sheets/:id/metadata    → Get sheet metadata
```

**Features:**

- ✅ Full CRUD operations
- ✅ Batch operations
- ✅ Real-time sync
- ✅ Error handling

---

### **4. Google Drive Routes** (`/api/drive`)

```javascript
GET    /api/drive/files            → List files
GET    /api/drive/file/:id         → Get file details
POST   /api/drive/upload           → Upload file
DELETE /api/drive/file/:id         → Delete file
POST   /api/drive/folder           → Create folder
GET    /api/drive/search           → Search files
```

**Features:**

- ✅ File management
- ✅ Folder operations
- ✅ File metadata
- ✅ Search functionality

---

### **5. AI/ML Routes** (`/api/ai`, `/api/ml`)

```javascript
POST   /api/ai/analyze             → AI analysis
POST   /api/ai/predict             → ML prediction
POST   /api/ai/train               → Model training
GET    /api/ai/models              → List models
POST   /api/ai/nlp                 → NLP processing
```

**Features:**

- ⚠️ Rate limited (100 req/min)
- ✅ AI analysis endpoints
- ✅ ML prediction
- ⚠️ Requires AI service integration

---

### **6. Alert Routes** (`/api/alerts`)

```javascript
GET    /api/alerts                 → List alerts
POST   /api/alerts                 → Create alert
PUT    /api/alerts/:id             → Update alert
DELETE /api/alerts/:id             → Delete alert
GET    /api/alerts/active          → Active alerts only
POST   /api/alerts/test            → Test alert system
```

**Features:**

- ✅ Alert management
- ✅ Multi-channel notifications
- ✅ Email (SendGrid)
- ✅ Telegram bot

---

### **7. Automation Routes** (`/api/automation`)

```javascript
GET    /api/automation/workflows   → List workflows
POST   /api/automation/run         → Run automation
GET    /api/automation/status      → Check status
POST   /api/automation/schedule    → Schedule workflow
GET    /api/automation/history     → Execution history
```

**Features:**

- ✅ Workflow automation
- ✅ Scheduled tasks
- ✅ Execution history
- ✅ Status monitoring

---

### **8. Apps Script Routes** (`/api/script`)

```javascript
POST   /api/script/deploy          → Deploy Apps Script
GET    /api/script/functions       → List functions
POST   /api/script/execute         → Execute function
GET    /api/script/logs            → Get execution logs
```

**Features:**

- ✅ Apps Script deployment
- ✅ Function execution
- ✅ Log management

---

### **9. Custom Metrics Routes** (`/api/custom`)

```javascript
GET    /api/custom/metrics         → Get custom metrics
POST   /api/custom/metric          → Create metric
GET    /api/custom/report          → Generate report
```

**Features:**

- ✅ Custom business metrics
- ✅ Reporting
- ✅ Analytics

---

### **10. Retail Metrics Routes** (`/api/retail`)

```javascript
GET    /api/retail/dashboard       → Retail dashboard data
GET    /api/retail/sales           → Sales analytics
GET    /api/retail/inventory       → Inventory status
GET    /api/retail/forecast        → Sales forecast
```

**Features:**

- ✅ Retail-specific metrics
- ✅ Sales analytics
- ✅ Inventory tracking
- ✅ Forecasting

---

### **11. Webhook Routes** (`/api/webhook`)

```javascript
POST   /api/webhook/:id            → Webhook receiver
GET    /api/webhook/list           → List webhooks
POST   /api/webhook/register       → Register webhook
DELETE /api/webhook/:id            → Delete webhook
```

**Features:**

- ✅ Webhook management
- ✅ External integrations
- ✅ Event handling

---

### **12. User Routes** (`/api/users`)

```javascript
GET    /api/users                  → List users
GET    /api/users/:id              → Get user
PUT    /api/users/:id              → Update user
DELETE /api/users/:id              → Delete user
PUT    /api/users/:id/role         → Update role
```

**Features:**

- ✅ User management
- ✅ Role-based access
- ✅ Profile updates

---

### **13. Scraper Routes** (`/api/scraper`)

```javascript
POST   /api/scraper/start          → Start scraper
GET    /api/scraper/status         → Scraper status
POST   /api/scraper/stop           → Stop scraper
GET    /api/scraper/data           → Get scraped data
```

**Features:**

- ✅ Python integration
- ✅ Data scraping
- ✅ Automation support

---

## 🔌 WEBSOCKET SERVICES

### **Socket.io** (Port 3001)

```javascript
Connection: ws://localhost:3001
Namespaces: /
Events:
  - connection
  - disconnect
  - message
  - notification
  - update
```

**Features:**

- ✅ Real-time communication
- ✅ Room management
- ✅ Event broadcasting
- ✅ Client tracking

### **Native WebSocket** (Port 3001/ws)

```javascript
Connection: ws://localhost:3001/ws
Protocol: Native WebSocket (RFC 6455)
```

**Features:**

- ✅ Low-level WebSocket
- ✅ Health checks
- ✅ Testing support

---

## 📦 DEPENDENCIES (46 packages)

### **Core Framework**

```json
express: 4.18.2              → Web framework
http: built-in               → HTTP server
cors: 2.8.5                  → CORS middleware
dotenv: 16.6.1               → Environment variables
```

### **Authentication & Security**

```json
jsonwebtoken: 9.0.0          → JWT tokens
bcrypt: 5.1.0                → Password hashing
speakeasy: 2.0.0             → MFA (TOTP)
helmet: 7.0.0                → Security headers
rate-limiter-flexible: 2.4.1 → Rate limiting
express-validator: 7.0.1     → Input validation
```

### **Google APIs**

```json
googleapis: 118.0.0          → Google APIs client
                             → Sheets API v4
                             → Drive API v3
                             → Apps Script API
```

### **WebSocket**

```json
socket.io: 4.8.1             → Socket.io server
ws: 8.18.3                   → Native WebSocket
```

### **Email & Notifications**

```json
@sendgrid/mail: 8.1.6        → Email service
nodemailer: 6.9.3            → Email fallback
```

### **File & Data Processing**

```json
multer: 1.4.5-lts.1          → File uploads
form-data: 4.0.5             → Form data handling
compression: 1.7.4           → Response compression
axios: 1.13.2                → HTTP client
```

### **Utilities**

```json
morgan: 1.10.0               → Request logging
qrcode: 1.5.4                → QR code generation
chart.js: 4.5.1              → Charts/graphs
```

### **Development Tools**

```json
nodemon: 3.1.9               → Auto-restart
jest: 29.5.0                 → Testing
supertest: 6.3.3             → API testing
prettier: 2.8.8              → Code formatting
eslint: 8.42.0               → Linting
```

---

## 🔐 SECURITY FEATURES

### **Authentication**

- ✅ JWT token-based authentication
- ✅ bcrypt password hashing (10 rounds)
- ✅ Session management with expiration
- ✅ MFA support (TOTP)
- ✅ SSO integration (Google, Microsoft, GitHub)

### **Authorization**

- ✅ Role-based access control (RBAC)
- ✅ Protected routes with middleware
- ✅ User permissions system

### **Security Measures**

- ✅ CORS configuration
- ✅ Helmet security headers
- ✅ Rate limiting (100 req/min for AI routes)
- ✅ Input validation
- ✅ SQL injection prevention
- ✅ XSS protection

### **Audit & Monitoring**

- ✅ Complete audit logging
- ✅ User action tracking
- ✅ File-based audit trail
- ✅ Session cleanup (hourly)

---

## 📊 SERVICE ARCHITECTURE

### **Service Layer Pattern**

```javascript
Routes → Middleware → Services → External APIs
         (Auth)      (Business   (Google, etc.)
                     Logic)
```

### **Services Breakdown**

#### **1. authService.js** - Authentication Core

```javascript
Functions:
- createUser()              → Register new user
- authenticateUser()        → Login validation
- generateToken()           → JWT token generation
- verifyToken()             → Token validation
- setupMFA()                → MFA configuration
- verifyMFA()               → MFA validation
- cleanupExpiredSessions()  → Session cleanup (auto, hourly)
```

**Demo Accounts:**

```
Admin: admin@mia.vn / admin123 (role: admin)
User: user@mia.vn / user123 (role: user)
```

#### **2. googleSheetsService.js** - Sheets Integration

```javascript
Functions:
- initialize()              → Service initialization
- getSheetData()            → Read sheet data
- appendRow()               → Add new row
- updateCell()              → Update cell value
- batchUpdate()             → Batch operations
- createSheet()             → Create new sheet
- getMetadata()             → Sheet metadata
```

#### **3. googleDriveService.js** - Drive Integration

```javascript
Functions:
- listFiles()               → List files in folder
- uploadFile()              → Upload file
- downloadFile()            → Download file
- deleteFile()              → Delete file
- createFolder()            → Create folder
- searchFiles()             → Search functionality
```

#### **4. socketService.js** - Real-time Communication

```javascript
Functions:
- init(server)              → Initialize Socket.io
- emit(event, data)         → Emit event
- broadcast(event, data)    → Broadcast to all
- join(room)                → Join room
- leave(room)               → Leave room
```

#### **5. alertService.js** - Notifications

```javascript
Functions:
- sendEmail()               → SendGrid email
- sendTelegram()            → Telegram notification
- createAlert()             → Create alert
- getAlerts()               → Fetch alerts
```

#### **6. auditService.js** - Audit Logging

```javascript
Functions:
- logAction()               → Log user action
- getAuditLogs()            → Retrieve logs
- searchLogs()              → Search audit trail
```

#### **7. ssoService.js** - SSO Integration

```javascript
Providers:
- Google OAuth 2.0
- Microsoft OAuth 2.0
- GitHub OAuth

Functions:
- getAuthUrl(provider)      → Get OAuth URL
- handleCallback()          → Process callback
- exchangeToken()           → Exchange code for token
```

#### **8. encryptionService.js** - Security Utils

```javascript
Functions:
- encrypt()                 → Encrypt data
- decrypt()                 → Decrypt data
- hash()                    → Hash password
- compare()                 → Compare hash
```

#### **9. wsService.js** - Native WebSocket

```javascript
Functions:
- init(server)              → Initialize WS server
- broadcast()               → Broadcast message
- send()                    → Send to client
```

---

## 🏥 HEALTH CHECK ENDPOINT

### **Comprehensive Health Check** (`GET /health`)

```javascript
Response Structure:
{
  "status": "healthy",              // healthy | degraded | unhealthy
  "timestamp": "2026-01-19T...",
  "timestampFormatted": "19/01/2026 06:23:14",
  "version": "1.0.0",
  "services": {
    "googleSheets": {
      "status": "healthy",
      "message": "Connected",
      "functions": {...},           // Available functions
      "metadata": {...}             // Sheet info
    },
    "googleDrive": {
      "status": "healthy",
      "message": "Connected",
      "files": 247,
      "storage": "2.3GB"
    },
    "authentication": {
      "status": "healthy",
      "activeSessions": 2
    },
    "websocket": {
      "status": "healthy",
      "connections": 5
    }
  },
  "errors": []                      // Array of errors if any
}
```

---

## 🚀 SCRIPTS & COMMANDS

### **Development Scripts**

```bash
npm start              → Start production server
npm run dev            → Start with nodemon (auto-restart)
npm test               → Run Jest tests
npm run test:ws        → Test WebSocket connection
npm run test:ws:health → WebSocket health check
```

### **Code Quality**

```bash
npm run format         → Format code with Prettier
npm run lint           → Run ESLint
npm run lint:check     → Lint with max warnings = 0
```

### **Testing**

```bash
node test-google-auth.js    → Test Google authentication
node test-websocket.js      → Test WebSocket functionality
node check_env.js           → Verify environment variables
```

---

## 📈 PERFORMANCE FEATURES

### **Optimizations**

- ✅ Response compression (gzip)
- ✅ Request logging (Morgan)
- ✅ Rate limiting per route
- ✅ Session cleanup (automatic, hourly)
- ✅ In-memory rate limit cache
- ✅ Connection pooling

### **Monitoring**

- ✅ Health check endpoint
- ✅ Request/response logging
- ✅ Error tracking
- ✅ Audit trail

---

## ⚠️ ISSUES & RECOMMENDATIONS

### **Current Issues**

1. **Email Service Not Configured** ⚠️

   ```
   Status: SendGrid API key not set
   Impact: Email notifications won't work
   Fix: Set SENDGRID_API_KEY in .env
   ```

2. **Empty Config Directory** ⚠️

   ```
   Location: backend/config/
   Issue: No configuration files
   Recommendation: Add config files for different environments
   ```

3. **Minimal Testing** ⚠️

   ```
   Tests: Only 1 test file (testAlerts.js)
   Coverage: Unknown
   Recommendation: Add comprehensive test suites
   ```

4. **No API Documentation** ⚠️
   ```
   Issue: No Swagger/OpenAPI docs
   Recommendation: Add API documentation (Swagger UI)
   ```

### **Recommendations**

1. **Add API Documentation**

   ```bash
   npm install swagger-ui-express swagger-jsdoc
   ```

   → Generate interactive API docs

2. **Add More Tests**

   ```
   Create tests for:
   - All routes
   - All services
   - Authentication flows
   - Error handling
   ```

3. **Environment Configuration**

   ```
   Create config files:
   - config/development.js
   - config/production.js
   - config/test.js
   ```

4. **Database Integration**

   ```
   Current: In-memory storage
   Recommendation: Add persistent database
   - MongoDB for flexibility
   - PostgreSQL for reliability
   ```

5. **Logging Enhancement**

   ```bash
   npm install winston
   ```

   → Structured logging with log levels

6. **Error Handling**
   ```
   Add centralized error handler
   Add error tracking (Sentry)
   ```

---

## 🎯 BACKEND SUMMARY

### **Strengths** ✅

- Complete authentication system (JWT, MFA, SSO)
- Google APIs fully integrated (Sheets, Drive)
- Real-time communication (Socket.io + Native WS)
- Security features (rate limiting, CORS, helmet)
- Audit logging system
- Clean service layer architecture
- Comprehensive health checks

### **Weaknesses** ⚠️

- No persistent database
- Minimal test coverage
- No API documentation
- Email service not configured
- Limited error tracking
- No environment-based config

### **Priority Improvements** 🎯

1. ✅ Add persistent database (MongoDB/PostgreSQL)
2. ✅ Create API documentation (Swagger)
3. ✅ Add comprehensive tests (Jest + Supertest)
4. ✅ Configure email service (SendGrid)
5. ✅ Add structured logging (Winston)
6. ✅ Add error tracking (Sentry)
7. ✅ Environment-based configuration

---

## 📚 NEXT STEPS

### **Immediate Actions**

1. Configure SendGrid email service
2. Add Swagger API documentation
3. Create comprehensive test suites
4. Set up environment configs

### **Short-term Goals**

1. Add database integration
2. Enhance error handling
3. Add structured logging
4. Improve monitoring

### **Long-term Goals**

1. Microservices architecture
2. API rate limiting per user
3. Caching layer (Redis)
4. Performance optimization

---

**Backend is production-ready** ✅ with room for improvements in testing, documentation, and database integration.

For detailed questions about specific components, let me know! 🚀
