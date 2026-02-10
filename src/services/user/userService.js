/**
 * =============================================================================
 * User Service - MIA Warehouse Management
 * =============================================================================
 * Handles user CRUD operations and user-related API calls
 * =============================================================================
 */

import axios from "axios";

const API_URL = process.env.REACT_APP_API_URL || "http://localhost:3001";
const API_BASE = `${API_URL}/api`;

/**
 * Get authorization headers
 */
const getAuthHeaders = () => {
  const token =
    localStorage.getItem("authToken") || localStorage.getItem("token");
  return {
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
  };
};

/**
 * Get all users
 */
export const getAllUsers = async (params = {}) => {
  try {
    const response = await axios.get(`${API_BASE}/users`, {
      ...getAuthHeaders(),
      params,
    });
    return response.data;
  } catch (error) {
    console.error("Get all users error:", error);
    throw error.response?.data || error.message;
  }
};

/**
 * Get user by ID
 */
export const getUserById = async (userId) => {
  try {
    const response = await axios.get(
      `${API_BASE}/users/${userId}`,
      getAuthHeaders()
    );
    return response.data;
  } catch (error) {
    console.error("Get user by ID error:", error);
    throw error.response?.data || error.message;
  }
};

/**
 * Get current user profile
 */
export const getCurrentUser = async () => {
  try {
    const response = await axios.get(`${API_BASE}/users/me`, getAuthHeaders());
    return response.data;
  } catch (error) {
    console.error("Get current user error:", error);
    throw error.response?.data || error.message;
  }
};

/**
 * Create new user
 */
export const createUser = async (userData) => {
  try {
    const response = await axios.post(
      `${API_BASE}/users`,
      userData,
      getAuthHeaders()
    );
    return response.data;
  } catch (error) {
    console.error("Create user error:", error);
    throw error.response?.data || error.message;
  }
};

/**
 * Update user
 */
export const updateUser = async (userId, userData) => {
  try {
    const response = await axios.put(
      `${API_BASE}/users/${userId}`,
      userData,
      getAuthHeaders()
    );
    return response.data;
  } catch (error) {
    console.error("Update user error:", error);
    throw error.response?.data || error.message;
  }
};

/**
 * Update current user profile
 */
export const updateProfile = async (profileData) => {
  try {
    const response = await axios.put(
      `${API_BASE}/users/me`,
      profileData,
      getAuthHeaders()
    );
    return response.data;
  } catch (error) {
    console.error("Update profile error:", error);
    throw error.response?.data || error.message;
  }
};

/**
 * Delete user
 */
export const deleteUser = async (userId) => {
  try {
    const response = await axios.delete(
      `${API_BASE}/users/${userId}`,
      getAuthHeaders()
    );
    return response.data;
  } catch (error) {
    console.error("Delete user error:", error);
    throw error.response?.data || error.message;
  }
};

/**
 * Change user password
 */
export const changePassword = async (passwordData) => {
  try {
    const response = await axios.post(
      `${API_BASE}/users/change-password`,
      passwordData,
      getAuthHeaders()
    );
    return response.data;
  } catch (error) {
    console.error("Change password error:", error);
    throw error.response?.data || error.message;
  }
};

/**
 * Reset password
 */
export const resetPassword = async (email) => {
  try {
    const response = await axios.post(`${API_BASE}/users/reset-password`, {
      email,
    });
    return response.data;
  } catch (error) {
    console.error("Reset password error:", error);
    throw error.response?.data || error.message;
  }
};

/**
 * Activate/Deactivate user
 */
export const toggleUserStatus = async (userId, isActive) => {
  try {
    const response = await axios.patch(
      `${API_BASE}/users/${userId}/status`,
      { isActive },
      getAuthHeaders()
    );
    return response.data;
  } catch (error) {
    console.error("Toggle user status error:", error);
    throw error.response?.data || error.message;
  }
};

/**
 * Assign role to user
 */
export const assignRole = async (userId, roleId) => {
  try {
    const response = await axios.post(
      `${API_BASE}/users/${userId}/roles`,
      { roleId },
      getAuthHeaders()
    );
    return response.data;
  } catch (error) {
    console.error("Assign role error:", error);
    throw error.response?.data || error.message;
  }
};

/**
 * Remove role from user
 */
export const removeRole = async (userId, roleId) => {
  try {
    const response = await axios.delete(
      `${API_BASE}/users/${userId}/roles/${roleId}`,
      getAuthHeaders()
    );
    return response.data;
  } catch (error) {
    console.error("Remove role error:", error);
    throw error.response?.data || error.message;
  }
};

/**
 * Get user activity logs
 */
export const getUserActivityLogs = async (userId, params = {}) => {
  try {
    const response = await axios.get(`${API_BASE}/users/${userId}/logs`, {
      ...getAuthHeaders(),
      params,
    });
    return response.data;
  } catch (error) {
    console.error("Get user activity logs error:", error);
    throw error.response?.data || error.message;
  }
};

/**
 * Search users
 */
export const searchUsers = async (query, filters = {}) => {
  try {
    const response = await axios.get(`${API_BASE}/users/search`, {
      ...getAuthHeaders(),
      params: { q: query, ...filters },
    });
    return response.data;
  } catch (error) {
    console.error("Search users error:", error);
    throw error.response?.data || error.message;
  }
};

export default {
  getAllUsers,
  getUserById,
  getCurrentUser,
  createUser,
  updateUser,
  updateProfile,
  deleteUser,
  changePassword,
  resetPassword,
  toggleUserStatus,
  assignRole,
  removeRole,
  getUserActivityLogs,
  searchUsers,
};
