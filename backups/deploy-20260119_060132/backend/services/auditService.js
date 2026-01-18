/* eslint-disable */
/**
 * Audit Logging Service
 * Handles audit logging for compliance and security monitoring
 */

const fs = require("fs");
const path = require("path");
const {
  formatVietnameseDateTime,
  formatVietnameseDate,
} = require("../utils/dateUtils");

// Audit log storage (use database in production)
const auditLogs = [];
const MAX_LOG_SIZE = 10000; // Max logs in memory

// Audit log directory
const AUDIT_LOG_DIR = path.join(__dirname, "../logs/audit");

// Ensure log directory exists
if (!fs.existsSync(AUDIT_LOG_DIR)) {
  fs.mkdirSync(AUDIT_LOG_DIR, { recursive: true });
}

/**
 * Audit event types
 */
const AUDIT_EVENTS = {
  // Authentication events
  LOGIN_SUCCESS: "login:success",
  LOGIN_FAILURE: "login:failure",
  LOGOUT: "logout",
  MFA_ENABLED: "mfa:enabled",
  MFA_DISABLED: "mfa:disabled",
  MFA_VERIFIED: "mfa:verified",
  MFA_FAILED: "mfa:failed",
  SSO_LOGIN: "sso:login",
  PASSWORD_CHANGED: "password:changed",

  // Authorization events
  PERMISSION_DENIED: "permission:denied",
  ROLE_CHANGED: "role:changed",
  ACCESS_GRANTED: "access:granted",
  ACCESS_REVOKED: "access:revoked",

  // Data events
  DATA_READ: "data:read",
  DATA_WRITE: "data:write",
  DATA_DELETE: "data:delete",
  DATA_EXPORT: "data:export",

  // System events
  USER_CREATED: "user:created",
  USER_UPDATED: "user:updated",
  USER_DELETED: "user:deleted",
  CONFIG_CHANGED: "config:changed",
  SYSTEM_ERROR: "system:error",

  // Compliance events
  COMPLIANCE_CHECK: "compliance:check",
  DATA_BACKUP: "data:backup",
  DATA_RESTORE: "data:restore",
};

/**
 * Audit log severity levels
 */
const SEVERITY = {
  LOW: "low",
  MEDIUM: "medium",
  HIGH: "high",
  CRITICAL: "critical",
};

/**
 * Create audit log entry
 */
const createAuditLog = async (event) => {
  const now = new Date();
  const auditEntry = {
    id: generateId(),
    timestamp: now.toISOString(), // Keep ISO for sorting/comparison
    timestampFormatted: formatVietnameseDateTime(now), // Vietnamese format
    dateFormatted: formatVietnameseDate(now), // Vietnamese date only
    eventType: event.eventType || AUDIT_EVENTS.SYSTEM_ERROR,
    severity: event.severity || SEVERITY.MEDIUM,
    userId: event.userId || null,
    userEmail: event.userEmail || null,
    ipAddress: event.ipAddress || null,
    userAgent: event.userAgent || null,
    resource: event.resource || null,
    action: event.action || null,
    status: event.status || "success",
    details: event.details || {},
    metadata: event.metadata || {},
  };

  // Add to memory
  auditLogs.push(auditEntry);

  // Keep only last MAX_LOG_SIZE entries in memory
  if (auditLogs.length > MAX_LOG_SIZE) {
    auditLogs.shift();
  }

  // Write to file (async, non-blocking)
  writeAuditLogToFile(auditEntry).catch((err) => {
    console.error("Failed to write audit log to file:", err);
  });

  return auditEntry;
};

/**
 * Write audit log to file
 */
const writeAuditLogToFile = async (auditEntry) => {
  const date = new Date();
  const dateStr = date.toISOString().split("T")[0]; // YYYY-MM-DD
  const logFile = path.join(AUDIT_LOG_DIR, `audit-${dateStr}.log`);

  const logLine = JSON.stringify(auditEntry) + "\n";

  await fs.promises.appendFile(logFile, logLine, "utf8");
};

/**
 * Query audit logs
 */
const queryAuditLogs = (filters = {}) => {
  let results = [...auditLogs];

  // Filter by event type
  if (filters.eventType) {
    results = results.filter((log) => log.eventType === filters.eventType);
  }

  // Filter by userId
  if (filters.userId) {
    results = results.filter((log) => log.userId === filters.userId);
  }

  // Filter by userEmail
  if (filters.userEmail) {
    results = results.filter((log) => log.userEmail === filters.userEmail);
  }

  // Filter by severity
  if (filters.severity) {
    results = results.filter((log) => log.severity === filters.severity);
  }

  // Filter by date range
  if (filters.startDate) {
    results = results.filter((log) => log.timestamp >= filters.startDate);
  }

  if (filters.endDate) {
    results = results.filter((log) => log.timestamp <= filters.endDate);
  }

  // Filter by resource
  if (filters.resource) {
    results = results.filter((log) => log.resource === filters.resource);
  }

  // Sort by timestamp (newest first)
  results.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));

  // Limit results
  const limit = filters.limit || 100;
  results = results.slice(0, limit);

  return results;
};

/**
 * Get audit statistics
 */
const getAuditStatistics = (filters = {}) => {
  const logs = queryAuditLogs(filters);

  const stats = {
    total: logs.length,
    byEventType: {},
    bySeverity: {},
    byStatus: {},
    recentActivity: logs.slice(0, 10),
  };

  logs.forEach((log) => {
    // Count by event type
    stats.byEventType[log.eventType] =
      (stats.byEventType[log.eventType] || 0) + 1;

    // Count by severity
    stats.bySeverity[log.severity] = (stats.bySeverity[log.severity] || 0) + 1;

    // Count by status
    stats.byStatus[log.status] = (stats.byStatus[log.status] || 0) + 1;
  });

  return stats;
};

/**
 * Generate compliance report
 */
const generateComplianceReport = async (startDate, endDate) => {
  const logs = queryAuditLogs({
    startDate,
    endDate,
  });

  const report = {
    period: {
      startDate,
      endDate,
    },
    summary: {
      totalEvents: logs.length,
      authenticationEvents: logs.filter(
        (l) =>
          l.eventType.startsWith("login:") || l.eventType.startsWith("sso:")
      ).length,
      authorizationEvents: logs.filter(
        (l) =>
          l.eventType.startsWith("permission:") ||
          l.eventType.startsWith("access:")
      ).length,
      dataEvents: logs.filter((l) => l.eventType.startsWith("data:")).length,
      systemEvents: logs.filter((l) => l.eventType.startsWith("system:"))
        .length,
    },
    criticalEvents: logs.filter((l) => l.severity === SEVERITY.CRITICAL),
    failedAuthentications: logs.filter(
      (l) =>
        l.eventType === AUDIT_EVENTS.LOGIN_FAILURE ||
        l.eventType === AUDIT_EVENTS.MFA_FAILED
    ),
    permissionDenied: logs.filter(
      (l) => l.eventType === AUDIT_EVENTS.PERMISSION_DENIED
    ),
    dataAccess: logs.filter((l) => l.eventType.startsWith("data:")),
    generatedAt: new Date().toISOString(),
  };

  return report;
};

/**
 * Generate unique ID
 */
const generateId = () => {
  return `audit_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
};

module.exports = {
  AUDIT_EVENTS,
  SEVERITY,
  createAuditLog,
  queryAuditLogs,
  getAuditStatistics,
  generateComplianceReport,
};
