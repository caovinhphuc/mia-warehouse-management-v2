# 🧪 Complete Test Guide - MIA.vn Warehouse Management

> **Hướng dẫn testing ngắn gọn, đúng với dự án**
> **Cập nhật**: 2026-03-14

---

## 📋 TỔNG QUAN

> Nguon tai lieu chinh: `GUIDE/TESTING.md`.
> File nay la ban quick-reference cho thao tac hang ngay.

| Loại | Lệnh | Mô tả |
| --- | --- | --- |
| Frontend | `npm test` | Jest + coverage |
| Unit | `npm run test:unit` | CI-friendly |
| Integration | `npm run test:integration` | Google + Telegram + Email + health |
| All | `npm run test:all` | Unit + integration |
| E2E | `npm run test:e2e` | System E2E |
| API | `npm run test:api` | Backend health |
| Health | `npm run health-check` | System health |

---

## 🎯 QUICK START

```bash
# 1. Health check
npm run health:full

# 2. Chạy tất cả test
npm run test:all

# Hoặc từng loại
npm run test:frontend   # Frontend (Jest)
npm run test:api        # Backend API
npm run test:integration # Services
npm run test:e2e        # E2E
```

---

## 📁 CẤU TRÚC TEST

### Frontend (src/)

```text
src/
├── App.test.js
├── setupTests.js
└── components/Common/__tests__/
    └── ErrorBoundary.test.jsx
```

### Scripts (scripts/)

```text
scripts/
├── testGoogleConnection.js   # npm run test:google
├── testTelegramConnection.js # npm run test:telegram
├── testEmailService.js       # npm run test:email
├── health-check.js           # npm run health-check:js
└── check/health.sh           # npm run health-check
```

### E2E (google-sheets-project)

```text
google-sheets-project/scripts/tests/
├── complete_system_test.js
├── integration_test.js
├── end_to_end_test.js
└── ws-test.js
```

### Python (automation/tests/)

```text
automation/tests/
├── quick_test.py
├── test_webdriver.py
├── test_auth_system.py
└── test_sheets_connection.py
```

---

## 🚀 LỆNH CHI TIẾT

### Frontend

```bash
npm test                          # test-wrapper (coverage)
npm run test:unit                 # Jest, non-interactive
npm run test:frontend             # = test:unit
npm run test:coverage             # Coverage report
npm run test:watch                # Watch mode
npm run test:unit -- --testPathPattern=App.test
```

### Integration & E2E

```bash
npm run test:google       # Google API
npm run test:telegram     # Telegram bot
npm run test:email        # Email service
npm run test:integration  # All 3 + health
npm run test:all          # Unit + integration
npm run test:e2e          # complete_system_test.js
npm run test:api          # Backend /health
```

Note:

- Neu `.env` chi co placeholder, live integration se skip co thong bao thay vi fail cung.
- Muon test that, can thay bang credentials hop le cho Google, Telegram, Email.

### Health

```bash
npm run health-check      # Shell (ports, services, Docker)
npm run health-check:js   # Node.js health
npm run health:full       # = health-check
npm run verify:setup      # = health-check:js
npm run check:backend     # curl localhost:3001/health
npm run check:ports       # Port config
```

### Python

```bash
cd automation/tests
python quick_test.py
python test_webdriver.py
python test_auth_system.py
```

---

## ⚙️ YÊU CẦU

| Service    | Port |
| ---------- | ---- |
| Frontend   | 3000 |
| Backend    | 3001 |
| AI Service | 8000 |

```bash
# Start services
npm run start:frontend
npm run start:backend
# hoặc
npm run start:all
```

---

## 📊 COVERAGE

```bash
npm run test:coverage
open coverage/lcov-report/index.html
```

---

## 🔧 TROUBLESHOOTING

```bash
# Clear Jest cache
npm run test:unit -- --clearCache

# Reinstall
rm -rf node_modules package-lock.json && npm install

# Check ports
npm run check:ports
```

---

## 📚 XEM THÊM

- `GUIDE/TESTING.md` - Huong dan testing chuan hoa (source of truth)
- `scripts/check/health.sh` - Health check script

---

## ✅ VERIFICATION (2026-03-14)

- [x] test:unit, test:frontend, test:coverage
- [x] test:google, test:telegram, test:email
- [x] test:integration, test:all, test:e2e, test:api
- [x] health-check, health:full, verify:setup
- [x] automation/tests/ (Python)
- [x] google-sheets-project/scripts/tests/ (E2E)
