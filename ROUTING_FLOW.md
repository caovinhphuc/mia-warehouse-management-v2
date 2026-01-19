# 🔄 ROUTING & FLOW ANALYSIS

**Last Updated:** January 19, 2026  
**Current Status:** ✅ Frontend & Backend đều đang chạy - System READY

---

## 📊 CURRENT STATE

### URL hiện tại

```
http://localhost:3000/login#forgot
```

### Service Status

```
✅ Frontend (Vite): Running on port 3000
✅ Backend (Express): Running on port 3001
✅ Socket.io WebSocket: Ready
✅ Native WebSocket (WS): Ready on ws://localhost:3001/ws
⚠️ Email service: Not configured (không ảnh hưởng login)
```

### Demo Accounts (Auto-created)

```
Admin Account:
- Email: admin@mia.vn
- Password: admin123

User Account:
- Email: user@mia.vn
- Password: user123
```

### Backend Endpoints Available

```
✅ http://localhost:3001/health - Health check
✅ http://localhost:3001/api/ai/* - AI endpoints
✅ http://localhost:3001/api/auth/* - Authentication
✅ http://localhost:3001/api/sheets/* - Google Sheets
✅ http://localhost:3001/api/drive/* - Google Drive
✅ ws://localhost:3001/ws - WebSocket connection
```

---

## 🗺️ ROUTING STRUCTURE

### 1. Frontend Routes (React Router v6)

#### **Public Routes (Không cần Layout)**

```jsx
/login → Login Component (không có Layout wrapper)
```

#### **Protected Routes (Có Layout + Auth Required)**

```jsx
/ → Home (public, có Layout)
/dashboard → LiveDashboard (protected)
/ai-analytics → AIDashboard (protected)
/retail → MIARetailDashboard (protected)
/google-sheets → GoogleSheetsIntegration (protected)
/google-drive → GoogleDriveIntegration (protected)
/google-apps-script → GoogleAppsScriptIntegration (protected)
/telegram → TelegramIntegration (protected)
/automation → AutomationDashboard (protected)
/alerts → AlertsManagement (protected)
/advanced-analytics → AdvancedAnalyticsDashboard (protected)
/smart-automation → SmartAutomationDashboard (protected)
/nlp → NLPDashboard (protected)
/security → SecurityDashboard (protected)
/* → Redirect to / (404 fallback)
```

### 2. Backend Routes (Express API)

#### **Port:** 3001 (NOT RUNNING ❌)

#### **API Endpoints:**

```javascript
/api/ai/* → AI Routes (rate limited: 100 req/min)
/api/sheets/* → Google Sheets Routes
/api/drive/* → Google Drive Routes
/api/alerts/* → Alert Routes
/api/scripts/* → Apps Script Routes
/api/automation/* → Automation Routes
/api/custom-metrics/* → Custom Metrics Routes
/api/retail-metrics/* → Retail Metrics Routes
/api/auth/* → Authentication Routes
```

---

## 🔐 AUTHENTICATION FLOW

### Login Flow (Current Implementation)

```
1. User truy cập /login
   ↓
2. Component: Login.jsx renders
   ↓
3. User nhập email + password
   ↓
4. handleSubmit() được gọi
   ↓
5. Validation email/password format
   ↓
6. [❌ FAILED] Call loginUser() → Backend API
   ↓
   Backend không chạy → Error
   ↓
7. Error Alert hiển thị:
   "Không thể kết nối đến backend server tại http://localhost:3001"

   Hướng dẫn khắc phục:
   - Mở terminal và chạy: cd backend && npm start
   - Đảm bảo backend đang chạy trên port 3001
   - Kiểm tra console để xem lỗi chi tiết
```

### Expected Login Flow (When Backend Running)

```
1. User truy cập /login
   ↓
2. Login.jsx renders
   ↓
3. User nhập credentials
   ↓
4. handleSubmit() → loginUser(email, password)
   ↓
5. POST /api/auth/login
   ↓
6. Backend xử lý:
   - Kiểm tra one.tga.com.vn (if enabled)
   - Validate credentials
   - Generate JWT token
   - Create session
   ↓
7. Response có 3 cases:

   Case A: MFA Required
   ↓
   Navigate to /security with MFA state

   Case B: Login Success
   ↓
   - Store token in localStorage
   - Store sessionId in localStorage
   - Dispatch LOGIN_SUCCESS to Redux
   - Navigate to returnUrl or /

   Case C: Login Failed
   ↓
   - Show error message
   - Display detailed error info
```

### Protected Route Flow

```
1. User truy cập protected route (vd: /dashboard)
   ↓
2. ProtectedRoute component wrapper
   ↓
3. Check authentication:
   - localStorage.getItem('authToken')
   - Redux state.auth.isAuthenticated
   ↓
4. If NOT authenticated:
   - Navigate to /login?returnUrl=/dashboard
   ↓
5. If authenticated:
   - Verify session with backend:
     POST /api/auth/verify
   ↓
6. Session valid:
   - Render children (Dashboard)
   ↓
7. Session expired/invalid:
   - Clear localStorage
   - Navigate to /login
```

### SSO Login Flow

```
1. User clicks "Đăng nhập với Google/Microsoft/GitHub"
   ↓
2. handleSSOLogin(provider)
   ↓
3. Call securityService.getSSOAuthUrl(provider)
   ↓
4. Backend returns OAuth URL
   ↓
5. Redirect to OAuth provider
   ↓
6. User authenticates on provider
   ↓
7. Provider redirects back with code
   ↓
8. Backend exchanges code for token
   ↓
9. Create session & return JWT
   ↓
10. Store token & navigate to returnUrl
```

---

## 🔧 COMPONENT HIERARCHY

### App.jsx Structure

```
App
├─ Provider (Redux)
│  └─ AntdApp
│     └─ ConfigProvider (Ant Design)
│        └─ Router (React Router v6)
│           └─ Suspense (Loading fallback)
│              └─ Routes
│                 ├─ /login → Login (NO Layout)
│                 └─ LayoutWrapper
│                    ├─ Layout Component
│                    │  ├─ Header
│                    │  ├─ Sidebar
│                    │  └─ Content
│                    │     └─ Outlet
│                    └─ Routes
│                       ├─ / → Home
│                       ├─ /dashboard → ProtectedRoute → LiveDashboard
│                       ├─ /retail → ProtectedRoute → MIARetailDashboard
│                       └─ ... other protected routes
```

### Login Component Structure

```
Login.jsx
├─ State Management
│  ├─ loading (submit loading)
│  ├─ isRegister (toggle login/register)
│  ├─ error (error message)
│  └─ ssoLoading (SSO provider loading)
│
├─ Redux Integration
│  ├─ useSelector(state.auth)
│  └─ useDispatch()
│
├─ Router Integration
│  ├─ useNavigate()
│  └─ useSearchParams() → returnUrl
│
├─ Form Handling
│  ├─ Form (Ant Design)
│  ├─ Email input (validation)
│  ├─ Password input (validation)
│  ├─ Confirm Password (only register)
│  └─ Remember Me checkbox
│
└─ Auth Actions
   ├─ handleSubmit() → Login/Register
   └─ handleSSOLogin(provider) → SSO Auth
```

---

## 🐛 CURRENT ISSUES

### 1. Backend Not Running

**Problem:**

```
Backend server không chạy trên port 3001
→ Frontend không kết nối được
→ Login/Authentication fails
```

**Solution:**

```bash
# Start backend server
cd backend
npm install  # Nếu chưa install dependencies
npm start    # Start server on port 3001
```

### 2. CORS Configuration

**Current Setup:**

```javascript
cors({
  origin: process.env.FRONTEND_URL || "http://localhost:3000",
  credentials: true,
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
});
```

**Verify .env:**

```bash
# Check .env file
FRONTEND_URL=http://localhost:3000
PORT=3001
```

### 3. Auth Service Dependencies

**Backend Dependencies:**

```javascript
- authService.js → Session management
- socketService.js → WebSocket connections
- wsService.js → Native WebSocket
```

**All require backend to be running!**

---

## 🔄 UPDATE PLAN

### Immediate Actions (Priority 1)

#### 1. Start Backend Server

```bash
cd /Users/phuccao/Projects/mia-warehouse-management-v2/backend
npm start
```

#### 2. Verify Backend Health

```bash
curl http://localhost:3001/health
```

#### 3. Test Auth Endpoint

```bash
curl -X POST http://localhost:3001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@mia.vn","password":"test123"}'
```

### Improvements (Priority 2)

#### 1. Add Forgot Password Route

Currently URL shows `#forgot` but no route implementation.

**Add to App.jsx:**

```jsx
<Route path="/forgot-password" element={<ForgotPassword />} />
```

#### 2. Add Better Error Handling

Update Login component error handling:

```jsx
// Check backend health first
const checkBackend = async () => {
  try {
    await fetch("http://localhost:3001/health");
    return true;
  } catch {
    return false;
  }
};
```

#### 3. Add Service Status Indicator

Show backend status in UI:

```jsx
const [backendStatus, setBackendStatus] = useState("checking");

useEffect(() => {
  checkBackendHealth().then((status) => {
    setBackendStatus(status ? "online" : "offline");
  });
}, []);
```

### Route Enhancements (Priority 3)

#### 1. Add MFA Routes

```jsx
<Route path="/mfa" element={<MFAVerification />} />
<Route path="/mfa/setup" element={<MFASetup />} />
```

#### 2. Add Profile Routes

```jsx
<Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
<Route path="/settings" element={<ProtectedRoute><Settings /></ProtectedRoute>} />
```

#### 3. Add OAuth Callback Routes

```jsx
<Route path="/auth/google/callback" element={<OAuthCallback provider="google" />} />
<Route path="/auth/microsoft/callback" element={<OAuthCallback provider="microsoft" />} />
<Route path="/auth/github/callback" element={<OAuthCallback provider="github" />} />
```

---

## 📝 ROUTING BEST PRACTICES

### 1. Route Organization

```
✅ Public routes → No Layout
✅ Protected routes → Layout + ProtectedRoute wrapper
✅ Lazy loading → All heavy components
✅ Fallback → Navigate to / for 404
```

### 2. Protected Route Pattern

```jsx
<Route
  path="/dashboard"
  element={
    <ProtectedRoute>
      <Component />
    </ProtectedRoute>
  }
/>
```

### 3. Return URL Handling

```jsx
// When redirecting to login
navigate(`/login?returnUrl=${encodeURIComponent(currentPath)}`);

// After login success
const returnUrl = searchParams.get("returnUrl") || "/";
navigate(returnUrl);
```

### 4. Route Guards

```jsx
useEffect(() => {
  const token = localStorage.getItem("authToken");
  if (!token) {
    navigate(`/login?returnUrl=${location.pathname}`);
  }
}, []);
```

---

## 🎯 NEXT STEPS

### Immediate (Now)

1. ✅ Documented current routing structure
2. ⚠️ Start backend server
3. ⚠️ Test login flow
4. ⚠️ Verify all protected routes

### Short Term (This Week)

1. Add forgot password functionality
2. Add MFA routes
3. Add profile/settings routes
4. Add OAuth callback handlers
5. Add backend health indicator

### Long Term (Future)

1. Add route-based code splitting
2. Add route transition animations
3. Add breadcrumb navigation
4. Add route-level error boundaries
5. Add route analytics/tracking

---

## 📚 REFERENCES

### Files to Check

- **Frontend:**
  - `src/App.jsx` - Main routing config
  - `src/components/auth/Login.jsx` - Login component
  - `src/components/auth/ProtectedRoute.jsx` - Route guard
  - `src/services/securityService.js` - Auth API calls

- **Backend:**
  - `backend/server.js` - Express server
  - `backend/routes/authRoutes.js` - Auth endpoints
  - `backend/services/authService.js` - Auth logic
  - `backend/.env` - Environment config

### Commands

```bash
# Start frontend (already running)
npm start

# Start backend
cd backend && npm start

# Check ports
lsof -ti:3000  # Frontend
lsof -ti:3001  # Backend

# Test API
curl http://localhost:3001/health
```

---

**End of Routing & Flow Analysis**
