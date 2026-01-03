# Unit Tests - Services

## 📋 Tổng Quan

Thư mục này chứa các unit tests cho các services trong dự án MIA.vn Google Integration Platform.

## 🧪 Test Files

### 1. `googleSheetsApi.test.js`

Tests cho Google Sheets API Service:

- ✅ `readSheet()` - Đọc dữ liệu từ sheet
- ✅ `writeSheet()` - Ghi dữ liệu vào sheet
- ✅ `appendToSheet()` - Thêm dữ liệu vào sheet
- ✅ `getSheetMetadata()` - Lấy metadata của sheet
- ✅ `clearSheet()` - Xóa dữ liệu trong sheet
- ✅ `addSheet()` - Thêm sheet mới

**Coverage**: Tất cả methods và error cases

### 2. `googleDriveApi.test.js`

Tests cho Google Drive API Service:

- ✅ `listFiles()` - Liệt kê files
- ✅ `getFileMetadata()` - Lấy metadata file
- ✅ `createFile()` - Tạo file mới
- ✅ `updateFile()` - Cập nhật file
- ✅ `deleteFile()` - Xóa file

**Coverage**: Tất cả methods và error cases

### 3. `securityService.test.js`

Tests cho Security Service:

- ✅ `registerUser()` - Đăng ký user
- ✅ `loginUser()` - Đăng nhập
- ✅ `logoutUser()` - Đăng xuất
- ✅ `getCurrentUser()` - Lấy thông tin user hiện tại
- ✅ `isAuthenticated()` - Kiểm tra authentication
- ✅ MFA handling

**Coverage**: Authentication flow và error handling

### 4. `websocketService.test.js`

Tests cho WebSocket Service:

- ✅ `connect()` - Kết nối WebSocket
- ✅ `disconnect()` - Ngắt kết nối
- ✅ `emit()` - Gửi event
- ✅ `on()` - Đăng ký listener
- ✅ `off()` - Hủy listener
- ✅ `isConnected()` - Kiểm tra trạng thái kết nối

**Coverage**: Connection management và event handling

## 🚀 Chạy Tests

### Chạy tất cả tests

```bash
npm test
```

### Chạy test cụ thể

```bash
npm test -- googleSheetsApi.test.js
npm test -- securityService.test.js
```

### Chạy với coverage

```bash
npm test -- --coverage
```

### Watch mode

```bash
npm run test:watch
```

## 📊 Test Coverage Goals

- **Target**: > 80% coverage cho tất cả services
- **Current**: Đang trong quá trình phát triển

## 🔧 Setup

Tests sử dụng:

- **Jest** - Testing framework
- **@testing-library/react** - React testing utilities
- **axios mock** - Mock HTTP requests
- **socket.io-client mock** - Mock WebSocket connections

## 📝 Best Practices

1. **Mock external dependencies**: Luôn mock axios, socket.io, localStorage
2. **Test error cases**: Đảm bảo test cả success và error scenarios
3. **Isolate tests**: Mỗi test phải độc lập, không phụ thuộc vào test khác
4. **Clear mocks**: Sử dụng `beforeEach` để clear mocks giữa các tests
5. **Descriptive names**: Tên test phải mô tả rõ ràng điều đang test

## 🐛 Troubleshooting

### Tests không chạy

- Kiểm tra `setupTests.js` đã được load chưa
- Đảm bảo tất cả dependencies đã được install

### Mock không hoạt động

- Kiểm tra import path của mocks
- Đảm bảo `jest.mock()` được gọi trước khi import

### Coverage thấp

- Chạy `npm test -- --coverage` để xem coverage report
- Thêm tests cho các branches chưa được cover

## 📚 Resources

- [Jest Documentation](https://jestjs.io/docs/getting-started)
- [Testing Library](https://testing-library.com/)
- [Mock Functions](https://jestjs.io/docs/mock-functions)
