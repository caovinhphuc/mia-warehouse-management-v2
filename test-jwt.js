const { google } = require("googleapis");
const fs = require("fs");
const path = require("path");

async function testServiceAccount() {
  try {
    console.log("🔍 Testing Service Account...\n");

    const keyPath = path.join(__dirname, "config/service-account-key.json");
    console.log(`📁 Reading from: ${keyPath}`);

    if (!fs.existsSync(keyPath)) {
      console.error("❌ File not found:", keyPath);
      return;
    }

    const key = JSON.parse(fs.readFileSync(keyPath, "utf8"));
    console.log(`✅ File loaded`);
    console.log(`📧 Email: ${key.client_email}`);
    console.log(`🆔 Project: ${key.project_id}`);
    console.log(`🔑 Private Key ID: ${key.private_key_id}\n`);

    // Create auth client
    const auth = new google.auth.JWT(key.client_email, null, key.private_key, [
      "https://www.googleapis.com/auth/drive.readonly",
      "https://www.googleapis.com/auth/spreadsheets.readonly",
    ]);

    console.log("🔐 Authenticating...");
    const authToken = await auth.authorize();
    console.log("✅ Authentication successful!");
    console.log(
      `🎫 Access Token: ${authToken.access_token.substring(0, 50)}...\n`
    );

    // Test Drive API
    console.log("🔍 Testing Google Drive API...");
    const drive = google.drive({ version: "v3", auth });
    const driveResponse = await drive.about.get({ fields: "user" });
    console.log("✅ Drive API working!");
    console.log(`👤 User: ${driveResponse.data.user.displayName}`);
    console.log(`📧 Email: ${driveResponse.data.user.emailAddress}\n`);

    // Test list files
    console.log("📂 Listing files...");
    const filesResponse = await drive.files.list({
      pageSize: 5,
      fields: "files(id, name, mimeType)",
    });

    if (filesResponse.data.files.length === 0) {
      console.log(
        "⚠️  No files found (may need to share sheets with service account)"
      );
    } else {
      console.log(`✅ Found ${filesResponse.data.files.length} files:`);
      filesResponse.data.files.forEach((file) => {
        console.log(`  - ${file.name} (${file.mimeType})`);
      });
    }

    console.log("\n✅ All tests passed!");
  } catch (error) {
    console.error("\n❌ Test failed:");
    console.error("Error:", error.message);
    if (error.response) {
      console.error("Response:", error.response.data);
    }
    console.error("\n📋 Possible causes:");
    console.error("1. Service account has been disabled/deleted");
    console.error("2. APIs not enabled in Google Cloud Console");
    console.error("3. Private key is invalid");
    console.error("4. Clock skew (time not synced)");
  }
}

testServiceAccount();
