# Frontend Health Analysis (2026-03-15)

Tai lieu nay danh gia hien trang frontend hien tai va de xuat ke hoach cai thien theo muc uu tien.

## 1. Scope va cach danh gia

Da kiem tra:

- Cau truc thu muc frontend.
- Cau hinh chinh: `package.json`, `vite.config.mjs`, `eslint.config.mjs`, `README.md`.
- Trang thai van hanh qua lenh:
  - `npm run lint`
  - `npm run build`

## 2. Tong quan hien trang

- Build production: PASS.
- Lint: FAIL.
- So file trong `frontend/src`: 213 file.
- Co dau hieu codebase dang tron giua code app + script van hanh + file legacy.

Ket qua quan trong:

- `npm run lint`: 471 problems (31 errors, 440 warnings).
- `npm run build`: thanh cong, nhung co canh bao chunk lon va canh bao circular chunk.

## 3. Findings chinh

### F1 - Lint dang fail, khong dat quality gate (Muc do: Cao)

Bang chung:

- 31 errors dang chan lint pass.
- Loi lap lai nhieu nhat:
  - `no-use-before-define`
  - `no-undef` (vi du `AbortController`)

Anh huong:

- Khong the dat gate CI chat che.
- Tang rui ro regression vi warning/error bi bo qua thanh thuong.

File tieu bieu:

- `src/hooks/useHealthConnections.js`
- `src/services/securityService.js`
- `src/components/security/*.jsx`
- `src/components/custom/*.jsx`

### F2 - Cau truc src bi "pha loang" boi script va legacy (Muc do: Cao)

Bang chung:

- Trong `src` co nhieu script khong phai app runtime:
  - `src/scripts/*` (nhieu file Node shell utility).
- Co file backup va file khong thuoc frontend runtime:
  - `src/components/Dashboard/Dashboard.backup.jsx`
  - `src/google_sheets_config.py`
- Co trung lap test entry:
  - `src/App.test.js`
  - `src/App.test.jsx`

Anh huong:

- Tang nhieu warning lint khong lien quan app.
- Lam kho dev moi hieu duong di code.
- Tang xac suat sua nham file legacy.

### F3 - Dependency frontend dang over-provisioned (Muc do: Cao)

Bang chung:

- `frontend/package.json` co nhieu dependency thuoc backend/server:
  - `express`, `passport`, `passport-github2`, `passport-microsoft`, `pg`, `swagger-ui-express`, `swagger-jsdoc`, `multer`, `node-cron`.
- Kiem tra import trong `src` khong thay dau hieu dang dung cac lib server tren.

Anh huong:

- Tang thoi gian install.
- Tang risk security/audit surface.
- Lam mo boundary giua frontend va backend.

### F4 - Bundle lon, chunk chua toi uu (Muc do: Trung binh - Cao)

Bang chung tu build:

- Co canh bao chunk > 500kB.
- Chunk lon:
  - `vendor-antd`: ~1.07 MB (gzip ~320 kB)
  - `vendor-recharts`: ~335 kB (gzip ~89 kB)
  - `vendor`: ~282 kB (gzip ~88 kB)
- Co canh bao circular chunk giua `vendor-antd` va `vendor`.

Anh huong:

- First load cham hon, nhat la mang yeu.
- Manual chunk logic dang phuc tap va phat sinh circular warning.

### F5 - Rule lint dang ap cho script utility trong src (Muc do: Trung binh)

Bang chung:

- Rat nhieu warning `no-console` den tu `src/scripts/*`.

Anh huong:

- Lam "ngap" output lint.
- Che mat warning that su can xu ly trong app code.

## 4. De xuat cai thien (uu tien theo giai doan)

## P0 (lam ngay, 1-3 ngay)

1. Dat lai ranh gioi frontend app code

- Di chuyen `src/scripts/*` ra `frontend/scripts/*` (hoac `tools/frontend/*`).
- Xoa/luu tru file legacy trong src:
  - `Dashboard.backup.jsx`
  - `google_sheets_config.py` (neu khong dung o frontend runtime).
- Giu `src` chi cho app runtime, hooks, services, components.

1. Lam lint pass toi thieu

- Sua 31 errors truoc (uu tien `no-use-before-define`, `no-undef`).
- Dam bao `npm run lint` pass o local.

1. Tach lint target

- Ap lint cho `src/app/**` (hoac src sau khi da clean),
- Co profile rieng cho utility scripts (neu can), tranh trung quality gate app.

## P1 (1 tuan)

1. Don dep dependencies

- Chay audit unused deps, bo dependency khong thuoc frontend runtime.
- Uu tien remove cac package server-side khoi frontend package.

1. Giam kich thuoc bundle

- Lazy-load cac man hinh lon (Security, Analytics, AI, Google pages).
- Xem lai strategy cho antd:
  - import theo module,
  - toi uu chunking de tranh circular chunk warning.
- Chon 1 trong `moment` hoac `dayjs`, tranh dung ca hai.

1. Chuan hoa testing

- Hop nhat test entry (`App.test.js` vs `App.test.jsx`).
- Tach test utility khong can thiet ra khoi src app runtime neu phu hop.

## P2 (2-4 tuan)

1. Thiet lap quality gate CI

- Bat buoc pass:
  - lint
  - build
  - test core smoke
- Co baseline bundle budget va fail neu vuot nguong.

1. Kien truc module ro rang

- Chia theo domain:
  - `features/*`
  - `shared/*`
  - `app/*`
- Giam coupling giua component layer va service layer.

## 5. Ke hoach thuc thi de xuat

Tuan 1:

- Clean `src` + move scripts + remove legacy files.
- Sua het 31 lint errors.
- Chot lint config theo boundary moi.

Tuan 2:

- Dependency pruning.
- Toi uu chunk + lazy load.
- Chot dashboard bundle report truoc/sau.

## 6. KPI de do cai thien

- Lint: tu 31 errors -> 0 errors.
- Warnings: giam manh (muc tieu < 80 trong giai doan dau).
- Bundle:
  - giam chunk lon nhat (vendor-antd) xuong muc hop ly theo budget team.
  - khong con canh bao circular chunk.
- CI: lint + build pass on every PR.

## 7. Ket luan

Frontend hien tai van build duoc nhung dang co no ky thuat tich luy ro rang o 3 diem: quality gate, boundary codebase, va dependency/bundle hygiene.

Neu lam dung theo P0 -> P1, frontend se de van hanh hon, de mo rong hon, va giam rui ro khi deploy.
