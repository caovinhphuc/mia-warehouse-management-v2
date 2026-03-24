# AI Service

`ai-service` là Python subproject cung cấp FastAPI service cho xác thực `one.tga.com.vn` và các endpoint AI nội bộ.

## Yêu cầu Python

- **Python 3.11+** (khuyến nghị **3.11** hoặc **3.12** để vận hành ổn định).
- Cài đặt nhanh:
  - macOS: `brew install python@3.11`
  - Ubuntu/Debian: `sudo apt install python3.11 python3.11-venv`
- Tạo venv: `./setup_venv.sh` (tự chọn Python 3.11+ nếu có nhiều bản).

## Canonical Runtime

- Entry point mặc định: `ai_service.py`
- Port mặc định: `8000`
- Start background: `./start_background.sh`
- Stop background: `./stop_background.sh`
- Setup môi trường: `./setup.sh`
- Docker image: `Dockerfile.ai`

## Cấu Trúc Hiện Tại

- `ai_service.py`: app FastAPI đang được backend hiện tại gọi qua `AI_SERVICE_URL`
- `main_simple.py`: app legacy/alternate cho các endpoint ML cũ, không phải runtime mặc định
- `models/`: mã ML dùng bởi `main_simple.py`
- `logs/`: log runtime
- `data/`, `exports/`: thư mục dữ liệu để trống, tạo sẵn cho luồng offline/export nếu cần

## Chạy Local

```bash
cd ai-service
./setup.sh
./start_background.sh
curl http://localhost:8000/health
```

Nếu backend local cũng dùng `8000`, chạy AI service trên port khác:

```bash
cd ai-service
PORT=8001 ./start_background.sh
```

và cập nhật `AI_SERVICE_URL=http://localhost:8001` trong backend.

## Legacy Path

`main_simple.py` vẫn được giữ để tránh phá các luồng thử nghiệm cũ. Nếu cần chạy app này, dùng:

```bash
./run_main_simple.sh
```

Tài liệu trong thư mục này phải mặc định tham chiếu `ai_service.py` và port `8000`.
