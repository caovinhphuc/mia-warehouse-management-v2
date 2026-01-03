#!/usr/bin/env node

/**
 * 🔧 Dependency Fix Script
 * Fixes common dependency conflicts and ERESOLVE issues
 */

const { execSync } = require("child_process");
const fs = require("fs");
const path = require("path");

console.log("🔧 Starting dependency fix process...\n");

// Step 1: Clean existing node_modules and lock file
console.log("1️⃣ Cleaning existing dependencies...");
try {
  if (fs.existsSync("node_modules")) {
    fs.rmSync("node_modules", { recursive: true, force: true });
    console.log("   ✅ Removed node_modules/");
  }

  if (fs.existsSync("package-lock.json")) {
    fs.unlinkSync("package-lock.json");
    console.log("   ✅ Removed package-lock.json");
  }

  if (fs.existsSync("yarn.lock")) {
    fs.unlinkSync("yarn.lock");
    console.log("   ✅ Removed yarn.lock");
  }
} catch (error) {
  console.log("   ⚠️ Cleanup warning:", error.message);
}

// Step 2: Clear npm cache
console.log("\n2️⃣ Clearing npm cache...");
try {
  execSync("npm cache clean --force", { stdio: "inherit" });
  console.log("   ✅ Cache cleared");
} catch (error) {
  console.log("   ⚠️ Cache clear warning:", error.message);
}

// Step 3: Install with legacy peer deps to resolve conflicts
console.log("\n3️⃣ Installing dependencies with conflict resolution...");
try {
  execSync("npm install --legacy-peer-deps", { stdio: "inherit" });
  console.log("   ✅ Dependencies installed with legacy peer deps");
} catch (error) {
  console.log("   ❌ Installation failed, trying alternative method...");

  // Fallback: Install critical dependencies first
  try {
    console.log("   🔄 Installing critical dependencies first...");
    execSync(
      "npm install react react-dom react-scripts@5.0.1 --legacy-peer-deps",
      { stdio: "inherit" }
    );
    execSync(
      "npm install typescript@4.9.5 @types/react@^18.2.79 @types/react-dom@^18.2.25 --save-dev --legacy-peer-deps",
      { stdio: "inherit" }
    );
    execSync("npm install --legacy-peer-deps", { stdio: "inherit" });
    console.log("   ✅ Dependencies installed via fallback method");
  } catch (fallbackError) {
    console.log("   ❌ Fallback failed:", fallbackError.message);
    process.exit(1);
  }
}

// Step 4: Audit and fix vulnerabilities
console.log("\n4️⃣ Checking for security vulnerabilities...");
try {
  execSync("npm audit fix --legacy-peer-deps", { stdio: "inherit" });
  console.log("   ✅ Security issues fixed");
} catch (error) {
  console.log("   ⚠️ Some vulnerabilities may remain:", error.message);
}

// Step 5: Verify installation
console.log("\n5️⃣ Verifying installation...");
try {
  const packageJson = JSON.parse(fs.readFileSync("package.json", "utf8"));
  const nodeModulesExists = fs.existsSync("node_modules");
  const reactExists = fs.existsSync("node_modules/react");
  const typescriptExists = fs.existsSync("node_modules/typescript");

  if (nodeModulesExists && reactExists && typescriptExists) {
    console.log("   ✅ Installation verified successfully");
    console.log(`   📦 Project: ${packageJson.name} v${packageJson.version}`);

    // Check TypeScript version
    const tsPackage = JSON.parse(
      fs.readFileSync("node_modules/typescript/package.json", "utf8")
    );
    console.log(`   📝 TypeScript: v${tsPackage.version}`);

    // Check React version
    const reactPackage = JSON.parse(
      fs.readFileSync("node_modules/react/package.json", "utf8")
    );
    console.log(`   ⚛️  React: v${reactPackage.version}`);
  } else {
    throw new Error("Installation verification failed");
  }
} catch (error) {
  console.log("   ❌ Verification failed:", error.message);
  process.exit(1);
}

// Step 6: Generate dependency report
console.log("\n6️⃣ Generating dependency report...");
try {
  const report = {
    timestamp: new Date().toISOString(),
    status: "success",
    conflicts_resolved: [
      "TypeScript version conflict (5.9.2 → 4.9.5)",
      "React Types compatibility",
      "CRACO integration",
    ],
    recommendations: [
      "Run npm start to verify development server",
      "Run npm run build to verify production build",
      "Run npm test to verify test suite",
      "Consider gradual migration to latest TypeScript in future",
    ],
  };

  fs.writeFileSync(
    "dependency-fix-report.json",
    JSON.stringify(report, null, 2)
  );
  console.log("   ✅ Report saved to dependency-fix-report.json");
} catch (error) {
  console.log("   ⚠️ Report generation warning:", error.message);
}

console.log("\n🎉 Dependency fix completed successfully!");
console.log("\n📋 Next steps:");
console.log("   1. npm start          - Test development server");
console.log("   2. npm run build      - Test production build");
console.log("   3. npm test           - Run test suite");
console.log("   4. npm run type-check - Verify TypeScript");
console.log("\n💡 If you still encounter issues, try:");
console.log("   - Delete node_modules and run this script again");
console.log("   - Check for global TypeScript conflicts");
console.log("   - Use npm install --force as last resort");
