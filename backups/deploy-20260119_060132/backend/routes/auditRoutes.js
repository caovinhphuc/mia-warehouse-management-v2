/* eslint-disable */
/**
 * Audit Logging Routes
 * Handles audit log queries and compliance reports
 */

const express = require("express");
const router = express.Router();

const { authenticate, requireRole } = require("../middleware/auth");
const auditService = require("../services/auditService");
const { formatVietnameseDateTime } = require("../utils/dateUtils");

/**
 * GET /api/audit/logs - Query audit logs
 * Requires authentication and admin role
 */
router.get("/logs", authenticate, requireRole("admin"), async (req, res) => {
  try {
    const {
      eventType,
      userId,
      userEmail,
      severity,
      startDate,
      endDate,
      resource,
      limit = 100,
    } = req.query;

    const filters = {
      eventType,
      userId,
      userEmail,
      severity,
      startDate,
      endDate,
      resource,
      limit: parseInt(limit, 10),
    };

    const logs = auditService.queryAuditLogs(filters);

    // Add Vietnamese formatted timestamps to logs
    const logsWithVietnameseFormat = logs.map((log) => ({
      ...log,
      timestampFormatted:
        log.timestampFormatted || formatVietnameseDateTime(log.timestamp),
      dateFormatted:
        log.dateFormatted ||
        formatVietnameseDateTime(log.timestamp).split(" ")[0],
    }));

    res.json({
      success: true,
      data: {
        logs: logsWithVietnameseFormat,
        count: logsWithVietnameseFormat.length,
        queriedAt: formatVietnameseDateTime(new Date()),
      },
    });
  } catch (error) {
    console.error("Query audit logs error:", error);
    res.status(500).json({
      success: false,
      error: "Failed to query audit logs",
    });
  }
});

/**
 * GET /api/audit/statistics - Get audit statistics
 * Requires authentication and admin role
 */
router.get(
  "/statistics",
  authenticate,
  requireRole("admin"),
  async (req, res) => {
    try {
      const filters = {
        startDate: req.query.startDate,
        endDate: req.query.endDate,
      };

      const statistics = auditService.getAuditStatistics(filters);

      // Format recent activity timestamps
      if (statistics.recentActivity) {
        statistics.recentActivity = statistics.recentActivity.map((log) => ({
          ...log,
          timestampFormatted:
            log.timestampFormatted || formatVietnameseDateTime(log.timestamp),
        }));
      }

      res.json({
        success: true,
        data: {
          ...statistics,
          generatedAt: formatVietnameseDateTime(new Date()),
        },
      });
    } catch (error) {
      console.error("Get audit statistics error:", error);
      res.status(500).json({
        success: false,
        error: "Failed to get audit statistics",
      });
    }
  }
);

/**
 * POST /api/audit/compliance/report - Generate compliance report
 * Requires authentication and admin role
 */
router.post(
  "/compliance/report",
  authenticate,
  requireRole("admin"),
  async (req, res) => {
    try {
      const { startDate, endDate } = req.body;

      if (!startDate || !endDate) {
        return res.status(400).json({
          success: false,
          error: "Start date and end date are required",
        });
      }

      const report = await auditService.generateComplianceReport(
        startDate,
        endDate
      );

      // Format report dates
      report.period.startDateFormatted = formatVietnameseDateTime(
        new Date(startDate)
      );
      report.period.endDateFormatted = formatVietnameseDateTime(
        new Date(endDate)
      );

      // Format critical events and other timestamps
      if (report.criticalEvents) {
        report.criticalEvents = report.criticalEvents.map((log) => ({
          ...log,
          timestampFormatted:
            log.timestampFormatted || formatVietnameseDateTime(log.timestamp),
        }));
      }

      if (report.failedAuthentications) {
        report.failedAuthentications = report.failedAuthentications.map(
          (log) => ({
            ...log,
            timestampFormatted:
              log.timestampFormatted || formatVietnameseDateTime(log.timestamp),
          })
        );
      }

      // Audit log
      await auditService.createAuditLog({
        eventType: auditService.AUDIT_EVENTS.COMPLIANCE_CHECK,
        userId: req.userId,
        userEmail: req.userEmail,
        ipAddress: req.ip,
        userAgent: req.get("user-agent"),
        resource: "compliance_report",
        action: "generate",
        status: "success",
        details: { startDate, endDate },
      });

      res.json({
        success: true,
        data: {
          ...report,
          generatedAtFormatted: formatVietnameseDateTime(new Date()),
        },
      });
    } catch (error) {
      console.error("Generate compliance report error:", error);
      res.status(500).json({
        success: false,
        error: "Failed to generate compliance report",
      });
    }
  }
);

module.exports = router;
