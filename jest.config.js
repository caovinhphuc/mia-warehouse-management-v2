/**
 * Jest Configuration for MIA.vn Google Integration Platform
 * Tương thích với Create React App và VS Code Jest Extension
 */

module.exports = {
  // Test environment
  testEnvironment: "jsdom",

  // Setup files
  setupFilesAfterEnv: ["<rootDir>/src/setupTests.js"],

  // Module paths
  roots: ["<rootDir>/src"],

  // Test file patterns
  testMatch: ["**/__tests__/**/*.{js,jsx}", "**/*.{test,spec}.{js,jsx}"],

  // Module name mapper (tương thích với craco.config.js)
  moduleNameMapper: {
    "^@/(.*)$": "<rootDir>/src/$1",
    "^@components/(.*)$": "<rootDir>/src/components/$1",
    "^@services/(.*)$": "<rootDir>/src/services/$1",
    "^@utils/(.*)$": "<rootDir>/src/utils/$1",
    "^@config/(.*)$": "<rootDir>/src/config/$1",
    "^@hooks/(.*)$": "<rootDir>/src/hooks/$1",
    "^@store/(.*)$": "<rootDir>/src/store/$1",
    "^@constants/(.*)$": "<rootDir>/src/constants/$1",
    "^@assets/(.*)$": "<rootDir>/src/assets/$1",
    "^@pages/(.*)$": "<rootDir>/src/pages/$1",
    // Handle CSS imports
    "\\.(css|less|scss|sass)$": "identity-obj-proxy",
    // Handle static assets
    "\\.(jpg|jpeg|png|gif|eot|otf|webp|svg|ttf|woff|woff2|mp4|webm|wav|mp3|m4a|aac|oga)$":
      "jest-transform-stub",
  },

  // Transform ignore patterns
  transformIgnorePatterns: [
    "node_modules/(?!(react-dnd|dnd-core|@react-dnd|@ant-design|antd)/)",
  ],

  // Coverage configuration
  collectCoverageFrom: [
    "src/**/*.{js,jsx}",
    "!src/**/*.test.{js,jsx}",
    "!src/**/__tests__/**",
    "!src/index.js",
    "!src/setupTests.js",
    "!src/reportWebVitals.js",
  ],

  // Coverage directory
  coverageDirectory: "coverage",

  // Coverage reporters
  coverageReporters: ["text", "text-summary", "lcov", "html", "json-summary"],

  // Coverage thresholds (optional)
  coverageThresholds: {
    global: {
      branches: 50,
      functions: 50,
      lines: 50,
      statements: 50,
    },
  },

  // Module file extensions
  moduleFileExtensions: ["js", "jsx", "json"],

  // Clear mocks between tests
  clearMocks: true,

  // Restore mocks after each test
  restoreMocks: true,

  // Verbose output
  verbose: true,
};
