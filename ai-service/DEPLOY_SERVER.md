# 🚀 Hướng Dẫn Deploy AI Service Lên Server

## ⚡ Quick Deploy

### Cách 1: Với Server IP/Domain (Khuyến nghị)

```bash
cd ai-service
./deploy-to-server.sh YOUR_SERVER_IP
```

**Ví dụ:**

```bash
# Với IP
./deploy-to-server.sh 192.168.1.100

# Với domain
./deploy-to-server.sh ai-service.mia.vn
```

### Cách 2: Với Đầy Đủ Tham Số

```bash
./deploy-to-server.sh SERVER_HOST USER SSH_PORT DEPLOY_PATH SERVICE_PORT MODE
```

**Ví dụ:**

```bash
./deploy-to-server.sh 192.168.1.100 root 22 /opt/mia-ai-service 8000 docker
```

### Cách 3: Interactive (Script hỏi từng bước)

```bash
cd ai-service
./deploy-to-server.sh
```

Script sẽ hỏi:

- Server host/IP hoặc domain
- SSH User (mặc định: root)
- SSH Port (mặc định: 22)
- Deployment path (mặc định: /opt/mia-ai-service)
- Service port (mặc định: 8000)
- Deploy mode (docker hoặc background)

---

## 📋 Tham Số

| Tham số | Mô tả | Mặc định | Ví dụ |
|---------|------|----------|-------|
| `SERVER_HOST` | IP hoặc domain của server | - | `192.168.1.100` hoặc `ai-service.mia.vn` |
| `SERVER_USER` | User SSH | `root` | `root`, `ubuntu`, `ec2-user` |
| `SERVER_PORT` | Port SSH | `22` | `22`, `2222` |
| `SERVER_PATH` | Đường dẫn deploy trên server | `/opt/mia-ai-service` | `/opt/mia-ai-service` |
| `SERVICE_PORT` | Port của AI Service | `8000` | `8000`, `8001` |
| `DEPLOY_MODE` | Chế độ deploy | `docker` | `docker`, `background` |

---

## 🔧 Prerequisites

### 1. Server Production

- VPS hoặc Cloud instance (Ubuntu 20.04+)
- Quyền SSH (root hoặc user có sudo)
- Đã cài Docker (nếu dùng mode `docker`) hoặc Python 3.9+ (nếu dùng mode `background`)

### 2. SSH Key

- Đã cấu hình SSH key để kết nối không mật khẩu

### 3. Firewall

- Mở port `8000` (hoặc port bạn chọn) trên firewall

---

## 📝 Ví Dụ Chi Tiết

### Ví dụ 1: Deploy với IP và Docker

```bash
cd ai-service
./deploy-to-server.sh 192.168.1.100
```

Script sẽ:

1. ✅ Kiểm tra SSH connection
2. ✅ Copy files lên server
3. ✅ Build Docker image
4. ✅ Run container
5. ✅ Verify service

### Ví dụ 2: Deploy với Domain và Background Service

```bash
cd ai-service
./deploy-to-server.sh ai-service.mia.vn root 22 /opt/mia-ai-service 8000 background
```

### Ví dụ 3: Deploy với Custom Port

```bash
cd ai-service
./deploy-to-server.sh 192.168.1.100 root 22 /opt/mia-ai-service 9000 docker
```

---

## ✅ Sau Khi Deploy

### 1. Lấy Production URL

Sau khi deploy thành công, bạn sẽ có URL:

```
http://YOUR_SERVER_IP:8000
```

hoặc

```
http://ai-service.mia.vn:8000
```

### 2. Cập Nhật Backend Configuration

Cập nhật `backend/.env`:

```bash
AI_SERVICE_URL=http://YOUR_SERVER_IP:8000
```

### 3. Restart Backend

```bash
cd backend
npm restart  # hoặc restart service của bạn
```

### 4. Verify

```bash
# Test health check
curl http://YOUR_SERVER_IP:8000/health

# Test One TGA verification endpoint
curl -X POST http://YOUR_SERVER_IP:8000/api/auth/verify-one-tga \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"test"}'
```

---

## 🐳 Docker Mode vs Background Mode

### Docker Mode (Khuyến nghị)

- ✅ Dễ quản lý
- ✅ Tự động restart
- ✅ Isolated environment
- ✅ Dễ scale

### Background Mode

- ✅ Nhẹ hơn (không cần Docker)
- ✅ Dễ debug
- ⚠️ Cần quản lý process manually

---

## 🆘 Troubleshooting

### Lỗi SSH Connection

```bash
# Kiểm tra SSH key
ssh -p 22 root@YOUR_SERVER_IP

# Nếu cần, thêm SSH key
ssh-copy-id -p 22 root@YOUR_SERVER_IP
```

### Lỗi Port Đã Được Sử Dụng

```bash
# Trên server, kiểm tra port
sudo lsof -i :8000

# Hoặc dùng port khác
./deploy-to-server.sh YOUR_SERVER_IP root 22 /opt/mia-ai-service 8001 docker
```

### Lỗi Docker Không Cài Đặt

```bash
# Trên server, cài Docker
sudo apt update
sudo apt install docker.io -y
sudo systemctl start docker
sudo systemctl enable docker
```

---

## 📊 Monitoring

### Check Service Status

```bash
# Docker
ssh root@YOUR_SERVER_IP "docker ps | grep mia-ai-service"

# Background
ssh root@YOUR_SERVER_IP "ps aux | grep ai_service"
```

### View Logs

```bash
# Docker
ssh root@YOUR_SERVER_IP "docker logs -f mia-ai-service"

# Background
ssh root@YOUR_SERVER_IP "tail -f /opt/mia-ai-service/logs/ai-service.log"
```

---

**✨ Chúc bạn deploy thành công!**
