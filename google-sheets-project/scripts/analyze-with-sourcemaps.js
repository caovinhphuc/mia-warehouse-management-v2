#!/usr/bin/env node

const fs = require("fs");
const path = require("path");
const { execSync } = require("child_process");

const projectRoot = path.resolve(__dirname, "..");
const buildDir = path.join(projectRoot, "build");
const jsDir = path.join(buildDir, "static", "js");
const fallbackStatsScript = path.resolve(projectRoot, "..", "scripts", "generate-bundle-stats.js");
const analyzeAllChunks = process.argv.includes("--all-chunks");

const log = (message) => console.log(message);

function quote(p) {
  return `"${p.replace(/"/g, '\\"')}"`;
}

function cleanBuildDirectory() {
  fs.rmSync(buildDir, { recursive: true, force: true });
}

function buildWithSourceMaps() {
  execSync("react-scripts build", {
    cwd: projectRoot,
    stdio: "inherit",
    env: { ...process.env, GENERATE_SOURCEMAP: "true" },
  });
}

function getLatestMainBundle() {
  if (!fs.existsSync(jsDir)) {
    return null;
  }

  const candidates = fs
    .readdirSync(jsDir)
    .filter((name) => /^main\..+\.js$/.test(name) && !name.endsWith(".map"))
    .map((name) => {
      const filePath = path.join(jsDir, name);
      return {
        name,
        filePath,
        mapPath: `${filePath}.map`,
        mtimeMs: fs.statSync(filePath).mtimeMs,
      };
    })
    .sort((a, b) => b.mtimeMs - a.mtimeMs);

  const withMaps = candidates.filter((item) => fs.existsSync(item.mapPath));
  return withMaps[0] || null;
}

function getAllBundlesWithMaps() {
  if (!fs.existsSync(jsDir)) {
    return [];
  }

  return fs
    .readdirSync(jsDir)
    .filter((name) => /\.js$/.test(name) && !name.endsWith(".map"))
    .map((name) => {
      const filePath = path.join(jsDir, name);
      return {
        name,
        filePath,
        mapPath: `${filePath}.map`,
      };
    })
    .filter((item) => fs.existsSync(item.mapPath))
    .sort((a, b) => a.name.localeCompare(b.name));
}

function runSourceMapExplorer(bundleFilePaths) {
  const args = bundleFilePaths.map((filePath) => quote(filePath)).join(" ");
  const output = execSync(`npx source-map-explorer ${args}`, {
    cwd: projectRoot,
    encoding: "utf8",
    stdio: ["ignore", "pipe", "pipe"],
  });

  if (output) {
    process.stdout.write(output);
  }
}

function runFallbackStats() {
  if (!fs.existsSync(fallbackStatsScript)) {
    log("⚠️ Fallback stats script not found. Skipping fallback analysis.");
    return;
  }

  log("\n🔄 Falling back to enhanced bundle stats analysis...");
  execSync(`node ${quote(fallbackStatsScript)}`, {
    cwd: projectRoot,
    stdio: "inherit",
  });
}

function isKnownSourceMapExplorerIssue(error) {
  const text = [error?.message, error?.stderr, error?.stdout]
    .filter(Boolean)
    .map((item) => String(item))
    .join("\n");
  return (
    text.includes("generated column Infinity") ||
    text.includes("Unable to find a source map") ||
    text.includes("Check that you are using the correct source map")
  );
}

function main() {
  log("🧭 Analyze bundle with source maps");
  cleanBuildDirectory();
  buildWithSourceMaps();

  const bundleTargets = analyzeAllChunks
    ? getAllBundlesWithMaps().map((item) => item.filePath)
    : (() => {
        const mainBundle = getLatestMainBundle();
        return mainBundle ? [mainBundle.filePath] : [];
      })();

  if (bundleTargets.length === 0) {
    log("❌ No bundle with source map found after build.");
    process.exit(1);
  }

  try {
    runSourceMapExplorer(bundleTargets);
  } catch (error) {
    if (isKnownSourceMapExplorerIssue(error)) {
      if (error?.stdout) {
        process.stdout.write(String(error.stdout));
      }
      if (error?.stderr) {
        process.stderr.write(String(error.stderr));
      }
      log(
        "\n⚠️ source-map-explorer reported a known sourcemap parsing issue (common on newer Node versions)."
      );
      runFallbackStats();
      process.exit(0);
    }

    throw error;
  }
}

try {
  main();
} catch (error) {
  console.error("\n❌ Analyze failed:", error?.message || error);
  process.exit(1);
}
