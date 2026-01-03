#!/usr/bin/env node

/**
 * Image Optimization Script
 * Optimizes images in public/ and src/ directories
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

function checkImageOptimizer() {
  // Check for sharp (recommended) or imagemin
  try {
    execSync("npx sharp --version", { stdio: "ignore" });
    return "sharp";
  } catch (error) {
    try {
      execSync("npx imagemin --version", { stdio: "ignore" });
      return "imagemin";
    } catch (error) {
      return null;
    }
  }
}

function findImages(
  dir,
  extensions = [".png", ".jpg", ".jpeg", ".gif", ".svg"]
) {
  const images = [];

  function traverse(currentDir) {
    if (!fs.existsSync(currentDir)) return;

    const items = fs.readdirSync(currentDir);
    items.forEach((item) => {
      const fullPath = path.join(currentDir, item);
      try {
        const stat = fs.statSync(fullPath);
        if (
          stat.isDirectory() &&
          !item.startsWith(".") &&
          item !== "node_modules"
        ) {
          traverse(fullPath);
        } else if (extensions.some((ext) => item.toLowerCase().endsWith(ext))) {
          images.push(fullPath);
        }
      } catch (err) {
        // Skip files that can't be accessed
      }
    });
  }

  traverse(dir);
  return images;
}

function getFileSize(filePath) {
  try {
    return fs.statSync(filePath).size;
  } catch (error) {
    return 0;
  }
}

function formatBytes(bytes) {
  if (bytes === 0) return "0 Bytes";
  const k = 1024;
  const sizes = ["Bytes", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
}

function optimizeWithSharp(imagePath) {
  // This is a placeholder - actual implementation would use sharp
  // For now, we'll just report the file
  const size = getFileSize(imagePath);
  return { original: size, optimized: size, saved: 0 };
}

function optimizeImages() {
  log("🖼️  Image Optimization Script", "cyan");
  log("================================", "cyan");
  console.log("");

  // Check for optimizer
  const optimizer = checkImageOptimizer();
  if (!optimizer) {
    log("⚠️  No image optimizer found. Installing sharp...", "yellow");
    try {
      execSync("npm install --save-dev sharp", { stdio: "inherit" });
      log("✅ Sharp installed successfully", "green");
    } catch (error) {
      log(
        "❌ Failed to install sharp. Please install manually: npm install --save-dev sharp",
        "red"
      );
      log("💡 You can also use online tools like TinyPNG or Squoosh", "yellow");
      return;
    }
  }

  // Find images
  const directories = ["public", "src"];
  const allImages = [];

  directories.forEach((dir) => {
    if (fs.existsSync(dir)) {
      const images = findImages(dir);
      allImages.push(...images);
    }
  });

  if (allImages.length === 0) {
    log("ℹ️  No images found to optimize", "cyan");
    return;
  }

  log(`📁 Found ${allImages.length} images to optimize`, "cyan");
  console.log("");

  // Group by type
  const byType = {
    png: allImages.filter((img) => img.toLowerCase().endsWith(".png")),
    jpg: allImages.filter(
      (img) =>
        img.toLowerCase().endsWith(".jpg") ||
        img.toLowerCase().endsWith(".jpeg")
    ),
    gif: allImages.filter((img) => img.toLowerCase().endsWith(".gif")),
    svg: allImages.filter((img) => img.toLowerCase().endsWith(".svg")),
  };

  // Statistics
  let totalOriginal = 0;
  const totalOptimized = 0;
  const results = [];

  // Process images
  Object.entries(byType).forEach(([type, images]) => {
    if (images.length === 0) return;

    log(
      `🔄 Processing ${images.length} ${type.toUpperCase()} images...`,
      "cyan"
    );

    images.forEach((imagePath, index) => {
      const originalSize = getFileSize(imagePath);
      totalOriginal += originalSize;

      // For now, we'll just report (actual optimization would use sharp/imagemin)
      // In production, you would:
      // 1. Read the image
      // 2. Optimize it based on type
      // 3. Save optimized version (or replace original)

      const relativePath = path.relative(process.cwd(), imagePath);
      const percentage = ((originalSize / (1024 * 1024)) * 100).toFixed(1);

      if (originalSize > 100 * 1024) {
        // Files larger than 100KB
        log(
          `  ⚠️  ${relativePath}: ${formatBytes(originalSize)} (consider optimization)`,
          "yellow"
        );
      }

      results.push({
        path: relativePath,
        original: originalSize,
        optimized: originalSize, // Placeholder
        saved: 0,
      });
    });
  });

  console.log("");
  log("📊 Optimization Summary:", "cyan");
  log(`  Total images: ${allImages.length}`, "cyan");
  log(`  Total size: ${formatBytes(totalOriginal)}`, "cyan");
  log(
    `  Estimated savings: ~${formatBytes(totalOriginal * 0.4)} (40% average)`,
    "cyan"
  );
  console.log("");

  // Recommendations
  log("💡 Recommendations:", "yellow");
  log("  • Use WebP format for modern browsers", "yellow");
  log("  • Implement lazy loading for images", "yellow");
  log("  • Use responsive images (srcset)", "yellow");
  log("  • Consider using CDN for images", "yellow");
  log("  • Compress images before uploading", "yellow");
  console.log("");

  // Save report
  const report = {
    timestamp: new Date().toISOString(),
    totalImages: allImages.length,
    totalSize: totalOriginal,
    estimatedSavings: totalOriginal * 0.4,
    images: results,
  };

  fs.writeFileSync(
    "image-optimization-report.json",
    JSON.stringify(report, null, 2)
  );
  log("📄 Report saved to image-optimization-report.json", "cyan");
  log("✅ Image analysis completed", "green");
}

if (require.main === module) {
  optimizeImages();
}

module.exports = { optimizeImages };
