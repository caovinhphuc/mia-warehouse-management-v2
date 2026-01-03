#!/usr/bin/env node

/**
 * Simple Bundle Analyzer
 * Phân tích bundle đơn giản với source-map-explorer
 */

const fs = require("fs");
const path = require("path");
const { execSync } = require("child_process");

const colors = {
  reset: "\x1b[0m",
  green: "\x1b[32m",
  yellow: "\x1b[33m",
  red: "\x1b[31m",
  cyan: "\x1b[36m",
};

function log(message, color = "reset") {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

function analyzeWithSourceMapExplorer() {
  log("📊 Simple Bundle Analyzer", "cyan");
  log("=".repeat(50), "cyan");
  console.log("");

  const buildDir = "build";
  const jsDir = path.join(buildDir, "static", "js");

  if (!fs.existsSync(jsDir)) {
    log("❌ Build directory không tồn tại!", "red");
    log("💡 Chạy: npm run build trước", "yellow");
    process.exit(1);
  }

  // Find main JS file
  const jsFiles = fs
    .readdirSync(jsDir)
    .filter(
      (file) =>
        file.endsWith(".js") &&
        !file.endsWith(".map") &&
        file.startsWith("main.")
    );

  if (jsFiles.length === 0) {
    log("❌ Không tìm thấy main bundle file!", "red");
    log("💡 Chạy: npm run build trước", "yellow");
    process.exit(1);
  }

  const mainFile = path.join(jsDir, jsFiles[0]);
  const mapFile = mainFile + ".map";

  log(`📁 Phân tích: ${jsFiles[0]}`, "cyan");
  console.log("");

  // Check if source map exists
  if (!fs.existsSync(mapFile)) {
    log("⚠️  Không tìm thấy source map!", "yellow");
    log("💡 Build với source maps để phân tích chi tiết:", "yellow");
    log("   npm run build (không dùng GENERATE_SOURCEMAP=false)", "cyan");
    console.log("");

    // Show file size anyway
    const stats = fs.statSync(mainFile);
    const sizeMB = (stats.size / (1024 * 1024)).toFixed(2);
    log(`📊 Kích thước: ${sizeMB} MB`, "cyan");
    return;
  }

  // Use source-map-explorer
  try {
    log("🚀 Đang phân tích với source-map-explorer...", "cyan");
    execSync(`npx source-map-explorer ${mainFile} --html`, {
      stdio: "inherit",
    });
    log("✅ Đã tạo file source-map-explorer-report.html", "green");
    log("💡 Mở file trong browser để xem visualization", "cyan");
  } catch (error) {
    log("❌ Lỗi khi phân tích:", "red");
    log(`   ${error.message}`, "red");
    console.log("");
    log("💡 Thử:", "yellow");
    log("   npm install --save-dev source-map-explorer", "cyan");
    log("   npm run perf:bundle (phân tích đơn giản)", "cyan");
  }
}

if (require.main === module) {
  analyzeWithSourceMapExplorer();
}

module.exports = { analyzeWithSourceMapExplorer };
