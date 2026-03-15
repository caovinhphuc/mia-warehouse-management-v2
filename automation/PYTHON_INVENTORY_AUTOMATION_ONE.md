# Python Inventory: automation vs one_automation_system

## 1) Scope va cach thong ke

- Pham vi: thu muc `automation/` va `automation/one_automation_system/`.
- Da loai tru: `venv/`, `__pycache__/`.
- So luong file `.py`:
  - Tong trong `automation/`: **62**
  - Trong `automation/one_automation_system/`: **6**
  - Ngoai `one_automation_system` (thuoc `automation`): **56**

Luu y: danh sach 62 file cua `automation/` da bao gom 6 file trong `one_automation_system`.

---

## 2) Ket luan nhanh (de ra quyet dinh)

- `automation/` la he tong lon, gom nhieu nhanh: scraper, scheduler, dashboard, Google Sheets, test, bridge API.
- `automation/one_automation_system/` la package con chuyen cho ONE, co bo file gon va de tach deploy rieng.
- Hai khu vuc **co trung lap chuc nang** (dang nhap/scrape/cau hinh), nhat la giua:
  - `automation/config/*.py`
  - `automation/scripts/*.py`
  - `automation/src/*.py`
  - `automation/one_automation_system/*.py`

---

## 3) Chi tiet one_automation_system (6 file Python)

### 3.1 Runtime core

| File | Vai tro | Khi dung |
|---|---|---|
| `automation/one_automation_system/automation.py` | Core Selenium workflow (dang nhap, scrape, xu ly, schedule) | Chay automation chinh |
| `automation/one_automation_system/automation_bridge.py` | FastAPI bridge de frontend/backend goi automation | Khi can REST bridge |

### 3.2 API layer (Flask)

| File | Vai tro | Ghi chu |
|---|---|---|
| `automation/one_automation_system/api/api_server.py` | Flask API server tong hop, tra status/dashboard endpoint | API tong quan |
| `automation/one_automation_system/api/auth_api_server.py` | Flask auth API cho frontend | Tach rieng cho auth flow |
| `automation/one_automation_system/api/index.py` | Entrypoint serverless (Vercel), fallback app | Ban chinh cho serverless |
| `automation/one_automation_system/api/index copy.py` | Ban sao cua `index.py` | Nen xac nhan co can giu hay xoa |

Nhan xet:

- `one_automation_system` hien la bo mini-product co the chay rieng.
- Co kha nang dang ton tai 2 kieu bridge/API song song: FastAPI (`automation_bridge.py`) va Flask (`api/*.py`).

---

## 4) Chi tiet automation (ngoai one_automation_system)

## 4.1 Core automation scripts (entrypoint/runner)

- `automation/one_automation.py`
- `automation/one_automation_once.py`
- `automation/automation_enhanced.py`
- `automation/automation_by_date.py`
- `automation/run_complete_automation.py`
- `automation/run_automation_with_logging.py`
- `automation/run_all_demo.py`

Vai tro:

- Day la cac kieu run khac nhau cho cung nghiep vu scrape/processing.
- `*_enhanced`, `*_by_date`, `*_once` cho thay dang co nhieu bien the chay.

## 4.2 Dashboard/monitoring/report

- `automation/dashboard.py`
- `automation/dashboard_integration.py`
- `automation/generate_summary.py`
- `automation/sla_monitor.py`
- `automation/ui_debug_inspector.py`
- `automation/notifier.py`

Vai tro:

- Bao cao tong hop, giam sat SLA, thong bao, debug UI.

## 4.3 Google Sheets / Drive integration

- `automation/drive_uploader.py`
- `automation/modules/google_service.py`
- `automation/modules/google_sheets_service.py`
- `automation/modules/google_sheets_config.py`
- `automation/modules/inspect_sheets_data.py`
- `automation/modules/verify_sheets.py`
- `automation/modules/ google_sheets_connector.py`  (luu y: ten file co dau cach o dau)

Vai tro:

- Ket noi va dong bo du lieu giua automation va Google Sheets/Drive.

## 4.4 Selenium/browser helpers

- `automation/modules/install_chromedriver.py`
- `automation/modules/bypass_chromedriver.py`
- `automation/verify_one_tga.py`
- `automation/verify_authentication_and_user.py`

Vai tro:

- Cai dat/troubleshoot WebDriver, verify dang nhap one.tga.

## 4.5 Cau hinh va workflow duplicate theo nhom

### Nhom `config/`

- `automation/config/setup.py`
- `automation/config/login.py`
- `automation/config/login_manager.py`
- `automation/config/pagination_handler.py`
- `automation/config/enhanced_scraper.py`
- `automation/config/date_customizer.py`
- `automation/config/initialization.py`
- `automation/config/backup/automation_backup.py`

### Nhom `scripts/` (trung ten voi config)

- `automation/scripts/setup.py`
- `automation/scripts/login.py`
- `automation/scripts/login_manager.py`
- `automation/scripts/pagination_handler.py`
- `automation/scripts/enhanced_scraper.py`
- `automation/scripts/date_customizer.py`
- `automation/scripts/initialization.py`

Nhan xet:

- Co nhieu file trung ten/chuc nang giua `config/` va `scripts/`.
- Nen xac dinh 1 nguon su that (single source of truth).

## 4.6 Nhanh `src/` (kien truc package hoa)

- `automation/src/main.py`
- `automation/src/automation.py`
- `automation/src/automation_bridge.py`
- `automation/src/config/settings.py`
- `automation/src/modules/data_processor.py`
- `automation/src/modules/scheduler.py`
- `automation/src/utils/logger.py`
- `automation/src/utils/utils.py`

Vai tro:

- Day la huong to chuc code theo package/module ro rang hon.
- Co trung lap voi script goc o thu muc `automation/`.

## 4.7 Test files

- `automation/tests/auth_service.py`
- `automation/tests/quick_test.py`
- `automation/tests/system_check.py`
- `automation/tests/test_auth_system.py`
- `automation/tests/test_google_sheets_verification.py`
- `automation/tests/test_health.py`
- `automation/tests/test_sheets_connection.py`
- `automation/tests/test_webdriver.py`

Vai tro:

- Kiem thu auth, health, webdriver, ket noi sheets.

---

## 5) Diem trung lap va can don

## 5.1 Trung ten file (high risk gay nham)

- `automation.py`
- `automation_bridge.py`
- `setup.py`
- `login.py`
- `login_manager.py`
- `pagination_handler.py`
- `enhanced_scraper.py`
- `date_customizer.py`
- `initialization.py`

Y nghia:

- Cung ten xuat hien o nhieu noi (`config/`, `scripts/`, `src/`, `one_automation_system/`) de gay nham entrypoint.

## 5.2 API/Bridge da dang stack

- FastAPI: `automation/one_automation_system/automation_bridge.py`, `automation/src/main.py`
- Flask: `automation/one_automation_system/api/api_server.py`, `automation/one_automation_system/api/auth_api_server.py`

Y nghia:

- Can chot stack phuc vu runtime chinh (FastAPI hoac Flask) de tranh van hanh 2 huong song song.

---

## 6) Thu tu uu tien su dung (de van hanh on dinh)

1. Runtime chinh de bat dau:
   - `automation/one_automation_system/automation.py`
   - `automation/one_automation_system/automation_bridge.py`
2. API bo tro (neu can):
   - `automation/one_automation_system/api/auth_api_server.py`
   - `automation/one_automation_system/api/api_server.py`
3. Cong cu kiem tra/verify:
   - `automation/verify_one_tga.py`
   - `automation/tests/*`
4. Nhanh duplicate (`config/`, `scripts/`, `src/`) can quy hoach tiep.

---

## 7) De xuat sap xep lai (phase 1, khong doi logic)

- Chon 1 duong code chinh: uu tien `automation/one_automation_system/`.
- Danh dau `automation/config/` va `automation/scripts/` la legacy neu khong con duoc goi.
- Gop `index copy.py` vao `index.py` (neu khong can ban du phong).
- Chuan hoa ten file `automation/modules/ google_sheets_connector.py` thanh khong co dau cach dau ten.
- Bo sung README mo ta ro:
  - file nao la entrypoint chinh,
  - file nao la utility,
  - file nao la legacy.

---

## 8) Checklist xac nhan truoc khi clean

- [ ] Xac dinh lenh run dang dung trong production/dev.
- [ ] Xac dinh backend/front-end dang goi bridge nao (Flask hay FastAPI).
- [ ] Chot source of truth cho login/scraper modules.
- [ ] Chot danh sach file duoc phep xoa/archive.

---

Generated: 2026-03-15
Scope: automation + one_automation_system (Python inventory)
