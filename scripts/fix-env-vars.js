/**
 * 🔧 Script sửa các biến môi trường còn thiếu trong .env
 *
 * Script này sẽ:
 * 1. Đọc file .env hiện tại
 * 2. Kiểm tra các biến còn thiếu
 * 3. Nếu có file JSON service account, tự động điền
 * 4. Nếu không, hướng dẫn người dùng điền thủ công
 */

const fs = require("fs");
const path = require("path");
const readline = require("readline");

const colors = {
  reset: "\x1b[0m",
  bright: "\x1b[1m",
  red: "\x1b[31m",
  green: "\x1b[32m",
  yellow: "\x1b[33m",
  blue: "\x1b[34m",
  magenta: "\x1b[35m",
  cyan: "\x1b[36m",
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

// Các biến bắt buộc
const REQUIRED_VARS = [
  "GOOGLE_SERVICE_ACCOUNT_EMAIL",
  "GOOGLE_PRIVATE_KEY",
  "REACT_APP_GOOGLE_SHEETS_SPREADSHEET_ID",
];

function parseEnvFile(envPath) {
  const envContent = fs.existsSync(envPath)
    ? fs.readFileSync(envPath, "utf8")
    : "";
  const env = {};
  let currentKey = null;
  let currentValue = [];
  let inQuotes = false;

  envContent.split("\n").forEach((line) => {
    const trimmedLine = line.trim();

    // Bỏ qua comment và dòng trống
    if (!trimmedLine || trimmedLine.startsWith("#")) {
      if (currentKey && inQuotes) {
        // Tiếp tục giá trị multi-line trong quotes
        currentValue.push(line);
      }
      return;
    }

    // Kiểm tra nếu đang trong giá trị có quotes
    if (inQuotes) {
      currentValue.push(line);
      // Kiểm tra nếu dòng kết thúc bằng dấu ngoặc kép
      if (trimmedLine.endsWith('"') && !trimmedLine.endsWith('\\"')) {
        inQuotes = false;
        env[currentKey] = currentValue.join("\n").slice(1, -1); // Bỏ dấu ngoặc kép đầu và cuối
        currentKey = null;
        currentValue = [];
      }
      return;
    }

    // Xử lý dòng mới có dấu =
    if (trimmedLine.includes("=")) {
      const [key, ...valueParts] = trimmedLine.split("=");
      const value = valueParts.join("=").trim();
      const keyName = key.trim();

      // Kiểm tra nếu giá trị bắt đầu bằng dấu ngoặc kép
      if (value.startsWith('"')) {
        if (value.endsWith('"') && !value.endsWith('\\"')) {
          // Giá trị trên một dòng
          env[keyName] = value.slice(1, -1);
        } else {
          // Giá trị multi-line
          currentKey = keyName;
          currentValue = [line];
          inQuotes = true;
        }
      } else {
        // Giá trị không có quotes
        env[keyName] = value;
      }
    }
  });

  // Xử lý trường hợp file kết thúc mà vẫn còn giá trị chưa đóng
  if (currentKey && inQuotes) {
    env[currentKey] = currentValue.join("\n").slice(1, -1);
  }

  return env;
}

function writeEnvFile(envPath, env) {
  let content = "# Environment variables\n";
  content += "# Generated/Updated by fix-env-vars.js\n\n";

  // Sắp xếp các biến theo nhóm
  const groups = {
    google: [],
    telegram: [],
    email: [],
    other: [],
  };

  Object.keys(env).forEach((key) => {
    if (key.includes("GOOGLE")) {
      groups.google.push(key);
    } else if (key.includes("TELEGRAM")) {
      groups.telegram.push(key);
    } else if (
      key.includes("EMAIL") ||
      key.includes("SENDGRID") ||
      key.includes("SMTP")
    ) {
      groups.email.push(key);
    } else {
      groups.other.push(key);
    }
  });

  // Ghi Google config
  if (groups.google.length > 0) {
    content += "# Google Configuration\n";
    groups.google.forEach((key) => {
      const value = env[key];
      // Xử lý private key đặc biệt - lưu dạng multi-line trong quotes
      if (
        key === "GOOGLE_PRIVATE_KEY" &&
        value &&
        typeof value === "string" &&
        value.includes("BEGIN PRIVATE KEY")
      ) {
        // Private key có thể có \n thực sự hoặc \\n, cần normalize
        let normalizedKey = value;
        // Nếu có \\n, chuyển thành \n thực sự
        if (normalizedKey.includes("\\n") && !normalizedKey.includes("\n")) {
          normalizedKey = normalizedKey.replace(/\\n/g, "\n");
        }
        // Đảm bảo private key đầy đủ (có cả BEGIN và END)
        if (!normalizedKey.includes("END PRIVATE KEY")) {
          // Nếu thiếu END, có thể bị cắt - cần đọc lại từ JSON
          const jsonPath = path.join(
            __dirname,
            "..",
            "src",
            "config",
            "service_account.json"
          );
          if (fs.existsSync(jsonPath)) {
            try {
              const serviceAccount = JSON.parse(
                fs.readFileSync(jsonPath, "utf8")
              );
              if (serviceAccount.private_key) {
                normalizedKey = serviceAccount.private_key;
                log.warning(
                  "Đã sửa private key từ file JSON (bị cắt trong .env)"
                );
              }
            } catch (e) {
              // Ignore error
            }
          }
        }
        // Lưu dạng single-line trong quotes (dotenv sẽ tự xử lý)
        content += `${key}="${normalizedKey}"\n`;
      } else if (value) {
        content += `${key}=${value}\n`;
      }
    });
    content += "\n";
  }

  // Ghi các nhóm khác
  ["telegram", "email", "other"].forEach((group) => {
    if (groups[group].length > 0) {
      content += `# ${group.charAt(0).toUpperCase() + group.slice(1)} Configuration\n`;
      groups[group].forEach((key) => {
        content += `${key}=${env[key]}\n`;
      });
      content += "\n";
    }
  });

  fs.writeFileSync(envPath, content);
}

function findServiceAccountJson() {
  const searchDirs = [
    path.join(__dirname, "..", "src", "config"),
    path.join(__dirname, ".."),
    process.cwd(),
  ];

  for (const dir of searchDirs) {
    if (fs.existsSync(dir)) {
      const files = fs.readdirSync(dir);
      const jsonFiles = files.filter(
        (f) =>
          f.endsWith(".json") &&
          !f.includes("package") &&
          !f.includes("test-report") &&
          !f.includes("health-report") &&
          !f.includes("telegram-test") &&
          !f.includes("email-test") &&
          !f.includes("manifest") &&
          !f.includes("vercel")
      );

      // Kiểm tra từng file xem có phải service account JSON không
      for (const jsonFile of jsonFiles) {
        const jsonPath = path.join(dir, jsonFile);
        const serviceAccount = loadServiceAccountJson(jsonPath);
        if (serviceAccount) {
          return jsonPath;
        }
      }
    }
  }
  return null;
}

function loadServiceAccountJson(jsonPath) {
  try {
    const content = fs.readFileSync(jsonPath, "utf8");
    const json = JSON.parse(content);
    // Kiểm tra xem có phải là service account JSON không
    if (
      json.client_email &&
      json.private_key &&
      json.type === "service_account"
    ) {
      return json;
    }
    return null;
  } catch (error) {
    return null;
  }
}

async function fixEnvVars() {
  log.header("🔧 SỬA CÁC BIẾN MÔI TRƯỜNG CÒN THIẾU");

  const envPath = path.join(__dirname, "..", ".env");
  const env = parseEnvFile(envPath);

  // Kiểm tra các biến còn thiếu
  const missingVars = REQUIRED_VARS.filter((varName) => !env[varName]);

  // Kiểm tra các biến tùy chọn từ .env_backup (luôn chạy, không phụ thuộc vào missingVars)
  const backupPath = path.join(__dirname, "..", ".env_backup");
  if (fs.existsSync(backupPath)) {
    log.step("Đang kiểm tra .env_backup cho các biến tùy chọn...");
    const backupEnv = parseEnvFile(backupPath);

    // Telegram config
    if (
      !env.TELEGRAM_BOT_TOKEN &&
      backupEnv.TELEGRAM_BOT_TOKEN &&
      backupEnv.TELEGRAM_BOT_TOKEN !== "your_telegram_bot_token"
    ) {
      env.TELEGRAM_BOT_TOKEN = backupEnv.TELEGRAM_BOT_TOKEN;
      log.success("Đã điền TELEGRAM_BOT_TOKEN từ .env_backup");
    }

    if (
      !env.TELEGRAM_CHAT_ID &&
      backupEnv.TELEGRAM_CHAT_ID &&
      backupEnv.TELEGRAM_CHAT_ID !== "your_telegram_chat_id"
    ) {
      env.TELEGRAM_CHAT_ID = backupEnv.TELEGRAM_CHAT_ID;
      log.success("Đã điền TELEGRAM_CHAT_ID từ .env_backup");
    }

    // Email config (SendGrid)
    const emailVars = [
      "SENDGRID_API_KEY",
      "SENDGRID_FROM_EMAIL",
      "SENDGRID_FROM_NAME",
      "EMAIL_FROM",
    ];
    emailVars.forEach((varName) => {
      if (
        !env[varName] &&
        backupEnv[varName] &&
        !backupEnv[varName].includes("your_") &&
        backupEnv[varName] !== ""
      ) {
        env[varName] = backupEnv[varName];
        log.success(`Đã điền ${varName} từ .env_backup`);
      }
    });

    // SMTP config
    const smtpVars = ["SMTP_HOST", "SMTP_USER", "SMTP_PASS"];
    smtpVars.forEach((varName) => {
      if (!env[varName] && backupEnv[varName] && backupEnv[varName] !== "") {
        env[varName] = backupEnv[varName];
        log.success(`Đã điền ${varName} từ .env_backup`);
      }
    });

    // Google Maps API Key
    if (
      !env.REACT_APP_GOOGLE_MAPS_API_KEY &&
      backupEnv.REACT_APP_GOOGLE_MAPS_API_KEY &&
      backupEnv.REACT_APP_GOOGLE_MAPS_API_KEY !==
        "your_google_maps_api_key_here"
    ) {
      env.REACT_APP_GOOGLE_MAPS_API_KEY =
        backupEnv.REACT_APP_GOOGLE_MAPS_API_KEY;
      log.success("Đã điền REACT_APP_GOOGLE_MAPS_API_KEY từ .env_backup");
    }

    // Redis URL
    if (!env.REDIS_URL && backupEnv.REDIS_URL && backupEnv.REDIS_URL !== "") {
      env.REDIS_URL = backupEnv.REDIS_URL;
      log.success("Đã điền REDIS_URL từ .env_backup");
    }
  }

  if (missingVars.length === 0) {
    log.success("Tất cả các biến môi trường bắt buộc đã được cấu hình!");
    // Ghi lại file .env nếu có thay đổi Telegram config
    if (fs.existsSync(backupPath)) {
      log.step("Đang cập nhật file .env...");
      try {
        writeEnvFile(envPath, env);
        log.success(`Đã cập nhật file .env: ${envPath}`);
      } catch (error) {
        log.error(`Lỗi khi ghi file .env: ${error.message}`);
      }
    }
    return true;
  }

  log.warning(
    `Thiếu ${missingVars.length} biến môi trường: ${missingVars.join(", ")}`
  );

  // Tìm file JSON service account
  log.step("Đang tìm file JSON service account...");
  const jsonPath = findServiceAccountJson();

  if (jsonPath && fs.existsSync(jsonPath)) {
    log.success(`Tìm thấy file JSON: ${jsonPath}`);
    const serviceAccount = loadServiceAccountJson(jsonPath);

    if (serviceAccount) {
      log.step("Đang điền các biến từ file JSON...");

      // Điền GOOGLE_SERVICE_ACCOUNT_EMAIL
      if (missingVars.includes("GOOGLE_SERVICE_ACCOUNT_EMAIL")) {
        env.GOOGLE_SERVICE_ACCOUNT_EMAIL = serviceAccount.client_email;
        log.success(
          `Đã điền GOOGLE_SERVICE_ACCOUNT_EMAIL: ${serviceAccount.client_email}`
        );
      }

      // Điền GOOGLE_PRIVATE_KEY
      if (missingVars.includes("GOOGLE_PRIVATE_KEY")) {
        env.GOOGLE_PRIVATE_KEY = serviceAccount.private_key;
        log.success("Đã điền GOOGLE_PRIVATE_KEY từ file JSON");
      }

      // Điền các biến bổ sung nếu có
      if (serviceAccount.project_id && !env.GOOGLE_PROJECT_ID) {
        env.GOOGLE_PROJECT_ID = serviceAccount.project_id;
      }
      if (serviceAccount.private_key_id && !env.GOOGLE_PRIVATE_KEY_ID) {
        env.GOOGLE_PRIVATE_KEY_ID = serviceAccount.private_key_id;
      }
      if (serviceAccount.client_id && !env.GOOGLE_CLIENT_ID) {
        env.GOOGLE_CLIENT_ID = serviceAccount.client_id;
      }
    } else {
      log.error("Không thể đọc file JSON service account");
    }
  } else {
    log.warning("Không tìm thấy file JSON service account");
    log.info("Bạn có thể:");
    log.info("1. Đặt file JSON service account vào thư mục src/config/");
    log.info("2. Hoặc điền thủ công các biến trong file .env");
  }

  // Kiểm tra REACT_APP_GOOGLE_SHEETS_SPREADSHEET_ID
  if (missingVars.includes("REACT_APP_GOOGLE_SHEETS_SPREADSHEET_ID")) {
    // Sử dụng giá trị mặc định từ env.example
    env.REACT_APP_GOOGLE_SHEETS_SPREADSHEET_ID =
      "18B1PIhCDmBWyHZytvOcfj_1QbYBwczLf1x1Qbu0E5As";
    log.success(
      `Đã điền REACT_APP_GOOGLE_SHEETS_SPREADSHEET_ID với giá trị mặc định`
    );
    log.warning(
      "⚠️  Hãy kiểm tra lại Sheet ID này có đúng với Google Sheet của bạn không!"
    );
  }

  // Ghi lại file .env
  log.step("Đang cập nhật file .env...");
  try {
    writeEnvFile(envPath, env);
    log.success(`Đã cập nhật file .env: ${envPath}`);
  } catch (error) {
    log.error(`Lỗi khi ghi file .env: ${error.message}`);
    throw error;
  }

  // Kiểm tra lại
  const updatedEnv = parseEnvFile(envPath);
  const stillMissing = REQUIRED_VARS.filter((varName) => !updatedEnv[varName]);

  if (stillMissing.length > 0) {
    log.error(`Vẫn còn thiếu: ${stillMissing.join(", ")}`);
    log.header("📋 HƯỚNG DẪN ĐIỀN THỦ CÔNG");
    console.log(
      `${colors.cyan}Mở file .env và điền các biến sau:${colors.reset}`
    );
    console.log("");
    stillMissing.forEach((varName) => {
      console.log(`${colors.yellow}${varName}=${colors.reset}`);
      if (varName === "GOOGLE_SERVICE_ACCOUNT_EMAIL") {
        console.log(
          `  ${colors.blue}→ Lấy từ file JSON: "client_email"${colors.reset}`
        );
      } else if (varName === "GOOGLE_PRIVATE_KEY") {
        console.log(
          `  ${colors.blue}→ Lấy từ file JSON: "private_key" (giữ nguyên format)${colors.reset}`
        );
      } else if (varName === "REACT_APP_GOOGLE_SHEETS_SPREADSHEET_ID") {
        console.log(
          `  ${colors.blue}→ Lấy từ URL Google Sheet: https://docs.google.com/spreadsheets/d/SHEET_ID/edit${colors.reset}`
        );
      }
      console.log("");
    });
    return false;
  } else {
    log.success("✅ Tất cả các biến môi trường đã được cấu hình!");
    log.header("🚀 BƯỚC TIẾP THEO");
    console.log(`${colors.cyan}Test kết nối Google APIs:${colors.reset}`);
    console.log(`   ${colors.yellow}npm run test:google${colors.reset}`);
    return true;
  }
}

// Chạy script
if (require.main === module) {
  fixEnvVars()
    .then((success) => {
      process.exit(success ? 0 : 1);
    })
    .catch((error) => {
      log.error(`Lỗi: ${error.message}`);
      process.exit(1);
    });
}

module.exports = { fixEnvVars };
