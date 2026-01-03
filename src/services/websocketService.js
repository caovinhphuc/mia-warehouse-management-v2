/* eslint-disable */
/**
 * WebSocket Service - Frontend Socket.io Client
 * Manages real-time connections and events
 */

import { io } from "socket.io-client";
import importMetaEnv from "../utils/importMetaEnv";

const API_BASE_URL =
  importMetaEnv.VITE_API_URL ||
  importMetaEnv.REACT_APP_API_URL ||
  "http://localhost:3001";

class WebSocketService {
  constructor() {
    this.socket = null;
    this.connected = false;
    this.listeners = new Map();
    this.reconnectAttempts = 0;
    this.maxReconnectAttempts = 5;
    this.reconnectDelay = 1000;
  }

  /**
   * Connect to WebSocket server
   */
  connect(userId = null) {
    if (this.socket && this.connected) {
      console.log("⚠️ Already connected to WebSocket");
      return this.socket;
    }

    try {
      this.socket = io(API_BASE_URL, {
        transports: ["websocket", "polling"],
        reconnection: true,
        reconnectionAttempts: this.maxReconnectAttempts,
        reconnectionDelay: this.reconnectDelay,
        autoConnect: true,
        withCredentials: true,
      });

      // Connection events
      this.socket.on("connect", () => {
        console.log("✅ Connected to WebSocket server:", this.socket.id);
        this.connected = true;
        this.reconnectAttempts = 0;

        if (userId) {
          this.socket.emit("join-room", { room: `user:${userId}`, userId });
        }

        this.emit("connected", { socketId: this.socket.id });
      });

      this.socket.on("disconnect", (reason) => {
        console.log("❌ Disconnected from WebSocket:", reason);
        this.connected = false;
        this.emit("disconnected", { reason });
      });

      this.socket.on("connect_error", (error) => {
        console.error("❌ WebSocket connection error:", error);
        this.reconnectAttempts++;
        this.emit("connection-error", {
          error,
          attempt: this.reconnectAttempts,
        });
      });

      this.socket.on("reconnect", (attemptNumber) => {
        console.log(`🔄 Reconnected after ${attemptNumber} attempts`);
        this.emit("reconnected", { attemptNumber });
      });

      // Ping/Pong for health check
      this.socket.on("pong", (data) => {
        this.emit("pong", data);
      });

      return this.socket;
    } catch (error) {
      console.error("❌ Failed to connect to WebSocket:", error);
      this.emit("connection-error", { error });
      return null;
    }
  }

  /**
   * Disconnect from WebSocket server
   */
  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
      this.connected = false;
      this.listeners.clear();
      console.log("🔌 Disconnected from WebSocket");
    }
  }

  /**
   * Check if connected
   */
  isConnected() {
    return this.connected && this.socket && this.socket.connected;
  }

  /**
   * Join a room
   */
  joinRoom(room, userId = null) {
    if (!this.isConnected()) {
      console.error("⚠️ Cannot join room: not connected");
      return;
    }
    this.socket.emit("join-room", { room, userId });
  }

  /**
   * Leave a room
   */
  leaveRoom(room, userId = null) {
    if (!this.isConnected()) {
      console.error("⚠️ Cannot leave room: not connected");
      return;
    }
    this.socket.emit("leave-room", { room, userId });
  }

  /**
   * Subscribe to dashboard metrics
   */
  subscribeMetrics() {
    if (!this.isConnected()) {
      this.connect();
    }
    this.socket.emit("subscribe-metrics");
  }

  /**
   * Unsubscribe from dashboard metrics
   */
  unsubscribeMetrics() {
    if (this.isConnected()) {
      this.socket.emit("unsubscribe-metrics");
    }
  }

  /**
   * Subscribe to notifications for a user
   */
  subscribeNotifications(userId) {
    if (!this.isConnected()) {
      this.connect(userId);
    }
    this.socket.emit("subscribe-notifications", { userId });
    this.joinRoom(`notifications:${userId}`, userId);
  }

  /**
   * Unsubscribe from notifications
   */
  unsubscribeNotifications(userId) {
    if (this.isConnected()) {
      this.socket.emit("unsubscribe-notifications", { userId });
      this.leaveRoom(`notifications:${userId}`, userId);
    }
  }

  /**
   * Join Google Sheets collaborative editing room
   */
  joinSheetsRoom(spreadsheetId, userId = null) {
    const room = `sheets:${spreadsheetId}`;
    this.joinRoom(room, userId);
  }

  /**
   * Leave Google Sheets room
   */
  leaveSheetsRoom(spreadsheetId, userId = null) {
    const room = `sheets:${spreadsheetId}`;
    this.leaveRoom(room, userId);
  }

  /**
   * Send sheets edit event
   */
  sendSheetsEdit(spreadsheetId, range, value, userId = null) {
    if (!this.isConnected()) {
      console.error("⚠️ Cannot send sheets edit: not connected");
      return;
    }
    this.socket.emit("sheets-edit", {
      spreadsheetId,
      range,
      value,
      userId,
    });
  }

  /**
   * Send cursor position
   */
  sendCursorPosition(spreadsheetId, cell, userId = null) {
    if (!this.isConnected()) {
      return;
    }
    this.socket.emit("sheets-cursor", {
      spreadsheetId,
      cell,
      userId,
    });
  }

  /**
   * Listen to an event
   */
  on(event, callback) {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, []);
    }
    this.listeners.get(event).push(callback);

    // Also set up Socket.io listener
    if (this.socket) {
      this.socket.on(event, callback);
    }
  }

  /**
   * Remove event listener
   */
  off(event, callback) {
    const listeners = this.listeners.get(event);
    if (listeners) {
      const index = listeners.indexOf(callback);
      if (index > -1) {
        listeners.splice(index, 1);
      }
    }

    if (this.socket) {
      this.socket.off(event, callback);
    }
  }

  /**
   * Emit custom event to listeners
   */
  emit(event, data) {
    const listeners = this.listeners.get(event);
    if (listeners) {
      listeners.forEach((callback) => {
        try {
          callback(data);
        } catch (error) {
          console.error(`Error in listener for ${event}:`, error);
        }
      });
    }
  }

  /**
   * Get socket ID
   */
  getSocketId() {
    return this.socket ? this.socket.id : null;
  }
}

// Create singleton instance
export const websocketService = new WebSocketService();
export default websocketService;
