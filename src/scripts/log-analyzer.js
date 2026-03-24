#!/usr/bin/env node

/**
 * Log Analyzer
 * Analyzes log files for errors, patterns, and insights
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

function findLogFiles(logDir = "logs") {
  if (!fs.existsSync(logDir)) {
    return [];
  }

  const files = fs.readdirSync(logDir);
  return files
    .filter((file) => file.endsWith(".log"))
    .map((file) => path.join(logDir, file));
}

function analyzeLogFile(filePath) {
  const content = fs.readFileSync(filePath, "utf8");
  const lines = content.split("\n").filter((line) => line.trim());

  const analysis = {
    file: path.basename(filePath),
    totalLines: lines.length,
    errors: [],
    warnings: [],
    info: [],
    timestamps: [],
    errorCount: 0,
    warningCount: 0,
    infoCount: 0,
    patterns: {},
  };

  lines.forEach((line, index) => {
    const lowerLine = line.toLowerCase();

    // Count by level
    if (lowerLine.includes("error") || lowerLine.includes("❌")) {
      analysis.errorCount++;
      analysis.errors.push({ line: index + 1, content: line });
    } else if (lowerLine.includes("warn") || lowerLine.includes("⚠️")) {
      analysis.warningCount++;
      analysis.warnings.push({ line: index + 1, content: line });
    } else if (lowerLine.includes("info") || lowerLine.includes("ℹ️")) {
      analysis.infoCount++;
      analysis.info.push({ line: index + 1, content: line });
    }

    // Extract timestamps
    const timestampMatch = line.match(
      /\d{4}-\d{2}-\d{2}[\sT]\d{2}:\d{2}:\d{2}/
    );
    if (timestampMatch) {
      analysis.timestamps.push(timestampMatch[0]);
    }

    // Pattern detection
    if (lowerLine.includes("timeout")) {
      analysis.patterns.timeout = (analysis.patterns.timeout || 0) + 1;
    }
    if (lowerLine.includes("connection")) {
      analysis.patterns.connection = (analysis.patterns.connection || 0) + 1;
    }
    if (lowerLine.includes("failed")) {
      analysis.patterns.failed = (analysis.patterns.failed || 0) + 1;
    }
    if (lowerLine.includes("api")) {
      analysis.patterns.api = (analysis.patterns.api || 0) + 1;
    }
  });

  return analysis;
}

function generateReport(analyses) {
  log("\n📊 LOG ANALYSIS REPORT", "cyan");
  log("=".repeat(60), "cyan");

  let totalErrors = 0;
  let totalWarnings = 0;
  let totalLines = 0;

  analyses.forEach((analysis) => {
    totalErrors += analysis.errorCount;
    totalWarnings += analysis.warningCount;
    totalLines += analysis.totalLines;

    log(`\n📄 ${analysis.file}`, "blue");
    log(`   Total Lines: ${analysis.totalLines}`, "cyan");
    log(
      `   Errors: ${analysis.errorCount}`,
      analysis.errorCount > 0 ? "red" : "green"
    );
    log(
      `   Warnings: ${analysis.warningCount}`,
      analysis.warningCount > 0 ? "yellow" : "green"
    );
    log(`   Info: ${analysis.infoCount}`, "cyan");

    if (Object.keys(analysis.patterns).length > 0) {
      log(`   Patterns:`, "cyan");
      Object.entries(analysis.patterns).forEach(([pattern, count]) => {
        log(`     • ${pattern}: ${count}`, "yellow");
      });
    }

    if (analysis.errors.length > 0) {
      log(`   Recent Errors:`, "red");
      analysis.errors.slice(-5).forEach((error) => {
        log(
          `     Line ${error.line}: ${error.content.substring(0, 80)}...`,
          "red"
        );
      });
    }
  });

  log(`\n📈 SUMMARY`, "cyan");
  log(`   Total Files: ${analyses.length}`, "blue");
  log(`   Total Lines: ${totalLines}`, "blue");
  log(`   Total Errors: ${totalErrors}`, totalErrors > 0 ? "red" : "green");
  log(
    `   Total Warnings: ${totalWarnings}`,
    totalWarnings > 0 ? "yellow" : "green"
  );

  const errorRate =
    totalLines > 0 ? ((totalErrors / totalLines) * 100).toFixed(2) : 0;
  log(
    `   Error Rate: ${errorRate}%`,
    errorRate > 1 ? "red" : errorRate > 0.1 ? "yellow" : "green"
  );
}

function searchLogs(pattern, logDir = "logs") {
  const logFiles = findLogFiles(logDir);
  const results = [];

  logFiles.forEach((file) => {
    try {
      const content = fs.readFileSync(file, "utf8");
      const lines = content.split("\n");
      lines.forEach((line, index) => {
        if (line.toLowerCase().includes(pattern.toLowerCase())) {
          results.push({
            file: path.basename(file),
            line: index + 1,
            content: line,
          });
        }
      });
    } catch (error) {
      log(`Error reading ${file}: ${error.message}`, "red");
    }
  });

  return results;
}

function analyzeLogs(logDir = "logs", searchPattern = null) {
  log("🔍 Log Analyzer", "cyan");
  log("=".repeat(60), "cyan");

  if (searchPattern) {
    log(`\n🔎 Searching for: "${searchPattern}"`, "yellow");
    const results = searchLogs(searchPattern, logDir);

    if (results.length === 0) {
      log("   No matches found", "yellow");
    } else {
      log(`   Found ${results.length} matches:`, "green");
      results.slice(0, 20).forEach((result) => {
        log(
          `   ${result.file}:${result.line} - ${result.content.substring(
            0,
            80
          )}...`,
          "cyan"
        );
      });
      if (results.length > 20) {
        log(`   ... and ${results.length - 20} more`, "yellow");
      }
    }
    return;
  }

  const logFiles = findLogFiles(logDir);

  if (logFiles.length === 0) {
    log(`No log files found in ${logDir}`, "yellow");
    return;
  }

  log(`\nFound ${logFiles.length} log file(s)`, "green");

  const analyses = logFiles.map((file) => analyzeLogFile(file));
  generateReport(analyses);

  // Save report
  const report = {
    timestamp: new Date().toISOString(),
    logDir,
    files: analyses,
    summary: {
      totalFiles: analyses.length,
      totalLines: analyses.reduce((sum, a) => sum + a.totalLines, 0),
      totalErrors: analyses.reduce((sum, a) => sum + a.errorCount, 0),
      totalWarnings: analyses.reduce((sum, a) => sum + a.warningCount, 0),
    },
  };

  const reportFile = `log-analysis-${
    new Date().toISOString().split("T")[0]
  }.json`;
  fs.writeFileSync(reportFile, JSON.stringify(report, null, 2));
  log(`\n📄 Report saved to: ${reportFile}`, "cyan");
}

// Main execution
if (require.main === module) {
  const args = process.argv.slice(2);
  const logDir =
    args.find((arg) => arg.startsWith("--dir="))?.split("=")[1] || "logs";
  const searchPattern =
    args.find((arg) => arg.startsWith("--search="))?.split("=")[1] || null;

  analyzeLogs(logDir, searchPattern);
}

module.exports = { analyzeLogs, searchLogs, findLogFiles };
