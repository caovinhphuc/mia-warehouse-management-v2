# 🔧 Cấu Hình Environment Variables cho Vercel

## ⚠️ Vấn Đề Hiện Tại

Frontend đang gọi API đến `http://localhost:3001` (default), nhưng trên production (Vercel) không có backend API chạy, dẫn đến lỗi:

```
Login error: SyntaxError: Failed to execute 'json' on 'Response': Unexpected end of JSON input
```

## ✅ Giải Pháp

### 1. **Cấu Hình Environment Variables trong Vercel**

Truy cập: <https://vercel.com/dashboard> → Chọn project → Settings → Environment Variables

Thêm các biến sau:

#### **Bắt Buộc:**

```bash
REACT_APP_API_URL=https://your-backend-api.com
# hoặc
REACT_APP_API_URL=https://api.yourdomain.com
```

#### **Tùy Chọn (nếu có):**

```bash
REACT_APP_GOOGLE_SHEETS_SPREADSHEET_ID=your-spreadsheet-id
REACT_APP_GOOGLE_DRIVE_FOLDER_ID=your-folder-id
REACT_APP_WS_URL=wss://your-websocket-server.com
```

### 2. **Sau Khi Thêm Environment Variables**

1. **Redeploy** application:

   ```bash
   vercel --prod
   ```

   hoặc từ Vercel Dashboard: Deployments → Redeploy

2. **Kiểm tra** environment variables đã được load:
   - Mở browser console
   - Check `process.env.REACT_APP_API_URL`

### 3. **Backend API Options**

#### **Option A: Deploy Backend riêng**

- Deploy Python Flask API lên:
  - Heroku
  - Railway
  - Render
  - DigitalOcean
  - AWS/GCP/Azure

#### **Option B: Vercel Serverless Functions**

- Tạo API routes trong `/api` folder
- Vercel sẽ tự động deploy như serverless functions

#### **Option C: Sử dụng API Proxy**

- Tạo Vercel serverless function để proxy requests đến backend

### 4. **Test Sau Khi Cấu Hình**

1. Mở: <https://mia-warehouse-management.vercel.app/login>
2. Thử login
3. Check browser console để xem API calls
4. Verify API URL đúng

## 📋 Checklist

- [ ] Đã thêm `REACT_APP_API_URL` trong Vercel Environment Variables
- [ ] Đã redeploy application
- [ ] Backend API đang chạy và accessible
- [ ] Test login thành công
- [ ] Không còn lỗi "Unexpected end of JSON input"

## 🔗 Links Hữu Ích

- Vercel Environment Variables: <https://vercel.com/docs/concepts/projects/environment-variables>
- Vercel Serverless Functions: <https://vercel.com/docs/functions>
- Deploy Python API: <https://vercel.com/docs/functions/serverless-functions/runtimes/python>
