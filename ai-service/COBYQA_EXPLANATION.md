# COBYQA Explanation In This Repository

## COBYQA La Gi

COBYQA la thuat toan optimization co rang buoc, thuong dung cho bai toan derivative-free.

## Vai Tro Trong Repo Nay

- Repo co module optimization voi wrapper import.
- Wrapper uu tien dung COBYQA khi available.
- Neu khong available thi fallback sang scipy.optimize.

## Runtime Tich Hop

- Runtime chinh co tich hop optimization: ai_service.py.
- API lien quan:
  - GET /ai/optimization
  - GET /ai/optimization/status
  - POST /ai/optimization/solve

## Co Che Fallback

- COBYQA available:
  - method hien thi la COBYQA.
- COBYQA unavailable:
  - method hien thi la scipy.optimize (fallback) neu scipy co san.
- COBYQA va scipy deu unavailable:
  - engine hien thi la unavailable.
  - endpoint solve tra 503.
- Muc tieu la dam bao API van phuc vu duoc thay vi fail toan bo.

## Gioi Han Hien Tai

- Objective trong solve endpoint dang la ham test tong binh phuong.
- constraints duoc truyen qua wrapper, tuy nhien muc do ho tro phu thuoc engine dang chay.

## Dinh Huong Nang Cap

- Thay objective test bang bai toan nghiep vu thuc te.
- Chuan hoa tap rang buoc theo use case warehouse.
- Bo sung benchmark so sanh COBYQA va scipy fallback.
