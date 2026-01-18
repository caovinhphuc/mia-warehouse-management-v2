#!/usr/bin/env node

/**
 * 🚀 React Google Integration - Automated Setup Script
 *
 * Script tự động hóa quá trình setup dự án React Google Integration
 * Bao gồm: cài đặt dependencies, cấu hình environment, test kết nối
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');
const readline = require('readline');

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

// Console logging functions
const log = {
  info: (msg) => console.log(`${colors.blue}ℹ️  ${msg}${colors.reset}`),
  success: (msg) => console.log(`${colors.green}✅ ${msg}${colors.reset}`),
  warning: (msg) => console.log(`${colors.yellow}⚠️  ${msg}${colors.reset}`),
  error: (msg) => console.log(`${colors.red}❌ ${msg}${colors.reset}`),
  step: (msg) => console.log(`${colors.cyan}🚀 ${msg}${colors.reset}`),
  header: (msg) =>
    console.log(`\n${colors.bright}${colors.magenta}${msg}${colors.reset}\n`),
};

// Create readline interface for user input
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

// Utility functions
const execCommand = (command, options = {}) => {
  try {
    const result = execSync(command, {
      stdio: 'pipe',
      encoding: 'utf8',
      ...options,
    });
    return { success: true, output: result };
  } catch (error) {
    return { success: false, error: error.message };
  }
};

const askQuestion = (question) => {
  return new Promise((resolve) => {
    rl.question(question, (answer) => {
      resolve(answer.trim());
    });
  });
};

const fileExists = (filePath) => {
  return fs.existsSync(path.resolve(filePath));
};

const createEnvFile = async () => {
  log.step('Tạo file .env từ template...');

  if (fileExists('.env')) {
    const overwrite = await askQuestion(
      'File .env đã tồn tại. Bạn có muốn ghi đè? (y/N): '
    );
    if (overwrite.toLowerCase() !== 'y') {
      log.info('Bỏ qua tạo file .env');
      return;
    }
  }

  const envTemplate = `# Cập nhật .env.local
REACT_APP_GOOGLE_MAPS_API_KEY=your_google_maps_api_key_here
REACT_APP_GOOGLE_SHEETS_SPREADSHEET_ID=18B1PIhCDmBWyHZytvOcfj_1QbYBwczLf1x1Qbu0E5As

# Service account (cho development)
GOOGLE_SERVICE_ACCOUNT_EMAIL=mia-logistics-service@mia-logistics-469406.iam.gserviceaccount.com
GOOGLE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\\nYour private key here\\n-----END PRIVATE KEY-----"
GOOGLE_SERVICE_ACCOUNT_KEY_PATH=/path/to/service-account-key.json
VITE_GOOGLE_SHEETS_SPREADSHEET_ID=18B1PIhCDmBWyHZytvOcfj_1QbYBwczLf1x1Qbu0E5As

# Telegram
TELEGRAM_BOT_TOKEN=your_telegram_bot_token
TELEGRAM_WEBHOOK_URL=
TELEGRAM_CHAT_ID=your_telegram_chat_id

# Email
SENDGRID_API_KEY=your_sendgrid_api_key
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

VITE_GOOGLE_APPS_SCRIPT_URL=https://script.google.com/macros/s/your_script_id/dev
`;

  try {
    fs.writeFileSync('.env', envTemplate);
    log.success('Đã tạo file .env thành công');
  } catch (error) {
    log.error(`Lỗi khi tạo file .env: ${error.message}`);
  }
};

const installDependencies = async () => {
  log.step('Cài đặt dependencies...');

  // Check if package.json exists
  if (!fileExists('package.json')) {
    log.error(
      'Không tìm thấy package.json. Vui lòng chạy script trong thư mục gốc của dự án.'
    );
    return false;
  }

  // Install frontend dependencies
  log.info('Cài đặt frontend dependencies...');
  const frontendResult = execCommand('npm install');
  if (!frontendResult.success) {
    log.error(`Lỗi cài đặt frontend dependencies: ${frontendResult.error}`);
    return false;
  }
  log.success('Frontend dependencies đã được cài đặt');

  // Install backend dependencies
  log.info('Cài đặt backend dependencies...');
  const backendResult = execCommand(
    'npm install express nodemailer node-cron cors dotenv'
  );
  if (!backendResult.success) {
    log.error(`Lỗi cài đặt backend dependencies: ${backendResult.error}`);
    return false;
  }
  log.success('Backend dependencies đã được cài đặt');

  return true;
};

const validateEnvironment = () => {
  log.step('Kiểm tra cấu hình environment...');

  if (!fileExists('.env')) {
    log.error('File .env không tồn tại. Vui lòng tạo file .env trước.');
    return false;
  }

  // Read .env file
  const envContent = fs.readFileSync('.env', 'utf8');

  // Check for required variables
  const requiredVars = [
    'GOOGLE_SERVICE_ACCOUNT_EMAIL',
    'GOOGLE_PRIVATE_KEY',
    'REACT_APP_GOOGLE_SHEETS_SPREADSHEET_ID',
  ];

  const missingVars = requiredVars.filter((varName) => {
    const regex = new RegExp(`^${varName}=`, 'm');
    return (
      !regex.test(envContent) || envContent.match(regex)[0].includes('your-')
    );
  });

  if (missingVars.length > 0) {
    log.warning(
      `Các biến môi trường sau chưa được cấu hình: ${missingVars.join(', ')}`
    );
    log.info('Vui lòng cập nhật file .env với thông tin thực tế của bạn.');
    return false;
  }

  log.success('Environment configuration hợp lệ');
  return true;
};

const testGoogleConnection = async () => {
  log.step('Test kết nối Google APIs...');

  if (!fileExists('scripts/testGoogleConnection.js')) {
    log.warning('Script test Google connection không tồn tại');
    return false;
  }

  const testResult = execCommand('node scripts/testGoogleConnection.js');
  if (testResult.success) {
    log.success('Kết nối Google APIs thành công');
    return true;
  } else {
    log.error(`Test kết nối Google APIs thất bại: ${testResult.error}`);
    return false;
  }
};

const createProjectStructure = () => {
  log.step('Tạo cấu trúc thư mục dự án...');

  const directories = [
    'src/components/Common',
    'src/components/GoogleSheet',
    'src/components/GoogleDrive',
    'src/components/Dashboard',
    'src/components/Alerts',
    'src/services',
    'src/hooks',
    'src/config',
    'src/utils',
    'src/constants',
    'scripts',
  ];

  directories.forEach((dir) => {
    const dirPath = path.resolve(dir);
    if (!fs.existsSync(dirPath)) {
      fs.mkdirSync(dirPath, { recursive: true });
      log.info(`Đã tạo thư mục: ${dir}`);
    }
  });

  log.success('Cấu trúc thư mục đã được tạo');
};

const showNextSteps = () => {
  log.header('🎉 SETUP HOÀN THÀNH!');

  console.log(`
${colors.green}Dự án React Google Integration đã được setup thành công!${colors.reset}

${colors.cyan}📋 Các bước tiếp theo:${colors.reset}

1. ${colors.yellow}Cấu hình Google Service Account:${colors.reset}
   - Đọc hướng dẫn: doc/user-guide/01-Google-Service-Account-Setup.md
   - Cập nhật file .env với thông tin thực tế

2. ${colors.yellow}Cấu hình Google Sheets & Drive:${colors.reset}
   - Tạo Google Sheet và lấy Sheet ID
   - Tạo Google Drive folder và lấy Folder ID
   - Share với Service Account email

3. ${colors.yellow}Cấu hình Email (nếu cần):${colors.reset}
   - Tạo App Password cho Gmail
   - Cập nhật EMAIL_USER và EMAIL_PASS trong .env

4. ${colors.yellow}Chạy ứng dụng:${colors.reset}
   ${colors.blue}npm start${colors.reset}          # Frontend (port 3000)
   ${colors.blue}node server.js${colors.reset}     # Backend (port 3001)

5. ${colors.yellow}Test ứng dụng:${colors.reset}
   - Truy cập http://localhost:3000
   - Sử dụng Test Dashboard để kiểm tra các tính năng

${colors.cyan}📚 Tài liệu hữu ích:${colors.reset}
- Quick Setup: doc/QUICK_SETUP.md
- System Architecture: doc/architecture/SYSTEM_ARCHITECTURE.md
- Deployment Guide: doc/deployment/DEPLOYMENT_GUIDE.md

${colors.green}Chúc bạn phát triển ứng dụng thành công! 🚀${colors.reset}
  `);
};

const main = async () => {
  log.header('🚀 REACT GOOGLE INTEGRATION - AUTOMATED SETUP');

  try {
    // Step 1: Create project structure
    createProjectStructure();

    // Step 2: Install dependencies
    const depsInstalled = await installDependencies();
    if (!depsInstalled) {
      log.error('Setup thất bại ở bước cài đặt dependencies');
      process.exit(1);
    }

    // Step 3: Create .env file
    await createEnvFile();

    // Step 4: Validate environment (optional)
    const envValid = validateEnvironment();
    if (!envValid) {
      log.warning(
        'Environment chưa được cấu hình đầy đủ. Vui lòng cập nhật file .env'
      );
    }

    // Step 5: Test Google connection (if env is valid)
    if (envValid) {
      await testGoogleConnection();
    }

    // Step 6: Show next steps
    showNextSteps();
  } catch (error) {
    log.error(`Setup thất bại: ${error.message}`);
    process.exit(1);
  } finally {
    rl.close();
  }
};

// Handle process termination
process.on('SIGINT', () => {
  log.warning('\nSetup bị hủy bởi người dùng');
  rl.close();
  process.exit(0);
});

// Run main function
if (require.main === module) {
  main();
}

module.exports = {
  createEnvFile,
  installDependencies,
  validateEnvironment,
  testGoogleConnection,
  createProjectStructure,
};
