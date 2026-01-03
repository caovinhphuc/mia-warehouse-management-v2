/**
 * Test Alert System
 * Run: node tests/testAlerts.js
 */

const axios = require("axios");
const path = require("path");

// Load .env from project root (parent directory)
require("dotenv").config({ path: path.join(__dirname, "../../.env") });

const API_BASE_URL = process.env.API_BASE_URL || "http://localhost:3001/api";

// Colors for console
const colors = {
  reset: "\x1b[0m",
  green: "\x1b[32m",
  red: "\x1b[31m",
  yellow: "\x1b[33m",
  blue: "\x1b[34m",
  cyan: "\x1b[36m",
};

const log = {
  success: (msg) => console.log(`${colors.green}✅ ${msg}${colors.reset}`),
  error: (msg) => console.log(`${colors.red}❌ ${msg}${colors.reset}`),
  info: (msg) => console.log(`${colors.blue}ℹ️  ${msg}${colors.reset}`),
  test: (msg) => console.log(`${colors.cyan}🧪 ${msg}${colors.reset}`),
};

async function testAlertSystem() {
  console.log("\n🧪 TESTING ALERT SYSTEM\n");
  console.log("=".repeat(50));

  let passed = 0;
  let failed = 0;

  // Test 1: Get Templates
  log.test("Test 1: Get Alert Templates");
  try {
    const response = await axios.get(`${API_BASE_URL}/alerts/templates`);
    if (response.data.success && response.data.data) {
      log.success("Templates retrieved successfully");
      console.log(
        `   Templates: ${Object.keys(response.data.data).join(", ")}`
      );
      passed++;
    } else {
      throw new Error("Invalid response");
    }
  } catch (error) {
    log.error(`Failed: ${error.message}`);
    failed++;
  }

  // Test 2: Get Statistics (should be empty initially)
  log.test("\nTest 2: Get Alert Statistics");
  try {
    const response = await axios.get(`${API_BASE_URL}/alerts/statistics`);
    if (response.data.success) {
      log.success("Statistics retrieved successfully");
      console.log(`   Total alerts: ${response.data.data.total}`);
      passed++;
    } else {
      throw new Error("Invalid response");
    }
  } catch (error) {
    log.error(`Failed: ${error.message}`);
    failed++;
  }

  // Test 3: Get History (should be empty initially)
  log.test("\nTest 3: Get Alert History");
  try {
    const response = await axios.get(`${API_BASE_URL}/alerts/history`);
    if (response.data.success) {
      log.success("History retrieved successfully");
      console.log(`   History count: ${response.data.count}`);
      passed++;
    } else {
      throw new Error("Invalid response");
    }
  } catch (error) {
    log.error(`Failed: ${error.message}`);
    failed++;
  }

  // Test 4: Test Email Alert (if configured)
  log.test("\nTest 4: Test Email Alert");
  try {
    const response = await axios.post(`${API_BASE_URL}/alerts/test`, {
      channel: "email",
    });
    if (response.data.success && response.data.data.email) {
      if (response.data.data.email.success) {
        log.success("Email alert sent successfully");
        passed++;
      } else {
        log.error(`Email failed: ${response.data.data.email.error}`);
        console.log("   ⚠️  Email service may not be configured");
        failed++;
      }
    } else {
      throw new Error("Invalid response");
    }
  } catch (error) {
    log.error(`Failed: ${error.message}`);
    console.log("   ⚠️  Email service may not be configured");
    failed++;
  }

  // Test 5: Test Telegram Alert (if configured)
  log.test("\nTest 5: Test Telegram Alert");
  try {
    const response = await axios.post(`${API_BASE_URL}/alerts/test`, {
      channel: "telegram",
    });
    if (response.data.success && response.data.data.telegram) {
      if (response.data.data.telegram.success) {
        log.success("Telegram alert sent successfully");
        passed++;
      } else {
        log.error(`Telegram failed: ${response.data.data.telegram.error}`);
        console.log("   ⚠️  Telegram service may not be configured");
        failed++;
      }
    } else {
      throw new Error("Invalid response");
    }
  } catch (error) {
    log.error(`Failed: ${error.message}`);
    console.log("   ⚠️  Telegram service may not be configured");
    failed++;
  }

  // Test 6: Send Custom Email Alert
  log.test("\nTest 6: Send Custom Email Alert");
  try {
    // Try multiple email env vars
    const emailTo =
      process.env.TEST_EMAIL ||
      process.env.EMAIL_FROM ||
      process.env.SENDGRID_FROM_EMAIL ||
      process.env.REACT_APP_EMAIL_FROM;
    if (!emailTo) {
      log.info("Skipping - No test email configured");
      console.log(
        "   Set TEST_EMAIL, EMAIL_FROM, or SENDGRID_FROM_EMAIL to test"
      );
    } else {
      const response = await axios.post(`${API_BASE_URL}/alerts/email`, {
        to: emailTo,
        subject: "🧪 Test Alert from MIA Logistics",
        text: "This is a test email alert from the Alert System.",
        html: "<p>This is a <b>test email alert</b> from the Alert System.</p>",
      });
      if (response.data.success) {
        log.success("Custom email alert sent successfully");
        console.log(`   Message ID: ${response.data.data.messageId}`);
        passed++;
      } else {
        throw new Error("Invalid response");
      }
    }
  } catch (error) {
    log.error(`Failed: ${error.message}`);
    failed++;
  }

  // Test 7: Send Custom Telegram Alert
  log.test("\nTest 7: Send Custom Telegram Alert");
  try {
    if (!process.env.TELEGRAM_BOT_TOKEN || !process.env.TELEGRAM_CHAT_ID) {
      log.info("Skipping - Telegram not configured");
      console.log("   Set TELEGRAM_BOT_TOKEN and TELEGRAM_CHAT_ID to test");
    } else {
      const response = await axios.post(`${API_BASE_URL}/alerts/telegram`, {
        message:
          "🧪 <b>Test Alert</b>\n\nThis is a test Telegram alert from MIA Logistics system.",
      });
      if (response.data.success) {
        log.success("Custom Telegram alert sent successfully");
        console.log(`   Message ID: ${response.data.data.messageId}`);
        passed++;
      } else {
        throw new Error("Invalid response");
      }
    }
  } catch (error) {
    log.error(`Failed: ${error.message}`);
    failed++;
  }

  // Test 8: Multi-channel Alert
  log.test("\nTest 8: Multi-channel Alert");
  try {
    // Try multiple email env vars
    const emailTo =
      process.env.TEST_EMAIL ||
      process.env.EMAIL_FROM ||
      process.env.SENDGRID_FROM_EMAIL ||
      process.env.REACT_APP_EMAIL_FROM;
    const hasEmail = !!emailTo;
    const hasTelegram = !!(
      process.env.TELEGRAM_BOT_TOKEN && process.env.TELEGRAM_CHAT_ID
    );

    if (!hasEmail && !hasTelegram) {
      log.info("Skipping - No channels configured");
      console.log("   Configure email or telegram to test");
    } else {
      const response = await axios.post(`${API_BASE_URL}/alerts/send`, {
        email: hasEmail
          ? {
              to: emailTo,
              subject: "🧪 Multi-channel Test",
              text: "This is a multi-channel test alert.",
            }
          : null,
        telegram: hasTelegram
          ? {
              message:
                "🧪 <b>Multi-channel Test</b>\n\nThis is a multi-channel test alert.",
            }
          : null,
        channels: [hasEmail && "email", hasTelegram && "telegram"].filter(
          Boolean
        ),
      });

      if (response.data.success || response.data.errors.length === 0) {
        log.success("Multi-channel alert sent");
        if (response.data.data.email) {
          console.log(
            `   Email: ${response.data.data.email.success ? "✅" : "❌"}`
          );
        }
        if (response.data.data.telegram) {
          console.log(
            `   Telegram: ${response.data.data.telegram.success ? "✅" : "❌"}`
          );
        }
        passed++;
      } else {
        throw new Error("Some channels failed");
      }
    }
  } catch (error) {
    log.error(`Failed: ${error.message}`);
    failed++;
  }

  // Test 9: Get Updated Statistics
  log.test("\nTest 9: Get Updated Statistics");
  try {
    const response = await axios.get(`${API_BASE_URL}/alerts/statistics`);
    if (response.data.success) {
      log.success("Updated statistics retrieved");
      const stats = response.data.data;
      console.log(`   Total: ${stats.total}`);
      console.log(`   Success Rate: ${stats.successRate}%`);
      if (stats.byType) {
        console.log(`   By Type: ${JSON.stringify(stats.byType)}`);
      }
      passed++;
    } else {
      throw new Error("Invalid response");
    }
  } catch (error) {
    log.error(`Failed: ${error.message}`);
    failed++;
  }

  // Summary
  console.log("\n" + "=".repeat(50));
  console.log("\n📊 TEST SUMMARY\n");
  console.log(`${colors.green}✅ Passed: ${passed}${colors.reset}`);
  console.log(`${colors.red}❌ Failed: ${failed}${colors.reset}`);
  console.log(`📈 Total: ${passed + failed}\n`);

  if (failed === 0) {
    log.success("All tests passed! 🎉");
    process.exit(0);
  } else {
    log.error("Some tests failed");
    process.exit(1);
  }
}

// Run tests
testAlertSystem().catch((error) => {
  log.error(`Test suite failed: ${error.message}`);
  console.error(error);
  process.exit(1);
});
