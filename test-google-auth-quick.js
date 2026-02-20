#!/usr/bin/env node

/**
 * Quick Test - Google Service Account Connection
 */

const { google } = require("googleapis");
const fs = require("fs");
const path = require("path");
require("dotenv").config();

async function testGoogleAuth() {
  console.log("🔍 Testing Google Service Account Authentication...\n");

  // 1. Check credentials file
  const credPath =
    process.env.GOOGLE_SERVICE_ACCOUNT_KEY_PATH ||
    "./automation/config/google-credentials.json";
  console.log(`📁 Credentials path: ${credPath}`);

  if (!fs.existsSync(credPath)) {
    console.error("❌ Credentials file not found!");
    process.exit(1);
  }
  console.log("✅ Credentials file exists\n");

  // 2. Load credentials
  const credentials = JSON.parse(fs.readFileSync(credPath, "utf8"));
  console.log("📋 Service Account Info:");
  console.log(`   Email: ${credentials.client_email}`);
  console.log(`   Project: ${credentials.project_id}`);
  console.log("");

  // 3. Create auth client
  try {
    const auth = new google.auth.JWT(
      credentials.client_email,
      null,
      credentials.private_key,
      [
        "https://www.googleapis.com/auth/spreadsheets",
        "https://www.googleapis.com/auth/drive",
      ]
    );

    console.log("🔐 Authenticating...");
    await auth.authorize();
    console.log("✅ Authentication successful!\n");

    // 4. Test Sheets API
    const sheets = google.sheets({ version: "v4", auth });
    const sheetId =
      process.env.GOOGLE_SHEET_ID ||
      process.env.VITE_GOOGLE_SHEETS_SPREADSHEET_ID;

    if (!sheetId) {
      console.log("⚠️  No GOOGLE_SHEET_ID configured, skipping sheets test");
    } else {
      console.log(`📊 Testing Sheets API with ID: ${sheetId}`);
      try {
        const response = await sheets.spreadsheets.get({
          spreadsheetId: sheetId,
        });
        console.log(
          `✅ Sheets API works! Title: ${response.data.properties.title}`
        );
        console.log(
          `   Sheets: ${response.data.sheets.map((s) => s.properties.title).join(", ")}`
        );
      } catch (error) {
        console.error("❌ Sheets API failed:", error.message);
        if (error.message.includes("not found")) {
          console.log(
            "\n💡 Tip: Make sure the spreadsheet exists and is shared with:"
          );
          console.log(`   ${credentials.client_email}`);
        }
      }
    }

    // 5. Test Drive API
    console.log("\n📁 Testing Drive API...");
    const drive = google.drive({ version: "v3", auth });
    try {
      const driveResponse = await drive.files.list({
        pageSize: 1,
        fields: "files(id, name)",
      });
      console.log("✅ Drive API works!");
      if (driveResponse.data.files && driveResponse.data.files.length > 0) {
        console.log(`   Sample file: ${driveResponse.data.files[0].name}`);
      }
    } catch (error) {
      console.error("❌ Drive API failed:", error.message);
    }

    console.log("\n✅ All tests completed!");
  } catch (error) {
    console.error("\n❌ Authentication failed:", error.message);
    if (error.message.includes("invalid_grant")) {
      console.log("\n💡 Possible issues:");
      console.log("   1. Service account has been deleted or disabled");
      console.log("   2. Private key is incorrect");
      console.log("   3. System clock is not synchronized");
      console.log("\n🔧 Solutions:");
      console.log(
        "   1. Go to Google Cloud Console > IAM & Admin > Service Accounts"
      );
      console.log("   2. Check if service account still exists");
      console.log("   3. Create a new service account key if needed");
    }
    process.exit(1);
  }
}

testGoogleAuth().catch(console.error);
