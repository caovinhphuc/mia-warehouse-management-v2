/**
 * =============================================================================
 * Google Configuration - MIA Warehouse Management
 * =============================================================================
 * Configuration for Google APIs (Sheets, Drive, Maps, etc.)
 * =============================================================================
 */

// Load environment variables
const GOOGLE_MAPS_API_KEY =
  process.env.REACT_APP_GOOGLE_MAPS_API_KEY ||
  process.env.VITE_GOOGLE_MAPS_API_KEY ||
  "";

const GOOGLE_SPREADSHEET_ID =
  process.env.REACT_APP_GOOGLE_SHEETS_SPREADSHEET_ID ||
  process.env.VITE_GOOGLE_SHEETS_SPREADSHEET_ID ||
  process.env.REACT_APP_GOOGLE_SPREADSHEET_ID ||
  "18B1PIhCDmBWyHZytvOcfj_1QbYBwczLf1x1Qbu0E5As";

const GOOGLE_APPS_SCRIPT_URL =
  process.env.REACT_APP_GOOGLE_APPS_SCRIPT_URL ||
  process.env.VITE_GOOGLE_APPS_SCRIPT_URL ||
  "";

/**
 * Google Configuration Object
 */
const googleConfig = {
  // Google Maps
  maps: {
    apiKey: GOOGLE_MAPS_API_KEY,
    defaultCenter: {
      lat: 10.7769, // Ho Chi Minh City
      lng: 106.7009,
    },
    defaultZoom: 12,
  },

  // Google Sheets
  sheets: {
    spreadsheetId: GOOGLE_SPREADSHEET_ID,
    apiEndpoint: "https://sheets.googleapis.com/v4/spreadsheets",

    // Sheet names
    sheetNames: {
      users: "Users",
      roles: "Roles",
      rolePermissions: "RolePermissions",
      employees: "Employees",
      locations: "Locations",
      transfers: "Transfers",
      inventory: "Inventory",
      products: "Products",
    },

    // Data ranges
    ranges: {
      users: "Users!A:Z",
      roles: "Roles!A:Z",
      rolePermissions: "RolePermissions!A:Z",
      employees: "Employees!A:Z",
      locations: "Locations!A:Z",
      transfers: "Transfers!A:Z",
    },
  },

  // Google Drive
  drive: {
    apiEndpoint: "https://www.googleapis.com/drive/v3",
    folderId: process.env.REACT_APP_GOOGLE_DRIVE_FOLDER_ID || "",
  },

  // Google Apps Script
  appsScript: {
    url: GOOGLE_APPS_SCRIPT_URL,
    deploymentId: process.env.REACT_APP_APPS_SCRIPT_DEPLOYMENT_ID || "",
  },

  // OAuth Configuration (Frontend)
  oauth: {
    clientId: process.env.REACT_APP_GOOGLE_CLIENT_ID || "",
    scopes: [
      "https://www.googleapis.com/auth/spreadsheets",
      "https://www.googleapis.com/auth/drive.file",
      "https://www.googleapis.com/auth/drive.readonly",
    ],
    discoveryDocs: [
      "https://sheets.googleapis.com/$discovery/rest?version=v4",
      "https://www.googleapis.com/discovery/v1/apis/drive/v3/rest",
    ],
  },
};

/**
 * Validate configuration
 */
export const validateConfig = () => {
  const errors = [];
  const warnings = [];

  // Check required fields
  if (!googleConfig.sheets.spreadsheetId) {
    errors.push("Google Spreadsheet ID is required");
  }

  // Check optional but recommended fields
  if (!googleConfig.maps.apiKey) {
    warnings.push("Google Maps API key not configured");
  }

  if (!googleConfig.appsScript.url) {
    warnings.push("Google Apps Script URL not configured");
  }

  if (!googleConfig.oauth.clientId) {
    warnings.push("Google OAuth Client ID not configured");
  }

  return {
    isValid: errors.length === 0,
    errors,
    warnings,
    config: googleConfig,
  };
};

/**
 * Get configuration value by path
 * Example: getConfig('sheets.spreadsheetId')
 */
export const getConfig = (path) => {
  return path.split(".").reduce((obj, key) => obj?.[key], googleConfig);
};

/**
 * Check if configuration is complete
 */
export const isConfigured = () => {
  const { isValid, warnings } = validateConfig();
  return isValid && warnings.length === 0;
};

/**
 * Log configuration status (for debugging)
 */
export const logConfigStatus = () => {
  const { isValid, errors, warnings } = validateConfig();

  console.group("🔧 Google Configuration Status");
  console.log("Valid:", isValid ? "✅" : "❌");

  if (errors.length > 0) {
    console.group("❌ Errors:");
    errors.forEach((error) => console.error(error));
    console.groupEnd();
  }

  if (warnings.length > 0) {
    console.group("⚠️ Warnings:");
    warnings.forEach((warning) => console.warn(warning));
    console.groupEnd();
  }

  console.log(
    "Spreadsheet ID:",
    googleConfig.sheets.spreadsheetId || "❌ Not set"
  );
  console.log(
    "Maps API Key:",
    googleConfig.maps.apiKey ? "✅ Set" : "❌ Not set"
  );
  console.log(
    "Apps Script URL:",
    googleConfig.appsScript.url ? "✅ Set" : "❌ Not set"
  );
  console.log(
    "OAuth Client ID:",
    googleConfig.oauth.clientId ? "✅ Set" : "❌ Not set"
  );

  console.groupEnd();
};

export default googleConfig;
