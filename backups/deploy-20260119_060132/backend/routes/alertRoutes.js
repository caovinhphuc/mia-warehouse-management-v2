/**
 * Alert Routes - Backend API
 * Handles alert-related endpoints
 */

const express = require("express");
const router = express.Router();
const alertService = require("../services/alertService");

/**
 * POST /api/alerts/email
 * Send email alert
 */
router.post("/email", async (req, res) => {
  console.log("📥 POST /api/alerts/email - Request received");
  console.log("📋 Body:", req.body);

  try {
    const { to, subject, text, html, from } = req.body;

    if (!to) {
      return res.status(400).json({
        success: false,
        error: "Recipient email (to) is required",
      });
    }

    if (!subject && !text && !html) {
      return res.status(400).json({
        success: false,
        error: "Subject or message content is required",
      });
    }

    const result = await alertService.sendEmailAlert({
      to,
      subject,
      text,
      html,
      from,
    });

    console.log("✅ Email alert sent successfully");
    res.json({
      success: true,
      data: result,
    });
  } catch (error) {
    console.error("❌ Error sending email alert:", error);
    res.status(500).json({
      success: false,
      error: error.message || "Failed to send email alert",
    });
  }
});

/**
 * POST /api/alerts/telegram
 * Send Telegram alert
 */
router.post("/telegram", async (req, res) => {
  console.log("📥 POST /api/alerts/telegram - Request received");
  console.log("📋 Body:", req.body);

  try {
    const { chatId, message, parseMode, disableNotification } = req.body;

    if (!message) {
      return res.status(400).json({
        success: false,
        error: "Message is required",
      });
    }

    const result = await alertService.sendTelegramAlert({
      chatId,
      message,
      parseMode,
      disableNotification,
    });

    console.log("✅ Telegram alert sent successfully");
    res.json({
      success: true,
      data: result,
    });
  } catch (error) {
    console.error("❌ Error sending Telegram alert:", error);
    res.status(500).json({
      success: false,
      error: error.message || "Failed to send Telegram alert",
    });
  }
});

/**
 * POST /api/alerts/send
 * Send alert to multiple channels
 */
router.post("/send", async (req, res) => {
  console.log("📥 POST /api/alerts/send - Request received");
  console.log("📋 Body:", req.body);

  try {
    const { email, telegram, channels } = req.body;

    if (!email && !telegram) {
      return res.status(400).json({
        success: false,
        error: "At least one channel (email or telegram) is required",
      });
    }

    const result = await alertService.sendMultiChannelAlert({
      email,
      telegram,
      channels: channels || ["email", "telegram"],
    });

    console.log("✅ Multi-channel alert sent");
    res.json({
      success: result.success,
      data: result.results,
      errors: result.errors,
    });
  } catch (error) {
    console.error("❌ Error sending multi-channel alert:", error);
    res.status(500).json({
      success: false,
      error: error.message || "Failed to send alert",
    });
  }
});

/**
 * GET /api/alerts/history
 * Get alert history
 */
router.get("/history", async (req, res) => {
  console.log("📥 GET /api/alerts/history - Request received");
  console.log("📋 Query:", req.query);

  try {
    const filters = {
      type: req.query.type,
      status: req.query.status,
      startDate: req.query.startDate,
      endDate: req.query.endDate,
      limit: req.query.limit ? parseInt(req.query.limit) : 100,
    };

    const history = alertService.getAlertHistory(filters);

    res.json({
      success: true,
      data: history,
      count: history.length,
    });
  } catch (error) {
    console.error("❌ Error getting alert history:", error);
    res.status(500).json({
      success: false,
      error: error.message || "Failed to get alert history",
    });
  }
});

/**
 * GET /api/alerts/statistics
 * Get alert statistics
 */
router.get("/statistics", async (req, res) => {
  console.log("📥 GET /api/alerts/statistics - Request received");

  try {
    const statistics = alertService.getAlertStatistics();

    res.json({
      success: true,
      data: statistics,
    });
  } catch (error) {
    console.error("❌ Error getting alert statistics:", error);
    res.status(500).json({
      success: false,
      error: error.message || "Failed to get alert statistics",
    });
  }
});

/**
 * GET /api/alerts/templates
 * Get alert templates
 */
router.get("/templates", async (req, res) => {
  console.log("📥 GET /api/alerts/templates - Request received");

  try {
    const templates = alertService.getAlertTemplates();

    res.json({
      success: true,
      data: templates,
    });
  } catch (error) {
    console.error("❌ Error getting alert templates:", error);
    res.status(500).json({
      success: false,
      error: error.message || "Failed to get alert templates",
    });
  }
});

/**
 * POST /api/alerts/test
 * Test alert system
 */
router.post("/test", async (req, res) => {
  console.log("📥 POST /api/alerts/test - Request received");
  console.log("📋 Body:", req.body);

  try {
    const { channel = "all" } = req.body;
    const results = {};

    // Test email
    if (channel === "all" || channel === "email") {
      try {
        const emailResult = await alertService.sendEmailAlert({
          to: process.env.EMAIL_FROM || process.env.SENDGRID_FROM_EMAIL,
          subject: "🧪 Test Email Alert",
          text: "This is a test email alert from MIA Logistics system.",
          html: "<p>This is a <b>test email alert</b> from MIA Logistics system.</p>",
        });
        results.email = { success: true, data: emailResult };
      } catch (error) {
        results.email = { success: false, error: error.message };
      }
    }

    // Test Telegram
    if (channel === "all" || channel === "telegram") {
      try {
        const telegramResult = await alertService.sendTelegramAlert({
          message:
            "🧪 <b>Test Telegram Alert</b>\n\nThis is a test alert from MIA Logistics system.",
        });
        results.telegram = { success: true, data: telegramResult };
      } catch (error) {
        results.telegram = { success: false, error: error.message };
      }
    }

    const allSuccess = Object.values(results).every((r) => r.success);

    res.json({
      success: allSuccess,
      data: results,
    });
  } catch (error) {
    console.error("❌ Error testing alerts:", error);
    res.status(500).json({
      success: false,
      error: error.message || "Failed to test alerts",
    });
  }
});

module.exports = router;
