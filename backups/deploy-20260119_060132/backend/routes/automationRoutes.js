/* eslint-disable */
/**
 * Automation Routes - Backend API endpoints
 * Handles automation CRUD operations, execution, and logging
 */

const express = require("express");
const router = express.Router();

// In-memory storage for automations (in production, use database)
let automations = [
  {
    id: "auto_1",
    name: "Báo cáo hàng ngày",
    description: "Tự động gửi báo cáo hàng ngày lúc 8:00 sáng",
    trigger: {
      type: "schedule",
      schedule: "0 8 * * *",
      timezone: "Asia/Ho_Chi_Minh",
    },
    action: {
      type: "email",
      template: "daily_report",
      recipients: ["manager@mia.vn", "admin@mia.vn"],
    },
    status: "active",
    lastRun: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
    nextRun: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
    executions: 45,
    successRate: 98.5,
  },
  {
    id: "auto_2",
    name: "Backup dữ liệu",
    description: "Tự động backup dữ liệu Google Sheets hàng tuần",
    trigger: {
      type: "schedule",
      schedule: "0 2 * * 0",
      timezone: "Asia/Ho_Chi_Minh",
    },
    action: {
      type: "backup",
      source: "google_sheets",
      destination: "google_drive",
    },
    status: "active",
    lastRun: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
    nextRun: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
    executions: 8,
    successRate: 100,
  },
  {
    id: "auto_3",
    name: "Thông báo đơn hàng mới",
    description: "Gửi thông báo Telegram khi có đơn hàng mới",
    trigger: {
      type: "webhook",
      endpoint: "/webhook/new-order",
      method: "POST",
    },
    action: {
      type: "telegram",
      message: "Có đơn hàng mới: {order_id}",
      chatId: "-4818209867",
    },
    status: "active",
    lastRun: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
    nextRun: "N/A",
    executions: 23,
    successRate: 95.7,
  },
];

let executionLogs = [
  {
    id: 1,
    automationId: "auto_1",
    timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
    status: "success",
    message: "Báo cáo hàng ngày đã được gửi thành công",
    duration: "2.3s",
  },
  {
    id: 2,
    automationId: "auto_3",
    timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
    status: "success",
    message: "Thông báo đơn hàng #12345 đã được gửi",
    duration: "0.8s",
  },
  {
    id: 3,
    automationId: "auto_2",
    timestamp: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
    status: "success",
    message: "Backup dữ liệu hoàn thành",
    duration: "45.2s",
  },
];

// GET /api/automation - List all automations
router.get("/", (req, res) => {
  try {
    res.json({
      success: true,
      data: automations,
      count: automations.length,
    });
  } catch (error) {
    console.error("Error listing automations:", error);
    res.status(500).json({
      success: false,
      error: error.message || "Failed to list automations",
    });
  }
});

// GET /api/automation/:id - Get automation by ID
router.get("/:id", (req, res) => {
  try {
    const { id } = req.params;
    const automation = automations.find((a) => a.id === id);

    if (!automation) {
      return res.status(404).json({
        success: false,
        error: "Automation not found",
      });
    }

    res.json({
      success: true,
      data: automation,
    });
  } catch (error) {
    console.error("Error getting automation:", error);
    res.status(500).json({
      success: false,
      error: error.message || "Failed to get automation",
    });
  }
});

// POST /api/automation - Create new automation
router.post("/", (req, res) => {
  try {
    const { name, description, trigger, action, status } = req.body;

    if (!name || !trigger || !action) {
      return res.status(400).json({
        success: false,
        error: "Name, trigger, and action are required",
      });
    }

    const automation = {
      id: `auto_${Date.now()}`,
      name,
      description: description || "",
      trigger,
      action,
      status: status || "active",
      lastRun: null,
      nextRun:
        trigger.type === "schedule"
          ? new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString()
          : "N/A",
      executions: 0,
      successRate: 0,
      createdAt: new Date().toISOString(),
    };

    automations.push(automation);

    res.json({
      success: true,
      data: automation,
    });
  } catch (error) {
    console.error("Error creating automation:", error);
    res.status(500).json({
      success: false,
      error: error.message || "Failed to create automation",
    });
  }
});

// PUT /api/automation/:id - Update automation
router.put("/:id", (req, res) => {
  try {
    const { id } = req.params;
    const { name, description, trigger, action, status } = req.body;

    const index = automations.findIndex((a) => a.id === id);

    if (index === -1) {
      return res.status(404).json({
        success: false,
        error: "Automation not found",
      });
    }

    automations[index] = {
      ...automations[index],
      ...(name && { name }),
      ...(description !== undefined && { description }),
      ...(trigger && { trigger }),
      ...(action && { action }),
      ...(status && { status }),
      updatedAt: new Date().toISOString(),
    };

    res.json({
      success: true,
      data: automations[index],
    });
  } catch (error) {
    console.error("Error updating automation:", error);
    res.status(500).json({
      success: false,
      error: error.message || "Failed to update automation",
    });
  }
});

// DELETE /api/automation/:id - Delete automation
router.delete("/:id", (req, res) => {
  try {
    const { id } = req.params;
    const index = automations.findIndex((a) => a.id === id);

    if (index === -1) {
      return res.status(404).json({
        success: false,
        error: "Automation not found",
      });
    }

    automations.splice(index, 1);
    // Also remove related logs
    executionLogs = executionLogs.filter((log) => log.automationId !== id);

    res.json({
      success: true,
      message: "Automation deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting automation:", error);
    res.status(500).json({
      success: false,
      error: error.message || "Failed to delete automation",
    });
  }
});

// POST /api/automation/:id/toggle - Toggle automation status
router.post("/:id/toggle", (req, res) => {
  try {
    const { id } = req.params;
    const automation = automations.find((a) => a.id === id);

    if (!automation) {
      return res.status(404).json({
        success: false,
        error: "Automation not found",
      });
    }

    automation.status = automation.status === "active" ? "inactive" : "active";
    automation.updatedAt = new Date().toISOString();

    res.json({
      success: true,
      data: automation,
    });
  } catch (error) {
    console.error("Error toggling automation:", error);
    res.status(500).json({
      success: false,
      error: error.message || "Failed to toggle automation",
    });
  }
});

// POST /api/automation/:id/execute - Manually execute automation
router.post("/:id/execute", (req, res) => {
  try {
    const { id } = req.params;
    const automation = automations.find((a) => a.id === id);

    if (!automation) {
      return res.status(404).json({
        success: false,
        error: "Automation not found",
      });
    }

    // Simulate execution
    const log = {
      id: executionLogs.length + 1,
      automationId: id,
      timestamp: new Date().toISOString(),
      status: "success",
      message: `Automation "${automation.name}" executed successfully`,
      duration: `${(Math.random() * 5 + 0.5).toFixed(1)}s`,
    };

    executionLogs.unshift(log);

    // Update automation stats
    automation.executions += 1;
    automation.lastRun = new Date().toISOString();
    automation.successRate = (
      (automation.successRate * (automation.executions - 1) + 100) /
      automation.executions
    ).toFixed(1);

    res.json({
      success: true,
      data: log,
      automation: automation,
    });
  } catch (error) {
    console.error("Error executing automation:", error);
    res.status(500).json({
      success: false,
      error: error.message || "Failed to execute automation",
    });
  }
});

// GET /api/automation/:id/logs - Get execution logs for automation
router.get("/:id/logs", (req, res) => {
  try {
    const { id } = req.params;
    const logs = executionLogs.filter((log) => log.automationId === id);

    res.json({
      success: true,
      data: logs,
      count: logs.length,
    });
  } catch (error) {
    console.error("Error getting logs:", error);
    res.status(500).json({
      success: false,
      error: error.message || "Failed to get logs",
    });
  }
});

// GET /api/automation/logs/all - Get all execution logs
router.get("/logs/all", (req, res) => {
  try {
    res.json({
      success: true,
      data: executionLogs,
      count: executionLogs.length,
    });
  } catch (error) {
    console.error("Error getting all logs:", error);
    res.status(500).json({
      success: false,
      error: error.message || "Failed to get logs",
    });
  }
});

module.exports = router;
