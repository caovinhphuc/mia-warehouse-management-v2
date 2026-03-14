# Config Status - MIA.vn

**Cập nhật:** March 14, 2026

## Build & Toolchain

| Công cụ | Config file | Ghi chú |
|---------|-------------|---------|
| **Vite** | `vite.config.mjs` | Build chính (không dùng Craco cho build) |
| **Jest** | `jest.config.js` | Aliases khớp `vite.config.mjs` |
| **ESLint** | `eslint.config.mjs` | ESLint 9+ flat config |
| **Prettier** | `.prettierrc` | Format code |
| **Babel** | `babel.config.js` | Jest transform |

## Scripts chính

### Development

- `npm start` / `vite` - Dev server
- `npm run dev` - Frontend + Backend

### Build (Vite)

- `npm run build` - Vite build
- `npm run build:prod` - Production (sourcemap)
- `npm run build:minimal` - Không sourcemap (Docker, tiết kiệm RAM)

### Test

- `npm test` - test-wrapper.sh → jest
- `npm run test:watch` - jest --watch
- `npm run test:unit` - jest (không watch)
- `npm run test:coverage` - jest --coverage

### Lint & Format

- `npm run lint` / `npm run lint:fix`
- `npm run format` / `npm run format:check`
- `npm run precommit` - lint + format + test:unit

### Analyze

- `npm run analyze:deps` - Phân tích deps (không build)
- `npm run analyze:size` - Build + kích thước (build/assets/)
- `npm run analyze:sourcemap` - Vite build + source-map-explorer

## Path Aliases (Vite + Jest)

```
@          → src/
@components → src/components
@services   → src/services
@utils      → src/utils
@config     → src/config
@hooks      → src/hooks
@store      → src/store
@constants  → src/constants
@assets     → src/assets
@pages      → src/pages
```

## Output

- **Build**: `build/` (Vite)
- **Assets**: `build/assets/*.js`, `build/assets/*.css`
- **Login**: `build/login/` (entry riêng)
- **Coverage**: `coverage/`

## Ignored Test Files (jest.config)

- `Login.test.jsx`, `ProtectedRoute.test.jsx` - Cần setup thêm
- `App.test.jsx`, `setupTests.js` (pattern)
