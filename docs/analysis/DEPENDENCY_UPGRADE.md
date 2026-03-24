# Cải thiện Dependencies & Docker Build

**Cập nhật:** March 14, 2026

## Đã thực hiện

### 1. Docker build – giảm memory

- **Vấn đề**: Build crash `ResourceExhausted: cannot allocate memory` khi dùng `build:prod` (GENERATE_SOURCEMAP=true)
- **Giải pháp**: Dockerfile dùng `build:minimal` (GENERATE_SOURCEMAP=false) – giảm ~30–50% RAM khi build
- **File**: `Dockerfile` line 25

### 2. Loại bỏ dependencies không dùng (backend-only)

Đã gỡ khỏi root `package.json` (backend có package.json riêng):

| Gỡ bỏ           | Lý do                      |
|-----------------|----------------------------|
| cors            | Backend only               |
| express         | Backend only               |
| formidable      | Backend only               |
| multer          | Backend only               |
| node-cron       | Backend only               |
| swagger-jsdoc   | Backend only               |
| swagger-ui-express | Backend only            |
| lucide-react    | Không dùng trong src       |
| assert, process, url, util | Chỉ cần trong môi trường build (Node) |

### 3. Import `lazyLoad` trong example

- **File**: `src/routes/lazyRoutes.example.js` dùng `../utils/lazyLoad` (relative path)
- **Lưu ý**: `@utils` alias có trong vite.config.mjs và jest.config.js; cả hai đều hợp lệ

### 4. Cập nhật .npmrc

- **Bỏ**: `auto-install-peers`, `strict-peer-dependencies`, `shamefully-hoist` (deprecated trên npm mới)
- **Thêm**: `legacy-peer-deps=true` nếu cần tương thích

## Kiểm tra sau khi cập nhật

```bash
# Cài lại dependencies
npm install

# Chạy depcheck
npx depcheck

# Build (local, Vite)
npm run build:minimal

# Docker
./deploy.sh docker
```

## Ghi chú

- Nếu Docker vẫn thiếu RAM: tăng memory cho Docker Desktop (Settings → Resources → Memory, ví dụ 4GB+)
- `build:prod` vẫn dùng sourcemap cho development; Docker dùng `build:minimal`
- **Port 3001**: Trước khi `./deploy.sh docker`, tắt backend dev (hoặc `lsof -i :3001` → `kill <PID>`) nếu bị lỗi `address already in use`
