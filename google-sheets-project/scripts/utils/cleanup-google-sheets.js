#!/usr/bin/env node
/**
 * Google Sheets Cleanup Script (Node.js)
 * Xóa các sheets không cần thiết từ Google Spreadsheet
 *
 * Usage:
 *   node scripts/utils/cleanup-google-sheets.js --list-only
 *   node scripts/utils/cleanup-google-sheets.js --dry-run --pattern "Verification_*"
 *   node scripts/utils/cleanup-google-sheets.js --delete --pattern "HealthCheck_*" --interactive
 */

const { google } = require("googleapis");
const path = require("path");
const fs = require("fs");
const readline = require("readline");

// Configuration
const DEFAULT_SPREADSHEET_ID =
  process.env.GOOGLE_SHEETS_SPREADSHEET_ID ||
  process.env.REACT_APP_GOOGLE_SHEETS_SPREADSHEET_ID ||
  "18B1PIhCDmBWyHZytvOcfj_1QbYBwczLf1x1Qbu0E5As";

// Sheets to keep (whitelist)
const SHEETS_TO_KEEP = [
  "HOME",
  "Orders",
  "Carriers",
  "Locations",
  "Transfers",
  "Settings",
  "Inventory",
  "Reports",
  "Sales",
  "VolumeRules",
  "InboundInternational",
  "InboundDomestic",
  "Users",
  "TransportRequests",
  "Roles",
  "RolePermissions",
  "Employees",
  "Logs",
  "TransportProposals",
  "Trips",
  "TransferSlips",
  "Dashboard",
  "Automation_Status",
  "Automation_Logs",
  "Config",
  "SLA_Rules",
  "User_Verification",
  "VerificationTokens",
  "User_Sessions",
  "Login_Logs",
  "MIA_Logistics_Data",
  "Dashboard_Summary",
  "System_Logs",
];

// Find credentials file
function findCredentials() {
  const possiblePaths = [
    process.env.GOOGLE_APPLICATION_CREDENTIALS,
    process.env.GOOGLE_SERVICE_ACCOUNT_KEY_PATH,
    path.join(__dirname, "../../../config/service_account.json"),
    path.join(__dirname, "../../../automation/config/service_account.json"),
    path.join(__dirname, "../../../automation/automation_new/config/service_account.json"),
    path.join(__dirname, "../../../mia-logistics-469406-eec521c603c0.json"),
  ];

  for (const filePath of possiblePaths) {
    if (filePath && fs.existsSync(filePath)) {
      return filePath;
    }
  }
  return null;
}

// Authenticate
async function authenticate() {
  const credsPath = findCredentials();
  if (!credsPath) {
    throw new Error(
      "Credentials file not found. Please set GOOGLE_APPLICATION_CREDENTIALS or place service_account.json in config/"
    );
  }

  const auth = new google.auth.GoogleAuth({
    keyFile: credsPath,
    scopes: [
      "https://www.googleapis.com/auth/spreadsheets",
      "https://www.googleapis.com/auth/drive",
    ],
  });

  const sheets = google.sheets({ version: "v4", auth });
  return sheets;
}

// List all sheets
async function listSheets(service, spreadsheetId) {
  try {
    const response = await service.spreadsheets.get({
      spreadsheetId,
    });

    const sheetsList = response.data.sheets.map((sheet) => ({
      sheetId: sheet.properties.sheetId,
      title: sheet.properties.title,
      rowCount: sheet.properties.gridProperties?.rowCount || 0,
      columnCount: sheet.properties.gridProperties?.columnCount || 0,
      index: sheet.properties.index,
    }));

    return sheetsList;
  } catch (error) {
    console.error("❌ Error listing sheets:", error.message);
    throw error;
  }
}

// Delete sheets
async function deleteSheets(service, spreadsheetId, sheetIds) {
  if (!sheetIds || sheetIds.length === 0) {
    console.log("⚠️  No sheets to delete");
    return;
  }

  const requests = sheetIds.map((sheetId) => ({
    deleteSheet: {
      sheetId: sheetId,
    },
  }));

  try {
    const response = await service.spreadsheets.batchUpdate({
      spreadsheetId,
      requestBody: {
        requests: requests,
      },
    });

    console.log(`✅ Successfully deleted ${requests.length} sheets`);
    return response.data;
  } catch (error) {
    console.error("❌ Error deleting sheets:", error.message);
    throw error;
  }
}

// Match pattern (simple wildcard)
function matchPattern(text, pattern) {
  if (!pattern) return false;
  const regex = new RegExp("^" + pattern.replace(/\*/g, ".*") + "$");
  return regex.test(text);
}

// Prompt for confirmation
function prompt(question) {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });

  return new Promise((resolve) => {
    rl.question(question, (answer) => {
      rl.close();
      resolve(answer.trim().toLowerCase());
    });
  });
}

// Main function
async function main() {
  const args = process.argv.slice(2);

  const options = {
    listOnly: args.includes("--list-only"),
    dryRun: args.includes("--dry-run"),
    interactive: args.includes("--interactive"),
    pattern: null,
    spreadsheetId: DEFAULT_SPREADSHEET_ID,
    keep: SHEETS_TO_KEEP,
  };

  // Parse pattern
  const patternIndex = args.indexOf("--pattern");
  if (patternIndex !== -1 && args[patternIndex + 1]) {
    options.pattern = args[patternIndex + 1];
  }

  // Parse spreadsheet ID
  const idIndex = args.indexOf("--spreadsheet-id");
  if (idIndex !== -1 && args[idIndex + 1]) {
    options.spreadsheetId = args[idIndex + 1];
  }

  console.log("🧹 Google Sheets Cleanup Script");
  console.log("=".repeat(60));
  console.log(`📊 Spreadsheet ID: ${options.spreadsheetId}`);
  console.log(`✅ Sheets to keep: ${options.keep.length} sheets`);
  if (options.pattern) {
    console.log(`🗑️  Delete pattern: ${options.pattern}`);
  }
  console.log();

  // Authenticate
  let service;
  try {
    service = await authenticate();
    console.log("✅ Authenticated with Google Sheets API");
  } catch (error) {
    console.error(`❌ Authentication failed: ${error.message}`);
    process.exit(1);
  }

  // List sheets
  let sheets;
  try {
    sheets = await listSheets(service, options.spreadsheetId);
    console.log(`\n📋 Found ${sheets.length} sheets:\n`);
  } catch (error) {
    console.error(`❌ Error listing sheets: ${error.message}`);
    process.exit(1);
  }

  // Categorize sheets
  const sheetsToDelete = [];
  const sheetsToKeep = [];

  for (const sheet of sheets) {
    const title = sheet.title;
    const shouldKeep = options.keep.includes(title);
    const matchesPattern = options.pattern ? matchPattern(title, options.pattern) : false;

    if (shouldKeep) {
      sheetsToKeep.push(sheet);
    } else if (options.pattern && !matchesPattern) {
      sheetsToKeep.push(sheet);
    } else {
      sheetsToDelete.push(sheet);
    }
  }

  // Display sheets
  for (const sheet of sheets) {
    const isToDelete = sheetsToDelete.some((s) => s.sheetId === sheet.sheetId);
    const status = isToDelete ? "🗑️  DELETE" : "✅ KEEP";
    console.log(`  ${status}: ${sheet.title} (ID: ${sheet.sheetId}, ${sheet.rowCount} rows)`);
  }

  console.log(`\n📊 Summary:`);
  console.log(`  ✅ Keep: ${sheetsToKeep.length} sheets`);
  console.log(`  🗑️  Delete: ${sheetsToDelete.length} sheets`);

  if (options.listOnly) {
    console.log("\n🔍 List-only mode, no deletions performed");
    return;
  }

  if (sheetsToDelete.length === 0) {
    console.log("\n✅ No sheets to delete");
    return;
  }

  // Confirm deletion
  if (options.dryRun) {
    console.log(`\n🔍 DRY RUN: Would delete ${sheetsToDelete.length} sheets:`);
    for (const sheet of sheetsToDelete) {
      console.log(`  - ${sheet.title} (ID: ${sheet.sheetId})`);
    }
    return;
  }

  if (options.interactive) {
    console.log(`\n⚠️  About to delete ${sheetsToDelete.length} sheets:`);
    for (const sheet of sheetsToDelete) {
      console.log(`  - ${sheet.title} (ID: ${sheet.sheetId})`);
    }
    const confirm = await prompt("\n❓ Continue? (yes/no): ");
    if (confirm !== "yes" && confirm !== "y") {
      console.log("❌ Cancelled");
      return;
    }
  }

  // Delete sheets
  const sheetIdsToDelete = sheetsToDelete.map((s) => s.sheetId);
  try {
    await deleteSheets(service, options.spreadsheetId, sheetIdsToDelete);
    console.log(`\n✅ Cleanup complete!`);
    console.log(`   Deleted: ${sheetsToDelete.length} sheets`);
    console.log(`   Kept: ${sheetsToKeep.length} sheets`);
  } catch (error) {
    console.error(`\n❌ Error during cleanup: ${error.message}`);
    process.exit(1);
  }
}

// Run
if (require.main === module) {
  main().catch((error) => {
    console.error("❌ Fatal error:", error);
    process.exit(1);
  });
}

module.exports = { listSheets, deleteSheets, authenticate };
