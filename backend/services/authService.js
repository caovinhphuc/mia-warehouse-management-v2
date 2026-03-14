/* eslint-disable */
/**
 * Authentication Service
 * Handles user authentication, MFA, SSO, and role management
 *
 * Thay đổi so với phiên bản cũ:
 * - hashPassword: SHA256 → bcrypt (an toàn hơn)
 * - users/sessions/mfaSecrets: in-memory Map → persistent JSON store
 *   (data không mất khi restart server)
 */

const crypto = require("crypto");
const bcrypt = require("bcrypt");
const speakeasy = require("speakeasy");
const QRCode = require("qrcode");
const { formatVietnameseDateTime } = require("../utils/dateUtils");
const { createPersistentStore } = require("./persistenceStore");

const BCRYPT_ROUNDS = parseInt(process.env.BCRYPT_ROUNDS) || 12;

// Persistent stores — survives server restarts
const users = createPersistentStore("users.json");
const mfaSecrets = createPersistentStore("mfa-secrets.json");
const sessions = createPersistentStore("sessions.json");

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
 * Hash password dùng bcrypt (thay thế SHA256 cũ)
 */
const hashPassword = async (password) => {
  return bcrypt.hash(password, BCRYPT_ROUNDS);
};

/**
 * So sánh password với hash (bcrypt-aware: hỗ trợ cả hash cũ SHA256 để backward compat)
 * @param {string} password - plain text password
 * @param {string} hash - stored hash
 */
const comparePassword = async (password, hash) => {
  // Nếu hash bắt đầu bằng $2b$ hoặc $2a$ → bcrypt
  if (hash && (hash.startsWith("$2b$") || hash.startsWith("$2a$"))) {
    return bcrypt.compare(password, hash);
  }
  // Backward compat: SHA256 hash cũ (hex 64 chars)
  const sha256Hash = crypto.createHash("sha256").update(password).digest("hex");
  return sha256Hash === hash;
};

/**
 * Create a new user
 */
const createUser = async (email, password, role = ROLES.USER) => {
  const userId = crypto.randomUUID();
  const hashedPassword = await hashPassword(password);

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
  users.set(email, user); // index by email for fast lookup

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

  const isValid = await comparePassword(password, user.password);

  if (!isValid) {
    return null;
  }

  // Nếu password hash cũ (SHA256), tự động re-hash sang bcrypt
  if (!user.password.startsWith("$2b$") && !user.password.startsWith("$2a$")) {
    const newHash = await hashPassword(password);
    user.password = newHash;
    users.set(user.id, user);
    users.set(email, user);
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
 * Generate MFA secret for user
 */
const generateMFASecret = async (userId, email) => {
  const secret = speakeasy.generateSecret({
    name: `MIA Platform (${email})`,
    issuer: "MIA Platform",
  });

  mfaSecrets.set(userId, secret.base32);

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
    window: 2,
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

  const isValid = verifyMFAToken(userId, token);

  if (!isValid) {
    return false;
  }

  user.mfaEnabled = true;
  const now = new Date();
  user.updatedAt = now.toISOString();
  user.updatedAtFormatted = formatVietnameseDateTime(now);
  users.set(userId, user);

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
  users.set(userId, user);

  return true;
};

/**
 * Get user roles
 */
const getUserRoles = async (userId) => {
  const user = users.get(userId);
  if (!user) return [];
  return [user.role];
};

/**
 * Get user permissions
 */
const getUserPermissions = async (userId) => {
  const user = users.get(userId);
  if (!user) return [];
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
  if (!user) return null;
  const { password, ...userWithoutPassword } = user;
  return userWithoutPassword;
};

/**
 * Get all users (without duplicates from email index)
 */
const getAllUsers = () => {
  const seen = new Set();
  const allUsers = [];

  users.forEach((user) => {
    if (user && user.id && !seen.has(user.id)) {
      seen.add(user.id);
      const { password, ...userWithoutPassword } = user;
      allUsers.push(userWithoutPassword);
    }
  });

  return allUsers;
};

/**
 * Update user role
 */
const updateUserRole = (userId, newRole) => {
  const user = users.get(userId);
  if (!user) return null;

  user.role = newRole;
  user.permissions = ROLE_PERMISSIONS[newRole] || [];
  users.set(userId, user);
  if (user.email) users.set(user.email, user); // keep email index in sync

  const { password, ...userWithoutPassword } = user;
  return userWithoutPassword;
};

/**
 * Delete user
 */
const deleteUser = (userId) => {
  const user = users.get(userId);
  if (!user) return false;

  if (user.email) users.delete(user.email); // remove email index
  users.delete(userId);
  mfaSecrets.delete(userId);

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
