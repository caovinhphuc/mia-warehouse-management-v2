# 🚀 Hướng Dẫn Cấu Hình Deployment

## 📋 Tổng Quan

Hệ thống deployment của MIA Warehouse Management hỗ trợ tuỳ chỉnh linh hoạt cho nhiều môi trường và nền tảng khác nhau.

## 📁 Cấu Trúc Files

```
React-OAS-Integration-v4.0/scripts/deploy/
├── deploy.config.js      # File config chính (JavaScript)
├── deploy.config.json    # User settings (JSON)
├── deploy.sh            # Script deployment chính
├── deploy-gcp.sh        # Deploy lên Google Cloud Platform
└── deploy-main.sh       # Legacy deploy script
```

## ⚙️ Cấu Hình

### 1. File `deploy.config.js` (Cấu hình chính)

File này chứa tất cả cấu hình deployment cho dự án:

#### **Environments (Môi trường)**

```javascript
environments: {
  dev: {          // Môi trường phát triển
    name: 'Development',
    build: { mode: 'development', sourceMaps: true },
    backend: { port: 5050 },
    frontend: { port: 5173 },
    target: 'local'
  },
  staging: {      // Môi trường thử nghiệm
    name: 'Staging',
    build: { mode: 'production', optimization: true },
    target: 'gcp'
  },
  production: {   // Môi trường sản xuất
    name: 'Production',
    build: { mode: 'production', minify: true },
    target: 'gcp'
  }
}
```

#### **Targets (Nền tảng)**

```javascript
targets: {
  local: {        // Deploy trên máy local
    frontend: { command: 'npm run dev' },
    backend: { command: 'npm run start:backend' }
  },
  gcp: {          // Google Cloud Platform
    project: { id: 'mia-warehouse-v2', region: 'asia-southeast1' },
    compute: { machineType: 'e2-medium', diskSize: '30GB' }
  },
  docker: {       // Docker containers
    compose: { file: 'docker-compose.yml' }
  },
  netlify: {      // Netlify (frontend only)
    build: { command: 'npm run build', publish: 'build' }
  },
  vercel: {       // Vercel (frontend only)
    framework: 'vite'
  }
}
```

### 2. File `deploy.config.json` (User Settings)

File này để tuỳ chỉnh nhanh mà không cần sửa code JavaScript:

```json
{
  "currentEnvironment": "dev",
  "currentTarget": "local",
  "customSettings": {
    "autoBackup": true,
    "autoTest": false,
    "skipHealthCheck": false,
    "verbose": true
  },
  "override": {
    "backend": { "port": 5050 },
    "frontend": { "port": 5173 }
  }
}
```

## 🚀 Cách Sử Dụng

### Cách 1: Sử dụng Script Deploy

```bash
# Cấp quyền thực thi
chmod +x React-OAS-Integration-v4.0/scripts/deploy/deploy.sh

# Deploy development local
./React-OAS-Integration-v4.0/scripts/deploy/deploy.sh dev local

# Deploy staging lên GCP
./React-OAS-Integration-v4.0/scripts/deploy/deploy.sh staging gcp

# Deploy production với options
./React-OAS-Integration-v4.0/scripts/deploy/deploy.sh production gcp --force --verbose

# Deploy lên Netlify (frontend only)
./React-OAS-Integration-v4.0/scripts/deploy/deploy.sh production netlify

# Deploy với Docker
./React-OAS-Integration-v4.0/scripts/deploy/deploy.sh dev docker
```

### Các Options Có Sẵn

| Option          | Mô Tả                     |
| --------------- | ------------------------- |
| `--force`       | Force rebuild và redeploy |
| `--no-backup`   | Bỏ qua backup             |
| `--no-test`     | Bỏ qua testing            |
| `--skip-health` | Bỏ qua health check       |
| `--verbose`     | Hiển thị chi tiết log     |
| `--help`        | Hiển thị hướng dẫn        |

### Cách 2: Tuỳ Chỉnh Trong Code

#### Thay đổi Port Backend/Frontend

Trong `deploy.config.json`:

```json
{
  "override": {
    "backend": { "port": 8080 },
    "frontend": { "port": 3000 }
  }
}
```

#### Thay đổi GCP Configuration

Trong `deploy.config.js`:

```javascript
gcp: {
  project: {
    id: 'your-project-id',
    region: 'asia-southeast1'
  },
  compute: {
    machineType: 'e2-small',  // Thay đổi machine type
    diskSize: '50GB'           // Tăng disk size
  }
}
```

#### Enable CI/CD

Trong `deploy.config.js`:

```javascript
cicd: {
  enabled: true,
  github: {
    enabled: true,
    workflows: {
      production: '.github/workflows/deploy-production.yml'
    }
  }
}
```

## 📊 Các Môi Trường

### Development (dev)

- **Mục đích**: Phát triển local
- **Build**: Không optimize, có source maps
- **Target**: Local machine
- **Port**: Backend 5050, Frontend 5173
- **Hot Reload**: Enabled

### Staging (staging)

- **Mục đích**: Testing trước khi production
- **Build**: Optimized nhưng có source maps
- **Target**: GCP hoặc cloud platform
- **HTTPS**: Enabled
- **Hot Reload**: Disabled

### Production (production)

- **Mục đích**: Sản xuất thực tế
- **Build**: Full optimization, minified
- **Target**: GCP hoặc cloud platform
- **Source Maps**: Disabled
- **Security**: Maximum

## 🎯 Deployment Targets

### 1. Local

```bash
./deploy.sh dev local
```

- Deploy trên máy cá nhân
- Phù hợp cho development
- Hot reload enabled

### 2. Google Cloud Platform (GCP)

```bash
./deploy.sh production gcp
```

- Yêu cầu: `gcloud` CLI installed
- Auto scaling
- Load balancing
- Cloud Storage integration

### 3. Docker

```bash
./deploy.sh dev docker
```

- Container-based deployment
- Sử dụng docker-compose
- Isolated environment

### 4. Netlify (Frontend Only)

```bash
./deploy.sh production netlify
```

- CDN global
- Automatic SSL
- Continuous deployment
- Serverless functions

### 5. Vercel (Frontend Only)

```bash
./deploy.sh production vercel
```

- Edge network
- Zero configuration
- Automatic HTTPS
- Git integration

## 🔧 Tuỳ Chỉnh Nâng Cao

### 1. Thêm Environment Mới

Trong `deploy.config.js`:

```javascript
environments: {
  // ... existing environments
  qa: {
    name: 'QA Testing',
    build: { mode: 'production', sourceMaps: true },
    backend: { port: 4000 },
    frontend: { port: 4001 },
    target: 'docker'
  }
}
```

### 2. Custom Build Commands

```javascript
build: {
  commands: {
    dev: 'npm run build:dev',
    staging: 'vite build --mode staging',
    production: 'vite build --mode production'
  }
}
```

### 3. Environment Variables

```javascript
build: {
  env: {
    production: {
      REACT_APP_API_URL: 'https://api.mia-warehouse.com/api',
      REACT_APP_SENTRY_DSN: 'your-sentry-dsn',
      REACT_APP_GA_ID: 'your-ga-id'
    }
  }
}
```

### 4. Backup Configuration

```javascript
backup: {
  enabled: true,
  beforeDeploy: true,
  retention: 7,        // Giữ backup 7 ngày
  compress: true,
  exclude: ['node_modules', 'build*', '.git']
}
```

### 5. Health Check

```javascript
healthCheck: {
  enabled: true,
  timeout: 30000,
  retries: 3,
  endpoints: {
    backend: '/api/health',
    frontend: '/'
  }
}
```

### 6. Notifications

```javascript
notification: {
  enabled: true,
  channels: {
    telegram: {
      enabled: true,
      botToken: process.env.TELEGRAM_BOT_TOKEN,
      chatId: process.env.TELEGRAM_CHAT_ID
    }
  },
  events: ['deploy-start', 'deploy-success', 'deploy-failure']
}
```

## 📝 Ví Dụ Thực Tế

### Deploy Development Local

```bash
# Build và chạy local với hot reload
./deploy.sh dev local --verbose
```

### Deploy Staging để Test

```bash
# Deploy lên GCP staging với backup và test
./deploy.sh staging gcp
```

### Deploy Production

```bash
# Deploy production với force rebuild và full check
./deploy.sh production gcp --force --verbose
```

### Quick Deploy Frontend to Netlify

```bash
# Deploy chỉ frontend lên Netlify
./deploy.sh production netlify --no-test
```

### Docker Development

```bash
# Build và chạy trong Docker containers
./deploy.sh dev docker
```

## 🛠️ Troubleshooting

### 1. Port đã được sử dụng

```bash
# Thay đổi port trong deploy.config.json
{
  "override": {
    "backend": { "port": 5051 },
    "frontend": { "port": 5174 }
  }
}
```

### 2. Build fails

```bash
# Xóa build cũ và rebuild
./deploy.sh dev local --force
```

### 3. Health check fails

```bash
# Bỏ qua health check tạm thời
./deploy.sh dev local --skip-health
```

### 4. Out of memory during build

```javascript
// Tăng Node memory limit
build: {
  preBuild: ['export NODE_OPTIONS="--max-old-space-size=4096"', "npm install"];
}
```

## 📚 Best Practices

1. **Luôn backup trước khi deploy production**

   ```bash
   ./deploy.sh production gcp  # auto backup enabled
   ```

2. **Test trên staging trước**

   ```bash
   ./deploy.sh staging gcp
   # Test thoroughly
   ./deploy.sh production gcp
   ```

3. **Sử dụng environment variables cho secrets**

   ```bash
   export GOOGLE_APPLICATION_CREDENTIALS="/path/to/key.json"
   export NETLIFY_AUTH_TOKEN="your-token"
   ```

4. **Enable monitoring cho production**

   ```javascript
   monitoring: {
     enabled: true,
     errorTracking: { enabled: true }
   }
   ```

5. **Giữ logs để debugging**
   ```javascript
   logging: {
     level: 'info',
     destination: './logs/deploy.log'
   }
   ```

## 🔐 Security

- Không commit credentials vào git
- Sử dụng environment variables
- Enable HTTPS cho production
- Set up proper CORS
- Enable rate limiting
- Regular security audits

## 📞 Support

Nếu gặp vấn đề, check:

1. Logs trong `./logs/deploy.log`
2. Build output
3. Health check results
4. Configuration files syntax

## 🎉 Happy Deploying!
