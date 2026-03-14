# So sánh Dự án hiện tại với MIA React Theme System – Đề xuất nâng cấp

**Ngày:** 2026-02-09
**Đối chiếu:** Codebase hiện tại vs `MIA-REACT-THEME-SYSTEM.md`

---

## 1. Tổng quan khác biệt

| Hạng mục | MIA-REACT-THEME-SYSTEM.md (Chuẩn) | Dự án hiện tại | Khác biệt |
|----------|-----------------------------------|----------------|-----------|
| **Theme Context** | `ThemeProvider` + `useTheme()` → theme, toggleTheme, setTheme, colors, spacing, breakpoints, setThemePreferences | Không có. Chỉ có `LayoutContext` (layout/widget), `ConfigProvider` Ant Design | Thiếu layer theme React, không có hook useTheme |
| **Dark/Light** | `data-theme="light"|"dark"` trên `<html>`, localStorage +`prefers-color-scheme`, ThemeToggle component | Chưa có. `BRAND_CONFIG.theme.mode` và `features.darkMode: true` không được dùng | Không có dark mode thực tế |
| **CSS Variables** | `:root` và `[data-theme="dark"]` với palette đầy đủ (primary 50–900, semantic, surface, text, border), typography, spacing, shadow, transition | `global.css` dùng màu hex/rgba cố định (#1e293b, #f8fafc, #e2e8f0, rgba(...)) | Không có design tokens, khó đổi theme/accessibility |
| **Cấu trúc CSS** | `main.css` → base (reset, typography, layout) → themes (light.css, dark.css) → components → utilities | Một `global.css` + từng component có file .css riêng, không tách base/themes/utilities | Không tách lớp, khó bảo trì |
| **Ant Design** | Doc không nói rõ tích hợp Ant Design | Dùng `ConfigProvider` với `theme.defaultAlgorithm`, `token.colorPrimary`, `token.borderRadius` từ BRAND_CONFIG | Chỉ light; không đổi algorithm theo dark |
| **Brand config** | Gợi ý preset (default, warm, cool, nature) + dynamic theme | `brand.js`: colors, theme.mode, features.darkMode; không có preset, không dùng cho toggle | Config có sẵn nhưng chưa nối với UI theme |
| **Responsive** | Breakpoints CSS vars, container, grid, mobile-first, visibility utilities | global.css có media queries rải rác; không có hệ breakpoint/spacing chuẩn | Thiếu hệ thống responsive thống nhất |
| **Component styling** | .btn, .card, .form-control dùng var(--color-*), var(--spacing-*) | Component dùng Ant Design + CSS riêng với giá trị cố định | Custom component không theo design tokens |

---

## 2. Ưu / nhược điểm

### 2.1 Dự án hiện tại

| Ưu điểm | Nhược điểm |
|----------|-------------|
| Đơn giản: chỉ ConfigProvider + brand.js, ít file. | Không có dark mode. |
| Ant Design nhất quán (component, token colorPrimary). | Màu/spacing hardcode trong CSS → khó đổi theme, khó a11y. |
| LayoutContext tách biệt layout, không lẫn với theme. | Không có useTheme → component không lấy theme/colors/spacing từ context. |
| Đã có lazy route, Suspense, BRAND_CONFIG. | BRAND_CONFIG.theme / features.darkMode không được dùng. |
| Build ổn (Vite), không phụ thuộc thêm theme layer. | Custom components (layout, cards, sidebar) không dùng design tokens. |

### 2.2 Chuẩn MIA-REACT-THEME-SYSTEM (theo doc)

| Ưu điểm | Nhược điểm |
|----------|-------------|
| Dark/Light + localStorage + system preference. | Thêm Context + CSS structure → nhiều file hơn. |
| Design tokens (màu, typography, spacing, shadow) → dễ đổi theme, a11y. | Cần refactor CSS hiện tại sang var(). |
| useTheme() → component dùng colors/spacing/breakpoints thống nhất. | Phải tích hợp với Ant Design (algorithm dark/light). |
| Theme presets, tùy chỉnh màu. | Preset/color picker cần thời gian implement. |
| Mobile-first, breakpoints rõ. | Một phần đã có trong Ant Design responsive. |

---

## 3. Đề xuất cải thiện và lộ trình nâng cấp

### Phase 1 – Dark mode + Theme Context (ưu tiên cao, 1–2 ngày)

**Mục tiêu:** Có dark/light thật, lưu preference, đồng bộ Ant Design.

| Bước | Việc | Chi tiết |
|------|------|----------|
| 1.1 | Tạo `ThemeContext` | `src/contexts/ThemeContext.jsx`: state `theme` ('light'\|'dark'), `getInitialTheme()` (localStorage → prefers-color-scheme), `toggleTheme`, `setTheme`. Provider set `document.documentElement.setAttribute('data-theme', theme)` và `localStorage.setItem('theme', theme)`. |
| 1.2 | Tích hợp Ant Design | Trong App.jsx: dùng `useTheme()` (hoặc theme từ context). ConfigProvider: `algorithm: theme === 'dark' ? theme.darkAlgorithm : theme.defaultAlgorithm`, giữ `token: { colorPrimary: BRAND_CONFIG.colors.primary, borderRadius: 8 }`. |
| 1.3 | Bọc App bằng ThemeProvider | Cấp trên hoặc ngang LayoutProvider: `<ThemeProvider><LayoutProvider>...</LayoutProvider></ThemeProvider>`. |
| 1.4 | Thêm ThemeToggle | Component nhỏ (icon ☀️/🌙 hoặc Switch Ant Design), gọi `toggleTheme`, đặt trong Layout (header/sidebar). aria-label cho a11y. |
| 1.5 | CSS tối thiểu cho dark | Trong `global.css` (hoặc file riêng): `[data-theme="dark"] { --color-bg: #0f172a; --color-text: #f8fafc; }` và áp cho body/main (background, color). Có thể dùng ít biến (--color-bg, --color-text, --color-border) trước, chưa cần full palette. |

**Kết quả:** User bật/tắt dark, preference lưu, Ant Design đổi theo theme.

---

### Phase 2 – CSS Variables (design tokens) từ từ (3–5 ngày)

**Mục tiêu:** Giảm hardcode, chuẩn bị cho theme/preset sau này.

| Bước | Việc | Chi tiết |
|------|------|----------|
| 2.1 | Khai báo biến trong global.css | Thêm `:root` với ít token: --color-primary, --color-background, --color-surface, --color-text, --color-text-secondary, --color-border, --spacing-2, --spacing-4, --radius-md. `[data-theme="dark"]` override các màu tương ứng. |
| 2.2 | Thay thế dần trong global.css | Thay #f8fafc → var(--color-background), #1e293b → var(--color-text), #e2e8f0 → var(--color-border), 24px → var(--spacing-6) (nếu đã định nghĩa). |
| 2.3 | Mở rộng tokens (tùy chọn) | Thêm primary-50..900, shadow, font-size nếu cần đồng bộ với doc (làm dần, không bắt buộc ngay). |

**Kết quả:** Màu/nền chính dùng CSS variables, đổi theme chỉ cần sửa giá trị biến.

---

### Phase 3 – ThemeContext mở rộng (tùy chọn, 1–2 ngày)

**Mục tiêu:** Trùng với doc: colors, spacing, breakpoints trong context; preset.

| Bước | Việc | Chi tiết |
|------|------|----------|
| 3.1 | Context trả thêm colors/spacing | ThemeContext export object `colors` (surface, text, border, primary…), `spacing` (xs, sm, md…) map từ CSS vars hoặc constant. useTheme() trả { theme, toggleTheme, colors, spacing }. |
| 3.2 | Preset (optional) | themePresets (default, warm, cool, nature) như doc; applyThemePreset(id) đổi token (primary, secondary) và set vào state; lưu preset id vào localStorage. |
| 3.3 | Tài liệu nội bộ | Ghi trong README hoặc CONTRIBUTING: "Theme: dùng useTheme(), không đọc document.documentElement.getAttribute('data-theme')". |

**Kết quả:** Component có thể dùng useTheme().colors / .spacing; có thể chọn preset.

---

### Phase 4 – Cấu trúc CSS (dài hạn, làm khi refactor lớn)

**Mục tiêu:** Gần với doc: base / themes / components / utilities.

| Bước | Việc | Chi tiết |
|------|------|----------|
| 4.1 | Tách file (khi sửa CSS lớn) | `src/styles/base/reset.css`, `typography.css`, `layout.css`; `themes/light.css`, `dark.css` (chỉ chứa :root và [data-theme="dark"]); `utilities/spacing.css`, `colors.css`. `main.css` hoặc `index.css` import theo thứ tự: base → themes → components → utilities. |
| 4.2 | Component CSS | Từ từ chuyển component dùng var(--color-*), var(--spacing-*) thay vì giá trị cố định. |

**Lưu ý:** Có thể hoãn Phase 4 đến khi cần refactor giao diện lớn; Phase 1–2 đã đủ để có dark mode và tokens cơ bản.

---

## 4. Bảng so sánh nhanh sau khi nâng cấp

| Tiêu chí | Hiện tại | Sau Phase 1 | Sau Phase 2 | Sau Phase 3–4 |
|----------|-----------|-------------|-------------|----------------|
| Dark mode | ❌ | ✅ | ✅ | ✅ |
| Theme lưu preference | ❌ | ✅ | ✅ | ✅ |
| Ant Design theo theme | Chỉ light | ✅ dark/light | ✅ | ✅ |
| CSS variables | ❌ | Một vài biến | ✅ tokens cơ bản | ✅ đầy đủ |
| useTheme() | ❌ | theme, toggle | + colors/spacing (nếu thêm) | ✅ + preset |
| Cấu trúc CSS | 1 file + component | Giữ nguyên | Giữ nguyên | base/themes/utilities |
| Preset theme | ❌ | ❌ | ❌ | ✅ (optional) |

---

## 5. Checklist triển khai (ưu tiên)

- [ ] **Phase 1.1** – Tạo `src/contexts/ThemeContext.jsx` (theme, setTheme, toggleTheme, getInitialTheme, data-theme + localStorage).
- [ ] **Phase 1.2** – App.jsx: ConfigProvider dùng `theme.darkAlgorithm` khi theme === 'dark'.
- [ ] **Phase 1.3** – Bọc app bằng `<ThemeProvider>`.
- [ ] **Phase 1.4** – ThemeToggle trong Layout (header/sidebar), aria-label.
- [ ] **Phase 1.5** – global.css: `[data-theme="dark"]` với --color-bg, --color-text (và áp cho body/main).
- [ ] **Phase 2.1** – :root + [data-theme="dark"] với design tokens tối thiểu.
- [ ] **Phase 2.2** – Thay màu/spacing hardcode trong global.css bằng var().
- [ ] **Phase 3** (optional) – ThemeContext trả colors/spacing; preset selector.
- [ ] **Phase 4** (optional) – Tách base/themes/utilities khi refactor CSS.

---

## 6. Kết luận

- **Khác biệt lớn nhất:** Dự án hiện tại không có Theme Context, không dark mode, không design tokens (CSS variables); chuẩn doc có đủ và có cấu trúc CSS rõ.
- **Ưu tiên:** Làm Phase 1 (ThemeContext + dark mode + Ant Design + ThemeToggle + ít CSS vars) trước để đạt lợi ích lớn với ít thay đổi. Phase 2 dùng CSS variables dần; Phase 3–4 khi cần preset và refactor CSS.
- **Tích hợp Ant Design:** Luôn dùng `algorithm: theme.darkAlgorithm / theme.defaultAlgorithm` theo state theme từ ThemeContext; giữ token (colorPrimary, borderRadius) từ BRAND_CONFIG để vừa dark/light vừa giữ brand.

Sau khi xong Phase 1 + 2, dự án sẽ vừa tương thích với mô tả trong MIA-REACT-THEME-SYSTEM.md (dark/light, tokens), vừa giữ được cách làm hiện tại (Ant Design, LayoutContext, brand.js).
