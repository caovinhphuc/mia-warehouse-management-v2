/* eslint-disable */
/**
 * Authentication Service
 * Handles user authentication, MFA, SSO, and role management
 */

const crypto = require("crypto");
const speakeasy = require("speakeasy");
const QRCode = require("qrcode");
const { formatVietnameseDateTime } = require("../utils/dateUtils");

// In-memory user store (replace with database in production)
const users = new Map();
const mfaSecrets = new Map();
const sessions = new Map();

// Default roles and permissions
const ROLES = {
  ADMIN: "admin",
  MANAGER: "manager",
  USER: "user",
  GUEST: "guest",
};

const PERMISSIONS = {
  // Admin permissions
  ADMIN_ALL: "admin:all",

  // User management
  USER_CREATE: "user:create",
  USER_READ: "user:read",
  USER_UPDATE: "user:update",
  USER_DELETE: "user:delete",

  // Dashboard permissions
  DASHBOARD_VIEW: "dashboard:view",
  DASHBOARD_EDIT: "dashboard:edit",

  // Data permissions
  DATA_READ: "data:read",
  DATA_WRITE: "data:write",
  DATA_DELETE: "data:delete",

  // AI/Analytics permissions
  AI_VIEW: "ai:view",
  AI_EXECUTE: "ai:execute",

  // Automation permissions
  AUTOMATION_CREATE: "automation:create",
  AUTOMATION_EXECUTE: "automation:execute",
};

const ROLE_PERMISSIONS = {
  [ROLES.ADMIN]: [
    PERMISSIONS.ADMIN_ALL,
    PERMISSIONS.USER_CREATE,
    PERMISSIONS.USER_READ,
    PERMISSIONS.USER_UPDATE,
    PERMISSIONS.USER_DELETE,
    PERMISSIONS.DASHBOARD_VIEW,
    PERMISSIONS.DASHBOARD_EDIT,
    PERMISSIONS.DATA_READ,
    PERMISSIONS.DATA_WRITE,
    PERMISSIONS.DATA_DELETE,
    PERMISSIONS.AI_VIEW,
    PERMISSIONS.AI_EXECUTE,
    PERMISSIONS.AUTOMATION_CREATE,
    PERMISSIONS.AUTOMATION_EXECUTE,
  ],
  [ROLES.MANAGER]: [
    PERMISSIONS.USER_READ,
    PERMISSIONS.DASHBOARD_VIEW,
    PERMISSIONS.DASHBOARD_EDIT,
    PERMISSIONS.DATA_READ,
    PERMISSIONS.DATA_WRITE,
    PERMISSIONS.AI_VIEW,
    PERMISSIONS.AUTOMATION_CREATE,
  ],
  [ROLES.USER]: [
    PERMISSIONS.DASHBOARD_VIEW,
    PERMISSIONS.DATA_READ,
    PERMISSIONS.AI_VIEW,
  ],
  [ROLES.GUEST]: [PERMISSIONS.DASHBOARD_VIEW],
};

/**
 * Create a new user
 */
const createUser = async (email, password, role = ROLES.USER) => {
  const userId = crypto.randomUUID();
  const hashedPassword = hashPassword(password);

  const user = {
    id: userId,
    email,
    password: hashedPassword,
    role,
    permissions: ROLE_PERMISSIONS[role] || [],
    mfaEnabled: false,
    createdAt: new Date().toISOString(),
    createdAtFormatted: formatVietnameseDateTime(new Date()),
    updatedAt: new Date().toISOString(),
    updatedAtFormatted: formatVietnameseDateTime(new Date()),
  };

  users.set(userId, user);
  users.set(email, user); // Also index by email

  return {
    id: user.id,
    email: user.email,
    role: user.role,
    permissions: user.permissions,
    mfaEnabled: user.mfaEnabled,
  };
};

/**
 * Authenticate user with email and password
 */
const authenticateUser = async (email, password) => {
  const user = users.get(email);

  if (!user) {
    return null;
  }

  const hashedPassword = hashPassword(password);

  if (user.password !== hashedPassword) {
    return null;
  }

  return {
    id: user.id,
    email: user.email,
    role: user.role,
    permissions: user.permissions,
    mfaEnabled: user.mfaEnabled,
  };
};

/**
 * Hash password (simple hash for demo, use bcrypt in production)
 */
const hashPassword = (password) => {
  return crypto.createHash("sha256").update(password).digest("hex");
};

/**
 * Generate MFA secret for user
 */
const generateMFASecret = async (userId, email) => {
  const secret = speakeasy.generateSecret({
    name: `MIA Platform (${email})`,
    issuer: "MIA Platform",
  });

  mfaSecrets.set(userId, secret.base32);

  // Generate QR code URL
  const qrCodeUrl = await QRCode.toDataURL(secret.otpauth_url);

  return {
    secret: secret.base32,
    qrCode: qrCodeUrl,
    manualEntryKey: secret.base32,
  };
};

/**
 * Verify MFA token
 */
const verifyMFAToken = (userId, token) => {
  const secret = mfaSecrets.get(userId);

  if (!secret) {
    return false;
  }

  return speakeasy.totp.verify({
    secret,
    encoding: "base32",
    token,
    window: 2, // Allow 2 time steps (60 seconds) before/after
  });
};

/**
 * Enable MFA for user
 */
const enableMFA = async (userId, token) => {
  const user = users.get(userId);

  if (!user) {
    return false;
  }

  // Verify token before enabling
  const isValid = verifyMFAToken(userId, token);

  if (!isValid) {
    return false;
  }

  user.mfaEnabled = true;
  const now = new Date();
  user.updatedAt = now.toISOString();
  user.updatedAtFormatted = formatVietnameseDateTime(now);

  return true;
};

/**
 * Disable MFA for user
 */
const disableMFA = async (userId) => {
  const user = users.get(userId);

  if (!user) {
    return false;
  }

  user.mfaEnabled = false;
  mfaSecrets.delete(userId);
  const now = new Date();
  user.updatedAt = now.toISOString();
  user.updatedAtFormatted = formatVietnameseDateTime(now);

  return true;
};

/**
 * Get user roles
 */
const getUserRoles = async (userId) => {
  const user = users.get(userId);

  if (!user) {
    return [];
  }

  return [user.role];
};

/**
 * Get user permissions
 */
const getUserPermissions = async (userId) => {
  const user = users.get(userId);

  if (!user) {
    return [];
  }

  return user.permissions || ROLE_PERMISSIONS[user.role] || [];
};

/**
 * Check if user has permission
 */
const hasPermission = async (userId, permission) => {
  const permissions = await getUserPermissions(userId);
  return (
    permissions.includes(permission) ||
    permissions.includes(PERMISSIONS.ADMIN_ALL)
  );
};

/**
 * Create session for user
 */
const createSession = (userId, sessionData = {}) => {
  const sessionId = crypto.randomUUID();
  const now = new Date();
  const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours
  const session = {
    id: sessionId,
    userId,
    createdAt: now.toISOString(),
    createdAtFormatted: formatVietnameseDateTime(now),
    expiresAt: expiresAt.toISOString(),
    expiresAtFormatted: formatVietnameseDateTime(expiresAt),
    ...sessionData,
  };

  sessions.set(sessionId, session);
  return session;
};

/**
 * Get session by ID
 */
const getSession = (sessionId) => {
  return sessions.get(sessionId);
};

/**
 * Delete session
 */
const deleteSession = (sessionId) => {
  sessions.delete(sessionId);
};

/**
 * Delete all sessions for a user
 */
const deleteAllUserSessions = (userId) => {
  let deletedCount = 0;
  sessions.forEach((session, sessionId) => {
    if (session.userId === userId) {
      sessions.delete(sessionId);
      deletedCount++;
    }
  });
  return deletedCount;
};

/**
 * Validate session (check if exists and not expired)
 */
const validateSession = (sessionId) => {
  const session = sessions.get(sessionId);

  if (!session) {
    return { valid: false, reason: "Session not found" };
  }

  const now = new Date();
  const expiresAt = new Date(session.expiresAt);

  if (now > expiresAt) {
    // Session expired, delete it
    sessions.delete(sessionId);
    return { valid: false, reason: "Session expired" };
  }

  return { valid: true, session };
};

/**
 * Clean up expired sessions
 */
const cleanupExpiredSessions = () => {
  const now = new Date();
  let cleanedCount = 0;

  sessions.forEach((session, sessionId) => {
    const expiresAt = new Date(session.expiresAt);
    if (now > expiresAt) {
      sessions.delete(sessionId);
      cleanedCount++;
    }
  });

  return cleanedCount;
};

/**
 * Get user by ID
 */
const getUserById = (userId) => {
  const user = users.get(userId);
  if (!user) {
    return null;
  }

  // Return user without password
  const { password, ...userWithoutPassword } = user;
  return userWithoutPassword;
};

/**
 * Get all users
 */
const getAllUsers = () => {
  const allUsers = [];
  users.forEach((user) => {
    const { password, ...userWithoutPassword } = user;
    allUsers.push(userWithoutPassword);
  });
  return allUsers;
};

/**
 * Update user role
 */
const updateUserRole = (userId, newRole) => {
  const user = users.get(userId);
  if (!user) {
    return null;
  }

  user.role = newRole;
  user.permissions = ROLE_PERMISSIONS[newRole] || [];
  users.set(userId, user);

  const { password, ...userWithoutPassword } = user;
  return userWithoutPassword;
};

/**
 * Delete user
 */
const deleteUser = (userId) => {
  if (!users.has(userId)) {
    return false;
  }

  // Delete user
  users.delete(userId);

  // Delete MFA secret if exists
  if (mfaSecrets.has(userId)) {
    mfaSecrets.delete(userId);
  }

  // Delete all sessions for this user
  sessions.forEach((session, sessionId) => {
    if (session.userId === userId) {
      sessions.delete(sessionId);
    }
  });

  return true;
};

module.exports = {
  ROLES,
  PERMISSIONS,
  createUser,
  authenticateUser,
  generateMFASecret,
  verifyMFAToken,
  enableMFA,
  disableMFA,
  getUserRoles,
  getUserPermissions,
  hasPermission,
  createSession,
  getSession,
  deleteSession,
  deleteAllUserSessions,
  validateSession,
  cleanupExpiredSessions,
  getUserById,
  getAllUsers,
  updateUserRole,
  deleteUser,
};
