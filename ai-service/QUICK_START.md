# AI Service Quick Start

## Runtime Chuẩn

- App mặc định: `ai_service.py`
- Port mặc định: `8000`
- Script nên dùng: `setup.sh`, `start_background.sh`, `stop_background.sh`

## Khởi Động Nhanh

```bash
cd ai-service
./setup.sh
./start_background.sh
curl http://localhost:8000/health

```

## Chạy Foreground

```bash
cd ai-service
./run_ai_service.sh
```

## Dừng Service

```bash
cd ai-service
./stop_background.sh
```

## Log Và PID

```bash
tail -f logs/ai-service.log
tail -f logs/ai-service-error.log
cat ai-service.pid
```

## Đổi Port Khi Chạy Local

Nếu backend local đang chiếm `8000`, chạy AI service ở port khác:

```bash
cd ai-service
PORT=8001 ./start_background.sh
curl http://localhost:8001/health
```

Sau đó cập nhật `AI_SERVICE_URL=http://localhost:8001` trong backend.

## Legacy App

`main_simple.py` vẫn còn để phục vụ luồng cũ. Chỉ dùng khi thật sự cần:

```bash
cd ai-service
./run_main_simple.sh
```
