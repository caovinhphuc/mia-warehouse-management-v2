# ai-service/api — Xác thực đăng nhập (Google Sheets)

Thư mục này chứa **phần xác nhận đăng nhập** của ai-service: xác thực user qua **Google Sheets** (sheet Users, sessions, login logs). **Không** phải one.tga.com.vn.

---

## Hai luồng xác thực khác nhau trong ai-service

| Luồng | File / App | Port | Endpoint | Backend Node gọi? |
|-------|------------|------|----------|-------------------|
| **One TGA** (one.tga.com.vn) | `ai_service.py` (FastAPI, ở root ai-service) | **8000** | `POST /api/auth/verify-one-tga` | ✅ Có — `authRoutes.js` |
| **Login qua Google Sheets** | `api/auth_api_server.py` (Flask) + `api/auth_service.py` | **8001** | `POST /api/auth/login`, `POST /api/auth/verify`, ... | ❌ Không — server riêng |

- **Backend (Node)** hiện chỉ gọi **ai_service.py** (port 8000) cho **verify-one-tga**. Login chính (email/password → JWT/session) do **backend authService + authRoutes** xử lý (users.json, bcrypt).
- **api/auth_api_server.py** là server Flask **độc lập** (port 8001): nếu chạy thì frontend/script có thể gọi trực tiếp để đăng nhập/xác thực qua Google Sheets.

---

## Trong thư mục `api/` — “thằng xác nhận đăng nhập”

### 1. `auth_service.py` — Logic xác thực

- **AuthenticationService**: đọc/ghi Google Sheets (qua `GoogleSheetsConfigService`).
- **Sheets dùng**: `Users`, `User_Sessions`, `Login_Logs`.
- **Chức năng**:
  - `authenticate_user(email, password, ip, user_agent)` → kiểm tra user trong sheet Users, so sánh password hash (SHA-256 + salt), khóa tài khoản sau N lần sai, tạo session ghi vào User_Sessions, ghi log vào Login_Logs.
  - `verify_session(session_id)` → kiểm tra session còn ACTIVE và chưa hết hạn.
  - `logout(session_id)` → đánh dấu session INACTIVE.
  - `add_user(...)` → thêm user mới vào sheet Users.

### 2. `auth_api_server.py` — HTTP API (Flask)

- **Port**: **8001** (trong code: `app.run(port=8001)`).
- **Routes**:
  - `POST /api/auth/login` — đăng nhập (body: email, password, rememberMe) → gọi `auth_service.authenticate_user`, trả user + session, có thể set cookie `session_id`.
  - `POST /api/auth/verify` — xác minh session (body hoặc cookie `sessionId`/`session_id`) → gọi `auth_service.verify_session`.
  - `POST /api/auth/logout` — đăng xuất (body hoặc cookie) → gọi `auth_service.logout`.
  - `POST /api/auth/register` — đăng ký user mới → gọi `auth_service.add_user`.
  - `GET /api/auth/status` — trạng thái service (Google Sheets có kết nối không).
  - `GET /health` — health check.

**Khởi chạy** (nếu muốn dùng login qua Sheets):

```bash
cd ai-service/api
# Cần spreadsheet_id và credentials trong env hoặc GoogleSheetsConfigService
python auth_api_server.py
# Server chạy tại http://0.0.0.0:8001 (mặc định)
# Port 8001 bị chiếm? Chạy: PORT=8002 python auth_api_server.py
# Hoặc giải phóng port: lsof -ti:8001 | xargs kill -9
```

---

## Tóm tắt

- **“Thằng xác nhận đăng nhập từ ai-service” trong `api/`** = **auth_service.py** (logic) + **auth_api_server.py** (API Flask port 8001): xác nhận đăng nhập **qua Google Sheets** (Users, User_Sessions, Login_Logs).
- **Xác nhận one.tga.com.vn** nằm ở **ai_service.py** (port 8000), được backend Node gọi; không nằm trong thư mục `api/`.
- Deploy hiện tại (`ai_service.py`, port 8000) **không** bao gồm auth_api_server; muốn dùng login qua Sheets thì phải chạy thêm Flask app (auth_api_server.py) và cấu hình spreadsheet/credentials cho `api/google_sheets_config` / `AuthenticationService`.
