# 🚀 React OAS Integration - Hướng Dẫn Toàn Diện

## 📋 Mục Lục

- [1. Tổng Quan Dự Án](#1-tổng-quan-dự-án)
- [2. Cài Đặt và Setup](#2-cài-đặt-và-setup)
- [3. Cấu Trúc Dự Án](#3-cấu-trúc-dự-án)
- [4. Deployment](#4-deployment)
- [5. Tối Ưu Hóa](#5-tối-ưu-hóa)
- [6. Troubleshooting](#6-troubleshooting)

---

## 1. Tổng Quan Dự Án

**React OAS Integration** là hệ thống web application hiện đại tích hợp OneAutomationSystem với Google Sheets, cung cấp:

### ✨ Tính Năng Chính

- 🔐 **Authentication**: Google OAuth 2.0 + JWT
- 📊 **Dashboard**: Analytics & reporting với real-time data
- 🔔 **Notifications**: Multi-channel (Email, SMS, Push)
- 📥 **Import/Export**: Hỗ trợ CSV, Excel, JSON, PDF
- 🎨 **Modern UI**: Material-UI với dark/light theme
- 📱 **PWA**: Progressive Web App capabilities

### 🏗️ Tech Stack

- **Frontend**: React 18 + TypeScript + Material-UI
- **State Management**: Redux Toolkit
- **Build**: Vite
- **Backend**: Node.js + Express
- **Automation**: Python với Google Sheets API

---

## 2. Cài Đặt và Setup

### 📋 Prerequisites

```bash
Node.js >= 16.0.0
npm >= 8.0.0 hoặc yarn >= 1.22.0
Python >= 3.8 (cho automation)
Google Cloud Console account
```

### 🚀 Quick Setup

```bash
# 1. Clone repository
git clone <repository-url>
cd react-oas-integration-project

# 2. Install dependencies - Frontend
npm install

# 3. Install dependencies - Backend
cd backend
npm install
cd ..

# 4. Install dependencies - Automation
cd automation
python -m venv venv
source venv/bin/activate  # Linux/Mac
# venv\Scripts\activate   # Windows
pip install -r requirements.txt
cd ..

# 5. Copy environment files
cp .env.example .env.local
cp backend/.env.example backend/.env
cp automation/config/google-credentials.json.example automation/config/google-credentials.json
```

### ⚙️ Environment Configuration

#### Frontend (.env.local)

```env
# Google Authentication
REACT_APP_GOOGLE_CLIENT_ID=your-google-client-id
REACT_APP_GOOGLE_SHEET_ID=your-spreadsheet-id
REACT_APP_GOOGLE_SHEETS_SPREADSHEET_ID=your-spreadsheet-id

# API Configuration
REACT_APP_API_BASE_URL=http://localhost:3001
REACT_APP_OAS_API_URL=your-oas-api-url
REACT_APP_OAS_API_KEY=your-oas-api-key

# Features
REACT_APP_ENABLE_NOTIFICATIONS=true
REACT_APP_ENABLE_ANALYTICS=true
REACT_APP_DEMO_MODE=false
```

#### Backend (.env)

> Thực tế repo load **một file `.env` ở root** cho `backend/` — xem `ENV_SETUP.md`.

```env
# Server Configuration
PORT=3001
NODE_ENV=development
JWT_SECRET=your-super-secret-jwt-key
GOOGLE_SHEETS_SPREADSHEET_ID=your-spreadsheet-id
JWT_EXPIRE=7d

# Database
DB_CONNECTION_STRING=your-database-url

# CORS
CORS_ORIGIN=http://localhost:3000

# Rate Limiting
RATE_LIMIT_WINDOW=15
RATE_LIMIT_MAX=100
```

#### Automation (.env)

```env
# Google Sheets API (automation có .env riêng; đồng bộ ID với root nếu cùng spreadsheet)
GOOGLE_SHEETS_SPREADSHEET_ID=your-spreadsheet-id
# Legacy: GOOGLE_SHEETS_ID=...
GOOGLE_CREDENTIALS_PATH=./config/google-credentials.json

# Notification Services
EMAIL_SERVICE=gmail
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-app-password

TELEGRAM_BOT_TOKEN=your-telegram-bot-token
ZALO_ACCESS_TOKEN=your-zalo-token

# Automation Schedule
SYNC_INTERVAL=300  # seconds
NOTIFICATION_INTERVAL=1800  # seconds
```

### 🔑 Google Sheets Setup

1. **Tạo Google Cloud Project**:
   - Vào [Google Cloud Console](https://console.cloud.google.com)
   - Tạo new project hoặc chọn existing project
   - Enable Google Sheets API và Google Drive API

2. **Tạo Service Account**:

   ```bash
   # Download credentials file và đặt vào automation/config/
   mv path/to/downloaded/file.json automation/config/google-credentials.json
   ```

3. **Setup Google Sheets**:
   - Tạo Google Sheets document
   - Share với service account email (viewer/editor permission)
   - Copy Spreadsheet ID từ URL

### 🏃‍♂️ Running the Application

#### Development Mode

```bash
# Terminal 1 - Frontend
npm run dev

# Terminal 2 - Backend
cd backend
npm run dev

# Terminal 3 - Automation (optional)
cd automation
source venv/bin/activate
python src/main.py
```

#### Production Mode

```bash
# Build frontend
npm run build

# Start all services
npm run start:prod
```

---

## 3. Cấu Trúc Dự Án

```
react-oas-integration-project/
├── 📁 src/                       # Frontend source code
│   ├── 📁 components/            # React components
│   │   ├── 📁 auth/              # Authentication
│   │   ├── 📁 layout/            # Layout components
│   │   ├── 📁 dashboard/         # Dashboard features
│   │   ├── 📁 common/            # Shared components
│   │   └── 📁 forms/             # Form components
│   ├── 📁 store/                 # Redux store
│   │   ├── 📁 slices/            # Redux slices
│   │   └── store.js              # Store configuration
│   ├── 📁 services/              # API services
│   │   ├── 📁 api/               # API clients
│   │   ├── 📁 auth/              # Auth services
│   │   └── 📁 utils/             # Utilities
│   ├── 📁 styles/                # Styling
│   │   ├── 📁 themes/            # Material-UI themes
│   │   └── index.css             # Global styles
│   └── 📁 routes/                # Routing
├── 📁 backend/                   # Node.js API server
│   ├── 📁 src/                   # Backend source
│   │   ├── 📁 routes/            # Express routes
│   │   ├── 📁 middleware/        # Custom middleware
│   │   ├── 📁 models/            # Data models
│   │   └── server.js             # Main server file
│   └── package.json              # Backend dependencies
├── 📁 automation/                # Python automation
│   ├── 📁 src/                   # Python source
│   │   ├── 📁 modules/           # Feature modules
│   │   ├── 📁 config/            # Configuration
│   │   └── main.py               # Main automation script
│   └── requirements.txt          # Python dependencies
├── 📁 public/                    # Static assets
├── 📁 docs/                      # Documentation
└── package.json                 # Main dependencies
```

### 📦 Key Components

#### Frontend Architecture

- **State Management**: Redux Toolkit với persistence
- **Routing**: React Router v6 với protected routes
- **UI Framework**: Material-UI v5 với custom themes
- **Forms**: React Hook Form + Yup validation
- **API**: Axios với interceptors và caching

#### Backend Architecture

- **Framework**: Express.js với TypeScript
- **Authentication**: JWT với refresh tokens
- **Security**: Helmet, CORS, rate limiting
- **Logging**: Morgan + custom logger
- **Validation**: Express Validator

#### Automation Architecture

- **Google Sheets**: API v4 với service account
- **Scheduling**: APScheduler cho background tasks
- **Notifications**: Multi-channel với template system
- **Data Processing**: Pandas cho data manipulation

---

## 4. Deployment

### 🐳 Docker Deployment

#### Docker Compose (Recommended)

```yaml
# docker-compose.yml
version: "3.8"
services:
  frontend:
    build: .
    ports:
      - "80:80"
    environment:
      - NODE_ENV=production
    depends_on:
      - backend

  backend:
    build: ./backend
    ports:
      - "3001:3001"
    environment:
      - NODE_ENV=production
      - PORT=3001

  automation:
    build: ./automation
    environment:
      - PYTHON_ENV=production
    volumes:
      - ./automation/config:/app/config
```

```bash
# Deploy với Docker Compose
docker-compose up -d --build
```

#### Individual Docker Containers

```bash
# Build và run frontend
docker build -t react-oas-frontend .
docker run -p 80:80 react-oas-frontend

# Build và run backend
cd backend
docker build -t react-oas-backend .
docker run -p 3001:3001 react-oas-backend

# Build và run automation
cd automation
docker build -t react-oas-automation .
docker run react-oas-automation
```

### ☁️ Cloud Deployment

#### Vercel (Frontend Only)

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel --prod

# Environment variables
vercel env add REACT_APP_GOOGLE_CLIENT_ID
vercel env add REACT_APP_API_BASE_URL
```

#### Heroku (Full Stack)

```bash
# Create Heroku apps
heroku create react-oas-frontend
heroku create react-oas-backend

# Deploy backend
cd backend
git subtree push --prefix backend heroku main

# Deploy frontend
git push heroku main
```

#### AWS EC2

```bash
# Setup EC2 instance
ssh -i key.pem ubuntu@your-ec2-ip

# Install dependencies
sudo apt update
sudo apt install nodejs npm python3 python3-pip nginx

# Clone và setup
git clone <repo-url>
cd react-oas-integration-project
npm install
npm run build

# Setup Nginx
sudo cp deployment/nginx.conf /etc/nginx/sites-available/default
sudo systemctl restart nginx

# Setup PM2 for process management
npm install -g pm2
pm2 start ecosystem.config.js
```

### 🔧 Production Configuration

#### Nginx Configuration

```nginx
server {
    listen 80;
    server_name your-domain.com;

    # Frontend
    location / {
        root /var/www/react-oas-integration/build;
        try_files $uri $uri/ /index.html;
    }

    # Backend API
    location /api/ {
        proxy_pass http://localhost:3001/;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }

    # Static assets
    location /static/ {
        root /var/www/react-oas-integration/build;
        expires 1y;
        add_header Cache-Control "public, immutable";
    }
}
```

#### PM2 Configuration

```javascript
// ecosystem.config.js
module.exports = {
  apps: [
    {
      name: "react-oas-frontend",
      script: "serve",
      args: "-s build -l 3000",
      instances: "max",
      exec_mode: "cluster",
    },
    {
      name: "react-oas-backend",
      script: "./backend/src/server.js",
      instances: 2,
      exec_mode: "cluster",
      env: {
        NODE_ENV: "production",
        PORT: 3001,
      },
    },
    {
      name: "react-oas-automation",
      script: "./automation/src/main.py",
      interpreter: "python3",
      instances: 1,
    },
  ],
};
```

---

## 5. Tối Ưu Hóa

### ⚡ Performance Optimization

#### Frontend Optimization

```javascript
// 1. Code Splitting
const DashboardPage = lazy(() => import('./pages/DashboardPage'));
const ReportsPage = lazy(() => import('./pages/ReportsPage'));

// 2. Bundle Analysis
npm run build:analyze

// 3. Service Worker caching
// public/sw.js - custom service worker

// 4. Image optimization
// Sử dụng WebP format, lazy loading
```

#### Bundle Size Optimization

```bash
# Analyze bundle
npm install --save-dev webpack-bundle-analyzer
npm run build:analyze

# Tree shaking - remove unused imports
# Chỉ import components cần thiết từ Material-UI
import Button from '@mui/material/Button';
// Thay vì: import { Button } from '@mui/material';
```

#### State Management Optimization

```javascript
// Redux Toolkit với RTK Query
// Automatic caching và background updates
export const apiSlice = createApi({
  reducerPath: "api",
  baseQuery: fetchBaseQuery({
    baseUrl: "/api",
    prepareHeaders: (headers, { getState }) => {
      headers.set("authorization", `Bearer ${getState().auth.token}`);
      return headers;
    },
  }),
  tagTypes: ["User", "Report", "Notification"],
  endpoints: (builder) => ({
    // Auto-generated hooks: useGetUsersQuery, useUpdateUserMutation
  }),
});
```

### 🚀 Backend Optimization

#### Database Optimization

```javascript
// 1. Connection pooling
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  max: 20,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000,
});

// 2. Query optimization
// Sử dụng indexes, avoid N+1 queries

// 3. Caching với Redis
const redis = require("redis");
const client = redis.createClient();

// Cache API responses
app.use("/api/reports", cache("5 minutes"), reportsRouter);
```

#### API Performance

```javascript
// 1. Compression middleware
app.use(compression());

// 2. Rate limiting
const rateLimit = require("express-rate-limit");
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
});
app.use("/api/", limiter);

// 3. Response caching
app.use("/api/static-data", (req, res, next) => {
  res.set("Cache-Control", "public, max-age=300"); // 5 minutes
  next();
});
```

### 🐍 Python Automation Optimization

```python
# 1. Async processing
import asyncio
import aiohttp

async def process_batch_data(data_batch):
    async with aiohttp.ClientSession() as session:
        tasks = [process_single_item(session, item) for item in data_batch]
        results = await asyncio.gather(*tasks)
    return results

# 2. Batch Google Sheets operations
def batch_update_sheets(spreadsheet_id, updates):
    body = {
        'valueInputOption': 'RAW',
        'data': updates
    }
    service.spreadsheets().values().batchUpdate(
        spreadsheetId=spreadsheet_id, body=body
    ).execute()

# 3. Memory optimization
import gc
def process_large_dataset(data):
    for chunk in pd.read_csv(data, chunksize=1000):
        process_chunk(chunk)
        gc.collect()  # Force garbage collection
```

### 📊 Monitoring và Analytics

#### Performance Monitoring

```javascript
// 1. Web Vitals tracking
import { getCLS, getFID, getFCP, getLCP, getTTFB } from "web-vitals";

getCLS(console.log);
getFID(console.log);
getFCP(console.log);
getLCP(console.log);
getTTFB(console.log);

// 2. Error tracking với Sentry
import * as Sentry from "@sentry/react";

Sentry.init({
  dsn: process.env.REACT_APP_SENTRY_DSN,
  integrations: [new Sentry.BrowserTracing()],
  tracesSampleRate: 1.0,
});
```

#### Real-time Analytics

```javascript
// Google Analytics 4
import { gtag } from "ga-gtag";

gtag("config", process.env.REACT_APP_GA_MEASUREMENT_ID, {
  page_title: document.title,
  page_location: window.location.href,
});

// Custom events tracking
gtag("event", "user_action", {
  event_category: "engagement",
  event_label: "button_click",
  value: 1,
});
```

---

## 6. Troubleshooting

### 🐛 Common Issues

#### 1. Google Sheets API Errors

```bash
# Error: Credentials not found
# Solution: Kiểm tra file google-credentials.json
ls -la automation/config/google-credentials.json

# Error: Permission denied
# Solution: Share sheet với service account email
# Lấy email từ credentials file:
cat automation/config/google-credentials.json | grep client_email
```

#### 2. CORS Issues

```javascript
// Backend CORS configuration
app.use(
  cors({
    origin: process.env.CORS_ORIGIN || "http://localhost:3000",
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);
```

#### 3. Build Errors

```bash
# Memory issues during build
NODE_OPTIONS="--max-old-space-size=4096" npm run build

# Missing dependencies
npm audit fix
npm install --legacy-peer-deps
```

#### 4. Authentication Issues

```javascript
// JWT token debugging
const jwt = require("jsonwebtoken");
const decoded = jwt.verify(token, process.env.JWT_SECRET);
console.log("Token payload:", decoded);

// Google OAuth debugging
// Kiểm tra client_id và redirect_uri
```

### 🔧 Debug Commands

```bash
# Frontend debugging
npm run dev -- --debug
npm run test:debug

# Backend debugging
DEBUG=* npm run dev
npm run test:debug

# Python debugging
cd automation
python -m pdb src/main.py

# System monitoring
htop
free -h
df -h
```

### 📞 Support Resources

- **GitHub Issues**: [Repository Issues](https://github.com/your-repo/issues)
- **Documentation**: [Full Documentation](./docs/)
- **Community**: [Discord Server](https://discord.gg/your-server)

---

## 📈 Performance Targets

| Metric                       | Target  | Current |
| ---------------------------- | ------- | ------- |
| **First Contentful Paint**   | < 1.5s  | 1.2s    |
| **Largest Contentful Paint** | < 2.5s  | 2.1s    |
| **Cumulative Layout Shift**  | < 0.1   | 0.05    |
| **Bundle Size**              | < 500KB | 420KB   |
| **API Response**             | < 200ms | 150ms   |

---

## 🚀 Next Steps

1. **Phase 1**: ✅ Core functionality complete
2. **Phase 2**: 🔄 Advanced analytics dashboard
3. **Phase 3**: 📋 Mobile app (React Native)
4. **Phase 4**: 🔧 Enterprise features

---

_Cập nhật cuối: 2024-01-XX_
_Version: 2.0.0_

**Made with ❤️ by React OAS Integration Team**
