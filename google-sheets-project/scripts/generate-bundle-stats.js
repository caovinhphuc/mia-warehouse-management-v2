#!/usr/bin/env node

/**
 * Generate Webpack Bundle Stats - Enhanced Version
 * Tạo và phân tích bundle stats từ webpack build
 * Tính năng:
 * - Analyze bundle size (JS, CSS)
 * - Check dependencies size
 * - Generate optimization recommendations
 * - Export stats to JSON
 * - Compare with previous builds
 */

const fs = require("fs");
const path = require("path");
const zlib = require("zlib");
const { execSync } = require("child_process");

const colors = {
  reset: "\x1b[0m",
  bright: "\x1b[1m",
  dim: "\x1b[2m",
  green: "\x1b[32m",
  yellow: "\x1b[33m",
  red: "\x1b[31m",
  cyan: "\x1b[36m",
  blue: "\x1b[34m",
  magenta: "\x1b[35m",
};

function log(message, color = "reset") {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

function header(title) {
  console.log("");
  log("━".repeat(70), "cyan");
  log(`  ${title}`, "bright");
  log("━".repeat(70), "cyan");
  console.log("");
}

function formatSize(bytes) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(2)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
}

function getSizeColor(bytes) {
  if (bytes > 500 * 1024) return "red"; // > 500KB
  if (bytes > 200 * 1024) return "yellow"; // > 200KB
  return "green";
}

const PERFORMANCE_BUDGETS = {
  totalRaw: 1024 * 1024, // 1MB
  totalGzip: 350 * 1024, // 350KB
  mainChunkRaw: 350 * 1024, // 350KB
  totalCssRaw: 80 * 1024, // 80KB
};

function formatDelta(delta) {
  const sign = delta > 0 ? "+" : "";
  return `${sign}${formatSize(delta)}`;
}

function getDeltaColor(delta) {
  if (delta > 0) return "red";
  if (delta < 0) return "green";
  return "cyan";
}

function getCompressedSizes(filePath) {
  try {
    const content = fs.readFileSync(filePath);
    const gzipSize = zlib.gzipSync(content, { level: 9 }).length;
    const brotliSize = zlib.brotliCompressSync(content, {
      params: {
        [zlib.constants.BROTLI_PARAM_QUALITY]: 11,
      },
    }).length;

    return { gzipSize, brotliSize };
  } catch (error) {
    return { gzipSize: 0, brotliSize: 0 };
  }
}

function getAssetGroupKey(fileName) {
  const matched = fileName.match(/^(.+?)\.[a-f0-9]{8,}(?:\.chunk)?\.(js|css)$/i);
  if (!matched) {
    return fileName;
  }

  const [, baseName, ext] = matched;
  return `${baseName}.${ext}`;
}

function dedupeLatestAssets(files) {
  const grouped = new Map();

  files.forEach((file) => {
    const key = getAssetGroupKey(file.name);
    const prev = grouped.get(key);
    if (!prev || file.mtimeMs > prev.mtimeMs) {
      grouped.set(key, file);
    }
  });

  return Array.from(grouped.values());
}

function loadPreviousStats() {
  const latestFile = path.join("build-stats", "bundle-stats-latest.json");

  if (!fs.existsSync(latestFile)) {
    return null;
  }

  try {
    return JSON.parse(fs.readFileSync(latestFile, "utf8"));
  } catch (error) {
    return null;
  }
}

// Check if dependency is installed
function isInstalled(packageName) {
  try {
    require.resolve(packageName);
    return true;
  } catch (e) {
    return false;
  }
}

// Check if dependency exists in package.json
function isInPackageJson(packageName, dev = true) {
  try {
    const packageJson = JSON.parse(fs.readFileSync("package.json", "utf8"));
    const deps = dev ? packageJson.devDependencies : packageJson.dependencies;
    return deps && deps[packageName];
  } catch (e) {
    return false;
  }
}

// Get version from package.json if exists
function getVersionFromPackageJson(packageName, dev = true) {
  try {
    const packageJson = JSON.parse(fs.readFileSync("package.json", "utf8"));
    const deps = dev ? packageJson.devDependencies : packageJson.dependencies;
    return deps && deps[packageName] ? deps[packageName] : null;
  } catch (e) {
    return null;
  }
}

// Install dependency
function installDependency(packageName, dev = true, version = null) {
  const packageToInstall = version ? `${packageName}@${version}` : packageName;
  log(`📦 Đang cài đặt ${packageToInstall}...`, "cyan");
  try {
    const flag = dev ? "--save-dev" : "--save";
    execSync(`npm install ${flag} ${packageToInstall}`, {
      stdio: "inherit",
      cwd: process.cwd(),
    });
    log(`✅ Đã cài đặt ${packageName}`, "green");
    return true;
  } catch (error) {
    log(`❌ Không thể cài đặt ${packageName}`, "red");
    log(`   ${error.message}`, "dim");
    return false;
  }
}

// Analyze build directory
function analyzeBuildDirectory() {
  header("📊 BUILD DIRECTORY ANALYSIS");

  const buildDir = path.join("build", "static");
  if (!fs.existsSync(buildDir)) {
    log("❌ Build directory không tồn tại!", "red");
    log("💡 Chạy: npm run build trước", "yellow");
    return null;
  }

  const jsDir = path.join(buildDir, "js");
  const cssDir = path.join(buildDir, "css");

  // Analyze JS files
  const jsFiles = [];
  if (fs.existsSync(jsDir)) {
    const files = fs.readdirSync(jsDir);
    files
      .filter((file) => file.endsWith(".js") && !file.endsWith(".map"))
      .forEach((file) => {
        const filePath = path.join(jsDir, file);
        const stats = fs.statSync(filePath);
        const compressed = getCompressedSizes(filePath);
        jsFiles.push({
          name: file,
          path: filePath,
          size: stats.size,
          mtimeMs: stats.mtimeMs,
          gzipSize: compressed.gzipSize,
          brotliSize: compressed.brotliSize,
        });
      });
    const dedupedJsFiles = dedupeLatestAssets(jsFiles);
    jsFiles.length = 0;
    jsFiles.push(...dedupedJsFiles);
    jsFiles.sort((a, b) => b.size - a.size);
  }

  // Analyze CSS files
  const cssFiles = [];
  if (fs.existsSync(cssDir)) {
    const files = fs.readdirSync(cssDir);
    files
      .filter((file) => file.endsWith(".css") && !file.endsWith(".map"))
      .forEach((file) => {
        const filePath = path.join(cssDir, file);
        const stats = fs.statSync(filePath);
        const compressed = getCompressedSizes(filePath);
        cssFiles.push({
          name: file,
          path: filePath,
          size: stats.size,
          mtimeMs: stats.mtimeMs,
          gzipSize: compressed.gzipSize,
          brotliSize: compressed.brotliSize,
        });
      });
    const dedupedCssFiles = dedupeLatestAssets(cssFiles);
    cssFiles.length = 0;
    cssFiles.push(...dedupedCssFiles);
    cssFiles.sort((a, b) => b.size - a.size);
  }

  // Display JS files
  if (jsFiles.length > 0) {
    log("📦 JavaScript Files:", "cyan");
    let totalJsSize = 0;
    let totalJsGzipSize = 0;
    let totalJsBrotliSize = 0;
    jsFiles.forEach((file, index) => {
      totalJsSize += file.size;
      totalJsGzipSize += file.gzipSize;
      totalJsBrotliSize += file.brotliSize;
      const sizeStr = `${formatSize(file.size).padEnd(12)} | gzip: ${formatSize(file.gzipSize).padEnd(10)} | br: ${formatSize(file.brotliSize).padEnd(10)}`;
      const color = getSizeColor(file.size);
      log(`  ${String(index + 1).padStart(2)}. ${file.name.padEnd(50)} ${sizeStr}`, color);
    });
    console.log("");
    log(`   Total JS: ${formatSize(totalJsSize)}`, "bright");
    log(`   Total JS (gzip): ${formatSize(totalJsGzipSize)}`, "bright");
    log(`   Total JS (brotli): ${formatSize(totalJsBrotliSize)}`, "bright");
    console.log("");
  }

  // Display CSS files
  if (cssFiles.length > 0) {
    log("🎨 CSS Files:", "cyan");
    let totalCssSize = 0;
    let totalCssGzipSize = 0;
    let totalCssBrotliSize = 0;
    cssFiles.forEach((file, index) => {
      totalCssSize += file.size;
      totalCssGzipSize += file.gzipSize;
      totalCssBrotliSize += file.brotliSize;
      const sizeStr = `${formatSize(file.size).padEnd(12)} | gzip: ${formatSize(file.gzipSize).padEnd(10)} | br: ${formatSize(file.brotliSize).padEnd(10)}`;
      log(`  ${String(index + 1).padStart(2)}. ${file.name.padEnd(50)} ${sizeStr}`, "cyan");
    });
    console.log("");
    log(`   Total CSS: ${formatSize(totalCssSize)}`, "bright");
    log(`   Total CSS (gzip): ${formatSize(totalCssGzipSize)}`, "bright");
    log(`   Total CSS (brotli): ${formatSize(totalCssBrotliSize)}`, "bright");
    console.log("");
  }

  const totalSize =
    jsFiles.reduce((sum, f) => sum + f.size, 0) + cssFiles.reduce((sum, f) => sum + f.size, 0);
  const totalGzipSize =
    jsFiles.reduce((sum, f) => sum + f.gzipSize, 0) +
    cssFiles.reduce((sum, f) => sum + f.gzipSize, 0);
  const totalBrotliSize =
    jsFiles.reduce((sum, f) => sum + f.brotliSize, 0) +
    cssFiles.reduce((sum, f) => sum + f.brotliSize, 0);

  log(`📊 Total Bundle Size: ${formatSize(totalSize)}`, "bright");
  log(`📊 Total Bundle Size (gzip): ${formatSize(totalGzipSize)}`, "bright");
  log(`📊 Total Bundle Size (brotli): ${formatSize(totalBrotliSize)}`, "bright");
  console.log("");

  return {
    jsFiles,
    cssFiles,
    totalJsSize: jsFiles.reduce((sum, f) => sum + f.size, 0),
    totalJsGzipSize: jsFiles.reduce((sum, f) => sum + f.gzipSize, 0),
    totalJsBrotliSize: jsFiles.reduce((sum, f) => sum + f.brotliSize, 0),
    totalCssSize: cssFiles.reduce((sum, f) => sum + f.size, 0),
    totalCssGzipSize: cssFiles.reduce((sum, f) => sum + f.gzipSize, 0),
    totalCssBrotliSize: cssFiles.reduce((sum, f) => sum + f.brotliSize, 0),
    totalSize,
    totalGzipSize,
    totalBrotliSize,
    mainChunk: jsFiles.find((file) => file.name.startsWith("main.")) || null,
  };
}

function evaluatePerformanceBudget(bundleData) {
  header("🎯 PERFORMANCE BUDGET CHECK");

  const checks = [
    {
      key: "totalRaw",
      label: "Total bundle (raw)",
      actual: bundleData.totalSize,
      budget: PERFORMANCE_BUDGETS.totalRaw,
    },
    {
      key: "totalGzip",
      label: "Total bundle (gzip)",
      actual: bundleData.totalGzipSize,
      budget: PERFORMANCE_BUDGETS.totalGzip,
    },
    {
      key: "mainChunkRaw",
      label: "Main chunk (raw)",
      actual: bundleData.mainChunk ? bundleData.mainChunk.size : 0,
      budget: PERFORMANCE_BUDGETS.mainChunkRaw,
    },
    {
      key: "totalCssRaw",
      label: "Total CSS (raw)",
      actual: bundleData.totalCssSize,
      budget: PERFORMANCE_BUDGETS.totalCssRaw,
    },
  ];

  const results = checks.map((check) => {
    const over = check.actual > check.budget;
    const diff = check.actual - check.budget;
    const color = over ? "red" : "green";
    const icon = over ? "❌" : "✅";

    log(
      `${icon} ${check.label.padEnd(22)} ${formatSize(check.actual).padEnd(10)} / budget ${formatSize(check.budget)}${
        over ? ` (over ${formatSize(diff)})` : ""
      }`,
      color
    );

    return {
      ...check,
      over,
      diff,
    };
  });

  console.log("");
  return results;
}

function compareWithPreviousBuild(currentBundleData, previousStats) {
  header("📈 COMPARISON WITH PREVIOUS BUILD");

  if (!previousStats || !previousStats.bundle) {
    log("ℹ️  No previous stats found (first run or stats file missing).", "dim");
    console.log("");
    return null;
  }

  const previous = previousStats.bundle;
  const safeDelta = (current, prev) => {
    if (typeof prev !== "number") {
      return null;
    }
    return current - prev;
  };

  const deltas = {
    totalSize: safeDelta(currentBundleData.totalSize, previous.totalSize),
    totalGzipSize: safeDelta(currentBundleData.totalGzipSize, previous.totalGzipSize),
    totalBrotliSize: safeDelta(currentBundleData.totalBrotliSize, previous.totalBrotliSize),
    mainChunkSize: safeDelta(
      currentBundleData.mainChunk ? currentBundleData.mainChunk.size : 0,
      previous.mainChunk ? previous.mainChunk.size : undefined
    ),
  };

  const printDelta = (label, delta) => {
    if (delta === null) {
      log(`• ${label.padEnd(12)} N/A (legacy stats)`, "dim");
      return;
    }
    log(`• ${label.padEnd(12)} ${formatDelta(delta)}`, getDeltaColor(delta));
  };

  printDelta("Total raw:", deltas.totalSize);
  printDelta("Total gzip:", deltas.totalGzipSize);
  printDelta("Total brotli:", deltas.totalBrotliSize);
  printDelta("Main chunk:", deltas.mainChunkSize);
  console.log("");

  return deltas;
}

// Analyze dependencies
function analyzeDependencies() {
  header("📦 DEPENDENCY ANALYSIS");

  try {
    const packageJson = JSON.parse(fs.readFileSync("package.json", "utf8"));
    const deps = packageJson.dependencies || {};
    const devDeps = packageJson.devDependencies || {};

    // Known large libraries
    const knownLibraries = {
      antd: {
        size: "~2MB",
        tip: "Use tree-shaking, import specific components",
      },
      "@ant-design/icons": {
        size: "~500KB",
        tip: "Import specific icons only",
      },
      react: { size: "~130KB", tip: "Required" },
      "react-dom": { size: "~130KB", tip: "Required" },
      axios: { size: "~15KB", tip: "Good choice" },
      redux: { size: "~20KB", tip: "Consider Redux Toolkit" },
      "@reduxjs/toolkit": { size: "~50KB", tip: "Good choice" },
      "react-router-dom": { size: "~50KB", tip: "Required" },
      recharts: { size: "~150KB", tip: "Use lazy loading for charts" },
      googleapis: { size: "~500KB", tip: "Consider backend proxy" },
      "socket.io-client": { size: "~100KB", tip: "OK for real-time" },
    };

    log("🔍 Installed Large Dependencies:", "cyan");
    console.log("");

    Object.keys(knownLibraries).forEach((lib) => {
      if (deps[lib] || devDeps[lib]) {
        const info = knownLibraries[lib];
        const version = deps[lib] || devDeps[lib];
        log(`  📦 ${lib.padEnd(30)} ${version.padEnd(15)} ${info.size.padEnd(10)}`, "cyan");
        log(`     💡 ${info.tip}`, "dim");
      }
    });

    console.log("");
    log(`📊 Total Dependencies: ${Object.keys(deps).length}`, "cyan");
    log(`📊 Total Dev Dependencies: ${Object.keys(devDeps).length}`, "cyan");
    console.log("");

    return { deps, devDeps };
  } catch (error) {
    log(`❌ Error reading package.json: ${error.message}`, "red");
    return null;
  }
}

// Generate optimization recommendations
function generateRecommendations(bundleData) {
  header("💡 OPTIMIZATION RECOMMENDATIONS");

  const recommendations = [];

  // Check bundle size
  if (bundleData && bundleData.totalSize > 2 * 1024 * 1024) {
    recommendations.push({
      priority: "high",
      issue: `Large bundle size: ${formatSize(bundleData.totalSize)}`,
      action: "Implement code splitting with React.lazy()",
      impact: "High",
      code: `
// Example:
const Dashboard = React.lazy(() => import('./pages/Dashboard'));
const Reports = React.lazy(() => import('./pages/Reports'));

<Suspense fallback={<Loading />}>
  <Routes>
    <Route path="/dashboard" element={<Dashboard />} />
    <Route path="/reports" element={<Reports />} />
  </Routes>
</Suspense>`,
    });
  }

  if (bundleData && bundleData.totalGzipSize > PERFORMANCE_BUDGETS.totalGzip) {
    recommendations.push({
      priority: "high",
      issue: `Gzip bundle exceeds budget: ${formatSize(bundleData.totalGzipSize)}`,
      action: "Move heavy business libraries to async routes and remove dead imports",
      impact: "High",
    });
  }

  // Check large chunks
  if (bundleData && bundleData.jsFiles) {
    const largeChunks = bundleData.jsFiles.filter((f) => f.size > PERFORMANCE_BUDGETS.mainChunkRaw);
    if (largeChunks.length > 0) {
      recommendations.push({
        priority: "high",
        issue: `${largeChunks.length} chunks > ${formatSize(PERFORMANCE_BUDGETS.mainChunkRaw)}`,
        action: "Split large chunks into smaller pieces",
        impact: "High",
        files: largeChunks.map((f) => f.name),
      });
    }
  }

  if (bundleData && bundleData.mainChunk && bundleData.mainChunk.gzipSize > 150 * 1024) {
    recommendations.push({
      priority: "medium",
      issue: `Main chunk gzip is still high: ${formatSize(bundleData.mainChunk.gzipSize)}`,
      action: "Convert non-critical dashboard widgets to lazy loaded modules",
      impact: "Medium",
      files: [bundleData.mainChunk.name],
    });
  }

  if (recommendations.length === 0) {
    log("✅ Bundle is within configured budgets. Keep current optimization strategy.", "green");
    console.log("");
  }

  // Display recommendations
  recommendations.forEach((rec, index) => {
    log(`${index + 1}. ${rec.issue}`, "yellow");
    log(`   Action: ${rec.action}`, "cyan");
    log(`   Impact: ${rec.impact}`, "cyan");
    if (rec.files) {
      log(`   Affected Files:`, "cyan");
      rec.files.forEach((file) => {
        log(`   • ${file}`, "dim");
      });
    }
    if (rec.code) {
      log(`   Code Example:`, "cyan");
      rec.code
        .trim()
        .split("\n")
        .forEach((line) => {
          log(`   ${line}`, "dim");
        });
    }
    console.log("");
  });

  return recommendations;
}

// Export stats to JSON
function exportStats(bundleData, depsData, recommendations, budgetResults, deltas) {
  const statsDir = "build-stats";
  if (!fs.existsSync(statsDir)) {
    fs.mkdirSync(statsDir, { recursive: true });
  }

  const timestamp = new Date().toISOString();
  const statsFile = path.join(statsDir, `bundle-stats-${Date.now()}.json`);

  const stats = {
    timestamp,
    bundle: bundleData,
    dependencies: depsData,
    performanceBudget: budgetResults,
    previousBuildDelta: deltas,
    summary: {
      totalRaw: bundleData.totalSize,
      totalGzip: bundleData.totalGzipSize,
      totalBrotli: bundleData.totalBrotliSize,
      budgetsExceeded: budgetResults.filter((item) => item.over).map((item) => item.key),
      recommendationCount: recommendations.length,
    },
    recommendations: recommendations.map((r) => ({
      priority: r.priority,
      issue: r.issue,
      action: r.action,
      impact: r.impact,
    })),
  };

  fs.writeFileSync(statsFile, JSON.stringify(stats, null, 2));
  log(`💾 Stats exported to: ${statsFile}`, "green");
  console.log("");

  // Also save latest
  const latestFile = path.join(statsDir, "bundle-stats-latest.json");
  fs.writeFileSync(latestFile, JSON.stringify(stats, null, 2));
  log(`💾 Latest stats saved to: ${latestFile}`, "green");
  console.log("");
}

// Check and install required dependencies
function checkDependencies(autoInstall = true) {
  header("🔍 CHECKING DEPENDENCIES");

  const requiredDeps = [
    { name: "source-map-explorer", dev: true, optional: false },
    { name: "webpack-bundle-analyzer", dev: true, optional: false },
    { name: "depcheck", dev: true, optional: true },
    { name: "size-limit", dev: true, optional: true },
  ];

  // Check optional system tools
  log("🔧 Checking optional system tools...", "cyan");
  try {
    execSync("cargo --version", { stdio: "ignore" });
    log(`✅ cargo - installed (Rust package manager)`, "green");
  } catch (e) {
    log(`⚠️  cargo - not installed (optional, for Rust/WebAssembly)`, "dim");
  }
  console.log("");

  const missing = [];
  const optional = [];
  const needInstall = [];

  requiredDeps.forEach((dep) => {
    const installed = isInstalled(dep.name);
    const inPackageJson = isInPackageJson(dep.name, dep.dev);

    if (!installed) {
      const version = getVersionFromPackageJson(dep.name, dep.dev);

      if (dep.optional) {
        optional.push({ ...dep, version });
        log(`⚠️  ${dep.name} (optional) - not installed`, "yellow");
        if (inPackageJson && version) {
          log(`   📝 Found in package.json: ${version}`, "dim");
        }
      } else {
        missing.push({ ...dep, version });
        log(`❌ ${dep.name} - not installed`, "red");
        if (inPackageJson && version) {
          log(`   📝 Found in package.json: ${version}`, "dim");
        }
      }

      // Add to install list if auto-install enabled
      if (autoInstall) {
        needInstall.push({ ...dep, version });
      }
    } else {
      log(`✅ ${dep.name} - installed`, "green");
    }
  });

  console.log("");

  // Install missing dependencies (required and optional if in package.json)
  const toInstall = needInstall.filter((dep) => {
    // Always install required dependencies
    if (!dep.optional) return true;
    // Install optional only if they exist in package.json (user wants them)
    return dep.version !== null;
  });

  if (toInstall.length > 0) {
    log("📦 Tự động cài đặt dependencies thiếu...", "cyan");
    console.log("");

    let installedCount = 0;
    toInstall.forEach((dep) => {
      const success = installDependency(dep.name, dep.dev, dep.version);
      if (success) {
        installedCount++;
      } else {
        log(
          `   ⚠️  Có thể cần cài thủ công: npm install --save-dev ${dep.name}${
            dep.version ? `@${dep.version}` : ""
          }`,
          "yellow"
        );
      }
    });

    console.log("");
    if (installedCount > 0) {
      log(`✅ Đã cài đặt ${installedCount} dependencies. Tiếp tục phân tích...`, "green");
      console.log("");
    }
  } else if (missing.length > 0 && !autoInstall) {
    log("💡 Để tự động cài đặt dependencies, chạy:", "yellow");
    missing.forEach((dep) => {
      log(`   npm install --save-dev ${dep.name}${dep.version ? `@${dep.version}` : ""}`, "cyan");
    });
    console.log("");
  }

  // Show optional dependencies info
  if (optional.length > 0 && !autoInstall) {
    log("💡 Optional dependencies (có thể cài nếu cần):", "yellow");
    optional.forEach((dep) => {
      log(`   npm install --save-dev ${dep.name}${dep.version ? `@${dep.version}` : ""}`, "dim");
    });
    console.log("");
  }

  return { missing, optional, installed: needInstall.length };
}

// Main function
function generateBundleStats(autoInstallDeps = true) {
  log("📊 Generate Webpack Bundle Stats - Enhanced", "bright");
  log("=".repeat(70), "cyan");
  console.log("");

  // Check and auto-install dependencies
  checkDependencies(autoInstallDeps);

  // Continue with analysis (dependencies should be available now)
  console.log("");

  // Analyze build directory
  const bundleData = analyzeBuildDirectory();
  if (!bundleData) {
    process.exit(1);
  }

  const previousStats = loadPreviousStats();
  const deltas = compareWithPreviousBuild(bundleData, previousStats);

  const budgetResults = evaluatePerformanceBudget(bundleData);

  // Analyze dependencies
  const depsData = analyzeDependencies();

  // Generate recommendations
  const recommendations = generateRecommendations(bundleData);

  // Export stats
  exportStats(bundleData, depsData, recommendations, budgetResults, deltas);

  // Usage instructions
  header("📚 USEFUL COMMANDS");

  log("npm run perf:bundle        # This analysis", "cyan");
  log("npm run analyze            # Visual bundle analyzer (needs source maps)", "cyan");
  log("npm run perf:deps          # Check unused dependencies", "cyan");
  log("npm run perf:size          # Size limit check", "cyan");
  log("npx depcheck               # Find unused deps", "cyan");
  log("npm run analyze:chunks     # Detailed chunk analysis with sourcemaps", "cyan");
  console.log("");

  log("✨ Analysis Complete!", "green");
  log("=".repeat(70), "cyan");
  console.log("");
}

if (require.main === module) {
  generateBundleStats();
}

module.exports = {
  generateBundleStats,
  analyzeBuildDirectory,
  analyzeDependencies,
};
