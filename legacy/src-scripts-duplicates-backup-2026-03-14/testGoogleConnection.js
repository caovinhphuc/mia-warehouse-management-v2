const { GoogleAuth } = require("google-auth-library");
const fs = require("fs");
const path = require("path");
require("dotenv").config();

// Tự động tìm file JSON service account
function findServiceAccountJson() {
  const possiblePaths = [
    process.env.GOOGLE_SERVICE_ACCOUNT_KEY_PATH,
    path.join(process.cwd(), "src", "config", "service_account.json"),
    path.join(
      process.cwd(),
      "automation",
      "config",
      "service-account-key.json"
    ),
    path.join(process.cwd(), "automation", "config", "google-credentials.json"),
    path.join(
      process.cwd(),
      "automation",
      "one_automation_system",
      "config",
      "service-account-key.json"
    ),
    path.join(process.cwd(), "service-account-key.json"),
    path.join(process.cwd(), "google-credentials.json"),
  ];

  for (const jsonPath of possiblePaths) {
    if (jsonPath && fs.existsSync(jsonPath)) {
      try {
        const content = fs.readFileSync(jsonPath, "utf8");
        const parsed = JSON.parse(content);
        if (parsed.type === "service_account" && parsed.client_email) {
          return jsonPath;
        }
      } catch (e) {
        // Invalid JSON, skip
      }
    }
  }
  return null;
}

async function testGoogleConnection() {
  try {
    console.log("Testing Google Service Account connection...");

    // Tìm file JSON service account
    let jsonPath = process.env.GOOGLE_SERVICE_ACCOUNT_KEY_PATH;
    let usingJsonFile = false;

    // Kiểm tra path từ env
    if (
      jsonPath &&
      jsonPath !== "/path/to/service-account-key.json" &&
      fs.existsSync(jsonPath)
    ) {
      usingJsonFile = true;
    } else if (
      jsonPath &&
      (jsonPath === "/path/to/service-account-key.json" ||
        !fs.existsSync(jsonPath))
    ) {
      // Path không hợp lệ, thử tự động tìm
      console.log(
        "⚠️  Path trong .env không hợp lệ, đang tìm file JSON service account..."
      );
      const foundPath = findServiceAccountJson();
      if (foundPath) {
        jsonPath = foundPath;
        usingJsonFile = true;
        console.log(`✅ Đã tìm thấy file JSON: ${jsonPath}`);
      } else {
        console.log(
          "⚠️  Không tìm thấy file JSON, sẽ dùng environment variables"
        );
        usingJsonFile = false;
      }
    } else {
      // Không có path trong env, thử tự động tìm
      const foundPath = findServiceAccountJson();
      if (foundPath) {
        jsonPath = foundPath;
        usingJsonFile = true;
        console.log(`✅ Đã tìm thấy file JSON: ${jsonPath}`);
      }
    }

    const requiredVars = [
      "GOOGLE_SERVICE_ACCOUNT_EMAIL",
      "REACT_APP_GOOGLE_SHEETS_SPREADSHEET_ID",
    ];

    // If not using JSON file, require private key
    if (!usingJsonFile) {
      requiredVars.push("GOOGLE_PRIVATE_KEY");
    }

    const missingVars = requiredVars.filter((varName) => !process.env[varName]);
    if (missingVars.length > 0) {
      throw new Error(
        `Missing environment variables: ${missingVars.join(", ")}`
      );
    }

    let credentials;

    // Option 1: Use JSON file (preferred)
    if (usingJsonFile) {
      if (!fs.existsSync(jsonPath)) {
        throw new Error(`Service Account JSON file not found: ${jsonPath}`);
      }
      console.log(`✅ Using Service Account JSON file: ${jsonPath}`);
      const serviceAccountContent = fs.readFileSync(jsonPath, "utf8");
      credentials = JSON.parse(serviceAccountContent);
      console.log(`✅ Loaded credentials from: ${credentials.client_email}`);
    } else {
      // Option 2: Use environment variables
      console.log("⚠️ Using environment variables for credentials");

      // Validate and process private key
      let privateKey = process.env.GOOGLE_PRIVATE_KEY;
      if (!privateKey) {
        throw new Error("GOOGLE_PRIVATE_KEY is not set");
      }

      // Remove quotes if present
      privateKey = privateKey.replace(/^["']|["']$/g, "");

      // Replace escaped newlines with actual newlines
      privateKey = privateKey.replace(/\\n/g, "\n");

      // Validate private key format
      if (!privateKey.includes("-----BEGIN PRIVATE KEY-----")) {
        throw new Error(
          "Invalid private key format. Must start with '-----BEGIN PRIVATE KEY-----'"
        );
      }

      if (!privateKey.includes("-----END PRIVATE KEY-----")) {
        throw new Error(
          "Invalid private key format. Must end with '-----END PRIVATE KEY-----'"
        );
      }

      // Create credentials object
      credentials = {
        type: "service_account",
        project_id: process.env.GOOGLE_PROJECT_ID,
        private_key_id: process.env.GOOGLE_PRIVATE_KEY_ID,
        private_key: privateKey,
        client_email: process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL,
        client_id: process.env.GOOGLE_CLIENT_ID,
        auth_uri:
          process.env.GOOGLE_AUTH_URI ||
          "https://accounts.google.com/o/oauth2/auth",
        token_uri:
          process.env.GOOGLE_TOKEN_URI || "https://oauth2.googleapis.com/token",
        auth_provider_x509_cert_url:
          process.env.GOOGLE_AUTH_PROVIDER_X509_CERT_URL ||
          "https://www.googleapis.com/oauth2/v1/certs",
        client_x509_cert_url: `https://www.googleapis.com/robot/v1/metadata/x509/${encodeURIComponent(
          process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL
        )}`,
      };
    }

    // Create Google Auth client
    const auth = new GoogleAuth({
      credentials: credentials,
      scopes: [
        "https://www.googleapis.com/auth/spreadsheets",
        "https://www.googleapis.com/auth/drive.file",
        "https://www.googleapis.com/auth/drive",
      ],
    });

    // Test authentication
    const authClient = await auth.getClient();
    const accessToken = await authClient.getAccessToken();

    console.log("\n✅ Google Service Account connection successful!");
    console.log("Access token obtained:", accessToken.token ? "Yes" : "No");
    console.log("Service Account email:", credentials.client_email);
    console.log(
      "Sheet ID configured:",
      process.env.REACT_APP_GOOGLE_SHEETS_SPREADSHEET_ID ? "Yes" : "No"
    );
    console.log(
      "Google Maps API configured:",
      process.env.REACT_APP_GOOGLE_MAPS_API_KEY ? "Yes" : "No"
    );
    console.log(
      "Telegram Bot configured:",
      process.env.TELEGRAM_BOT_TOKEN ? "Yes" : "No"
    );
    console.log(
      "Email service configured:",
      process.env.SENDGRID_API_KEY || process.env.SMTP_USER ? "Yes" : "No"
    );
  } catch (error) {
    console.error("❌ Google Service Account connection failed:");
    console.error(error.message);

    if (error.message.includes("Missing environment variables")) {
      console.error("\n💡 Make sure to:");
      console.error("1. Copy env.example to .env");
      console.error("2. Fill in all required environment variables");
      console.error(
        "3. Get the values from your Google Service Account JSON file"
      );
      console.error(
        "4. Or set GOOGLE_SERVICE_ACCOUNT_KEY_PATH to point to JSON file"
      );
    } else if (error.message.includes("JSON file not found")) {
      console.error("\n💡 File Path Issues:");
      const envPath = process.env.GOOGLE_SERVICE_ACCOUNT_KEY_PATH;
      if (envPath && envPath !== "/path/to/service-account-key.json") {
        console.error(`1. Check if file exists: ${envPath}`);
      } else {
        console.error(
          "1. GOOGLE_SERVICE_ACCOUNT_KEY_PATH trong .env chưa được cấu hình đúng"
        );
        console.error(
          "   (hiện tại: /path/to/service-account-key.json - đây là placeholder)"
        );
      }
      console.error(
        "2. Đặt file JSON service account vào một trong các vị trí sau:"
      );
      console.error("   - src/config/service_account.json");
      console.error("   - automation/config/service-account-key.json");
      console.error("   - Thư mục gốc project");
      console.error(
        "3. Hoặc cập nhật GOOGLE_SERVICE_ACCOUNT_KEY_PATH trong .env với đường dẫn tuyệt đối"
      );
      console.error(
        "4. Hoặc xóa GOOGLE_SERVICE_ACCOUNT_KEY_PATH để dùng environment variables"
      );
      console.error("5. Check file permissions (readable)");
    } else if (error.message.includes("Invalid private key")) {
      console.error("\n💡 Private Key Issues:");
      console.error(
        "1. Make sure GOOGLE_PRIVATE_KEY includes full key with headers"
      );
      console.error(
        "2. Format should be: -----BEGIN PRIVATE KEY-----\\n...\\n-----END PRIVATE KEY-----"
      );
      console.error("3. In .env file, use quotes and \\n for newlines:");
      console.error(
        '   GOOGLE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\\n...\\n-----END PRIVATE KEY-----"'
      );
      console.error(
        "4. Or use GOOGLE_SERVICE_ACCOUNT_KEY_PATH to point to JSON file"
      );
    } else if (
      error.message.includes("DECODER") ||
      error.message.includes("unsupported")
    ) {
      console.error("\n💡 Private Key Decode Error:");
      console.error("1. Check if private key is correctly formatted");
      console.error("2. Make sure newlines are properly escaped (\\n)");
      console.error("3. Try using GOOGLE_SERVICE_ACCOUNT_KEY_PATH instead:");
      console.error(
        "   GOOGLE_SERVICE_ACCOUNT_KEY_PATH=/path/to/service-account-key.json"
      );
      console.error("4. Verify the key hasn't been corrupted or truncated");
    } else {
      console.error("\n💡 Troubleshooting:");
      console.error("1. Check .env file exists and has correct values");
      console.error("2. Verify service account email is correct");
      console.error("3. Ensure APIs are enabled in Google Cloud Console");
      console.error("4. Check service account has necessary permissions");
      console.error("5. Verify the JSON file is valid and not corrupted");
    }
  }
}

testGoogleConnection();
