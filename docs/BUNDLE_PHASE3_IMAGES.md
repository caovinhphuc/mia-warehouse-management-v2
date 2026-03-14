# Phase 3: Image Optimization, Lazy Loading & PWA

## Đã triển khai

### 1. Lazy loading cho img

- **GoogleDriveIntegration.jsx**: Thêm `loading="lazy"`, `decoding="async"` cho image preview

### 2. LazyImage component

- **File**: `src/components/Common/LazyImage.jsx`
- **Dùng**: Thay `<img>` khi cần lazy load (ảnh below-the-fold)

```jsx
import LazyImage from "@/components/Common/LazyImage"

<LazyImage src="/path/to/image.png" alt="Description" />
```

### 3. Script audit ảnh

```bash
npm run optimize:images:analyze
```

## Best practices

- `loading="lazy"`: Ảnh ngoài viewport không tải ngay
- `decoding="async"`: Giải mã ảnh không block main thread
- Above-the-fold ảnh: Không cần lazy (logo, hero) → dùng `<img>` thường
- WebP: Dùng `<picture>` hoặc build step convert PNG/JPG → WebP

---

## Service Worker & PWA (Phase 3.2)

### Đã triển khai

- **vite-plugin-pwa** – Service Worker + precache
- **Workbox** – Caching strategy: precache JS, CSS, HTML, assets
- **autoUpdate** – Tự cập nhật khi có version mới

### Output

- `build/sw.js` – Service Worker
- `build/workbox-*.js` – Workbox runtime
- precache ~56 entries (build assets)

### Caching

- Static: precache toàn bộ build output
- `cleanupOutdatedCaches`, `skipWaiting`, `clientsClaim`

### PWA Update Prompt (Phase 3.3)

- **File**: `src/components/Common/PWAUpdatePrompt.jsx`
- **Chức năng**: Hiện toast khi có phiên bản mới hoặc app sẵn sàng offline
- **Dùng**: useRegisterSW từ `virtual:pwa-register/react`
- **Vị trí**: Gắn trong App.jsx
