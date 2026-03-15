# main copy Analysis (Repository Context)

## Muc Tieu

Tai lieu nay tong hop trang thai thuc te cua nhom file ban sao trong repo.

## Ket Luan

- Cac file ban sao khong phai runtime chinh cho backend integration.
- Runtime chinh van la ai_service.py.

## Lien Quan Optimization

- Ma optimization duoc to chuc trong thu muc optimization/.
- Wrapper optimization/__init__.py quan ly import va fallback.
- Endpoint solve/status da nam trong ai_service.py.

## Rui Ro Neu Dung File Copy Lam Chuan

- De gay lech tai lieu so voi runtime thuc te.
- De dan den endpoint mismatch trong qua trinh test/deploy.
- Lam kho bao tri do nhieu entry points.

## Chuan Hoa De Xuat

- Chon ai_service.py lam source of truth.
- Cac file copy giu vai tro tham khao, khong dung lam baseline deployment.
- Moi huong dan deploy va QA can map truc tiep vao ai_service.py.
