#!/usr/bin/env node

/**
 * Lighthouse Performance Audit
 * Runs Lighthouse audit and generates performance report
 */

const { execSync } = require("child_process");
const fs = require("fs");
const path = require("path");

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

function checkLighthouseInstalled() {
  try {
    execSync("lighthouse --version", { stdio: "ignore" });
    return true;
  } catch (error) {
    return false;
  }
}

function installLighthouse() {
  log("📦 Installing Lighthouse...", "cyan");
  try {
    execSync("npm install -g lighthouse", { stdio: "inherit" });
    log("✅ Lighthouse installed successfully", "green");
    return true;
  } catch (error) {
    log("❌ Failed to install Lighthouse", "red");
    return false;
  }
}

function runLighthouse(url = "http://localhost:3000") {
  log("🔍 Running Lighthouse Performance Audit", "cyan");
  log("=========================================", "cyan");
  console.log("");

  // Check if Lighthouse is installed
  if (!checkLighthouseInstalled()) {
    log("⚠️  Lighthouse not found. Installing...", "yellow");
    if (!installLighthouse()) {
      log(
        "❌ Please install Lighthouse manually: npm install -g lighthouse",
        "red"
      );
      process.exit(1);
    }
  }

  // Check if URL is accessible
  log(`🌐 Testing URL: ${url}`, "cyan");
  try {
    execSync(`curl -s -o /dev/null -w "%{http_code}" ${url}`, {
      stdio: "pipe",
    });
  } catch (error) {
    log(`❌ Cannot access ${url}. Make sure the server is running.`, "red");
    log("💡 Start the server with: npm start", "yellow");
    process.exit(1);
  }

  // Run Lighthouse
  const outputDir = "lighthouse-reports";
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }

  const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
  const reportPath = path.join(outputDir, `lighthouse-${timestamp}.html`);
  const jsonPath = path.join(outputDir, `lighthouse-${timestamp}.json`);

  log("⏳ Running Lighthouse audit (this may take a minute)...", "cyan");
  console.log("");

  try {
    // Run Lighthouse with performance category
    execSync(
      `lighthouse ${url} ` +
        `--output=html,json ` +
        `--output-path=${reportPath.replace(".html", "")} ` +
        `--only-categories=performance ` +
        `--chrome-flags="--headless --no-sandbox" ` +
        `--quiet`,
      { stdio: "inherit" }
    );

    // Read JSON report
    const jsonReport = JSON.parse(fs.readFileSync(jsonPath, "utf8"));
    const scores = jsonReport.categories;

    console.log("");
    log("📊 Lighthouse Performance Scores:", "cyan");
    console.log("");

    // Display scores
    const performanceScore = scores.performance?.score
      ? Math.round(scores.performance.score * 100)
      : 0;
    const scoreColor =
      performanceScore >= 90
        ? "green"
        : performanceScore >= 50
          ? "yellow"
          : "red";

    log(`Performance Score: ${performanceScore}/100`, scoreColor);
    console.log("");

    // Display metrics
    const metrics = jsonReport.audits;
    const keyMetrics = [
      "first-contentful-paint",
      "largest-contentful-paint",
      "total-blocking-time",
      "cumulative-layout-shift",
      "speed-index",
      "interactive",
    ];

    log("📈 Key Metrics:", "cyan");
    keyMetrics.forEach((metric) => {
      const audit = metrics[metric];
      if (audit) {
        const value = audit.numericValue || audit.displayValue || "N/A";
        const score =
          audit.score !== null ? Math.round(audit.score * 100) : "N/A";
        const status =
          audit.score >= 0.9 ? "✅" : audit.score >= 0.5 ? "⚠️" : "❌";
        log(
          `  ${status} ${audit.title}: ${value} (Score: ${score})`,
          audit.score >= 0.9 ? "green" : audit.score >= 0.5 ? "yellow" : "red"
        );
      }
    });

    console.log("");
    log(`📄 HTML Report: ${reportPath}`, "cyan");
    log(`📄 JSON Report: ${jsonPath}`, "cyan");
    console.log("");

    // Recommendations
    if (performanceScore < 90) {
      log("💡 Performance Recommendations:", "yellow");

      const opportunities = Object.values(jsonReport.audits)
        .filter(
          (audit) => audit.details?.type === "opportunity" && audit.score < 1
        )
        .sort((a, b) => (b.numericValue || 0) - (a.numericValue || 0))
        .slice(0, 5);

      opportunities.forEach((opportunity) => {
        const savings = opportunity.numericValue
          ? formatBytes(opportunity.numericValue)
          : "";
        log(
          `  • ${opportunity.title}${savings ? ` (Potential savings: ${savings})` : ""}`,
          "yellow"
        );
      });
      console.log("");
    }

    if (performanceScore >= 90) {
      log("✅ Performance score is excellent!", "green");
    } else if (performanceScore >= 50) {
      log("⚠️  Performance score needs improvement", "yellow");
    } else {
      log("❌ Performance score is poor. Immediate action required.", "red");
      process.exit(1);
    }
  } catch (error) {
    log(`❌ Lighthouse audit failed: ${error.message}`, "red");
    process.exit(1);
  }
}

function formatBytes(bytes) {
  if (!bytes) return "";
  if (bytes < 1024) return bytes + " bytes";
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(2) + " KB";
  return (bytes / (1024 * 1024)).toFixed(2) + " MB";
}

// Main execution
if (require.main === module) {
  const url = process.argv[2] || "http://localhost:3000";
  runLighthouse(url);
}

module.exports = { runLighthouse };
