/**
 * Alert Service - Backend
 * Handles Email and Telegram alerts
 */

const nodemailer = require("nodemailer");
const axios = require("axios");

class AlertService {
  constructor() {
    this.emailTransporter = null;
    this.telegramBotToken = process.env.TELEGRAM_BOT_TOKEN;
    this.telegramChatId = process.env.TELEGRAM_CHAT_ID;
    this.alertHistory = []; // In-memory storage (should use DB in production)
  }

  /**
   * Initialize email transporter
   */
  async initializeEmail() {
    try {
      // Check if SendGrid is configured - use SendGrid API directly
      if (process.env.SENDGRID_API_KEY) {
        // SendGrid will be handled via API, not SMTP
        this.useSendGridAPI = true;
        this.sendGridApiKey = process.env.SENDGRID_API_KEY;
        console.log("✅ Email service initialized (SendGrid API)");
        return true; // Skip SMTP verification for SendGrid
      } else if (process.env.SMTP_USER && process.env.SMTP_PASS) {
        // SMTP configuration
        this.emailTransporter = nodemailer.createTransport({
          host: process.env.SMTP_HOST || "smtp.gmail.com",
          port: parseInt(process.env.SMTP_PORT || "587"),
          secure: process.env.SMTP_SECURE === "true",
          auth: {
            user: process.env.SMTP_USER,
            pass: process.env.SMTP_PASS,
          },
        });
        console.log("✅ Email service initialized (SMTP)");
      } else {
        console.log("⚠️ Email service not configured");
        return false;
      }

      // Verify connection
      await this.emailTransporter.verify();
      return true;
    } catch (error) {
      console.error("❌ Email service initialization failed:", error.message);
      return false;
    }
  }

  /**
   * Send email alert
   */
  async sendEmailAlert(options) {
    try {
      const {
        to,
        subject,
        text,
        html,
        from = process.env.EMAIL_FROM || process.env.SENDGRID_FROM_EMAIL,
      } = options;

      // Use SendGrid API if configured
      if (this.useSendGridAPI && this.sendGridApiKey) {
        try {
          return await this.sendEmailViaSendGridAPI({
            to,
            from,
            subject,
            text,
            html,
          });
        } catch (error) {
          // If SendGrid fails (e.g., trial expired), fallback to SMTP
          console.log("⚠️ SendGrid failed, trying SMTP fallback...");
          console.log(`   Error: ${error.message}`);

          // Check if SMTP is available for fallback
          if (process.env.SMTP_USER && process.env.SMTP_PASS) {
            console.log("🔄 Falling back to SMTP...");
            // Continue to SMTP code below (don't return, let it fall through)
          } else {
            // No SMTP fallback available, throw error
            throw new Error(
              `SendGrid failed: ${error.message}. Please configure SMTP (SMTP_USER, SMTP_PASS) or upgrade SendGrid.`
            );
          }
        }
      }

      // Use SMTP for other providers
      if (!this.emailTransporter) {
        await this.initializeEmail();
      }

      if (!this.emailTransporter) {
        throw new Error("Email service not configured");
      }

      const mailOptions = {
        from: from || "noreply@mia.vn",
        to: Array.isArray(to) ? to.join(", ") : to,
        subject: subject || "Alert from MIA Logistics",
        text: text,
        html: html || text,
      };

      const result = await this.emailTransporter.sendMail(mailOptions);

      // Log alert
      this.logAlert({
        type: "email",
        to,
        subject,
        status: "success",
        messageId: result.messageId,
      });

      return {
        success: true,
        messageId: result.messageId,
        response: result.response,
      };
    } catch (error) {
      console.error("❌ Error sending email alert:", error);

      // Log failed alert
      this.logAlert({
        type: "email",
        to: options.to,
        subject: options.subject,
        status: "failed",
        error: error.message,
      });

      throw new Error(`Failed to send email: ${error.message}`);
    }
  }

  /**
   * Send Telegram alert
   */
  async sendTelegramAlert(options) {
    try {
      const {
        chatId = this.telegramChatId,
        message,
        parseMode = "HTML",
        disableNotification = false,
      } = options;

      if (!this.telegramBotToken) {
        throw new Error("Telegram bot token not configured");
      }

      if (!chatId) {
        throw new Error("Telegram chat ID not configured");
      }

      const url = `https://api.telegram.org/bot${this.telegramBotToken}/sendMessage`;

      const response = await axios.post(url, {
        chat_id: chatId,
        text: message,
        parse_mode: parseMode,
        disable_notification: disableNotification,
      });

      if (response.data.ok) {
        // Log alert
        this.logAlert({
          type: "telegram",
          chatId,
          message: message.substring(0, 100), // Truncate for logging
          status: "success",
          messageId: response.data.result.message_id,
        });

        return {
          success: true,
          messageId: response.data.result.message_id,
          chat: response.data.result.chat,
        };
      } else {
        throw new Error(
          response.data.description || "Failed to send Telegram message"
        );
      }
    } catch (error) {
      console.error("❌ Error sending Telegram alert:", error);

      // Log failed alert
      this.logAlert({
        type: "telegram",
        chatId: options.chatId || this.telegramChatId,
        message: options.message?.substring(0, 100),
        status: "failed",
        error: error.message,
      });

      throw new Error(`Failed to send Telegram alert: ${error.message}`);
    }
  }

  /**
   * Send alert to multiple channels
   */
  async sendMultiChannelAlert(options) {
    const { email, telegram, channels = ["email", "telegram"] } = options;

    const results = {
      email: null,
      telegram: null,
      errors: [],
    };

    // Send email if requested
    if (channels.includes("email") && email) {
      try {
        results.email = await this.sendEmailAlert(email);
      } catch (error) {
        results.errors.push({ channel: "email", error: error.message });
      }
    }

    // Send Telegram if requested
    if (channels.includes("telegram") && telegram) {
      try {
        results.telegram = await this.sendTelegramAlert(telegram);
      } catch (error) {
        results.errors.push({ channel: "telegram", error: error.message });
      }
    }

    return {
      success: results.errors.length === 0,
      results,
      errors: results.errors,
    };
  }

  /**
   * Get alert templates
   */
  getAlertTemplates() {
    return {
      low_threshold: {
        email: {
          subject: "⚠️ Low Threshold Alert",
          text: "The value has dropped below the threshold.",
        },
        telegram: {
          message:
            "⚠️ <b>Low Threshold Alert</b>\n\nThe value has dropped below the threshold.",
        },
      },
      high_threshold: {
        email: {
          subject: "🚨 High Threshold Alert",
          text: "The value has exceeded the threshold.",
        },
        telegram: {
          message:
            "🚨 <b>High Threshold Alert</b>\n\nThe value has exceeded the threshold.",
        },
      },
      error: {
        email: {
          subject: "❌ System Error",
          text: "An error occurred in the system.",
        },
        telegram: {
          message: "❌ <b>System Error</b>\n\nAn error occurred in the system.",
        },
      },
      success: {
        email: {
          subject: "✅ Operation Successful",
          text: "The operation completed successfully.",
        },
        telegram: {
          message:
            "✅ <b>Operation Successful</b>\n\nThe operation completed successfully.",
        },
      },
    };
  }

  /**
   * Log alert to history
   */
  logAlert(alert) {
    const logEntry = {
      ...alert,
      timestamp: new Date().toISOString(),
      id: Date.now().toString(),
    };

    this.alertHistory.push(logEntry);

    // Keep only last 1000 alerts in memory
    if (this.alertHistory.length > 1000) {
      this.alertHistory = this.alertHistory.slice(-1000);
    }

    return logEntry;
  }

  /**
   * Get alert history
   */
  getAlertHistory(filters = {}) {
    let history = [...this.alertHistory];

    // Filter by type
    if (filters.type) {
      history = history.filter((alert) => alert.type === filters.type);
    }

    // Filter by status
    if (filters.status) {
      history = history.filter((alert) => alert.status === filters.status);
    }

    // Filter by date range
    if (filters.startDate) {
      history = history.filter(
        (alert) => new Date(alert.timestamp) >= new Date(filters.startDate)
      );
    }

    if (filters.endDate) {
      history = history.filter(
        (alert) => new Date(alert.timestamp) <= new Date(filters.endDate)
      );
    }

    // Sort by timestamp (newest first)
    history.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));

    // Limit results
    const limit = filters.limit || 100;
    return history.slice(0, limit);
  }

  /**
   * Send email via SendGrid API
   */
  async sendEmailViaSendGridAPI(options) {
    try {
      const { to, from, subject, text, html } = options;

      const sendGridUrl = "https://api.sendgrid.com/v3/mail/send";
      const sendGridHeaders = {
        Authorization: `Bearer ${this.sendGridApiKey}`,
        "Content-Type": "application/json",
      };

      const emailData = {
        personalizations: [
          {
            to: Array.isArray(to)
              ? to.map((email) => ({ email }))
              : [{ email: to }],
          },
        ],
        from: {
          email: from || process.env.SENDGRID_FROM_EMAIL || "noreply@mia.vn",
          name: process.env.SENDGRID_FROM_NAME || "MIA Logistics",
        },
        subject: subject || "Alert from MIA Logistics",
        content: [
          {
            type: "text/plain",
            value: text || "",
          },
          {
            type: "text/html",
            value: html || text || "",
          },
        ],
      };

      const response = await axios.post(sendGridUrl, emailData, {
        headers: sendGridHeaders,
      });

      // Log alert
      this.logAlert({
        type: "email",
        to,
        subject,
        status: "success",
        messageId: response.headers["x-message-id"] || "sent",
      });

      return {
        success: true,
        messageId: response.headers["x-message-id"] || "sent",
        response: "Email sent via SendGrid API",
      };
    } catch (error) {
      console.error("❌ Error sending email via SendGrid API:", error);

      // Log failed alert
      this.logAlert({
        type: "email",
        to: options.to,
        subject: options.subject,
        status: "failed",
        error: error.response?.data?.errors?.[0]?.message || error.message,
      });

      throw new Error(
        `Failed to send email via SendGrid: ${
          error.response?.data?.errors?.[0]?.message || error.message
        }`
      );
    }
  }

  /**
   * Get alert statistics
   */
  getAlertStatistics() {
    const total = this.alertHistory.length;
    const byType = {};
    const byStatus = {};

    this.alertHistory.forEach((alert) => {
      // Count by type
      byType[alert.type] = (byType[alert.type] || 0) + 1;

      // Count by status
      byStatus[alert.status] = (byStatus[alert.status] || 0) + 1;
    });

    return {
      total,
      byType,
      byStatus,
      successRate:
        total > 0 ? (((byStatus.success || 0) / total) * 100).toFixed(2) : 0,
    };
  }
}

// Export singleton instance
const alertService = new AlertService();

// Initialize email service on startup
alertService.initializeEmail().catch((err) => {
  console.error("Failed to initialize email service:", err);
});

module.exports = alertService;
