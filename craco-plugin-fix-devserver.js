/**
 * =============================================================================
 * 🔧 CRACO Plugin: Fix webpack-dev-server v4+ Compatibility
 * =============================================================================
 *
 * Purpose:
 * - Removes deprecated middleware options from webpack-dev-server v3
 * - Implements setupMiddlewares pattern for webpack-dev-server v4+
 * - Handles HTTPS configuration migration
 * - Ensures compatibility with modern webpack tooling
 *
 * Fixes:
 * - onAfterSetupMiddleware → setupMiddlewares
 * - onBeforeSetupMiddleware → setupMiddlewares
 * - https → server configuration
 *
 * @version 2.0.0
 * @updated 2026-01-18
 * =============================================================================
 */

const path = require("path");

/**
 * CRACO Plugin Configuration
 */
module.exports = {
  /**
   * Override Development Server Configuration
   * @param {Object} params - Configuration parameters
   * @returns {Object} Modified devServerConfig
   */
  overrideDevServerConfig: ({
    devServerConfig,
    cracoConfig,
    pluginOptions,
    context: { env, paths, proxy },
  }) => {
    const isDevelopment = process.env.NODE_ENV !== "production";

    // =============================================================================
    // 1. Remove Deprecated Middleware Options
    // =============================================================================
    const deprecatedKeys = [
      "onAfterSetupMiddleware",
      "onBeforeSetupMiddleware",
    ];

    const removedKeys = deprecatedKeys.filter((key) => {
      if (key in devServerConfig) {
        delete devServerConfig[key];
        return true;
      }
      return false;
    });

    if (removedKeys.length > 0) {
      console.log(
        `🔧 [DevServer] Removed deprecated: ${removedKeys.join(", ")}`
      );
    }

    // =============================================================================
    // 2. Fix HTTPS Configuration
    // =============================================================================
    if (devServerConfig.https) {
      const httpsValue = devServerConfig.https;
      delete devServerConfig.https;

      // Migrate to 'server' property for webpack-dev-server v4+
      if (!devServerConfig.server) {
        if (httpsValue === true) {
          devServerConfig.server = "https";
        } else if (typeof httpsValue === "object") {
          // For custom certificates, use https with options
          devServerConfig.server = {
            type: "https",
            options: httpsValue,
          };
        }
      }
      console.log("🔒 [DevServer] HTTPS configuration migrated");
    }

    // =============================================================================
    // 3. Setup Modern Middleware Pattern
    // =============================================================================
    if (!devServerConfig.setupMiddlewares) {
      devServerConfig.setupMiddlewares = (middlewares, devServer) => {
        if (!devServer) {
          throw new Error("webpack-dev-server is not defined");
        }

        // Custom middleware can be added here
        // Example: API mocking, custom routes, etc.

        if (isDevelopment) {
          console.log("🔌 [DevServer] Custom middlewares initialized");
        }

        return middlewares;
      };
    }

    // =============================================================================
    // 4. Enhanced Development Server Configuration
    // =============================================================================
    const enhancedConfig = {
      ...devServerConfig,

      // Performance
      compress: true,

      // CORS
      allowedHosts: "all",

      // Hot Module Replacement
      hot: true,
      liveReload: true,

      // Development features
      client: {
        logging: isDevelopment ? "info" : "warn",
        overlay: {
          errors: true,
          warnings: false,
        },
        progress: true,
      },

      // History API fallback for SPA
      historyApiFallback: {
        disableDotRule: true,
        index: "/index.html",
      },

      // Headers
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods":
          "GET, POST, PUT, DELETE, PATCH, OPTIONS",
        "Access-Control-Allow-Headers":
          "X-Requested-With, content-type, Authorization",
      },
    };

    console.log("✅ [DevServer] webpack-dev-server v4+ compatibility applied");

    return enhancedConfig;
  },
};
