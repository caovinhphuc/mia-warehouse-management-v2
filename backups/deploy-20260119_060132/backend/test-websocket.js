/* eslint-disable */
/**
 * WebSocket Test Client
 * Test native WebSocket connection using 'ws' library
 */

const WebSocket = require("ws");

const WS_URL = process.env.WS_URL || "ws://localhost:3001/ws";
const PORT = process.env.PORT || 3001;

console.log(`🔌 Connecting to WebSocket server: ${WS_URL}`);
console.log(`📡 Backend port: ${PORT}`);
console.log("");

const ws = new WebSocket(WS_URL);

ws.on("open", () => {
  console.log("✅ Connected to WebSocket server!");
  console.log("");

  // Test 1: Ping
  console.log("📤 Test 1: Sending ping...");
  ws.send(JSON.stringify({ type: "ping" }));

  // Test 2: Echo
  setTimeout(() => {
    console.log("📤 Test 2: Sending echo message...");
    ws.send(
      JSON.stringify({
        type: "echo",
        message: "Hello from WebSocket test client!",
      })
    );
  }, 1000);

  // Test 3: Join room
  setTimeout(() => {
    console.log('📤 Test 3: Joining room "test-room"...');
    ws.send(
      JSON.stringify({
        type: "join-room",
        room: "test-room",
      })
    );
  }, 2000);

  // Test 4: Broadcast
  setTimeout(() => {
    console.log("📤 Test 4: Broadcasting message...");
    ws.send(
      JSON.stringify({
        type: "broadcast",
        message: "This is a broadcast message!",
      })
    );
  }, 3000);

  // Test 5: Leave room
  setTimeout(() => {
    console.log('📤 Test 5: Leaving room "test-room"...');
    ws.send(
      JSON.stringify({
        type: "leave-room",
        room: "test-room",
      })
    );
  }, 4000);

  // Close after tests
  setTimeout(() => {
    console.log("");
    console.log("✅ All tests completed! Closing connection...");
    ws.close();
  }, 5000);
});

ws.on("message", (data) => {
  try {
    const message = JSON.parse(data.toString());
    console.log("📨 Received:", JSON.stringify(message, null, 2));
    console.log("");
  } catch (error) {
    console.log("📨 Received (raw):", data.toString());
    console.log("");
  }
});

ws.on("error", (error) => {
  console.error("❌ WebSocket error:", error.message);
  console.error("");
  console.error("💡 Make sure backend server is running:");
  console.error(`   cd backend && PORT=${PORT} npm start`);
  process.exit(1);
});

ws.on("close", () => {
  console.log("❌ WebSocket connection closed");
  process.exit(0);
});

// Handle process termination
process.on("SIGINT", () => {
  console.log("");
  console.log("👋 Closing WebSocket connection...");
  ws.close();
  process.exit(0);
});
