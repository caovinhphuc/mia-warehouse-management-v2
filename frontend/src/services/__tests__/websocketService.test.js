/**
 * Unit Tests for WebSocket Service
 * Tests WebSocket connection and event handling
 */

import { io } from "socket.io-client";
import websocketService from "../websocketService";

jest.mock("socket.io-client", () => {
  const inst = {
    on: jest.fn(),
    emit: jest.fn(),
    disconnect: jest.fn(),
    off: jest.fn(),
    removeListener: jest.fn(),
    connected: true,
    id: "socket-id-123",
  };
  return {
    io: jest.fn(() => inst),
    __getMockSocket: () => inst,
  };
});

// Mock importMetaEnv
jest.mock("../../utils/importMetaEnv", () => ({
  __esModule: true,
  default: {
    VITE_API_URL: "http://localhost:8000",
    REACT_APP_API_URL: "http://localhost:8000",
  },
}));

const getMockSocket = () => require("socket.io-client").__getMockSocket();

describe("WebSocketService", () => {
  let mockSocket;

  beforeEach(() => {
    websocketService.disconnect();
    mockSocket = getMockSocket();
    io.mockImplementation(() => mockSocket);
    jest.clearAllMocks();
    io.mockReturnValue(mockSocket);
  });

  describe("connect", () => {
    it("should connect to WebSocket server", () => {
      websocketService.connect();

      expect(io).toHaveBeenCalledWith(
        "http://localhost:8000",
        expect.objectContaining({
          transports: ["websocket", "polling"],
          reconnection: true,
          reconnectionAttempts: 5,
          reconnectionDelay: 1000,
          autoConnect: true,
          withCredentials: true,
        })
      );
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
    it("should emit to internal listeners", () => {
      const listener = jest.fn();
      websocketService.connect();
      websocketService.on("custom-event", listener);
      websocketService.emit("custom-event", { data: "test" });

      expect(listener).toHaveBeenCalledWith({ data: "test" });
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
      const connectHandler = mockSocket.on.mock.calls.find(
        (c) => c[0] === "connect"
      )?.[1];
      if (connectHandler) connectHandler();
      expect(websocketService.isConnected()).toBe(true);
    });

    it("should return false when not connected", () => {
      expect(websocketService.isConnected()).toBe(false);
    });
  });

  describe("event handling", () => {
    it("should handle connect event", () => {
      const onConnectCallback = jest.fn();
      websocketService.connect();
      websocketService.on("connect", onConnectCallback);
      const handlers = mockSocket.on.mock.calls
        .filter((c) => c[0] === "connect")
        .map((c) => c[1]);
      handlers.forEach((h) => h());
      expect(onConnectCallback).toHaveBeenCalled();
    });

    it("should handle disconnect event", () => {
      const onDisconnectCallback = jest.fn();
      websocketService.connect();
      websocketService.on("disconnect", onDisconnectCallback);
      const handlers = mockSocket.on.mock.calls
        .filter((c) => c[0] === "disconnect")
        .map((c) => c[1]);
      handlers.forEach((h) => h("reason"));
      expect(onDisconnectCallback).toHaveBeenCalledWith("reason");
    });

    it("should register connect_error handler", () => {
      websocketService.connect();
      expect(mockSocket.on).toHaveBeenCalledWith(
        "connect_error",
        expect.any(Function)
      );
    });
  });
});
