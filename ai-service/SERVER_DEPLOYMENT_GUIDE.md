# 🚀 Hướng Dẫn Deploy AI Service Lên Production Server

## 📋 Tổng Quan

Hướng dẫn deploy AI Service lên server production (VPS/Cloud) để các service khác (backend, frontend) có thể gọi đến qua URL production.

---

## 🎯 Bước 1: Deploy AI Service Lên Server

### Cách 1: Deploy Tự Động (Khuyến nghị)

```bash
cd ai-service
./deploy-to-server.sh
```

Script sẽ hỏi:

- **Server host/IP hoặc domain**: Ví dụ: `192.168.1.100` hoặc `ai-service.mia.vn`
- **SSH User**: Thường là `root` hoặc `ubuntu`
- **SSH Port**: Mặc định `22`
- **Deployment path**: Mặc định `/opt/mia-ai-service`
- **Service port**: Mặc định `8000`
- **Deploy mode**: `docker` hoặc `background`

### Cách 2: Deploy Thủ Công

#### Với Docker

```bash
# SSH vào server
ssh user@your-server.com

# Clone hoặc copy files
cd /opt/mia-ai-service
# Copy ai_service.py, Dockerfile.ai, requirements.txt

# Build và run
docker build -f Dockerfile.ai -t mia-ai-service .
docker run -d \
    --name mia-ai-service \
    --restart unless-stopped \
    -p 8000:8000 \
    mia-ai-service
```

#### Với Systemd (Background Service)

```bash
# SSH vào server
ssh user@your-server.com

# Setup Python environment (Python 3.11+ required for stable operation)
cd /opt/mia-ai-service
# Use python3.11 if available: python3.11 -m venv venv
python3 -m venv venv
source venv/bin/activate
pip install --upgrade pip
pip install -r requirements.txt

# Tạo systemd service file
sudo nano /etc/systemd/system/mia-ai-service.service
```

Systemd service file:

```ini
[Unit]
Description=MIA AI Service
After=network.target

[Service]
Type=simple
User=root
WorkingDirectory=/opt/mia-ai-service
Environment="PORT=8000"
Environment="PYTHONUNBUFFERED=1"
ExecStart=/opt/mia-ai-service/venv/bin/python /opt/mia-ai-service/ai_service.py
Restart=always
RestartSec=10

[Install]
WantedBy=multi-user.target
```

Enable và start:

```bash
sudo systemctl daemon-reload
sudo systemctl enable mia-ai-service
sudo systemctl start mia-ai-service
sudo systemctl status mia-ai-service
```

---

## 🔗 Bước 2: Xác Định Production URL

Sau khi deploy, xác định URL production của AI Service:

### Nếu dùng IP

```
http://YOUR_SERVER_IP:8000
```

### Nếu dùng Domain

```
http://ai-service.mia.vn:8000
```

hoặc

```
https://ai-service.mia.vn  (nếu có SSL)
```

### Kiểm Tra

```bash
# Test health endpoint
curl http://YOUR_SERVER_IP:8000/health

# Expected response:
# {
#   "status": "healthy",
#   "selenium_available": true,
#   "models": { ... }
# }
```

---

## ⚙️ Bước 3: Cấu Hình Backend & Frontend

### Backend Configuration

Cập nhật file `.env` hoặc environment variables của backend:

```bash
# backend/.env
AI_SERVICE_URL=http://YOUR_SERVER_IP:8000
```

Hoặc set trong production environment:

```bash
export AI_SERVICE_URL=http://ai-service.mia.vn:8000
```

Backend sẽ tự động dùng URL này khi gọi AI Service:

```javascript
// backend/routes/authRoutes.js
const AI_SERVICE_URL = process.env.AI_SERVICE_URL || "http://localhost:8000";
```

### Frontend Configuration

Nếu frontend cần gọi trực tiếp AI Service (hiếm khi), cập nhật:

```bash
# .env hoặc .env.production
REACT_APP_AI_SERVICE_URL=http://YOUR_SERVER_IP:8000
```

Thông thường frontend sẽ gọi qua backend, nên chỉ cần cấu hình backend.

---

## 🔒 Bước 4: Security & Firewall

### Firewall Rules

Mở port trên server:

```bash
# UFW (Ubuntu)
sudo ufw allow 8000/tcp

# FirewallD (CentOS/RHEL)
sudo firewall-cmd --permanent --add-port=8000/tcp
sudo firewall-cmd --reload

# iptables
sudo iptables -A INPUT -p tcp --dport 8000 -j ACCEPT
```

### SSL/HTTPS (Khuyến nghị)

Nếu có domain, setup SSL với Let's Encrypt:

```bash
# Install certbot
sudo apt install certbot

# Get certificate
sudo certbot certonly --standalone -d ai-service.mia.vn

# Configure Nginx reverse proxy
```

Nginx config:

```nginx
server {
    listen 80;
    server_name ai-service.mia.vn;

    location / {
        proxy_pass http://localhost:8000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    }
}
```

Sau đó cập nhật URL thành:

```
https://ai-service.mia.vn
```

---

## 📊 Bước 5: Monitoring & Logs

### View Logs

#### Docker

```bash
docker logs -f mia-ai-service
```

#### Systemd

```bash
sudo journalctl -u mia-ai-service -f
```

### Health Monitoring

Tạo cron job để check health:

```bash
# Crontab
*/5 * * * * curl -f http://localhost:8000/health || systemctl restart mia-ai-service
```

---

## 🔄 Bước 6: Update Deployment

### Update Service

```bash
# SSH vào server
ssh user@your-server.com

# Pull latest code
cd /opt/mia-ai-service
git pull  # hoặc copy files mới

# Restart service
# Docker:
docker restart mia-ai-service

# Systemd:
sudo systemctl restart mia-ai-service
```

### Hoặc dùng script deploy lại

```bash
cd ai-service
./deploy-to-server.sh
```

---

## ✅ Verification Checklist

- [ ] AI Service chạy trên server
- [ ] Health check OK: `curl http://SERVER:8000/health`
- [ ] Port 8000 đã mở trên firewall
- [ ] Backend đã cấu hình `AI_SERVICE_URL`
- [ ] Test One TGA verification từ backend
- [ ] Logs hoạt động bình thường
- [ ] Service auto-restart khi crash

---

## 🌐 Production URL Examples

### Development

```
http://localhost:8000
```

### Production (IP)

```
http://192.168.1.100:8000
```

### Production (Domain)

```
http://ai-service.mia.vn:8000
```

### Production (HTTPS)

```
https://ai-service.mia.vn
```

---

## 📝 Configuration File

Sau khi deploy, script sẽ tạo file `.deploy-config`:

```bash
# AI Service Production Deployment Configuration
SERVER_HOST=192.168.1.100
SERVER_USER=root
SERVER_PORT=22
SERVER_PATH=/opt/mia-ai-service
SERVICE_PORT=8000
DEPLOY_MODE=docker
PRODUCTION_URL=http://192.168.1.100:8000
```

Dùng file này cho các lần deploy sau:

```bash
source ai-service/.deploy-config
```

---

## 🆘 Troubleshooting

### Service không start

```bash
# Check logs
docker logs mia-ai-service
# hoặc
sudo journalctl -u mia-ai-service -n 50

# Check port
sudo netstat -tlnp | grep 8000
```

### Cannot connect từ backend

1. Check firewall: Port 8000 đã mở chưa?
2. Check service: Service đang chạy chưa?
3. Check URL: URL đúng chưa? (http/https)
4. Check network: Backend có thể reach server không?

### Selenium không hoạt động

Cần cài đặt Chrome và ChromeDriver trên server:

```bash
# Ubuntu/Debian
sudo apt update
sudo apt install -y chromium-browser chromium-chromedriver

# CentOS/RHEL
sudo yum install -y chromium chromedriver
```

---

**✨ Sau khi deploy xong, nhớ cập nhật `AI_SERVICE_URL` trong backend configuration!**
