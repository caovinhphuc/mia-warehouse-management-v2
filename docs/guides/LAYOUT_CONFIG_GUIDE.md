# 🎛️ Hướng dẫn sử dụng Layout Configuration Manager

**Ngày tạo:** 2025-01-06  
**Cập nhật lần cuối:** 2025-01-07  
**Status:** ✅ Active  
**Tác giả:** AI Code Assistant

---

## 📋 Tổng quan

Layout Configuration Manager là công cụ mạnh mẽ để quản lý và tùy chỉnh giao diện hiển thị cho tất cả các trang trong ứng dụng. Bạn có thể:

- ✅ Ẩn/hiện các widget theo từng trang
- ✅ Tùy chỉnh bố cục cho Desktop, Tablet, Mobile
- ✅ Quản lý vị trí và kích thước của các thành phần
- ✅ Đặt lại cấu hình về mặc định
- ✅ Xem trước bố cục trước khi áp dụng

## 🚀 Cách truy cập

### 1. Từ Header (Cách chính)

1. Tìm nút **Layout Configuration** (icon 4 ô vuông) ở góc phải Header
2. Nút nằm trong Quick Actions Toolbar, cạnh nút Refresh và Dark Mode
3. Click vào nút để mở Layout Configuration Manager
4. Nút có hiệu ứng hover đẹp mắt với animation và tooltip chi tiết

### 2. Từ Keyboard Shortcut (Nếu được cài đặt)

- Sử dụng phím tắt `Ctrl + L` (Windows/Linux) hoặc `Cmd + L` (Mac)

### 3. Từ Demo Page

- Truy cập: `http://localhost:3000/layout-demo` (nếu có)
- Xem hướng dẫn từng bước chi tiết
- Thực hành trực tiếp với giao diện

## 🎯 Cách sử dụng chi tiết

### **Bước 1: Chọn trang cần cấu hình**

1. **Sidebar bên trái** hiển thị danh sách tất cả các trang
2. Các trang được **nhóm theo danh mục** (Dashboard, Orders, Inventory, Staff, v.v.)
3. Click vào trang bạn muốn cấu hình
4. Trang được chọn sẽ có:

   - **Màu xanh** background (`bg-blue-100` / `bg-blue-900/30`)
   - **Icon mũi tên xuống** (`ChevronDown`) thay vì mũi tên phải
   - **Border trái màu xanh** (`border-l-4 border-blue-500`)
   - **Chấm xanh nhấp nháy** (`animate-pulse`) bên phải

5. **Tìm kiếm trang**: Sử dụng ô tìm kiếm ở đầu sidebar để lọc nhanh

### **Bước 2: Chọn chế độ hiển thị**

Ở phần trên bên phải, chọn một trong 3 chế độ:

- 📱 **Mobile** (màu xanh lá - `bg-green-600`)

  - Dành cho điện thoại (< 768px)
  - Layout tối ưu cho màn hình nhỏ
  - Single column layout

- 📟 **Tablet** (màu xanh dương - `bg-blue-600`)

  - Dành cho máy tính bảng (768px - 1024px)
  - Layout cân bằng giữa mobile và desktop
  - 2-3 column layout

- 🖥️ **Desktop** (màu tím - `bg-purple-600`)
  - Dành cho máy tính để bàn (> 1024px)
  - Layout đầy đủ với nhiều cột
  - 4+ column layout

**Lưu ý**: Mỗi chế độ có cấu hình riêng biệt, thay đổi ở Mobile không ảnh hưởng Desktop.

### **Bước 3: Quản lý Widget**

Trong phần **"Quản lý widget hiện tại"**:

#### ✅ Ẩn/Hiện Widget

- **Widget đang hiển thị**:

  - Nền xanh lá (`bg-green-50` / `bg-green-900/20`)
  - Border xanh (`border-green-200` / `border-green-800`)
  - Icon 👁️ Eye màu xanh lá
  - Nút "Hiện" màu xanh lá

- **Widget đã ẩn**:

  - Nền xám (`bg-gray-50` / `bg-gray-900/20`)
  - Border xám (`border-gray-200` / `border-gray-700`)
  - Icon 👁️‍🗨️ EyeOff màu xám
  - Nút "Ẩn" màu xám

- **Cách toggle**: Click nút **"Hiện"/"Ẩn"** để chuyển đổi trạng thái
- **Animation**: Có smooth transition khi chuyển đổi (100ms delay)

#### 📊 Thông tin Widget

Mỗi widget hiển thị:

- **Tên widget** và mô tả (nếu có)
- **Vị trí**: Hàng (`row`), cột (`col`) trong lưới
- **Kích thước**: Chiều rộng x chiều cao (`width x height`)

### **Bước 4: Xem trước bố cục**

Phần **"Xem trước bố cục"** cho thấy:

- Cách các widget được sắp xếp trong grid
- Kích thước tương đối của từng widget
- Chỉ hiển thị các widget đang được bật (`visible: true`)
- Grid layout tự động điều chỉnh theo số cột của layout

## 🔧 Các tính năng nâng cao

### **Reset Layout**

1. **Đặt lại trang hiện tại**:

   - Nút "Đặt lại" ở góc phải trên
   - Chỉ reset layout của trang đang chọn
   - Không ảnh hưởng các trang khác

2. **Đặt lại tất cả**:
   - Nút "Đặt lại tất cả" ở sidebar trái (dưới cùng)
   - ⚠️ **Cảnh báo**: Sẽ xóa toàn bộ cấu hình tùy chỉnh của tất cả trang
   - Có confirm dialog trước khi thực hiện

### **Tìm kiếm trang**

- Ô tìm kiếm ở đầu sidebar trái
- Gõ tên trang để lọc nhanh
- Tìm kiếm real-time (không cần Enter)
- Hỗ trợ tìm theo tên hoặc path

### **Responsive Design**

- Mỗi chế độ hiển thị có cấu hình riêng biệt
- Thay đổi ở Mobile không ảnh hưởng Desktop
- Tự động lưu khi thay đổi (sử dụng LayoutContext)
- Layout được lưu trong localStorage hoặc backend

### **Loading States**

- Hiển thị spinner khi đang tải dữ liệu
- Transition states khi chuyển trang/chế độ
- Smooth animations (150ms delay) để UX tốt hơn

## 🎨 Giao diện và UX

### **Hiệu ứng Animation**

- ✨ Smooth transitions khi chuyển trang/chế độ (300ms)
- 🔄 Loading states với spinner (border-purple-500)
- 🎯 Hover effects trên các button (scale-105)
- 📱 Responsive design cho mọi kích thước màn hình
- 🎭 Opacity transitions khi switching (opacity-75)

### **Theme Support**

- 🌙 Tự động adapt với Dark/Light mode
- 🎨 Consistent color scheme với themeClasses
- 📐 Proper spacing và typography
- 🔄 Dynamic color changes theo theme

### **Visual Feedback**

- 🟢 Màu xanh cho widget đang hiển thị
- ⚫ Màu xám cho widget đã ẩn
- 🔵 Indicator cho trang đang được chọn
- ⏳ Loading states trong quá trình chuyển đổi
- 🎯 Active state cho view mode buttons

### **Modal Design**

- Backdrop blur với `bg-black/50`
- Max width: `max-w-6xl` (1152px)
- Max height: `max-h-[90vh]` với scroll
- Rounded corners: `rounded-xl`
- Shadow: `shadow-2xl`
- Transform animations: `scale-100` / `scale-95`

## 📱 Responsive Usage

### **Desktop** (1024px+)

- Full sidebar với search (col-span-1)
- Main content area (col-span-3)
- Grid layout 4 cột cho preview
- Đầy đủ tooltips và labels
- View mode buttons với text labels

### **Tablet** (768px - 1024px)

- Compact sidebar
- Grid layout 3 cột cho preview
- Simplified labels
- View mode buttons có thể ẩn text (chỉ icon)

### **Mobile** (< 768px)

- Collapsible sidebar (có thể ẩn)
- Single column layout
- Touch-friendly buttons (padding lớn hơn)
- Simplified interface
- View mode buttons chỉ hiển thị icon

## 🔍 Troubleshooting

### **Không thấy widget nào**

- Kiểm tra xem có widget nào được cấu hình cho trang đó không
- Thử reset layout về mặc định
- Kiểm tra console để xem có lỗi load layout không

### **Thay đổi không được lưu**

- Đảm bảo có kết nối internet (nếu sync với server)
- Kiểm tra console để xem có lỗi JavaScript không
- Kiểm tra LayoutContext có hoạt động đúng không
- Thử refresh trang và kiểm tra lại

### **Giao diện không responsive**

- Thử refresh trang (Ctrl + F5)
- Kiểm tra CSS có load đầy đủ không
- Kiểm tra Tailwind CSS có được config đúng không
- Kiểm tra breakpoints trong code

### **Modal không mở**

- Kiểm tra `isOpen` prop có được set đúng không
- Kiểm tra `onLayoutConfigOpen` function có được truyền đúng không
- Kiểm tra console có lỗi không
- Kiểm tra z-index của modal (z-50)

### **Layout không load**

- Kiểm tra LayoutContext có được provide đúng không
- Kiểm tra `layouts` object có dữ liệu không
- Kiểm tra console logs để debug
- Thử reset tất cả layouts

## 💡 Tips & Tricks

1. **Tối ưu hóa trải nghiệm**:

   - Ẩn các widget không cần thiết để tăng performance
   - Chỉ hiển thị widget quan trọng trên mobile

2. **Responsive testing**:

   - Test cấu hình trên nhiều kích thước màn hình
   - Sử dụng DevTools để test responsive

3. **Backup cấu hình**:

   - Export cấu hình trước khi thay đổi lớn
   - Lưu backup trong localStorage hoặc file

4. **User feedback**:

   - Thu thập feedback từ users về bố cục tối ưu
   - A/B testing các layout khác nhau

5. **Performance**:
   - Giảm số lượng widget hiển thị để tăng tốc độ load
   - Sử dụng lazy loading cho widget phức tạp

## 🛠️ Developer Notes

### **Component Structure**

```
LayoutConfigManager/
├── Modal Container (fixed, z-50)
│   ├── Backdrop (bg-black/50)
│   └── Content (max-w-6xl, rounded-xl)
│       ├── Header (Settings icon + title)
│       └── Grid Layout (md:grid-cols-4)
│           ├── Left Sidebar (col-span-1)
│           │   ├── Search Input
│           │   ├── Page List (grouped by category)
│           │   └── Reset All Button
│           └── Right Content (col-span-3)
│               ├── View Mode Selector
│               ├── Widget Management
│               └── Layout Preview
```

### **Key Props**

- `themeClasses`: Theme styling object (surface, border, text, etc.)
- `isOpen`: Control modal visibility (boolean)
- `onClose`: Close handler function

### **Context Integration**

- Uses `LayoutContext` for layout management
- Integrates with theme system via `themeClasses`
- Responsive breakpoints from Tailwind CSS
- State management via React hooks (useState, useEffect)

### **Key Functions**

- `toggleWidgetVisibility(pageId, viewMode, widgetId)`: Toggle widget visibility
- `resetLayout(pageId)`: Reset layout for specific page
- `resetAllLayouts()`: Reset all layouts to default
- `getPageList()`: Get list of all pages
- `getWidgetInfo(widgetId)`: Get widget information

### **File Location**

- **Component**: `src/components/layout/LayoutConfigManager.jsx`
- **Button**: `src/components/layout/Header/components/LayoutConfigButton.jsx`
- **Context**: `src/context/LayoutContext.jsx`

---

**🎉 Chúc bạn sử dụng Layout Configuration Manager hiệu quả!**
