/**
 * 🔐 Enterprise Security Service
 *
 * Service layer for Enterprise Security APIs (Auth, MFA, SSO, RBAC, Audit)
 */

const API_BASE_URL =
  import.meta.env.VITE_API_URL ||
  import.meta.env.REACT_APP_API_URL ||
  "http://localhost:3001";

/**
 * Get authentication token from localStorage
 */
const getAuthToken = () => {
  return localStorage.getItem("authToken") || localStorage.getItem("token");
};

/**
 * Set authentication token to localStorage
 */
const setAuthToken = (token) => {
  localStorage.setItem("authToken", token);
  localStorage.setItem("token", token);
};

/**
 * Remove authentication token from localStorage
 */
const removeAuthToken = () => {
  localStorage.removeItem("authToken");
  localStorage.removeItem("token");
};

/**
 * Make authenticated API request
 * Returns Response object, not JSON
 */
const authenticatedFetchResponse = async (url, options = {}) => {
  const token = getAuthToken();
  const headers = {
    "Content-Type": "application/json",
    ...options.headers,
  };

  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  const fullUrl = url.startsWith("http") ? url : `${API_BASE_URL}${url}`;

  return fetch(fullUrl, {
    ...options,
    headers,
  });
};

/**
 * Make authenticated API request (returns JSON)
 */
const authenticatedFetch = async (url, options = {}) => {
  const token = getAuthToken();
  const headers = {
    "Content-Type": "application/json",
    ...options.headers,
  };

  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  const fullUrl = url.startsWith("http") ? url : `${API_BASE_URL}${url}`;

  const response = await fetch(fullUrl, {
    ...options,
    headers,
  });

  if (response.status === 401) {
    removeAuthToken();
    // Không redirect ngay, để component xử lý
    throw new Error("Unauthorized");
  }

  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    throw new Error(error.error || `HTTP error! status: ${response.status}`);
  }

  return response.json();
};

// ==================== AUTHENTICATION ====================

/**
 * Register new user
 */
export const registerUser = async (email, password, role = "user") => {
  try {
    const response = await fetch(`${API_BASE_URL}/api/auth/register`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ email, password, role }),
    });

    const data = await response.json();

    if (!response.ok || !data.success) {
      throw new Error(data.error || "Registration failed");
    }

    return data.data;
  } catch (error) {
    console.error("Register error:", error);
    throw error;
  }
};

/**
 * Login user
 */
export const loginUser = async (email, password, mfaToken = null) => {
  try {
    const response = await fetch(`${API_BASE_URL}/api/auth/login`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ email, password, mfaToken }),
    });

    const data = await response.json();

    if (!response.ok || !data.success) {
      throw new Error(data.error || "Login failed");
    }

    // If MFA is required
    if (data.requiresMFA) {
      return { requiresMFA: true, message: data.message };
    }

    // Set token and return user data
    if (data.data?.token) {
      setAuthToken(data.data.token);
    }

    return data.data;
  } catch (error) {
    console.error("Login error:", error);
    throw error;
  }
};

/**
 * Logout user
 * @param {string|null} sessionId - Specific session ID to logout (optional)
 * @param {boolean} logoutAll - If true, logout from all devices/sessions
 * @returns {Promise<boolean>}
 */
export const logoutUser = async (sessionId = null, logoutAll = false) => {
  try {
    const token = getAuthToken();
    if (token) {
      try {
        await authenticatedFetch(`${API_BASE_URL}/api/auth/logout`, {
          method: "POST",
          body: JSON.stringify({ sessionId, logoutAll }),
        });
      } catch (apiError) {
        // Even if API call fails, continue with local cleanup
        console.warn(
          "Logout API call failed, but continuing with local cleanup:",
          apiError,
        );
      }
    }

    // Always cleanup local storage and state
    removeAuthToken();
    localStorage.removeItem("sessionId");
    localStorage.removeItem("token");

    return true;
  } catch (error) {
    console.error("Logout error:", error);
    // Always cleanup even if there's an error
    removeAuthToken();
    localStorage.removeItem("sessionId");
    localStorage.removeItem("token");
    throw error;
  }
};

/**
 * Get current user profile
 */
export const getCurrentUser = async () => {
  try {
    const data = await authenticatedFetch(`${API_BASE_URL}/api/auth/me`);
    return data.data;
  } catch (error) {
    console.error("Get current user error:", error);
    throw error;
  }
};

// ==================== MFA ====================

/**
 * Generate MFA secret and QR code
 */
export const generateMFASecret = async () => {
  try {
    const data = await authenticatedFetch(
      `${API_BASE_URL}/api/auth/mfa/generate`,
      {
        method: "POST",
      },
    );
    return data.data;
  } catch (error) {
    console.error("Generate MFA secret error:", error);
    throw error;
  }
};

/**
 * Enable MFA for user
 */
export const enableMFA = async (token) => {
  try {
    const data = await authenticatedFetch(
      `${API_BASE_URL}/api/auth/mfa/enable`,
      {
        method: "POST",
        body: JSON.stringify({ token }),
      },
    );
    return data;
  } catch (error) {
    console.error("Enable MFA error:", error);
    throw error;
  }
};

/**
 * Disable MFA for user
 */
export const disableMFA = async () => {
  try {
    const data = await authenticatedFetch(
      `${API_BASE_URL}/api/auth/mfa/disable`,
      {
        method: "POST",
      },
    );
    return data;
  } catch (error) {
    console.error("Disable MFA error:", error);
    throw error;
  }
};

// ==================== SSO ====================

/**
 * Get SSO authorization URL
 */
export const getSSOAuthUrl = async (provider) => {
  try {
    // Use non-authenticated fetch for SSO login
    const response = await fetch(`${API_BASE_URL}/api/auth/sso/${provider}`);

    if (!response.ok) {
      const error = await response.json().catch(() => ({}));
      throw new Error(error.error || `HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    return data.data;
  } catch (error) {
    console.error("Get SSO auth URL error:", error);
    throw error;
  }
};

/**
 * Handle SSO callback
 */
export const handleSSOCallback = async (provider, code, state) => {
  try {
    const response = await fetch(
      `${API_BASE_URL}/api/auth/sso/${provider}/callback?code=${code}&state=${state}`,
      {
        method: "GET",
      },
    );

    const data = await response.json();

    if (!response.ok || !data.success) {
      throw new Error(data.error || "SSO callback failed");
    }

    // Set token and return user data
    if (data.data?.token) {
      setAuthToken(data.data.token);
    }

    return data.data;
  } catch (error) {
    console.error("SSO callback error:", error);
    throw error;
  }
};

// ==================== USER MANAGEMENT ====================

/**
 * Get all users
 */
export const getAllUsers = async () => {
  try {
    const data = await authenticatedFetch(`${API_BASE_URL}/api/auth/users`);
    return data.data;
  } catch (error) {
    console.error("Get all users error:", error);
    throw error;
  }
};

/**
 * Get user by ID
 */
export const getUserById = async (userId) => {
  try {
    const data = await authenticatedFetch(
      `${API_BASE_URL}/api/auth/users/${userId}`,
    );
    return data.data;
  } catch (error) {
    console.error("Get user error:", error);
    throw error;
  }
};

/**
 * Update user role
 */
export const updateUserRole = async (userId, role) => {
  try {
    const data = await authenticatedFetch(
      `${API_BASE_URL}/api/auth/users/${userId}/role`,
      {
        method: "PUT",
        body: JSON.stringify({ role }),
      },
    );
    return data.data;
  } catch (error) {
    console.error("Update user role error:", error);
    throw error;
  }
};

/**
 * Delete user
 */
export const deleteUser = async (userId) => {
  try {
    const data = await authenticatedFetch(
      `${API_BASE_URL}/api/auth/users/${userId}`,
      {
        method: "DELETE",
      },
    );
    return data;
  } catch (error) {
    console.error("Delete user error:", error);
    throw error;
  }
};

// ==================== AUDIT LOGS ====================

/**
 * Query audit logs
 */
export const queryAuditLogs = async (filters = {}) => {
  try {
    const queryParams = new URLSearchParams();
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== "") {
        queryParams.append(key, value);
      }
    });

    const data = await authenticatedFetch(
      `${API_BASE_URL}/api/audit/logs?${queryParams.toString()}`,
    );
    return data.data;
  } catch (error) {
    console.error("Query audit logs error:", error);
    throw error;
  }
};

/**
 * Get audit statistics
 */
export const getAuditStatistics = async (filters = {}) => {
  try {
    const queryParams = new URLSearchParams();
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== "") {
        queryParams.append(key, value);
      }
    });

    const data = await authenticatedFetch(
      `${API_BASE_URL}/api/audit/statistics?${queryParams.toString()}`,
    );
    return data.data;
  } catch (error) {
    console.error("Get audit statistics error:", error);
    throw error;
  }
};

/**
 * Generate compliance report
 */
export const generateComplianceReport = async (startDate, endDate) => {
  try {
    const data = await authenticatedFetch(
      `${API_BASE_URL}/api/audit/compliance/report`,
      {
        method: "POST",
        body: JSON.stringify({ startDate, endDate }),
      },
    );
    return data.data;
  } catch (error) {
    console.error("Generate compliance report error:", error);
    throw error;
  }
};

// ==================== EXPORTS ====================

export default {
  // Auth
  registerUser,
  loginUser,
  logoutUser,
  authenticatedFetchResponse,
  getCurrentUser,
  getAuthToken,
  setAuthToken,
  removeAuthToken,

  // MFA
  generateMFASecret,
  enableMFA,
  disableMFA,

  // SSO
  getSSOAuthUrl,
  handleSSOCallback,

  // User Management
  getAllUsers,
  getUserById,
  updateUserRole,
  deleteUser,

  // Audit Logs
  queryAuditLogs,
  getAuditStatistics,
  generateComplianceReport,
};
