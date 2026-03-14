#!/usr/bin/env node

/**
 * Uptime Monitor
 * Monitors multiple services and tracks uptime, response times, and alerts
 */

const https = require("https");
const http = require("http");
const { URL } = require("url");

// Configuration
const CONFIG = {
  services: [
    {
      name: "Frontend",
      url: process.env.FRONTEND_URL || "http://localhost:3000",
      interval: 60000, // 1 minute
      timeout: 5000,
    },
    {
      name: "Backend API",
      url: process.env.BACKEND_URL || "http://localhost:3001/health",
      interval: 60000,
      timeout: 5000,
    },
    {
      name: "Automation API",
      url: process.env.AUTOMATION_URL || "http://localhost:8000/health",
      interval: 60000,
      timeout: 5000,
    },
  ],
  alertThresholds: {
    downTime: 60000, // 1 minute
    slowResponse: 1000, // 1 second
    errorRate: 0.1, // 10%
  },
  webhook: process.env.ALERT_WEBHOOK || null,
  email: process.env.ALERT_EMAIL || null,
};

// State tracking
const serviceStates = {};
const metrics = {
  checks: {},
  uptime: {},
  responseTimes: {},
  errors: {},
};

// Colors for console
const colors = {
  reset: "\x1b[0m",
  green: "\x1b[32m",
  yellow: "\x1b[33m",
  red: "\x1b[31m",
  cyan: "\x1b[36m",
  blue: "\x1b[34m",
};

function log(message, color = "reset") {
  const timestamp = new Date().toISOString();
  console.log(`${colors[color]}[${timestamp}] ${message}${colors.reset}`);
}

function makeRequest(url) {
  return new Promise((resolve, reject) => {
    const parsedUrl = new URL(url);
    const client = parsedUrl.protocol === "https:" ? https : http;
    const options = {
      hostname: parsedUrl.hostname,
      port: parsedUrl.port || (parsedUrl.protocol === "https:" ? 443 : 80),
      path: parsedUrl.pathname + parsedUrl.search,
      method: "GET",
      timeout: CONFIG.services.find((s) => s.url === url)?.timeout || 5000,
    };

    const startTime = Date.now();
    const req = client.request(options, (res) => {
      const responseTime = Date.now() - startTime;
      let data = "";

      res.on("data", (chunk) => {
        data += chunk;
      });

      res.on("end", () => {
        resolve({
          status: res.statusCode,
          responseTime,
          data: data,
          success: res.statusCode >= 200 && res.statusCode < 300,
        });
      });
    });

    req.on("error", (error) => {
      reject({
        error: error.message,
        responseTime: Date.now() - startTime,
        success: false,
      });
    });

    req.on("timeout", () => {
      req.destroy();
      reject({
        error: "Request timeout",
        responseTime: Date.now() - startTime,
        success: false,
      });
    });

    req.end();
  });
}

function initializeService(service) {
  if (!metrics.checks[service.name]) {
    metrics.checks[service.name] = { total: 0, successful: 0, failed: 0 };
    metrics.uptime[service.name] = { startTime: Date.now(), downTime: 0 };
    metrics.responseTimes[service.name] = [];
    metrics.errors[service.name] = [];
    serviceStates[service.name] = { status: "unknown", lastCheck: null };
  }
}

function calculateUptime(serviceName) {
  const uptime = metrics.uptime[serviceName];
  const totalTime = Date.now() - uptime.startTime;
  const upTime = totalTime - uptime.downTime;
  return totalTime > 0 ? (upTime / totalTime) * 100 : 100;
}

function calculateAverageResponseTime(serviceName) {
  const times = metrics.responseTimes[serviceName];
  if (times.length === 0) return 0;
  const sum = times.reduce((a, b) => a + b, 0);
  return Math.round(sum / times.length);
}

function checkService(service) {
  initializeService(service);

  makeRequest(service.url)
    .then((result) => {
      const now = Date.now();
      metrics.checks[service.name].total++;
      metrics.responseTimes[service.name].push(result.responseTime);

      // Keep only last 100 response times
      if (metrics.responseTimes[service.name].length > 100) {
        metrics.responseTimes[service.name].shift();
      }

      if (result.success) {
        metrics.checks[service.name].successful++;
        const previousStatus = serviceStates[service.name].status;

        if (previousStatus === "down") {
          // Service recovered
          const downDuration =
            now - (serviceStates[service.name].downSince || now);
          metrics.uptime[service.name].downTime += downDuration;
          log(
            `✅ ${service.name} recovered after ${Math.round(downDuration / 1000)}s`,
            "green"
          );
          sendAlert(service.name, "recovered", `Service is back online`);
        }

        serviceStates[service.name] = {
          status: result.responseTime > service.timeout ? "slow" : "up",
          lastCheck: now,
          responseTime: result.responseTime,
        };

        if (result.responseTime > CONFIG.alertThresholds.slowResponse) {
          log(
            `⚠️  ${service.name} slow response: ${result.responseTime}ms`,
            "yellow"
          );
        } else {
          log(`✅ ${service.name} OK (${result.responseTime}ms)`, "green");
        }
      } else {
        metrics.checks[service.name].failed++;
        handleServiceDown(service, now, `HTTP ${result.status}`);
      }
    })
    .catch((error) => {
      const now = Date.now();
      metrics.checks[service.name].total++;
      metrics.checks[service.name].failed++;
      metrics.errors[service.name].push({
        timestamp: now,
        error: error.error || error.message,
      });

      // Keep only last 50 errors
      if (metrics.errors[service.name].length > 50) {
        metrics.errors[service.name].shift();
      }

      handleServiceDown(service, now, error.error || error.message);
    });
}

function handleServiceDown(service, timestamp, reason) {
  const previousStatus = serviceStates[service.name]?.status;
  const downSince = serviceStates[service.name]?.downSince || timestamp;

  serviceStates[service.name] = {
    status: "down",
    lastCheck: timestamp,
    downSince: downSince,
    error: reason,
  };

  const downDuration = timestamp - downSince;

  if (previousStatus !== "down") {
    // Service just went down
    log(`❌ ${service.name} is DOWN: ${reason}`, "red");
  }

  if (
    downDuration >= CONFIG.alertThresholds.downTime &&
    previousStatus !== "down"
  ) {
    sendAlert(
      service.name,
      "critical",
      `Service has been down for ${Math.round(downDuration / 1000)}s: ${reason}`
    );
  }
}

function sendAlert(serviceName, level, message) {
  const alert = {
    service: serviceName,
    level: level,
    message: message,
    timestamp: new Date().toISOString(),
  };

  // Console alert
  const color =
    level === "critical" ? "red" : level === "warning" ? "yellow" : "green";
  log(`🚨 ALERT [${level.toUpperCase()}]: ${serviceName} - ${message}`, color);

  // Webhook alert
  if (CONFIG.webhook) {
    fetch(CONFIG.webhook, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(alert),
    }).catch((err) => {
      log(`Failed to send webhook alert: ${err.message}`, "yellow");
    });
  }

  // Email alert (via webhook or direct)
  if (CONFIG.email && level === "critical") {
    // Email would be sent via webhook integration
    log(`📧 Email alert would be sent to ${CONFIG.email}`, "cyan");
  }
}

function printStatus() {
  console.log("\n" + "=".repeat(60));
  log("📊 UPTIME MONITOR STATUS", "cyan");
  console.log("=".repeat(60));

  CONFIG.services.forEach((service) => {
    const state = serviceStates[service.name];
    const checks = metrics.checks[service.name];
    const uptime = calculateUptime(service.name);
    const avgResponse = calculateAverageResponseTime(service.name);
    const errorRate =
      checks.total > 0
        ? ((checks.failed / checks.total) * 100).toFixed(2)
        : "0.00";

    const statusColor =
      state.status === "up"
        ? "green"
        : state.status === "down"
          ? "red"
          : "yellow";

    log(`\n${service.name}:`, "cyan");
    log(`  Status: ${state.status.toUpperCase()}`, statusColor);
    log(`  Uptime: ${uptime.toFixed(2)}%`, "blue");
    log(`  Checks: ${checks.successful}/${checks.total} successful`, "blue");
    log(`  Error Rate: ${errorRate}%`, errorRate > 10 ? "red" : "blue");
    log(`  Avg Response: ${avgResponse}ms`, "blue");
    if (state.responseTime) {
      log(`  Last Response: ${state.responseTime}ms`, "blue");
    }
    if (state.error) {
      log(`  Last Error: ${state.error}`, "red");
    }
  });

  console.log("\n" + "=".repeat(60) + "\n");
}

// Start monitoring
function startMonitoring() {
  log("🚀 Starting Uptime Monitor...", "cyan");
  log(`Monitoring ${CONFIG.services.length} services`, "cyan");

  // Initial check
  CONFIG.services.forEach((service) => {
    checkService(service);
  });

  // Set up intervals
  CONFIG.services.forEach((service) => {
    setInterval(() => {
      checkService(service);
    }, service.interval);
  });

  // Print status every 5 minutes
  setInterval(
    () => {
      printStatus();
    },
    5 * 60 * 1000
  );

  // Print initial status after 30 seconds
  setTimeout(() => {
    printStatus();
  }, 30000);
}

// Handle graceful shutdown
process.on("SIGINT", () => {
  log("\n🛑 Shutting down monitor...", "yellow");
  printStatus();
  process.exit(0);
});

process.on("SIGTERM", () => {
  log("\n🛑 Shutting down monitor...", "yellow");
  printStatus();
  process.exit(0);
});

// Start
if (require.main === module) {
  startMonitoring();
}

module.exports = { startMonitoring, CONFIG, metrics, serviceStates };
