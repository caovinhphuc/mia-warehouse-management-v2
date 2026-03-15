# TESTING GUIDE - MIA Warehouse Management

Cap nhat: 2026-03-14

Tai lieu nay la ban huong dan testing chuan hoa de team co the van hanh ngay cho du an. Noi dung duoc dong bo voi scripts trong package.json va cau truc thu muc hien tai.

## 1) Muc tieu

- Chay duoc test nhanh de kiem tra truoc khi code/merge.
- Chay duoc test day du cho release.
- Tach ro unit, integration, e2e, health-check.
- Co checklist trien khai tren local va CI.

## 2) Pham vi test hien tai

### Frontend (Jest + Testing Library)

- Framework: `jest`, `@testing-library/react`, `@testing-library/jest-dom`.
- Config: `jest.config.js`.
- Setup: `src/setupTests.js`.
- Script chinh:
  - `npm test` -> `./scripts/test-wrapper.sh`
  - `npm run test:unit` -> `jest --watchAll=false --passWithNoTests`
  - `npm run test:coverage` -> coverage report
  - `npm run test:watch` -> watch mode

### Integration scripts (Node)

- `npm run test:google` -> `scripts/testGoogleConnection.js`
- `npm run test:telegram` -> `scripts/testTelegramConnection.js`
- `npm run test:email` -> `scripts/testEmailService.js`
- `npm run test:integration` -> google + telegram + email + `health-check:js`
- `npm run test:all` -> unit + integration

Ghi chu van hanh:

- Khi `.env` chi co placeholder hoac chua co secret that, nhom live integration se `skip` co ly do va khong lam vo gate mac dinh.
- Khi da co credentials that, loi ket noi/service van phai `fail` de bao dung trang thai tich hop.

### System / E2E

- `npm run test:e2e` -> `google-sheets-project/scripts/tests/complete_system_test.js`

### Health check

- `npm run health-check` -> shell check (`scripts/check/health.sh`)
- `npm run health-check:js` -> node health (`scripts/health-check.js`)
- `npm run verify:setup` -> alias `health-check:js`

### Python automation tests

- Thu muc: `automation/tests/`
- File tieu bieu:
  - `quick_test.py`
  - `test_webdriver.py`
  - `test_auth_system.py`
  - `test_sheets_connection.py`
  - `test_health.py`

## 3) Quick start cho dev

### 3.1 Smoke test truoc khi code

```bash
npm run health-check:js
npm run test:unit
```

### 3.2 Truoc khi push

```bash
npm run lint:check
npm run format:check
npm run test:all
```

### 3.3 Truoc khi release

```bash
npm run ci:full
```

## 4) Danh sach lenh test su dung hang ngay

| Muc dich | Lenh |
| --- | --- |
| Unit tests (non-interactive) | `npm run test:unit` |
| Unit tests + wrapper | `npm test` |
| Watch mode | `npm run test:watch` |
| Coverage | `npm run test:coverage` |
| Chi file test cu the | `npm run test:unit -- --testPathPattern=App.test` |
| Chi ten test cu the | `npm run test:unit -- --testNamePattern="renders"` |
| Google integration | `npm run test:google` |
| Telegram integration | `npm run test:telegram` |
| Email integration | `npm run test:email` |
| Full integration | `npm run test:integration` |
| Full test gate | `npm run test:all` |
| E2E system test | `npm run test:e2e` |
| Health shell | `npm run health-check` |
| Health node | `npm run health-check:js` |

## 5) Cau truc thu muc test

```text
src/
  App.test.js
  setupTests.js
  components/**/__tests__/*.test.jsx
  services/**/__tests__/*.test.js

scripts/
  testGoogleConnection.js
  testTelegramConnection.js
  testEmailService.js
  health-check.js
  check/health.sh

automation/tests/
  quick_test.py
  test_*.py

google-sheets-project/scripts/tests/
  complete_system_test.js
  integration_test.js
  end_to_end_test.js
  ws-test.js
```

## 6) Dieu kien moi truong truoc khi chay integration

Can co file `.env` hop le (co the copy tu `env.example`) va du cac bien cho service can test.

Toi thieu de chay nhom Google:

- `GOOGLE_SERVICE_ACCOUNT_EMAIL`
- `GOOGLE_PRIVATE_KEY`
- `REACT_APP_GOOGLE_SHEETS_SPREADSHEET_ID`

Them cho telegram/email neu can:

- `TELEGRAM_BOT_TOKEN`, `TELEGRAM_CHAT_ID`
- `SENDGRID_API_KEY` hoac SMTP (`SMTP_HOST`, `SMTP_USER`, `SMTP_PASS`)

Neu cac bien tren van dang o dang placeholder local, `test:integration` se bao `skip` cho cac live check tuong ung.

## 7) Luong testing de xuat theo cap do

### Cap 1: Feature-level (khi lam task)

```bash
npm run test:unit -- --testPathPattern=<duong_dan_hoac_ten_file>
```

### Cap 2: Module-level (truoc PR)

```bash
npm run test:unit
npm run test:integration
```

### Cap 3: Release-level

```bash
npm run ci:full
```

## 8) Trien khai cho CI/CD

Du an da co script CI tong hop:

- `npm run ci:install`
- `npm run ci:lint`
- `npm run ci:test`
- `npm run ci:build`
- `npm run ci:security`
- `npm run ci:full`

### Mau pipeline toi thieu

```bash
npm ci
npm run ci:lint
npm run ci:test
npm run ci:build
```

Neu can gate bao mat:

```bash
npm run ci:security
```

## 9) Coverage va chat luong

Hien tai `jest.config.js` dang tat `coverageThreshold` de uu tien on dinh nen tang dan theo giai doan.

Moc de xuat:

- Giai doan 1: Statements >= 30%, Branches >= 20%, Functions >= 25%, Lines >= 30%
- Giai doan 2: Statements >= 50%, Branches >= 40%, Functions >= 50%, Lines >= 50%
- Giai doan 3: Statements >= 70%, Branches >= 60%, Functions >= 70%, Lines >= 70%

Bao cao coverage:

```bash
npm run test:coverage
open coverage/lcov-report/index.html
```

## 10) Quy trinh nang cap testing cho du an (de xuat)

### Dot 1 - On dinh hien trang (1-2 ngay)

- Chay `npm run test:all` tren nhanh chinh.
- Chuan hoa env cho integration.
- Chot baseline test pass + luu artifact log.

### Dot 2 - Bo sung unit tests uu tien cao (3-5 ngay)

- Uu tien auth flow, routing, service quan trong.
- Bo ignored tests khi da fix mock/phu thuoc.
- Dat moc coverage Giai doan 1.

### Dot 3 - Hardening CI (2-3 ngay)

- Bat gate `ci:full` tren PR.
- Bat check security toi thieu cho branch release.
- Luu report coverage va health theo ngay.

### Dot 4 - E2E va regression pack (1-2 tuan)

- Dong bo bo test trong `google-sheets-project/scripts/tests/`.
- Chia nhom smoke/regression/full de toi uu thoi gian chay.
- Dat moc coverage Giai doan 2 va huong toi Giai doan 3.

## 11) Checklist "Definition of Done" cho PR

- [ ] `npm run lint:check` pass
- [ ] `npm run format:check` pass
- [ ] `npm run test:unit` pass
- [ ] Neu co anh huong service: `npm run test:integration` pass
- [ ] Neu release branch: `npm run ci:full` pass
- [ ] Co cap nhat test case cho logic moi/sua bug

## 12) Troubleshooting nhanh

### Loi do cache Jest

```bash
npm run test:unit -- --clearCache
npm run test:unit
```

### Loi do dependency

```bash
rm -rf node_modules package-lock.json
npm install
```

### Loi do service chua chay

```bash
npm run check:backend
npm run health-check
```

### Loi do env

```bash
npm run verify:setup
```

## 13) Bao tri dinh ky

Hang tuan:

- Chay `npm run test:all` va theo doi test flaky.
- Kiem tra report health/check artifacts.

Hang thang:

- Tang nhe nguong coverage (neu on dinh).
- Don dep test duplicate/obsolete.
- Rà soat test scripts trong `scripts/` va `google-sheets-project/scripts/tests/`.

## 14) Lenh de trien khai ngay (khuyen nghi)

Neu can mot quy trinh "day du va an toan" cho du an ngay bay gio, chay theo thu tu:

```bash
npm ci
npm run health-check:js
npm run test:unit
npm run test:integration
npm run test:e2e
npm run ci:build
```

Neu tat ca pass, co the coi nhu da hoan tat testing gate cho mot dot cap nhat.
