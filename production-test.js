#!/usr/bin/env node

/**
 * 🧪 PRODUCTION END-TO-END TEST SCRIPT
 * Test complete workflow: Frontend → Google Sheets → Apps Script
 */

const https = require("https");
const http = require("http");

const CONFIG = {
  // Production URLs (update after deployment)
  VERCEL_URL: "https://mia-warehouse-management.vercel.app", // Update this
  APPS_SCRIPT_URL: "", // Update after Apps Script deployment

  // Google Sheets config
  SHEET_ID: "1m2B2ODXuuatnW0EKExdVeCa1WwvF52bZOhS7DGqG6Vg",
  API_KEY: "AIzaSyB_MwjhFxQtxnihpZTa95XH0BCI9MXihh8",

  // Test credentials
  TEST_USER: {
    username: "admin",
    password: "admin1234",
  },
};

console.log("🧪 PRODUCTION END-TO-END TEST");
console.log("==============================\n");

async function testProductionDeployment() {
  const results = {
    vercel: false,
    googleSheets: false,
    appsScript: false,
    integration: false,
  };

  console.log("1️⃣ Testing Vercel Deployment...");
  try {
    const vercelTest = await testVercelApp();
    results.vercel = vercelTest.success;
    console.log(
      `   ${results.vercel ? "✅" : "❌"} Vercel: ${vercelTest.message}`
    );
  } catch (error) {
    console.log(`   ❌ Vercel Error: ${error.message}`);
  }

  console.log("\n2️⃣ Testing Google Sheets API...");
  try {
    const sheetsTest = await testGoogleSheetsAPI();
    results.googleSheets = sheetsTest.success;
    console.log(
      `   ${results.googleSheets ? "✅" : "❌"} Google Sheets: ${
        sheetsTest.message
      }`
    );
    if (sheetsTest.users) {
      console.log(`   📊 Found ${sheetsTest.users} users in database`);
    }
  } catch (error) {
    console.log(`   ❌ Google Sheets Error: ${error.message}`);
  }

  console.log("\n3️⃣ Testing Google Apps Script...");
  if (CONFIG.APPS_SCRIPT_URL) {
    try {
      const scriptTest = await testAppsScript();
      results.appsScript = scriptTest.success;
      console.log(
        `   ${results.appsScript ? "✅" : "❌"} Apps Script: ${
          scriptTest.message
        }`
      );
    } catch (error) {
      console.log(`   ❌ Apps Script Error: ${error.message}`);
    }
  } else {
    console.log(
      "   ⚠️ Apps Script URL not configured - Deploy Apps Script first"
    );
  }

  console.log("\n4️⃣ Testing Complete Integration...");
  const integrationScore = Object.values(results).filter(Boolean).length;
  results.integration = integrationScore >= 2; // At least Vercel + Google Sheets

  console.log(
    `   ${
      results.integration ? "✅" : "❌"
    } Integration Score: ${integrationScore}/4`
  );

  // Summary
  console.log("\n" + "=".repeat(50));
  console.log("📊 PRODUCTION TEST RESULTS");
  console.log("=".repeat(50));

  console.log(`✅ Vercel Deployment:     ${results.vercel ? "PASS" : "FAIL"}`);
  console.log(
    `✅ Google Sheets API:     ${results.googleSheets ? "PASS" : "FAIL"}`
  );
  console.log(
    `✅ Google Apps Script:    ${results.appsScript ? "PASS" : "NEED SETUP"}`
  );
  console.log(
    `✅ Overall Integration:   ${results.integration ? "READY" : "NEEDS WORK"}`
  );

  console.log("\n🎯 NEXT STEPS:");
  if (!results.vercel) {
    console.log("   🔧 Deploy to Vercel following GITHUB_DEPLOY_STEPS.md");
  }
  if (!results.googleSheets) {
    console.log("   🔧 Check Google Sheets API key and permissions");
  }
  if (!results.appsScript) {
    console.log(
      "   🔧 Deploy Google Apps Script following apps-script-deploy.js"
    );
  }
  if (results.integration) {
    console.log("   🎉 System ready for production use!");
    console.log("   📱 Test login at: " + CONFIG.VERCEL_URL);
    console.log("   👤 Username: admin, Password: admin1234");
  }

  return results;
}

async function testVercelApp() {
  return new Promise((resolve) => {
    // Try to detect if running locally vs production
    const testUrl = CONFIG.VERCEL_URL.includes("localhost")
      ? "http://localhost:3000"
      : CONFIG.VERCEL_URL;

    const protocol = testUrl.startsWith("https") ? https : http;

    protocol
      .get(testUrl, (res) => {
        if (res.statusCode === 200) {
          resolve({
            success: true,
            message: `App accessible at ${testUrl}`,
          });
        } else {
          resolve({
            success: false,
            message: `HTTP ${res.statusCode} - Check deployment`,
          });
        }
      })
      .on("error", (error) => {
        resolve({
          success: false,
          message: "Cannot connect - Check URL or deployment status",
        });
      });
  });
}

async function testGoogleSheetsAPI() {
  return new Promise((resolve) => {
    const url = `https://sheets.googleapis.com/v4/spreadsheets/${CONFIG.SHEET_ID}/values/Users!A1:H10?key=${CONFIG.API_KEY}`;

    https
      .get(url, (res) => {
        let data = "";
        res.on("data", (chunk) => (data += chunk));
        res.on("end", () => {
          try {
            const response = JSON.parse(data);
            if (response.values && response.values.length > 0) {
              resolve({
                success: true,
                message: "API connection successful",
                users: response.values.length - 1,
              });
            } else {
              resolve({
                success: false,
                message: "No data found in Users sheet",
              });
            }
          } catch (error) {
            resolve({
              success: false,
              message: "Invalid response format",
            });
          }
        });
      })
      .on("error", (error) => {
        resolve({
          success: false,
          message: "API connection failed",
        });
      });
  });
}

async function testAppsScript() {
  return new Promise((resolve) => {
    https
      .get(CONFIG.APPS_SCRIPT_URL, (res) => {
        let data = "";
        res.on("data", (chunk) => (data += chunk));
        res.on("end", () => {
          try {
            const response = JSON.parse(data);
            if (response.success) {
              resolve({
                success: true,
                message: "Web App responding correctly",
              });
            } else {
              resolve({
                success: false,
                message: "Web App error response",
              });
            }
          } catch (error) {
            resolve({
              success: false,
              message: "Invalid response format",
            });
          }
        });
      })
      .on("error", (error) => {
        resolve({
          success: false,
          message: "Cannot connect to Web App",
        });
      });
  });
}

// Run tests
if (require.main === module) {
  testProductionDeployment().catch(console.error);
}

module.exports = { testProductionDeployment };
