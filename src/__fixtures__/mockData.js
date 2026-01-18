/**
 * Mock Data for Testing
 * Provides consistent test data across all tests
 */

// Mock User Data
export const mockUser = {
  id: 1,
  email: "test@example.com",
  name: "Test User",
  role: "admin",
  permissions: ["read", "write", "delete"],
  mfaEnabled: false,
};

export const mockUsers = [
  mockUser,
  {
    id: 2,
    email: "user2@example.com",
    name: "User Two",
    role: "user",
    permissions: ["read"],
    mfaEnabled: true,
  },
  {
    id: 3,
    email: "user3@example.com",
    name: "User Three",
    role: "editor",
    permissions: ["read", "write"],
    mfaEnabled: false,
  },
];

// Mock Authentication Data
export const mockAuthToken = "mock-jwt-token-12345";
export const mockRefreshToken = "mock-refresh-token-67890";

export const mockAuthResponse = {
  success: true,
  user: mockUser,
  token: mockAuthToken,
  refreshToken: mockRefreshToken,
};

// Mock Google Sheets Data
export const mockSpreadsheetId = "1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs74OgvE2upms";

export const mockSheetData = {
  range: "Sheet1!A1:D10",
  majorDimension: "ROWS",
  values: [
    ["Name", "Email", "Phone", "Status"],
    ["John Doe", "john@example.com", "123-456-7890", "Active"],
    ["Jane Smith", "jane@example.com", "098-765-4321", "Inactive"],
    ["Bob Johnson", "bob@example.com", "555-555-5555", "Active"],
  ],
};

export const mockSheetMetadata = {
  spreadsheetId: mockSpreadsheetId,
  properties: {
    title: "Test Spreadsheet",
    locale: "en_US",
    autoRecalc: "ON_CHANGE",
    timeZone: "America/New_York",
  },
  sheets: [
    {
      properties: {
        sheetId: 0,
        title: "Sheet1",
        index: 0,
        sheetType: "GRID",
        gridProperties: {
          rowCount: 1000,
          columnCount: 26,
        },
      },
    },
  ],
};

// Mock Google Drive Data
export const mockFiles = [
  {
    id: "file-id-1",
    name: "Document 1.pdf",
    mimeType: "application/pdf",
    createdTime: "2024-01-01T00:00:00.000Z",
    modifiedTime: "2024-01-01T00:00:00.000Z",
    size: 1024000,
  },
  {
    id: "file-id-2",
    name: "Spreadsheet 1.xlsx",
    mimeType: "application/vnd.google-apps.spreadsheet",
    createdTime: "2024-01-02T00:00:00.000Z",
    modifiedTime: "2024-01-02T00:00:00.000Z",
    size: 2048000,
  },
  {
    id: "folder-id-1",
    name: "My Folder",
    mimeType: "application/vnd.google-apps.folder",
    createdTime: "2024-01-03T00:00:00.000Z",
    modifiedTime: "2024-01-03T00:00:00.000Z",
  },
];

export const mockFileMetadata = {
  id: "file-id-1",
  name: "Document 1.pdf",
  mimeType: "application/pdf",
  description: "Test document",
  createdTime: "2024-01-01T00:00:00.000Z",
  modifiedTime: "2024-01-01T00:00:00.000Z",
  size: 1024000,
  owners: [mockUser],
  permissions: [
    {
      id: "permission-1",
      type: "user",
      role: "owner",
      emailAddress: mockUser.email,
    },
  ],
};

// Mock Dashboard Data
export const mockDashboardData = {
  metrics: {
    totalOrders: 1250,
    totalRevenue: 45000,
    activeUsers: 328,
    pendingTasks: 12,
  },
  recentOrders: [
    { id: 1, customer: "Customer 1", amount: 120, status: "completed" },
    { id: 2, customer: "Customer 2", amount: 250, status: "pending" },
    { id: 3, customer: "Customer 3", amount: 180, status: "processing" },
  ],
  analytics: {
    labels: ["Jan", "Feb", "Mar", "Apr", "May", "Jun"],
    datasets: [
      {
        label: "Sales",
        data: [12000, 15000, 18000, 20000, 22000, 25000],
      },
    ],
  },
};

// Mock WebSocket Messages
export const mockWebSocketMessages = {
  welcome: {
    type: "welcome",
    message: "Connected to WebSocket server",
    timestamp: new Date().toISOString(),
  },
  dataUpdate: {
    type: "dataUpdate",
    data: mockDashboardData,
    timestamp: new Date().toISOString(),
  },
  alert: {
    type: "alert",
    severity: "warning",
    message: "High CPU usage detected",
    timestamp: new Date().toISOString(),
  },
};

// Mock Automation Data
export const mockAutomation = {
  id: "auto-1",
  name: "Daily Report Automation",
  description: "Generates daily reports from Google Sheets",
  status: "active",
  schedule: "0 9 * * *", // 9 AM daily
  lastRun: "2024-01-15T09:00:00.000Z",
  nextRun: "2024-01-16T09:00:00.000Z",
  enabled: true,
};

export const mockAutomations = [
  mockAutomation,
  {
    id: "auto-2",
    name: "Weekly Backup",
    description: "Backs up all data weekly",
    status: "inactive",
    schedule: "0 0 * * 0", // Sunday midnight
    lastRun: "2024-01-14T00:00:00.000Z",
    nextRun: "2024-01-21T00:00:00.000Z",
    enabled: false,
  },
];

export const mockAutomationLogs = [
  {
    id: "log-1",
    automationId: "auto-1",
    status: "success",
    message: "Automation completed successfully",
    startTime: "2024-01-15T09:00:00.000Z",
    endTime: "2024-01-15T09:05:00.000Z",
    duration: 300000, // 5 minutes
  },
  {
    id: "log-2",
    automationId: "auto-1",
    status: "failed",
    message: "API rate limit exceeded",
    error: "Rate limit exceeded. Try again in 60 seconds.",
    startTime: "2024-01-14T09:00:00.000Z",
    endTime: "2024-01-14T09:01:00.000Z",
    duration: 60000, // 1 minute
  },
];

// Mock AI Analysis Data
export const mockAIAnalysis = {
  id: "analysis-1",
  type: "prediction",
  status: "completed",
  results: {
    predictions: [
      { label: "Q1 Sales", value: 150000, confidence: 0.85 },
      { label: "Q2 Sales", value: 175000, confidence: 0.82 },
      { label: "Q3 Sales", value: 200000, confidence: 0.78 },
    ],
    insights: [
      "Sales trend is positive",
      "Expected 15% growth in Q2",
      "Seasonal peak in Q3",
    ],
    recommendations: [
      "Increase inventory for Q3",
      "Plan marketing campaign for Q2",
      "Review pricing strategy",
    ],
  },
  createdAt: "2024-01-15T10:00:00.000Z",
};

// Mock Error Responses
export const mockErrorResponse = {
  error: {
    message: "Internal Server Error",
    code: 500,
    details: "Something went wrong",
  },
};

export const mockValidationError = {
  error: {
    message: "Validation Error",
    code: 400,
    errors: [
      { field: "email", message: "Invalid email format" },
      { field: "password", message: "Password must be at least 8 characters" },
    ],
  },
};

export const mockUnauthorizedError = {
  error: {
    message: "Unauthorized",
    code: 401,
    details: "Authentication token is invalid or expired",
  },
};

export const mockNotFoundError = {
  error: {
    message: "Not Found",
    code: 404,
    details: "The requested resource was not found",
  },
};

// Export all mock data
export default {
  mockUser,
  mockUsers,
  mockAuthToken,
  mockRefreshToken,
  mockAuthResponse,
  mockSpreadsheetId,
  mockSheetData,
  mockSheetMetadata,
  mockFiles,
  mockFileMetadata,
  mockDashboardData,
  mockWebSocketMessages,
  mockAutomation,
  mockAutomations,
  mockAutomationLogs,
  mockAIAnalysis,
  mockErrorResponse,
  mockValidationError,
  mockUnauthorizedError,
  mockNotFoundError,
};
