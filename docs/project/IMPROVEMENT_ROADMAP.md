# MIA Warehouse Management V2 — Lộ Trình Cải Thiện

> Phân tích toàn diện và kế hoạch nâng cấp hệ thống
> Cập nhật: 2026-03-13

---

## Tổng Quan Đánh Giá Hiện Tại

| Tiêu chí | Điểm | Ghi chú |
|----------|------|---------|
| Kiến trúc | 8/10 | Modular tốt, thiếu DB layer |
| Security | 7/10 | JWT/RBAC ổn, in-memory nguy hiểm |
| Performance | 7.5/10 | Build tốt, thiếu caching/pagination |
| Code Quality | 7/10 | Inconsistent TS, nhiều TODOs |
| Documentation | 8.5/10 | Nhiều docs, một số lỗi thời |
| Testing | 5/10 | Setup có, coverage gần như 0 |
| **Tổng** | **7.2/10** | **Nền tốt, chưa sẵn sàng production** |

---

## Ưu Tiên 1 — Ổn Định Hóa (Bắt Buộc Trước Production)

### 1.1 Fix Jest Config Syntax Error

**Vấn đề:** `jest.config.js` có duplicate sections từ dòng 136 gây syntax error — file kết thúc sai, có code thừa sau dấu `}`

**Giải pháp:** Xóa phần duplicate (dòng 136–165), giữ nguyên phần hợp lệ

**File:** `jest.config.js`
**Trạng thái:** ✅ Đã fix

---

### 1.2 JWT Secret Security

**Vấn đề:** Hardcoded fallback `"your-secret-key-change-in-production"` trong `middleware/auth.js` và `authService`

```js
// ❌ Hiện tại — nguy hiểm
const JWT_SECRET = process.env.JWT_SECRET || "your-secret-key-change-in-production";
```

**Giải pháp:** Throw error rõ ràng nếu `JWT_SECRET` không được cấu hình trong production

```js
// ✅ Sau khi fix
if (!process.env.JWT_SECRET && process.env.NODE_ENV === 'production') {
  throw new Error('JWT_SECRET must be set in production environment');
}
const JWT_SECRET = process.env.JWT_SECRET || 'dev-only-secret-do-not-use-in-prod';
```

**File:** `backend/middleware/auth.js`
**Trạng thái:** ✅ Đã fix

---

### 1.3 Password Hashing — SHA256 → bcrypt

**Vấn đề:** `authService.js` dùng SHA256 đơn giản để hash password — không an toàn (rainbow table attacks)

```js
// ❌ Hiện tại — không đủ bảo mật
const hashPassword = (password) => {
  return crypto.createHash("sha256").update(password).digest("hex");
};
```

**Giải pháp:** Dùng bcrypt (đã có trong dependencies) với 12 rounds

```js
// ✅ Sau khi fix
const bcrypt = require('bcrypt');
const BCRYPT_ROUNDS = parseInt(process.env.BCRYPT_ROUNDS) || 12;
const hashPassword = async (password) => bcrypt.hash(password, BCRYPT_ROUNDS);
const comparePassword = async (password, hash) => bcrypt.compare(password, hash);
```

**File:** `backend/services/authService.js`
**Trạng thái:** ✅ Đã fix

---

### 1.4 Persistence Layer — JSON File Store

**Vấn đề:** Users, sessions, MFA secrets lưu trong `Map()` in-memory → mất hết khi restart server

```
// ❌ Hiện tại - mất data khi restart
const users = new Map();
const mfaSecrets = new Map();
const sessions = new Map();
```

**Giải pháp:** JSON file-based persistence (bước đệm trước khi migrate sang PostgreSQL)

- `backend/data/users.json` — lưu users + credentials
- `backend/data/sessions.json` — lưu active sessions
- `backend/data/mfa-secrets.json` — lưu MFA secrets

Ưu điểm:

- Survive server restarts ngay lập tức
- Không cần install thêm DB
- Dễ migrate sang PostgreSQL sau này
- Data có thể backup/inspect trực tiếp

**File:** `backend/services/authService.js`, `backend/services/persistenceStore.js`
**Trạng thái:** ✅ Đã fix

---

### 1.5 Hoàn Thiện Drive Operations

**Vấn đề:** `useDriveOperations.js` có 3 TODO chưa implement: `uploadFile`, `deleteFile`, và `fetchFiles` thiếu error handling

**Giải pháp:** Implement đầy đủ với API calls đến backend (`/api/drive/`)

**File:** `src/hooks/google/useDriveOperations.js`
**Trạng thái:** ✅ Đã fix

---

## Ưu Tiên 2 — Chất Lượng Code

### 2.1 Loại Bỏ Moment.js

**Vấn đề:** Project dùng cả `moment.js` lẫn `day.js` — Moment.js nặng ~70KB gzipped, deprecated
**Giải pháp:** Xóa Moment.js, migrate toàn bộ sang Day.js
**Công việc:** Tìm tất cả `import moment from 'moment'` → thay bằng `import dayjs from 'dayjs'`

```bash
# Tìm usage
grep -r "moment" src/ --include="*.js" --include="*.jsx"
# Uninstall sau khi migrate xong
npm uninstall moment
```

---

### 2.2 Gộp Chart Libraries

**Vấn đề:** Project dùng 3 chart libraries: `Chart.js`, `react-chartjs-2`, `Recharts`
**Giải pháp:** Chọn **Recharts** (React-native, nhẹ hơn, dễ customize)
**Công việc:**

1. Audit những component nào đang dùng chart.js/react-chartjs-2
2. Migrate sang Recharts tương đương
3. `npm uninstall chart.js react-chartjs-2`

---

### 2.3 Enforce TypeScript Strict Mode

**Vấn đề:** `tsconfig.json` có nhưng không enforce, file vẫn dùng `.js/.jsx`
**Giải pháp:** Migrate dần từng module, bắt đầu từ services và types

```json
// tsconfig.json
{
  "compilerOptions": {
    "strict": true,
    "noImplicitAny": true,
    "strictNullChecks": true
  }
}
```

**Thứ tự migrate:** `types/` → `services/` → `store/` → `hooks/` → `components/`

---

### 2.4 Structured Logging

**Vấn đề:** Toàn `console.log` rải rác — không có log levels, không có rotation
**Giải pháp:** Dùng `winston` với log levels và rotation

```bash
npm install winston winston-daily-rotate-file
```

```js
// backend/utils/logger.js
const winston = require('winston');
const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || 'info',
  format: winston.format.combine(winston.format.timestamp(), winston.format.json()),
  transports: [
    new winston.transports.Console(),
    new winston.transports.DailyRotateFile({ filename: 'logs/app-%DATE%.log' })
  ]
});
```

---

### 2.5 Gộp ESLint Config

**Vấn đề:** Tồn tại cả `eslint.config.js` lẫn `eslint.config.mjs`
**Giải pháp:** Giữ `eslint.config.mjs` (ESM format, chuẩn mới), xóa `eslint.config.js`

---

## Ưu Tiên 3 — Tính Năng & UX

### 3.1 Implement SSO

**Vấn đề:** Config có `VITE_MICROSOFT_CLIENT_ID`, `VITE_GITHUB_CLIENT_ID` nhưng chưa có code
**Giải pháp:** Dùng `passport.js` với strategies cho Microsoft và GitHub OAuth

```bash
npm install passport passport-microsoft passport-github2
```

Routes cần thêm:

- `GET /api/auth/microsoft` → redirect to Microsoft
- `GET /api/auth/microsoft/callback` → handle OAuth callback
- `GET /api/auth/github` → redirect to GitHub
- `GET /api/auth/github/callback` → handle OAuth callback

---

### 3.2 Design System Thống Nhất

**Vấn đề:** CSS rải rác khắp components, Ant Design tokens chưa được custom hóa
**Giải pháp:**

1. Tạo `src/theme/tokens.js` — centralize tất cả design tokens
2. Configure Ant Design `ConfigProvider` ở `App.jsx`
3. Migrate hardcoded colors/spacing sang CSS variables

```js
// src/theme/tokens.js
export const tokens = {
  colorPrimary: '#1890ff',
  colorBrand: '#FF6B35',
  borderRadius: 8,
  // ...
};
```

---

### 3.3 API Documentation với Swagger

```bash
npm install swagger-jsdoc swagger-ui-express
```

Thêm vào `backend/server.js`:

```js
const swaggerUi = require('swagger-ui-express');
app.use('/api/docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));
```

---

### 3.4 Pagination cho Google Sheets

**Vấn đề:** Load toàn bộ data từ Sheets mỗi request — slow với data lớn
**Giải pháp:** Thêm `offset` + `limit` vào Sheets API calls, implement cursor-based pagination ở frontend

---

## Ưu Tiên 4 — Scale & Observability

### 4.1 Redis Rate Limiting

**Vấn đề:** `rateLimitMap` in-memory — reset khi restart, không work với multiple instances
**Giải pháp:** Dùng `rate-limiter-flexible` với Redis backend (đã install!)

```js
const { RateLimiterRedis } = require('rate-limiter-flexible');
const rateLimiter = new RateLimiterRedis({
  storeClient: redisClient,
  keyPrefix: 'middleware',
  points: 100,
  duration: 60,
});
```

---

### 4.2 Error Tracking với Sentry

```bash
npm install @sentry/node @sentry/react
```

- Frontend: Catch React errors, performance monitoring
- Backend: Catch unhandled errors, trace API calls

---

### 4.3 Database Migration (PostgreSQL)

**Bước cuối cùng:** Migrate từ JSON file store → PostgreSQL

```bash
npm install pg drizzle-orm  # hoặc prisma
```

Schema cần tạo:

```sql
CREATE TABLE users (id UUID PRIMARY KEY, email VARCHAR UNIQUE, ...);
CREATE TABLE sessions (id UUID PRIMARY KEY, user_id UUID REFERENCES users, ...);
CREATE TABLE mfa_secrets (user_id UUID PRIMARY KEY REFERENCES users, ...);
CREATE TABLE audit_logs (id SERIAL, user_id UUID, action VARCHAR, ...);
```

---

## Checklist Trước Khi Production

```
Security
[ ] JWT_SECRET được set và đủ mạnh (min 32 chars)
[ ] Không có credentials hardcode trong source code
[ ] CORS chỉ allow trusted origins
[ ] Rate limiting hoạt động đúng
[ ] HTTPS enforce (redirect HTTP → HTTPS)
[ ] Helmet.js đã enable

Data Integrity
[ ] Users/sessions persist qua restarts
[ ] Backup strategy cho Google Sheets
[ ] Error logging đủ để debug production issues

Testing
[ ] Auth routes có test coverage
[ ] Critical business logic có unit tests
[ ] CI chạy tests trước khi deploy

Performance
[ ] Bundle size < 500KB gzipped
[ ] Lighthouse score > 80
[ ] API response time < 500ms (p95)
```

---

## Timeline Đề Xuất

| Sprint | Ưu tiên | Estimated effort |
|--------|---------|-----------------|
| Sprint 1 (1 tuần) | Ưu tiên 1 hoàn tất | 3-5 ngày |
| Sprint 2 (1 tuần) | Ưu tiên 2 (logging, TypeScript cơ bản) | 4-5 ngày |
| Sprint 3 (2 tuần) | Ưu tiên 3 (SSO, Design System) | 8-10 ngày |
| Sprint 4 (1 tuần) | Ưu tiên 4 (PostgreSQL migration) | 5-7 ngày |

---

*Tài liệu này được tạo tự động từ phân tích codebase. Cập nhật khi hoàn thành từng hạng mục.*
