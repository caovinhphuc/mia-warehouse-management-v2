# 🔧 Hướng Dẫn Cấu Hình Vercel - React OAS Integration v4.0

> **Version:** 4.0.0  
> **Last Updated:** 2025-01-27  
> **Status:** ✅ Complete

---

## 📋 Tổng Quan

Hướng dẫn chi tiết về cấu hình Vercel cho **React OAS Integration v4.0** - AI-Powered Automation Platform, bao gồm:

- ✅ Environment Variables configuration
- ✅ Build configuration (`vercel.json`)
- ✅ Deployment scripts
- ✅ Troubleshooting
- ✅ Best practices

---

## 🎯 Quick Start

### 1. Deploy Script (Recommended)

```bash
# Deploy to Vercel
./scripts/deploy/deploy-vercel.sh

# Hoặc từ root
./deploy-vercel.sh
```

### 2. Manual Deployment

```bash
# Install Vercel CLI
npm install -g vercel

# Login
vercel login

# Deploy
vercel --prod
```

---

## ⚙️ Vercel Configuration

### vercel.json

File `vercel.json` đã được cấu hình sẵn:

```json
{
  "version": 2,
  "builds": [
    {
      "src": "package.json",
      "use": "@vercel/static-build",
      "config": {
        "distDir": "build"
      }
    }
  ],
  "routes": [
    {
      "src": "/static/(.*)",
      "headers": {
        "cache-control": "s-maxage=31536000,immutable"
      }
    },
    {
      "src": "/(.*)",
      "dest": "/index.html"
    }
  ]
}
```

### Build Command

Build command trong `package.json`:

```json
{
  "scripts": {
    "vercel-build": "GENERATE_SOURCEMAP=false CI=false react-scripts build"
  }
}
```

**Lưu ý:**

- `GENERATE_SOURCEMAP=false` - Tắt source maps để giảm build time
- `CI=false` - Tắt CI mode để tránh warnings
- Output directory: `build/`

---

## 🔐 Environment Variables

Sau khi deploy lên Vercel, bạn cần cấu hình **Environment Variables** để ứng dụng hoạt động đúng.

---

## 🎯 Cách 1: Cấu Hình Qua Vercel Dashboard (Khuyến Nghị)

### Bước 1: Truy Cập Vercel Dashboard

1. Mở trình duyệt và vào: **<https://vercel.com/dashboard>**
2. Đăng nhập với tài khoản Vercel của bạn
3. Tìm project: **`React-OAS-Integration-v4.0`** (hoặc tên project của bạn)
4. Click vào project

### Bước 2: Vào Settings → Environment Variables

1. Click tab **Settings** (bên trái)
2. Scroll xuống phần **Environment Variables**
3. Click **Add New** để thêm từng biến

### Bước 3: Thêm Các Biến Môi Trường

#### ✅ **BẮT BUỘC (Required)**

Thêm các biến sau với **Environment** = **Production, Preview, Development**:

| Key                                      | Value                                                  | Mô Tả                              |
| ---------------------------------------- | ------------------------------------------------------ | ---------------------------------- |
| `REACT_APP_API_URL`                      | `https://your-backend-api.com`                         | URL backend API (production)       |
| `REACT_APP_AI_SERVICE_URL`               | `https://your-ai-service.com`                          | AI Service URL (nếu có)            |
| `REACT_APP_GOOGLE_SHEETS_SPREADSHEET_ID` | `your-spreadsheet-id`                                  | Google Sheets ID                   |
| `REACT_APP_GOOGLE_DRIVE_FOLDER_ID`       | `your-folder-id`                                       | Google Drive Folder ID             |
| `REACT_APP_GOOGLE_CLIENT_EMAIL`          | `your-service-account@project.iam.gserviceaccount.com` | Google Service Account Email       |
| `REACT_APP_GOOGLE_PRIVATE_KEY`           | `-----BEGIN PRIVATE KEY-----\n...`                     | Google Service Account Private Key |

#### ⚙️ **TÙY CHỌN (Optional - Khuyến Nghị)**

| Key                               | Value                             | Mô Tả                       |
| --------------------------------- | --------------------------------- | --------------------------- |
| `REACT_APP_FEATURE_GOOGLE_SHEETS` | `true`                            | Bật tính năng Google Sheets |
| `REACT_APP_FEATURE_GOOGLE_DRIVE`  | `true`                            | Bật tính năng Google Drive  |
| `REACT_APP_FEATURE_AUTOMATION`    | `true`                            | Bật tính năng Automation    |
| `REACT_APP_FEATURE_ANALYTICS`     | `true`                            | Bật tính năng Analytics     |
| `REACT_APP_WS_URL`                | `wss://your-websocket-server.com` | WebSocket URL (nếu có)      |
| `REACT_APP_LANGUAGE`              | `vi`                              | Ngôn ngữ (vi/en)            |
| `REACT_APP_TIMEZONE`              | `Asia/Ho_Chi_Minh`                | Múi giờ                     |
| `REACT_APP_ENVIRONMENT`           | `production`                      | Môi trường                  |
| `REACT_APP_API_TIMEOUT`           | `30000`                           | API timeout (ms)            |
| `REACT_APP_API_RETRY_ATTEMPTS`    | `3`                               | API retry attempts          |

#### 🔐 **BẢO MẬT (Nếu Cần)**

| Key                             | Value             | Mô Tả                          |
| ------------------------------- | ----------------- | ------------------------------ |
| `REACT_APP_GOOGLE_MAPS_API_KEY` | `your_api_key`    | Google Maps API Key (nếu dùng) |
| `REACT_APP_TELEGRAM_BOT_TOKEN`  | `your_bot_token`  | Telegram Bot Token (nếu dùng)  |
| `REACT_APP_TELEGRAM_CHAT_ID`    | `your_chat_id`    | Telegram Chat ID (nếu dùng)    |
| `REACT_APP_SENTRY_DSN`          | `your_sentry_dsn` | Sentry DSN (nếu dùng)          |
| `REACT_APP_GOOGLE_ANALYTICS_ID` | `your_ga_id`      | Google Analytics ID (nếu dùng) |

### Bước 4: Lưu và Redeploy

1. Sau khi thêm tất cả biến, click **Save**
2. Vào tab **Deployments**
3. Click **...** (3 chấm) trên deployment mới nhất
4. Click **Redeploy**
5. Chọn **Use existing Build Cache** (tùy chọn)
6. Click **Redeploy**

---

## 🚀 Cách 2: Cấu Hình Qua Vercel CLI

### Bước 1: Install Vercel CLI

```bash
# Install globally
npm install -g vercel

# Verify installation
vercel --version
```

### Bước 2: Login to Vercel

```bash
# Login
vercel login

# Hoặc với token
vercel login --token $VERCEL_TOKEN
```

### Bước 3: Link Project

```bash
# Link to existing project
vercel link

# Hoặc tạo project mới
vercel
```

### Bước 4: Add Environment Variables

```bash
# Thêm từng biến
vercel env add REACT_APP_API_URL production
# Nhập value khi được hỏi

# Hoặc thêm từ file .env.production
# (Tạo file .env.production trước)
vercel env pull .env.vercel
```

### Bước 5: Deploy

```bash
# Deploy to production
vercel --prod

# Hoặc preview
vercel
```

---

## 📝 Script Tự Động Cấu Hình

### Update Environment Variables Script

```bash
# Chạy script để update environment variables
./scripts/update_vercel_env.sh

# Hoặc
npm run update:vercel
```

**Script này sẽ:**

- Đọc từ `.env` hoặc `.env.production`
- Upload lên Vercel
- Verify configuration

### Deploy Script

```bash
# Deploy to Vercel
./scripts/deploy/deploy-vercel.sh

# Hoặc từ root
./deploy-vercel.sh
```

**Script này sẽ:**

- Check prerequisites
- Install Vercel CLI (nếu cần)
- Build application
- Deploy to Vercel
- Verify deployment

---

## 🔄 Build Configuration

### Build Settings trong Vercel Dashboard

1. Vào **Settings → General**
2. Scroll xuống **Build & Development Settings**
3. Cấu hình:

| Setting              | Value                  |
| -------------------- | ---------------------- |
| **Framework Preset** | Create React App       |
| **Root Directory**   | `./` (default)         |
| **Build Command**    | `npm run vercel-build` |
| **Output Directory** | `build`                |
| **Install Command**  | `npm install`          |
| **Node.js Version**  | `18.x` (hoặc mới hơn)  |

### Build Command Details

```json
{
  "scripts": {
    "vercel-build": "GENERATE_SOURCEMAP=false CI=false react-scripts build"
  }
}
```

**Giải thích:**

- `GENERATE_SOURCEMAP=false` - Tắt source maps để giảm build time và size
- `CI=false` - Tắt CI mode để tránh warnings không cần thiết
- Output: `build/` directory

---

## 📦 Deployment Methods

### Method 1: Automated Script (Recommended)

```bash
# Deploy to Vercel
./scripts/deploy/deploy-vercel.sh
```

### Method 2: Vercel CLI

```bash
# Deploy to production
vercel --prod

# Deploy to preview
vercel
```

### Method 3: GitHub Integration (Auto Deploy)

1. Connect GitHub repository trong Vercel Dashboard
2. Mỗi lần push code lên GitHub, Vercel sẽ tự động deploy
3. Pull requests sẽ tạo preview deployments

---

## 🌐 Custom Domain

### Setup Custom Domain

1. Vào **Settings → Domains**
2. Click **Add Domain**
3. Nhập domain của bạn
4. Follow instructions để configure DNS

### DNS Configuration

Thêm các records sau:

| Type  | Name | Value                |
| ----- | ---- | -------------------- |
| A     | @    | 76.76.21.21          |
| CNAME | www  | cname.vercel-dns.com |

---

## 🔍 Monitoring & Analytics

### Vercel Analytics

1. Vào **Settings → Analytics**
2. Enable **Web Analytics**
3. View metrics trong dashboard

### Performance Monitoring

- **Build Logs**: Xem trong Deployments tab
- **Function Logs**: Xem trong Functions tab
- **Real-time Logs**: `vercel logs`

---

## 🚨 Troubleshooting

### Vấn Đề 1: Build Fails

**Nguyên nhân:**

- Dependencies không tương thích
- Build command sai
- Environment variables thiếu

**Giải pháp:**

```bash
# Test build locally
npm run vercel-build

# Check build logs trong Vercel Dashboard
# Fix errors và redeploy
```

### Vấn Đề 2: Environment Variables Không Hoạt Động

**Nguyên nhân:**

- Chưa redeploy sau khi thêm biến
- Biến chưa được set cho **Production** environment
- Tên biến sai (phải bắt đầu bằng `REACT_APP_`)

**Giải pháp:**

1. Kiểm tra lại trong Vercel Dashboard
2. Redeploy lại project
3. Clear browser cache và thử lại
4. Verify trong browser console: `console.log(process.env)`

### Vấn Đề 3: API Calls Fail

**Nguyên nhân:**

- `REACT_APP_API_URL` chưa được set hoặc sai
- Backend API chưa chạy hoặc CORS chưa được cấu hình
- Network issues

**Giải pháp:**

1. Kiểm tra `REACT_APP_API_URL` trong Vercel Dashboard
2. Test backend API trực tiếp: `curl https://your-backend-api.com/health`
3. Kiểm tra CORS settings trong backend
4. Check network tab trong browser DevTools

### Vấn Đề 4: Google Services Không Hoạt Động

**Nguyên nhân:**

- Google Sheets/Drive IDs chưa đúng
- Service account chưa được share quyền
- Private key format sai

**Giải pháp:**

1. Kiểm tra Google Sheets ID trong URL
2. Kiểm tra Google Drive Folder ID
3. Đảm bảo service account có quyền Editor
4. Verify private key format (phải có `\n` cho newlines)

### Vấn Đề 5: Routing Issues (404 on Refresh)

**Nguyên nhân:**

- `vercel.json` routing configuration sai
- SPA routing chưa được cấu hình đúng

**Giải pháp:**

1. Kiểm tra `vercel.json` có route catch-all:

```json
{
  "src": "/(.*)",
  "dest": "/index.html"
}
```

2. Redeploy sau khi fix

---

## 📚 Best Practices

### 1. Environment Variables

- ✅ **Prefix với `REACT_APP_`** - Chỉ các biến này được expose
- ✅ **Set cho tất cả environments** - Production, Preview, Development
- ✅ **Sử dụng secrets** - Không commit sensitive data
- ✅ **Verify sau khi thêm** - Redeploy và test

### 2. Build Optimization

- ✅ **Tắt source maps** trong production (`GENERATE_SOURCEMAP=false`)
- ✅ **Enable build cache** - Vercel tự động cache dependencies
- ✅ **Optimize bundle size** - Sử dụng code splitting
- ✅ **Monitor build time** - Tối ưu nếu build quá lâu

### 3. Deployment

- ✅ **Test locally trước** - `npm run vercel-build`
- ✅ **Use preview deployments** - Test trước khi deploy production
- ✅ **Monitor deployments** - Check logs và metrics
- ✅ **Rollback nếu cần** - Vercel hỗ trợ rollback dễ dàng

### 4. Security

- ✅ **Không commit `.env` files** - Sử dụng `.gitignore`
- ✅ **Rotate secrets định kỳ** - Đổi API keys và tokens
- ✅ **Use environment-specific values** - Khác nhau cho dev/prod
- ✅ **Enable security headers** - Cấu hình trong `vercel.json`

---

## 📋 Checklist

### Pre-Deployment

- [ ] Environment variables đã được cấu hình
- [ ] Build command test thành công locally
- [ ] `vercel.json` đã được cấu hình đúng
- [ ] Dependencies đã được update
- [ ] Code đã được test và review

### Post-Deployment

- [ ] Verify deployment thành công
- [ ] Test tất cả features trong production
- [ ] Check environment variables hoạt động
- [ ] Monitor performance và errors
- [ ] Update documentation nếu cần

---

## 🔗 Related Documentation

- `GUIDE/VERCEL_ENV_SETUP.md` - Environment variables setup chi tiết
- `DEPLOYMENT_GUIDE.md` - General deployment guide
- `README.md` - Project overview
- `scripts/deploy/deploy-vercel.sh` - Deployment script

---

## 📚 External Resources

- **Vercel Documentation**: <https://vercel.com/docs>
- **Environment Variables**: <https://vercel.com/docs/concepts/projects/environment-variables>
- **Vercel CLI**: <https://vercel.com/docs/cli>
- **React Environment Variables**: <https://create-react-app.dev/docs/adding-custom-environment-variables/>
- **Build Configuration**: <https://vercel.com/docs/build-step>

---

**✅ Sau khi hoàn thành, ứng dụng sẽ sẵn sàng sử dụng trên Vercel!**

---

## ✅ Kiểm Tra Cấu Hình

### 1. Kiểm Tra Qua Vercel Dashboard

1. Vào **Settings → Environment Variables**
2. Xác nhận tất cả biến đã được thêm
3. Kiểm tra **Environment** = **Production**

### 2. Kiểm Tra Qua CLI

```bash
# Xem tất cả environment variables
vercel env ls

# Xem giá trị của một biến (sẽ bị ẩn)
vercel env pull .env.vercel
```

### 3. Kiểm Tra Trong Browser

1. Mở ứng dụng production: **<https://mia-warehouse-management-dn9edu8fq.vercel.app>**
2. Mở **Developer Tools** (F12)
3. Vào tab **Console**
4. Gõ: `console.log(process.env)`
5. Kiểm tra các biến `REACT_APP_*`

---

## 🔍 Danh Sách Đầy Đủ Environment Variables

### **API Configuration**

```env
REACT_APP_API_URL=https://your-backend-api.com
REACT_APP_API_BASE_URL=https://your-backend-api.com/api
REACT_APP_AI_SERVICE_URL=https://your-ai-service.com
REACT_APP_API_TIMEOUT=30000
REACT_APP_API_RETRY_ATTEMPTS=3
```

### **Google Services**

```env
REACT_APP_GOOGLE_SHEETS_SPREADSHEET_ID=18B1PIhCDmBWyHZytvOcfj_1QbYBwczLf1x1Qbu0E5As
REACT_APP_GOOGLE_DRIVE_FOLDER_ID=1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs74OgvE2upms
REACT_APP_GOOGLE_APPS_SCRIPT_ID=your_script_id
REACT_APP_GOOGLE_MAPS_API_KEY=your_maps_api_key
```

### **Features Flags**

```env
REACT_APP_FEATURE_GOOGLE_SHEETS=true
REACT_APP_FEATURE_GOOGLE_DRIVE=true
REACT_APP_FEATURE_GOOGLE_APPS_SCRIPT=true
REACT_APP_FEATURE_TELEGRAM=true
REACT_APP_FEATURE_AUTOMATION=true
REACT_APP_FEATURE_ANALYTICS=true
```

### **UI Configuration**

```env
REACT_APP_THEME=light
REACT_APP_LANGUAGE=vi
REACT_APP_TIMEZONE=Asia/Ho_Chi_Minh
REACT_APP_DATE_FORMAT=DD/MM/YYYY
REACT_APP_TIME_FORMAT=HH:mm
```

### **Performance & Monitoring**

```env
REACT_APP_ENABLE_ANALYTICS=true
REACT_APP_ENABLE_PERFORMANCE_MONITORING=true
REACT_APP_ENABLE_ERROR_REPORTING=true
REACT_APP_MONITORING_ENABLED=true
REACT_APP_HEALTH_CHECK_INTERVAL=30000
REACT_APP_LOG_LEVEL=info
```

### **Security**

```env
REACT_APP_ENABLE_CSP=true
REACT_APP_ENABLE_HSTS=true
REACT_APP_ENABLE_XSS_PROTECTION=true
```

### **External Services (Optional)**

```env
REACT_APP_TELEGRAM_CHAT_ID=-4818209867
REACT_APP_SENTRY_DSN=your_sentry_dsn
REACT_APP_GOOGLE_ANALYTICS_ID=your_ga_id
REACT_APP_HOTJAR_ID=your_hotjar_id
```

---

## 🐛 Troubleshooting

### **Vấn Đề 1: Environment Variables Không Hoạt Động**

**Nguyên nhân:**

- Chưa redeploy sau khi thêm biến
- Biến chưa được set cho **Production** environment
- Tên biến sai (phải bắt đầu bằng `REACT_APP_`)

**Giải pháp:**

1. Kiểm tra lại trong Vercel Dashboard
2. Redeploy lại project
3. Clear browser cache và thử lại

### **Vấn Đề 2: API Calls Fail**

**Nguyên nhân:**

- `REACT_APP_API_URL` chưa được set hoặc sai
- Backend API chưa chạy hoặc CORS chưa được cấu hình

**Giải pháp:**

1. Kiểm tra `REACT_APP_API_URL` trong Vercel Dashboard
2. Test backend API trực tiếp: `curl https://your-backend-api.com/health`
3. Kiểm tra CORS settings trong backend

### **Vấn Đề 3: Google Services Không Hoạt Động**

**Nguyên nhân:**

- Google Sheets/Drive IDs chưa đúng
- Service account chưa được share quyền

**Giải pháp:**

1. Kiểm tra Google Sheets ID trong URL
2. Kiểm tra Google Drive Folder ID
3. Đảm bảo service account có quyền Editor

---

## 📚 Tài Liệu Tham Khảo

- **Vercel Environment Variables**: <https://vercel.com/docs/concepts/projects/environment-variables>
- **Vercel CLI**: <https://vercel.com/docs/cli>
- **React Environment Variables**: <https://create-react-app.dev/docs/adding-custom-environment-variables/>

---

## 🎯 Quick Start Checklist

- [ ] Đăng nhập Vercel Dashboard
- [ ] Vào Settings → Environment Variables
- [ ] Thêm `REACT_APP_API_URL`
- [ ] Thêm `REACT_APP_GOOGLE_SHEETS_SPREADSHEET_ID`
- [ ] Thêm `REACT_APP_GOOGLE_DRIVE_FOLDER_ID`
- [ ] Thêm các feature flags (optional)
- [ ] Redeploy project
- [ ] Test ứng dụng production
- [ ] Verify environment variables hoạt động

---

**✅ Sau khi hoàn thành, ứng dụng sẽ sẵn sàng sử dụng!**
