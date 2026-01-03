/* eslint-disable */
/**
 * Authentication Middleware
 * Handles JWT authentication and role-based access control
 */

const jwt = require("jsonwebtoken");
const {
  authenticateUser,
  getUserRoles,
  getUserPermissions,
  validateSession,
} = require("../services/authService");

const JWT_SECRET =
  process.env.JWT_SECRET || "your-secret-key-change-in-production";
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || "24h";

/**
 * Authenticate user with JWT token and validate session
 */
const authenticate = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({
        success: false,
        error: "Authentication required. Please provide a valid token.",
      });
    }

    const token = authHeader.substring(7); // Remove 'Bearer ' prefix

    try {
      const decoded = jwt.verify(token, JWT_SECRET);

      // Optional: Validate session if sessionId is provided in token or header
      const sessionId = decoded.sessionId || req.headers["x-session-id"];
      if (sessionId) {
        const sessionValidation = validateSession(sessionId);
        if (!sessionValidation.valid) {
          return res.status(401).json({
            success: false,
            error: `Session ${sessionValidation.reason}. Please login again.`,
          });
        }
        req.sessionId = sessionId;
        req.session = sessionValidation.session;
      }

      req.user = decoded;
      req.userId = decoded.userId;
      req.userEmail = decoded.email;
      next();
    } catch (error) {
      if (error.name === "TokenExpiredError") {
        return res.status(401).json({
          success: false,
          error: "Token has expired. Please login again.",
        });
      }
      return res.status(401).json({
        success: false,
        error: "Invalid token. Please login again.",
      });
    }
  } catch (error) {
    console.error("Authentication error:", error);
    return res.status(500).json({
      success: false,
      error: "Authentication failed.",
    });
  }
};

/**
 * Generate JWT token for user
 */
const generateToken = (user) => {
  const payload = {
    userId: user.id || user.userId,
    email: user.email,
    role: user.role || "user",
    permissions: user.permissions || [],
  };

  return jwt.sign(payload, JWT_SECRET, {
    expiresIn: JWT_EXPIRES_IN,
  });
};

/**
 * Verify JWT token
 */
const verifyToken = (token) => {
  try {
    return jwt.verify(token, JWT_SECRET);
  } catch (error) {
    return null;
  }
};

/**
 * Role-based access control middleware
 */
const requireRole = (...roles) => {
  return async (req, res, next) => {
    try {
      if (!req.user) {
        return res.status(401).json({
          success: false,
          error: "Authentication required.",
        });
      }

      const userRole = req.user.role || "user";

      if (!roles.includes(userRole)) {
        return res.status(403).json({
          success: false,
          error:
            "Insufficient permissions. Required roles: " + roles.join(", "),
        });
      }

      next();
    } catch (error) {
      console.error("Role check error:", error);
      return res.status(500).json({
        success: false,
        error: "Authorization failed.",
      });
    }
  };
};

/**
 * Permission-based access control middleware
 */
const requirePermission = (...permissions) => {
  return async (req, res, next) => {
    try {
      if (!req.user) {
        return res.status(401).json({
          success: false,
          error: "Authentication required.",
        });
      }

      const userPermissions = req.user.permissions || [];
      const hasPermission = permissions.some((permission) =>
        userPermissions.includes(permission)
      );

      if (!hasPermission) {
        return res.status(403).json({
          success: false,
          error:
            "Insufficient permissions. Required: " + permissions.join(", "),
        });
      }

      next();
    } catch (error) {
      console.error("Permission check error:", error);
      return res.status(500).json({
        success: false,
        error: "Authorization failed.",
      });
    }
  };
};

module.exports = {
  authenticate,
  generateToken,
  verifyToken,
  requireRole,
  requirePermission,
};
