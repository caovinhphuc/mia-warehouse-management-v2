import importMetaEnv from "../utils/importMetaEnv";

/**
 * 🔐 Enterprise Security Service
 *
 * Service layer for Enterprise Security APIs (Auth, MFA, SSO, RBAC, Audit)
 */

const API_BASE_URL =
  importMetaEnv.VITE_API_URL ||
  importMetaEnv.REACT_APP_API_URL ||
  process.env.REACT_APP_API_URL ||
  "http://localhost:3001"; // Backend API port (not AI Service)

/**
 * Check if backend is available
 */
export const checkBackendConnection = async () => {
  // In development, always return true if we can reach the backend
  if (process.env.NODE_ENV === "development") {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 3000); // 3 second timeout

      const response = await fetch(`${API_BASE_URL}/health`, {
        method: "GET",
        signal: controller.signal,
      });

      clearTimeout(timeoutId);
      if (response.ok) return true;

      // If health check fails, still return true in dev mode
      console.warn(
        "Backend health check failed, but allowing in development mode"
      );
      return true;
    } catch (error) {
      // Network error in development - still allow
      console.warn(
        "Backend connection check failed in development:",
        error.message
      );
      return true;
    }
  }

  // Production mode - timeout 60s (Render cold start có thể mất 30-60s)
  try {
    const controller = new AbortController();
    const timeoutMs = 60000; // 60s cho Render free tier cold start
    const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

    const response = await fetch(`${API_BASE_URL}/health`, {
      method: "GET",
      signal: controller.signal,
      mode: "cors",
    });

    clearTimeout(timeoutId);
    return response.ok;
  } catch (error) {
    return false;
  }
};

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
 * Check if user has valid token (sync)
 */
export const isAuthenticated = () => !!getAuthToken();

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

    // Check if response is HTML (error page)
    const contentType = response.headers.get("content-type");
    if (contentType && !contentType.includes("application/json")) {
      const text = await response.text();
      console.error(
        "Backend returned non-JSON response:",
        text.substring(0, 200)
      );
      throw new Error(
        `Backend error: Received HTML instead of JSON. Status: ${response.status}`
      );
    }

    const data = await response.json();

    if (!response.ok || !data.success) {
      throw new Error(data.error || "Registration failed");
    }

    return data.data;
  } catch (error) {
    console.error("Register error:", error);

    // Improved error message for network errors
    if (error.message === "Failed to fetch" || error.name === "TypeError") {
      throw new Error(
        `Không thể kết nối đến backend server. Vui lòng kiểm tra:\n` +
          `1. Backend có đang chạy không? (${API_BASE_URL})\n` +
          `2. Kiểm tra kết nối mạng\n` +
          `3. Kiểm tra CORS settings`
      );
    }

    throw error;
  }
};

/**
 * Verify one.tga.com.vn login credentials
 * This checks if credentials are valid for one.tga.com.vn before proceeding
 */
export const verifyOneTGALogin = async (email, password) => {
  try {
    const response = await fetch(`${API_BASE_URL}/api/auth/verify-one-tga`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ email, password }),
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({}));
      throw new Error(
        error.error ||
          "❌ Không thể xác thực với one.tga.com.vn. " +
            "Vui lòng kiểm tra lại email và password."
      );
    }

    const data = await response.json();
    return data.success === true && data.valid === true;
  } catch (error) {
    console.error("One TGA verification error:", error);

    // If backend is not available, allow login to proceed (for development)
    if (error.message === "Failed to fetch" || error.name === "TypeError") {
      console.warn(
        "One TGA verification skipped - backend may not be available"
      );
      return true; // Allow login to proceed in development mode
    }

    throw error;
  }
};

/**
 * Login user
 */
export const loginUser = async (email, password, mfaToken = null) => {
  try {
    // Step 1: Check backend connection FIRST
    const isBackendAvailable = await checkBackendConnection();

    // Step 2: Verify one.tga.com.vn login (CHỈ khi backend đã chạy)
    // Điều kiện tiên quyết: Phải đăng nhập one.tga.com.vn thành công
    const ONE_TGA_VERIFICATION_ENABLED =
      process.env.REACT_APP_ENABLE_ONE_TGA_VERIFICATION !== "false";

    // CHỈ verify one.tga.com.vn khi backend đã chạy
    if (ONE_TGA_VERIFICATION_ENABLED && isBackendAvailable) {
      try {
        const isOneTGAValid = await verifyOneTGALogin(email, password);
        if (!isOneTGAValid) {
          throw new Error(
            "❌ Đăng nhập vào one.tga.com.vn không thành công.\n" +
              "Vui lòng kiểm tra lại email và password của hệ thống one.tga.com.vn.\n" +
              "Chỉ khi đăng nhập one.tga.com.vn thành công, bạn mới có thể tiếp tục các bước sau."
          );
        }
        // ✅ One TGA login thành công - tiếp tục các bước sau
      } catch (error) {
        // If verification fails with specific error about one.tga.com.vn, throw it
        if (
          error.message.includes("one.tga.com.vn") ||
          error.message.includes("one TGA") ||
          error.message.includes("Đăng nhập vào")
        ) {
          throw error;
        }
        // Otherwise, log warning but allow to proceed (backend may not be configured)
        console.warn("One TGA verification skipped:", error.message);
      }
    } else if (ONE_TGA_VERIFICATION_ENABLED && !isBackendAvailable) {
      // Backend không chạy → skip one.tga.com.vn verification
      console.warn(
        "⚠️ One TGA verification bị skip vì backend không chạy. " +
          "Vui lòng start backend để sử dụng tính năng này."
      );
    }

    // Bỏ block health check - gọi login trực tiếp. Nếu fail (CORS, timeout) sẽ có lỗi rõ ràng ở catch

    // eslint-disable-next-line no-undef
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 60000); // 60s - Render cold start

    const response = await fetch(`${API_BASE_URL}/api/auth/login`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ email, password, mfaToken }),
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    // Check if response is HTML (error page)
    const contentType = response.headers.get("content-type");
    if (contentType && !contentType.includes("application/json")) {
      const text = await response.text();

      console.error(
        "Backend returned non-JSON response:",
        text.substring(0, 200)
      );
      throw new Error(
        `Backend error: Received HTML instead of JSON. Status: ${response.status}. ` +
          `Có thể backend đang trả về error page.`
      );
    }

    const data = await response.json();

    if (!response.ok || !data.success) {
      throw new Error(data.error || data.message || "Đăng nhập thất bại");
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

    // Handle specific error types
    if (error.name === "AbortError") {
      throw new Error(
        `Request timeout: Backend không phản hồi trong 60 giây (Render có thể đang cold start). ` +
          `Vui lòng kiểm tra backend server tại ${API_BASE_URL}`
      );
    }

    if (error.message === "Failed to fetch" || error.name === "TypeError") {
      const isProd =
        API_BASE_URL.includes("render.com") || API_BASE_URL.includes("netlify");
      const hints = isProd
        ? `1. Render cold start: đợi 30-60s rồi thử lại\n2. CORS: set ALLOWED_ORIGINS trên Render chứa domain Netlify\n3. Kiểm tra backend logs trên Render Dashboard`
        : `1. Chạy: cd backend && npm start\n2. Port đúng? (${API_BASE_URL})\n3. Kiểm tra CORS trong backend`;
      throw new Error(
        `Không thể kết nối đến backend tại ${API_BASE_URL}.\n${hints}`
      );
    }

    // Re-throw with original message if it's already user-friendly
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
          apiError
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
      }
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
      }
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
      }
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

    // Improved error message for network errors
    if (error.message === "Failed to fetch" || error.name === "TypeError") {
      throw new Error(
        `Không thể kết nối đến backend server. Vui lòng kiểm tra:\n` +
          `1. Backend có đang chạy không? (${API_BASE_URL})\n` +
          `2. Kiểm tra kết nối mạng\n` +
          `3. Kiểm tra CORS settings`
      );
    }

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
      }
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
      `${API_BASE_URL}/api/auth/users/${userId}`
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
      }
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
      }
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
      `${API_BASE_URL}/api/audit/logs?${queryParams.toString()}`
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
      `${API_BASE_URL}/api/audit/statistics?${queryParams.toString()}`
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
      }
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
  isAuthenticated,
  checkBackendConnection,

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
