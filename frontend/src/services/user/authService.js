/**
 * =============================================================================
 * Auth Service - MIA Warehouse Management
 * =============================================================================
 * Handles authentication, authorization, and token management
 * =============================================================================
 */

import importMetaEnv from "@utils/importMetaEnv";
import axios from "axios";

const API_URL =
  importMetaEnv.VITE_API_URL ||
  importMetaEnv.REACT_APP_API_URL ||
  process.env.REACT_APP_API_URL ||
  "http://localhost:3001";
const API_BASE = `${API_URL}/api`;

/**
 * Login user
 */
export const login = async (credentials) => {
  try {
    const response = await axios.post(`${API_BASE}/auth/login`, credentials);

    if (response.data.token) {
      localStorage.setItem("authToken", response.data.token);
      localStorage.setItem("token", response.data.token);

      if (response.data.user) {
        localStorage.setItem("user", JSON.stringify(response.data.user));
      }
    }

    return response.data;
  } catch (error) {
    console.error("Login error:", error);
    throw error.response?.data || error.message;
  }
};

/**
 * Register new user
 */
export const register = async (userData) => {
  try {
    const response = await axios.post(`${API_BASE}/auth/register`, userData);

    if (response.data.token) {
      localStorage.setItem("authToken", response.data.token);
      localStorage.setItem("token", response.data.token);

      if (response.data.user) {
        localStorage.setItem("user", JSON.stringify(response.data.user));
      }
    }

    return response.data;
  } catch (error) {
    console.error("Register error:", error);
    throw error.response?.data || error.message;
  }
};

/**
 * Logout user
 */
export const logout = async () => {
  try {
    const token =
      localStorage.getItem("authToken") || localStorage.getItem("token");

    if (token) {
      await axios.post(
        `${API_BASE}/auth/logout`,
        {},
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
    }

    // Clear all auth data
    localStorage.removeItem("authToken");
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    localStorage.removeItem("permissions");
    localStorage.removeItem("roles");

    return { success: true };
  } catch (error) {
    console.error("Logout error:", error);
    // Clear local storage even if API call fails
    localStorage.removeItem("authToken");
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    return { success: true };
  }
};

/**
 * Refresh token
 */
export const refreshToken = async () => {
  try {
    const token =
      localStorage.getItem("authToken") || localStorage.getItem("token");

    const response = await axios.post(
      `${API_BASE}/auth/refresh`,
      {},
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    if (response.data.token) {
      localStorage.setItem("authToken", response.data.token);
      localStorage.setItem("token", response.data.token);
    }

    return response.data;
  } catch (error) {
    console.error("Refresh token error:", error);
    throw error.response?.data || error.message;
  }
};

/**
 * Verify token
 */
export const verifyToken = async (token) => {
  try {
    const response = await axios.post(`${API_BASE}/auth/verify`, { token });
    return response.data;
  } catch (error) {
    console.error("Verify token error:", error);
    throw error.response?.data || error.message;
  }
};

/**
 * Forgot password
 */
export const forgotPassword = async (email) => {
  try {
    const response = await axios.post(`${API_BASE}/auth/forgot-password`, {
      email,
    });
    return response.data;
  } catch (error) {
    console.error("Forgot password error:", error);
    throw error.response?.data || error.message;
  }
};

/**
 * Reset password with token
 */
export const resetPassword = async (token, newPassword) => {
  try {
    const response = await axios.post(`${API_BASE}/auth/reset-password`, {
      token,
      password: newPassword,
    });
    return response.data;
  } catch (error) {
    console.error("Reset password error:", error);
    throw error.response?.data || error.message;
  }
};

/**
 * Change password
 */
export const changePassword = async (currentPassword, newPassword) => {
  try {
    const token =
      localStorage.getItem("authToken") || localStorage.getItem("token");

    const response = await axios.post(
      `${API_BASE}/auth/change-password`,
      {
        currentPassword,
        newPassword,
      },
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );
    return response.data;
  } catch (error) {
    console.error("Change password error:", error);
    throw error.response?.data || error.message;
  }
};

/**
 * Get current user
 */
export const getCurrentUser = async () => {
  try {
    const token =
      localStorage.getItem("authToken") || localStorage.getItem("token");

    const response = await axios.get(`${API_BASE}/auth/me`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (response.data.user) {
      localStorage.setItem("user", JSON.stringify(response.data.user));
    }

    return response.data;
  } catch (error) {
    console.error("Get current user error:", error);
    throw error.response?.data || error.message;
  }
};

/**
 * Check if user is authenticated
 */
export const isAuthenticated = () => {
  const token =
    localStorage.getItem("authToken") || localStorage.getItem("token");
  return !!token;
};

/**
 * Get stored user
 */
export const getStoredUser = () => {
  try {
    const userStr = localStorage.getItem("user");
    return userStr ? JSON.parse(userStr) : null;
  } catch (error) {
    console.error("Get stored user error:", error);
    return null;
  }
};

/**
 * Get auth token
 */
export const getToken = () => {
  return (
    localStorage.getItem("authToken") || localStorage.getItem("token") || null
  );
};

/**
 * SSO Login (Google, GitHub, etc.)
 */
export const ssoLogin = async (provider, data) => {
  try {
    const response = await axios.post(`${API_BASE}/auth/sso/${provider}`, data);

    if (response.data.token) {
      localStorage.setItem("authToken", response.data.token);
      localStorage.setItem("token", response.data.token);

      if (response.data.user) {
        localStorage.setItem("user", JSON.stringify(response.data.user));
      }
    }

    return response.data;
  } catch (error) {
    console.error("SSO login error:", error);
    throw error.response?.data || error.message;
  }
};

/**
 * Verify email
 */
export const verifyEmail = async (token) => {
  try {
    const response = await axios.post(`${API_BASE}/auth/verify-email`, {
      token,
    });
    return response.data;
  } catch (error) {
    console.error("Verify email error:", error);
    throw error.response?.data || error.message;
  }
};

/**
 * Resend verification email
 */
export const resendVerificationEmail = async (email) => {
  try {
    const response = await axios.post(`${API_BASE}/auth/resend-verification`, {
      email,
    });
    return response.data;
  } catch (error) {
    console.error("Resend verification email error:", error);
    throw error.response?.data || error.message;
  }
};

export default {
  login,
  register,
  logout,
  refreshToken,
  verifyToken,
  forgotPassword,
  resetPassword,
  changePassword,
  getCurrentUser,
  isAuthenticated,
  getStoredUser,
  getToken,
  ssoLogin,
  verifyEmail,
  resendVerificationEmail,
};
