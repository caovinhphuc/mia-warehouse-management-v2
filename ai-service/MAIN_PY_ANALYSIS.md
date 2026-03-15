# main.py Analysis (Current Repo)

## Muc Tieu Tai Lieu

Lam ro vai tro thuc te cua main.py trong ai-service hien tai.

## Ket Luan Nhanh

- main.py khong phai runtime chinh dang duoc dung cho ket noi backend hien tai.
- Runtime chinh dang dung la ai_service.py.

## main.py Dang Lam Gi

- Cung cap mot FastAPI app theo huong analytics/demo.
- Co endpoint rieng phuc vu kich ban khac voi ai_service.py.

## Ranh Gioi Su Dung

- Dung main.py khi can kich ban rieng da thiet ke cho file nay.
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
