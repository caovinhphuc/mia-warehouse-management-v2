/**
 * =============================================================================
 * Google Sheets Auth Context - MIA Warehouse Management
 * =============================================================================
 * Provides Google Sheets authentication state and methods
 * =============================================================================
 */

import React, { createContext, useContext, useState, useCallback } from "react";
import { message } from "antd";
import axios from "axios";

const GoogleSheetsAuthContext = createContext(null);

const API_URL = process.env.REACT_APP_API_URL || "http://localhost:3001";

export const GoogleSheetsAuthProvider = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  /**
   * Check authentication status
   */
  const checkAuth = useCallback(async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("googleSheetsToken");

      if (!token) {
        setIsAuthenticated(false);
        setUser(null);
        return false;
      }

      const response = await axios.get(`${API_URL}/api/google/auth/status`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.data.authenticated) {
        setIsAuthenticated(true);
        setUser(response.data.user);
        return true;
      } else {
        setIsAuthenticated(false);
        setUser(null);
        localStorage.removeItem("googleSheetsToken");
        return false;
      }
    } catch (error) {
      console.error("Check auth error:", error);
      setIsAuthenticated(false);
      setUser(null);
      setError(error.message);
      return false;
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Initiate Google Sheets OAuth flow
   */
  const login = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await axios.get(`${API_URL}/api/google/auth/url`);
      const authUrl = response.data.url;

      // Open OAuth window
      const width = 600;
      const height = 700;
      const left = window.screen.width / 2 - width / 2;
      const top = window.screen.height / 2 - height / 2;

      const authWindow = window.open(
        authUrl,
        "Google Sheets Authorization",
        `width=${width},height=${height},left=${left},top=${top}`
      );

      // Listen for OAuth callback
      return new Promise((resolve, reject) => {
        const checkWindow = setInterval(() => {
          try {
            if (authWindow.closed) {
              clearInterval(checkWindow);
              checkAuth().then(resolve).catch(reject);
            }
          } catch (error) {
            // Cross-origin error expected
          }
        }, 500);

        // Timeout after 5 minutes
        setTimeout(() => {
          clearInterval(checkWindow);
          if (!authWindow.closed) {
            authWindow.close();
          }
          reject(new Error("Authentication timeout"));
        }, 300000);
      });
    } catch (error) {
      console.error("Login error:", error);
      setError(error.message);
      message.error("Failed to initialize Google Sheets authentication");
      throw error;
    } finally {
      setLoading(false);
    }
  }, [checkAuth]);

  /**
   * Handle OAuth callback
   */
  const handleCallback = useCallback(async (code) => {
    try {
      setLoading(true);
      setError(null);

      const response = await axios.post(`${API_URL}/api/google/auth/callback`, {
        code,
      });

      if (response.data.token) {
        localStorage.setItem("googleSheetsToken", response.data.token);
        setIsAuthenticated(true);
        setUser(response.data.user);
        message.success("Successfully authenticated with Google Sheets");
        return true;
      }

      return false;
    } catch (error) {
      console.error("Callback error:", error);
      setError(error.message);
      message.error("Failed to complete Google Sheets authentication");
      return false;
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Logout from Google Sheets
   */
  const logout = useCallback(async () => {
    try {
      setLoading(true);

      const token = localStorage.getItem("googleSheetsToken");
      if (token) {
        await axios.post(
          `${API_URL}/api/google/auth/logout`,
          {},
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );
      }

      localStorage.removeItem("googleSheetsToken");
      setIsAuthenticated(false);
      setUser(null);
      message.success("Logged out from Google Sheets");
    } catch (error) {
      console.error("Logout error:", error);
      // Clear local state anyway
      localStorage.removeItem("googleSheetsToken");
      setIsAuthenticated(false);
      setUser(null);
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Refresh authentication
   */
  const refresh = useCallback(async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("googleSheetsToken");

      if (!token) {
        return false;
      }

      const response = await axios.post(
        `${API_URL}/api/google/auth/refresh`,
        {},
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.data.token) {
        localStorage.setItem("googleSheetsToken", response.data.token);
        return true;
      }

      return false;
    } catch (error) {
      console.error("Refresh error:", error);
      setError(error.message);
      return false;
    } finally {
      setLoading(false);
    }
  }, []);

  const value = {
    isAuthenticated,
    user,
    loading,
    error,
    checkAuth,
    login,
    logout,
    handleCallback,
    refresh,
  };

  return (
    <GoogleSheetsAuthContext.Provider value={value}>
      {children}
    </GoogleSheetsAuthContext.Provider>
  );
};

/**
 * Hook to use Google Sheets Auth context
 */
export const useGoogleSheetsAuth = () => {
  const context = useContext(GoogleSheetsAuthContext);

  if (!context) {
    throw new Error(
      "useGoogleSheetsAuth must be used within GoogleSheetsAuthProvider"
    );
  }

  return context;
};

export default GoogleSheetsAuthContext;
