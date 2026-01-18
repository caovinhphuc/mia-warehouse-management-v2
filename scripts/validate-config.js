#!/usr/bin/env node

/**
 * =============================================================================
 * 🔍 Configuration Validation Script
 * =============================================================================
 * Validates project configuration and dependencies
 * =============================================================================
 */

const fs = require("fs");
const path = require("path");

// Get project root (parent of scripts directory)
const projectRoot = path.resolve(__dirname, "..");
process.chdir(projectRoot);

console.log("🔍 CONFIGURATION VALIDATION\n");
console.log("=".repeat(60));
console.log(`📁 Project Root: ${projectRoot}\n`);

let errors = 0;
let warnings = 0;
let passed = 0;

// Helper functions
const check = (name, condition, message, isWarning = false) => {
  if (condition) {
    console.log(`✅ ${name}`);
    passed++;
  } else {
    if (isWarning) {
      console.log(`⚠️  ${name}: ${message}`);
      warnings++;
    } else {
      console.log(`❌ ${name}: ${message}`);
      errors++;
    }
  }
};

// Check files exist
console.log("\n📁 Configuration Files:");
console.log("-".repeat(60));

const requiredFiles = [
  "package.json",
  "vite.config.js",
  "craco.config.js",
  "craco-plugin-fix-devserver.js",
  "babel.config.js",
  "postcss.config.js",
  ".env.example",
];

requiredFiles.forEach((file) => {
  const exists = fs.existsSync(path.join(__dirname, file));
  check(file, exists, "File not found");
});

// Check package.json
console.log("\n📦 Package Configuration:");
console.log("-".repeat(60));

try {
  const pkg = require("./package.json");

  check("package.json valid", !!pkg.name, "Invalid package.json");
  check("Dependencies defined", !!pkg.dependencies, "No dependencies");
  check("Scripts defined", !!pkg.scripts, "No scripts");
  check("DevDependencies defined", !!pkg.devDependencies, "No devDependencies");

  // Check for common issues
  const deps = pkg.dependencies || {};
  const devDeps = pkg.devDependencies || {};

  // Backend deps should not be in frontend dependencies
  const backendDeps = ["cors", "express", "node-cron"];
  backendDeps.forEach((dep) => {
    check(
      `No ${dep} in dependencies`,
      !deps[dep],
      `${dep} should be in backend/package.json`,
      true
    );
  });

  // Essential build tools
  const essentialDevDeps = [
    "@craco/craco",
    "webpack",
    "vite",
    "terser-webpack-plugin",
  ];

  essentialDevDeps.forEach((dep) => {
    check(
      `${dep} installed`,
      devDeps[dep],
      `Missing essential dev dependency`,
      true
    );
  });
} catch (error) {
  console.log(`❌ package.json: ${error.message}`);
  errors++;
}

// Check craco plugin
console.log("\n🔧 CRACO Plugin:");
console.log("-".repeat(60));

try {
  const plugin = require("./craco-plugin-fix-devserver.js");
  check("Plugin exports module", !!plugin, "No module export");
  check(
    "overrideDevServerConfig defined",
    !!plugin.overrideDevServerConfig,
    "Missing overrideDevServerConfig function"
  );
} catch (error) {
  console.log(`❌ craco-plugin-fix-devserver.js: ${error.message}`);
  errors++;
}

// Check vite config
console.log("\n⚡ Vite Configuration:");
console.log("-".repeat(60));

try {
  const viteConfig = fs.readFileSync("./vite.config.js", "utf8");

  check(
    "Vite compression plugin",
    viteConfig.includes("vite-plugin-compression"),
    "Compression plugin not configured",
    true
  );

  check(
    "Code splitting configured",
    viteConfig.includes("manualChunks"),
    "Manual chunks not configured",
    true
  );

  check(
    "Terser configured",
    viteConfig.includes("terserOptions"),
    "Terser not configured",
    true
  );
} catch (error) {
  console.log(`❌ vite.config.js: ${error.message}`);
  errors++;
}

// Check directory structure
console.log("\n📂 Directory Structure:");
console.log("-".repeat(60));

const requiredDirs = ["src", "public", "backend", "scripts", "build"].filter(
  (dir) => dir !== "build"
); // build may not exist yet

requiredDirs.forEach((dir) => {
  const exists = fs.existsSync(path.join(__dirname, dir));
  check(dir, exists, "Directory not found", dir === "build");
});

// Summary
console.log("\n" + "=".repeat(60));
console.log("📊 VALIDATION SUMMARY\n");
console.log(`✅ Passed:   ${passed}`);
console.log(`⚠️  Warnings: ${warnings}`);
console.log(`❌ Errors:   ${errors}`);
console.log("=".repeat(60));

if (errors > 0) {
  console.log(
    "\n❌ Configuration has errors. Please fix them before proceeding."
  );
  process.exit(1);
} else if (warnings > 0) {
  console.log("\n⚠️  Configuration has warnings. Consider addressing them.");
  process.exit(0);
} else {
  console.log("\n✅ Configuration is valid and ready!");
  process.exit(0);
}
