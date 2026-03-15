# Fix And Start AI Service

## Lỗi Thường Gặp

1. Port `8000` đang bị chiếm.
2. Virtual environment chưa có hoặc chưa kích hoạt.
3. Dependencies Python cài chưa đủ.

## Cách Khởi Động Chuẩn

```bash
cd ai-service
./install_and_start.sh
```

Script này sẽ tạo `venv`, cài dependencies, dừng process cũ và khởi động `ai_service.py` trên port mặc định `8000`.

## Cách Làm Thủ Công

```bash
cd ai-service
./stop_background.sh
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt
./start_background.sh
```

## Khi Port 8000 Bị Chiếm

```bash
cd ai-service
PORT=8001 ./start_background.sh
curl http://localhost:8001/health
```

Với local backend, nhớ đổi `AI_SERVICE_URL=http://localhost:8001`.

## Kiểm Tra Sau Khi Chạy

```bash
curl http://localhost:8000/health
tail -f logs/ai-service.log
tail -f logs/ai-service-error.log
```
