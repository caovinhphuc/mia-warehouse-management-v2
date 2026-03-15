# COBYQA Migration Plan

## Muc Tieu

On dinh hoa co che optimization trong ai-service va giam sai lech giua docs va runtime.

## Hien Trang

- ai_service.py da co endpoint solve/status.
- optimization/__init__.py da co co che fallback.
- Engine thuc te co the la COBYQA, scipy fallback, hoac unavailable tuy theo import/dependency.

## Ke Hoach

1. Chuan hoa runtime

- Giu ai_service.py la runtime chinh cho integration.
- Khong dua file legacy vao luong deploy mac dinh.

1. Chuan hoa engine

- Xac nhan import path va dependency cho COBYQA local.
- Neu COBYQA local chua on dinh, tiep tuc dung scipy fallback.

1. Chuan hoa contract API

- Duy tri 3 endpoint:
  - GET /ai/optimization
  - GET /ai/optimization/status
  - POST /ai/optimization/solve
- Khoa schema request/response de frontend va backend goi on dinh.

1. Chuan hoa test

- Them smoke test cho status va solve.
- Them test validation input (objective_type, bounds, initial_guess).

1. Chuan hoa tai lieu

- Moi tai lieu optimization tham chieu runtime chinh va fallback behavior.
- Loai bo nhan dinh cu khong con dung voi code hien tai.

## Dieu Kien Hoan Tat

- Endpoint status va solve tra ve dung tren moi truong chay thuc.
- Docs va runtime khop nhau.
- Khong con ghi nhan optimization la mock-only.
