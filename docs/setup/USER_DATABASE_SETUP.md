# 👥 Hướng dẫn Setup User Database trong Google Sheets

## 📋 **Tạo Sheet "Users" cho Authentication**

### 1️⃣ **Tạo Sheet mới trong Google Sheets hiện tại**

1. Mở Google Sheets đã có (Spreadsheet ID trong `.env`)
2. Nhấn **➕** để tạo sheet mới
3. Đổi tên sheet thành **"Users"**

### 2️⃣ **Cấu trúc dữ liệu (Header Row A1:F1)**

| A         | B            | C            | D        | E               | F          |
| --------- | ------------ | ------------ | -------- | --------------- | ---------- |
| **Email** | **Password** | **FullName** | **Role** | **Permissions** | **Status** |

### 3️⃣ **Dữ liệu mẫu (Từ row 2 trở đi)**

```
| Email                 | Password  | FullName        | Role  | Permissions           | Status |
|----------------------|-----------|-----------------|-------|-----------------------|---------|
| admin@company.com    | admin123  | Administrator   | admin | read,write,delete,admin | active |
| user@company.com     | user123   | Normal User     | user  | read,write            | active |
| viewer@company.com   | view123   | Viewer Only     | viewer| read                  | active |
| manager@company.com  | mgr123    | Manager         | manager| read,write,manage    | active |
```

### 4️⃣ **Giải thích các cột:**

#### **A. Email** (String)

- Địa chỉ email để đăng nhập
- Phải unique (không trùng lặp)
- Sử dụng làm username

#### **B. Password** (String)

- Mật khẩu plain text (demo purposes)
- **🔒 Lưu ý bảo mật**: Trong production nên hash passwords

#### **C. FullName** (String)

- Tên đầy đủ của user
- Hiển thị trong UI sau khi login

#### **D. Role** (String)

- `admin`: Toàn quyền
- `manager`: Quản lý + xem dữ liệu
- `user`: Sử dụng cơ bản
- `viewer`: Chỉ xem

#### **E. Permissions** (Comma-separated String)

- `read`: Xem dữ liệu
- `write`: Tạo/sửa dữ liệu
- `delete`: Xóa dữ liệu
- `manage`: Quản lý users
- `admin`: Admin functions

#### **F. Status** (String)

- `active`: Tài khoản hoạt động
- `inactive`: Tài khoản bị tạm khóa
- `pending`: Chờ kích hoạt

## 🛡️ **Security Best Practices**

### ✅ **Hiện tại (Demo)**

- Plain text passwords trong Google Sheets
- Phù hợp cho demo và development

### 🔒 **Production Recommendations**

1. **Hash passwords** với bcrypt hoặc tương tự
2. **JWT tokens** cho session management
3. **Rate limiting** cho login attempts
4. **2FA** cho admin accounts
5. **Audit logging** cho security events

## 🎯 **Test Users để thử nghiệm**

### Admin Account

- **Email**: `admin@company.com`
- **Password**: `admin123`
- **Role**: admin
- **Permissions**: Full access

### Regular User

- **Email**: `user@company.com`
- **Password**: `user123`
- **Role**: user
- **Permissions**: Basic access

### Viewer Only

- **Email**: `viewer@company.com`
- **Password**: `view123`
- **Role**: viewer
- **Permissions**: Read-only

## 🔧 **Cập nhật Backend**

Backend đã được cấu hình để:

1. Đọc từ sheet "Users" (range A2:F1000)
2. So sánh email (case-insensitive)
3. Kiểm tra password
4. Trả về user object với permissions

## 📝 **Next Steps**

1. ✅ Tạo sheet "Users" theo cấu trúc trên
2. ✅ Thêm test users
3. 🔄 Deploy backend với authentication
4. 🧪 Test login functionality
5. 🎨 Integrate với main app routing

---

**💡 Tip**: Copy đúng cấu trúc bảng trên vào Google Sheets để authentication hoạt động ngay!
