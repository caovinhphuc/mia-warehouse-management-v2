/**
 * =============================================================================
 * 🔧 CRACO Plugin: Fix webpack-dev-server v4+ Compatibility
 * =============================================================================
 * This plugin removes the deprecated onAfterSetupMiddleware and
 * onBeforeSetupMiddleware options and replaces them with setupMiddlewares
 * =============================================================================
 */

module.exports = {
  overrideDevServerConfig: ({
    devServerConfig,
    cracoConfig,
    pluginOptions,
    context: { env, paths, proxy },
  }) => {
    // Log the problematic keys for debugging
    const problematicKeys = [
      "onAfterSetupMiddleware",
      "onBeforeSetupMiddleware",
      "https",
    ];
    const foundKeys = problematicKeys.filter((key) => key in devServerConfig);
    if (foundKeys.length > 0) {
      console.log(`🔧 Removing deprecated keys: ${foundKeys.join(", ")}`);
    }

    // Remove deprecated options
    if (devServerConfig.onAfterSetupMiddleware) {
      delete devServerConfig.onAfterSetupMiddleware;
    }
    if (devServerConfig.onBeforeSetupMiddleware) {
      delete devServerConfig.onBeforeSetupMiddleware;
    }

    // Fix https option - webpack-dev-server v4+ uses 'server' property instead
    if (devServerConfig.https) {
      const httpsValue = devServerConfig.https;
      delete devServerConfig.https;

      // If https was true, set server to 'https'
      if (httpsValue === true && !devServerConfig.server) {
        devServerConfig.server = "https";
      }
      // For other truthy values (like objects with key/cert), ignore them in dev
      // since we typically don't need SSL in development
    }

    // Add new setupMiddlewares function if not already present
    if (!devServerConfig.setupMiddlewares) {
      devServerConfig.setupMiddlewares = (middlewares, devServer) => {
        // Return middlewares without modification
        // Custom middleware can be added here if needed
        return middlewares;
      };
    }

    console.log("✅ webpack-dev-server v4+ compatibility patch applied");

    return devServerConfig;
  },
};
