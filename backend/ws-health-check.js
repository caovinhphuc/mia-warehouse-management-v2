/* eslint-disable */
/**
 * WebSocket Health Check Script
 * Kiểm tra trạng thái WebSocket server
 */

const WebSocket = require("ws");

const WS_URL = process.env.WS_URL || "ws://localhost:3001/ws";
const TIMEOUT = 5000; // 5 seconds

console.log("🔍 WebSocket Health Check");
console.log("==========================");
console.log(`📍 URL: ${WS_URL}`);
console.log(`⏱️  Timeout: ${TIMEOUT}ms`);
console.log("");

let connected = false;
let errorOccurred = false;

const ws = new WebSocket(WS_URL);

// Set timeout
const timeout = setTimeout(() => {
  if (!connected) {
    console.error("❌ Connection timeout!");
    console.error("");
    console.error("💡 Kiểm tra:");
    console.error("   1. Backend server có đang chạy không?");
    console.error("   2. WebSocket service đã được khởi tạo chưa?");
    console.error("   3. Port có đúng không? (mặc định: 3001)");
    console.error("");
    console.error("   Chạy backend: cd backend && PORT=3001 npm start");
    ws.close();
    process.exit(1);
  }
}, TIMEOUT);

ws.on("open", () => {
  connected = true;
  clearTimeout(timeout);
  console.log("✅ Connected successfully!");
  console.log("");

  // Test ping
  console.log("📤 Sending ping...");
  ws.send(JSON.stringify({ type: "ping" }));
});

ws.on("message", (data) => {
  try {
    const message = JSON.parse(data.toString());
    console.log("📨 Received:", JSON.stringify(message, null, 2));
    console.log("");

    // Check message type
    if (message.type === "welcome") {
      console.log("✅ Welcome message received - Server is healthy!");
      console.log(`   Client ID: ${message.clientId}`);
    } else if (message.type === "pong") {
      console.log("✅ Pong received - Ping/Pong working!");
    } else if (message.type === "error") {
      console.error(`⚠️  Server error: ${message.message}`);
      errorOccurred = true;
    }

    // Close after receiving response
    setTimeout(() => {
      console.log("");
      console.log("✅ Health check completed!");
      console.log(`   Status: ${errorOccurred ? "⚠️  Warning" : "✅ Healthy"}`);
      ws.close();
      process.exit(errorOccurred ? 1 : 0);
    }, 500);
  } catch (error) {
    console.error("❌ Error parsing message:", error);
    errorOccurred = true;
  }
});

ws.on("error", (error) => {
  clearTimeout(timeout);
  errorOccurred = true;
  console.error("❌ Connection error:", error.message);
  console.error("");
  console.error("💡 Possible issues:");
  console.error("   1. Backend server is not running");
  console.error("   2. WebSocket endpoint is not available");
  console.error("   3. Port is incorrect");
  console.error("   4. Firewall blocking connection");
  console.error("");
  console.error("   Try:");
  console.error("   cd backend && PORT=3001 npm start");
  process.exit(1);
});

ws.on("close", (code, reason) => {
  clearTimeout(timeout);
  const reasonStr = reason ? reason.toString() : "Normal closure";
  console.log("");
  console.log(`Connection closed (code: ${code}, reason: ${reasonStr})`);

  if (!connected) {
    console.error("");
    console.error("❌ Failed to connect!");
    process.exit(1);
  }
});

// Handle process termination
process.on("SIGINT", () => {
  console.log("");
  console.log("👋 Closing connection...");
  ws.close();
  process.exit(0);
});
