# Optimization Integration Status

## Scope

Tai lieu nay mo ta trang thai tich hop optimization trong runtime chinh cua AI service.

## Runtime Chinh

- File runtime chinh: ai_service.py
- App framework: FastAPI
- Port mac dinh: 8000

## Trang Thai Hien Tai

- Da co endpoint optimization trong runtime chinh.
- Da co co che fallback engine neu scipy available.
- Neu khong import duoc COBYQA va scipy thi engine se la unavailable.
- Khong con la mock-only endpoint.

## Endpoints

- GET /ai/optimization
  - Tra ve danh sach goi y toi uu hoa he thong.
  - Tra ve thong tin optimization_engine.
- GET /ai/optimization/status
  - Cho biet cobyqa_available.
  - Cho biet engine dang duoc dung (COBYQA, scipy fallback, hoac unavailable).
  - Cho biet trang thai san sang cua engine.
- POST /ai/optimization/solve
  - Nhan request giai bai toan optimization.
  - Co validate objective_type, initial_guess, bounds.
  - Tra ve diem toi uu, gia tri objective, so vong lap, so lan danh gia ham.

## Fallback Engine

- Import engine qua optimization/__init__.py.
- Neu COBYQA local khong san sang, he thong fallback sang scipy.optimize neu co scipy.
- Neu scipy khong co, status se la unavailable va /ai/optimization/solve tra 503.

## Request Mau

POST /ai/optimization/solve

{
  "objective_type": "minimize",
  "initial_guess": [1.0, 2.0],
  "bounds": [[0.0, 10.0], [0.0, 10.0]],
  "constraints": [],
  "options": {}
}

## Ghi Chu

- objective_type hop le: minimize | maximize.
- Doan objective hien tai la ham tong binh phuong de smoke test.
- Co the thay objective bang bai toan thuc te sau.

## Trang Thai Hien Tai

- Da co endpoint optimization trong runtime chinh.
- Da co co che fallback engine.
- Khong con la mock-only endpoint.

## Endpoints

- GET /ai/optimization
  - Tra ve danh sach goi y toi uu hoa he thong.
  - Tra ve thong tin optimization_engine.
- GET /ai/optimization/status
  - Cho biet cobyqa_available.
  - Cho biet engine dang duoc dung (COBYQA hoac scipy fallback).
  - Cho biet trang thai san sang cua engine.
- POST /ai/optimization/solve
  - Nhan request giai bai toan optimization.
  - Co validate objective_type, initial_guess, bounds.
  - Tra ve diem toi uu, gia tri objective, so vong lap, so lan danh gia ham.

## Fallback Engine

- Import eng# Optimization Integration Status

## Scope

Tai lieu nay mo ta trang thai tich hop optimization trong runtime AP

## Scope

Tai lieu nay mo ta trailaTai lie#

## Runtime Chinh

- File runtime chinh: ai_service.py
- App framework: FastAPI
- Port gue- File runtime ,
- App framework: FastAPI
- Port ma.0- Port mac dinh: 8000

,

## Trang Thai Hien # G- Da co endpoint optipe- Da co co che fallback engine

- Khong con la moen- Khong con la mock-only endpoe

## Endpoints

- GET /ai/optimizatve - GET /ai/oan  - Tra ve danh sa cd /Users/phuccao/Projects/mia-warehouse-management-v2/ai-service && cat > MAIN_PY_ANALYSIS.md <<'EOF'

# main.py Analysis (Current Repo)

## Muc Tieu Tai Lieu

Lam ro vai tro thuc te cua main.py trong ai-service hien tai.

## Ket Luat Nhanh

- main.py KHONG phai runtime chinh dang duoc dung cho ket noi backend hien tai.
- Runtime chinh dang dung la ai_service.py.

## main.py Dang Lam Gi

- Cung cap mot FastAPI app theo huong analytics/demo.
- Co endpoint rieng phuc vu kip ban khac voi ai_service.py.

## Ranh Gioi Su Dung

- Dung main.py khi can kip ban rieng da thiet ke cho file nay.
- Khong nen coi main.py la source of truth cho production integration hien tai.

## Runtime Chuan De Tich Hop

- Su dung ai_service.py cho:
  - /health
  - /api/auth/verify-one-tga
  - /ai/predictions
  - /ai/anomalies
  - /ai/optimization
  - /ai/optimization/status
  - /ai/optimization/solve

## Khuyen Nghi

- Giu main.py nhu file phu tro hoac legacy path.
- Moi tai lieu deploy/integration nen tham chieu ai_service.py la chinh.
