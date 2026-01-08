# 🔍 Hướng dẫn tìm nút Layout Configuration

**Ngày tạo:** 2025-01-06  
**Cập nhật lần cuối:** 2025-01-07  
**Status:** ✅ Active  
**Tác giả:** AI Code Assistant

---

## 📍 Vị trí nút trong giao diện

Nút **Layout Configuration** được đặt ở **góc phải trên** của Header, trong nhóm Quick Actions Toolbar, cạnh các nút Refresh, Dark/Light mode, và Notifications.

### ✅ Đặc điểm nhận dạng:

1. **Icon**: Layout (4 ô vuông nhỏ) - KHÔNG phải icon Settings (bánh răng)
2. **Vị trí**: Header > Góc phải > Quick Actions Toolbar
3. **Badge**: Có chấm tím nhỏ ở góc trên bên phải của nút
4. **Tooltip**: Hiển thị "Cấu hình Layout - Quản lý hiển thị và bố cục" khi hover
5. **Hiệu ứng**:
   - Hover để thấy viền tím (`border-purple-400` / `border-purple-600`)
   - Icon xoay nhẹ 12 độ khi hover (`rotate-12`)
   - Scale lớn lên một chút (`scale-105`)
   - Ripple effect với gradient tím
   - Animated border pulse khi hover

### 🎯 Cách tìm:

1. **Mở dashboard** → `http://localhost:3000/dashboard`
2. **Nhìn lên Header** (thanh trên cùng)
3. **Tìm ở góc phải** - sẽ thấy thứ tự từ trái sang phải:
   ```
   [System Status Bar] [🔄 Refresh] [📊 Layout] [🌙 Dark Mode] [🔔 Notifications] [👤 User]
                                          ↑
                                    Nút này đây!
   ```

### 📐 Cấu trúc Component:

Nút Layout Configuration được tách thành component riêng:

- **File**: `src/components/layout/Header/components/LayoutConfigButton.jsx`
- **Props**:
  - `onLayoutConfigOpen`: Function để mở Layout Configuration Manager
  - `themeClasses`: Object chứa các class CSS cho theme

### 🎨 Chi tiết UI:

#### **Kích thước và Spacing:**

- Padding: `p-3` (12px)
- Border radius: `rounded-xl` (12px)
- Icon size: `20px` (lớn hơn các nút khác)

#### **Màu sắc:**

- **Default**: Màu text theo theme
- **Hover**:
  - Icon: `text-purple-600` (light) / `text-purple-400` (dark)
  - Border: `border-purple-400` (light) / `border-purple-600` (dark)
- **Badge**: `bg-purple-500` với opacity 80%, tăng lên 100% khi hover

#### **Animations:**

- **Transform**: `hover:scale-105` (tăng 5%)
- **Icon rotation**: `group-hover:rotate-12` (xoay 12 độ)
- **Ripple effect**: Gradient từ purple-500 đến indigo-500
- **Border pulse**: Animated pulse với border-purple-500

### 🔧 Test nút:

#### **Cách test cơ bản:**

1. Hover vào nút → Kiểm tra tooltip hiển thị
2. Click vào nút → Kiểm tra Layout Configuration Manager modal mở ra
3. Kiểm tra responsive → Nút vẫn hiển thị trên mobile/tablet

#### **Test responsive:**

- **Desktop** (> 1024px): Nút hiển thị đầy đủ với tooltip
- **Tablet** (768px - 1024px): Nút vẫn hiển thị, tooltip có thể bị cắt
- **Mobile** (< 768px): Nút có thể bị ẩn nếu không đủ không gian

### ❓ Nếu vẫn không thấy:

1. **Kiểm tra responsive**:

   - Ở màn hình nhỏ có thể bị ẩn do không đủ không gian
   - System Status Bar sẽ ẩn ở màn hình < 1280px (xl breakpoint)

2. **Kiểm tra theme**:

   - Có thể bị ẩn do CSS theme
   - Thử chuyển đổi Dark/Light mode

3. **Check console**:

   - F12 để mở DevTools
   - Xem có lỗi JavaScript không
   - Kiểm tra component có được import đúng không

4. **Refresh page**:

   - Ctrl + F5 (Windows/Linux) hoặc Cmd + Shift + R (Mac)
   - Để refresh hoàn toàn và clear cache

5. **Kiểm tra import**:
   - Đảm bảo `LayoutConfigButton` được import trong `Header.jsx`
   - Kiểm tra `onLayoutConfigOpen` prop được truyền đúng

### 🎨 Cải tiến đã thêm:

- ✅ Icon lớn hơn (20px thay vì 18px) để dễ nhận biết
- ✅ Border highlight khi hover với màu tím
- ✅ Badge indicator màu tím ở góc trên bên phải
- ✅ Tooltip chi tiết hơn với 3 dòng thông tin
- ✅ Hiệu ứng hover tốt hơn với nhiều animation layers
- ✅ Ripple effect với gradient background
- ✅ Animated border pulse khi hover
- ✅ Responsive design cho mọi kích thước màn hình

### 📝 Code Reference:

```jsx
// LayoutConfigButton component
<LayoutConfigButton
  onLayoutConfigOpen={onLayoutConfigOpen}
  themeClasses={themeClasses}
/>
```

### 🔗 Liên kết:

- **Component file**: `src/components/layout/Header/components/LayoutConfigButton.jsx`
- **Header file**: `src/components/layout/Header/Header.jsx`
- **Layout Manager**: `src/components/layout/LayoutConfigManager.jsx`

---

**Lưu ý**: Nút này điều khiển `LayoutConfigManager` modal để cấu hình layout và widgets của dashboard. Khi click, modal sẽ mở ra cho phép bạn quản lý hiển thị của các widget trên từng trang.
