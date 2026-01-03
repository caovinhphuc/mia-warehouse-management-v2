#!/usr/bin/env node

/**
 * 🔄 Merge .env files - Merge thông tin từ .env copy vào .env
 */

const fs = require("fs");
const path = require("path");

const colors = {
  reset: "\x1b[0m",
  green: "\x1b[32m",
  yellow: "\x1b[33m",
  red: "\x1b[31m",
  blue: "\x1b[34m",
  cyan: "\x1b[36m",
};

const log = {
  info: (msg) => console.log(`${colors.blue}ℹ️  ${msg}${colors.reset}`),
  success: (msg) => console.log(`${colors.green}✅ ${msg}${colors.reset}`),
  warning: (msg) => console.log(`${colors.yellow}⚠️  ${msg}${colors.reset}`),
  error: (msg) => console.log(`${colors.red}❌ ${msg}${colors.reset}`),
  step: (msg) => console.log(`${colors.cyan}🚀 ${msg}${colors.reset}`),
};

// Parse env file
function parseEnvFile(filePath) {
  if (!fs.existsSync(filePath)) {
    return {};
  }
  const content = fs.readFileSync(filePath, "utf-8");
  const env = {};
  content.split("\n").forEach((line) => {
    const trimmed = line.trim();
    if (trimmed && !trimmed.startsWith("#")) {
      const [key, ...valueParts] = trimmed.split("=");
      if (key && valueParts.length > 0) {
        env[key.trim()] = valueParts.join("=").trim();
      }
    }
  });
  return env;
}

// Merge env files
function mergeEnvFiles() {
  log.step("Đang merge .env files...");

  const currentEnv = parseEnvFile(".env");
  const copyEnv = parseEnvFile(".env copy");

  if (Object.keys(copyEnv).length === 0) {
    log.error("File '.env copy' không tồn tại hoặc rỗng");
    return false;
  }

  // Merge: ưu tiên copyEnv, nhưng giữ lại các giá trị quan trọng từ currentEnv
  const merged = { ...currentEnv, ...copyEnv };

  // Đảm bảo các biến API URLs được giữ lại
  if (currentEnv.REACT_APP_API_URL && !copyEnv.REACT_APP_API_URL) {
    merged.REACT_APP_API_URL = currentEnv.REACT_APP_API_URL;
  }
  if (currentEnv.REACT_APP_API_BASE_URL && !copyEnv.REACT_APP_API_BASE_URL) {
    merged.REACT_APP_API_BASE_URL = currentEnv.REACT_APP_API_BASE_URL;
  }
  if (
    currentEnv.REACT_APP_AI_SERVICE_URL &&
    !copyEnv.REACT_APP_AI_SERVICE_URL
  ) {
    merged.REACT_APP_AI_SERVICE_URL = currentEnv.REACT_APP_AI_SERVICE_URL;
  }

  // Tạo backup
  if (fs.existsSync(".env")) {
    fs.copyFileSync(".env", ".env.backup-" + Date.now());
    log.info("Đã tạo backup file .env");
  }

  // Write merged content
  const lines = [];
  lines.push("# ============================================");
  lines.push("# MIA.VN GOOGLE INTEGRATION - ENVIRONMENT VARIABLES");
  lines.push("# ============================================");
  lines.push("# Merged from .env copy on " + new Date().toISOString());
  lines.push("");

  // Group by category
  const categories = {
    "SERVER CONFIGURATION": ["NODE_ENV", "PORT", "FLASK_ENV", "FLASK_DEBUG"],
    "API CONFIGURATION": [
      "REACT_APP_API_URL",
      "REACT_APP_API_BASE_URL",
      "REACT_APP_AI_SERVICE_URL",
      "API_BASE_URL",
      "VITE_API_BASE_URL",
    ],
    "GOOGLE SERVICE ACCOUNT": [
      "GOOGLE_SERVICE_ACCOUNT_EMAIL",
      "GOOGLE_SERVICE_ACCOUNT_KEY_PATH",
      "GOOGLE_PROJECT_ID",
      "GOOGLE_PRIVATE_KEY_ID",
      "GOOGLE_PRIVATE_KEY",
      "GOOGLE_CLIENT_ID",
      "REACT_APP_GOOGLE_CLIENT_EMAIL",
      "REACT_APP_GOOGLE_PRIVATE_KEY",
      "REACT_APP_GOOGLE_PROJECT_ID",
    ],
    "GOOGLE SHEETS": [
      "REACT_APP_GOOGLE_SHEETS_SPREADSHEET_ID",
      "REACT_APP_GOOGLE_SHEET_ID",
      "VITE_GOOGLE_SHEETS_SPREADSHEET_ID",
    ],
    "GOOGLE DRIVE": [
      "GOOGLE_DRIVE_FOLDER_ID",
      "REACT_APP_GOOGLE_DRIVE_FOLDER_ID",
      "VITE_GOOGLE_DRIVE_FOLDER_ID",
    ],
    TELEGRAM: [
      "TELEGRAM_BOT_TOKEN",
      "TELEGRAM_WEBHOOK_URL",
      "TELEGRAM_CHAT_ID",
      "REACT_APP_TELEGRAM_CHAT_ID",
    ],
    "EMAIL - SENDGRID": [
      "SENDGRID_API_KEY",
      "SENDGRID_FROM_EMAIL",
      "SENDGRID_FROM_NAME",
      "EMAIL_FROM",
    ],
    "EMAIL - SMTP": [
      "SMTP_HOST",
      "SMTP_PORT",
      "SMTP_SECURE",
      "SMTP_USER",
      "SMTP_PASS",
    ],
  };

  Object.keys(categories).forEach((category) => {
    lines.push(`# ===========================================`);
    lines.push(`# ${category}`);
    lines.push(`# ===========================================`);
    categories[category].forEach((key) => {
      if (merged[key]) {
        lines.push(`${key}=${merged[key]}`);
      }
    });
    lines.push("");
  });

  // Add other keys
  const allKeys = new Set(Object.keys(merged));
  Object.values(categories).forEach((keys) => {
    keys.forEach((key) => allKeys.delete(key));
  });

  if (allKeys.size > 0) {
    lines.push(`# ===========================================`);
    lines.push(`# OTHER CONFIGURATION`);
    lines.push(`# ===========================================`);
    allKeys.forEach((key) => {
      lines.push(`${key}=${merged[key]}`);
    });
  }

  fs.writeFileSync(".env", lines.join("\n"));
  log.success("Đã merge thành công!");

  // Summary
  const stats = {
    total: Object.keys(merged).length,
    fromCopy: Object.keys(copyEnv).length,
    fromCurrent: Object.keys(currentEnv).length,
  };

  console.log(`
${colors.cyan}📊 Thống kê:${colors.reset}
  • Tổng số biến: ${stats.total}
  • Từ .env copy: ${stats.fromCopy}
  • Từ .env hiện tại: ${stats.fromCurrent}
  `);

  return true;
}

// Run
if (require.main === module) {
  mergeEnvFiles();
}

module.exports = { mergeEnvFiles };
