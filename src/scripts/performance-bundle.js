#!/usr/bin/env node

/**
 * Performance Bundle Size Checker
 * Checks bundle size against performance budget
 */

const fs = require("fs");
const path = require("path");
const { execSync } = require("child_process");

// Performance budget (in bytes)
const BUDGET = {
  javascript: 250 * 1024, // 250KB
  css: 50 * 1024, // 50KB
  images: 500 * 1024, // 500KB
  fonts: 100 * 1024, // 100KB
  total: 1024 * 1024, // 1MB
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

function getDirectorySize(dir, extensions = []) {
  let size = 0;
  const files = [];

  function traverse(currentDir) {
    if (!fs.existsSync(currentDir)) return;

    const items = fs.readdirSync(currentDir);
    items.forEach((item) => {
      const fullPath = path.join(currentDir, item);
      try {
        const stat = fs.statSync(fullPath);
        if (stat.isDirectory()) {
          traverse(fullPath);
        } else if (
          extensions.length === 0 ||
          extensions.some((ext) => item.endsWith(ext))
        ) {
          size += stat.size;
          files.push({ path: fullPath, size: stat.size });
        }
      } catch (err) {
        // Skip files that can't be accessed
      }
    });
  }

  traverse(dir);
  return { size, files };
}

function formatBytes(bytes) {
  if (bytes === 0) return "0 Bytes";
  const k = 1024;
  const sizes = ["Bytes", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
}

function checkBundleSize() {
  log("📦 Performance Bundle Size Checker", "cyan");
  log("=====================================", "cyan");
  console.log("");

  const buildDir = "build";

  if (!fs.existsSync(buildDir)) {
    log('❌ Build directory not found. Run "npm run build" first.', "red");
    process.exit(1);
  }

  // Get sizes by type
  const jsSize = getDirectorySize(buildDir, [".js"]);
  const cssSize = getDirectorySize(buildDir, [".css"]);
  const imageSize = getDirectorySize(buildDir, [
    ".png",
    ".jpg",
    ".jpeg",
    ".gif",
    ".svg",
    ".webp",
  ]);
  const fontSize = getDirectorySize(buildDir, [
    ".woff",
    ".woff2",
    ".ttf",
    ".eot",
  ]);
  const totalSize = getDirectorySize(buildDir);

  // Check against budget
  const results = {
    javascript: {
      size: jsSize.size,
      budget: BUDGET.javascript,
      status: jsSize.size <= BUDGET.javascript,
    },
    css: {
      size: cssSize.size,
      budget: BUDGET.css,
      status: cssSize.size <= BUDGET.css,
    },
    images: {
      size: imageSize.size,
      budget: BUDGET.images,
      status: imageSize.size <= BUDGET.images,
    },
    fonts: {
      size: fontSize.size,
      budget: BUDGET.fonts,
      status: fontSize.size <= BUDGET.fonts,
    },
    total: {
      size: totalSize.size,
      budget: BUDGET.total,
      status: totalSize.size <= BUDGET.total,
    },
  };

  // Display results
  console.log("📊 Bundle Size Report:");
  console.log("");

  let allPassed = true;
  Object.entries(results).forEach(([type, data]) => {
    const percentage = ((data.size / data.budget) * 100).toFixed(1);
    const status = data.status ? "✅" : "❌";
    const color = data.status ? "green" : "red";

    if (!data.status) allPassed = false;

    log(
      `${status} ${type.toUpperCase().padEnd(10)}: ${formatBytes(data.size).padEnd(10)} / ${formatBytes(data.budget)} (${percentage}%)`,
      color
    );
  });

  console.log("");

  // Show largest files
  console.log("📁 Largest Files:");
  const allFiles = [
    ...jsSize.files,
    ...cssSize.files,
    ...imageSize.files,
    ...fontSize.files,
  ]
    .sort((a, b) => b.size - a.size)
    .slice(0, 10);

  allFiles.forEach((file, index) => {
    const relativePath = path.relative(buildDir, file.path);
    console.log(
      `  ${index + 1}. ${relativePath.padEnd(50)} ${formatBytes(file.size)}`
    );
  });

  console.log("");

  // Recommendations
  if (!allPassed) {
    log("💡 Recommendations:", "yellow");
    if (!results.javascript.status) {
      log("  • Consider code splitting for JavaScript", "yellow");
      log("  • Remove unused dependencies", "yellow");
      log("  • Use dynamic imports for large components", "yellow");
    }
    if (!results.css.status) {
      log("  • Remove unused CSS", "yellow");
      log("  • Use CSS-in-JS or CSS modules", "yellow");
    }
    if (!results.images.status) {
      log("  • Optimize images (use WebP format)", "yellow");
      log("  • Use lazy loading for images", "yellow");
      log("  • Consider using CDN for images", "yellow");
    }
    console.log("");
    log("⚠️  Bundle size exceeds performance budget!", "red");
    process.exit(1);
  } else {
    log("✅ All bundle sizes are within budget!", "green");
  }

  // Save report
  const report = {
    timestamp: new Date().toISOString(),
    budget: BUDGET,
    sizes: Object.fromEntries(
      Object.entries(results).map(([key, value]) => [
        key,
        {
          size: value.size,
          budget: value.budget,
          percentage: ((value.size / value.budget) * 100).toFixed(1),
          status: value.status,
        },
      ])
    ),
    largestFiles: allFiles.map((f) => ({
      path: path.relative(buildDir, f.path),
      size: f.size,
    })),
  };

  fs.writeFileSync("bundle-report.json", JSON.stringify(report, null, 2));
  log("📄 Report saved to bundle-report.json", "cyan");
}

if (require.main === module) {
  checkBundleSize();
}

module.exports = { checkBundleSize, BUDGET };
