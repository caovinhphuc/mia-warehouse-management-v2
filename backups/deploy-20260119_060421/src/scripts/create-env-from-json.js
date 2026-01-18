/**
 * 🔧 Script tạo file .env từ service account JSON
 *
 * Script này sẽ đọc thông tin từ file JSON service account
 * và tạo file .env với thông tin thực tế
 */

const fs = require('fs');
const path = require('path');

// Colors for console output
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m',
};

const log = {
  info: (msg) => console.log(`${colors.blue}ℹ️  ${msg}${colors.reset}`),
  success: (msg) => console.log(`${colors.green}✅ ${msg}${colors.reset}`),
  warning: (msg) => console.log(`${colors.yellow}⚠️  ${msg}${colors.reset}`),
  error: (msg) => console.log(`${colors.red}❌ ${msg}${colors.reset}`),
  step: (msg) => console.log(`${colors.cyan}🔧 ${msg}${colors.reset}`),
  header: (msg) =>
    console.log(`\n${colors.bright}${colors.magenta}${msg}${colors.reset}\n`),
};

function createEnvFromJson() {
  log.header('🔧 TẠO FILE .ENV TỪ SERVICE ACCOUNT JSON');

  try {
    // Đường dẫn đến file JSON
    const jsonPath = path.join(
      __dirname,
      '..',
      'src',
      'config',
      'mia-logistics-469406-239f2de9a184.json'
    );
    const envPath = path.join(__dirname, '..', '.env');

    // Kiểm tra file JSON tồn tại
    if (!fs.existsSync(jsonPath)) {
      log.error(`Không tìm thấy file JSON: ${jsonPath}`);
      return false;
    }

    log.step('Đọc thông tin từ service account JSON...');

    // Đọc file JSON
    const jsonContent = fs.readFileSync(jsonPath, 'utf8');
    const serviceAccount = JSON.parse(jsonContent);

    log.success('Đã đọc thông tin service account thành công');
    log.info(`Project ID: ${serviceAccount.project_id}`);
    log.info(`Client Email: ${serviceAccount.client_email}`);

    // Tạo nội dung .env
    const envContent = `# Cập nhật .env.local - Tạo từ service account JSON
REACT_APP_GOOGLE_MAPS_API_KEY=your_google_maps_api_key_here
REACT_APP_GOOGLE_SHEETS_SPREADSHEET_ID=18B1PIhCDmBWyHZytvOcfj_1QbYBwczLf1x1Qbu0E5As

# Service account (cho development) - THÔNG TIN THỰC TẾ
GOOGLE_SERVICE_ACCOUNT_EMAIL=${serviceAccount.client_email}
GOOGLE_PRIVATE_KEY="${serviceAccount.private_key}"
GOOGLE_SERVICE_ACCOUNT_KEY_PATH=${jsonPath}
VITE_GOOGLE_SHEETS_SPREADSHEET_ID=18B1PIhCDmBWyHZytvOcfj_1QbYBwczLf1x1Qbu0E5As

# Telegram
TELEGRAM_BOT_TOKEN=8434038911:AAEsXilwvPkpCNxt0pAZybgXag7xJnNpmN0
TELEGRAM_WEBHOOK_URL=
TELEGRAM_CHAT_ID=-4818209867

# Email
SENDGRID_API_KEY=6TJF5SH4EEAD5RTTWF4RUUUS
SENDGRID_FROM_EMAIL=kho.1@mia.vn
SENDGRID_FROM_NAME=MIA Logistics Manager
EMAIL_FROM=kho.1@mia.vn
# Hoặc SMTP
SMTP_HOST=
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=
SMTP_PASS=

# Queue (Bull/Redis)
REDIS_URL=redis://localhost:6379

# Web Push (VAPID)
WEB_PUSH_PUBLIC_KEY=
WEB_PUSH_PRIVATE_KEY=
WEB_PUSH_VAPID_SUBJECT=mailto:admin@mia.vn

VITE_GOOGLE_APPS_SCRIPT_URL=https://script.google.com/macros/s/AKfycbxd3lMPfORirKOnPN52684-P4htWuw42VIogwBnb-oG/dev

# Thông tin bổ sung từ JSON
GOOGLE_PROJECT_ID=${serviceAccount.project_id}
GOOGLE_PRIVATE_KEY_ID=${serviceAccount.private_key_id}
GOOGLE_CLIENT_ID=${serviceAccount.client_id}
GOOGLE_AUTH_URI=${serviceAccount.auth_uri}
GOOGLE_TOKEN_URI=${serviceAccount.token_uri}
GOOGLE_AUTH_PROVIDER_X509_CERT_URL=${serviceAccount.auth_provider_x509_cert_url}
GOOGLE_CLIENT_X509_CERT_URL=${serviceAccount.client_x509_cert_url}
GOOGLE_UNIVERSE_DOMAIN=${serviceAccount.universe_domain}
`;

    log.step('Tạo file .env...');

    // Ghi file .env
    fs.writeFileSync(envPath, envContent);

    log.success(`Đã tạo file .env thành công: ${envPath}`);

    // Hiển thị thông tin quan trọng
    log.header('📋 THÔNG TIN QUAN TRỌNG');
    console.log(
      `${colors.green}✅ Service Account Email: ${serviceAccount.client_email}${colors.reset}`
    );
    console.log(
      `${colors.green}✅ Project ID: ${serviceAccount.project_id}${colors.reset}`
    );
    console.log(
      `${colors.green}✅ Sheet ID: 18B1PIhCDmBWyHZytvOcfj_1QbYBwczLf1x1Qbu0E5As${colors.reset}`
    );
    console.log(
      `${colors.green}✅ Telegram Bot: 8434038911:AAEsXilwvPkpCNxt0pAZybgXag7xJnNpmN0${colors.reset}`
    );
    console.log(
      `${colors.green}✅ SendGrid API: 6TJF5SH4EEAD5RTTWF4RUUUS${colors.reset}`
    );

    log.header('🚀 BƯỚC TIẾP THEO');
    console.log(`${colors.cyan}1. Test kết nối Google APIs:${colors.reset}`);
    console.log(`   ${colors.yellow}npm run test:google${colors.reset}`);
    console.log(
      `\n${colors.cyan}2. Health check toàn bộ hệ thống:${colors.reset}`
    );
    console.log(`   ${colors.yellow}npm run health-check${colors.reset}`);
    console.log(`\n${colors.cyan}3. Chạy ứng dụng:${colors.reset}`);
    console.log(`   ${colors.yellow}npm start${colors.reset}`);

    return true;
  } catch (error) {
    log.error(`Lỗi khi tạo file .env: ${error.message}`);
    return false;
  }
}

// Chạy script
if (require.main === module) {
  createEnvFromJson();
}

module.exports = { createEnvFromJson };
