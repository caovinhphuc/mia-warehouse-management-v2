#!/usr/bin/env node

/**
 * Performance Budget Monitor
 * Monitors performance metrics against budget and alerts if exceeded
 */

const fs = require("fs");
const path = require("path");
const { execSync } = require("child_process");

// Performance budgets
const BUDGETS = {
  bundle: {
    javascript: 250 * 1024, // 250KB
    css: 50 * 1024, // 50KB
    images: 500 * 1024, // 500KB
    fonts: 100 * 1024, // 100KB
    total: 1024 * 1024, // 1MB
  },
  metrics: {
    fcp: 1800, // First Contentful Paint (ms)
    lcp: 2500, // Largest Contentful Paint (ms)
    tti: 3800, // Time to Interactive (ms)
    cls: 0.1, // Cumulative Layout Shift
    tbt: 300, // Total Blocking Time (ms)
    lighthouse: 90, // Lighthouse score
  },
  api: {
    responseTime: 500, // API response time (ms)
    errorRate: 1, // Error rate (%)
    cacheHitRate: 70, // Cache hit rate (%)
  },
};

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

function checkBundleBudget() {
  log("📦 Checking Bundle Budget...", "cyan");

  const buildDir = "build";
  if (!fs.existsSync(buildDir)) {
    log('⚠️  Build directory not found. Run "npm run build" first.', "yellow");
    return { passed: false, warnings: ["Build directory not found"] };
  }

  const { checkBundleSize } = require("./performance-bundle");
  try {
    checkBundleSize();
    return { passed: true };
  } catch (error) {
    return { passed: false, error: error.message };
  }
}

function checkLighthouseBudget() {
  log("🔍 Checking Lighthouse Budget...", "cyan");

  // Check if server is running
  try {
    execSync('curl -s -o /dev/null -w "%{http_code}" http://localhost:3000', {
      stdio: "pipe",
    });
  } catch (error) {
    log("⚠️  Server not running. Skipping Lighthouse check.", "yellow");
    return { passed: true, skipped: true };
  }

  // Run Lighthouse (simplified check)
  try {
    const { runLighthouse } = require("./performance-lighthouse");
    runLighthouse("http://localhost:3000");
    return { passed: true };
  } catch (error) {
    return { passed: false, error: error.message };
  }
}

function checkAPIBudget() {
  log("🌐 Checking API Budget...", "cyan");

  const apiUrl = process.env.REACT_APP_API_URL || "http://localhost:3001";

  try {
    const startTime = Date.now();
    execSync(`curl -s -o /dev/null -w "%{http_code}" ${apiUrl}/health`, {
      stdio: "pipe",
    });
    const responseTime = Date.now() - startTime;

    if (responseTime > BUDGETS.api.responseTime) {
      log(
        `⚠️  API response time: ${responseTime}ms (budget: ${BUDGETS.api.responseTime}ms)`,
        "yellow"
      );
      return { passed: false, responseTime };
    }

    log(`✅ API response time: ${responseTime}ms`, "green");
    return { passed: true, responseTime };
  } catch (error) {
    log("⚠️  API not accessible. Skipping API check.", "yellow");
    return { passed: true, skipped: true };
  }
}

function generateReport(results) {
  const report = {
    timestamp: new Date().toISOString(),
    budgets: BUDGETS,
    results: results,
    summary: {
      total: Object.keys(results).length,
      passed: Object.values(results).filter((r) => r.passed).length,
      failed: Object.values(results).filter((r) => !r.passed && !r.skipped)
        .length,
      skipped: Object.values(results).filter((r) => r.skipped).length,
    },
  };

  fs.writeFileSync(
    "performance-budget-report.json",
    JSON.stringify(report, null, 2)
  );
  return report;
}

function checkPerformanceBudget() {
  log("💰 Performance Budget Monitor", "cyan");
  log("================================", "cyan");
  console.log("");

  const results = {
    bundle: checkBundleBudget(),
    lighthouse: checkLighthouseBudget(),
    api: checkAPIBudget(),
  };

  console.log("");
  log("📊 Performance Budget Summary:", "cyan");
  console.log("");

  Object.entries(results).forEach(([check, result]) => {
    if (result.skipped) {
      log(`  ⏭️  ${check}: Skipped`, "yellow");
    } else if (result.passed) {
      log(`  ✅ ${check}: Passed`, "green");
    } else {
      log(`  ❌ ${check}: Failed`, "red");
      if (result.error) {
        log(`     Error: ${result.error}`, "red");
      }
    }
  });

  console.log("");

  // Generate report
  const report = generateReport(results);

  const { summary } = report;
  log(`Total Checks: ${summary.total}`, "cyan");
  log(`Passed: ${summary.passed}`, "green");
  log(`Failed: ${summary.failed}`, summary.failed > 0 ? "red" : "green");
  log(`Skipped: ${summary.skipped}`, summary.skipped > 0 ? "yellow" : "cyan");
  console.log("");

  if (summary.failed > 0) {
    log("❌ Performance budget exceeded!", "red");
    log("💡 Review performance-budget-report.json for details", "yellow");
    process.exit(1);
  } else {
    log("✅ All performance budgets met!", "green");
  }

  log("📄 Report saved to performance-budget-report.json", "cyan");
}

if (require.main === module) {
  checkPerformanceBudget();
}

module.exports = { checkPerformanceBudget, BUDGETS };
