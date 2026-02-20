#!/usr/bin/env node

/**
 * =============================================================================
 * 🦀 Cargo Information
 * =============================================================================
 * Display detailed Cargo/Rust installation information
 * =============================================================================
 */

const { execSync } = require("child_process");

const strictMode = process.argv.includes("--strict");

console.log("\n🦀 Cargo/Rust Status:\n");
console.log("=".repeat(60));

try {
  // Check Cargo
  const cargoVersion = execSync("cargo --version", { encoding: "utf8" }).trim();
  const cargoLocation = execSync("which cargo", { encoding: "utf8" }).trim();

  console.log("\n✅ Cargo (Rust Package Manager)");
  console.log(`   Version: ${cargoVersion}`);
  console.log(`   Location: ${cargoLocation}`);

  // Check Rustc
  try {
    const rustcVersion = execSync("rustc --version", { encoding: "utf8" }).trim();
    console.log("\n✅ Rustc (Rust Compiler)");
    console.log(`   Version: ${rustcVersion}`);
  } catch (e) {
    console.log("\n⚠️  Rustc not found separately (usually bundled with cargo)");
  }

  // Check Rustup
  try {
    const rustupVersion = execSync("rustup --version", { encoding: "utf8" }).trim();
    console.log("\n✅ Rustup (Rust Toolchain Manager)");
    console.log(`   Version: ${rustupVersion}`);
  } catch (e) {
    console.log("\n⚪ Rustup not found (optional)");
  }

  // Check installed targets
  try {
    const targets = execSync("rustup target list --installed", { encoding: "utf8" });
    console.log("\n📦 Installed Rust Targets:");
    targets.split("\n").forEach((target) => {
      if (target.trim()) {
        console.log(`   • ${target.trim()}`);
      }
    });
  } catch (e) {
    // Ignore if rustup not available
  }

  console.log("\n" + "=".repeat(60));
  console.log("\n💡 Ready for Rust/WebAssembly integration!");
  console.log("\n📚 To add WebAssembly support:");
  console.log("   rustup target add wasm32-unknown-unknown");
  console.log("   cargo install wasm-pack\n");
} catch (e) {
  console.log("\n⚠️  Cargo not installed (optional)\n");
  console.log("📥 Installation:");
  console.log("   macOS/Linux: curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh");
  console.log("   Windows: Download from https://rustup.rs/\n");
  console.log("📝 If you already installed Rust, restart terminal or run:");
  console.log("   source $HOME/.cargo/env\n");
  console.log("🔗 Official Website: https://www.rust-lang.org/\n");
  console.log("=".repeat(60) + "\n");

  if (strictMode) {
    process.exit(1);
  }

  process.exit(0);
}
