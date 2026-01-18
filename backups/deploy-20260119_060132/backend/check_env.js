// Check Environment Variables for Backend
require("dotenv").config();

const requiredVars = [
  "GOOGLE_PROJECT_ID",
  "GOOGLE_PRIVATE_KEY_ID",
  "GOOGLE_PRIVATE_KEY",
  "GOOGLE_SERVICE_ACCOUNT_EMAIL",
  "GOOGLE_CLIENT_ID",
];

const optionalVars = [
  "GOOGLE_SHEET_ID",
  "VITE_GOOGLE_SHEETS_SPREADSHEET_ID",
  "GOOGLE_DRIVE_FOLDER_ID",
];

console.log("🔍 Checking Environment Variables...\n");

let allGood = true;

// Check required
console.log("Required Variables:");
requiredVars.forEach((varName) => {
  const value = process.env[varName];
  if (value) {
    const displayValue = varName.includes("KEY") ? "***" : value;
    console.log(`  ✅ ${varName}: ${displayValue.substring(0, 50)}...`);
  } else {
    console.log(`  ❌ ${varName}: MISSING`);
    allGood = false;
  }
});

// Check optional
console.log("\nOptional Variables:");
optionalVars.forEach((varName) => {
  const value = process.env[varName];
  if (value) {
    console.log(`  ✅ ${varName}: ${value}`);
  } else {
    console.log(`  ⚠️  ${varName}: Not set (will use default)`);
  }
});

console.log(
  "\n" +
    (allGood
      ? "✅ All required variables are set!"
      : "❌ Some required variables are missing!")
);
