/**
 * =============================================================================
 * Role Service - MIA Warehouse Management
 * =============================================================================
 * Handles role management and role-based access control
 * =============================================================================
 */

import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:3001';
const API_BASE = `${API_URL}/api`;

/**
 * Get authorization headers
 */
const getAuthHeaders = () => {
  const token =
    localStorage.getItem('authToken') || localStorage.getItem('token');
  return {
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
  };
};

/**
 * Get all roles
 */
export const getAllRoles = async () => {
  try {
    const response = await axios.get(`${API_BASE}/roles`, getAuthHeaders());
    return response.data;
  } catch (error) {
    console.error('Get all roles error:', error);
    throw error.response?.data || error.message;
  }
};

/**
 * Get role by ID
 */
export const getRoleById = async (roleId) => {
  try {
    const response = await axios.get(
      `${API_BASE}/roles/${roleId}`,
      getAuthHeaders()
    );
    return response.data;
  } catch (error) {
    console.error('Get role by ID error:', error);
    throw error.response?.data || error.message;
  }
};

/**
 * Create new role
 */
export const createRole = async (roleData) => {
  try {
    const response = await axios.post(
      `${API_BASE}/roles`,
      roleData,
      getAuthHeaders()
    );
    return response.data;
  } catch (error) {
    console.error('Create role error:', error);
    throw error.response?.data || error.message;
  }
};

/**
 * Update role
 */
export const updateRole = async (roleId, roleData) => {
  try {
    const response = await axios.put(
      `${API_BASE}/roles/${roleId}`,
      roleData,
      getAuthHeaders()
    );
    return response.data;
  } catch (error) {
    console.error('Update role error:', error);
    throw error.response?.data || error.message;
  }
};

/**
 * Delete role
 */
export const deleteRole = async (roleId) => {
  try {
    const response = await axios.delete(
      `${API_BASE}/roles/${roleId}`,
      getAuthHeaders()
    );
    return response.data;
  } catch (error) {
    console.error('Delete role error:', error);
    throw error.response?.data || error.message;
  }
};

/**
 * Assign permissions to role
 */
export const assignPermissions = async (roleId, permissionIds) => {
  try {
    const response = await axios.post(
      `${API_BASE}/roles/${roleId}/permissions`,
      { permissionIds },
      getAuthHeaders()
    );
    return response.data;
  } catch (error) {
    console.error('Assign permissions error:', error);
    throw error.response?.data || error.message;
  }
};

/**
 * Remove permission from role
 */
export const removePermission = async (roleId, permissionId) => {
  try {
    const response = await axios.delete(
      `${API_BASE}/roles/${roleId}/permissions/${permissionId}`,
      getAuthHeaders()
    );
    return response.data;
  } catch (error) {
    console.error('Remove permission error:', error);
    throw error.response?.data || error.message;
  }
};

/**
 * Get users by role
 */
export const getUsersByRole = async (roleId) => {
  try {
    const response = await axios.get(
      `${API_BASE}/roles/${roleId}/users`,
      getAuthHeaders()
    );
    return response.data;
  } catch (error) {
    console.error('Get users by role error:', error);
    throw error.response?.data || error.message;
  }
};

/**
 * Get role permissions
 */
export const getRolePermissions = async (roleId) => {
  try {
    const response = await axios.get(
      `${API_BASE}/roles/${roleId}/permissions`,
      getAuthHeaders()
    );
    return response.data;
  } catch (error) {
    console.error('Get role permissions error:', error);
    throw error.response?.data || error.message;
  }
};

/**
 * Check if role has permission
 */
export const checkRolePermission = async (roleId, permissionName) => {
  try {
    const response = await axios.get(
      `${API_BASE}/roles/${roleId}/check-permission`,
      {
        ...getAuthHeaders(),
        params: { permission: permissionName },
      }
    );
    return response.data;
  } catch (error) {
    console.error('Check role permission error:', error);
    throw error.response?.data || error.message;
  }
};

/**
 * Get default roles
 */
export const getDefaultRoles = async () => {
  try {
    const response = await axios.get(
      `${API_BASE}/roles/defaults`,
      getAuthHeaders()
    );
    return response.data;
  } catch (error) {
    console.error('Get default roles error:', error);
    throw error.response?.data || error.message;
  }
};

export default {
  getAllRoles,
  getRoleById,
  createRole,
  updateRole,
  deleteRole,
  assignPermissions,
  removePermission,
  getUsersByRole,
  getRolePermissions,
  checkRolePermission,
  getDefaultRoles,
};
