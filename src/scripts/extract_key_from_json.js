#!/usr/bin/env node

/**
 * Extract GOOGLE_PRIVATE_KEY from Service Account JSON file
 * Usage: node extract_key_from_json.js <path-to-json-file>
 */

const fs = require("fs");
const path = require("path");

const jsonPath = process.argv[2];

if (!jsonPath) {
  console.error("❌ Usage: node extract_key_from_json.js <path-to-json-file>");
  console.error(
    "   Example: node extract_key_from_json.js ./service-account.json"
  );
  process.exit(1);
}

if (!fs.existsSync(jsonPath)) {
  console.error(`❌ File not found: ${jsonPath}`);
  process.exit(1);
}

try {
  const jsonContent = fs.readFileSync(jsonPath, "utf8");
  const credentials = JSON.parse(jsonContent);

  if (!credentials.private_key) {
    console.error("❌ private_key not found in JSON file");
    process.exit(1);
  }

  const privateKey = credentials.private_key;

  console.log("✅ Extracted GOOGLE_PRIVATE_KEY:");
  console.log("================================");
  console.log("");
  console.log("Key length:", privateKey.length, "characters");
  console.log("");
  console.log("Add this to your .env file:");
  console.log("");
  console.log('GOOGLE_PRIVATE_KEY="' + privateKey.replace(/\n/g, "\\n") + '"');
  console.log("");
  console.log("Or run this command to update automatically:");
  console.log("");
  console.log(
    `echo 'GOOGLE_PRIVATE_KEY="${privateKey.replace(/\n/g, "\\n")}"' >> .env`
  );

  // Also extract other useful fields
  console.log("");
  console.log("Other fields from JSON:");
  console.log("----------------------");
  if (credentials.project_id)
    console.log(`GOOGLE_PROJECT_ID=${credentials.project_id}`);
  if (credentials.private_key_id)
    console.log(`GOOGLE_PRIVATE_KEY_ID=${credentials.private_key_id}`);
  if (credentials.client_email)
    console.log(`GOOGLE_SERVICE_ACCOUNT_EMAIL=${credentials.client_email}`);
  if (credentials.client_id)
    console.log(`GOOGLE_CLIENT_ID=${credentials.client_id}`);
} catch (error) {
  console.error("❌ Error reading JSON file:", error.message);
  process.exit(1);
}
