#!/usr/bin/env node

/**
 * Bundle Dependency Analyzer
 * Phân tích chi tiết các dependencies gây ra bundle size lớn
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
  blue: "\x1b[34m",
};

function log(message, color = "reset") {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

function analyzeBundleDependencies() {
  log("🔍 Bundle Dependency Analyzer", "cyan");
  log("=================================", "cyan");
  console.log("");

  const buildDir = "build/static/js";
  if (!fs.existsSync(buildDir)) {
    log('❌ Build directory not found. Run "npm run build" first.', "red");
    process.exit(1);
  }

  // Get all JS files
  const jsFiles = [];
  function findJSFiles(dir) {
    const items = fs.readdirSync(dir);
    items.forEach((item) => {
      const fullPath = path.join(dir, item);
      const stat = fs.statSync(fullPath);
      if (stat.isFile() && item.endsWith(".js")) {
        jsFiles.push({ path: fullPath, name: item, size: stat.size });
      }
    });
  }

  findJSFiles(buildDir);
  jsFiles.sort((a, b) => b.size - a.size);

  log("📊 Largest JavaScript Chunks:", "cyan");
  console.log("");

  let totalSize = 0;
  jsFiles.forEach((file, index) => {
    const sizeKB = (file.size / 1024).toFixed(2);
    totalSize += file.size;
    const percentage = ((file.size / totalSize) * 100).toFixed(1);
    log(
      `${index + 1}. ${file.name.padEnd(50)} ${sizeKB} KB`,
      file.size > 200 * 1024
        ? "red"
        : file.size > 100 * 1024
          ? "yellow"
          : "green"
    );
  });

  console.log("");
  log(`Total Bundle Size: ${(totalSize / 1024 / 1024).toFixed(2)} MB`, "cyan");
  console.log("");

  // Analyze package.json dependencies
  log("📦 Analyzing Dependencies:", "cyan");
  console.log("");

  try {
    const packageJson = JSON.parse(fs.readFileSync("package.json", "utf8"));
    const deps = {
      ...packageJson.dependencies,
      ...packageJson.devDependencies,
    };

    // Common large libraries
    const largeLibs = [
      "react",
      "react-dom",
      "antd",
      "@ant-design/icons",
      "axios",
      "redux",
      "react-router-dom",
      "moment",
      "lodash",
      "chart.js",
      "recharts",
      "googleapis",
    ];

    log("🔍 Checking for large dependencies:", "yellow");
    largeLibs.forEach((lib) => {
      if (deps[lib]) {
        log(`  • ${lib}: ${deps[lib]}`, "yellow");
      }
    });

    console.log("");

    // Recommendations
    log("💡 Recommendations to Reduce Bundle Size:", "cyan");
    console.log("");

    if (totalSize > 2 * 1024 * 1024) {
      log("1. Code Splitting:", "yellow");
      log("   • Use React.lazy() for route-based splitting", "yellow");
      log("   • Split large components into separate chunks", "yellow");
      log("   • Use dynamic imports for heavy libraries", "yellow");
      console.log("");

      log("2. Remove Unused Dependencies:", "yellow");
      log("   • Run: npx depcheck to find unused deps", "yellow");
      log("   • Remove unused Ant Design components", "yellow");
      log("   • Consider tree-shaking unused code", "yellow");
      console.log("");

      log("3. Optimize Large Libraries:", "yellow");
      if (deps["antd"]) {
        log("   • Use babel-plugin-import for Ant Design", "yellow");
        log("   • Import only needed components", "yellow");
        log("   • Example: import { Button } from 'antd'", "yellow");
      }
      if (deps["moment"]) {
        log("   • Replace moment.js with date-fns or dayjs", "yellow");
        log("   • moment.js is ~70KB, date-fns is ~10KB", "yellow");
      }
      if (deps["lodash"]) {
        log("   • Use lodash-es for tree-shaking", "yellow");
        log(
          "   • Or import specific functions: import debounce from 'lodash/debounce'",
          "yellow"
        );
      }
      console.log("");

      log("4. Build Optimizations:", "yellow");
      log("   • Enable compression (gzip/brotli)", "yellow");
      log("   • Use production build: npm run build:prod", "yellow");
      log("   • Check webpack bundle analyzer", "yellow");
      console.log("");

      log("5. Immediate Actions:", "red");
      log("   • Run: npm run analyze to see bundle composition", "red");
      log("   • Check: build/static/js/ for large chunks", "red");
      log("   • Review: src/ for large imports", "red");
    }
  } catch (error) {
    log(`Error analyzing dependencies: ${error.message}`, "red");
  }

  console.log("");
  log("📄 For detailed analysis, run: npm run analyze", "cyan");
}

if (require.main === module) {
  analyzeBundleDependencies();
}

module.exports = { analyzeBundleDependencies };
