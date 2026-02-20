#!/usr/bin/env node
/**
 * Advanced Integration Testing Suite
 * Test API endpoints, data flow, and real-world scenarios
 */

const http = require("http");
const io = require("socket.io-client");

console.log("🧪 Advanced Integration Testing Suite");
console.log("=".repeat(60));

// Service endpoints
const SERVICES = {
  ai: { host: "localhost", port: 8001, name: "AI Service" },
  backend: { host: "localhost", port: 3001, name: "Backend API" },
};

// Test 1: AI Service API Endpoints
async function testAIServiceAPIs() {
  console.log("\n🧠 Testing AI Service API Endpoints...");
  const results = {};

  try {
    // Test ML Insights
    console.log("  📊 Testing ML Insights endpoint...");
    const insightsData = await makeRequest("localhost", 8001, "/api/ml/insights");
    const insights = JSON.parse(insightsData);
    console.log(`  ✅ ML Insights: Confidence ${insights.confidence_score?.toFixed(2) || "N/A"}`);
    results.insights = true;
  } catch (error) {
    console.log(`  ❌ ML Insights failed: ${error.message}`);
    results.insights = false;
  }

  try {
    // Test Prediction endpoint
    console.log("  🔮 Testing Prediction endpoint...");
    const predictionPayload = {
      timeframe: "1h",
      metrics: ["response_time", "active_users"],
    };

    const predictionData = await makePostRequest(
      "localhost",
      8001,
      "/api/ml/predict",
      predictionPayload
    );
    const predictions = JSON.parse(predictionData);
    console.log(`  ✅ Predictions: ${Object.keys(predictions.predictions || {}).length} metrics`);
    results.predictions = true;
  } catch (error) {
    console.log(`  ❌ Predictions failed: ${error.message}`);
    results.predictions = false;
  }

  try {
    // Test Optimization endpoint
    console.log("  ⚡ Testing Optimization endpoint...");
    const optimizationPayload = {
      timestamp: new Date().toISOString(),
      active_users: 150,
      response_time: 250.5,
      error_rate: 2.1,
      cpu_usage: 75.3,
      memory_usage: 68.2,
      disk_usage: 45.7,
      network_io: 1024.5,
    };

    const optimizationData = await makePostRequest(
      "localhost",
      8001,
      "/api/ml/optimize",
      optimizationPayload
    );
    const optimization = JSON.parse(optimizationData);
    console.log(`  ✅ Optimization: Score ${optimization.current_performance_score || "N/A"}`);
    results.optimization = true;
  } catch (error) {
    console.log(`  ❌ Optimization failed: ${error.message}`);
    results.optimization = false;
  }

  return results;
}

// Test 2: Backend Service Integration
async function testBackendIntegration() {
  console.log("\n🌐 Testing Backend Service Integration...");
  const results = {};

  try {
    // Test health endpoint
    console.log("  ❤️  Testing backend health...");
    const healthData = await makeRequest("localhost", 3001, "/health");
    const health = JSON.parse(healthData);
    console.log(`  ✅ Backend Health: ${health.status} (uptime: ${Math.round(health.uptime)}s)`);
    results.health = true;
  } catch (error) {
    console.log(`  ❌ Backend health failed: ${error.message}`);
    results.health = false;
  }

  try {
    // Test reports endpoint (if available)
    console.log("  📋 Testing reports endpoint...");
    const reportsData = await makeRequest("localhost", 3001, "/api/reports");
    console.log(`  ✅ Reports endpoint accessible`);
    results.reports = true;
  } catch (error) {
    console.log(`  ⚠️  Reports endpoint: ${error.message} (expected if not implemented)`);
    results.reports = false;
  }

  return results;
}

// Test 3: End-to-End Data Flow
async function testEndToEndFlow() {
  console.log("\n🔄 Testing End-to-End Data Flow...");

  try {
    console.log("  📈 Step 1: Generate AI insights...");
    const insightsResponse = await makeRequest("localhost", 8001, "/api/ml/insights");
    const insights = JSON.parse(insightsResponse);
    console.log(
      `  ✅ AI insights generated with confidence: ${insights.confidence_score?.toFixed(2) || "N/A"}`
    );

    console.log("  🔮 Step 2: Request predictions...");
    const predictionPayload = {
      timeframe: "1h",
      metrics: ["response_time", "active_users", "cpu_usage"],
    };

    const predictionResponse = await makePostRequest(
      "localhost",
      8001,
      "/api/ml/predict",
      predictionPayload
    );
    const predictions = JSON.parse(predictionResponse);
    console.log(
      `  ✅ Predictions generated for ${Object.keys(predictions.predictions || {}).length} metrics`
    );

    console.log("  ⚡ Step 3: Get optimization recommendations...");
    const optimizationPayload = {
      timestamp: new Date().toISOString(),
      active_users: 200,
      response_time: 300.0,
      error_rate: 1.5,
      cpu_usage: 80.0,
      memory_usage: 70.0,
      disk_usage: 50.0,
      network_io: 1500.0,
    };

    const optimizationResponse = await makePostRequest(
      "localhost",
      8001,
      "/api/ml/optimize",
      optimizationPayload
    );
    const optimization = JSON.parse(optimizationResponse);
    console.log(
      `  ✅ Optimization suggestions generated (Score: ${optimization.current_performance_score || "N/A"})`
    );

    console.log("  📡 Step 4: Test real-time WebSocket communication...");
    const wsResult = await testWebSocketFlow();
    console.log(`  ✅ WebSocket communication: ${wsResult ? "Working" : "Failed"}`);

    return true;
  } catch (error) {
    console.log(`  ❌ End-to-end flow failed: ${error.message}`);
    return false;
  }
}

// Test 4: WebSocket Real-time Flow
function testWebSocketFlow() {
  return new Promise((resolve) => {
    console.log("    🔌 Connecting to WebSocket...");
    const socket = io("http://localhost:3001");

    let steps = 0;
    const maxSteps = 3;

    socket.on("connect", () => {
      console.log("    ✅ WebSocket connected");
      steps++;

      // Request dashboard data
      socket.emit("requestDashboardData");
    });

    socket.on("dashboardData", (data) => {
      console.log(
        `    📊 Dashboard data received: ${data.metrics?.activeUsers || "N/A"} active users`
      );
      steps++;
    });

    socket.on("dashboardUpdate", (data) => {
      console.log(
        `    🔄 Real-time update: ${data.metrics?.activeUsers || "N/A"} users, ${data.metrics?.responseTime?.toFixed(0) || "N/A"}ms response`
      );
      steps++;

      if (steps >= maxSteps) {
        socket.disconnect();
        resolve(true);
      }
    });

    socket.on("connect_error", (error) => {
      console.log(`    ❌ WebSocket error: ${error.message}`);
      resolve(false);
    });

    // Timeout after 8 seconds
    setTimeout(() => {
      socket.disconnect();
      resolve(steps >= 2); // At least connection + one data event
    }, 8000);
  });
}

// Test 5: Performance and Load Testing
async function testPerformanceLoad() {
  console.log("\n⚡ Testing Performance and Load...");

  const startTime = Date.now();
  const promises = [];
  const concurrentRequests = 5;

  // Test concurrent requests to both services
  for (let i = 0; i < concurrentRequests; i++) {
    promises.push(makeRequest("localhost", 8001, "/"));
    promises.push(makeRequest("localhost", 3001, "/health"));
  }

  try {
    const results = await Promise.all(promises);
    const endTime = Date.now();
    const totalTime = endTime - startTime;

    console.log(`  ✅ ${results.length} concurrent requests completed`);
    console.log(
      `  ⏱️  Total time: ${totalTime}ms (avg: ${(totalTime / results.length).toFixed(1)}ms per request)`
    );

    return totalTime < 5000; // Should complete within 5 seconds
  } catch (error) {
    console.log(`  ❌ Performance test failed: ${error.message}`);
    return false;
  }
}

// Helper functions
function makeRequest(host, port, path) {
  return new Promise((resolve, reject) => {
    const options = { hostname: host, port, path, method: "GET" };

    const req = http.request(options, (res) => {
      let data = "";
      res.on("data", (chunk) => (data += chunk));
      res.on("end", () => {
        if (res.statusCode >= 200 && res.statusCode < 300) {
          resolve(data);
        } else {
          reject(new Error(`HTTP ${res.statusCode}: ${data}`));
        }
      });
    });

    req.on("error", reject);
    req.setTimeout(10000, () => reject(new Error("Request timeout")));
    req.end();
  });
}

function makePostRequest(host, port, path, data) {
  return new Promise((resolve, reject) => {
    const postData = JSON.stringify(data);
    const options = {
      hostname: host,
      port,
      path,
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Content-Length": Buffer.byteLength(postData),
      },
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
    req.setTimeout(10000, () => reject(new Error("Request timeout")));
    req.write(postData);
    req.end();
  });
}

// Main test runner
async function runAdvancedIntegrationTests() {
  console.log("🚀 Starting Advanced Integration Tests...");
  console.log("⏱️  Testing all APIs and end-to-end workflows...\n");

  const results = {
    aiAPIs: await testAIServiceAPIs(),
    backendIntegration: await testBackendIntegration(),
    endToEndFlow: await testEndToEndFlow(),
    performance: await testPerformanceLoad(),
  };

  console.log("\n📊 Advanced Integration Test Results:");
  console.log("=".repeat(50));

  // AI Service APIs
  const aiResults = Object.values(results.aiAPIs);
  const aiPassed = aiResults.filter((r) => r).length;
  console.log(`AI Service APIs: ${aiPassed}/${aiResults.length} ✅`);
  Object.entries(results.aiAPIs).forEach(([test, passed]) => {
    console.log(`  ${test}: ${passed ? "✅" : "❌"}`);
  });

  // Backend Integration
  const backendResults = Object.values(results.backendIntegration);
  const backendPassed = backendResults.filter((r) => r).length;
  console.log(`Backend Integration: ${backendPassed}/${backendResults.length} ✅`);
  Object.entries(results.backendIntegration).forEach(([test, passed]) => {
    console.log(`  ${test}: ${passed ? "✅" : "❌"}`);
  });

  // Overall results
  console.log(`End-to-End Flow: ${results.endToEndFlow ? "✅ PASS" : "❌ FAIL"}`);
  console.log(`Performance Test: ${results.performance ? "✅ PASS" : "❌ FAIL"}`);

  const totalTests = aiResults.length + backendResults.length + 2;
  const passedTests =
    aiPassed + backendPassed + (results.endToEndFlow ? 1 : 0) + (results.performance ? 1 : 0);

  console.log(`\n🎯 Overall Integration: ${passedTests}/${totalTests} tests passed`);

  if (passedTests === totalTests) {
    console.log("🎉 All advanced integration tests passed! System is fully integrated!");
    return 1.0;
  } else if (passedTests >= Math.floor(totalTests * 0.8)) {
    console.log("⚠️  Most tests passed. System is well integrated with minor issues.");
    return passedTests / totalTests;
  } else {
    console.log("❌ Integration issues detected. Review failed tests.");
    return passedTests / totalTests;
  }
}

// Run the tests
if (require.main === module) {
  runAdvancedIntegrationTests().catch(console.error);
}

module.exports = { runAdvancedIntegrationTests };
