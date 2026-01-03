/* eslint-disable */
/**
 * WebSocket Service (Native WS) - Real-time Communication
 * Native WebSocket server using 'ws' library for testing
 */

const WebSocket = require("ws");

const wsService = {
  /**
   * Initialize native WebSocket server
   */
  init(server, port = 8001) {
    // Create WebSocket server
    const wss = new WebSocket.Server({
      server,
      path: "/ws",
      perMessageDeflate: false,
    });

    const connectedClients = new Map();

    // Handle WebSocket server errors
    wss.on("error", (error) => {
      console.error("❌ WebSocket server error:", error.message || error);
    });

    wss.on("connection", (ws, req) => {
      const clientId = `${Date.now()}-${Math.random()
        .toString(36)
        .substr(2, 9)}`;
      const clientIP =
        req.socket.remoteAddress || req.headers["x-forwarded-for"] || "unknown";

      console.log(
        `✅ WebSocket client connected: ${clientId} from ${clientIP}`
      );

      // Store client
      connectedClients.set(clientId, {
        id: clientId,
        ws,
        ip: clientIP,
        connectedAt: new Date(),
        lastPong: new Date(),
        rooms: new Set(),
        pingInterval: null, // Will be set below
      });

      // Send welcome message
      ws.send(
        JSON.stringify({
          type: "welcome",
          clientId,
          message: "Connected to WebSocket server",
          timestamp: new Date().toISOString(),
        })
      );

      // Heartbeat/Ping to keep connection alive and detect dead connections
      const pingInterval = setInterval(() => {
        if (ws.readyState === WebSocket.OPEN) {
          try {
            ws.ping();
          } catch (error) {
            console.error(
              `❌ Error sending ping to ${clientId}:`,
              error.message
            );
            clearInterval(pingInterval);
            connectedClients.delete(clientId);
          }
        } else {
          clearInterval(pingInterval);
        }
      }, 30000); // Ping every 30 seconds

      // Store ping interval in client object for cleanup
      const clientData = connectedClients.get(clientId);
      if (clientData) {
        clientData.pingInterval = pingInterval;
      }

      // Handle pong response
      ws.on("pong", () => {
        // Client is still alive
        const client = connectedClients.get(clientId);
        if (client) {
          client.lastPong = new Date();
        }
      });

      // Handle messages
      ws.on("message", (message) => {
        try {
          const data = JSON.parse(message.toString());
          console.log(`📨 Message from ${clientId}:`, data);

          // Handle different message types
          switch (data.type) {
            case "ping":
              ws.send(
                JSON.stringify({
                  type: "pong",
                  timestamp: new Date().toISOString(),
                })
              );
              break;

            case "echo":
              ws.send(
                JSON.stringify({
                  type: "echo",
                  original: data.message,
                  timestamp: new Date().toISOString(),
                })
              );
              break;

            case "broadcast":
              // Broadcast to all clients
              wss.clients.forEach((client) => {
                if (client.readyState === WebSocket.OPEN) {
                  client.send(
                    JSON.stringify({
                      type: "broadcast",
                      from: clientId,
                      message: data.message,
                      timestamp: new Date().toISOString(),
                    })
                  );
                }
              });
              break;

            case "join-room":
              const client = connectedClients.get(clientId);
              if (client) {
                client.rooms.add(data.room);
                ws.send(
                  JSON.stringify({
                    type: "room-joined",
                    room: data.room,
                    timestamp: new Date().toISOString(),
                  })
                );
              }
              break;

            case "leave-room":
              const client2 = connectedClients.get(clientId);
              if (client2) {
                client2.rooms.delete(data.room);
                ws.send(
                  JSON.stringify({
                    type: "room-left",
                    room: data.room,
                    timestamp: new Date().toISOString(),
                  })
                );
              }
              break;

            default:
              ws.send(
                JSON.stringify({
                  type: "error",
                  message: `Unknown message type: ${data.type}`,
                  timestamp: new Date().toISOString(),
                })
              );
          }
        } catch (error) {
          console.error(`❌ Error handling message from ${clientId}:`, error);
          ws.send(
            JSON.stringify({
              type: "error",
              message: error.message,
              timestamp: new Date().toISOString(),
            })
          );
        }
      });

      // Handle close
      ws.on("close", (code, reason) => {
        const reasonStr = reason ? reason.toString() : "";

        // Handle different close codes
        let disconnectType = "Unknown";
        if (code === 1000) {
          disconnectType = "Normal closure";
        } else if (code === 1001) {
          disconnectType = "Going away";
        } else if (code === 1005) {
          disconnectType =
            "No status received (connection lost/abnormal close)";
        } else if (code === 1006) {
          disconnectType = "Abnormal closure (no close frame)";
        } else if (code === 1011) {
          disconnectType = "Internal server error";
        } else if (code) {
          disconnectType = `Close code ${code}`;
        }

        const reasonDisplay = reasonStr || disconnectType;
        console.log(
          `❌ WebSocket client disconnected: ${clientId} (code: ${
            code || "N/A"
          }, reason: ${reasonDisplay})`
        );

        // Clean up ping interval
        const clientData = connectedClients.get(clientId);
        if (clientData && clientData.pingInterval) {
          clearInterval(clientData.pingInterval);
        }

        // Clean up
        connectedClients.delete(clientId);
      });

      // Handle error
      ws.on("error", (error) => {
        console.error(
          `❌ WebSocket error for ${clientId}:`,
          error.message || error
        );
        if (error.stack) {
          console.error("Stack trace:", error.stack);
        }
        connectedClients.delete(clientId);
      });
    });

    // Store wss instance
    wsService.wss = wss;
    wsService.connectedClients = connectedClients;

    console.log(`✅ Native WebSocket server initialized on /ws`);

    return wss;
  },

  /**
   * Get WebSocket server instance
   */
  getWSS() {
    return this.wss;
  },

  /**
   * Broadcast to all clients
   */
  broadcast(data) {
    if (this.wss) {
      const message = typeof data === "string" ? data : JSON.stringify(data);
      this.wss.clients.forEach((client) => {
        if (client.readyState === WebSocket.OPEN) {
          client.send(message);
        }
      });
    }
  },

  /**
   * Send to specific client
   */
  sendToClient(clientId, data) {
    const client = this.connectedClients?.get(clientId);
    if (client && client.ws.readyState === WebSocket.OPEN) {
      const message = typeof data === "string" ? data : JSON.stringify(data);
      client.ws.send(message);
      return true;
    }
    return false;
  },

  /**
   * Get connected clients count
   */
  getConnectedCount() {
    return this.connectedClients ? this.connectedClients.size : 0;
  },

  /**
   * Get all connected clients info
   */
  getClientsInfo() {
    if (!this.connectedClients) return [];

    return Array.from(this.connectedClients.values()).map((client) => ({
      id: client.id,
      ip: client.ip,
      connectedAt: client.connectedAt,
      rooms: Array.from(client.rooms),
    }));
  },
};

module.exports = wsService;
