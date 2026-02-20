// Google Sheets Project Environment Configuration
module.exports = {
  // Frontend Configuration
  REACT_APP_API_URL: "http://localhost:3002",
  REACT_APP_WEBSOCKET_URL: "ws://localhost:3002",

  // Google Sheets Configuration
  REACT_APP_GOOGLE_SHEET_ID: "1bSaOMrAHcePQdL7kWMFDMDfblpm4X3TzK1fXfaZqc30",
  REACT_APP_GOOGLE_CLIENT_EMAIL:
    "react-integration-service@react-integration-469009.iam.gserviceaccount.com",
  REACT_APP_GOOGLE_PROJECT_ID: "react-integration-469009",

  // Port Configuration (Different from main project)
  PORT: 3002,
  BACKEND_PORT: 3003,

  // Service Configuration
  GOOGLE_SHEETS_ENABLED: true,
};
