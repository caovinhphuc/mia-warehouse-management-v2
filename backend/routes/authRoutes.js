/* eslint-disable */
/**
 * Authentication Routes
 * Handles authentication, MFA, SSO, and user management
 */

const express = require("express");
const router = express.Router();

const {
  authenticate,
  generateToken,
  requireRole,
  requirePermission,
} = require("../middleware/auth");
const { formatVietnameseDateTime } = require("../utils/dateUtils");

const authService = require("../services/authService");
const ssoService = require("../services/ssoService");
const auditService = require("../services/auditService");

/**
 * POST /api/auth/verify-one-tga - Verify one.tga.com.vn login credentials
 * Điều kiện tiên quyết: Phải đăng nhập one.tga.com.vn thành công
 * Gọi AI Service API thay vì spawn Python script
 */
router.post("/verify-one-tga", async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        valid: false,
        error: "Email và password là bắt buộc",
      });
    }

    // AI Service URL (mặc định port 8000 - khớp với Dockerfile.ai)
    const AI_SERVICE_URL =
      process.env.AI_SERVICE_URL || "http://localhost:8000";

    // Gọi AI Service API để verify one.tga.com.vn login
    const axios = require("axios");

    try {
      const response = await axios.post(
        `${AI_SERVICE_URL}/api/auth/verify-one-tga`,
        { email, password },
        {
          timeout: 30000, // 30 second timeout
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      // ✅ One TGA login thành công
      res.json({
        success: true,
        valid: true,
        message: response.data.message || "Đăng nhập one.tga.com.vn thành công",
      });
    } catch (axiosError) {
      console.error("AI Service request error:", axiosError.message);

      // Nếu là lỗi 401 (unauthorized), credentials không đúng
      if (axiosError.response && axiosError.response.status === 401) {
        const errorData = axiosError.response.data || {};
        return res.status(401).json({
          success: false,
          valid: false,
          error:
            errorData.detail ||
            errorData.error ||
            "Đăng nhập one.tga.com.vn không thành công",
        });
      }

      // Nếu AI Service không chạy, skip trong development
      if (
        process.env.NODE_ENV === "development" ||
        axiosError.code === "ECONNREFUSED" ||
        axiosError.code === "ETIMEDOUT"
      ) {
        console.warn(
          `AI Service không khả dụng tại ${AI_SERVICE_URL}, skipping in development mode`
        );
        return res.json({
          success: true,
          valid: true,
          message: "Skipped in development mode - AI Service không chạy",
        });
      }

      res.status(500).json({
        success: false,
        valid: false,
        error:
          `Không thể kết nối đến AI Service tại ${AI_SERVICE_URL}. ` +
          `Vui lòng kiểm tra AI Service có đang chạy không.`,
      });
    }
  } catch (error) {
    console.error("Verify one TGA error:", error);
    res.status(500).json({
      success: false,
      valid: false,
      error: "Lỗi khi verify one.tga.com.vn login",
    });
  }
});

/**
 * GET /api/auth/verify - Verify current session
 */
router.get("/verify", authenticate, async (req, res) => {
  try {
    // Session đã được validate trong authenticate middleware
    // Nếu đến đây, session hợp lệ
    res.json({
      success: true,
      valid: true,
      user: {
        id: req.userId,
        email: req.user?.email || "Unknown",
        role: req.user?.role || "user",
      },
      sessionId: req.sessionId,
    });
  } catch (error) {
    console.error("Session verification error:", error);
    res.status(401).json({
      success: false,
      valid: false,
      error: "Session verification failed",
    });
  }
});

/**
 * POST /api/auth/register - Register new user
 */
router.post("/register", async (req, res) => {
  try {
    const { email, password, role } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        error: "Email and password are required",
      });
    }

    const user = await authService.createUser(email, password, role || "user");

    // Audit log
    await auditService.createAuditLog({
      eventType: auditService.AUDIT_EVENTS.USER_CREATED,
      userId: user.id,
      userEmail: user.email,
      ipAddress: req.ip,
      userAgent: req.get("user-agent"),
      status: "success",
      details: { role: user.role },
    });

    res.status(201).json({
      success: true,
      data: {
        user: {
          id: user.id,
          email: user.email,
          role: user.role,
          mfaEnabled: user.mfaEnabled,
        },
      },
    });
  } catch (error) {
    console.error("Register error:", error);
    res.status(500).json({
      success: false,
      error: "Registration failed",
    });
  }
});

/**
 * POST /api/auth/login - Login user
 */
router.post("/login", async (req, res) => {
  try {
    const { email, password, mfaToken } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        error: "Email and password are required",
      });
    }

    const user = await authService.authenticateUser(email, password);

    if (!user) {
      // Audit log - failed login
      await auditService.createAuditLog({
        eventType: auditService.AUDIT_EVENTS.LOGIN_FAILURE,
        userEmail: email,
        ipAddress: req.ip,
        userAgent: req.get("user-agent"),
        status: "failure",
        severity: auditService.SEVERITY.MEDIUM,
      });

      return res.status(401).json({
        success: false,
        error: "Invalid email or password",
      });
    }

    // Check if MFA is enabled
    if (user.mfaEnabled) {
      if (!mfaToken) {
        return res.status(200).json({
          success: true,
          requiresMFA: true,
          message: "MFA token required",
        });
      }

      const isValidMFA = authService.verifyMFAToken(user.id, mfaToken);

      if (!isValidMFA) {
        // Audit log - MFA failure
        await auditService.createAuditLog({
          eventType: auditService.AUDIT_EVENTS.MFA_FAILED,
          userId: user.id,
          userEmail: user.email,
          ipAddress: req.ip,
          userAgent: req.get("user-agent"),
          status: "failure",
          severity: auditService.SEVERITY.HIGH,
        });

        return res.status(401).json({
          success: false,
          error: "Invalid MFA token",
        });
      }

      // Audit log - MFA verified
      await auditService.createAuditLog({
        eventType: auditService.AUDIT_EVENTS.MFA_VERIFIED,
        userId: user.id,
        userEmail: user.email,
        ipAddress: req.ip,
        userAgent: req.get("user-agent"),
        status: "success",
      });
    }

    // Create session first
    const session = authService.createSession(user.id, {
      ipAddress: req.ip,
      userAgent: req.get("user-agent"),
    });

    // Generate JWT token with sessionId
    const token = generateToken({
      ...user,
      sessionId: session.id,
    });

    // Audit log - successful login
    await auditService.createAuditLog({
      eventType: auditService.AUDIT_EVENTS.LOGIN_SUCCESS,
      userId: user.id,
      userEmail: user.email,
      ipAddress: req.ip,
      userAgent: req.get("user-agent"),
      status: "success",
      details: { sessionId: session.id },
    });

    res.json({
      success: true,
      data: {
        token,
        user: {
          id: user.id,
          email: user.email,
          role: user.role,
          permissions: user.permissions,
          mfaEnabled: user.mfaEnabled,
        },
        sessionId: session.id,
      },
    });
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({
      success: false,
      error: "Login failed",
    });
  }
});

/**
 * POST /api/auth/logout - Logout user
 */
router.post("/logout", authenticate, async (req, res) => {
  try {
    const { sessionId, logoutAll = false } = req.body;
    const userId = req.userId;

    let deletedCount = 0;

    if (logoutAll) {
      // Delete all sessions for this user
      deletedCount = authService.deleteAllUserSessions(userId);
    } else if (sessionId) {
      // Delete specific session
      authService.deleteSession(sessionId);
      deletedCount = 1;
    } else {
      // If no sessionId provided, delete all sessions for this user
      deletedCount = authService.deleteAllUserSessions(userId);
    }

    // Audit log
    await auditService.createAuditLog({
      eventType: auditService.AUDIT_EVENTS.LOGOUT,
      userId: userId,
      userEmail: req.userEmail,
      ipAddress: req.ip,
      userAgent: req.get("user-agent"),
      status: "success",
      details: {
        sessionId: sessionId || null,
        logoutAll: logoutAll,
        deletedSessionsCount: deletedCount,
      },
    });

    res.json({
      success: true,
      message: "Logged out successfully",
      data: {
        deletedSessionsCount: deletedCount,
        logoutAll: logoutAll,
      },
    });
  } catch (error) {
    console.error("Logout error:", error);
    res.status(500).json({
      success: false,
      error: "Logout failed",
    });
  }
});

/**
 * POST /api/auth/mfa/generate - Generate MFA secret
 */
router.post("/mfa/generate", authenticate, async (req, res) => {
  try {
    const mfaSecret = await authService.generateMFASecret(
      req.userId,
      req.userEmail
    );

    res.json({
      success: true,
      data: {
        secret: mfaSecret.secret,
        qrCode: mfaSecret.qrCode,
        manualEntryKey: mfaSecret.manualEntryKey,
      },
    });
  } catch (error) {
    console.error("MFA generate error:", error);
    res.status(500).json({
      success: false,
      error: "Failed to generate MFA secret",
    });
  }
});

/**
 * POST /api/auth/mfa/enable - Enable MFA for user
 */
router.post("/mfa/enable", authenticate, async (req, res) => {
  try {
    const { token } = req.body;

    if (!token) {
      return res.status(400).json({
        success: false,
        error: "MFA token is required",
      });
    }

    const enabled = await authService.enableMFA(req.userId, token);

    if (!enabled) {
      return res.status(400).json({
        success: false,
        error: "Invalid MFA token",
      });
    }

    // Audit log
    await auditService.createAuditLog({
      eventType: auditService.AUDIT_EVENTS.MFA_ENABLED,
      userId: req.userId,
      userEmail: req.userEmail,
      ipAddress: req.ip,
      userAgent: req.get("user-agent"),
      status: "success",
      severity: auditService.SEVERITY.HIGH,
    });

    res.json({
      success: true,
      message: "MFA enabled successfully",
    });
  } catch (error) {
    console.error("MFA enable error:", error);
    res.status(500).json({
      success: false,
      error: "Failed to enable MFA",
    });
  }
});

/**
 * POST /api/auth/mfa/disable - Disable MFA for user
 */
router.post("/mfa/disable", authenticate, async (req, res) => {
  try {
    const disabled = await authService.disableMFA(req.userId);

    if (!disabled) {
      return res.status(400).json({
        success: false,
        error: "Failed to disable MFA",
      });
    }

    // Audit log
    await auditService.createAuditLog({
      eventType: auditService.AUDIT_EVENTS.MFA_DISABLED,
      userId: req.userId,
      userEmail: req.userEmail,
      ipAddress: req.ip,
      userAgent: req.get("user-agent"),
      status: "success",
      severity: auditService.SEVERITY.HIGH,
    });

    res.json({
      success: true,
      message: "MFA disabled successfully",
    });
  } catch (error) {
    console.error("MFA disable error:", error);
    res.status(500).json({
      success: false,
      error: "Failed to disable MFA",
    });
  }
});

/**
 * GET /api/auth/sso/:provider - Initiate SSO login
 */
router.get("/sso/:provider", async (req, res) => {
  try {
    const { provider } = req.params;
    const { redirectUrl } = req.query;

    if (!ssoService.supportedProviders.includes(provider.toLowerCase())) {
      return res.status(400).json({
        success: false,
        error: `Unsupported SSO provider: ${provider}`,
      });
    }

    const { url, state } = ssoService.generateAuthorizationUrl(
      provider.toLowerCase(),
      redirectUrl
    );

    res.json({
      success: true,
      data: {
        authorizationUrl: url,
        state,
      },
    });
  } catch (error) {
    console.error("SSO initiation error:", error);
    res.status(500).json({
      success: false,
      error: "Failed to initiate SSO login",
    });
  }
});

/**
 * GET /api/auth/sso/:provider/callback - SSO callback
 */
router.get("/sso/:provider/callback", async (req, res) => {
  try {
    const { provider } = req.params;
    const { code, state } = req.query;

    if (!code || !state) {
      return res.status(400).json({
        success: false,
        error: "Missing code or state parameter",
      });
    }

    // Verify state
    const stateData = ssoService.verifyOAuthState(state);
    if (!stateData) {
      return res.status(400).json({
        success: false,
        error: "Invalid or expired state",
      });
    }

    // Exchange code for token
    const tokenData = await ssoService.exchangeCodeForToken(provider, code);

    // Get user info
    const userInfo = await ssoService.getUserInfo(
      provider,
      tokenData.access_token
    );

    // Create or update user (simplified - in production, link to existing user)
    // For now, we'll just return the user info

    // Audit log
    await auditService.createAuditLog({
      eventType: auditService.AUDIT_EVENTS.SSO_LOGIN,
      userEmail: userInfo.email,
      ipAddress: req.ip,
      userAgent: req.get("user-agent"),
      status: "success",
      details: { provider, userId: userInfo.id },
    });

    res.json({
      success: true,
      data: {
        user: userInfo,
        token: tokenData.access_token,
        provider,
      },
    });
  } catch (error) {
    console.error("SSO callback error:", error);
    res.status(500).json({
      success: false,
      error: "SSO authentication failed",
    });
  }
});

/**
 * GET /api/auth/me - Get current user info
 * GET /api/auth/profile - Get current user profile (alias)
 */
router.get("/me", authenticate, async (req, res) => {
  try {
    const user = await authService.getUserById(req.userId);

    res.json({
      success: true,
      data: {
        user: {
          id: user.id,
          email: user.email,
          role: user.role,
          permissions: user.permissions || [],
          mfaEnabled: user.mfaEnabled || false,
        },
      },
    });
  } catch (error) {
    console.error("Get user info error:", error);
    res.status(500).json({
      success: false,
      error: "Failed to get user info",
    });
  }
});

router.get("/profile", authenticate, async (req, res) => {
  // Alias for /me endpoint
  try {
    const user = await authService.getUserById(req.userId);

    res.json({
      success: true,
      data: {
        user: {
          id: user.id,
          email: user.email,
          role: user.role,
          permissions: user.permissions || [],
          mfaEnabled: user.mfaEnabled || false,
        },
      },
    });
  } catch (error) {
    console.error("Get user profile error:", error);
    res.status(500).json({
      success: false,
      error: "Failed to get user profile",
    });
  }
});

/**
 * GET /api/auth/users - Get all users (admin only)
 */
router.get("/users", authenticate, requireRole("admin"), async (req, res) => {
  try {
    const users = await authService.getAllUsers();

    res.json({
      success: true,
      data: Array.isArray(users) ? users : [],
    });
  } catch (error) {
    console.error("Get all users error:", error);
    res.status(500).json({
      success: false,
      error: "Failed to get users",
    });
  }
});

/**
 * GET /api/auth/users/:id - Get user by ID
 */
router.get(
  "/users/:id",
  authenticate,
  requireRole("admin"),
  async (req, res) => {
    try {
      const { id } = req.params;
      const user = await authService.getUserById(id);

      if (!user) {
        return res.status(404).json({
          success: false,
          error: "User not found",
        });
      }

      res.json({
        success: true,
        data: user,
      });
    } catch (error) {
      console.error("Get user error:", error);
      res.status(500).json({
        success: false,
        error: "Failed to get user",
      });
    }
  }
);

/**
 * PUT /api/auth/users/:id/role - Update user role
 */
router.put(
  "/users/:id/role",
  authenticate,
  requireRole("admin"),
  async (req, res) => {
    try {
      const { id } = req.params;
      const { role } = req.body;

      if (!role) {
        return res.status(400).json({
          success: false,
          error: "Role is required",
        });
      }

      const updated = await authService.updateUserRole(id, role);

      if (!updated) {
        return res.status(404).json({
          success: false,
          error: "User not found",
        });
      }

      // Audit log
      await auditService.createAuditLog({
        eventType: auditService.AUDIT_EVENTS.ROLE_CHANGED,
        userId: req.userId,
        userEmail: req.userEmail,
        ipAddress: req.ip,
        userAgent: req.get("user-agent"),
        resource: `user:${id}`,
        action: "update_role",
        status: "success",
        details: { userId: id, newRole: role },
        severity: auditService.SEVERITY.HIGH,
      });

      res.json({
        success: true,
        data: updated,
      });
    } catch (error) {
      console.error("Update user role error:", error);
      res.status(500).json({
        success: false,
        error: "Failed to update user role",
      });
    }
  }
);

/**
 * DELETE /api/auth/users/:id - Delete user
 */
router.delete(
  "/users/:id",
  authenticate,
  requireRole("admin"),
  async (req, res) => {
    try {
      const { id } = req.params;

      if (id === req.userId) {
        return res.status(400).json({
          success: false,
          error: "Cannot delete your own account",
        });
      }

      const deleted = await authService.deleteUser(id);

      if (!deleted) {
        return res.status(404).json({
          success: false,
          error: "User not found",
        });
      }

      // Audit log
      await auditService.createAuditLog({
        eventType: auditService.AUDIT_EVENTS.USER_DELETED,
        userId: req.userId,
        userEmail: req.userEmail,
        ipAddress: req.ip,
        userAgent: req.get("user-agent"),
        resource: `user:${id}`,
        action: "delete",
        status: "success",
        details: { deletedUserId: id },
        severity: auditService.SEVERITY.HIGH,
      });

      res.json({
        success: true,
        message: "User deleted successfully",
      });
    } catch (error) {
      console.error("Delete user error:", error);
      res.status(500).json({
        success: false,
        error: "Failed to delete user",
      });
    }
  }
);

module.exports = router;
