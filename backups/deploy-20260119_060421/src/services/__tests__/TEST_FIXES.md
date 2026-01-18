# 🔧 Test Fixes & Debugging Guide

## 📊 Current Test Status

- **Test Suites**: 2 passed, 5 failed (7 total)
- **Tests**: 27 passed, 23 failed (50 total)
- **Coverage**: Đang cải thiện

## ✅ Tests Đã Pass

1. `App.test.js` - ✅ Fixed (MIA Retail text)
2. Một số tests trong service files

## ❌ Tests Cần Sửa

### 1. Service Tests (Có thể cần điều chỉnh mocks)

**googleSheetsApi.test.js**

- Có thể cần điều chỉnh cách mock axios responses
- Kiểm tra format của response data

**googleDriveApi.test.js**

- Tương tự googleSheetsApi
- Có thể cần mock thêm methods

**securityService.test.js**

- Mock fetch có thể cần điều chỉnh
- Kiểm tra localStorage mocks

**websocketService.test.js**

- Socket.io mock có thể cần điều chỉnh
- Event handlers có thể cần setup khác

## 🔍 Cách Debug Tests

### 1. Chạy test cụ thể để xem lỗi chi tiết

```bash
# Chạy một test file cụ thể
npm test -- googleSheetsApi

# Với verbose output
npm test -- --verbose googleSheetsApi

# Chỉ chạy một test case
npm test -- --testNamePattern="should read sheet data"
```

### 2. Xem lỗi chi tiết

```bash
# Chạy và xem full output
npm test -- --no-coverage --watchAll=false 2>&1 | less

# Hoặc lưu vào file
npm test -- --no-coverage --watchAll=false > test-errors.log 2>&1
```

### 3. Debug trong test

Thêm `console.log` hoặc `debugger` trong test:

```javascript
it("should read sheet data successfully", async () => {
  console.log("Mock data:", mockData);
  const result = await googleSheetsApiService.readSheet("A1:B2", "sheet-id");
  console.log("Result:", result);
  // ...
});
```

## 🛠️ Common Issues & Fixes

### Issue 1: Mock không hoạt động

**Symptom**: `TypeError: Cannot read property 'get' of undefined`

**Fix**: Đảm bảo mock được setup trước khi import:

```javascript
// ✅ Đúng
jest.mock("axios", () => ({
  __esModule: true,
  default: { get: jest.fn(), post: jest.fn() },
}));
import axios from "axios";

// ❌ Sai
import axios from "axios";
jest.mock("axios");
```

### Issue 2: Response format không đúng

**Symptom**: Test expect một format nhưng nhận format khác

**Fix**: Kiểm tra format thực tế của API response và adjust mock:

```javascript
const mockData = {
  data: {
    success: true,
    data: [["Name", "Age"]], // Format đúng
    range: "A1:B2",
  },
};
```

### Issue 3: Async/Await issues

**Symptom**: Tests timeout hoặc không đợi async operations

**Fix**: Đảm bảo dùng `async/await` và `await` trong assertions:

```javascript
it("should work", async () => {
  const result = await service.method();
  expect(result).toBeDefined();
});
```

### Issue 4: localStorage/sessionStorage mocks

**Symptom**: Tests fail vì localStorage không hoạt động

**Fix**: Sử dụng mock từ `setupTests.js` hoặc mock trong test:

```javascript
beforeEach(() => {
  localStorage.clear();
  jest.clearAllMocks();
});
```

## 📝 Next Steps

1. **Chạy từng test file** để xem lỗi cụ thể:

   ```bash
   npm test -- googleSheetsApi
   npm test -- securityService
   npm test -- websocketService
   ```

2. **Xem lỗi chi tiết** và sửa từng lỗi một

3. **Kiểm tra mocks** - Đảm bảo mocks match với implementation thực tế

4. **Update tests** dựa trên implementation thực tế

## 🎯 Target

- **Goal**: 100% tests passing
- **Current**: 54% passing (27/50)
- **Priority**: Fix service tests trước

## 💡 Tips

1. **Start small**: Fix một test case tại một thời điểm
2. **Check implementation**: Đảm bảo test match với code thực tế
3. **Use console.log**: Debug bằng cách log values
4. **Read error messages**: Error messages thường chỉ ra vấn đề chính xác

## 📚 Resources

- [Jest Mocking Guide](https://jestjs.io/docs/mock-functions)
- [Testing Library Best Practices](https://testing-library.com/docs/react-testing-library/intro/)
- [Async Testing](https://jestjs.io/docs/asynchronous)
