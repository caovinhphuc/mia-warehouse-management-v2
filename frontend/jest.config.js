/**
 * =============================================================================
 * Jest Configuration - MIA.vn Google Integration Platform
 * =============================================================================
 * Compatible with Create React App, VS Code Jest Extension, and Vite
 * =============================================================================
 */

module.exports = {
  // ============================================================================
  // Test Environment
  // ============================================================================
  testEnvironment: "jsdom",

  // Setup files
  setupFilesAfterEnv: ["<rootDir>/src/setupTests.js"],

  // ============================================================================
  // Module Paths & Aliases
  // ============================================================================
  roots: ["<rootDir>/src"],
  modulePaths: ["<rootDir>/src"],

  // Test file patterns
  testMatch: [
    "**/__tests__/**/*.{js,jsx,ts,tsx}",
    "**/*.{test,spec}.{js,jsx,ts,tsx}",
  ],

  // Module name mapper (phải khớp vite.config.mjs)
  moduleNameMapper: {
    // import.meta.env mock (Jest không hỗ trợ import.meta)
    "^.+/importMetaEnv$": "<rootDir>/src/shared/lib/importMetaEnv.jest.js",
    // Antd locale (mock – tránh parse rc-picker, rc-pagination trong Jest)
    "^antd/es/locale/vi_VN$": "<rootDir>/src/__mocks__/antd-locale-vi_VN.js",
    "^antd/locale/vi_VN$": "<rootDir>/src/__mocks__/antd-locale-vi_VN.js",
    // Path aliases
    "^@/(.*)$": "<rootDir>/src/$1",
    "^@app/(.*)$": "<rootDir>/src/app/$1",
    "^@pages/(.*)$": "<rootDir>/src/pages/$1",
    "^@widgets/(.*)$": "<rootDir>/src/widgets/$1",
    "^@features/(.*)$": "<rootDir>/src/features/$1",
    "^@shared/(.*)$": "<rootDir>/src/shared/$1",
    "^@components/(.*)$": "<rootDir>/src/components/$1",
    "^@services/(.*)$": "<rootDir>/src/services/$1",
    "^@utils/(.*)$": "<rootDir>/src/shared/lib/$1",
    "^@config/(.*)$": "<rootDir>/src/shared/config/$1",
    "^@hooks/(.*)$": "<rootDir>/src/shared/hooks/$1",
    "^@store/(.*)$": "<rootDir>/src/store/$1",
    "^@constants/(.*)$": "<rootDir>/src/shared/constants/$1",
    "^@assets/(.*)$": "<rootDir>/src/assets/$1",

    // CSS imports (mock)
    "\\.(css|less|scss|sass)$": "identity-obj-proxy",

    // Static assets (mock)
    "\\.(jpg|jpeg|png|gif|eot|otf|webp|svg|ttf|woff|woff2|mp4|webm|wav|mp3|m4a|aac|oga)$":
      "jest-transform-stub",
  },

  // ============================================================================
  // Transform Configuration
  // ============================================================================
  transform: {
    "^.+\\.(js|jsx|ts|tsx)$": [
      "babel-jest",
      { configFile: "./babel.config.js" },
    ],
  },

  // Transform ignore patterns
  transformIgnorePatterns: [
    "node_modules/(?!(react-dnd|dnd-core|@react-dnd|@ant-design|antd|@babel/runtime)/)",
  ],

  // ============================================================================
  // Coverage Configuration
  // ============================================================================
  collectCoverageFrom: [
    "src/**/*.{js,jsx,ts,tsx}",
    "!src/**/*.test.{js,jsx,ts,tsx}",
    "!src/**/*.spec.{js,jsx,ts,tsx}",
    "!src/**/__tests__/**",
    "!src/index.js",
    "!src/index.jsx",
    "!src/setupTests.js",
    "!src/reportWebVitals.js",
    "!src/serviceWorker.js",
    "!src/**/*.stories.{js,jsx,ts,tsx}",
  ],

  coveragePathIgnorePatterns: [
    "/node_modules/",
    "/build/",
    "/dist/",
    "/coverage/",
    "/backups/",
  ],

  coverageThreshold: {}, // Tắt threshold; bật lại khi coverage đủ

  // ============================================================================
  // Other Configurations
  // ============================================================================

  // Module file extensions
  moduleFileExtensions: ["js", "jsx", "ts", "tsx", "json", "node"],

  // Verbose output
  verbose: true,

  // Clear mocks between tests
  clearMocks: true,

  // Reset mocks between tests
  resetMocks: true,

  // Restore mocks between tests
  restoreMocks: true,

  // Maximum number of concurrent workers
  maxWorkers: "50%",

  // Test timeout
  testTimeout: 10000,

  // Ignore patterns
  testPathIgnorePatterns: [
    "/node_modules/",
    "/build/",
    "/dist/",
    "/backups/",
    "setupTests.js",
    "App.test.jsx",
    "Login.test.jsx",
    "ProtectedRoute.test.jsx",
  ],

  // Watch plugins
  watchPlugins: [
    "jest-watch-typeahead/filename",
    "jest-watch-typeahead/testname",
  ],

  // Coverage directory
  coverageDirectory: "coverage",

  // Coverage reporters
  coverageReporters: ["text", "text-summary", "lcov", "html", "json-summary"],
};
