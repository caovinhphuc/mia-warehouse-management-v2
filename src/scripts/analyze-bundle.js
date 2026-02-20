#!/usr/bin/env node
const { execSync } = require("child_process");
const fs = require("fs");
const path = require("path");

console.log("📊 Analyzing bundle size...\n");

const buildDir = path.join(process.cwd(), "build", "static");
const jsDir = path.join(buildDir, "js");
const cssDir = path.join(buildDir, "css");

// Check if build exists
if (!fs.existsSync(jsDir)) {
  console.error(
    '❌ Build directory not found. Please run "npm run build" first.'
  );
  process.exit(1);
}

// List all JS files
const jsFiles = fs.readdirSync(jsDir).filter((f) => f.endsWith(".js"));
const cssFiles = fs.existsSync(cssDir)
  ? fs.readdirSync(cssDir).filter((f) => f.endsWith(".css"))
  : [];

console.log("📦 JavaScript bundles:");
jsFiles.forEach((file) => {
  const filePath = path.join(jsDir, file);
  const stats = fs.statSync(filePath);
  const sizeKB = (stats.size / 1024).toFixed(2);
  const sizeMB = (stats.size / (1024 * 1024)).toFixed(2);
  console.log(
    `  ${file.padEnd(40)} ${sizeMB > 1 ? `${sizeMB} MB` : `${sizeKB} KB`}`
  );
});

if (cssFiles.length > 0) {
  console.log("\n🎨 CSS bundles:");
  cssFiles.forEach((file) => {
    const filePath = path.join(cssDir, file);
    const stats = fs.statSync(filePath);
    const sizeKB = (stats.size / 1024).toFixed(2);
    console.log(`  ${file.padEnd(40)} ${sizeKB} KB`);
  });
}

// Try to use source-map-explorer if source maps exist
const hasSourceMaps = jsFiles.some((f) => {
  const mapFile = path.join(jsDir, `${f}.map`);
  return fs.existsSync(mapFile);
});

// Calculate total bundle size
const totalSize = jsFiles.reduce((sum, file) => {
  const filePath = path.join(jsDir, file);
  return sum + fs.statSync(filePath).size;
}, 0);
const totalKB = (totalSize / 1024).toFixed(2);
const totalMB = (totalSize / (1024 * 1024)).toFixed(2);

console.log(`\n📊 Summary:`);
console.log(
  `  Total JS bundle size: ${totalMB > 1 ? `${totalMB} MB` : `${totalKB} KB`}`
);
if (cssFiles.length > 0) {
  const totalCSSSize = cssFiles.reduce((sum, file) => {
    const filePath = path.join(cssDir, file);
    return sum + fs.statSync(filePath).size;
  }, 0);
  const totalCSSKB = (totalCSSSize / 1024).toFixed(2);
  console.log(`  Total CSS bundle size: ${totalCSSKB} KB`);
}

// Try to use source-map-explorer if source maps exist
if (hasSourceMaps) {
  console.log(
    "\n🔍 Attempting detailed analysis with source-map-explorer...\n"
  );
  console.log(
    "ℹ️  Note: Source maps có thể có warnings về 'column Infinity' - đây là bình thường và không ảnh hưởng đến phân tích.\n"
  );

  // Find main bundle
  const mainBundle =
    jsFiles.find((f) => f.includes("main")) ||
    jsFiles.find((f) => !f.includes("chunk")) ||
    jsFiles[0];

  if (mainBundle) {
    const mainPath = path.join(jsDir, mainBundle);
    const mapPath = `${mainPath}.map`;

    // Check if map file exists and is valid
    if (fs.existsSync(mapPath)) {
      try {
        console.log(`Analyzing: ${mainBundle}\n`);
        console.log(
          "ℹ️  Note: Có thể có warnings về 'column Infinity' - đây là bình thường và không ảnh hưởng.\n"
        );

        // Validate source map file exists and is valid JSON
        try {
          const mapContent = fs.readFileSync(mapPath, "utf8");
          JSON.parse(mapContent); // Validate it's valid JSON
        } catch (jsonError) {
          console.log(
            "\n⚠️  Source map file không hợp lệ (JSON syntax error)."
          );
          console.log("   Đang sử dụng phương pháp phân tích đơn giản...\n");
          throw new Error("Invalid JSON in source map");
        }

        // Use --no-open to prevent browser opening
        // Suppress stderr warnings about column Infinity but keep stdout
        try {
          execSync(`npx source-map-explorer "${mainPath}" --no-open`, {
            stdio: ["inherit", "inherit", "pipe"], // Suppress stderr warnings
            timeout: 30000,
          });
          console.log("\n✅ Analysis completed successfully!");
        } catch (execError) {
          // Check if it's a JSON syntax error
          const errorMsg = execError.message || execError.toString();
          if (errorMsg.includes("SyntaxError") || errorMsg.includes("JSON")) {
            console.log("\n⚠️  Source map có vấn đề về format JSON.");
            console.log("   Sử dụng phương pháp phân tích đơn giản...\n");
            throw new Error("JSON syntax error in source map");
          }
          // If exit code is non-zero but just warnings, still show fallback
          throw execError;
        }
      } catch (error) {
        const errorMsg = error.message || error.toString();

        // Check if it's a source map corruption issue
        if (
          errorMsg.includes("column Infinity") ||
          errorMsg.includes("source map") ||
          errorMsg.includes(
            "Check that you are using the correct source map"
          ) ||
          errorMsg.includes("only contains") ||
          errorMsg.includes("Command failed") ||
          errorMsg.includes("SyntaxError") ||
          errorMsg.includes("JSON") ||
          errorMsg.includes("Invalid source map") ||
          errorMsg.includes("JSON syntax error")
        ) {
          // Check specific error type
          if (
            errorMsg.includes("SyntaxError") ||
            errorMsg.includes("JSON") ||
            errorMsg.includes("Invalid JSON")
          ) {
            console.log(
              "\n⚠️  Source map có lỗi JSON syntax (corrupted or invalid format)."
            );
            console.log("   Đang sử dụng phương pháp phân tích đơn giản...\n");
          } else {
            console.log("\n⚠️  Source map có vấn đề (corrupted or invalid).");
            console.log(
              "   Source maps có warnings về 'column Infinity' - đây là vấn đề phổ biến."
            );
            console.log("   Đang sử dụng phương pháp phân tích đơn giản...\n");
          }

          // Fallback: Show bundle breakdown without source maps
          console.log("📦 Bundle Breakdown by Size:");

          // Sort files by size
          const sortedFiles = jsFiles
            .map((file) => {
              const filePath = path.join(jsDir, file);
              const stats = fs.statSync(filePath);
              return {
                name: file,
                size: stats.size,
                sizeKB: (stats.size / 1024).toFixed(2),
                sizeMB: (stats.size / (1024 * 1024)).toFixed(2),
                percentage: ((stats.size / totalSize) * 100).toFixed(1),
              };
            })
            .sort((a, b) => b.size - a.size);

          sortedFiles.forEach((file) => {
            const sizeDisplay =
              file.sizeMB > 1 ? `${file.sizeMB} MB` : `${file.sizeKB} KB`;
            console.log(
              `  ${file.name.padEnd(45)} ${sizeDisplay.padEnd(10)} (${file.percentage}%)`
            );
          });

          // Show top largest bundles
          console.log("\n🔝 Top 5 Largest Bundles:");
          sortedFiles.slice(0, 5).forEach((file, index) => {
            const sizeDisplay =
              file.sizeMB > 1 ? `${file.sizeMB} MB` : `${file.sizeKB} KB`;
            console.log(
              `  ${index + 1}. ${file.name.padEnd(43)} ${sizeDisplay.padEnd(10)} (${file.percentage}%)`
            );
          });

          console.log("\n💡 Lưu ý về warnings 'column Infinity':");
          console.log("   - Đây là warnings phổ biến từ webpack source maps");
          console.log("   - Không ảnh hưởng đến việc phân tích bundle");
          console.log(
            "   - Để tránh warnings, dùng: npm run analyze:webpack (không cần source maps)"
          );
          console.log("   - Hoặc: npm run analyze:size (phân tích đơn giản)");
        } else {
          console.log(
            "\n⚠️  source-map-explorer failed:",
            errorMsg.split("\n")[0]
          );
          console.log("   Using fallback analysis method...\n");

          // Show bundle breakdown as fallback
          const sortedFiles = jsFiles
            .map((file) => {
              const filePath = path.join(jsDir, file);
              const stats = fs.statSync(filePath);
              return {
                name: file,
                size: stats.size,
                sizeKB: (stats.size / 1024).toFixed(2),
                sizeMB: (stats.size / (1024 * 1024)).toFixed(2),
                percentage: ((stats.size / totalSize) * 100).toFixed(1),
              };
            })
            .sort((a, b) => b.size - a.size);

          console.log("📦 Bundle Breakdown (Top 10):");
          sortedFiles.slice(0, 10).forEach((file) => {
            const sizeDisplay =
              file.sizeMB > 1 ? `${file.sizeMB} MB` : `${file.sizeKB} KB`;
            console.log(
              `  ${file.name.padEnd(45)} ${sizeDisplay.padEnd(10)} (${file.percentage}%)`
            );
          });
        }
      }
    } else {
      console.log("\n⚠️  Source map file not found for main bundle.");
    }
  }
} else {
  console.log("\n📦 Bundle Breakdown by Size (sorted):");

  // Sort files by size for better analysis
  const sortedFiles = jsFiles
    .map((file) => {
      const filePath = path.join(jsDir, file);
      const stats = fs.statSync(filePath);
      return {
        name: file,
        size: stats.size,
        sizeKB: (stats.size / 1024).toFixed(2),
        sizeMB: (stats.size / (1024 * 1024)).toFixed(2),
        percentage: ((stats.size / totalSize) * 100).toFixed(1),
      };
    })
    .sort((a, b) => b.size - a.size);

  sortedFiles.forEach((file) => {
    const sizeDisplay =
      file.sizeMB > 1 ? `${file.sizeMB} MB` : `${file.sizeKB} KB`;
    console.log(
      `  ${file.name.padEnd(45)} ${sizeDisplay.padEnd(10)} (${file.percentage}%)`
    );
  });

  // Show top largest bundles
  console.log("\n🔝 Top 5 Largest Bundles:");
  sortedFiles.slice(0, 5).forEach((file, index) => {
    const sizeDisplay =
      file.sizeMB > 1 ? `${file.sizeMB} MB` : `${file.sizeKB} KB`;
    console.log(
      `  ${index + 1}. ${file.name.padEnd(43)} ${sizeDisplay.padEnd(10)} (${file.percentage}%)`
    );
  });

  console.log(
    "\n💡 Tip: Build with GENERATE_SOURCEMAP=true for detailed analysis"
  );
  console.log(
    "   Run: npm run analyze (it will automatically enable source maps)"
  );
  console.log(
    "   This will show which packages/modules are taking up space in each bundle"
  );
}
