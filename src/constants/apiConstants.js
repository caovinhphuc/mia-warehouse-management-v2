// API Constants and Configuration

// Google API Configuration
export const GOOGLE_API_CONFIG = {
  SCOPES: [
    "https://www.googleapis.com/auth/spreadsheets",
    "https://www.googleapis.com/auth/drive.file",
    "https://www.googleapis.com/auth/drive",
    "https://www.googleapis.com/auth/drive.metadata.readonly",
  ],

  API_VERSIONS: {
    SHEETS: "v4",
    DRIVE: "v3",
  },

  BASE_URLS: {
    SHEETS: "https://sheets.googleapis.com/v4/spreadsheets",
    DRIVE: "https://www.googleapis.com/drive/v3",
  },
};

// API Endpoints
export const API_ENDPOINTS = {
  // Google Sheets
  SHEETS: {
    GET: "/{spreadsheetId}",
    VALUES_GET: "/{spreadsheetId}/values/{range}",
    VALUES_UPDATE: "/{spreadsheetId}/values/{range}",
    VALUES_APPEND: "/{spreadsheetId}/values/{range}:append",
    VALUES_BATCH_GET: "/{spreadsheetId}/values:batchGet",
    VALUES_BATCH_UPDATE: "/{spreadsheetId}/values:batchUpdate",
    VALUES_CLEAR: "/{spreadsheetId}/values/{range}:clear",
    BATCH_UPDATE: "/{spreadsheetId}:batchUpdate",
  },

  // Google Drive
  DRIVE: {
    FILES_LIST: "/files",
    FILES_GET: "/files/{fileId}",
    FILES_CREATE: "/files",
    FILES_UPDATE: "/files/{fileId}",
    FILES_DELETE: "/files/{fileId}",
    FILES_COPY: "/files/{fileId}/copy",
    ABOUT_GET: "/about",
  },
};

// HTTP Status Codes
export const HTTP_STATUS = {
  OK: 200,
  CREATED: 201,
  NO_CONTENT: 204,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  CONFLICT: 409,
  TOO_MANY_REQUESTS: 429,
  INTERNAL_SERVER_ERROR: 500,
  BAD_GATEWAY: 502,
  SERVICE_UNAVAILABLE: 503,
};

// Error Messages
export const ERROR_MESSAGES = {
  // General errors
  NETWORK_ERROR: "Network error. Please check your internet connection.",
  UNKNOWN_ERROR: "An unknown error occurred. Please try again.",
  INVALID_RESPONSE: "Invalid response from server.",

  // Authentication errors
  AUTH_FAILED: "Authentication failed. Please check your credentials.",
  INVALID_CREDENTIALS: "Invalid credentials provided.",
  TOKEN_EXPIRED: "Authentication token has expired.",

  // Google API errors
  GOOGLE_API_ERROR: "Google API error occurred.",
  QUOTA_EXCEEDED: "API quota exceeded. Please try again later.",
  PERMISSION_DENIED: "Permission denied. Please check your access rights.",
  RESOURCE_NOT_FOUND: "Requested resource not found.",
  INVALID_REQUEST: "Invalid request parameters.",

  // File errors
  FILE_NOT_FOUND: "File not found.",
  FILE_TOO_LARGE: "File size exceeds the maximum allowed limit.",
  INVALID_FILE_TYPE: "Invalid file type.",
  UPLOAD_FAILED: "File upload failed.",
  DOWNLOAD_FAILED: "File download failed.",

  // Sheet errors
  SHEET_NOT_FOUND: "Google Sheet not found.",
  INVALID_RANGE: "Invalid sheet range specified.",
  SHEET_ACCESS_DENIED: "Access denied to Google Sheet.",

  // Drive errors
  DRIVE_ACCESS_DENIED: "Access denied to Google Drive.",
  FOLDER_NOT_FOUND: "Google Drive folder not found.",
  INSUFFICIENT_STORAGE: "Insufficient storage space.",

  // Validation errors
  INVALID_EMAIL: "Please enter a valid email address.",
  INVALID_PHONE: "Please enter a valid phone number.",
  INVALID_URL: "Please enter a valid URL.",
  REQUIRED_FIELD: "This field is required.",
  INVALID_FORMAT: "Invalid format provided.",

  // Configuration errors
  MISSING_CONFIG: "Missing configuration parameters.",
  INVALID_CONFIG: "Invalid configuration provided.",
  ENVIRONMENT_ERROR: "Environment configuration error.",
};

// Success Messages
export const SUCCESS_MESSAGES = {
  // General success
  OPERATION_SUCCESS: "Operation completed successfully.",
  DATA_SAVED: "Data saved successfully.",
  DATA_LOADED: "Data loaded successfully.",
  DATA_UPDATED: "Data updated successfully.",
  DATA_DELETED: "Data deleted successfully.",

  // File operations
  FILE_UPLOADED: "File uploaded successfully.",
  FILE_DOWNLOADED: "File downloaded successfully.",
  FILE_DELETED: "File deleted successfully.",
  FILE_COPIED: "File copied successfully.",

  // Sheet operations
  SHEET_READ: "Sheet data read successfully.",
  SHEET_WRITTEN: "Data written to sheet successfully.",
  SHEET_UPDATED: "Sheet updated successfully.",

  // Authentication
  LOGIN_SUCCESS: "Logged in successfully.",
  LOGOUT_SUCCESS: "Logged out successfully.",
  AUTH_SUCCESS: "Authentication successful.",
};

// File Types and Extensions
export const FILE_TYPES = {
  IMAGES: {
    extensions: ["jpg", "jpeg", "png", "gif", "bmp", "svg", "webp"],
    mimeTypes: [
      "image/jpeg",
      "image/png",
      "image/gif",
      "image/bmp",
      "image/svg+xml",
      "image/webp",
    ],
  },

  DOCUMENTS: {
    extensions: ["pdf", "doc", "docx", "txt", "rtf"],
    mimeTypes: [
      "application/pdf",
      "application/msword",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      "text/plain",
      "application/rtf",
    ],
  },

  SPREADSHEETS: {
    extensions: ["xls", "xlsx", "csv"],
    mimeTypes: [
      "application/vnd.ms-excel",
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      "text/csv",
    ],
  },

  PRESENTATIONS: {
    extensions: ["ppt", "pptx"],
    mimeTypes: [
      "application/vnd.ms-powerpoint",
      "application/vnd.openxmlformats-officedocument.presentationml.presentation",
    ],
  },

  ARCHIVES: {
    extensions: ["zip", "rar", "7z", "tar", "gz"],
    mimeTypes: [
      "application/zip",
      "application/x-rar-compressed",
      "application/x-7z-compressed",
      "application/x-tar",
      "application/gzip",
    ],
  },

  VIDEOS: {
    extensions: ["mp4", "avi", "mov", "wmv", "flv", "webm"],
    mimeTypes: [
      "video/mp4",
      "video/x-msvideo",
      "video/quicktime",
      "video/x-ms-wmv",
      "video/x-flv",
      "video/webm",
    ],
  },

  AUDIO: {
    extensions: ["mp3", "wav", "flac", "aac", "ogg"],
    mimeTypes: [
      "audio/mpeg",
      "audio/wav",
      "audio/flac",
      "audio/aac",
      "audio/ogg",
    ],
  },
};

// API Rate Limits
export const RATE_LIMITS = {
  GOOGLE_SHEETS: {
    requests_per_100_seconds: 100,
    requests_per_day: 1000000,
  },

  GOOGLE_DRIVE: {
    requests_per_100_seconds: 1000,
    requests_per_day: 1000000000,
  },
};

// Default Values
export const DEFAULT_VALUES = {
  // Pagination
  PAGE_SIZE: 10,
  MAX_PAGE_SIZE: 100,

  // File upload
  MAX_FILE_SIZE: 10 * 1024 * 1024, // 10MB
  MAX_FILES_PER_UPLOAD: 10,

  // Sheet ranges
  DEFAULT_RANGE: "A1:Z1000",
  MAX_ROWS_PER_REQUEST: 1000,

  // Timeouts
  REQUEST_TIMEOUT: 30000, // 30 seconds
  UPLOAD_TIMEOUT: 300000, // 5 minutes

  // Retry settings
  MAX_RETRIES: 3,
  RETRY_DELAY: 1000, // 1 second

  // Cache settings
  CACHE_DURATION: 5 * 60 * 1000, // 5 minutes
  MAX_CACHE_SIZE: 100, // items
};

// UI Constants
export const UI_CONSTANTS = {
  // Colors
  COLORS: {
    PRIMARY: "#1976d2",
    SECONDARY: "#424242",
    SUCCESS: "#4caf50",
    WARNING: "#ff9800",
    ERROR: "#f44336",
    INFO: "#2196f3",
  },

  // Breakpoints
  BREAKPOINTS: {
    MOBILE: 768,
    TABLET: 1024,
    DESKTOP: 1200,
  },

  // Animation durations
  ANIMATION_DURATION: {
    FAST: 150,
    NORMAL: 300,
    SLOW: 500,
  },
};

// Environment Configuration
export const ENV_CONFIG = {
  DEVELOPMENT: {
    API_BASE_URL: "http://localhost:3001/api",
    DEBUG: true,
    LOG_LEVEL: "debug",
  },

  PRODUCTION: {
    API_BASE_URL: "https://api.yourdomain.com",
    DEBUG: false,
    LOG_LEVEL: "error",
  },
};

// Localization
export const LOCALIZATION = {
  VIETNAMESE: {
    DATE_FORMAT: "DD/MM/YYYY",
    TIME_FORMAT: "HH:mm",
    DATETIME_FORMAT: "DD/MM/YYYY HH:mm",
    CURRENCY_SYMBOL: "₫",
    CURRENCY_CODE: "VND",
  },

  ENGLISH: {
    DATE_FORMAT: "MM/DD/YYYY",
    TIME_FORMAT: "h:mm A",
    DATETIME_FORMAT: "MM/DD/YYYY h:mm A",
    CURRENCY_SYMBOL: "$",
    CURRENCY_CODE: "USD",
  },
};
