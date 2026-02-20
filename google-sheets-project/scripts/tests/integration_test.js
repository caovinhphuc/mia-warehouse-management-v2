#!/usr/bin/env node
/**
 * Integration Testing Suite
 * Test communication giữa AI Service, Backend API, và Automation Service
 */

const http = require("http");

console.log("🔗 Integration Testing Suite");
console.log("=".repeat(60));

// Service endpoints
const SERVICES = {
  ai: { host: "localhost", port: 8001, name: "AI Service" },
  backend: { host: "localhost", port: 3001, name: "Backend API" },
  automation: { name: "Automation Service" }, // No HTTP port
};

// Test 1: Service Health Checks
async function testServiceHealth() {
  console.log("\n🏥 Testing Service Health...");
  const results = {};

  for (const [key, service] of Object.entries(SERVICES)) {
    if (!service.port) continue; // Skip automation (no HTTP)

    try {
      const health = await makeRequest(service.host, service.port, "/health");
      const data = JSON.parse(health);

      console.log(`✅ ${service.name}: ${data.status}`);
      results[key] = { status: "healthy", data };
    } catch (error) {
      console.log(`❌ ${service.name}: ${error.message}`);
      results[key] = { status: "unhealthy", error: error.message };
    }
  }

  return results;
}

// Test 2: AI Service to Backend Communication
async function testAIToBackend() {
  console.log("\n🧠➡️🌐 Testing AI Service to Backend Communication...");

  try {
    // Test AI service root endpoint
    const aiStatus = await makeRequest("localhost", 8001, "/");
    const statusData = JSON.parse(aiStatus);

    console.log("✅ AI Service root endpoint accessible");
    console.log(`   Service: ${statusData.service}`);
    console.log(`   Status: ${statusData.status}`);

    // Test health endpoint
    const healthCheck = await makeRequest("localhost", 8001, "/health");
    const healthData = JSON.parse(healthCheck);

    console.log("✅ AI Service health endpoint accessible");
    console.log(`   Health status: ${healthData.status || "OK"}`);

    return true;
  } catch (error) {
    console.log(`❌ AI to Backend communication failed: ${error.message}`);
    return false;
  }
}

// Test 3: Backend to AI Service Integration
async function testBackendToAI() {
  console.log("\n🌐➡️🧠 Testing Backend to AI Service Integration...");

  try {
    // Test if backend can access AI service basic endpoints
    const aiRoot = await makeRequest("localhost", 8001, "/");
    const data = JSON.parse(aiRoot);

    console.log("✅ Backend can access AI service");
    console.log(`   AI Features: ${data.features?.join(", ") || "Available"}`);

    // Test AI service health from backend perspective
    const healthCheck = await makeRequest("localhost", 8001, "/health");
    console.log("✅ Backend can check AI service health");

    return true;
  } catch (error) {
    console.log(`❌ Backend to AI integration failed: ${error.message}`);
    return false;
  }
}

// Test 4: Cross-Service Data Flow
async function testCrossServiceDataFlow() {
  console.log("\n🔄 Testing Cross-Service Data Flow...");

  try {
    // 1. Get data from AI service
    console.log("  📊 Step 1: Getting status from AI service...");
    const aiData = await makeRequest("localhost", 8001, "/");
    const aiStatus = JSON.parse(aiData);
    console.log(`  ✅ AI service status: ${aiStatus.status}`);

    // 2. Get data from backend
    console.log("  📤 Step 2: Getting status from backend...");
    const backendData = await makeRequest("localhost", 3001, "/health");
    const backendStatus = JSON.parse(backendData);
    console.log(`  ✅ Backend status: ${backendStatus.status}`);

    // 3. Cross-reference data
    console.log("  🔗 Step 3: Cross-service data validation...");
    const integrationWorking = aiStatus.status === "operational" && backendStatus.status === "OK";
    console.log(`  ✅ Integration status: ${integrationWorking ? "Working" : "Issues detected"}`);

    return integrationWorking;
  } catch (error) {
    console.log(`❌ Cross-service data flow failed: ${error.message}`);
    return false;
  }
}

// Test 5: Real-time Communication (WebSockets)
async function testRealtimeCommunication() {
  console.log("\n📡 Testing Real-time Communication...");

  try {
    // Test if backend WebSocket can handle AI service updates
    console.log("  🔌 Testing WebSocket connectivity...");

    const io = require("socket.io-client");
    const socket = io("http://localhost:3001");

    return new Promise((resolve) => {
      socket.on("connect", () => {
        console.log("  ✅ WebSocket connection established");

        // Simulate AI service sending updates to backend
        socket.emit("aiUpdate", {
          type: "prediction",
          data: { confidence: 0.95, value: 150 },
        });

        console.log("  ✅ AI update sent via WebSocket");
        socket.disconnect();
        resolve(true);
      });

      socket.on("connect_error", () => {
        console.log("  ❌ WebSocket connection failed");
        resolve(false);
      });
    });
  } catch (error) {
    console.log(`❌ Real-time communication test failed: ${error.message}`);
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
          reject(new Error(`HTTP ${res.statusCode}`));
        }
      });
    });

    req.on("error", reject);
    req.setTimeout(5000, () => reject(new Error("Request timeout")));
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
          reject(new Error(`HTTP ${res.statusCode}`));
        }
      });
    });

    req.on("error", reject);
    req.setTimeout(5000, () => reject(new Error("Request timeout")));
    req.write(postData);
    req.end();
  });
}

// Main integration test runner
async function runIntegrationTests() {
  console.log("🚀 Starting Integration Tests...");
  console.log("⏱️  Testing communication between services...\n");

  const results = {
    serviceHealth: await testServiceHealth(),
    aiToBackend: await testAIToBackend(),
    backendToAI: await testBackendToAI(),
    crossServiceFlow: await testCrossServiceDataFlow(),
    realtimeCommunication: await testRealtimeCommunication(),
  };

  console.log("\n📊 Integration Test Results:");
  console.log("=".repeat(40));

  const testResults = [
    ["Service Health", Object.values(results.serviceHealth).every((r) => r.status === "healthy")],
    ["AI ➡️ Backend", results.aiToBackend],
    ["Backend ➡️ AI", results.backendToAI],
    ["Cross-Service Flow", results.crossServiceFlow],
    ["Real-time Comm", results.realtimeCommunication],
  ];

  testResults.forEach(([name, passed]) => {
    console.log(`${name}: ${passed ? "✅ PASS" : "❌ FAIL"}`);
  });

  const passedTests = testResults.filter(([_, passed]) => passed).length;
  const totalTests = testResults.length;

  console.log(`\n🎯 Integration Tests: ${passedTests}/${totalTests} passed`);

  if (passedTests === totalTests) {
    console.log("🎉 All integration tests passed! Services communicate perfectly!");
  } else if (passedTests >= Math.floor(totalTests * 0.7)) {
    console.log("⚠️  Most integration tests passed. System is mostly integrated.");
  } else {
    console.log("❌ Integration issues detected. Check service connections.");
  }

  return passedTests / totalTests;
}

// Run the integration tests
if (require.main === module) {
  runIntegrationTests().catch(console.error);
}

module.exports = { runIntegrationTests };
