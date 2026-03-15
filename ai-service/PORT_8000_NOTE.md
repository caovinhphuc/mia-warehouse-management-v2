# Port 8000 Note

`ai-service` mặc định chạy trên port `8000`. Đây là chuẩn đang được backend gọi qua `AI_SERVICE_URL`.

## Khi Local Backend Cũng Dùng 8000

Chạy AI service ở port khác:

```bash
cd ai-service
PORT=8001 ./start_background.sh
```

Và cập nhật backend:

```bash
AI_SERVICE_URL=http://localhost:8001
```

## Docker Runtime Chuẩn

```dockerfile
EXPOSE 8000
CMD ["uvicorn", "ai_service:app", "--host", "0.0.0.0", "--port", "8000"]
```

## Các File Đang Theo Chuẩn Này

- `ai_service.py`
- `start_background.sh`
- `stop_background.sh`
- `cleanup.sh`
- `Dockerfile.ai`
