# 📝 Hướng Dẫn Điền Thông Tin Deploy

## 🚀 Script đang hỏi các thông tin sau

### 1. **Server host/IP hoặc domain**

Nhập địa chỉ server production của bạn:

**Nếu bạn có IP:**

```
192.168.1.100
```

hoặc

```
123.45.67.89
```

**Nếu bạn có domain:**

```
ai-service.mia.vn
```

hoặc

```
server.mia.vn
```

**Lưu ý:**

- Nếu chưa có server, bạn cần tạo VPS/Cloud server trước (DigitalOcean, AWS, Azure, Vultr, etc.)
- Nếu deploy local, có thể dùng: `localhost` hoặc `127.0.0.1`

---

### 2. **SSH User**

User để SSH vào server:

**Thông thường:**

- `root` (nếu có quyền root)
- `ubuntu` (Ubuntu server)
- `admin` (một số VPS)
- `phuccao` (nếu dùng user riêng)

**Ví dụ:**

```
root
```

hoặc

```
ubuntu
```

**Lưu ý:** User này phải có quyền SSH vào server.

---

### 3. **SSH Port**

Port để SSH:

**Mặc định:**

```
22
```

**Nếu server dùng port khác:**

```
2222
```

hoặc

```
50000
```

**Lưu ý:** Thường là 22, chỉ đổi nếu server đã config port khác.

---

### 4. **Deployment path trên server**

Thư mục trên server để deploy AI Service:

**Mặc định (khuyến nghị):**

```
/opt/mia-ai-service
```

**Các lựa chọn khác:**

```
/home/phuccao/mia-ai-service
```

hoặc

```
/var/www/mia-ai-service
```

**Lưu ý:** Thư mục này sẽ được tạo tự động nếu chưa có.

---

### 5. **Service port trên server**

Port mà AI Service sẽ chạy trên server:

**Mặc định (khuyến nghị):**

```
8000
```

**Nếu port 8000 đã dùng, có thể dùng:**

```
8001
```

hoặc

```
9000
```

**Lưu ý:** Sau khi deploy, URL sẽ là: `http://YOUR_SERVER_IP:PORT`

---

## 📋 Ví Dụ Điền Đầy Đủ

### Ví dụ 1: Deploy lên VPS với IP

```
Server host/IP hoặc domain: 192.168.1.100
SSH User: root
SSH Port: 22
Deployment path trên server: /opt/mia-ai-service
Service port trên server: 8000
```

**Kết quả:** AI Service sẽ chạy tại `http://192.168.1.100:8000`

---

### Ví dụ 2: Deploy lên VPS với domain

```
Server host/IP hoặc domain: ai-service.mia.vn
SSH User: root
SSH Port: 22
Deployment path trên server: /opt/mia-ai-service
Service port trên server: 8000
```

**Kết quả:** AI Service sẽ chạy tại `http://ai-service.mia.vn:8000`

---

### Ví dụ 3: Deploy local (test)

```
Server host/IP hoặc domain: localhost
SSH User: phuccao
SSH Port: 22
Deployment path trên server: /opt/mia-ai-service
Service port trên server: 8000
```

**Lưu ý:** Deploy local cần server local đang chạy và SSH access.

---

## ⚠️ Lưu Ý Quan Trọng

### 1. SSH Key

Script cần **SSH key** để kết nối server. Đảm bảo:

```bash
# Check SSH key có thể connect không
ssh user@your-server.com
```

Nếu chưa setup SSH key:

```bash
# Tạo SSH key
ssh-keygen -t rsa -b 4096

# Copy key lên server
ssh-copy-id user@your-server.com
```

---

### 2. Server Prerequisites

Server cần có:

- ✅ **Docker** (nếu chọn deploy mode: docker)

  ```bash
  # Check Docker
  ssh user@server "docker --version"
  ```

- ✅ **Python 3** (nếu chọn deploy mode: background)

  ```bash
  # Check Python
  ssh user@server "python3 --version"
  ```

---

### 3. Firewall

Đảm bảo port đã mở trên server:

```bash
# Ubuntu/Debian
sudo ufw allow 8000/tcp

# CentOS/RHEL
sudo firewall-cmd --permanent --add-port=8000/tcp
sudo firewall-cmd --reload
```

---

## 🎯 Quick Start

### Nếu bạn chưa có server

1. **Tạo VPS/Cloud server** (DigitalOcean, AWS, Vultr, etc.)
2. **Lấy IP address** của server
3. **Setup SSH key** để có thể SSH vào server
4. **Chạy lại script** và điền thông tin

### Nếu bạn đã có server

Chỉ cần điền thông tin theo các trường script hỏi:

1. **Server host/IP**: IP hoặc domain của server
2. **SSH User**: User để SSH (thường là `root`)
3. **SSH Port**: Port SSH (thường là `22`)
4. **Deployment path**: Thư mục deploy (mặc định OK)
5. **Service port**: Port service (mặc định 8000 OK)

---

## ✅ Sau Khi Điền Xong

Script sẽ:

1. ✅ Kiểm tra SSH connection
2. ✅ Copy files lên server
3. ✅ Setup và start service
4. ✅ Test health endpoint
5. ✅ Tạo file config với Production URL

**Production URL sẽ được hiển thị** - dùng URL này để cấu hình backend!

---

**💡 Tip:** Nếu không chắc, có thể Enter để dùng giá trị mặc định (sẽ hiển thị trong ngoặc `[]`)
