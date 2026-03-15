# Automation Setup va Thu Tu Chay (Ban thuc dung)

Tai lieu nay tra loi 2 cau hoi:

- Setup automation nhu the nao de gon va on dinh?
- Hien tai nen chay script nao truoc, script nao sau de dung luong?

## 1) Tong quan nhanh

Thu muc `automation/` hien co nhieu script, gom ca:

- Script chay that voi Selenium
- Script verify/auth
- Script demo/mo phong
- Script legacy/trung lap

De tranh roi, nen theo 2 mode ro rang:

1. **Mode A (khuyen nghi): chay that voi ONE system**
2. **Mode B: verify tung phan (Google Sheets, login one.tga, ...)**

---

## 2) Chon requirements nao?

## 2.1 Cho `automation/`

- Mac dinh de khoi dong nhanh:
  - `requirements-minimal.txt`
- Neu can cac script auth/sheets Flask:
  - them `requirements_auth.txt`
- Chua can cai ngay ban full:
  - `requirements.txt`
  - `requirements2.txt`
  - `requirements copy.txt`

## 2.2 Cho `automation/one_automation_system/`

- Mac dinh de chay nhanh:
  - `requirements-minimal.txt`
- Neu can API Flask:
  - them `requirements_auth.txt`
- Chi dung `requirements.txt` khi can du feature/benchmark/toi uu nang cao.

---

## 3) Setup toi uu (de dung duoc ngay)

## Cach nhanh nhat (1 lenh)

Tu `automation/`:

```bash
chmod +x setup_and_smoke_test.sh
./setup_and_smoke_test.sh
```

Tuy chon:

```bash
# Cai them auth deps
INSTALL_AUTH=1 ./setup_and_smoke_test.sh

# Test one.tga credentials
RUN_ONE_TGA_TEST=1 ONE_TGA_EMAIL="your_email" ONE_TGA_PASSWORD="your_password" ./setup_and_smoke_test.sh

# Chay automation that 1 lan sau khi setup
RUN_REAL_AUTOMATION=1 ./setup_and_smoke_test.sh
```

Script moi: `setup_and_smoke_test.sh`

---

Tu project root:

```bash
cd automation
python3 -m venv .venv
source .venv/bin/activate
python -m pip install --upgrade pip setuptools wheel
python -m pip install -r requirements-minimal.txt
```

Neu can auth API:

```bash
python -m pip install -r requirements_auth.txt
```

Neu ban chay nhom script trong `one_automation_system` bang venv rieng:

```bash
cd one_automation_system
python3 -m venv .venv
source .venv/bin/activate
python -m pip install --upgrade pip setuptools wheel
python -m pip install -r requirements-minimal.txt
# optional:
python -m pip install -r requirements_auth.txt
```

---

## 4) Thu tu chay dung (khuyen nghi)

## Buoc 1 - Kiem tra moi truong Python

```bash
python --version
python -c "import selenium, pandas, dotenv; print('OK core deps')"
```

## Buoc 2 - Kiem tra Google Sheets auth (neu can)

Luu y: cac script nhu `verify_authentication_and_user.py` import `google_sheets_config` theo ten module top-level, trong khi class nam o `modules/google_sheets_config.py`.

Chay theo cach an toan:

```bash
cd automation
PYTHONPATH=./modules python verify_authentication_and_user.py
```

Neu pass thi tiep tuc.

## Buoc 3 - Kiem tra login one.tga rieng

```bash
cd automation
python verify_one_tga.py << 'EOF'
{"email":"YOUR_EMAIL","password":"YOUR_PASSWORD"}
EOF
```

Neu ket qua `success=true` thi login flow on.

## Buoc 4 - Chay automation that (khuyen nghi)

Dung entrypoint that tai:

- `one_automation_system/automation.py`

Chay 1 lan truoc:

```bash
cd automation/one_automation_system
python automation.py --run-once
```

Khi da on moi bat schedule:

```bash
python automation.py --schedule
```

---

## 5) Script nao nen uu tien, script nao nen de sau?

## NEN uu tien (core)

1. `one_automation_system/automation.py`
2. `verify_one_tga.py`
3. `verify_authentication_and_user.py` (kem `PYTHONPATH=./modules`)

## CAN NHAC / chi dung khi can

- `run_automation_with_logging.py`
- `run_complete_automation.py`

Ly do:

- 2 script nay co phan mo phong (simulate phases/progress), khong phai luong scrape that tu dau den cuoi.
- Nen dung de demo monitoring/logging, khong nen coi la entrypoint production duy nhat.

## Legacy/duplicate (khong nen la diem bat dau)

- `automation_enhanced.py`, `automation_by_date.py`, `scripts/*`, `config/*` (co trung lap vai tro)

---

## 6) "Automation hien tai chay nhu nao moi dung?"

Tra loi ngan gon:

1. Cai dep minimal truoc
2. Verify auth + verify login
3. Chay that bang `one_automation_system/automation.py --run-once`
4. Theo doi log/output
5. On roi moi chay `--schedule`

Neu toi uu theo production:

- Tach venv rieng cho `automation` va `one_automation_system`
- Giu 1 entrypoint chinh (de xuat: `one_automation_system/automation.py`)
- Script demo/monitoring de rieng, khong tron voi luong scrape that

---

## 7) Checklist truoc khi chay production

- [ ] Chrome + ChromeDriver hoat dong
- [ ] `.env` du thong tin ONE login
- [ ] Google service account + spreadsheet permissions OK
- [ ] Chay pass `verify_one_tga.py`
- [ ] Chay pass `automation.py --run-once`
- [ ] Co logs va output file dung
- [ ] Moi bat schedule

---

Generated: 2026-03-15
Phien ban: Huong dan setup/chay thuc dung cho thu muc `automation/`
