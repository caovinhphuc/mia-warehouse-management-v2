const { google } = require("googleapis");
const fs = require("fs");
const path = require("path");

async function testAuth() {
  try {
    console.log("🔍 Testing Google Service Account Authentication...\n");

    // Load service account
    const serviceAccountPath = path.join(
      __dirname,
      "config",
      "service_account.json"
    );
    const credentials = JSON.parse(fs.readFileSync(serviceAccountPath, "utf8"));

    console.log("✅ Loaded service account:", credentials.client_email);
    console.log("📋 Project ID:", credentials.project_id);
    console.log(
      "🔑 Private Key ID:",
      credentials.private_key_id.substring(0, 20) + "..."
    );
    console.log("");

    // Create auth client
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
    console.log("✅ Authentication successful!");
    console.log("");

    // Test Sheets API with existing spreadsheet
    const sheets = google.sheets({ version: "v4", auth });
    const testSheetId = "18B1PIhCDmBWyHZytvOcfj_1QbYBwczLf1x1Qbu0E5As";

    console.log("📊 Testing Sheets API - Reading existing spreadsheet...");
    console.log("📄 Sheet ID:", testSheetId);

    const response = await sheets.spreadsheets.get({
      spreadsheetId: testSheetId,
    });

    console.log("✅ Successfully accessed spreadsheet!");
    console.log("📋 Title:", response.data.properties.title);
    console.log(
      "📊 Sheets:",
      response.data.sheets.map((s) => s.properties.title).join(", ")
    );
    console.log(
      "🔗 URL: https://docs.google.com/spreadsheets/d/" + testSheetId
    );
    console.log("");
    console.log(
      "🎉 All tests passed! Google credentials are working correctly."
    );
  } catch (error) {
    console.error("❌ Authentication failed:");
    console.error("Error:", error.message);
    if (error.response) {
      console.error("Response data:", error.response.data);
    }
    process.exit(1);
  }
}

testAuth();
