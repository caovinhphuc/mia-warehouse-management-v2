# 🚀 Deployment Guide

> **Current Production Deployment:**
>
> - **Frontend**: https://leafy-baklava-595711.netlify.app/ (Netlify)
> - **Backend**: https://react-google-backend.onrender.com (Render)

## Deployment Options

### 1. 🌐 Deploy Frontend to Netlify (Current Setup)

#### Vercel Deployment

```bash
# Install Vercel CLI
npm install -g vercel

# Deploy to Vercel
vercel

# Follow the prompts:
# Set up and deploy: Y
# Link to existing project: N (for first deployment)
# Project name: react-google-integration
# Directory: ./
# Settings override: N
```

#### Netlify Deployment

```bash
# Build the project
npm run build

# Deploy build folder to Netlify:
# 1. Go to https://netlify.com
# 2. Drag and drop the 'build' folder
# 3. Or connect your GitHub repository
```

### 2. ☁️ Deploy Backend to Railway/Render

#### Railway Deployment

```bash
# Install Railway CLI
npm install -g @railway/cli

# Login and deploy
railway login
railway init
railway up
```

#### Render Deployment

1. Push code to GitHub
2. Go to <https://render.com>
3. Create new Web Service
4. Connect your GitHub repository
5. Configure:
   - Build Command: `npm install`
   - Start Command: `node server.js`
   - Environment Variables: Add all from .env

### 3. 🐳 Docker Deployment

#### Dockerfile for Frontend

```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build
EXPOSE 3000
CMD ["npm", "start"]
```

#### Dockerfile for Backend

```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY server.js .
EXPOSE 3001
CMD ["node", "server.js"]
```

#### Docker Compose

```yaml
version: '3.8'
services:
  frontend:
    build: .
    ports:
      - '3000:3000'
    environment:
      - REACT_APP_API_BASE_URL=http://localhost:3001/api
    depends_on:
      - backend

  backend:
    build:
      context: .
      dockerfile: Dockerfile.backend
    ports:
      - '3001:3001'
    environment:
      - PORT=3001
```

### 4. 🖥️ Deploy Backend to Render (Current Setup)

#### Render Deployment Steps

1. **Connect GitHub Repository**

   - Go to [render.com](https://render.com)
   - Login with GitHub
   - "New +" → "Web Service"
   - Connect `caovinhphuc/react-google-integration`

2. **Configure Service**

   ```
   Name: react-google-backend
   Environment: Node
   Region: Oregon (US West)
   Branch: main
   Build Command: npm install
   Start Command: node server.js
   Instance Type: Free
   ```

3. **Environment Variables**
   Add all variables from `.env`:

   ```
   REACT_APP_GOOGLE_CLIENT_EMAIL=your-service-account@project.iam.gserviceaccount.com
   REACT_APP_GOOGLE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----..."
   REACT_APP_GOOGLE_PROJECT_ID=your-project-id
   REACT_APP_GOOGLE_SHEET_ID=your-sheet-id
   REACT_APP_GOOGLE_DRIVE_FOLDER_ID=your-folder-id
   ```

4. **Deploy & Test**
   - Click "Create Web Service"
   - Wait 5-10 minutes for deployment
   - Test backend: `https://your-app.onrender.com/api/health`

### 5. 📱 Environment Variables Setup

For production deployment, set these environment variables:

```bash
# Google Configuration
REACT_APP_GOOGLE_CLIENT_EMAIL=your-service-account@project.iam.gserviceaccount.com
REACT_APP_GOOGLE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nYOUR_PRIVATE_KEY\n-----END PRIVATE KEY-----"
REACT_APP_GOOGLE_PROJECT_ID=your-project-id
REACT_APP_GOOGLE_SHEET_ID=your-sheet-id
REACT_APP_GOOGLE_DRIVE_FOLDER_ID=your-folder-id

# Email Configuration
REACT_APP_EMAIL_SERVICE=gmail
REACT_APP_EMAIL_USER=your-email@gmail.com
REACT_APP_EMAIL_PASS=your-app-password
REACT_APP_ALERT_EMAIL_TO=recipient@example.com

# Telegram (Optional)
REACT_APP_TELEGRAM_BOT_TOKEN=your-bot-token
REACT_APP_TELEGRAM_CHAT_ID=your-chat-id

# Application Settings
REACT_APP_API_BASE_URL=https://your-backend-url.com/api
```

### 5. 🔒 Security Considerations

#### For Production

1. **Never commit .env files**
2. **Use environment-specific configurations**
3. **Enable CORS only for your domain**
4. **Use HTTPS in production**
5. **Implement rate limiting**
6. **Add authentication for sensitive endpoints**

#### Backend Security Updates

```javascript
// Add to server.js for production
const helmet = require('helmet')
const rateLimit = require('express-rate-limit')

app.use(helmet())

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
})
app.use('/api/', limiter)

// Production CORS
const corsOptions = {
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  optionsSuccessStatus: 200,
}
app.use(cors(corsOptions))
```

### 6. 📊 Monitoring & Analytics

#### Add monitoring to server.js

```javascript
// Health check endpoint
app.get('/health', (req, res) => {
  res.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    memory: process.memoryUsage(),
    environment: process.env.NODE_ENV,
  })
})

// Request logging
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`)
  next()
})
```

### 7. 🔄 CI/CD Pipeline

#### GitHub Actions (.github/workflows/deploy.yml)

```yaml
name: Deploy

on:
  push:
    branches: [main]

jobs:
  deploy-frontend:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - name: Setup Node.js
        uses: actions/setup-node@v2
        with:
          node-version: '18'
      - name: Install dependencies
        run: npm install
      - name: Build
        run: npm run build
      - name: Deploy to Vercel
        uses: amondnet/vercel-action@v20
        with:
          vercel-token: ${{ secrets.VERCEL_TOKEN }}
          vercel-org-id: ${{ secrets.ORG_ID}}
          vercel-project-id: ${{ secrets.PROJECT_ID}}

  deploy-backend:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - name: Deploy to Railway
        uses: badsyntax/github-action-railway@v1
        with:
          command: 'up'
          railway-token: ${{ secrets.RAILWAY_TOKEN }}
```

### 8. 🚀 Quick Deploy Commands

```bash
# Deploy everything quickly
chmod +x deploy.sh
./deploy.sh

# Or manual steps:
npm run build                    # Build frontend
vercel --prod                    # Deploy frontend
railway up                       # Deploy backend
```

### 9. 📱 Domain Configuration

#### Custom Domain Setup

1. **Vercel**: Go to project settings → Domains
2. **Netlify**: Go to site settings → Domain management
3. **Railway**: Go to project → Settings → Domains

#### DNS Records

```
Type: CNAME
Name: www
Value: your-app.vercel.app

Type: A
Name: @
Value: [Vercel/Netlify IP]
```

### 10. 🔧 Troubleshooting

#### Common Issues

1. **CORS Error**: Update backend CORS settings
2. **Environment Variables**: Check all vars are set correctly
3. **Google API Errors**: Verify service account permissions
4. **Build Failures**: Check Node.js version compatibility

#### Debug Commands

```bash
# Check environment
printenv | grep REACT_APP

# Test backend health
curl https://your-backend-url.com/api/health

# Check build
npm run build 2>&1 | tee build.log
```

---

🎉 **Your React Google Integration is now ready for production!**
