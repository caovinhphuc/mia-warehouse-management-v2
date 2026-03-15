/**
 * =============================================================================
 * Permission Service - MIA Warehouse Management
 * =============================================================================
 * Handles permission management and access control
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
 * Get all permissions
 */
export const getAllPermissions = async () => {
  try {
    const response = await axios.get(
      `${API_BASE}/permissions`,
      getAuthHeaders()
    );
    return response.data;
  } catch (error) {
    console.error("Get all permissions error:", error);
    throw error.response?.data || error.message;
  }
};

/**
 * Get permission by ID
 */
export const getPermissionById = async (permissionId) => {
  try {
    const response = await axios.get(
      `${API_BASE}/permissions/${permissionId}`,
      getAuthHeaders()
    );
    return response.data;
  } catch (error) {
    console.error("Get permission by ID error:", error);
    throw error.response?.data || error.message;
  }
};

/**
 * Create new permission
 */
export const createPermission = async (permissionData) => {
  try {
    const response = await axios.post(
      `${API_BASE}/permissions`,
      permissionData,
      getAuthHeaders()
    );
    return response.data;
  } catch (error) {
    console.error("Create permission error:", error);
    throw error.response?.data || error.message;
  }
};

/**
 * Update permission
 */
export const updatePermission = async (permissionId, permissionData) => {
  try {
    const response = await axios.put(
      `${API_BASE}/permissions/${permissionId}`,
      permissionData,
      getAuthHeaders()
    );
    return response.data;
  } catch (error) {
    console.error("Update permission error:", error);
    throw error.response?.data || error.message;
  }
};

/**
 * Delete permission
 */
export const deletePermission = async (permissionId) => {
  try {
    const response = await axios.delete(
      `${API_BASE}/permissions/${permissionId}`,
      getAuthHeaders()
    );
    return response.data;
  } catch (error) {
    console.error("Delete permission error:", error);
    throw error.response?.data || error.message;
  }
};

/**
 * Get permissions by category
 */
export const getPermissionsByCategory = async (category) => {
  try {
    const response = await axios.get(`${API_BASE}/permissions/category`, {
      ...getAuthHeaders(),
      params: { category },
    });
    return response.data;
  } catch (error) {
    console.error("Get permissions by category error:", error);
    throw error.response?.data || error.message;
  }
};

/**
 * Check user permission
 */
export const checkUserPermission = async (permissionName) => {
  try {
    const response = await axios.get(`${API_BASE}/permissions/check`, {
      ...getAuthHeaders(),
      params: { permission: permissionName },
    });
    return response.data;
  } catch (error) {
    console.error("Check user permission error:", error);
    throw error.response?.data || error.message;
  }
};

/**
 * Get user permissions
 */
export const getUserPermissions = async () => {
  try {
    const response = await axios.get(
      `${API_BASE}/permissions/me`,
      getAuthHeaders()
    );
    return response.data;
  } catch (error) {
    console.error("Get user permissions error:", error);
    throw error.response?.data || error.message;
  }
};

/**
 * Get roles with permission
 */
export const getRolesWithPermission = async (permissionId) => {
  try {
    const response = await axios.get(
      `${API_BASE}/permissions/${permissionId}/roles`,
      getAuthHeaders()
    );
    return response.data;
  } catch (error) {
    console.error("Get roles with permission error:", error);
    throw error.response?.data || error.message;
  }
};

/**
 * Bulk create permissions
 */
export const bulkCreatePermissions = async (permissionsData) => {
  try {
    const response = await axios.post(
      `${API_BASE}/permissions/bulk`,
      { permissions: permissionsData },
      getAuthHeaders()
    );
    return response.data;
  } catch (error) {
    console.error("Bulk create permissions error:", error);
    throw error.response?.data || error.message;
  }
};

/**
 * Get permission categories
 */
export const getPermissionCategories = async () => {
  try {
    const response = await axios.get(
      `${API_BASE}/permissions/categories`,
      getAuthHeaders()
    );
    return response.data;
  } catch (error) {
    console.error("Get permission categories error:", error);
    throw error.response?.data || error.message;
  }
};

export default {
  getAllPermissions,
  getPermissionById,
  createPermission,
  updatePermission,
  deletePermission,
  getPermissionsByCategory,
  checkUserPermission,
  getUserPermissions,
  getRolesWithPermission,
  bulkCreatePermissions,
  getPermissionCategories,
};
