# Deploy Server Guide

## Muc Dich

Tai lieu nay mo ta quy trinh deploy ai-service len server dung script co san.

## Script Chuan

- Script: deploy-to-server.sh
- Vi tri: ai-service/deploy-to-server.sh

## Cu Phap

- Nhanh:
  - ./deploy-to-server.sh SERVER_HOST
- Day du:
  - ./deploy-to-server.sh SERVER_HOST SERVER_USER SSH_PORT SERVER_PATH SERVICE_PORT DEPLOY_MODE
- Interactive:
  - ./deploy-to-server.sh

## Tham So

- SERVER_HOST: IP hoac domain server.
- SERVER_USER: user SSH (thuong la root hoac ubuntu).
- SSH_PORT: port SSH (mac dinh 22).
- SERVER_PATH: duong dan deploy tren server (mac dinh /opt/mia-ai-service).
- SERVICE_PORT: port app tren server (mac dinh 8000).
- DEPLOY_MODE: docker hoac background.

## Runtime Deploy

- Runtime app chinh: ai_service.py.
- Health endpoint de verify: GET /health.

## Sau Deploy

- Cap nhat backend env:
  - AI_SERVICE_URL=http://SERVER_HOST:SERVICE_PORT
    AI_SERVICE_URL=http://127.0.0.1:8000
- Restart backend de backend goi sang AI service theo URL moi.

## Verify Nhanh

- curl http://SERVER_HOST:SERVICE_PORT/health
  curl http://127.0.0.1:8000/health

- curl http://SERVER_HOST:SERVICE_PORT/ai/optimization/status
  curl http://127.0.0.1:8000/ai/optimization/status

## Luu Y

- Docker mode de quan tri production de dang hon.
- Background mode phu hop moi truong nhe hoac debug nhanh.
