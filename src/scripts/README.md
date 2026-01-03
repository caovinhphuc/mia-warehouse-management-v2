# 📁 Scripts Directory - MIA.vn Google Integration Platform

Cấu trúc scripts chuẩn chỉnh và tối ưu cho dự án.

## 📂 Cấu trúc

```
scripts/
├── setup/          # Setup scripts
│   └── main.sh     # Setup chính
├── deploy/         # Deployment scripts
│   └── main.sh     # Deploy chính
├── start/          # Start scripts
│   └── all.sh      # Start tất cả services
├── stop/           # Stop scripts
│   └── all.sh      # Stop tất cả services
├── check/          # Health check & monitoring
│   └── health.sh   # Health check script
└── utils/          # Utility scripts
    ├── common.sh   # Common utilities (colors, logging)
    ├── ports.sh    # Port configuration
    └── clean.sh    # Clean script
```

## 🚀 Quick Access (Root Level)

Để dễ truy cập, các script chính có sẵn ở root level:

```bash
./setup.sh          # Setup hệ thống
./deploy.sh         # Deploy (docker/vercel/netlify)
./start.sh          # Khởi động tất cả services
./stop.sh           # Dừng tất cả services
./clean.sh          # Clean cache/modules/build
./check-ports.sh    # Kiểm tra ports
./full-rebuild-deploy.sh  # Rebuild & deploy toàn bộ
```

## 📖 Chi tiết các Script

### 1. Setup (`scripts/setup/main.sh`)

Setup toàn bộ hệ thống:

- Kiểm tra prerequisites (Node.js, npm, Python)
- Kiểm tra và giải phóng ports
- Tạo cấu trúc thư mục
- Cài đặt dependencies (npm, pip)
- Cấu hình environment (.env)
- Xác minh setup

```bash
./setup.sh
```

### 2. Deploy (`scripts/deploy/main.sh`)

Deploy hệ thống với nhiều phương thức:

- Docker Compose
- Vercel
- Netlify

```bash
# Deploy với Docker (mặc định)
./deploy.sh docker

# Deploy với Vercel
./deploy.sh vercel

# Deploy với Netlify
./deploy.sh netlify
```

### 3. Start (`scripts/start/all.sh`)

Khởi động tất cả services:

- Kiểm tra ports
- Kiểm tra environment
- Khởi động Docker services hoặc manual services
- Health check

```bash
./start.sh
```

### 4. Stop (`scripts/stop/all.sh`)

Dừng tất cả services:

- Dừng Docker containers
- Dừng Node.js processes
- Dừng Python processes
- Giải phóng tất cả ports

```bash
./stop.sh
```

### 5. Clean (`scripts/utils/clean.sh`)

Clean cache, modules, build files:

```bash
# Clean tất cả
./clean.sh --all

# Clean cache only
./clean.sh --cache

# Clean modules only
./clean.sh --modules

# Clean build only
./clean.sh --build

# Clean venv only
./clean.sh --venv
```

### 6. Check Ports (`check-ports.sh`)

Kiểm tra status của tất cả ports chuẩn:

```bash
./check-ports.sh
```

### 7. Health Check (`scripts/check/health.sh`)

Kiểm tra health status của tất cả services:

```bash
./scripts/check/health.sh
```

### 8. Full Rebuild & Deploy (`full-rebuild-deploy.sh`)

Script toàn diện để:

- Dừng tất cả services
- Xóa cache hoàn toàn
- Đảm bảo port chuẩn
- Cài đặt lại tất cả dependencies
- Build tất cả projects
- Deploy

```bash
./full-rebuild-deploy.sh
```

## 🔧 Utilities

### Common Utilities (`scripts/utils/common.sh`)

Shared functions:

- Colors và logging
- Command checks
- Port checks
- Environment verification
- Service waiting

### Port Configuration (`scripts/utils/ports.sh`)

Port chuẩn:

- Frontend: 3000
- Backend: 8000
- Monitoring: 8080
- Redis: 6379 (optional)
- Dev Backend: 3001
- Dev Frontend: 3004

## 📋 Workflow Chuẩn

### 1. Lần đầu setup

```bash
# Setup hệ thống
./setup.sh

# Cập nhật .env với thông tin thực tế
nano .env

# Khởi động services
./start.sh

# Kiểm tra health
./scripts/check/health.sh
```

### 2. Development

```bash
# Khởi động services
./start.sh

# Development work...

# Dừng services
./stop.sh
```

### 3. Rebuild & Deploy

```bash
# Clean và rebuild toàn bộ
./full-rebuild-deploy.sh

# Hoặc từng bước
./clean.sh --all
./setup.sh
./deploy.sh docker
```

### 4. Production Deploy

```bash
# Build production
npm run build:prod

# Deploy
./deploy.sh docker

# Health check
./scripts/check/health.sh
```

## 🔍 Troubleshooting

### Port đang được sử dụng

```bash
# Kiểm tra ports
./check-ports.sh

# Giải phóng ports
./stop.sh
```

### Dependencies issues

```bash
# Clean và reinstall
./clean.sh --modules
./setup.sh
```

### Build issues

```bash
# Clean build và rebuild
./clean.sh --build
./deploy.sh docker
```

## 📝 Notes

- Tất cả scripts đều sử dụng `set -e` để exit on error
- Scripts tự động detect project root
- Ports được cấu hình chuẩn và tập trung
- Logging với colors và timestamps
- Error handling đầy đủ

## 🔐 Security

- Không chạy scripts với quyền root
- Kiểm tra environment variables trước khi chạy
- Validate input parameters

## 📚 Related Documentation

- [README.md](../README.md) - Project overview
- [DEPLOYMENT_GUIDE.md](../DEPLOYMENT_GUIDE.md) - Deployment guide
- [SETUP_GUIDE.md](../SETUP_GUIDE.md) - Setup guide
