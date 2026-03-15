# Deploy Input Instructions

## Muc Tieu

Huong dan dien dung cac truong khi chay deploy-to-server.sh o che do interactive.

## Cac Truong Can Dien

- Server host/IP hoac domain:
  - Vi du: 192.168.1.100 hoac ai-service.mia.vn
- SSH User:
  - Vi du: root hoac ubuntu
- SSH Port:
  - Vi du: 22
- Deployment path tren server:
  - Vi du: /opt/mia-ai-service
- Service port tren server:
  - Vi du: 8000

## Gia Tri Goi Y

- SSH User: root
- SSH Port: 22
- Deployment path: /opt/mia-ai-service
- Service port: 8000

## Truoc Khi Chay

- Dam bao SSH ket noi duoc:
  - ssh USER@SERVER_HOST
- Dam bao server co:
  - Docker neu chon mode docker
  - Python 3 neu chon mode background
- Dam bao firewall mo SERVICE_PORT.

## Sau Khi Chay

- Test health:
  - curl http://SERVER_HOST:SERVICE_PORT/health
- Test optimization status:
  - curl http://SERVER_HOST:SERVICE_PORT/ai/optimization/status

## Ghi Chu

- Neu backend goi den AI service, nho cap nhat AI_SERVICE_URL trong backend env.
