# Cấu Trúc Automation (Snapshot Hiện Tại)

> **Tài liệu tham khảo nội bộ** — Cập nhật: 2026-03-15
> Thư mục gốc: `automation/`
> Mục đích: lưu lại cấu trúc thực tế sau khi đã sửa toàn bộ lỗi path/import trong session 2026-03-15.

---

## 1) Sơ Đồ Thư Mục Hiện Tại

> Đây là cấu trúc **thực tế** của thư mục `automation/` (bỏ qua venv, **pycache**, *.pyc).

```text
automation/
│
│  ── CÁC FILE AUTOMATION CHÍNH (chạy trực tiếp) ──
├─ automation.py              # Automation tiêu chuẩn (phiên mới nhất)
├─ automation_enhanced.py     # Bản nâng cao, có SLA monitoring + product detail
├─ automation_by_date.py      # Xử lý theo khoảng ngày tùy chọn
├─ one_automation.py          # Batch xử lý 1 đơn (fresh session)
├─ one_automation_once.py     # Chạy 1 lần duy nhất, không retry
├─ run_complete_automation.py # Chạy toàn bộ pipeline với phase monitoring
│
│  ── MODULE TÍCH HỢP ──
├─ google_sheets_config.py    # ⭐ NGUỒN GỐC DUY NHẤT — tích hợp Google Sheets
├─ sla_monitor.py             # Theo dõi SLA, cảnh báo vi phạm
├─ notifier.py                # Gửi thông báo (email/Telegram)
├─ generate_summary.py        # Tạo báo cáo tóm tắt sau mỗi run
├─ dashboard.py               # Dashboard terminal (rich UI)
├─ dashboard_integration.py   # Tích hợp dashboard vào pipeline
├─ verify_one_tga.py          # Xác minh 1 đơn TGA cụ thể
├─ verify_authentication_and_user.py  # Kiểm tra xác thực user/session
│
│  ── SCRIPT KHỞI ĐỘNG ──
├─ setup.sh                   # Cài đặt môi trường ban đầu (root)
├─ setup_and_smoke_test.sh    # Setup + smoke test nhanh (dùng khi mới pull code)
├─ start.sh                   # Launcher rút gọn ở root (alias của scripts/start.sh)
├─ launcher.sh                # Launcher phụ
│
│  ── DEPENDENCIES ──
├─ requirements.txt           # Dependencies đầy đủ
├─ requirements-minimal.txt   # Chỉ cài tối thiểu để chạy
├─ requirements_auth.txt      # Chỉ dependencies xác thực
│
│  ── CẤU HÌNH ──
├─ config/
│  ├─ config.json             # ⭐ Config chính — credentials ONE, email, Telegram
│  ├─ production.json         # Config môi trường production
│  ├─ service_account.json    # Google Service Account (giữ bí mật, không commit)
│  ├─ sla_config.json         # Cài đặt ngưỡng SLA theo loại đơn
│  └─ backup/                 # Backup config cũ (tham khảo, không dùng trực tiếp)
│
│  ── SCRIPTS TIỆN ÍCH ──
├─ scripts/
│  ├─ start.sh                # ⭐ Launcher chính — menu 12 tùy chọn
│  ├─ setup.sh                # Setup môi trường (bản trong scripts/)
│  ├─ quick_run.sh            # Chạy nhanh không cần menu
│  ├─ quick_config.sh         # Cấu hình nhanh credentials qua terminal
│  ├─ run-main.sh             # Chạy automation.py trực tiếp
│  ├─ start_dashboard.sh      # Khởi động dashboard
│  └─ config/                 # Config riêng cho scripts (ít dùng)
│
│  ── TESTS & KIỂM TRA ──
├─ tests/
│  ├─ system_check.py         # Kiểm tra toàn bộ hệ thống (deps, config, Chrome)
│  ├─ quick_test.py           # Test nhanh kết nối cơ bản
│  ├─ test_health.py          # Health check API/session
│  ├─ test_auth_system.py     # Test hệ thống xác thực
│  ├─ test_sheets_connection.py       # Test kết nối Google Sheets
│  ├─ test_google_sheets_verification.py  # Test xác minh dữ liệu Sheets
│  ├─ run_automation_with_logging.py  # Chạy automation có ghi log chi tiết
│  └─ google_sheets_config.py # ⚠️ SHIM — forward sang root google_sheets_config.py
│
│  ── HỆ THỐNG CON ONE ──
├─ one_automation_system/     # Hệ thống riêng cho ONE platform
│  ├─ automation.py
│  ├─ automation_bridge.py
│  ├─ setup.sh
│  ├─ requirements*.txt
│  ├─ api/
│  │  ├─ auth_api_server.py
│  │  ├─ auth_service.py
│  │  ├─ api_server.py
│  │  └─ google_sheets_config.py  # ⚠️ SHIM — forward sang root
│  ├─ config/
│  ├─ data/
│  ├─ logs/
│  └─ exports/
│
│  ── LEGACY / THAM KHẢO ──
├─ modules/                   # Module cũ (giữ để tương thích ngược)
├─ src/                       # Phiên bản src-based cũ
│  ├─ main.py
│  ├─ automation.py
│  ├─ automation_bridge.py
│  ├─ config/
│  ├─ modules/
│  └─ utils/
│
│  ── OUTPUT / ARTIFACT ──
├─ data/                      # Kết quả mỗi lần chạy (CSV, JSON, TXT)
├─ logs/                      # Log runtime từng session
└─ exports/                   # File export ra ngoài
```

---

## 2) Phân Vùng Chạy (Operational Grouping)

### 🚀 Điểm vào chính (chạy hàng ngày)

| File | Mục đích |
|---|---|
| `automation.py` | Chạy automation tiêu chuẩn |
| `automation_enhanced.py` | Chạy với SLA + chi tiết sản phẩm |
| `run_complete_automation.py` | Chạy toàn pipeline (khuyến nghị) |
| `one_automation.py` | Xử lý 1 đơn với session mới |

### 🔧 Script khởi động & cấu hình

| Script | Mục đích |
|---|---|
| `scripts/start.sh` | **Launcher chính** — dùng hàng ngày |
| `setup_and_smoke_test.sh` | Chạy khi mới cài hoặc sau khi pull code |
| `scripts/quick_config.sh` | Sửa credentials nhanh (ONE + Sheets + email) |

### 📊 Module tích hợp

| File | Mục đích |
|---|---|
| `google_sheets_config.py` | **Nguồn duy nhất** cho Google Sheets — KHÔNG duplicate |
| `sla_monitor.py` | Giám sát SLA |
| `notifier.py` | Gửi thông báo |

### 🧪 Kiểm tra hệ thống

| File | Khi nào dùng |
|---|---|
| `tests/system_check.py` | Trước khi run lần đầu hoặc sau cài deps mới |
| `tests/test_sheets_connection.py` | Khi nghi ngờ kết nối Sheets bị lỗi |
| `verify_authentication_and_user.py` | Khi session hết hạn hoặc đăng nhập lỗi |

---

## 3) Lưu Ý Quan Trọng Về Độ Ổn Định

> **Đọc kỹ phần này trước khi sửa code!**

1. **`google_sheets_config.py` ở ROOT là nguồn gốc duy nhất.**
   Các file trong `tests/` và `one_automation_system/api/` chỉ là **shim** (file chuyển tiếp) — không chứa logic thật.
   → **Khi cần sửa logic Sheets, chỉ sửa file root.**

2. **Luôn chạy script từ thư mục `automation/`.**
   Nếu chạy từ thư mục khác, các đường dẫn tương đối (`config/config.json`, `logs/`, `data/`) sẽ bị sai.

   ```bash
   cd automation   # ← bắt buộc
   ./scripts/start.sh
   ```

3. **`scripts/start.sh` đã được vá để chạy Python đúng CWD.**
   Option 5 và 6 dùng `(cd "$AUTOMATION_ROOT" && python ...)` thay vì `python /absolute/path/file.py`.

4. **Không xóa `modules/` hoặc `src/`** dù trông như legacy — một số import cũ vẫn có thể tham chiếu tới đây.

5. **`data/`, `logs/`, `exports/` sinh ra tự động** — không cần tạo tay, nhưng cũng không commit vào git.

---

## 4) Thư Mục Output / Artifact

| Thư mục | Nội dung | Ghi chú |
|---|---|---|
| `data/` | CSV/JSON/TXT kết quả mỗi lần chạy | Tự sinh, xóa được sau khi backup |
| `logs/` | Log runtime từng session (`automation_YYYYMMDD.log`) | Xem để debug lỗi |
| `exports/` | File export ra ngoài (báo cáo, tổng hợp) | Tự sinh |
| `one_automation_system/data/` | Output riêng của hệ thống ONE | Tương tự `data/` |
| `one_automation_system/logs/` | Log riêng của hệ thống ONE | Tương tự `logs/` |

---

## 5) Thứ Tự Khởi Động Khuyến Nghị

```bash
# Bước 1: Di chuyển vào thư mục automation
cd automation

# Bước 2 (lần đầu hoặc sau khi pull code mới): Setup và smoke test
./setup_and_smoke_test.sh

# Bước 3: Chạy launcher chính
./scripts/start.sh
```

**Kiểm tra thủ công (tùy chọn):**

```bash
# Kiểm tra toàn bộ hệ thống (deps, config, Chrome, Sheets)
python tests/system_check.py

# Kiểm tra xác thực user ONE
python verify_authentication_and_user.py

# Test kết nối Google Sheets
python tests/test_sheets_connection.py
```

---

## 6) Lịch Sử Thay Đổi Quan Trọng (Session 2026-03-15)

| File đã sửa | Vấn đề | Cách sửa |
|---|---|---|
| `run_complete_automation.py` | Đường dẫn tương đối vỡ khi chạy từ ngoài | Thêm `BASE_DIR`, `LOGS_DIR`, `DATA_DIR`, `CONFIG_PATH` tuyệt đối |
| `automation_enhanced.py` | `response.json()` lỗi khi body rỗng hoặc là HTML | Thêm guard kiểm tra `Content-Type` và body trước khi `.json()` |
| `automation_by_date.py` | Tương tự trên | Tương tự |
| `one_automation.py` | Tương tự trên | Tương tự |
| `google_sheets_config.py` | `.lower()` crash khi value là `bool` (từ Sheets API) | Thêm `to_bool()` helper kiểm tra `isinstance(value, bool)` |
| `tests/google_sheets_config.py` | Copy cũ có logic lỗi thời | Chuyển thành **shim** trỏ về root |
| `one_automation_system/api/google_sheets_config.py` | Tương tự trên | Chuyển thành **shim** trỏ về root |
| `tests/run_automation_with_logging.py` | Import và path lỗi | Fix `BASE_DIR`, `sys.path.insert`, paths tuyệt đối |
| `tests/system_check.py` | Tất cả path dùng relative | Thêm `BASE_DIR` + helper `_p()` |
| `scripts/quick_config.sh` | `syntax error: unexpected end of file` | Fix cấu trúc `if/else/fi` bị thiếu `fi` |
| `scripts/start.sh` | Option 5/6 chạy sai CWD | Dùng `(cd "$AUTOMATION_ROOT" && python ...)` |
| `setup_and_smoke_test.sh` | `PYTHONPATH=./modules` không tìm được module | Đổi thành `PYTHONPATH=.` |
