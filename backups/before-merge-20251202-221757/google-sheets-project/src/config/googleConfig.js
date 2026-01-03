// Google Cloud và API configuration
const googleConfig = {
  // Service Account credentials
  client_email: process.env.REACT_APP_GOOGLE_CLIENT_EMAIL,
  private_key: process.env.REACT_APP_GOOGLE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
  project_id: process.env.REACT_APP_GOOGLE_PROJECT_ID,

  // Google Sheets và Drive IDs
  spreadsheet_id: process.env.REACT_APP_GOOGLE_SHEET_ID,
  drive_folder_id: process.env.REACT_APP_GOOGLE_DRIVE_FOLDER_ID,

  // API endpoints
  api_base_url: process.env.REACT_APP_API_BASE_URL || 'http://localhost:3003/api',

  // Alert thresholds
  alert_threshold_low: parseInt(process.env.REACT_APP_ALERT_THRESHOLD_LOW) || 10,
  alert_threshold_high: parseInt(process.env.REACT_APP_ALERT_THRESHOLD_HIGH) || 100,

  // Email configuration
  email: {
    service: process.env.REACT_APP_EMAIL_SERVICE || 'gmail',
    user: process.env.REACT_APP_EMAIL_USER,
    pass: process.env.REACT_APP_EMAIL_PASS,
    to: process.env.REACT_APP_ALERT_EMAIL_TO,
  },

  // Telegram configuration (optional)
  telegram: {
    bot_token: process.env.REACT_APP_TELEGRAM_BOT_TOKEN,
    chat_id: process.env.REACT_APP_TELEGRAM_CHAT_ID,
  },
};

// Validation function
export const validateConfig = () => {
  const required = ['client_email', 'private_key', 'project_id', 'spreadsheet_id'];

  const missing = required.filter((key) => !googleConfig[key]);

  if (missing.length > 0) {
    console.warn('Missing Google configuration:', missing);
    return false;
  }

  return true;
};

export default googleConfig;
