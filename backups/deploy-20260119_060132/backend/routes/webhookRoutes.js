/* eslint-disable */
/**
 * Webhook Routes - Backend API endpoints for webhook triggers
 * Handles incoming webhook requests from external services
 */

const express = require("express");
const router = express.Router();

// Store webhook registrations (in production, use database)
const webhookRegistrations = new Map();

// POST /api/webhook/:event - Generic webhook endpoint
router.post("/:event", async (req, res) => {
  try {
    const { event } = req.params;
    const payload = req.body;
    const headers = req.headers;

    console.log(`📥 Webhook received: ${event}`, {
      timestamp: new Date().toISOString(),
      payload: payload,
      headers: {
        "user-agent": headers["user-agent"],
        "content-type": headers["content-type"],
      },
    });

    // Find automations triggered by this webhook
    const automations = require("./automationRoutes").getAutomationsByTrigger(
      "webhook",
      event
    );

    if (automations.length === 0) {
      return res.status(200).json({
        success: true,
        message: `Webhook received but no automations found for event: ${event}`,
      });
    }

    // Execute each automation
    const results = [];
    for (const automation of automations) {
      try {
        // Simulate automation execution
        const result = await executeAutomation(automation, payload);
        results.push({
          automationId: automation.id,
          automationName: automation.name,
          success: true,
          result: result,
        });
      } catch (error) {
        results.push({
          automationId: automation.id,
          automationName: automation.name,
          success: false,
          error: error.message,
        });
      }
    }

    res.json({
      success: true,
      event: event,
      automationsTriggered: results.length,
      results: results,
    });
  } catch (error) {
    console.error("Error processing webhook:", error);
    res.status(500).json({
      success: false,
      error: error.message || "Failed to process webhook",
    });
  }
});

// POST /api/webhook/register - Register a webhook
router.post("/register", (req, res) => {
  try {
    const { event, url, secret, description } = req.body;

    if (!event || !url) {
      return res.status(400).json({
        success: false,
        error: "Event and URL are required",
      });
    }

    const webhookId = `webhook_${Date.now()}_${Math.random()
      .toString(36)
      .substr(2, 9)}`;
    const registration = {
      id: webhookId,
      event: event,
      url: url,
      secret: secret || null,
      description: description || "",
      createdAt: new Date().toISOString(),
      active: true,
    };

    webhookRegistrations.set(webhookId, registration);

    res.json({
      success: true,
      data: registration,
    });
  } catch (error) {
    console.error("Error registering webhook:", error);
    res.status(500).json({
      success: false,
      error: error.message || "Failed to register webhook",
    });
  }
});

// GET /api/webhook/list - List all registered webhooks
router.get("/list", (req, res) => {
  try {
    const webhooks = Array.from(webhookRegistrations.values());
    res.json({
      success: true,
      data: webhooks,
    });
  } catch (error) {
    console.error("Error listing webhooks:", error);
    res.status(500).json({
      success: false,
      error: error.message || "Failed to list webhooks",
    });
  }
});

// DELETE /api/webhook/:id - Unregister a webhook
router.delete("/:id", (req, res) => {
  try {
    const { id } = req.params;
    const webhook = webhookRegistrations.get(id);

    if (!webhook) {
      return res.status(404).json({
        success: false,
        error: "Webhook not found",
      });
    }

    webhookRegistrations.delete(id);
    res.json({
      success: true,
      message: "Webhook unregistered successfully",
    });
  } catch (error) {
    console.error("Error unregistering webhook:", error);
    res.status(500).json({
      success: false,
      error: error.message || "Failed to unregister webhook",
    });
  }
});

// Helper function to execute automation
async function executeAutomation(automation, payload) {
  // This is a placeholder - implement actual automation execution logic
  console.log(`🚀 Executing automation: ${automation.name}`, {
    automationId: automation.id,
    payload: payload,
  });

  // Simulate execution
  return {
    executed: true,
    timestamp: new Date().toISOString(),
    payload: payload,
  };
}

module.exports = router;
