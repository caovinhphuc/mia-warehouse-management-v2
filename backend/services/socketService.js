/* eslint-disable */
/**
 * Socket.io Service - Real-time Communication
 * Handles WebSocket connections and events
 */

const socketService = {
  /**
   * Initialize Socket.io with Express server
   */
  init(server) {
    const { Server } = require("socket.io");
    const io = new Server(server, {
      cors: {
        origin: process.env.FRONTEND_URL || "http://localhost:3000",
        methods: ["GET", "POST"],
        credentials: true,
      },
      transports: ["websocket", "polling"],
    });

    // Store connected clients
    const connectedClients = new Map();
    const roomUsers = new Map(); // roomId -> Set of userIds

    io.on("connection", (socket) => {
      console.log(`✅ Client connected: ${socket.id}`);

      // Store client info
      connectedClients.set(socket.id, {
        id: socket.id,
        connectedAt: new Date(),
        rooms: new Set(),
      });

      // Join user to a room (e.g., dashboard, sheets:spreadsheetId)
      socket.on("join-room", ({ room, userId }) => {
        socket.join(room);
        const client = connectedClients.get(socket.id);
        if (client) {
          client.rooms.add(room);
        }

        // Track room users
        if (!roomUsers.has(room)) {
          roomUsers.set(room, new Set());
        }
        roomUsers.get(room).add(userId || socket.id);

        console.log(`📥 ${socket.id} joined room: ${room}`);

        // Notify others in the room
        socket.to(room).emit("user-joined", {
          userId: userId || socket.id,
          room,
          timestamp: new Date().toISOString(),
        });

        // Send current room users to the new user
        const users = Array.from(roomUsers.get(room) || []);
        socket.emit("room-users", { room, users });
      });

      // Leave a room
      socket.on("leave-room", ({ room, userId }) => {
        socket.leave(room);
        const client = connectedClients.get(socket.id);
        if (client) {
          client.rooms.delete(room);
        }

        // Remove from room users
        if (roomUsers.has(room)) {
          roomUsers.get(room).delete(userId || socket.id);
          if (roomUsers.get(room).size === 0) {
            roomUsers.delete(room);
          }
        }

        console.log(`📤 ${socket.id} left room: ${room}`);

        // Notify others in the room
        socket.to(room).emit("user-left", {
          userId: userId || socket.id,
          room,
          timestamp: new Date().toISOString(),
        });
      });

      // Dashboard: Subscribe to real-time metrics
      socket.on("subscribe-metrics", () => {
        socket.join("dashboard-metrics");
        console.log(`📊 ${socket.id} subscribed to metrics`);
      });

      // Dashboard: Unsubscribe from metrics
      socket.on("unsubscribe-metrics", () => {
        socket.leave("dashboard-metrics");
        console.log(`📊 ${socket.id} unsubscribed from metrics`);
      });

      // Google Sheets: Collaborative editing
      socket.on("sheets-edit", ({ spreadsheetId, range, value, userId }) => {
        const room = `sheets:${spreadsheetId}`;
        console.log(`📝 Sheets edit in ${room}: ${range} = ${value}`);

        // Broadcast to others in the same spreadsheet room
        socket.to(room).emit("sheets-edit-received", {
          spreadsheetId,
          range,
          value,
          userId: userId || socket.id,
          timestamp: new Date().toISOString(),
        });
      });

      // Google Sheets: Cell selection/cursor position
      socket.on("sheets-cursor", ({ spreadsheetId, cell, userId }) => {
        const room = `sheets:${spreadsheetId}`;
        socket.to(room).emit("sheets-cursor-received", {
          spreadsheetId,
          cell,
          userId: userId || socket.id,
          timestamp: new Date().toISOString(),
        });
      });

      // Notifications: Subscribe to user notifications
      socket.on("subscribe-notifications", ({ userId }) => {
        const room = `notifications:${userId}`;
        socket.join(room);
        console.log(
          `🔔 ${socket.id} subscribed to notifications for user: ${userId}`
        );
      });

      // Notifications: Unsubscribe
      socket.on("unsubscribe-notifications", ({ userId }) => {
        const room = `notifications:${userId}`;
        socket.leave(room);
        console.log(`🔔 ${socket.id} unsubscribed from notifications`);
      });

      // Disconnect
      socket.on("disconnect", () => {
        console.log(`❌ Client disconnected: ${socket.id}`);

        const client = connectedClients.get(socket.id);
        if (client) {
          // Leave all rooms
          client.rooms.forEach((room) => {
            socket.to(room).emit("user-left", {
              userId: socket.id,
              room,
              timestamp: new Date().toISOString(),
            });

            // Clean up room users
            if (roomUsers.has(room)) {
              roomUsers.get(room).delete(socket.id);
              if (roomUsers.get(room).size === 0) {
                roomUsers.delete(room);
              }
            }
          });
        }

        connectedClients.delete(socket.id);
      });

      // Health check
      socket.on("ping", () => {
        socket.emit("pong", { timestamp: new Date().toISOString() });
      });
    });

    // Store io instance
    socketService.io = io;
    socketService.connectedClients = connectedClients;
    socketService.roomUsers = roomUsers;

    console.log("✅ Socket.io initialized");

    return io;
  },

  /**
   * Get Socket.io instance
   */
  getIO() {
    return this.io;
  },

  /**
   * Broadcast to all clients
   */
  broadcast(event, data) {
    if (this.io) {
      this.io.emit(event, data);
    }
  },

  /**
   * Send to specific room
   */
  toRoom(room, event, data) {
    if (this.io) {
      this.io.to(room).emit(event, data);
    }
  },

  /**
   * Send to specific socket
   */
  toSocket(socketId, event, data) {
    if (this.io) {
      this.io.to(socketId).emit(event, data);
    }
  },

  /**
   * Emit dashboard metrics update
   */
  emitMetrics(metrics) {
    this.toRoom("dashboard-metrics", "metrics-update", {
      ...metrics,
      timestamp: new Date().toISOString(),
    });
  },

  /**
   * Emit notification to user
   */
  emitNotification(userId, notification) {
    this.toRoom(`notifications:${userId}`, "notification", {
      ...notification,
      timestamp: new Date().toISOString(),
    });
  },

  /**
   * Get connected clients count
   */
  getConnectedCount() {
    return this.connectedClients ? this.connectedClients.size : 0;
  },

  /**
   * Get room users count
   */
  getRoomUsersCount(room) {
    return this.roomUsers && this.roomUsers.has(room)
      ? this.roomUsers.get(room).size
      : 0;
  },
};

module.exports = socketService;
