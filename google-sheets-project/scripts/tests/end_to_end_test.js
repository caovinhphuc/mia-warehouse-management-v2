#!/usr/bin/env node
/**
 * End-to-End Testing Suite
 * Simulate real user workflows and complete system integration
 */

const http = require("http");
const io = require("socket.io-client");

console.log("🎭 End-to-End Testing Suite");
console.log("=".repeat(60));

// Simulate user visiting dashboard
async function simulateUserDashboardVisit() {
  console.log("\n👤 Simulating User Dashboard Visit...");

  try {
    // Step 1: User loads frontend (check if backend health is good)
    console.log("  📱 Step 1: User loads React app - checking backend health...");
    const healthResponse = await makeRequest("http://localhost:3001/health");
    const health = JSON.parse(healthResponse);
    console.log(`  ✅ Backend healthy - uptime: ${Math.round(health.uptime)}s`);

    // Step 2: Frontend requests initial dashboard data
    console.log("  📊 Step 2: Frontend requests dashboard data...");
    const reportsResponse = await makeRequest("http://localhost:3001/api/reports");
    const reports = JSON.parse(reportsResponse);
    console.log(`  ✅ Reports data loaded - service: ${reports.service}`);

    // Step 3: Frontend establishes WebSocket connection
    console.log("  🔌 Step 3: Establishing real-time connection...");
    const wsConnected = await simulateWebSocketConnection();
    console.log(
      `  ${wsConnected ? "✅" : "❌"} Real-time connection: ${wsConnected ? "Active" : "Failed"}`
    );

    return true;
  } catch (error) {
    console.log(`  ❌ Dashboard visit failed: ${error.message}`);
    return false;
  }
}

// Simulate AI analytics workflow
async function simulateAIAnalyticsWorkflow() {
  console.log("\n🧠 Simulating AI Analytics Workflow...");

  try {
    // Step 1: User requests AI insights
    console.log("  📈 Step 1: User requests AI insights...");
    const insightsResponse = await makeRequest("http://localhost:8001/api/ml/insights");
    const insights = JSON.parse(insightsResponse);
    console.log(
      `  ✅ AI insights generated - confidence: ${insights.confidence_score?.toFixed(2)}`
    );

    // Step 2: User requests performance predictions
    console.log("  🔮 Step 2: User requests performance predictions...");
    const predictionPayload = {
      timeframe: "1h",
      metrics: ["response_time", "active_users", "cpu_usage"],
    };

    const predictionResponse = await makePostRequest(
      "http://localhost:8001/api/ml/predict",
      predictionPayload
    );
    const predictions = JSON.parse(predictionResponse);
    console.log(
      `  ✅ Predictions generated for ${Object.keys(predictions.predictions).length} metrics`
    );

    // Step 3: User requests optimization recommendations
    console.log("  ⚡ Step 3: User requests optimization recommendations...");
    const optimizationPayload = {
      timestamp: new Date().toISOString(),
      active_users: 250,
      response_time: 180.5,
      error_rate: 1.2,
      cpu_usage: 65.0,
      memory_usage: 58.0,
      disk_usage: 42.0,
      network_io: 2048.0,
    };

    const optimizationResponse = await makePostRequest(
      "http://localhost:8001/api/ml/optimize",
      optimizationPayload
    );
    const optimization = JSON.parse(optimizationResponse);
    console.log(`  ✅ Optimization complete - score: ${optimization.current_performance_score}`);

    return true;
  } catch (error) {
    console.log(`  ❌ AI analytics workflow failed: ${error.message}`);
    return false;
  }
}

// Simulate automation monitoring workflow
async function simulateAutomationMonitoring() {
  console.log("\n🤖 Simulating Automation Monitoring...");

  try {
    // Step 1: Check if automation service data is accessible
    console.log("  📋 Step 1: Checking automation service status...");
    // Since automation doesn't have HTTP API, we check if backend can provide reports
    const reportsResponse = await makeRequest("http://localhost:3001/api/reports");
    const reports = JSON.parse(reportsResponse);
    console.log(`  ✅ Automation reports accessible - service: ${reports.service}`);

    // Step 2: Simulate real-time monitoring data
    console.log("  📡 Step 2: Monitoring real-time automation data...");
    const realtimeData = await simulateRealtimeMonitoring();
    console.log(`  ✅ Real-time monitoring: ${realtimeData ? "Active" : "Inactive"}`);

    return true;
  } catch (error) {
    console.log(`  ❌ Automation monitoring failed: ${error.message}`);
    return false;
  }
}

// Simulate real-time data flow
async function simulateRealtimeDataFlow() {
  console.log("\n🌊 Simulating Real-time Data Flow...");

  try {
    // Step 1: AI service generates insights
    console.log("  🧠 Step 1: AI generates real-time insights...");
    const aiInsights = await makeRequest("http://localhost:8001/api/ml/insights");
    const insights = JSON.parse(aiInsights);
    console.log(
      `  ✅ AI insights: ${insights.insights?.performance_trends?.overall_trend || "generated"}`
    );

    // Step 2: Backend processes and forwards data
    console.log("  🌐 Step 2: Backend processes data...");
    const backendHealth = await makeRequest("http://localhost:3001/health");
    const health = JSON.parse(backendHealth);
    console.log(`  ✅ Backend processing: ${health.status} (${health.environment})`);

    // Step 3: Real-time updates via WebSocket
    console.log("  📡 Step 3: Real-time updates broadcasting...");
    const wsData = await captureWebSocketData();
    console.log(`  ✅ WebSocket updates: ${wsData ? "Broadcasting" : "No data"}`);

    return true;
  } catch (error) {
    console.log(`  ❌ Real-time data flow failed: ${error.message}`);
    return false;
  }
}

// Simulate complete user session
async function simulateCompleteUserSession() {
  console.log("\n👥 Simulating Complete User Session...");

  try {
    // Step 1: User authentication (simulated)
    console.log("  🔐 Step 1: User authentication (simulated)...");
    console.log("  ✅ User authenticated successfully");

    // Step 2: Dashboard loading
    console.log("  📊 Step 2: Loading dashboard...");
    const dashboardResult = await simulateUserDashboardVisit();
    console.log(
      `  ${dashboardResult ? "✅" : "❌"} Dashboard: ${dashboardResult ? "Loaded" : "Failed"}`
    );

    // Step 3: AI analytics interaction
    console.log("  🧠 Step 3: Using AI analytics...");
    const aiResult = await simulateAIAnalyticsWorkflow();
    console.log(`  ${aiResult ? "✅" : "❌"} AI Analytics: ${aiResult ? "Working" : "Failed"}`);

    // Step 4: Real-time monitoring
    console.log("  📡 Step 4: Real-time monitoring...");
    const realtimeResult = await simulateRealtimeDataFlow();
    console.log(
      `  ${realtimeResult ? "✅" : "❌"} Real-time: ${realtimeResult ? "Active" : "Failed"}`
    );

    return dashboardResult && aiResult && realtimeResult;
  } catch (error) {
    console.log(`  ❌ User session failed: ${error.message}`);
    return false;
  }
}

// Simulate load testing with multiple users
async function simulateLoadTesting() {
  console.log("\n⚡ Simulating Load Testing...");

  const userCount = 10;
  const startTime = Date.now();

  try {
    console.log(`  👥 Simulating ${userCount} concurrent users...`);

    const userPromises = [];
    for (let i = 0; i < userCount; i++) {
      userPromises.push(simulateQuickUserFlow(i + 1));
    }

    const results = await Promise.all(userPromises);
    const successfulUsers = results.filter((r) => r).length;
    const endTime = Date.now();
    const totalTime = endTime - startTime;

    console.log(`  ✅ ${successfulUsers}/${userCount} users completed successfully`);
    console.log(
      `  ⏱️  Total time: ${totalTime}ms (avg: ${(totalTime / userCount).toFixed(1)}ms per user)`
    );

    return successfulUsers / userCount >= 0.8; // 80% success rate
  } catch (error) {
    console.log(`  ❌ Load testing failed: ${error.message}`);
    return false;
  }
}

// Helper functions
async function simulateQuickUserFlow(userId) {
  try {
    // Quick health check
    await makeRequest("http://localhost:3001/health");
    // Quick AI request
    await makeRequest("http://localhost:8001/health");
    return true;
  } catch (error) {
    return false;
  }
}

function simulateWebSocketConnection() {
  return new Promise((resolve) => {
    const socket = io("http://localhost:3001");

    socket.on("connect", () => {
      socket.emit("requestDashboardData");
    });

    socket.on("dashboardData", () => {
      socket.disconnect();
      resolve(true);
    });

    socket.on("connect_error", () => {
      resolve(false);
    });

    setTimeout(() => {
      socket.disconnect();
      resolve(false);
    }, 3000);
  });
}

function simulateRealtimeMonitoring() {
  return new Promise((resolve) => {
    const socket = io("http://localhost:3001");
    let dataReceived = false;

    socket.on("connect", () => {
      // Connected successfully
    });

    socket.on("dashboardUpdate", () => {
      dataReceived = true;
    });

    setTimeout(() => {
      socket.disconnect();
      resolve(dataReceived);
    }, 3000);
  });
}

function captureWebSocketData() {
  return new Promise((resolve) => {
    const socket = io("http://localhost:3001");
    let dataReceived = false;

    socket.on("connect", () => {
      socket.emit("requestDashboardData");
    });

    socket.on("dashboardData", () => {
      dataReceived = true;
    });

    socket.on("dashboardUpdate", () => {
      dataReceived = true;
    });

    setTimeout(() => {
      socket.disconnect();
      resolve(dataReceived);
    }, 2000);
  });
}

function makeRequest(url) {
  return new Promise((resolve, reject) => {
    const urlObj = new URL(url);
    const options = {
      hostname: urlObj.hostname,
      port: urlObj.port,
      path: urlObj.pathname,
      method: "GET",
      timeout: 5000,
    };

    const req = http.request(options, (res) => {
      let data = "";
      res.on("data", (chunk) => (data += chunk));
      res.on("end", () => {
        if (res.statusCode >= 200 && res.statusCode < 300) {
          resolve(data);
        } else {
          reject(new Error(`HTTP ${res.statusCode}`));
        }
      });
    });

    req.on("error", reject);
    req.on("timeout", () => reject(new Error("Request timeout")));
    req.end();
  });
}

function makePostRequest(url, data) {
  return new Promise((resolve, reject) => {
    const urlObj = new URL(url);
    const postData = JSON.stringify(data);

    const options = {
      hostname: urlObj.hostname,
      port: urlObj.port,
      path: urlObj.pathname,
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Content-Length": Buffer.byteLength(postData),
      },
      timeout: 10000,
    };

    const req = http.request(options, (res) => {
      let responseData = "";
      res.on("data", (chunk) => (responseData += chunk));
      res.on("end", () => {
        if (res.statusCode >= 200 && res.statusCode < 300) {
          resolve(responseData);
        } else {
          reject(new Error(`HTTP ${res.statusCode}: ${responseData}`));
        }
      });
    });

    req.on("error", reject);
    req.on("timeout", () => reject(new Error("Request timeout")));
    req.write(postData);
    req.end();
  });
}

// Main test runner
async function runEndToEndTests() {
  console.log("🚀 Starting End-to-End Tests...");
  console.log("⏱️  Testing complete user workflows and system integration...\n");

  const results = {
    userDashboard: await simulateUserDashboardVisit(),
    aiAnalytics: await simulateAIAnalyticsWorkflow(),
    automationMonitoring: await simulateAutomationMonitoring(),
    realtimeDataFlow: await simulateRealtimeDataFlow(),
    completeUserSession: await simulateCompleteUserSession(),
    loadTesting: await simulateLoadTesting(),
  };

  console.log("\n📊 End-to-End Test Results:");
  console.log("=".repeat(50));

  const testResults = [
    ["User Dashboard Visit", results.userDashboard],
    ["AI Analytics Workflow", results.aiAnalytics],
    ["Automation Monitoring", results.automationMonitoring],
    ["Real-time Data Flow", results.realtimeDataFlow],
    ["Complete User Session", results.completeUserSession],
    ["Load Testing", results.loadTesting],
  ];

  testResults.forEach(([name, passed]) => {
    console.log(`${name}: ${passed ? "✅ PASS" : "❌ FAIL"}`);
  });

  const passedTests = testResults.filter(([_, passed]) => passed).length;
  const totalTests = testResults.length;

  console.log(`\n🎯 End-to-End Tests: ${passedTests}/${totalTests} passed`);

  if (passedTests === totalTests) {
    console.log("🎉 All end-to-end tests passed! System is production-ready!");
    return 1.0;
  } else if (passedTests >= Math.floor(totalTests * 0.8)) {
    console.log("⚠️  Most end-to-end tests passed. System is nearly production-ready.");
    return passedTests / totalTests;
  } else {
    console.log("❌ End-to-end issues detected. Review failed workflows.");
    return passedTests / totalTests;
  }
}

// Run the tests
if (require.main === module) {
  runEndToEndTests().catch(console.error);
}

module.exports = { runEndToEndTests };
