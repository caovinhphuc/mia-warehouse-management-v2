/* eslint-disable */
/**
 * React Hook for WebSocket Connection
 * Provides easy access to WebSocket functionality
 */

import { useEffect, useState, useCallback, useRef } from "react";
import { websocketService } from "../services/websocketService";

export const useWebSocket = (userId = null, autoConnect = true) => {
  const [connected, setConnected] = useState(false);
  const [socketId, setSocketId] = useState(null);
  const [error, setError] = useState(null);
  const listenersRef = useRef([]);

  // Connect on mount
  useEffect(() => {
    if (autoConnect) {
      const socket = websocketService.connect(userId);

      // Set up connection listeners
      const onConnected = ({ socketId: id }) => {
        setConnected(true);
        setSocketId(id);
        setError(null);
      };

      const onDisconnected = () => {
        setConnected(false);
        setSocketId(null);
      };

      const onError = ({ error: err }) => {
        setError(err);
        setConnected(false);
      };

      websocketService.on("connected", onConnected);
      websocketService.on("disconnected", onDisconnected);
      websocketService.on("connection-error", onError);

      listenersRef.current = [
        { event: "connected", callback: onConnected },
        { event: "disconnected", callback: onDisconnected },
        { event: "connection-error", callback: onError },
      ];

      return () => {
        // Cleanup listeners
        listenersRef.current.forEach(({ event, callback }) => {
          websocketService.off(event, callback);
        });
      };
    }
  }, [userId, autoConnect]);

  // Disconnect on unmount
  useEffect(() => {
    return () => {
      if (!autoConnect) {
        websocketService.disconnect();
      }
    };
  }, [autoConnect]);

  // Subscribe to event
  const subscribe = useCallback((event, callback) => {
    websocketService.on(event, callback);
    listenersRef.current.push({ event, callback });

    return () => {
      websocketService.off(event, callback);
      const index = listenersRef.current.findIndex(
        (l) => l.event === event && l.callback === callback
      );
      if (index > -1) {
        listenersRef.current.splice(index, 1);
      }
    };
  }, []);

  // Unsubscribe from event
  const unsubscribe = useCallback((event, callback) => {
    websocketService.off(event, callback);
  }, []);

  return {
    connected,
    socketId,
    error,
    subscribe,
    unsubscribe,
    websocket: websocketService,
    connect: () => websocketService.connect(userId),
    disconnect: () => websocketService.disconnect(),
    isConnected: () => websocketService.isConnected(),
  };
};

export default useWebSocket;
