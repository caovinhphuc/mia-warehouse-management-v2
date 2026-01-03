#!/usr/bin/env node

/**
 * 🚀 React Google Integration - Automated Deployment Script
 *
 * Script tự động hóa quá trình deployment dự án lên các platform khác nhau
 * Hỗ trợ: Netlify, Vercel, AWS S3, Google Cloud Platform
 */

const fs = require("fs");
const path = require("path");
const { execSync } = require("child_process");
const readline = require("readline");

// Colors for console output
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
      stdio: "pipe",
      encoding: "utf8",
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

const validateEnvironment = () => {
  log.step("Kiểm tra cấu hình environment...");

  if (!fileExists(".env")) {
    log.error(
      "File .env không tồn tại. Vui lòng tạo và cấu hình file .env trước khi deploy."
    );
    return false;
  }

  // Read .env file
  const envContent = fs.readFileSync(".env", "utf8");

  // Check for required variables
  const requiredVars = [
    "GOOGLE_SERVICE_ACCOUNT_EMAIL",
    "GOOGLE_PRIVATE_KEY",
    "REACT_APP_GOOGLE_SHEETS_SPREADSHEET_ID",
  ];

  const missingVars = requiredVars.filter((varName) => {
    const regex = new RegExp(`^${varName}=`, "m");
    return (
      !regex.test(envContent) || envContent.match(regex)[0].includes("your-")
    );
  });

  if (missingVars.length > 0) {
    log.error(
      `Các biến môi trường sau chưa được cấu hình: ${missingVars.join(", ")}`
    );
    log.info(
      "Vui lòng cập nhật file .env với thông tin thực tế trước khi deploy."
    );
    return false;
  }

  log.success("Environment configuration hợp lệ");
  return true;
};

const runTests = async () => {
  log.step("Chạy tests trước khi deploy...");

  // Run unit tests
  log.info("Chạy unit tests...");
  const testResult = execCommand(
    "npm test -- --watchAll=false --passWithNoTests"
  );
  if (!testResult.success) {
    log.warning(`Unit tests có lỗi: ${testResult.error}`);
    const continueDeploy = await askQuestion(
      "Bạn có muốn tiếp tục deploy? (y/N): "
    );
    if (continueDeploy.toLowerCase() !== "y") {
      return false;
    }
  } else {
    log.success("Unit tests passed");
  }

  // Test Google connection
  if (fileExists("scripts/testGoogleConnection.js")) {
    log.info("Test kết nối Google APIs...");
    const googleTestResult = execCommand(
      "node scripts/testGoogleConnection.js"
    );
    if (!googleTestResult.success) {
      log.warning(`Google APIs test thất bại: ${googleTestResult.error}`);
      const continueDeploy = await askQuestion(
        "Bạn có muốn tiếp tục deploy? (y/N): "
      );
      if (continueDeploy.toLowerCase() !== "y") {
        return false;
      }
    } else {
      log.success("Google APIs connection test passed");
    }
  }

  return true;
};

const buildProject = async () => {
  log.step("Build project cho production...");

  // Clean previous build
  if (fileExists("build")) {
    log.info("Xóa build cũ...");
    execCommand("rm -rf build");
  }

  // Install dependencies
  log.info("Cài đặt dependencies...");
  const installResult = execCommand("npm install");
  if (!installResult.success) {
    log.error(`Lỗi cài đặt dependencies: ${installResult.error}`);
    return false;
  }

  // Build project
  log.info("Building project...");
  const buildResult = execCommand("npm run build");
  if (!buildResult.success) {
    log.error(`Build thất bại: ${buildResult.error}`);
    return false;
  }

  log.success("Build thành công");
  return true;
};

const deployToNetlify = async () => {
  log.step("Deploy lên Netlify...");

  // Check if Netlify CLI is installed
  const netlifyCheck = execCommand("netlify --version");
  if (!netlifyCheck.success) {
    log.error(
      "Netlify CLI chưa được cài đặt. Vui lòng cài đặt: npm install -g netlify-cli"
    );
    return false;
  }

  // Deploy to Netlify
  const deployResult = execCommand("netlify deploy --prod --dir=build");
  if (!deployResult.success) {
    log.error(`Deploy Netlify thất bại: ${deployResult.error}`);
    return false;
  }

  log.success("Deploy Netlify thành công");
  return true;
};

const deployToVercel = async () => {
  log.step("Deploy lên Vercel...");

  // Check if Vercel CLI is installed
  const vercelCheck = execCommand("vercel --version");
  if (!vercelCheck.success) {
    log.error(
      "Vercel CLI chưa được cài đặt. Vui lòng cài đặt: npm install -g vercel"
    );
    return false;
  }

  // Deploy to Vercel
  const deployResult = execCommand("vercel --prod");
  if (!deployResult.success) {
    log.error(`Deploy Vercel thất bại: ${deployResult.error}`);
    return false;
  }

  log.success("Deploy Vercel thành công");
  return true;
};

const deployToAWS = async () => {
  log.step("Deploy lên AWS S3...");

  // Check if AWS CLI is installed
  const awsCheck = execCommand("aws --version");
  if (!awsCheck.success) {
    log.error("AWS CLI chưa được cài đặt. Vui lòng cài đặt AWS CLI trước.");
    return false;
  }

  // Get S3 bucket name
  const bucketName = await askQuestion("Nhập tên S3 bucket: ");
  if (!bucketName) {
    log.error("Tên bucket không được để trống");
    return false;
  }

  // Deploy to S3
  const deployResult = execCommand(
    `aws s3 sync build/ s3://${bucketName} --delete`
  );
  if (!deployResult.success) {
    log.error(`Deploy AWS S3 thất bại: ${deployResult.error}`);
    return false;
  }

  log.success(
    `Deploy AWS S3 thành công: https://${bucketName}.s3-website-us-east-1.amazonaws.com`
  );
  return true;
};

const deployToGCP = async () => {
  log.step("Deploy lên Google Cloud Platform...");

  // Check if gcloud CLI is installed
  const gcloudCheck = execCommand("gcloud --version");
  if (!gcloudCheck.success) {
    log.error(
      "Google Cloud CLI chưa được cài đặt. Vui lòng cài đặt gcloud CLI trước."
    );
    return false;
  }

  // Deploy to App Engine
  const deployResult = execCommand("gcloud app deploy");
  if (!deployResult.success) {
    log.error(`Deploy GCP thất bại: ${deployResult.error}`);
    return false;
  }

  log.success("Deploy GCP thành công");
  return true;
};

const createDeploymentConfig = async (platform) => {
  log.step(`Tạo cấu hình deployment cho ${platform}...`);

  const configs = {
    netlify: {
      file: "netlify.toml",
      content: `[build]
  command = "npm run build"
  publish = "build"

[build.environment]
  NODE_VERSION = "16"

[[redirects]]
  from = "/*"
  to = "/index.html"
  status = 200
`,
    },
    vercel: {
      file: "vercel.json",
      content: `{
  "version": 2,
  "builds": [
    {
      "src": "package.json",
      "use": "@vercel/static-build",
      "config": {
        "distDir": "build"
      }
    }
  ],
  "routes": [
    {
      "src": "/static/(.*)",
      "headers": {
        "cache-control": "s-maxage=31536000,immutable"
      }
    },
    {
      "src": "/(.*)",
      "dest": "/index.html"
    }
  ]
}
`,
    },
    gcp: {
      file: "app.yaml",
      content: `runtime: nodejs16
env: standard

env_variables:
  REACT_APP_GOOGLE_CLIENT_EMAIL: "your-service-account@project.iam.gserviceaccount.com"
  REACT_APP_GOOGLE_PRIVATE_KEY: "-----BEGIN PRIVATE KEY-----\\n...\\n-----END PRIVATE KEY-----\\n"
  REACT_APP_GOOGLE_PROJECT_ID: "your-project-id"

handlers:
- url: /static
  static_dir: build/static
- url: /.*
  static_files: build/index.html
  upload: build/index.html
`,
    },
  };

  const config = configs[platform];
  if (config) {
    try {
      fs.writeFileSync(config.file, config.content);
      log.success(`Đã tạo file cấu hình: ${config.file}`);
    } catch (error) {
      log.error(`Lỗi tạo file cấu hình: ${error.message}`);
    }
  }
};

const showDeploymentOptions = () => {
  log.header("🚀 DEPLOYMENT OPTIONS");

  console.log(`
${colors.cyan}Chọn platform để deploy:${colors.reset}

1. ${colors.green}Netlify${colors.reset} - Dễ dàng, miễn phí, tích hợp Git
2. ${colors.green}Vercel${colors.reset} - Tối ưu cho React, serverless functions
3. ${colors.green}AWS S3${colors.reset} - Scalable, cost-effective
4. ${colors.green}Google Cloud Platform${colors.reset} - Tích hợp tốt với Google APIs

${colors.yellow}Lưu ý:${colors.reset}
- Đảm bảo đã cấu hình environment variables trên platform
- Kiểm tra domain và SSL certificate
- Test ứng dụng sau khi deploy
  `);
};

const main = async () => {
  log.header("🚀 REACT GOOGLE INTEGRATION - AUTOMATED DEPLOYMENT");

  try {
    // Step 1: Validate environment
    const envValid = validateEnvironment();
    if (!envValid) {
      process.exit(1);
    }

    // Step 2: Run tests
    const testsPassed = await runTests();
    if (!testsPassed) {
      process.exit(1);
    }

    // Step 3: Build project
    const buildSuccess = await buildProject();
    if (!buildSuccess) {
      process.exit(1);
    }

    // Step 4: Show deployment options
    showDeploymentOptions();

    // Step 5: Get platform choice
    const platform = await askQuestion("Chọn platform (1-4): ");

    let deploySuccess = false;

    switch (platform) {
      case "1":
        await createDeploymentConfig("netlify");
        deploySuccess = await deployToNetlify();
        break;
      case "2":
        await createDeploymentConfig("vercel");
        deploySuccess = await deployToVercel();
        break;
      case "3":
        deploySuccess = await deployToAWS();
        break;
      case "4":
        await createDeploymentConfig("gcp");
        deploySuccess = await deployToGCP();
        break;
      default:
        log.error("Lựa chọn không hợp lệ");
        process.exit(1);
    }

    if (deploySuccess) {
      log.header("🎉 DEPLOYMENT THÀNH CÔNG!");
      console.log(`
${colors.green}Ứng dụng đã được deploy thành công!${colors.reset}

${colors.cyan}📋 Các bước tiếp theo:${colors.reset}

1. ${colors.yellow}Kiểm tra ứng dụng:${colors.reset}
   - Truy cập URL deployment
   - Test các tính năng chính
   - Kiểm tra Google APIs integration

2. ${colors.yellow}Monitoring:${colors.reset}
   - Thiết lập error tracking (Sentry)
   - Cấu hình analytics
   - Monitor performance

3. ${colors.yellow}Backup:${colors.reset}
   - Backup source code
   - Lưu trữ environment variables
   - Document deployment process

${colors.green}Chúc mừng! Ứng dụng của bạn đã live! 🚀${colors.reset}
      `);
    } else {
      log.error("Deployment thất bại");
      process.exit(1);
    }
  } catch (error) {
    log.error(`Deployment thất bại: ${error.message}`);
    process.exit(1);
  } finally {
    rl.close();
  }
};

// Handle process termination
process.on("SIGINT", () => {
  log.warning("\nDeployment bị hủy bởi người dùng");
  rl.close();
  process.exit(0);
});

// Run main function
if (require.main === module) {
  main();
}

module.exports = {
  validateEnvironment,
  runTests,
  buildProject,
  deployToNetlify,
  deployToVercel,
  deployToAWS,
  deployToGCP,
};
