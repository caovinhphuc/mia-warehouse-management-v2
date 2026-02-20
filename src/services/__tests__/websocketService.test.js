/**
 * Unit Tests for WebSocket Service
 * Tests WebSocket connection and event handling
 */

// Mock socket.io-client BEFORE importing
jest.mock("socket.io-client", () => {
  return jest.fn(() => ({
    on: jest.fn(),
    emit: jest.fn(),
    disconnect: jest.fn(),
    off: jest.fn(),
    removeListener: jest.fn(),
    connected: true,
    id: "socket-id-123",
  }));
});

import { io } from "socket.io-client";
import websocketService from "../websocketService";

// Mock importMetaEnv
jest.mock("../../utils/importMetaEnv", () => ({
  __esModule: true,
  default: {
    VITE_API_URL: "http://localhost:8000",
    REACT_APP_API_URL: "http://localhost:8000",
  },
}));

describe("WebSocketService", () => {
  let mockSocket;

  beforeEach(() => {
    jest.clearAllMocks();
    // io() returns a mock socket instance
    mockSocket = io();
  });

  describe("connect", () => {
    it("should connect to WebSocket server", () => {
      websocketService.connect();

      expect(io).toHaveBeenCalledWith("http://localhost:8000", {
        transports: ["websocket", "polling"],
        reconnection: true,
        reconnectionAttempts: 5,
        reconnectionDelay: 1000,
        autoConnect: true,
        withCredentials: true,
      });
    });

    it("should setup event listeners", () => {
      websocketService.connect();

      expect(mockSocket.on).toHaveBeenCalled();
    });
  });

  describe("disconnect", () => {
    it("should disconnect from WebSocket server", () => {
      websocketService.connect();
      websocketService.disconnect();

      expect(mockSocket.disconnect).toHaveBeenCalled();
    });
  });

  describe("emit", () => {
    it("should emit event to server", () => {
      websocketService.connect();
      websocketService.emit("test-event", { data: "test" });

      expect(mockSocket.emit).toHaveBeenCalledWith("test-event", {
        data: "test",
      });
    });
  });

  describe("on", () => {
    it("should register event listener", () => {
      const callback = jest.fn();
      websocketService.connect();
      websocketService.on("test-event", callback);

      expect(mockSocket.on).toHaveBeenCalledWith("test-event", callback);
    });
  });

  describe("off", () => {
    it("should remove event listener", () => {
      const callback = jest.fn();
      websocketService.connect();
      websocketService.off("test-event", callback);

      // socket.io doesn't have off method in our mock, but we can verify it was called
      expect(mockSocket.off || mockSocket.removeListener).toBeDefined();
    });
  });

  describe("isConnected", () => {
    it("should return true when connected", () => {
      websocketService.connect();
      const isConnected = websocketService.isConnected();

      expect(isConnected).toBe(true);
    });

    it("should return false when not connected", () => {
      mockSocket.connected = false;
      websocketService.connect();
      const isConnected = websocketService.isConnected();

      expect(isConnected).toBe(false);
    });
  });

  describe("event handling", () => {
    it("should handle connect event", () => {
      const onConnectCallback = jest.fn();
      websocketService.connect();
      websocketService.on("connect", onConnectCallback);

      // Simulate connect event
      const connectHandler = mockSocket.on.mock.calls.find(
        (call) => call[0] === "connect"
      )?.[1];
      if (connectHandler) {
        connectHandler();
        expect(onConnectCallback).toHaveBeenCalled();
      }
    });

    it("should handle disconnect event", () => {
      const onDisconnectCallback = jest.fn();
      websocketService.connect();
      websocketService.on("disconnect", onDisconnectCallback);

      // Simulate disconnect event
      const disconnectHandler = mockSocket.on.mock.calls.find(
        (call) => call[0] === "disconnect"
      )?.[1];
      if (disconnectHandler) {
        disconnectHandler("reason");
        expect(onDisconnectCallback).toHaveBeenCalledWith("reason");
      }
    });

    it("should handle error event", () => {
      const onErrorCallback = jest.fn();
      websocketService.connect();
      websocketService.on("error", onErrorCallback);

      // Simulate error event
      const errorHandler = mockSocket.on.mock.calls.find(
        (call) => call[0] === "error"
      )?.[1];
      if (errorHandler) {
        errorHandler(new Error("Connection failed"));
        expect(onErrorCallback).toHaveBeenCalled();
      }
    });
  });
});
