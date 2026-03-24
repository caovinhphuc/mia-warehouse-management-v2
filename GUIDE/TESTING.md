# 🧪 TESTING GUIDE - React OAS Integration v4.0

> **Hướng dẫn testing đầy đủ và chi tiết**
> **Ngày cập nhật**: 2025-01-27

## 📋 Tổng Quan

Hướng dẫn testing cho toàn bộ hệ thống React OAS Integration v4.0, bao gồm:

- **Frontend React** (Jest + React Testing Library)
- **Backend Node.js** (API endpoints)
- **AI Service** (FastAPI/Python)
- **Integration Tests** (API, Google Services, Automation)
- **End-to-End Tests** (Complete workflows)
- **Health Checks** (System status, Dependencies)

---

## 🎯 Test Framework

### Frontend Testing

- **Jest** - Test runner (via react-scripts)
- **@testing-library/react** - React component testing
- **@testing-library/jest-dom** - Custom Jest matchers
- **@testing-library/user-event** - User interaction simulation

### Backend Testing

- **unittest** - Python built-in testing framework
- **pytest** - Advanced Python testing (optional)
- **run_tests.py** - Automation system test runner

### Integration Testing

- **Node.js scripts** - Service connection tests
- **Health checks** - System status verification
- **API tests** - Backend API endpoints

---

## 🚀 Running Tests

### Frontend Tests (React)

```bash
# Run tests in watch mode (interactive)
npm test

# Run tests with coverage report
npm run test:coverage

# Run tests in CI mode (non-interactive)
npm run test:ci

# Run specific test file
npm test -- App.test.js

# Run tests matching pattern
npm test -- --testNamePattern="renders component"
```

### Backend Tests (Python Automation)

```bash
# Run automation system tests
cd automation/one_automation_system
python run_tests.py

# Quick test automation
python quick_test.py

# Advanced quick test
python quick_test_advanced.py

# Test inventory
python quick_test-inventory.py

# Test specific components
python test_webdriver.py
python test_auth_system.py
python test_drive_upload.py
```

### Integration Tests

```bash
# Full integration test suite (comprehensive)
npm run test:complete
# hoặc
npm run test:scripts

# Individual service tests
npm run test:google-sheets  # Google Sheets API test
npm run test:api            # Backend & AI Service API endpoints
npm run test:automation     # Automation System (Python FastAPI)
npm run test:websocket      # WebSocket connection test

# System health check
npm run health-check
# hoặc comprehensive health check
npm run health:full
```

### Complete System Tests (scripts/tests/)

```bash
# Complete system test (end-to-end)
node scripts/tests/complete_system_test.js

# End-to-end test
node scripts/tests/end_to_end_test.js

# Integration test
node scripts/tests/integration_test.js

# Advanced integration test
node scripts/tests/advanced_integration_test.js

# Frontend connection test
node scripts/tests/frontend_connection_test.js

# Google Sheets test
node scripts/tests/test_google_sheets.js

# WebSocket test
node scripts/tests/ws-test.js
```

### All Tests Summary

```bash
# Run all tests (Frontend + Integration)
npm test && npm run test:integration

# Run with coverage
npm run test:coverage && npm run test:integration
```

### Coverage Reports

After running `npm run test:coverage`, view reports at:

- **Terminal**: Immediate summary
- **HTML Report**: `coverage/lcov-report/index.html`
- **LCOV**: `coverage/lcov.info`

---

## 📁 Test Structure

### Frontend Tests

```
src/
├── App.test.js          ✅ Basic sanity tests (5 tests passing)
└── setupTests.js        ✅ Jest configuration
```

### Backend Tests (Automation System)

```
automation/one_automation_system/
├── run_tests.py                    ✅ Main test runner
├── quick_test.py                   ✅ Quick automation test
├── quick_test_advanced.py          ✅ Advanced automation test
├── quick_test-inventory.py         ✅ Inventory test
├── test_webdriver.py               ✅ WebDriver/Selenium test
├── test_auth_system.py             ✅ Authentication test
├── test_drive_upload.py            ✅ Google Drive upload test
├── test_create_drive_folder.py     ✅ Drive folder creation test
└── test_service_account_new.py     ✅ Service account test
```

### Integration Test Scripts

```
scripts/
├── test-all.js                     ✅ Comprehensive test runner (chạy tất cả tests)
├── testGoogleConnection.cjs        ✅ Google API connection test
├── testGoogleSheets.js             ✅ Google Sheets service test
├── testTelegramConnection.js       ✅ Telegram bot test
├── testEmailService.js             ✅ Email service test
├── test-api-endpoints.js           ✅ Backend & AI Service API endpoints
├── test-automation-system.js       ✅ Automation System test
├── test-websocket.js               ✅ WebSocket connection test
├── test_frontend_api_connection.js ✅ Frontend API connection test
├── health-check.cjs                ✅ System health check
└── test-api-key.sh                 ✅ API key validation script
```

### Root Level Test Files (Đã di chuyển)

**Lưu ý:** Các test files đã được di chuyển vào `scripts/tests/` để tổ chức tốt hơn.

```
scripts/tests/
├── complete_system_test.js         ✅ Complete system end-to-end test
├── end_to_end_test.js              ✅ End-to-end integration test
├── integration_test.js             ✅ System integration test
├── advanced_integration_test.js    ✅ Advanced integration tests
├── frontend_connection_test.js     ✅ Frontend connection validation
├── test_google_sheets.js           ✅ Google Sheets standalone test
└── ws-test.js                      ✅ WebSocket test utility
```

**Cách chạy:**

```bash
# Từ root directory
node scripts/tests/complete_system_test.js
node scripts/tests/end_to_end_test.js
node scripts/tests/integration_test.js
```

### Coverage Thresholds

Current settings (relaxed for initial setup):

```javascript
{
  statements: 0%,
  branches: 0%,
  functions: 0%,
  lines: 0%
}
```

**Recommendation:** Gradually increase to:

- Statements: 80%
- Branches: 75%
- Functions: 80%
- Lines: 80%

---

## Writing Tests

### Component Test Example

```javascript
import { render, screen } from "@testing-library/react";
import MyComponent from "./MyComponent";

describe("MyComponent", () => {
  test("renders component", () => {
    render(<MyComponent />);
    expect(screen.getByText("Hello")).toBeInTheDocument();
  });

  test("handles click event", () => {
    const handleClick = jest.fn();
    render(<MyComponent onClick={handleClick} />);

    const button = screen.getByRole("button");
    fireEvent.click(button);

    expect(handleClick).toHaveBeenCalledTimes(1);
  });
});
```

### Service Test Example

```javascript
import { fetchData } from "./dataService";

describe("dataService", () => {
  test("fetches data successfully", async () => {
    const data = await fetchData();
    expect(data).toBeDefined();
    expect(Array.isArray(data)).toBe(true);
  });

  test("handles errors gracefully", async () => {
    await expect(fetchData("invalid")).rejects.toThrow();
  });
});
```

### Redux Test Example

```javascript
import { configureStore } from "@reduxjs/toolkit";
import reducer, { increment, decrement } from "./counterSlice";

describe("counterSlice", () => {
  let store;

  beforeEach(() => {
    store = configureStore({ reducer });
  });

  test("increments value", () => {
    store.dispatch(increment());
    expect(store.getState().value).toBe(1);
  });

  test("decrements value", () => {
    store.dispatch(decrement());
    expect(store.getState().value).toBe(-1);
  });
});
```

---

## Test Organization

### Recommended Structure

```
src/
├── components/
│   ├── Button/
│   │   ├── Button.jsx
│   │   ├── Button.test.js
│   │   └── Button.css
│   └── ...
├── services/
│   ├── api.js
│   ├── api.test.js
│   └── ...
├── store/
│   ├── slices/
│   │   ├── userSlice.js
│   │   ├── userSlice.test.js
│   │   └── ...
│   └── store.js
└── App.test.js
```

### Naming Conventions

- Test files: `*.test.js` or `*.spec.js`
- Test folders: `__tests__/`
- Setup files: `setupTests.js`

---

## Best Practices

### 1. AAA Pattern (Arrange, Act, Assert)

```javascript
test("example test", () => {
  // Arrange: Set up test data
  const value = 5;

  // Act: Perform action
  const result = value * 2;

  // Assert: Verify result
  expect(result).toBe(10);
});
```

### 2. Test One Thing at a Time

```javascript
// ❌ Bad: Testing multiple things
test("component works", () => {
  const { container } = render(<Component />);
  expect(container).toBeTruthy();
  expect(screen.getByText("Hello")).toBeInTheDocument();
  fireEvent.click(screen.getByRole("button"));
  expect(screen.getByText("Clicked")).toBeInTheDocument();
});

// ✅ Good: Separate tests
test("component renders", () => {
  render(<Component />);
  expect(screen.getByText("Hello")).toBeInTheDocument();
});

test("handles button click", () => {
  render(<Component />);
  fireEvent.click(screen.getByRole("button"));
  expect(screen.getByText("Clicked")).toBeInTheDocument();
});
```

### 3. Use Descriptive Test Names

```javascript
// ❌ Bad
test('test1', () => { ... });

// ✅ Good
test('displays error message when API call fails', () => { ... });
```

### 4. Mock External Dependencies

```javascript
// Mock axios
jest.mock("axios");

test("fetches data", async () => {
  axios.get.mockResolvedValue({ data: { id: 1 } });
  const result = await fetchUser(1);
  expect(result.id).toBe(1);
});
```

---

## Common Test Scenarios

### Testing Async Code

```javascript
test("async function", async () => {
  const data = await fetchData();
  expect(data).toBeDefined();
});

// Or with promises
test("promise", () => {
  return fetchData().then((data) => {
    expect(data).toBeDefined();
  });
});
```

### Testing Error Handling

```javascript
test("throws error", () => {
  expect(() => {
    throwError();
  }).toThrow("Error message");
});

test("async error", async () => {
  await expect(asyncThrowError()).rejects.toThrow();
});
```

### Testing React Hooks

```javascript
import { renderHook, act } from "@testing-library/react";
import { useCounter } from "./useCounter";

test("useCounter hook", () => {
  const { result } = renderHook(() => useCounter());

  expect(result.current.count).toBe(0);

  act(() => {
    result.current.increment();
  });

  expect(result.current.count).toBe(1);
});
```

---

## CI/CD Integration

### GitHub Actions Example

```yaml
name: Tests

on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - uses: actions/setup-node@v2
        with:
          node-version: "18"
      - run: npm ci
      - run: npm run test:ci
      - run: npm run build:prod
```

### Pre-commit Hook

```json
// package.json
{
  "husky": {
    "hooks": {
      "pre-commit": "npm run test:ci && npm run lint"
    }
  }
}
```

---

## Debugging Tests

### Run Specific Test

```bash
npm test -- App.test.js
npm test -- --testNamePattern="renders component"
```

### Debug Mode

```bash
# Add debugger in test
test('debug test', () => {
  debugger;
  expect(true).toBe(true);
});

# Run with Node debugger
node --inspect-brk node_modules/.bin/jest --runInBand
```

### Verbose Output

```bash
npm test -- --verbose
npm test -- --coverage --verbose
```

---

## Troubleshooting

### Common Issues

**1. Module not found**

```bash
# Install missing dependencies
npm install --save-dev @testing-library/react @testing-library/jest-dom
```

**2. Tests timeout**

```javascript
// Increase timeout
jest.setTimeout(10000);

// Or per test
test("slow test", async () => {
  // test code
}, 10000);
```

**3. Async tests don't complete**

```javascript
// Always return or await promises
test("async", async () => {
  await asyncFunction(); // ✅
});

test("async", () => {
  return asyncFunction(); // ✅
});
```

---

## Resources

- [Jest Documentation](https://jestjs.io/docs/getting-started)
- [React Testing Library](https://testing-library.com/docs/react-testing-library/intro/)
- [Testing Best Practices](https://kentcdodds.com/blog/common-mistakes-with-react-testing-library)

---

## Next Steps

### Phase 1: Basic Coverage (Current)

- [x] Setup test infrastructure
- [x] Create basic sanity tests
- [x] Configure coverage reporting

### Phase 2: Component Testing

- [ ] Test all React components
- [ ] Test user interactions
- [ ] Test conditional rendering
- [ ] Achieve 50% coverage

### Phase 3: Integration Testing

#### 3.1 Redux Store Testing

**Store Configuration:**

- [ ] Store initialization
- [ ] Redux Persist configuration
- [ ] Middleware setup (thunk)
- [ ] State persistence (localStorage)

**Reducers:**

- [ ] `authReducer` - Authentication state management
  - [ ] LOGIN_REQUEST action
  - [ ] LOGIN_SUCCESS action
  - [ ] LOGIN_FAILURE action
  - [ ] LOGOUT action
  - [ ] State transitions
- [ ] `sheetsReducer` - Google Sheets state
  - [ ] FETCH_SHEETS_REQUEST/SUCCESS/FAILURE
  - [ ] UPDATE_SHEET_DATA action
- [ ] `driveReducer` - Google Drive state
  - [ ] FETCH_FILES_REQUEST/SUCCESS/FAILURE
  - [ ] UPLOAD_FILE_REQUEST/SUCCESS/FAILURE
- [ ] `dashboardReducer` - Dashboard state
  - [ ] FETCH_DASHBOARD_DATA action
  - [ ] UPDATE_DASHBOARD_DATA action
  - [ ] SET_ACTIVE_TAB action
- [ ] `alertsReducer` - Alerts state
  - [ ] SHOW_ALERT action
  - [ ] HIDE_ALERT action
  - [ ] CLEAR_ALL_ALERTS action

**Redux Toolkit Slices:**

- [ ] `aiSlice` - AI service state
  - [ ] `fetchAIAnalysis` async thunk
  - [ ] `fetchPrediction` async thunk
  - [ ] `fetchAvailableModels` async thunk
  - [ ] Reducers: `clearError`, `setAIServiceStatus`, `addAnalysisResult`
  - [ ] Extra reducers (pending/fulfilled/rejected)
- [ ] `dashboardSlice` - Dashboard with WebSocket
  - [ ] `connectWebSocket` async thunk
  - [ ] Reducers: `setConnectionStatus`, `updateRealTimeData`, `setWelcomeMessage`, `updateMetrics`, `clearError`
  - [ ] WebSocket integration state

**Actions:**

- [ ] `authActions.js` - Authentication actions
  - [ ] Login action (async)
  - [ ] Logout action
  - [ ] Session verification
  - [ ] Error handling

**State Selectors:**

- [ ] Select authentication state
- [ ] Select user data
- [ ] Select loading states
- [ ] Select error states
- [ ] Select sheets/drive data
- [ ] Select dashboard metrics

**Integration with Components:**

- [ ] Component → Action → Reducer flow
- [ ] Component state updates from store
- [ ] Persisted state restoration
- [ ] Middleware execution (thunk)

#### 3.2 API Service Calls Testing

**Authentication Service:**

- [ ] `securityService.js`
  - [ ] `registerUser()` - User registration
  - [ ] `loginUser()` - User login with MFA
  - [ ] `logoutUser()` - User logout
  - [ ] `getCurrentUser()` - Get user info
  - [ ] `enableMFA()` / `disableMFA()` - MFA management
  - [ ] SSO login (Google, Microsoft, etc.)
  - [ ] Token management (get/set/remove)
  - [ ] Error handling and retry logic

**Google Services:**

- [ ] `googleSheetsApi.js` / `googleSheetsService.js`
  - [ ] `readSheet()` - Read data from sheets
  - [ ] `writeSheet()` - Write data to sheets
  - [ ] `appendSheet()` - Append data
  - [ ] `getSheetMetadata()` - Get sheet info
  - [ ] `clearSheet()` - Clear sheet data
  - [ ] Authentication handling
- [ ] `googleDriveApi.js`
  - [ ] `listFiles()` - List files/folders
  - [ ] `getFileMetadata()` - Get file info
  - [ ] `uploadFile()` - Upload file
  - [ ] `createFolder()` - Create folder
  - [ ] `deleteFile()` - Delete file
  - [ ] `shareFile()` - Share file
  - [ ] `renameFile()` - Rename file
  - [ ] `downloadFile()` - Download file

**Automation Service:**

- [ ] `automationService.js`
  - [ ] `listAutomations()` - List all automations
  - [ ] `getAutomation(id)` - Get automation by ID
  - [ ] `createAutomation()` - Create new automation
  - [ ] `updateAutomation()` - Update automation
  - [ ] `deleteAutomation()` - Delete automation
  - [ ] `toggleAutomation()` - Enable/disable automation
  - [ ] `executeAutomation()` - Execute automation
  - [ ] `getAutomationLogs()` - Get execution logs

**AI Service:**

- [ ] `aiService.js`
  - [ ] `analyzeData()` - AI data analysis
  - [ ] `getPredictions()` - Get AI predictions
  - [ ] `detectAnomalies()` - Anomaly detection
  - [ ] `getRecommendations()` - Get recommendations
  - [ ] `chat()` - AI chat interface
  - [ ] `analyzeSheets()` - Analyze Google Sheets
  - [ ] `analyzeDrive()` - Analyze Google Drive
  - [ ] `optimizeSystem()` - System optimization

**Smart Automation Service:**

- [ ] `smartAutomationService.js`
  - [ ] `analyzePatterns()` - Pattern analysis
  - [ ] `analyzeTrends()` - Trend analysis
  - [ ] `detectAnomalies()` - Anomaly detection
  - [ ] `generatePredictiveAlerts()` - Predictive alerts
  - [ ] `categorizeColumn()` - Column categorization
  - [ ] `categorizeRows()` - Row categorization
  - [ ] `generateReport()` - Report generation
  - [ ] `processChatQuery()` - NLP chat processing
  - [ ] `generateSummary()` - Auto summary
  - [ ] `smartSearch()` - Smart search
  - [ ] `processVoiceCommand()` - Voice command processing

**Telegram Service:**

- [ ] `telegramService.js`
  - [ ] `sendMessage()` - Send Telegram message
  - [ ] `sendSimpleMessage()` - Send simple text
  - [ ] `testConnection()` - Test bot connection
  - [ ] Webhook management

**Script Service:**

- [ ] `scriptService.js`
  - [ ] `executeScript()` - Execute Google Apps Script
  - [ ] `executeInline()` - Execute inline code
  - [ ] `getScriptStatus()` - Get execution status
  - [ ] `listProjects()` - List script projects
  - [ ] `testScript()` - Test script execution

**Retail Service:**

- [ ] `retailService.js`
  - [ ] `fetchRetailDashboard()` - Get dashboard data
  - [ ] `fetchSalesMetrics()` - Get sales metrics
  - [ ] `fetchInventoryStatus()` - Get inventory data
  - [ ] `fetchCustomerAnalytics()` - Get customer analytics
  - [ ] `fetchStorePerformance()` - Get store performance
  - [ ] `fetchProductPerformance()` - Get product performance

**API Error Handling:**

- [ ] Network errors (timeout, offline)
- [ ] HTTP error responses (4xx, 5xx)
- [ ] Authentication errors (401, 403)
- [ ] Rate limiting (429)
- [ ] Invalid response format
- [ ] Retry logic for failed requests

**API Mocking:**

- [ ] Mock API responses for testing
- [ ] Mock error scenarios
- [ ] Mock loading states
- [ ] Mock network delays

#### 3.3 Routing & Navigation Testing

**Route Configuration:**

- [ ] Public routes (no authentication)
  - [ ] `/login` - Login page
- [ ] Protected routes (require authentication)
  - [ ] `/dashboard` - Live Dashboard
  - [ ] `/ai-analytics` - AI Analytics
  - [ ] `/retail` - Retail Dashboard
  - [ ] `/google-sheets` - Google Sheets Integration
  - [ ] `/google-drive` - Google Drive Integration
  - [ ] `/google-apps-script` - Apps Script Integration
  - [ ] `/telegram` - Telegram Integration
  - [ ] `/automation` - Automation Dashboard
  - [ ] `/alerts` - Alerts Management
  - [ ] `/advanced-analytics` - Advanced Analytics
  - [ ] `/smart-automation` - Smart Automation
  - [ ] `/nlp` - NLP Dashboard
  - [ ] `/security` - Security Dashboard
- [ ] Default route (`/`) - Home page
- [ ] 404 route (catch-all) - Redirect to home

**ProtectedRoute Component:**

- [ ] Authentication check before rendering
- [ ] Redirect to `/login` if not authenticated
- [ ] Session verification
- [ ] Loading state during verification
- [ ] Error handling

**Navigation:**

- [ ] Programmatic navigation (`useNavigate`)
- [ ] Link navigation (`Link`, `NavLink`)
- [ ] Route parameters
- [ ] Query parameters
- [ ] Hash navigation
- [ ] Browser back/forward buttons
- [ ] Navigation state preservation

**Lazy Loading:**

- [ ] Component lazy loading
- [ ] Suspense fallback rendering
- [ ] Preloading critical components
- [ ] Code splitting verification

**Router Integration:**

- [ ] Router initialization
- [ ] Router configuration
- [ ] Route matching
- [ ] Route priority
- [ ] Nested routes

#### 3.4 WebSocket Connection Testing

**WebSocket Service (`websocketService.js`):**

- [ ] Connection establishment
  - [ ] Initial connection
  - [ ] Connection with userId
  - [ ] Room joining (`join-room`)
- [ ] Connection events
  - [ ] `connect` event handling
  - [ ] `disconnect` event handling
  - [ ] `connect_error` event handling
  - [ ] `reconnect` event handling
- [ ] Reconnection logic
  - [ ] Automatic reconnection
  - [ ] Reconnection attempts limit
  - [ ] Exponential backoff
  - [ ] Reconnection delay
- [ ] Message sending
  - [ ] `emit()` method
  - [ ] Message formatting
  - [ ] Error handling when disconnected
- [ ] Message receiving
  - [ ] Event listeners (`on()`, `off()`)
  - [ ] Message parsing
  - [ ] Error handling for invalid messages
- [ ] Room management
  - [ ] Join room
  - [ ] Leave room
  - [ ] Room-specific events
- [ ] Health checks
  - [ ] Ping/Pong mechanism
  - [ ] Connection status monitoring

**WebSocket Client (`utils/websocket.js`):**

- [ ] WebSocket initialization
- [ ] Connection state management
- [ ] Message handling
  - [ ] `onopen` event
  - [ ] `onmessage` event
  - [ ] `onerror` event
  - [ ] `onclose` event
- [ ] Message sending (`send()`)
- [ ] Event listeners (`on()`, `off()`, `emit()`)
- [ ] Reconnection scheduling
- [ ] Client ID management

**WebSocket Integration with Redux:**

- [ ] `connectWebSocket` thunk action
- [ ] WebSocket events → Redux state updates
- [ ] Real-time data updates in dashboard
- [ ] Connection status in Redux state
- [ ] Metrics updates via WebSocket

**WebSocket Hooks:**

- [ ] `useWebSocket` hook (if exists)
  - [ ] Connection management
  - [ ] Event subscription
  - [ ] Cleanup on unmount

**WebSocket Error Scenarios:**

- [ ] Server unavailable
- [ ] Network interruption
- [ ] Invalid message format
- [ ] Connection timeout
- [ ] Authentication failure
- [ ] Rate limiting

#### 3.5 Service Integration Testing

**Frontend ↔ Backend Integration:**

- [ ] Authentication flow (Login → API → Redux → UI)
- [ ] Data fetching flow (Component → Service → API → Redux → Component)
- [ ] Real-time updates (WebSocket → Redux → Component)
- [ ] Error propagation (API → Service → Redux → Component)

**Component ↔ Service Integration:**

- [ ] Component calls service method
- [ ] Service handles API call
- [ ] Service updates Redux state
- [ ] Component reacts to state changes

**Service ↔ Service Integration:**

- [ ] Service dependencies
- [ ] Service communication
- [ ] Shared state management

#### 3.6 End-to-End Integration Scenarios

**Complete User Flows:**

- [ ] Login → Dashboard → View Data
- [ ] Google Sheets: Connect → Read → Write → Update
- [ ] Automation: Create → Configure → Execute → View Logs
- [ ] AI Analysis: Upload Data → Analyze → View Results → Get Recommendations
- [ ] Real-time Dashboard: Connect → Receive Updates → Visualize Data

**Cross-Feature Integration:**

- [ ] Google Sheets ↔ Automation
- [ ] AI Analytics ↔ Smart Automation
- [ ] Alerts ↔ Automation Triggers
- [ ] WebSocket ↔ Dashboard Updates
- [ ] Authentication ↔ All Protected Features

#### 3.7 Test Coverage Goals

**Coverage Targets:**

- [ ] Achieve 70% statement coverage
- [ ] Achieve 70% branch coverage
- [ ] Achieve 70% function coverage
- [ ] Achieve 70% line coverage
- [ ] Critical integrations (Auth, API, WebSocket) → 85% coverage

**Test Types:**

- [ ] Unit tests for individual services
- [ ] Integration tests for service interactions
- [ ] Route tests for navigation flows
- [ ] WebSocket tests for real-time features
- [ ] End-to-end scenarios

#### 3.8 Testing Tools & Setup

**Redux Testing:**

```javascript
// Redux store testing
import { configureStore } from "@reduxjs/toolkit";
import { renderWithProviders } from "./test-utils";

test("Redux store integration", () => {
  const store = configureStore({
    reducer: { auth: authReducer },
  });

  store.dispatch(loginSuccess(userData));
  expect(store.getState().auth.isAuthenticated).toBe(true);
});
```

**API Service Testing:**

```javascript
// Mock API calls
jest.mock("axios");
import axios from "axios";

test("API service call", async () => {
  axios.get.mockResolvedValue({ data: { success: true } });
  const result = await service.fetchData();
  expect(result.success).toBe(true);
});
```

**Routing Testing:**

```javascript
// Test routing
import { render, screen } from "@testing-library/react";
import { BrowserRouter } from "react-router-dom";

test("navigates to dashboard", () => {
  render(
    <BrowserRouter>
      <App />
    </BrowserRouter>
  );
  // Test navigation...
});
```

**WebSocket Testing:**

```javascript
// Mock WebSocket
const mockSocket = {
  on: jest.fn(),
  emit: jest.fn(),
  disconnect: jest.fn(),
};

test("WebSocket connection", () => {
  const service = new WebSocketService();
  service.connect();
  expect(mockSocket.on).toHaveBeenCalled();
});
```

#### 3.9 Test Execution

**Running Integration Tests:**

```bash
# Run all integration tests
npm test -- --testPathPattern=integration

# Run Redux tests
npm test -- redux

# Run API service tests
npm test -- services

# Run routing tests
npm test -- routing

# Run WebSocket tests
npm test -- websocket

# Run with coverage
npm test -- --coverage --testPathPattern=integration
```

#### 3.10 Test Data & Mocking

**Mock Data:**

- [ ] Mock Redux store state
- [ ] Mock API responses
- [ ] Mock WebSocket messages
- [ ] Mock route parameters
- [ ] Mock authentication state

**Test Utilities:**

- [ ] `renderWithProviders` - Render with Redux Provider
- [ ] `renderWithRouter` - Render with Router
- [ ] Mock API service functions
- [ ] Mock WebSocket client
- [ ] Test fixtures for common scenarios

### Phase 4: Full Coverage

- [ ] Test edge cases
- [ ] Test error scenarios
- [ ] Increase thresholds to 80%
- [ ] Add E2E tests

---

**Current Status:** ✅ Tests passing (5/5)
**Coverage:** 0% (baseline tests only)
**Next Goal:** Add component tests

---

## 🔍 Testing Backend Python (Automation System)

### Test Runner: `run_tests.py`

```bash
cd automation/one_automation_system
python run_tests.py
```

**Test Classes:**

- `TestSystemSetup` - Kiểm tra cấu hình hệ thống
- `TestEnvironmentVariables` - Kiểm tra biến môi trường
- `TestDependencies` - Kiểm tra dependencies
- `TestImports` - Kiểm tra imports

**Output:**

```
🤖 ONE Automation System - Test Runner
==================================================
✅ System check passed
🧪 Chạy test cases...
==================================================
✅ Tất cả tests đã pass!
🚀 Hệ thống sẵn sàng để chạy!
```

### Quick Tests

```bash
# Quick automation test
python quick_test.py

# Advanced quick test
python quick_test_advanced.py

# Inventory test
python quick_test-inventory.py
```

### Component Tests

```bash
# Test WebDriver/Selenium
python test_webdriver.py

# Test authentication
python test_auth_system.py

# Test Google Drive upload
python test_drive_upload.py

# Test Drive folder creation
python test_create_drive_folder.py

# Test service account
python test_service_account_new.py
```

---

## 🌐 Integration Testing

### Google Services Tests

```bash
# Test Google connection
npm run test:google

# Tests:
# - Google Sheets API connection
# - Google Drive API connection
# - Service Account authentication
# - Spreadsheet access
```

### Telegram Bot Tests

```bash
# Test Telegram connection
npm run test:telegram

# Tests:
# - Bot token validation
# - Webhook setup
# - Message sending
```

### Email Service Tests

```bash
# Test Email service
npm run test:email

# Tests:
# - SendGrid API connection
# - Email sending
# - Template rendering
```

### Full Integration Suite

```bash
# Run all integration tests
npm run test:integration

# Includes:
# - Google APIs test
# - Telegram test
# - Email test
# - Health check
```

---

## 🏥 Health Checks

### System Health Check

```bash
# Run basic health check
npm run health-check
# hoặc
node scripts/health-check.cjs

# Run comprehensive health check
npm run health:full

# Check specific services
npm run check:backend       # Check backend status
npm run check:ports         # Check port availability
npm run verify:setup        # Verify system setup
```

**Health Check Scripts:**

- `scripts/health-check.cjs` - Basic health check
- `scripts/full-health-check.sh` - Comprehensive health check
- `scripts/check-backend.sh` - Backend service check
- `scripts/check-ports.sh` - Port availability check
- `scripts/verify-setup.sh` - Setup verification

**Checks:**

- Frontend status (port 3000)
- Backend API status (port 3001)
- AI Service status (port 8000)
- Google Services status (Sheets, Drive APIs)
- Telegram Bot connection
- Email Service (SendGrid)
- Database connections
- Environment variables
- Service dependencies

### Manual Health Checks

```bash
# Frontend health
curl http://localhost:3000/health

# Backend health
curl http://localhost:3001/health
curl http://localhost:8000/health

# Automation system health
cd automation/one_automation_system
python health_check.py
```

---

## 📊 Test Reports

### Frontend Coverage Reports

After running `npm run test:coverage`:

- **Terminal**: Immediate summary
- **HTML Report**: `coverage/lcov-report/index.html`
- **LCOV**: `coverage/lcov.info`

### Integration Test Reports

Test reports are automatically generated:

**Service Test Reports:**

- `email-test-report-YYYY-MM-DD.json` - Email service test results
- `telegram-test-report-YYYY-MM-DD.json` - Telegram bot test results
- `health-report-YYYY-MM-DD.json` - System health reports

**Comprehensive Test Report:**

- `reports/test-runs/test-report-[timestamp].json` - Complete test suite results (from `test-all.js`)

**Report Format:**

```json
{
  "timestamp": "2025-12-19T...",
  "totalTests": 10,
  "passed": 8,
  "failed": 2,
  "skipped": 0,
  "duration": 12345,
  "results": [
    {
      "name": "Test Name",
      "status": "passed|failed|skipped",
      "duration": 1234,
      "error": null
    }
  ]
}
```

### Backend Test Output

```bash
# Verbose output
python run_tests.py

# Save to file
python run_tests.py > test-results.txt 2>&1
```

---

## 🐛 Testing Troubleshooting (Extended)

### Backend Test Issues

**1. Import errors**

```bash
# Ensure virtual environment is activated
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt
```

**2. Missing test files**

```bash
# Check test files exist
ls -la automation/one_automation_system/test_*.py
```

**3. Environment variables missing**

```bash
# Check .env file
cat automation/one_automation_system/.env
```

### Integration Test Issues

**1. Google API errors**

```bash
# Check credentials
ls -la config/google-credentials.json

# Test connection manually
npm run test:google
```

**2. Service connection failures**

```bash
# Check service status
npm run health-check

# Verify environment variables
grep -r "GOOGLE\|TELEGRAM\|EMAIL" .env
```

---

## ✅ Test Status Summary

### Current Status

**Frontend:**

- ✅ Tests passing (5/5 basic tests)
- ⚠️ Coverage: 0% (baseline tests only)
- ✅ Jest configured and ready
- ✅ React Testing Library setup complete

**Backend:**

- ✅ System tests: `run_tests.py`
- ✅ Quick tests: `quick_test.py`, `quick_test_advanced.py`
- ✅ Component tests: Multiple test files
- ✅ Python unittest framework ready

**Integration:**

- ✅ Google Services: Working (Sheets, Drive APIs)
- ✅ Telegram Bot: Working
- ✅ Email Service: Working (SendGrid)
- ✅ WebSocket: Working
- ✅ API Endpoints: Backend & AI Service tested
- ✅ Automation System: Python FastAPI tested
- ⚠️ Health Check: Minor warnings (non-critical)

**Test Scripts:**

- ✅ `test-all.js` - Comprehensive runner (7 test suites)
- ✅ `test-api-endpoints.js` - API testing
- ✅ `test-automation-system.js` - Automation testing
- ✅ `test-websocket.js` - WebSocket testing
- ✅ Root level tests: Complete system, E2E, Integration

---

## 🎯 Next Steps (Updated)

### Phase 1: Frontend Component Testing

#### 1.1 Core UI Components

- [ ] `ui/Button` - Button component with variants
- [ ] `ui/Card` - Card container component
- [ ] `ui/Loading` - Loading spinner component
- [ ] `ui/Skeleton` - Skeleton loading component
- [ ] `ui/Toast` - Toast notification component
- [ ] `ui/Empty` - Empty state component

#### 1.2 Common Components

- [ ] `Common/ErrorBoundary` - Error boundary wrapper
- [ ] `Common/Loading` - Loading states
- [ ] `Common/LoadingSpinner` - Spinner component
- [ ] `Common/Notification` - Notification component
- [ ] `Common/VietnamClock` - Clock display component

#### 1.3 Authentication & Security

- [ ] `auth/Login` - Login form and authentication
- [ ] `auth/ProtectedRoute` - Route protection wrapper
- [ ] `security/SecurityDashboard` - Security dashboard container
- [ ] `security/MFASetup` - Multi-factor authentication setup
- [ ] `security/SSOLogin` - SSO login integration
- [ ] `security/UserManagement` - User management interface
- [ ] `security/AuditLogsViewer` - Audit logs viewer
- [ ] `security/SecuritySettings` - Security settings panel

#### 1.4 Layout Components

- [ ] `layout/Layout` - Main layout wrapper
- [ ] `layout/HamburgerMenu` - Mobile menu
- [ ] `layout/NavItem` - Navigation item
- [ ] `layout/NavSection` - Navigation section
- [ ] `layout/ActionButton` - Action button component
- [ ] `layout/ConnectionItem` - Connection status item
- [ ] `layout/ConnectionSection` - Connection section

#### 1.5 Dashboard Components

- [ ] `Dashboard/DemoDashboard` - Demo dashboard
- [ ] `Dashboard/TestDashboard` - Test dashboard
- [ ] `Dashboard/LiveDashboard` - Live dashboard with real-time data

#### 1.6 Google Integration Components

- [ ] `google/GoogleSheetsIntegration` - Google Sheets integration
- [ ] `google/GoogleSheetsCollaborative` - Collaborative sheets
- [ ] `google/GoogleDriveIntegration` - Google Drive integration
- [ ] `google/GoogleAppsScriptIntegration` - Apps Script integration
- [ ] `GoogleSheet/SheetReader` - Sheet data reader
- [ ] `GoogleSheet/SheetWriter` - Sheet data writer
- [ ] `GoogleSheet/SheetManager` - Sheet management
- [ ] `GoogleSheet/SheetTester` - Sheet testing component
- [ ] `GoogleDrive/DriveManager` - Drive file manager
- [ ] `GoogleDrive/DriveUploader` - File uploader
- [ ] `GoogleDrive/DriveTester` - Drive testing component
- [ ] `GoogleDrive/FileViewer` - File preview component

#### 1.7 Automation Components

- [ ] `automation/AutomationDashboard` - Automation dashboard
- [ ] `smart-automation/SmartAutomationDashboard` - Smart automation features

#### 1.8 AI & Analytics Components

- [ ] `ai/AIDashboard` - AI-powered dashboard
- [ ] `analytics/AdvancedAnalyticsDashboard` - Advanced analytics
- [ ] `analytics/ChartComponents` - Chart components (Line, Bar, Pie, Area, HeatMap)
- [ ] `analytics/DataFilterPanel` - Data filtering panel

#### 1.9 NLP Components

- [ ] `nlp/NLPDashboard` - NLP dashboard container
- [ ] `nlp/NLPChatInterface` - Chat interface for queries
- [ ] `nlp/VoiceCommands` - Voice command interface
- [ ] `nlp/SmartSearch` - Smart search component

#### 1.10 Integration Components

- [ ] `telegram/TelegramIntegration` - Telegram bot integration
- [ ] `Alerts/AlertsManagement` - Alerts management
- [ ] `notifications/RealTimeNotifications` - Real-time notifications

#### 1.11 Custom Components

- [ ] `custom/MIARetailDashboard` - Retail-specific dashboard
- [ ] `custom/YourMetricsWidget` - Metrics widget

#### 1.12 Testing Focus Areas

- [ ] Test component rendering with props
- [ ] Test user interactions (clicks, inputs, form submissions)
- [ ] Test conditional rendering (loading, error, empty states)
- [ ] Test event handlers and callbacks
- [ ] Test Redux integration (connected components)
- [ ] Test form validation and error handling
- [ ] Test async operations (API calls, data fetching)
- [ ] Test responsive design and breakpoints
- [ ] Test accessibility (ARIA labels, keyboard navigation)
- [ ] Test component lifecycle (mount, update, unmount)

#### 1.13 Coverage Goals

- [ ] Achieve 50% statement coverage
- [ ] Achieve 50% branch coverage
- [ ] Achieve 50% function coverage
- [ ] Achieve 50% line coverage
- [ ] Critical components (auth, payments) → 80% coverage

#### 1.14 Component Testing Priority

**Priority 1 (Critical - Test First):**

1. `auth/Login` - User authentication
2. `auth/ProtectedRoute` - Route security
3. `security/SecurityDashboard` - Security features
4. `Common/ErrorBoundary` - Error handling

**Priority 2 (High Value):**

1. `layout/Layout` - Main layout
2. `google/GoogleSheetsIntegration` - Core feature
3. `google/GoogleDriveIntegration` - Core feature
4. `Dashboard/LiveDashboard` - Main dashboard

**Priority 3 (Standard):**

1. All UI components (`ui/*`)
2. Common components (`Common/*`)
3. Chart components (`analytics/ChartComponents`)

**Priority 4 (Nice to Have):**

1. Testing components (`GoogleSheet/SheetTester`, `GoogleDrive/DriveTester`)
2. Demo/Test dashboards
3. Widget components

#### 1.15 Example Test Structure

**Component Test Template:**

```javascript
// ComponentName.test.js
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import ComponentName from "./ComponentName";
import { Provider } from "react-redux";
import { store } from "../../store/store";

describe("ComponentName", () => {
  // 1. Rendering tests
  test("renders component", () => {
    render(<ComponentName />);
    expect(screen.getByRole("...")).toBeInTheDocument();
  });

  // 2. Props tests
  test("renders with props", () => {
    render(<ComponentName prop="value" />);
    expect(screen.getByText("value")).toBeInTheDocument();
  });

  // 3. Interaction tests
  test("handles user interaction", () => {
    const handleClick = jest.fn();
    render(<ComponentName onClick={handleClick} />);
    fireEvent.click(screen.getByRole("button"));
    expect(handleClick).toHaveBeenCalledTimes(1);
  });

  // 4. Conditional rendering
  test("shows loading state", () => {
    render(<ComponentName loading={true} />);
    expect(screen.getByText("Loading...")).toBeInTheDocument();
  });

  // 5. Async operations
  test("fetches data on mount", async () => {
    render(<ComponentName />);
    await waitFor(() => {
      expect(screen.getByText("Data loaded")).toBeInTheDocument();
    });
  });

  // 6. Error handling
  test("displays error message", () => {
    render(<ComponentName error="Error message" />);
    expect(screen.getByText("Error message")).toBeInTheDocument();
  });
});
```

---

### Phase 2: Backend Coverage

#### 2.1 Core Automation Modules

**Automation Classes:**

- [ ] `automation.py` - Main automation class
  - [ ] Session management
  - [ ] Automation workflow execution
  - [ ] Error handling and retry logic
  - [ ] State management
- [ ] `automation_enhanced.py` - Enhanced automation with SLA monitoring
  - [ ] SLA tracking
  - [ ] Performance metrics
  - [ ] Enhanced error handling
- [ ] `automation_bridge.py` - Bridge between frontend and automation
  - [ ] API integration
  - [ ] Data transformation
- [ ] `one_automation.py` - Single automation run
- [ ] `one_automation_once.py` - One-time automation execution

**Session Management:**

- [ ] `SessionManager` class
  - [ ] Session creation
  - [ ] Session persistence
  - [ ] Session validation
  - [ ] Session cleanup

#### 2.2 Authentication & Security

**Authentication Services:**

- [ ] `auth_service.py` - Authentication service
  - [ ] User authentication
  - [ ] Session verification
  - [ ] Logout functionality
  - [ ] Token management
- [ ] `auth_api_server.py` - Authentication API server
  - [ ] API endpoints
  - [ ] Request validation
  - [ ] Response formatting
- [ ] `test_auth_system.py` - Authentication system tests
  - [ ] Google Sheets connection test
  - [ ] Authentication service test
  - [ ] API server test
  - [ ] Prerequisites check

#### 2.3 Scripts & Utilities

**Initialization & Setup:**

- [ ] `scripts/initialization.py` - System initialization
  - [ ] Environment setup
  - [ ] Configuration loading
  - [ ] Logger setup
- [ ] `scripts/setup.py` - System setup
  - [ ] Component initialization
  - [ ] Service setup
  - [ ] Driver setup

**Login Management:**

- [ ] `scripts/login.py` - Login functionality
  - [ ] Login flow
  - [ ] Credential handling
  - [ ] Error handling
- [ ] `scripts/login_manager.py` - Complete login manager
  - [ ] 4-module login process
  - [ ] Integration testing
  - [ ] Error recovery

**Scraping & Data Processing:**

- [ ] `scripts/enhanced_scraper.py` - Enhanced web scraper
  - [ ] Data extraction
  - [ ] Pagination handling
  - [ ] Error recovery
- [ ] `scripts/pagination_handler.py` - Pagination logic
  - [ ] Page navigation
  - [ ] Data collection
- [ ] `scripts/date_customizer.py` - Date handling utilities
  - [ ] Date parsing
  - [ ] Date formatting
  - [ ] Date range validation

#### 2.4 Services Integration

**Google Sheets Service:**

- [ ] `services/google_sheets_service.py` - Google Sheets integration
  - [ ] Connection initialization
  - [ ] Read operations
  - [ ] Write operations
  - [ ] Append operations
  - [ ] Error handling
- [ ] `google_sheets_config.py` - Google Sheets configuration
  - [ ] Config loading
  - [ ] Credential management
- [ ] `test_google_sheets_verification.py` - Google Sheets verification tests
  - [ ] Connection test
  - [ ] Config loading test
  - [ ] Logging functions test
  - [ ] Dashboard creation test
  - [ ] Config backup test
  - [ ] Automation history test
- [ ] `verify_sheets.py` - Sheets verification script

**Email Service:**

- [ ] `services/email_service.py` - Email service
  - [ ] Email sending
  - [ ] Template rendering
  - [ ] Attachment handling
  - [ ] Error handling

**Data Processing:**

- [ ] `services/data_processor.py` - Data processing service
  - [ ] Data transformation
  - [ ] Data validation
  - [ ] Data aggregation
- [ ] `modules/data_processor.py` - Data processing module
- [ ] `dashboard_integration.py` - Dashboard integration

#### 2.5 Monitoring & Logging

**Monitoring:**

- [ ] `sla_monitor.py` - SLA monitoring
  - [ ] Performance tracking
  - [ ] SLA violation detection
  - [ ] Alert generation
- [ ] `system_check.py` - System health checks
  - [ ] Component health
  - [ ] Dependency checks
  - [ ] Configuration validation
- [ ] `utils/logger.py` - Logging utilities
  - [ ] Log initialization
  - [ ] Log formatting
  - [ ] Log rotation

**Dashboard:**

- [ ] `dashboard.py` - Dashboard application
  - [ ] Dashboard rendering
  - [ ] Real-time updates
  - [ ] Data visualization

#### 2.6 Verification & Test Scripts

**Verification Scripts:**

- [ ] `verify_authentication_and_user.py` - Authentication verification
- [ ] `verify_sheets.py` - Sheets verification
- [ ] `inspect_sheets_data.py` - Data inspection
- [ ] `test_webdriver.py` - WebDriver testing

**Demo & Test Scripts:**

- [ ] `run_all_demo.py` - Complete demo runner
  - [ ] Authentication verification
  - [ ] Sheets connection
  - [ ] Data inspection
  - [ ] Automation with logging
  - [ ] Complete automation simulation
  - [ ] Summary generation
- [ ] `run_automation_with_logging.py` - Automation with logging
- [ ] `run_complete_automation.py` - Complete automation runner
- [ ] `generate_summary.py` - Summary generation

**Test Files:**

- [ ] `tests/test_health.py` - Health check tests
- [ ] `quick_test.py` - Quick test suite

#### 2.7 FastAPI Service (main.py)

**API Endpoints:**

- [ ] `GET /` - Basic health check
- [ ] `GET /health` - Detailed health check
- [ ] `POST /api/automation/run` - Run automation tasks
- [ ] `GET /api/google-sheets/{spreadsheet_id}` - Read Sheets data
- [ ] `POST /api/google-sheets/{spreadsheet_id}` - Update Sheets data
- [ ] `POST /api/email/send` - Send email
- [ ] `GET /api/logs` - Get logs

**Service Initialization:**

- [ ] Google Sheets Service initialization
- [ ] Email Service initialization
- [ ] Data Processor initialization
- [ ] Logger setup

#### 2.8 Error Handling & Edge Cases

**Error Handling:**

- [ ] Network errors (timeouts, connection failures)
- [ ] API errors (rate limits, authentication failures)
- [ ] Data validation errors
- [ ] File system errors
- [ ] Database errors (if applicable)

**Edge Cases:**

- [ ] Empty data sets
- [ ] Large data sets
- [ ] Invalid input data
- [ ] Missing configuration
- [ ] Concurrent requests
- [ ] Resource exhaustion

**Retry Logic:**

- [ ] Automatic retry on failures
- [ ] Exponential backoff
- [ ] Maximum retry limits
- [ ] Error recovery

#### 2.9 Integration Testing

**Service Integration:**

- [ ] Google Sheets ↔ Automation
- [ ] Email Service ↔ Automation
- [ ] Authentication ↔ Automation
- [ ] Frontend API ↔ Backend

**Workflow Testing:**

- [ ] Complete automation workflow
- [ ] Login → Automation → Logging → Reporting
- [ ] Error recovery workflows
- [ ] Multi-step processes

#### 2.10 Performance Testing

**Performance Metrics:**

- [ ] Response times
- [ ] Throughput
- [ ] Resource usage (CPU, Memory)
- [ ] Database query performance
- [ ] API call efficiency

**Load Testing:**

- [ ] Concurrent users
- [ ] High data volume
- [ ] Stress testing
- [ ] Endurance testing

#### 2.11 Test Coverage Goals

**Coverage Targets:**

- [ ] Achieve 70% statement coverage
- [ ] Achieve 70% branch coverage
- [ ] Achieve 70% function coverage
- [ ] Achieve 70% line coverage
- [ ] Critical functions (auth, data processing) → 85% coverage

**Test Types:**

- [ ] Unit tests for individual functions
- [ ] Integration tests for service interactions
- [ ] End-to-end tests for complete workflows
- [ ] Performance tests for optimization

#### 2.12 Testing Tools & Frameworks

**Python Testing:**

- [ ] unittest - Built-in testing framework
- [ ] pytest - Advanced testing (optional)
- [ ] Coverage.py - Code coverage analysis
- [ ] Mock - Mocking external dependencies

**Test Structure:**

```python
# Example test structure
import unittest
from unittest.mock import Mock, patch

class TestAutomationModule(unittest.TestCase):
    def setUp(self):
        """Setup test fixtures"""
        pass

    def tearDown(self):
        """Cleanup after tests"""
        pass

    def test_function_success(self):
        """Test successful execution"""
        pass

    def test_function_error_handling(self):
        """Test error handling"""
        pass

    def test_edge_cases(self):
        """Test edge cases"""
        pass

if __name__ == '__main__':
    unittest.main()
```

#### 2.13 Test Execution

**Running Tests:**

```bash
# Run all tests
python -m pytest tests/
python -m unittest discover tests/

# Run specific test file
python -m pytest tests/test_automation.py
python -m unittest tests.test_automation

# Run with coverage
coverage run -m pytest tests/
coverage report
coverage html  # Generate HTML report

# Run quick test suite
cd automation/automation_new
python quick_test.py

# Run verification tests
python test_auth_system.py
python test_google_sheets_verification.py
python verify_sheets.py
```

#### 2.14 Test Data Management

**Test Data:**

- [ ] Mock data for unit tests
- [ ] Sample data for integration tests
- [ ] Test fixtures for consistent testing
- [ ] Test databases (if applicable)
- [ ] Cleanup after tests

**Environment Setup:**

- [ ] Test environment configuration
- [ ] Test credentials (separate from production)
- [ ] Test database setup
- [ ] Mock external services

### Phase 3: Integration Testing

- [ ] Test Redux store
- [ ] Test API calls
- [ ] Test routing
- [ ] Test WebSocket connections
- [ ] Achieve 70% coverage

### Phase 4: E2E Testing

#### 4.1 E2E Framework Setup

**Framework Selection:**

- [ ] Choose E2E framework (Cypress or Playwright)
- [ ] Install E2E testing dependencies
- [ ] Configure E2E test environment
- [ ] Setup test runners and reporters
- [ ] Configure CI/CD integration

**Cypress Setup (Recommended):**

- [ ] Install Cypress: `npm install --save-dev cypress`
- [ ] Initialize Cypress: `npx cypress open`
- [ ] Configure `cypress.config.js`
- [ ] Setup base URL and API endpoints
- [ ] Configure environment variables
- [ ] Setup custom commands
- [ ] Configure fixtures and test data

**Playwright Setup (Alternative):**

- [ ] Install Playwright: `npm install --save-dev @playwright/test`
- [ ] Initialize Playwright: `npx playwright install`
- [ ] Configure `playwright.config.js`
- [ ] Setup browsers (Chromium, Firefox, WebKit)
- [ ] Configure test execution modes

**Test Structure:**

```
e2e/
├── cypress/                    # Cypress tests
│   ├── e2e/
│   │   ├── auth/              # Authentication flows
│   │   ├── dashboard/         # Dashboard flows
│   │   ├── google-sheets/     # Google Sheets flows
│   │   ├── automation/        # Automation flows
│   │   └── integrations/      # Integration flows
│   ├── fixtures/              # Test data
│   ├── support/               # Custom commands
│   └── cypress.config.js
└── playwright/                # Playwright tests (alternative)
    ├── tests/
    ├── fixtures/
    └── playwright.config.js
```

#### 4.2 Authentication & User Management Flows

**Login Flow:**

- [ ] Navigate to login page
- [ ] Enter valid credentials
- [ ] Submit login form
- [ ] Verify successful login
- [ ] Verify redirect to dashboard
- [ ] Verify user data in UI
- [ ] Test login with invalid credentials
- [ ] Test login with missing fields
- [ ] Test MFA login flow
- [ ] Test SSO login (Google, Microsoft)

**Registration Flow:**

- [ ] Navigate to registration page
- [ ] Fill registration form
- [ ] Submit registration
- [ ] Verify email verification
- [ ] Verify account creation
- [ ] Test validation errors
- [ ] Test duplicate email handling

**Logout Flow:**

- [ ] Click logout button
- [ ] Verify session termination
- [ ] Verify redirect to login
- [ ] Verify protected routes are blocked

**Session Management:**

- [ ] Test session persistence
- [ ] Test session expiration
- [ ] Test session refresh
- [ ] Test concurrent sessions

#### 4.3 Dashboard & Analytics Flows

**Main Dashboard:**

- [ ] Load dashboard page
- [ ] Verify data loading
- [ ] Verify real-time updates via WebSocket
- [ ] Verify metrics display
- [ ] Verify charts rendering
- [ ] Test data refresh
- [ ] Test date range filtering
- [ ] Test data export functionality

**AI Analytics Dashboard:**

- [ ] Navigate to AI Analytics
- [ ] Upload/select data for analysis
- [ ] Trigger AI analysis
- [ ] Verify analysis results display
- [ ] Verify predictions and insights
- [ ] Test recommendation implementation
- [ ] Test AI chat interface
- [ ] Verify real-time analysis updates

**Advanced Analytics:**

- [ ] Navigate to Advanced Analytics
- [ ] Create custom dashboard
- [ ] Add widgets (Line, Bar, Pie charts)
- [ ] Configure data filters
- [ ] Test drag & drop widget arrangement
- [ ] Test widget interactions
- [ ] Export analytics reports (PDF, Excel, CSV)
- [ ] Save and load dashboard configurations

**Retail Dashboard:**

- [ ] Navigate to Retail Dashboard
- [ ] Verify sales metrics display
- [ ] Verify inventory status
- [ ] Verify customer analytics
- [ ] Verify store performance data
- [ ] Verify product performance metrics
- [ ] Test filtering and sorting

#### 4.4 Google Integration Flows

**Google Sheets Integration:**

- [ ] Navigate to Google Sheets page
- [ ] Authenticate with Google account
- [ ] Select/connect spreadsheet
- [ ] Read data from sheets
- [ ] Display data in UI
- [ ] Edit cell data
- [ ] Save changes to sheets
- [ ] Append new rows
- [ ] Delete rows
- [ ] Create new spreadsheet
- [ ] Test collaborative editing
- [ ] Test real-time sync

**Google Drive Integration:**

- [ ] Navigate to Google Drive page
- [ ] Authenticate with Google account
- [ ] List files and folders
- [ ] Navigate folder structure
- [ ] Upload file
- [ ] Download file
- [ ] Create folder
- [ ] Rename file/folder
- [ ] Delete file/folder
- [ ] Share file
- [ ] View file preview
- [ ] Test search functionality
- [ ] Test file sorting and filtering

**Google Apps Script Integration:**

- [ ] Navigate to Apps Script page
- [ ] List available scripts
- [ ] Create new script
- [ ] Edit script code
- [ ] Execute script
- [ ] Verify execution results
- [ ] Test script scheduling
- [ ] Test script error handling

#### 4.5 Automation Workflows

**Automation Dashboard:**

- [ ] Navigate to Automation Dashboard
- [ ] View list of automations
- [ ] Create new automation
- [ ] Configure automation settings
- [ ] Enable/disable automation
- [ ] Execute automation manually
- [ ] View automation logs
- [ ] Test automation error handling
- [ ] Verify automation status updates

**Automation Execution Flow:**

- [ ] Trigger automation from UI
- [ ] Verify automation starts
- [ ] Monitor progress in real-time
- [ ] Verify WebSocket updates
- [ ] Verify data extraction
- [ ] Verify Google Sheets update
- [ ] Verify completion notification
- [ ] Verify log generation
- [ ] Test automation failure scenario

**Smart Automation:**

- [ ] Navigate to Smart Automation
- [ ] Upload data for analysis
- [ ] Trigger pattern analysis
- [ ] View pattern detection results
- [ ] Trigger trend analysis
- [ ] View trend predictions
- [ ] Generate predictive alerts
- [ ] Test auto-categorization
- [ ] Generate automated reports

#### 4.6 Integration Feature Flows

**Telegram Integration:**

- [ ] Navigate to Telegram page
- [ ] Connect Telegram bot
- [ ] Send test message
- [ ] Verify message delivery
- [ ] Setup webhook
- [ ] Test incoming message handling
- [ ] View chat history
- [ ] Test bot commands

**Email Service:**

- [ ] Navigate to email settings
- [ ] Configure email service
- [ ] Send test email
- [ ] Verify email delivery
- [ ] Test email templates
- [ ] Test bulk email sending

**Alerts Management:**

- [ ] Navigate to Alerts page
- [ ] Create new alert rule
- [ ] Configure alert conditions
- [ ] Test alert triggering
- [ ] Verify alert notification
- [ ] View alert history
- [ ] Edit alert configuration
- [ ] Delete alert
- [ ] Test alert statistics

**NLP Dashboard:**

- [ ] Navigate to NLP Dashboard
- [ ] Test chat interface
  - [ ] Send natural language query
  - [ ] Verify AI response
  - [ ] Test query processing
- [ ] Test voice commands
  - [ ] Start voice recognition
  - [ ] Issue voice command
  - [ ] Verify command execution
- [ ] Test smart search
  - [ ] Enter search query
  - [ ] Verify search results
  - [ ] Test advanced search filters
- [ ] Test auto-summary generation

#### 4.7 Security & Compliance Flows

**Security Dashboard:**

- [ ] Navigate to Security Dashboard
- [ ] View security settings
- [ ] Setup MFA
  - [ ] Generate QR code
  - [ ] Verify setup process
  - [ ] Test MFA login
- [ ] Configure SSO
  - [ ] Setup Google SSO
  - [ ] Setup Microsoft SSO
  - [ ] Test SSO login
- [ ] User Management
  - [ ] View user list
  - [ ] Create new user
  - [ ] Update user role
  - [ ] Delete user
- [ ] Audit Logs
  - [ ] View audit logs
  - [ ] Filter logs by date/user
  - [ ] Export audit logs
  - [ ] View statistics

**Protected Routes:**

- [ ] Test accessing protected route without auth
- [ ] Verify redirect to login
- [ ] Test accessing protected route with expired session
- [ ] Test role-based access control
- [ ] Test permission restrictions

#### 4.8 Real-Time Features

**WebSocket Integration:**

- [ ] Verify WebSocket connection on page load
- [ ] Test real-time data updates
- [ ] Test connection reconnection
- [ ] Test connection status indicator
- [ ] Test message broadcasting
- [ ] Test room-based messaging

**Live Dashboard Updates:**

- [ ] Verify dashboard auto-refresh
- [ ] Verify metrics update in real-time
- [ ] Verify chart updates
- [ ] Test update performance
- [ ] Test update frequency

#### 4.9 Cross-Feature Integration Scenarios

**Complete User Journeys:**

- [ ] **Journey 1: New User Onboarding**
  - [ ] Register → Verify Email → Login → Dashboard Tour → First Automation Setup
- [ ] **Journey 2: Data Analysis Workflow**
  - [ ] Login → Connect Google Sheets → Import Data → Run AI Analysis → View Insights → Export Report
- [ ] **Journey 3: Automation Setup & Execution**
  - [ ] Login → Create Automation → Configure Settings → Enable Automation → Monitor Execution → View Results
- [ ] **Journey 4: Collaborative Workflow**
  - [ ] Login → Open Google Sheets → Edit Data → See Real-time Updates → Get Alert → Respond via Telegram
- [ ] **Journey 5: Advanced Analytics Workflow**
  - [ ] Login → Upload Data → Create Custom Dashboard → Add Charts → Apply Filters → Generate Report → Share

**Multi-Service Integration:**

- [ ] Google Sheets → Automation → AI Analysis → Email Report
- [ ] Data Collection → Smart Automation → Predictive Alerts → Telegram Notification
- [ ] Automation Execution → Google Sheets Update → Dashboard Refresh → Real-time Display

#### 4.10 Error Scenarios & Edge Cases

**Error Handling:**

- [ ] Network timeout scenarios
- [ ] API error responses (4xx, 5xx)
- [ ] Service unavailable scenarios
- [ ] Invalid data input handling
- [ ] Concurrent user conflicts
- [ ] Large data set handling
- [ ] Browser compatibility issues

**Edge Cases:**

- [ ] Empty state displays
- [ ] Loading state handling
- [ ] Offline mode behavior
- [ ] Browser back/forward navigation
- [ ] Multiple tab handling
- [ ] Session timeout during operation
- [ ] Partial data loading

#### 4.11 Performance & Load Testing

**Performance Tests:**

- [ ] Page load time measurement
- [ ] Time to interactive (TTI)
- [ ] API response time
- [ ] Data rendering performance
- [ ] Chart rendering performance
- [ ] Large dataset handling
- [ ] WebSocket message throughput

**Load Tests:**

- [ ] Multiple concurrent users
- [ ] High frequency API calls
- [ ] Real-time update stress test
- [ ] Database query performance
- [ ] Memory usage monitoring

#### 4.12 Mobile & Responsive Testing

**Responsive Design:**

- [ ] Test on mobile viewport (< 768px)
- [ ] Test on tablet viewport (768px - 1024px)
- [ ] Test on desktop viewport (> 1024px)
- [ ] Verify touch interactions
- [ ] Verify mobile navigation
- [ ] Verify responsive charts and tables
- [ ] Test mobile-specific features

**Cross-Browser Testing:**

- [ ] Chrome/Chromium
- [ ] Firefox
- [ ] Safari/WebKit
- [ ] Edge

#### 4.13 Accessibility Testing

**Accessibility Checks:**

- [ ] Keyboard navigation
- [ ] Screen reader compatibility
- [ ] ARIA labels and roles
- [ ] Color contrast ratios
- [ ] Focus indicators
- [ ] Form accessibility
- [ ] Error message accessibility

#### 4.14 Test Data Management

**Test Fixtures:**

- [ ] Mock user accounts
- [ ] Mock Google Sheets data
- [ ] Mock API responses
- [ ] Mock automation results
- [ ] Test data cleanup after tests

**Environment Setup:**

- [ ] Test environment configuration
- [ ] Test database setup
- [ ] Mock external services
- [ ] Test credentials management

#### 4.15 Coverage Goals

**Coverage Targets:**

- [ ] Achieve 80% statement coverage
- [ ] Achieve 80% branch coverage
- [ ] Achieve 80% function coverage
- [ ] Achieve 80% line coverage
- [ ] Critical user flows → 90% coverage
- [ ] All authentication flows → 95% coverage

**Test Metrics:**

- [ ] Test execution time
- [ ] Test pass rate
- [ ] Test flakiness rate
- [ ] Coverage reports
- [ ] Test maintenance overhead

#### 4.16 E2E Test Examples

**Cypress Example:**

```javascript
// cypress/e2e/dashboard/login.cy.js
describe("User Login Flow", () => {
  beforeEach(() => {
    cy.visit("/login");
  });

  it("should login successfully with valid credentials", () => {
    cy.get("[data-cy=email-input]").type("user@example.com");
    cy.get("[data-cy=password-input]").type("password123");
    cy.get("[data-cy=login-button]").click();

    cy.url().should("include", "/dashboard");
    cy.get("[data-cy=user-menu]").should("be.visible");
    cy.get("[data-cy=welcome-message]").should("contain", "Welcome");
  });

  it("should show error with invalid credentials", () => {
    cy.get("[data-cy=email-input]").type("wrong@example.com");
    cy.get("[data-cy=password-input]").type("wrongpassword");
    cy.get("[data-cy=login-button]").click();

    cy.get("[data-cy=error-message]").should("be.visible");
    cy.url().should("include", "/login");
  });
});
```

**Playwright Example:**

```javascript
// playwright/tests/dashboard.spec.js
import { test, expect } from "@playwright/test";

test.describe("Dashboard Flow", () => {
  test("should load and display dashboard data", async ({ page }) => {
    await page.goto("/dashboard");
    await page.waitForSelector("[data-testid=dashboard-container]");

    const metrics = await page.locator("[data-testid=metric-card]").count();
    expect(metrics).toBeGreaterThan(0);

    await expect(page.locator("[data-testid=chart-container]")).toBeVisible();
  });
});
```

#### 4.17 Test Execution & CI/CD

**Running E2E Tests:**

```bash
# Cypress
npm run test:e2e          # Run Cypress tests
npm run test:e2e:headed   # Run with browser UI
npm run test:e2e:ci       # Run in CI mode

# Playwright
npm run test:e2e          # Run Playwright tests
npm run test:e2e:ui       # Run with UI mode
npm run test:e2e:debug    # Run in debug mode
```

**CI/CD Integration:**

- [ ] Run E2E tests on pull requests
- [ ] Run E2E tests before deployment
- [ ] Parallel test execution
- [ ] Test result reporting
- [ ] Screenshot on failure
- [ ] Video recording on failure

#### 4.18 Best Practices

**Test Organization:**

- [ ] Group related tests
- [ ] Use descriptive test names
- [ ] Keep tests independent
- [ ] Use Page Object Model pattern
- [ ] Reuse test utilities

**Test Maintenance:**

- [ ] Regular test review
- [ ] Update tests with UI changes
- [ ] Remove flaky tests
- [ ] Optimize slow tests
- [ ] Document test scenarios

---

## 📝 NPM Scripts Reference

### Test Scripts

```json
{
  "test": "react-scripts test",
  "test:frontend": "react-scripts test",
  "test:ci": "CI=true react-scripts test --watchAll=false",
  "test:coverage": "CI=true react-scripts test --coverage --watchAll=false",
  "test:backend": "jest",
  "test:integration": "npm run test:scripts",
  "test:e2e": "jest --testPathPattern=e2e --passWithNoTests",
  "test:all": "concurrently frontend / backend / integration / e2e",
  "test:google-sheets": "node scripts/tests/test_google_sheets.js",
  "test:api": "node scripts/test-api-endpoints.js",
  "test:automation": "node scripts/test-automation-system.js",
  "test:complete": "npm run test:ci && npm run test:scripts",
  "test:scripts": "node scripts/test-all.js"
}
```

> **Notes:**
>
> - `test:e2e` uses `--passWithNoTests` — exits 0 when no e2e files exist, does not crash CI
> - `test:backend` runs `jest` directly (not via react-scripts) — uses `jest.config.js`
> - `test:ci` uses `CI=true` to disable interactive watch mode

### Health Check Scripts

```json
{
  "health:full": "bash scripts/full-health-check.sh",
  "check:ports": "bash scripts/check-ports.sh",
  "check:backend": "bash scripts/check-backend.sh",
  "verify:setup": "bash scripts/verify-setup.sh"
}
```

## 🔧 Test Scripts Details

### 1. `test-all.js` - Comprehensive Test Runner

**Mô tả:** Chạy tất cả test suites tự động và tạo báo cáo tổng hợp.

**Test Suites:**

1. Google Sheets Connection (`testGoogleConnection.cjs`)
2. Google Sheets Service (`testGoogleSheets.js`)
3. Frontend API Connection (`test_frontend_api_connection.js`)
4. Email Service (`testEmailService.js`)
5. Telegram Connection (`testTelegramConnection.js`)
6. Health Check (`health-check.cjs`)
7. WebSocket Connection (`test-websocket.js`)

**Root Level Tests:**

- Complete System Test (`complete_system_test.js`)
- End-to-End Test (`end_to_end_test.js`)
- Integration Test (`integration_test.js`)
- Frontend Connection Test (`frontend_connection_test.js`)

**Output:**

- Console: Real-time progress và kết quả
- JSON Report: `reports/test-runs/test-report-[timestamp].json`

### 2. `test-api-endpoints.js` - API Testing

**Test các endpoints:**

**Backend API (port 3001):**

- `GET /health` - Health check
- `GET /api/status` - API status
- `GET /api/orders` - Get orders
- `GET /api/analytics` - Get analytics
- `GET /api/statistics` - Get statistics

**AI Service (port 8000):**

- `GET /health` - Health check
- `GET /` - Service info
- `GET /api/predictions` - AI predictions
- `GET /api/analytics` - AI analytics

### 3. `test-automation-system.js` - Automation Testing

**Test các phần:**

- ✅ Python environment check
- ✅ Automation files check (`main.py`, `automation_bridge.py`)
- ✅ Service dependencies
- ✅ File structure validation

### 4. `test-websocket.js` - WebSocket Testing

**Tính năng:**

- ✅ Test WebSocket connection
- ✅ Test welcome message
- ✅ Test real-time data updates
- ✅ Test AI analysis results
- ✅ Connection error handling

### 5. `testGoogleSheets.js` - Google Sheets Testing

**Test các chức năng:**

- ✅ Google Sheets API connection
- ✅ Read spreadsheet data
- ✅ Write data to sheets
- ✅ Append data to sheets
- ✅ Service Account authentication

## 🎓 Best Practices (Extended)

### Test Organization

1. **Unit Tests** - Test individual components/functions
2. **Integration Tests** - Test component interactions
3. **E2E Tests** - Test complete user flows
4. **API Tests** - Test backend endpoints
5. **Service Tests** - Test external services

### Test Data Management

```javascript
// Use fixtures for test data
const mockData = {
  user: { id: 1, name: "Test User" },
  order: { id: 1, status: "pending" },
};

// Clean up after tests
afterEach(() => {
  jest.clearAllMocks();
});
```

### Mocking Strategies

```javascript
// Mock API calls
jest.mock("./apiService", () => ({
  fetchData: jest.fn(() => Promise.resolve({ data: [] })),
}));

// Mock React components
jest.mock("./ExpensiveComponent", () => () => <div>Mock</div>);
```

## 📚 Additional Resources

### Documentation

- [Jest Documentation](https://jestjs.io/docs/getting-started)
- [React Testing Library](https://testing-library.com/docs/react-testing-library/intro/)
- [Testing Best Practices](https://kentcdodds.com/blog/common-mistakes-with-react-testing-library)
- [Python unittest](https://docs.python.org/3/library/unittest.html)
- [pytest Documentation](https://docs.pytest.org/)

### Internal Documentation

- `TEST_SCRIPTS_GUIDE.md` - Chi tiết về test scripts
- `scripts/README.md` - Hướng dẫn sử dụng scripts
- `QUICK_SCRIPTS_REFERENCE.md` - Quick reference cho scripts

## ⚡ Quick Reference

### Testing Workflow

```bash
# 1. Quick health check
npm run health-check

# 2. Run frontend tests
npm test

# 3. Run specific integration test
npm run test:api          # API endpoints
npm run test:automation   # Automation system
npm run test:websocket    # WebSocket

# 4. Run complete test suite
npm run test:complete

# 5. Check test coverage
npm run test:coverage
```

### Common Test Commands

```bash
# Frontend
npm test                    # Interactive watch mode
npm test -- --coverage      # With coverage
npm test -- App.test.js     # Specific file

# Integration
npm run test:complete       # All tests
npm run test:google-sheets  # Google Sheets
npm run test:api            # API endpoints
npm run test:websocket      # WebSocket

# Health Checks
npm run health-check        # Basic
npm run health:full         # Comprehensive
npm run check:backend       # Backend only
npm run check:ports         # Ports only

# Backend (Python)
cd automation/one_automation_system
python run_tests.py         # All tests
python quick_test.py        # Quick test
```

### Test Files Location

```
Frontend Tests:
├── src/App.test.js
└── src/setupTests.js

Backend Tests:
├── automation/one_automation_system/
│   ├── run_tests.py
│   ├── quick_test.py
│   └── test_*.py

Integration Tests:
├── scripts/
│   ├── test-all.js
│   ├── test-api-endpoints.js
│   └── ...
└── (root)/
    ├── complete_system_test.js
    ├── end_to_end_test.js
    └── ...
```

## 🚨 Troubleshooting Quick Fixes

### Test không chạy

```bash
# Clear cache và reinstall
rm -rf node_modules package-lock.json
npm install

# Clear Jest cache
npm test -- --clearCache
```

### API tests fail

```bash
# Kiểm tra services đang chạy
npm run check:backend
npm run check:ports

# Start services
npm run dev  # Start all services
```

### Python tests fail

```bash
# Activate virtual environment
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Check Python version
python --version  # Should be 3.8+
```

### Coverage không hiển thị

```bash
# Regenerate coverage
npm run test:coverage

# Open HTML report
open coverage/lcov-report/index.html
```

---

## 🎯 ĐỀ XUẤT TRIỂN KHAI (IMPLEMENTATION ROADMAP)

### 📅 Phương Pháp 80/20 - Ưu Tiên Cao Impact

Triển khai testing theo nguyên tắc **80/20**: 20% effort tạo ra 80% giá trị. Bắt đầu với những test quan trọng nhất.

### 🚀 Phase 1: Foundation (Tuần 1-2) - CRITICAL

**Mục tiêu:** Setup infrastructure và test critical paths (20% effort → 80% coverage cho critical features)

#### ✅ Tuần 1: Infrastructure Setup

**Day 1-2: Test Infrastructure**

- [ ] Setup Jest configuration cho Frontend
- [ ] Tạo test utilities (`src/utils/test-utils.js`)
  - [ ] `renderWithProviders` - Redux wrapper
  - [ ] `renderWithRouter` - Router wrapper
  - [ ] Mock API helpers
- [ ] Setup test data fixtures (`src/__fixtures__/`)
- [ ] Configure coverage reporting

**Day 3-4: Critical Component Tests (Priority 1)**

- [ ] `auth/Login` component (full test suite)
  - [ ] Form validation
  - [ ] API integration
  - [ ] Error handling
  - [ ] Success flow
- [ ] `auth/ProtectedRoute` component
  - [ ] Authentication check
  - [ ] Redirect logic
- [ ] `Common/ErrorBoundary` component

**Day 5: Critical Service Tests**

- [ ] `securityService.js` - Authentication methods
- [ ] API error handling tests

**Deliverable:**

- ✅ Test infrastructure hoàn chỉnh
- ✅ 3-5 critical components có tests
- ✅ Coverage: ~15-20%

#### ✅ Tuần 2: Core Features Testing

**Day 1-2: Redux Store Tests**

- [ ] `authReducer` - Full test suite
- [ ] `authActions.js` - Async actions
- [ ] Store configuration tests

**Day 3-4: API Integration Tests**

- [ ] `securityService` - Login, Logout, Session
- [ ] Mock API responses
- [ ] Error scenarios

**Day 5: Routing Tests**

- [ ] Protected route tests
- [ ] Navigation tests
- [ ] Redirect logic

**Deliverable:**

- ✅ Redux store fully tested
- ✅ API integration tested
- ✅ Routing tested
- ✅ Coverage: ~30-35%

### 🎯 Phase 2: High-Value Features (Tuần 3-4) - HIGH PRIORITY

**Mục tiêu:** Test features được dùng nhiều nhất (Google Sheets, Dashboard)

#### ✅ Tuần 3: Google Integration Tests

**Day 1-2: Google Sheets Component**

- [ ] `google/GoogleSheetsIntegration` component
  - [ ] Render tests
  - [ ] Data loading
  - [ ] CRUD operations
  - [ ] Error handling
- [ ] `GoogleSheet/SheetReader` component
- [ ] `GoogleSheet/SheetWriter` component

**Day 3-4: Google Sheets Service**

- [ ] `googleSheetsApi.js` - All methods
- [ ] Mock Google API responses
- [ ] Error handling tests

**Day 5: Google Drive Tests**

- [ ] `google/GoogleDriveIntegration` component
- [ ] `googleDriveApi.js` service

**Deliverable:**

- ✅ Google integration fully tested
- ✅ Coverage: ~45-50%

#### ✅ Tuần 4: Dashboard & Analytics

**Day 1-2: Dashboard Components**

- [ ] `Dashboard/LiveDashboard` component
- [ ] WebSocket integration tests
- [ ] Real-time updates

**Day 3-4: Analytics Components**

- [ ] `analytics/AdvancedAnalyticsDashboard`
- [ ] Chart components rendering
- [ ] Data filtering

**Day 5: AI Dashboard**

- [ ] `ai/AIDashboard` component
- [ ] AI service integration
- [ ] Chat interface

**Deliverable:**

- ✅ Dashboards fully tested
- ✅ Coverage: ~55-60%

### 🔧 Phase 3: Backend & Integration (Tuần 5-6) - MEDIUM PRIORITY

**Mục tiêu:** Test backend services và integration flows

#### ✅ Tuần 5: Backend Core Tests

**Day 1-2: Authentication Service**

- [ ] `automation/auth_service.py` tests
- [ ] Session management tests
- [ ] User management tests

**Day 3-4: Automation Core**

- [ ] `automation.py` main class tests
- [ ] Error handling tests
- [ ] Session manager tests

**Day 5: Services Integration**

- [ ] Google Sheets service (Python)
- [ ] Email service tests

**Deliverable:**

- ✅ Backend core tested
- ✅ Coverage: ~65-70%

#### ✅ Tuần 6: Integration Tests

**Day 1-2: API Integration**

- [ ] Frontend ↔ Backend API tests
- [ ] Endpoint testing
- [ ] Error propagation

**Day 3-4: WebSocket Integration**

- [ ] WebSocket connection tests
- [ ] Real-time updates
- [ ] Reconnection logic

**Day 5: Cross-Feature Integration**

- [ ] Google Sheets → Automation flow
- [ ] AI Analysis → Dashboard flow

**Deliverable:**

- ✅ Integration tests complete
- ✅ Coverage: ~70-75%

### 🌟 Phase 4: E2E & Polish (Tuần 7-8) - NICE TO HAVE

**Mục tiêu:** E2E tests và tối ưu coverage

#### ✅ Tuần 7: E2E Setup & Critical Flows

**Day 1-2: Cypress Setup**

- [ ] Install và configure Cypress
- [ ] Setup test structure
- [ ] Configure CI/CD

**Day 3-4: Critical E2E Flows**

- [ ] Login → Dashboard flow
- [ ] Google Sheets: Connect → Read → Write flow
- [ ] Automation: Create → Execute flow

**Day 5: E2E Error Scenarios**

- [ ] Error handling flows
- [ ] Network failure scenarios

**Deliverable:**

- ✅ E2E framework setup
- ✅ 3-5 critical flows tested
- ✅ Coverage: ~75-80%

#### ✅ Tuần 8: Polish & Optimization

**Day 1-2: Additional E2E Flows**

- [ ] Remaining user journeys
- [ ] Cross-feature flows

**Day 3-4: Test Optimization**

- [ ] Fix flaky tests
- [ ] Optimize slow tests
- [ ] Improve test maintainability

**Day 5: Documentation & Review**

- [ ] Update test documentation
- [ ] Code review test coverage
- [ ] Team training on testing

**Deliverable:**

- ✅ E2E tests complete
- ✅ Coverage: 80%+
- ✅ Test suite optimized

---

### 📊 Implementation Checklist (Quick Start)

**🎯 Week 1 Sprint:**

```bash
# Day 1: Setup
- Setup test utilities
- Create test fixtures
- Configure Jest

# Day 2-3: Critical Components
- Test Login component
- Test ProtectedRoute
- Test ErrorBoundary

# Day 4-5: Critical Services
- Test securityService
- Test Redux auth flow
- Setup API mocking
```

**🎯 Week 2 Sprint:**

```bash
# Day 1-2: Redux Testing
- Test all reducers
- Test async actions
- Test state persistence

# Day 3-4: Google Integration
- Test Google Sheets component
- Test Google Sheets service
- Test Google Drive integration

# Day 5: Dashboard
- Test LiveDashboard
- Test WebSocket integration
```

### 💡 Quick Wins (Có thể làm ngay)

**1. Test Utilities (1-2 giờ)**

- Tạo `src/utils/test-utils.js` với render helpers
- Tạo mock data fixtures

**2. Critical Component Tests (3-4 giờ)**

- Test Login component
- Test ProtectedRoute
- Đạt coverage ngay cho phần quan trọng nhất

**3. Service Mocking (2-3 giờ)**

- Setup API mocking
- Tạo mock responses
- Test error scenarios

**4. Redux Tests (4-5 giờ)**

- Test authReducer
- Test authActions
- Test store configuration

### 🎯 Success Metrics

**Phase 1 (Week 2):**

- ✅ 15-20% coverage
- ✅ Critical components tested
- ✅ Test infrastructure ready

**Phase 2 (Week 4):**

- ✅ 45-50% coverage
- ✅ Core features tested
- ✅ Google integration tested

**Phase 3 (Week 6):**

- ✅ 70% coverage
- ✅ Backend tested
- ✅ Integration flows tested

**Phase 4 (Week 8):**

- ✅ 80%+ coverage
- ✅ E2E tests complete
- ✅ Production ready

### 🔥 Recommended Tools & Scripts

**Tạo Helper Scripts:**

```bash
# scripts/setup-testing.sh
- Setup test infrastructure
- Install dependencies
- Create test directories
- Generate test templates

# scripts/run-tests-fast.sh
- Run only critical tests
- Skip slow tests
- Fast feedback loop

# scripts/test-coverage.sh
- Run tests with coverage
- Generate reports
- Check coverage thresholds
```

**Templates để bắt đầu nhanh:**

**1. Component Test Template** (`src/components/__tests__/Component.test.js.template`)

```javascript
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { Provider } from "react-redux";
import { BrowserRouter } from "react-router-dom";
import { store } from "../../../store/store";
import Component from "../Component";

const renderWithProviders = (ui) => {
  return render(
    <Provider store={store}>
      <BrowserRouter>{ui}</BrowserRouter>
    </Provider>
  );
};

describe("Component", () => {
  it("renders correctly", () => {
    renderWithProviders(<Component />);
    expect(screen.getByRole("...")).toBeInTheDocument();
  });

  // Add more tests...
});
```

**2. Service Test Template** (`src/services/__tests__/service.test.js.template`)

```javascript
import service from "../service";
import axios from "axios";

jest.mock("axios");

describe("Service", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("should handle success", async () => {
    axios.get.mockResolvedValue({ data: { success: true } });
    const result = await service.method();
    expect(result.success).toBe(true);
  });

  it("should handle errors", async () => {
    axios.get.mockRejectedValue(new Error("Network error"));
    await expect(service.method()).rejects.toThrow("Network error");
  });
});
```

**3. Redux Test Template** (`src/store/__tests__/slice.test.js.template`)

```javascript
import reducer, { actions } from "../slice";

describe("Slice", () => {
  const initialState = {
    /* initial state */
  };

  it("should return initial state", () => {
    expect(reducer(undefined, {})).toEqual(initialState);
  });

  it("should handle action", () => {
    const action = actions.actionName(payload);
    const newState = reducer(initialState, action);
    expect(newState).toEqual({
      /* expected state */
    });
  });
});
```

### 📝 Testing Best Practices Checklist

- [ ] ✅ **Write tests first** cho critical features (TDD)
- [ ] ✅ **Test behavior, not implementation**
- [ ] ✅ **Keep tests independent** - No dependencies
- [ ] ✅ **Use descriptive test names** - Clear intent
- [ ] ✅ **Mock external dependencies** - Fast, reliable
- [ ] ✅ **Test error scenarios** - Not just happy paths
- [ ] ✅ **Maintain test data** - Use fixtures
- [ ] ✅ **Review coverage regularly** - Identify gaps
- [ ] ✅ **Fix flaky tests immediately** - Don't ignore
- [ ] ✅ **Document test scenarios** - For team knowledge

### 🚨 Common Pitfalls to Avoid

❌ **Don't:**

- Test implementation details
- Write tests that depend on each other
- Ignore flaky tests
- Skip error scenarios
- Test everything (focus on critical paths)
- Over-mock (mock only external dependencies)

✅ **Do:**

- Test user-facing behavior
- Keep tests fast and independent
- Fix flaky tests immediately
- Test both success and failure paths
- Focus on critical features first
- Mock external services only

---

### 🎓 Training & Resources

**Để team bắt đầu nhanh:**

1. **Xem video tutorials:**
   - Jest & React Testing Library basics
   - Testing Redux with React
   - API mocking strategies
   - E2E testing với Cypress

2. **Đọc documentation:**
   - [Jest Documentation](https://jestjs.io/docs/getting-started)
   - [React Testing Library](https://testing-library.com/docs/react-testing-library/intro/)
   - [Cypress Best Practices](https://docs.cypress.io/guides/references/best-practices)

3. **Practice exercises:**
   - Start with simple component tests
   - Gradually move to complex integrations
   - Pair programming với experienced tester

### 📈 Progress Tracking

**Weekly Review Checklist:**

- [ ] Coverage % increase từ tuần trước
- [ ] Số tests mới được thêm
- [ ] Số bugs found by tests
- [ ] Test execution time
- [ ] Flaky tests identified and fixed
- [ ] Team feedback on testing process

**Metrics Dashboard Example:**

```
Week | Coverage | Tests | Pass Rate | Avg Time | Issues Found
-----|----------|-------|-----------|----------|-------------
1    | 15%      | 25    | 100%      | 5s       | 3
2    | 35%      | 80    | 98%       | 12s      | 8
3    | 50%      | 150   | 99%       | 20s      | 15
4    | 60%      | 220   | 99%       | 25s      | 20
...
```

---

## 🎬 Getting Started with Testing (Bắt Đầu Ngay)

### Quick Start Guide

**1. Kiểm tra hệ thống:**

```bash
# Run health check
npm run health-check

# Verify test setup
npm test -- --version
```

**2. Chạy existing tests:**

```bash
# Frontend tests
npm test

# Integration tests
npm run test:complete

# Backend tests
cd automation/one_automation_system
python run_tests.py
```

**3. Bắt đầu viết tests:**

```bash
# Tạo test file mới
touch src/components/YourComponent.test.js

# Copy từ template
cp src/components/__tests__/Component.test.js.template src/components/YourComponent.test.js

# Edit và run
npm test -- YourComponent.test.js
```

### Test Writing Workflow

**Step 1: Identify Test Target**

- Chọn component/service cần test
- Xác định critical paths
- List ra test cases

**Step 2: Write Test**

- Setup test file
- Write first test (render/basic)
- Add interaction tests
- Add error handling tests

**Step 3: Run & Verify**

- Run test: `npm test -- YourComponent.test.js`
- Check coverage: `npm run test:coverage`
- Fix any failures
- Refactor if needed

**Step 4: Integrate & Commit**

- Run full test suite: `npm test`
- Verify no regressions
- Commit with meaningful message
- Create PR with test coverage

### Example: Complete Test Flow

```bash
# 1. Create component test
touch src/components/UserProfile/UserProfile.test.js

# 2. Write basic test
cat > src/components/UserProfile/UserProfile.test.js << 'EOF'
import { render, screen } from '@testing-library/react';
import UserProfile from './UserProfile';

describe('UserProfile', () => {
  test('renders user name', () => {
    render(<UserProfile name="John Doe" />);
    expect(screen.getByText('John Doe')).toBeInTheDocument();
  });
});
EOF

# 3. Run test
npm test -- UserProfile.test.js

# 4. Check coverage
npm run test:coverage -- UserProfile.test.js

# 5. Commit
git add src/components/UserProfile/UserProfile.test.js
git commit -m "test: add UserProfile component tests"
```

---

## 🔄 Continuous Testing Strategy

### Development Workflow

**Pre-commit:**

```bash
# Run tests before commit
npm test -- --coverage --watchAll=false

# Or use git hooks (husky)
# Automatically runs tests on git commit
```

**During Development:**

```bash
# Watch mode for fast feedback
npm test

# Run only changed files
npm test -- --onlyChanged

# Run specific test file
npm test -- ComponentName.test.js
```

**Pre-deployment:**

```bash
# Run complete test suite
npm run test:all

# Run integration tests
npm run test:complete

# Run health checks
npm run health:full

# Build and test production bundle
npm run build && npm run test:ci
```

### CI/CD Integration

**GitHub Actions Example:**

```yaml
# .github/workflows/test.yml
name: Tests

on: [push, pull_request]

jobs:
  test-frontend:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: "18"
      - run: npm ci
      - run: npm test -- --coverage --watchAll=false
      - run: npm run build

  test-integration:
    runs-on: ubuntu-latest
    needs: test-frontend
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
      - run: npm ci
      - run: npm run test:complete

  test-backend:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-python@v4
        with:
          python-version: "3.10"
      - run: |
          cd automation/one_automation_system
          pip install -r requirements.txt
          python run_tests.py
```

### Testing in Different Environments

**Local Development:**

```bash
# Use .env.development
npm test

# Fast feedback, mock external services
```

**Staging:**

```bash
# Use .env.staging
npm run test:integration

# Test with staging APIs
```

**Production:**

```bash
# Use .env.production
npm run test:e2e

# Smoke tests only, real data
```

---

## 📊 Test Coverage Analysis

### Understanding Coverage Metrics

**Statement Coverage:**

- Percentage of code statements executed
- Goal: 70%+ for most code, 85%+ for critical

**Branch Coverage:**

- Percentage of conditional branches tested
- Important for if/else, switch cases
- Goal: 70%+

**Function Coverage:**

- Percentage of functions called
- Goal: 70%+

**Line Coverage:**

- Percentage of code lines executed
- Similar to statement coverage
- Goal: 70%+

### Analyzing Coverage Reports

```bash
# Generate coverage report
npm run test:coverage

# Open HTML report
open coverage/lcov-report/index.html

# View in terminal
cat coverage/coverage-summary.json | jq
```

**Reading Coverage Report:**

```
File                   | % Stmts | % Branch | % Funcs | % Lines |
-----------------------|---------|----------|---------|---------|
All files              |   65.5  |   58.2   |   70.1  |   65.8  |
 src/                  |   72.3  |   65.4   |   78.9  |   72.5  |
  auth/                |   85.2  |   78.3   |   90.1  |   85.4  |
   Login.jsx           |   92.5  |   87.5   |   100   |   93.2  | ✅ Excellent
   ProtectedRoute.jsx  |   78.3  |   70.0   |   80.0  |   77.9  | ✅ Good
  components/          |   45.2  |   38.7   |   52.3  |   44.8  | ⚠️ Needs work
```

**Coverage Improvement Strategy:**

1. **Identify gaps:** Find files with < 50% coverage
2. **Prioritize:** Focus on critical/frequently used
3. **Write tests:** Add tests for uncovered branches
4. **Refactor:** Sometimes improve testability
5. **Review:** Check if 100% coverage is necessary

### Coverage Goals by Phase

**Phase 1 (Foundation):**

- Overall: 15-20%
- Critical files: 80%+
- Auth components: 90%+

**Phase 2 (High-Value):**

- Overall: 45-50%
- Core features: 70%+
- Services: 75%+

**Phase 3 (Backend & Integration):**

- Overall: 65-70%
- Integration tests: 60%+
- Backend: 70%+

**Phase 4 (E2E & Polish):**

- Overall: 80%+
- E2E flows: 85%+
- Production-ready

---

## 🐛 Debugging Tests

### Common Test Failures & Solutions

**1. Test Timeout**

```javascript
// Problem: Async test doesn't complete
test("async test", async () => {
  await fetchData(); // Times out
});

// Solution 1: Increase timeout
test("async test", async () => {
  await fetchData();
}, 10000); // 10 seconds

// Solution 2: Use waitFor
test("async test", async () => {
  render(<Component />);
  await waitFor(
    () => {
      expect(screen.getByText("Data loaded")).toBeInTheDocument();
    },
    { timeout: 5000 }
  );
});
```

**2. Element Not Found**

```javascript
// Problem: Element not in document
test("finds element", () => {
  render(<Component />);
  expect(screen.getByText("Hello")).toBeInTheDocument(); // ❌ Not found
});

// Solution 1: Check if async
test("finds element", async () => {
  render(<Component />);
  expect(await screen.findByText("Hello")).toBeInTheDocument(); // ✅
});

// Solution 2: Check actual output
test("debug output", () => {
  render(<Component />);
  screen.debug(); // Print actual DOM
});

// Solution 3: Use query variant
test("check if not exists", () => {
  render(<Component />);
  expect(screen.queryByText("Hello")).not.toBeInTheDocument(); // ✅
});
```

**3. Mock Not Working**

```javascript
// Problem: Mock not applied
jest.mock("./api");
import { fetchData } from "./api";

test("mock test", async () => {
  fetchData.mockResolvedValue({ data: [] }); // ❌ Not a function
});

// Solution: Import after mock
jest.mock("./api", () => ({
  fetchData: jest.fn(),
}));

test("mock test", async () => {
  const { fetchData } = require("./api");
  fetchData.mockResolvedValue({ data: [] }); // ✅
});
```

**4. Redux State Issues**

```javascript
// Problem: Redux state not updating
test("redux test", () => {
  const { getByRole } = render(
    <Provider store={store}>
      <Component />
    </Provider>
  );
  fireEvent.click(getByRole("button"));
  // State not updated
});

// Solution: Create fresh store for each test
import { configureStore } from "@reduxjs/toolkit";

test("redux test", () => {
  const store = configureStore({
    reducer: { auth: authReducer },
  });

  const { getByRole } = render(
    <Provider store={store}>
      <Component />
    </Provider>
  );

  fireEvent.click(getByRole("button"));
  expect(store.getState().auth.value).toBe(1); // ✅
});
```

**5. Flaky Tests**

```javascript
// Problem: Test fails intermittently
test("flaky test", () => {
  render(<Component />);
  const button = screen.getByRole("button");
  fireEvent.click(button);
  expect(screen.getByText("Clicked")).toBeInTheDocument(); // Sometimes fails
});

// Solution: Use waitFor for async updates
test("stable test", async () => {
  render(<Component />);
  const button = screen.getByRole("button");
  fireEvent.click(button);

  await waitFor(() => {
    expect(screen.getByText("Clicked")).toBeInTheDocument();
  });
});
```

### Debugging Tools

**1. React Testing Library Debug:**

```javascript
test("debug test", () => {
  const { debug, container } = render(<Component />);

  // Print entire DOM
  debug();

  // Print specific element
  debug(container.firstChild);

  // Pretty print
  console.log(prettyDOM(container));
});
```

**2. Jest Debug:**

```bash
# Run with Node debugger
node --inspect-brk node_modules/.bin/jest --runInBand

# Open chrome://inspect in Chrome
# Set breakpoints in test file
```

**3. VS Code Debugging:**

```json
// .vscode/launch.json
{
  "type": "node",
  "request": "launch",
  "name": "Jest Debug",
  "program": "${workspaceFolder}/node_modules/.bin/jest",
  "args": ["--runInBand", "--no-cache", "${file}"],
  "console": "integratedTerminal",
  "internalConsoleOptions": "neverOpen"
}
```

---

## 📖 Testing Patterns & Examples

### Pattern 1: Testing Forms

```javascript
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import LoginForm from "./LoginForm";

describe("LoginForm", () => {
  test("submits form with valid data", async () => {
    const onSubmit = jest.fn();
    render(<LoginForm onSubmit={onSubmit} />);

    // Type in inputs
    await userEvent.type(screen.getByLabelText("Email"), "user@example.com");
    await userEvent.type(screen.getByLabelText("Password"), "password123");

    // Submit form
    fireEvent.click(screen.getByRole("button", { name: /login/i }));

    // Wait for submission
    await waitFor(() => {
      expect(onSubmit).toHaveBeenCalledWith({
        email: "user@example.com",
        password: "password123",
      });
    });
  });

  test("shows validation errors", async () => {
    render(<LoginForm />);

    // Submit without filling
    fireEvent.click(screen.getByRole("button", { name: /login/i }));

    // Check errors
    expect(await screen.findByText("Email is required")).toBeInTheDocument();
    expect(screen.getByText("Password is required")).toBeInTheDocument();
  });
});
```

### Pattern 2: Testing API Calls

```javascript
import axios from "axios";
import { render, screen, waitFor } from "@testing-library/react";
import UserList from "./UserList";

jest.mock("axios");

describe("UserList", () => {
  test("loads and displays users", async () => {
    const users = [
      { id: 1, name: "John Doe" },
      { id: 2, name: "Jane Smith" },
    ];

    axios.get.mockResolvedValue({ data: users });

    render(<UserList />);

    // Loading state
    expect(screen.getByText("Loading...")).toBeInTheDocument();

    // Wait for data
    await waitFor(() => {
      expect(screen.getByText("John Doe")).toBeInTheDocument();
      expect(screen.getByText("Jane Smith")).toBeInTheDocument();
    });

    // Verify API called
    expect(axios.get).toHaveBeenCalledWith("/api/users");
  });

  test("handles API error", async () => {
    axios.get.mockRejectedValue(new Error("Network error"));

    render(<UserList />);

    await waitFor(() => {
      expect(screen.getByText("Error: Network error")).toBeInTheDocument();
    });
  });
});
```

### Pattern 3: Testing Redux Connected Components

```javascript
import { render, screen, fireEvent } from "@testing-library/react";
import { Provider } from "react-redux";
import { configureStore } from "@reduxjs/toolkit";
import Counter from "./Counter";
import counterReducer from "./counterSlice";

describe("Counter with Redux", () => {
  let store;

  beforeEach(() => {
    store = configureStore({
      reducer: { counter: counterReducer },
    });
  });

  test("increments counter", () => {
    render(
      <Provider store={store}>
        <Counter />
      </Provider>
    );

    const button = screen.getByRole("button", { name: /increment/i });
    const count = screen.getByTestId("count");

    expect(count).toHaveTextContent("0");

    fireEvent.click(button);
    expect(count).toHaveTextContent("1");

    fireEvent.click(button);
    expect(count).toHaveTextContent("2");
  });

  test("dispatches correct actions", () => {
    const initialState = { counter: { value: 0 } };
    const mockStore = configureStore({
      reducer: { counter: counterReducer },
      preloadedState: initialState,
    });

    render(
      <Provider store={mockStore}>
        <Counter />
      </Provider>
    );

    fireEvent.click(screen.getByRole("button", { name: /increment/i }));

    const state = mockStore.getState();
    expect(state.counter.value).toBe(1);
  });
});
```

### Pattern 4: Testing Routing

```javascript
import { render, screen, fireEvent } from "@testing-library/react";
import { MemoryRouter, Routes, Route } from "react-router-dom";
import Navigation from "./Navigation";
import Home from "./Home";
import About from "./About";

describe("Navigation", () => {
  test("navigates to different pages", () => {
    render(
      <MemoryRouter initialEntries={["/"]}>
        <Navigation />
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/about" element={<About />} />
        </Routes>
      </MemoryRouter>
    );

    // Initially on Home
    expect(screen.getByText("Home Page")).toBeInTheDocument();

    // Navigate to About
    fireEvent.click(screen.getByRole("link", { name: /about/i }));
    expect(screen.getByText("About Page")).toBeInTheDocument();
  });

  test("redirects to login for protected routes", () => {
    render(
      <MemoryRouter initialEntries={["/dashboard"]}>
        <Routes>
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            }
          />
          <Route path="/login" element={<Login />} />
        </Routes>
      </MemoryRouter>
    );

    // Should redirect to login
    expect(screen.getByText("Login Page")).toBeInTheDocument();
  });
});
```

### Pattern 5: Testing Hooks

```javascript
import { renderHook, act } from "@testing-library/react";
import { useCounter } from "./useCounter";

describe("useCounter", () => {
  test("increments counter", () => {
    const { result } = renderHook(() => useCounter());

    expect(result.current.count).toBe(0);

    act(() => {
      result.current.increment();
    });

    expect(result.current.count).toBe(1);
  });

  test("decrements counter", () => {
    const { result } = renderHook(() => useCounter(10));

    expect(result.current.count).toBe(10);

    act(() => {
      result.current.decrement();
    });

    expect(result.current.count).toBe(9);
  });

  test("resets counter", () => {
    const { result } = renderHook(() => useCounter());

    act(() => {
      result.current.increment();
      result.current.increment();
    });

    expect(result.current.count).toBe(2);

    act(() => {
      result.current.reset();
    });

    expect(result.current.count).toBe(0);
  });
});
```

---

## 🎓 Advanced Testing Topics

### Testing WebSocket Connections

```javascript
import { renderHook } from "@testing-library/react";
import { useWebSocket } from "./useWebSocket";
import { io } from "socket.io-client";

jest.mock("socket.io-client");

describe("useWebSocket", () => {
  let mockSocket;

  beforeEach(() => {
    mockSocket = {
      on: jest.fn(),
      emit: jest.fn(),
      disconnect: jest.fn(),
      connected: true,
    };

    io.mockReturnValue(mockSocket);
  });

  test("connects to WebSocket", () => {
    const { result } = renderHook(() => useWebSocket("http://localhost:3001"));

    expect(io).toHaveBeenCalledWith("http://localhost:3001");
    expect(mockSocket.on).toHaveBeenCalledWith("connect", expect.any(Function));
  });

  test("handles messages", () => {
    const onMessage = jest.fn();
    renderHook(() => useWebSocket("http://localhost:3001", { onMessage }));

    const messageHandler = mockSocket.on.mock.calls.find((call) => call[0] === "message")[1];

    messageHandler({ data: "test" });
    expect(onMessage).toHaveBeenCalledWith({ data: "test" });
  });
});
```

### Testing Performance

```javascript
import { render } from "@testing-library/react";
import { performance } from "perf_hooks";
import HeavyComponent from "./HeavyComponent";

describe("HeavyComponent Performance", () => {
  test("renders within performance budget", () => {
    const start = performance.now();

    render(<HeavyComponent data={largeDataset} />);

    const end = performance.now();
    const renderTime = end - start;

    expect(renderTime).toBeLessThan(100); // 100ms budget
  });
});
```

### Testing Accessibility

```javascript
import { render } from "@testing-library/react";
import { axe, toHaveNoViolations } from "jest-axe";
import Button from "./Button";

expect.extend(toHaveNoViolations);

describe("Button Accessibility", () => {
  test("has no accessibility violations", async () => {
    const { container } = render(<Button>Click me</Button>);
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });

  test("is keyboard navigable", () => {
    const { getByRole } = render(<Button>Click me</Button>);
    const button = getByRole("button");

    button.focus();
    expect(button).toHaveFocus();
  });

  test("has proper ARIA attributes", () => {
    const { getByRole } = render(<Button aria-label="Submit form">Submit</Button>);

    expect(getByRole("button")).toHaveAttribute("aria-label", "Submit form");
  });
});
```

---

## 📚 Additional Testing Resources

### Recommended Reading

**Books:**

- "Testing JavaScript Applications" - Lucas da Costa
- "The Art of Unit Testing" - Roy Osherove
- "Test-Driven Development with React" - Trevor Burnham

**Articles:**

- [Testing Library Best Practices](https://kentcdodds.com/blog/common-mistakes-with-react-testing-library)
- [React Testing Library Cheatsheet](https://testing-library.com/docs/react-testing-library/cheatsheet)
- [Jest Cheat Sheet](https://github.com/sapegin/jest-cheat-sheet)

**Video Courses:**

- Kent C. Dodds - Testing JavaScript
- Testing React with Jest and React Testing Library
- Advanced React Testing Patterns

### Community & Support

**Forums:**

- [Testing Library Discord](https://discord.gg/testing-library)
- [Jest Community](https://jestjs.io/community)
- [React Testing Library Discussions](https://github.com/testing-library/react-testing-library/discussions)

**Stack Overflow Tags:**

- [jest](https://stackoverflow.com/questions/tagged/jest)
- [react-testing-library](https://stackoverflow.com/questions/tagged/react-testing-library)
- [testing](https://stackoverflow.com/questions/tagged/testing)

---

## 🏆 Testing Success Stories

### Before Testing

- ❌ Bugs found in production
- ❌ Fear of refactoring
- ❌ Slow development feedback
- ❌ Manual testing overhead
- ❌ Low confidence in deployments

### After Testing (80% Coverage)

- ✅ Bugs caught before production
- ✅ Safe refactoring
- ✅ Fast feedback loop
- ✅ Automated regression testing
- ✅ Confident deployments
- ✅ Reduced debugging time
- ✅ Better code documentation
- ✅ Team productivity increased

### ROI of Testing

**Investment:**

- ~2-3 weeks setup (Phase 1-2)
- ~20-30% development time for tests

**Returns:**

- 60-80% reduction in production bugs
- 50% faster debugging
- 40% faster onboarding (tests as docs)
- 90% confidence in deployments
- Saved thousands of hours in manual testing

---

## 🎯 Final Checklist - Production Ready

### Pre-Production Testing Checklist

**✅ Unit Tests:**

- [ ] All critical components tested
- [ ] All services tested
- [ ] All utilities tested
- [ ] Coverage >= 70%

**✅ Integration Tests:**

- [ ] Redux store tested
- [ ] API integration tested
- [ ] Routing tested
- [ ] WebSocket tested

**✅ E2E Tests:**

- [ ] Critical user flows tested
- [ ] Error scenarios tested
- [ ] Cross-browser tested

**✅ Performance Tests:**

- [ ] Load time tested
- [ ] API response time tested
- [ ] Memory usage verified

**✅ Security Tests:**

- [ ] Authentication tested
- [ ] Authorization tested
- [ ] Input validation tested
- [ ] XSS prevention verified

**✅ Accessibility Tests:**

- [ ] Keyboard navigation tested
- [ ] Screen reader compatibility
- [ ] ARIA labels verified

**✅ CI/CD:**

- [ ] Tests run on every PR
- [ ] Tests run before deployment
- [ ] Coverage reports generated
- [ ] Test failures block deployment

**✅ Documentation:**

- [ ] Test strategy documented
- [ ] Test cases documented
- [ ] Coverage requirements defined
- [ ] Team trained on testing

---

## 🤖 AI Service Changes (2026-03-24)

### Bug Fixes Applied

| Module                  | Bug                                                                                            | Fix                                                                                         |
| ----------------------- | ---------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------- |
| `predictive_alerts.py`  | `self.alerts = []` in `__init__` accumulated state across requests on long-running server      | Removed mutable instance state; `set_threshold()` now returns dict instead of mutating self |
| `pattern_recognizer.py` | `detect_cycles()` only checked lag-7 (weekly) and lag-30 (monthly)                             | Added lag-1 daily correlation check with threshold 0.7 before weekly check                  |
| `smart_categorizer.py`  | `group_similar_items()` returned `{"all": data}` placeholder — no real grouping logic          | Auto-finds first string column with 2–20 unique values and groups by it                     |
| `aiService.js`          | Called `/api/ml/...` (Node.js backend proxy paths) instead of `/ai/...` (FastAPI direct paths) | Complete rewrite — all methods now call correct FastAPI routes                              |
| `aiService.js`          | Missing JWT auth — FastAPI with `AUTH_REQUIRED=true` returned 401                              | Added `getToken()` with 5-minute early-expiry caching                                       |
| `AIDashboard.jsx`       | Recommendations showed duplicate text (title == description)                                   | Added `rec.description !== rec.title` guard                                                 |
| `AIDashboard.jsx`       | Performance metrics were hardcoded numbers                                                     | Now reads real counts from `aiInsights`, `recommendations`, `sheets`, `files`, `alerts`     |
| `AIDashboard.css`       | Grid layout unbalanced — all 3 columns equal width                                             | Changed to `1fr 1.6fr 1fr` with `align-items: start`                                        |

### FastAPI Endpoint Map

| `aiService.js` method    | FastAPI route                                            | Notes                             |
| ------------------------ | -------------------------------------------------------- | --------------------------------- |
| `analyzeData()`          | `POST /ai/analyze/trends` + `POST /ai/analyze/anomalies` | Parallel via `Promise.allSettled` |
| `getPredictions()`       | `POST /ai/predictions`                                   | `horizon: 5`                      |
| `detectAnomalies()`      | `POST /ai/analyze/anomalies`                             |                                   |
| `getRecommendations()`   | `POST /ai/reports/summary`                               |                                   |
| `chat()`                 | `POST /ai/chat`                                          | `{ query, context }`              |
| `analyzeSheets()`        | `POST /ai/summary`                                       |                                   |
| `analyzeGoogleContext()` | `POST /ai/analyze/full`                                  |                                   |
| `optimizeSystem()`       | `POST /ai/reports/comprehensive`                         |                                   |

### Auth Flow

```text
frontend → POST /auth/token { api_key: REACT_APP_AI_API_KEY }
         ← { access_token, expires_in }
         → all subsequent requests: Authorization: Bearer <token>
```

Token cached in module scope; refreshed 5 minutes before expiry to avoid race conditions.

### Pending AI Improvements

- [ ] **NLP Claude API hybrid** — when regex confidence < 0.6, fall back to `claude-haiku-4-5` for intent parsing
- [ ] **Automation `.env` Telegram tokens** — `automation/.env` has placeholder `your_bot_token_from_BotFather`; copy real tokens from root `.env`
- [ ] **Google Drive folder structure** — create automated folder organization script

---

## 📋 Recommended Next Steps

### Short-term (this week)

1. **Fix Telegram in automation** — copy `TELEGRAM_BOT_TOKEN` and `TELEGRAM_CHAT_ID` from root `.env` to `automation/.env`
2. **Test AI Dashboard end-to-end** — start `npm run dev`, navigate to AI Dashboard, verify all 4 panels load without error banner
3. **Run full test suite** — `npm run test:ci` should pass; `npm run test:e2e` should exit 0 with `--passWithNoTests`

### Medium-term

1. **NLP fallback to Claude API** — in `ai-service/mia_models/nlp_processor.py`, add: if `confidence < 0.6`, call `claude-haiku-4-5` with the query and parse structured intent from response
2. **WebSocket health dashboard** — add real-time AI service status indicator to the header (green/red dot showing port 8000 reachability)
3. **Google Drive folder structure** — create `scripts/setup-drive-folders.js` to auto-create standard folder hierarchy via Google Drive API

### Architecture

1. **Split `main_simple.py` routes** — router is 800+ lines; split into `routers/ai.py`, `routers/auth.py`, `routers/reports.py`
2. **Add request-level alert storage** — `PredictiveAlerts` now stateless; connect it to Redis or a lightweight DB if persistence across sessions is needed

---

**Last Updated:** 2026-03-24
**Version:** 4.2.0
**Status:** ✅ Complete and Production-Ready
**Maintained by:** Development Team

**Changelog:**

- **v4.2.0 (2026-03-24):** AI service bug fixes (alerts state, daily cycle, auto-group), aiService.js rewrite (correct FastAPI routes + JWT auth), AIDashboard UI fixes (layout, duplicate text, real metrics), jest.config.js syntax fix, Login.test.jsx timeout fix, test:e2e passWithNoTests, VSCode workspace consolidated
- **v4.0.0 (Jan 19, 2026):** Complete testing guide with implementation roadmap
- **v3.5.0 (Dec 19, 2025):** Added E2E testing phase
- **v3.0.0 (Dec 15, 2025):** Added backend testing section
- **v2.0.0 (Dec 10, 2025):** Added integration testing
- **v1.0.0 (Dec 5, 2025):** Initial testing setup
