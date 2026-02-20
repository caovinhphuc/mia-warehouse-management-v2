/**
 * =============================================================================
 * 🚀 CRACO Configuration - MIA.vn Google Integration Platform
 * =============================================================================
 * Professional Webpack configuration for Create React App
 * =============================================================================
 */

const webpack = require("webpack");
const path = require("path");
const TerserPlugin = require("terser-webpack-plugin");
const CompressionPlugin = require("compression-webpack-plugin");
const { BundleAnalyzerPlugin } = require("webpack-bundle-analyzer");

// =============================================================================
// 📦 Environment Configuration
// =============================================================================

const isProduction = process.env.NODE_ENV === "production";
const isDevelopment = !isProduction;
const analyzeBundle = process.env.ANALYZE === "true";
const generateSourceMap = process.env.GENERATE_SOURCEMAP !== "false";

// =============================================================================
// 🔧 Import Meta Environment Variables
// =============================================================================

const createImportMetaEnv = () => {
  const env = {
    // Environment flags
    DEV: isDevelopment,
    PROD: isProduction,
    MODE: process.env.NODE_ENV || "development",

    // API URLs - Map VITE_* to REACT_APP_*
    VITE_API_URL: process.env.REACT_APP_API_URL || "http://localhost:3001",
    VITE_API_BASE_URL:
      process.env.REACT_APP_API_URL || "http://localhost:3001/api",
    VITE_AI_SERVICE_URL:
      process.env.REACT_APP_AI_SERVICE_URL || "http://localhost:8000",

    // Google Services
    VITE_GOOGLE_SHEETS_SPREADSHEET_ID:
      process.env.REACT_APP_GOOGLE_SHEETS_SPREADSHEET_ID || "",
    VITE_GOOGLE_DRIVE_FOLDER_ID:
      process.env.REACT_APP_GOOGLE_DRIVE_FOLDER_ID || "",

    // External Services
    VITE_TELEGRAM_CHAT_ID: process.env.REACT_APP_TELEGRAM_CHAT_ID || "",
    VITE_ANALYTICS_ENDPOINT: process.env.REACT_APP_ANALYTICS_ENDPOINT || "",

    // App Info
    VITE_APP_VERSION: process.env.REACT_APP_VERSION || "1.0.0",
    VITE_SENTRY_DSN: process.env.REACT_APP_SENTRY_DSN || "",

    // Direct REACT_APP_* support (for backward compatibility)
    REACT_APP_API_URL: process.env.REACT_APP_API_URL || "http://localhost:3001",
    REACT_APP_AI_SERVICE_URL:
      process.env.REACT_APP_AI_SERVICE_URL || "http://localhost:8000",
    REACT_APP_GOOGLE_SHEETS_SPREADSHEET_ID:
      process.env.REACT_APP_GOOGLE_SHEETS_SPREADSHEET_ID || "",
    REACT_APP_GOOGLE_DRIVE_FOLDER_ID:
      process.env.REACT_APP_GOOGLE_DRIVE_FOLDER_ID || "",
    REACT_APP_TELEGRAM_CHAT_ID: process.env.REACT_APP_TELEGRAM_CHAT_ID || "",
    REACT_APP_ANALYTICS_ENDPOINT:
      process.env.REACT_APP_ANALYTICS_ENDPOINT || "",
    REACT_APP_VERSION: process.env.REACT_APP_VERSION || "1.0.0",
    REACT_APP_SENTRY_DSN: process.env.REACT_APP_SENTRY_DSN || "",
  };

  return env;
};

// =============================================================================
// 🎯 Main Configuration
// =============================================================================

module.exports = {
  // ===========================================================================
  // � Plugins - Fix webpack-dev-server compatibility
  // ===========================================================================
  plugins: [
    {
      plugin: require("./craco-plugin-fix-devserver.js"),
    },
  ],

  // ===========================================================================
  // 🚀 Development Server Configuration
  // ===========================================================================
  devServer: (devServerConfig, { env, paths, proxy, allowedHost }) => {
    // Remove any remaining deprecated options that react-scripts might have added
    delete devServerConfig.onAfterSetupMiddleware;
    delete devServerConfig.onBeforeSetupMiddleware;
    delete devServerConfig.https; // webpack-dev-server v4+ doesn't support this directly

    // Use new setupMiddlewares API if not already set
    if (!devServerConfig.setupMiddlewares) {
      devServerConfig.setupMiddlewares = (middlewares) => middlewares;
    }

    // Additional devServer customization
    devServerConfig.compress = true;
    devServerConfig.hot = true;
    devServerConfig.historyApiFallback = true;
    devServerConfig.client = {
      overlay: {
        errors: true,
        warnings: false,
      },
    };

    return devServerConfig;
  },

  webpack: {
    configure: (webpackConfig, { env, paths }) => {
      // =======================================================================
      // 📁 Path Aliases - Clean imports
      // =======================================================================

      if (!webpackConfig.resolve) {
        webpackConfig.resolve = {};
      }

      webpackConfig.resolve.alias = {
        ...webpackConfig.resolve.alias,
        "@": path.resolve(__dirname, "src"),
        "@components": path.resolve(__dirname, "src/components"),
        "@services": path.resolve(__dirname, "src/services"),
        "@utils": path.resolve(__dirname, "src/utils"),
        "@config": path.resolve(__dirname, "src/config"),
        "@hooks": path.resolve(__dirname, "src/hooks"),
        "@store": path.resolve(__dirname, "src/store"),
        "@constants": path.resolve(__dirname, "src/constants"),
        "@assets": path.resolve(__dirname, "src/assets"),
        "@pages": path.resolve(__dirname, "src/pages"),
      };

      // =======================================================================
      // 🔍 Resolve Configuration
      // =======================================================================

      webpackConfig.resolve.symlinks = true;
      webpackConfig.resolve.extensions = [
        ".js",
        ".jsx",
        ".ts",
        ".tsx",
        ".json",
        ".mjs",
      ];

      // =======================================================================
      // 🛠️ Node.js Polyfills for Browser
      // =======================================================================

      webpackConfig.resolve.fallback = {
        ...webpackConfig.resolve.fallback,
        // Core Node.js modules
        util: require.resolve("util/"),
        url: false, // url is built-in, no polyfill needed
        stream: require.resolve("stream-browserify"),
        crypto: require.resolve("crypto-browserify"),
        buffer: require.resolve("buffer/"),
        process: require.resolve("process/browser.js"),
        querystring: require.resolve("querystring-es3"),
        http: require.resolve("stream-http"),
        https: require.resolve("https-browserify"),
        os: require.resolve("os-browserify/browser"),
        path: require.resolve("path-browserify"),
        vm: require.resolve("vm-browserify"),
        zlib: require.resolve("browserify-zlib"),
        assert: require.resolve("assert/"),
        // Disable server-only modules
        fs: false,
        net: false,
        tls: false,
        child_process: false,
        worker_threads: false,
        http2: false,
      };

      // =======================================================================
      // 📝 Source Map Configuration
      // =======================================================================

      // Suppress source map warnings for problematic packages
      if (!webpackConfig.module) {
        webpackConfig.module = {};
      }

      if (!webpackConfig.module.rules) {
        webpackConfig.module.rules = [];
      }

      // Add source map loader with exclusions
      webpackConfig.module.rules.push({
        test: /\.(js|mjs|jsx|ts|tsx)$/,
        enforce: "pre",
        use: [
          {
            loader: require.resolve("source-map-loader"),
            options: {
              filterSourceMappingUrl: (url, resourcePath) => {
                // Exclude problematic Google API packages
                const excludedPackages = [
                  "node_modules/agent-base",
                  "node_modules/gaxios",
                  "node_modules/google-auth-library",
                  "node_modules/google-logging-utils",
                  "node_modules/googleapis-common",
                  "node_modules/https-proxy-agent",
                  "node_modules/gcp-metadata",
                  "node_modules/rimraf",
                  "node_modules/glob",
                ];

                return !excludedPackages.some((pkg) =>
                  resourcePath.includes(pkg)
                );
              },
            },
          },
        ],
      });

      // =======================================================================
      // 📦 Module Rules - Handle .mjs files
      // =======================================================================

      webpackConfig.module.rules.push({
        test: /\.mjs$/,
        include: /node_modules/,
        resolve: {
          fullySpecified: false,
        },
        type: "javascript/auto",
      });

      // =======================================================================
      // 🚫 Externals - Exclude backend packages from bundle
      // =======================================================================

      webpackConfig.externals = {
        ...webpackConfig.externals,
        // Backend-only packages that should never be bundled
        googleapis: "commonjs googleapis",
        express: "commonjs express",
        "google-auth-library": "commonjs google-auth-library",
        nodemailer: "commonjs nodemailer",
        "node-cron": "commonjs node-cron",
        multer: "commonjs multer",
        formidable: "commonjs formidable",
        cors: "commonjs cors",
      };

      // =======================================================================
      // 🎨 Optimization Configuration
      // =======================================================================

      if (!webpackConfig.optimization) {
        webpackConfig.optimization = {};
      }

      // Production optimizations
      if (isProduction) {
        webpackConfig.optimization.minimize = true;
        webpackConfig.optimization.minimizer = [
          new TerserPlugin({
            parallel: true,
            terserOptions: {
              compress: {
                drop_console: false, // Keep console for debugging
                drop_debugger: true,
                pure_funcs: ["console.debug", "console.trace"],
              },
              format: {
                comments: /copyright|license|@preserve/i,
              },
              safari10: true,
            },
            extractComments: false,
          }),
        ];

        // Code splitting strategy
        webpackConfig.optimization.splitChunks = {
          chunks: "all",
          cacheGroups: {
            // React vendor chunk
            react: {
              test: /[\\/]node_modules[\\/](react|react-dom|react-router|react-router-dom)[\\/]/,
              name: "vendor-react",
              priority: 20,
              reuseExistingChunk: true,
            },
            // Ant Design chunk
            antd: {
              test: /[\\/]node_modules[\\/](antd|@ant-design)[\\/]/,
              name: "vendor-antd",
              priority: 15,
              reuseExistingChunk: true,
            },
            // Google APIs chunk
            google: {
              test: /[\\/]node_modules[\\/](googleapis|google-auth-library)[\\/]/,
              name: "vendor-google",
              priority: 10,
              reuseExistingChunk: true,
            },
            // Charts chunk
            charts: {
              test: /[\\/]node_modules[\\/](chart\.js|react-chartjs-2|recharts)[\\/]/,
              name: "vendor-charts",
              priority: 10,
              reuseExistingChunk: true,
            },
            // Redux chunk
            redux: {
              test: /[\\/]node_modules[\\/](redux|react-redux|redux-thunk|redux-persist)[\\/]/,
              name: "vendor-redux",
              priority: 10,
              reuseExistingChunk: true,
            },
            // Default vendor chunk
            vendor: {
              test: /[\\/]node_modules[\\/]/,
              name: "vendor",
              priority: 5,
              reuseExistingChunk: true,
            },
            // Common chunk for shared code
            common: {
              minChunks: 2,
              priority: 1,
              reuseExistingChunk: true,
            },
          },
        };
      }

      // =======================================================================
      // 🔌 Plugins Configuration
      // =======================================================================

      if (!webpackConfig.plugins) {
        webpackConfig.plugins = [];
      }

      // Remove existing DefinePlugin to avoid conflicts
      webpackConfig.plugins = webpackConfig.plugins.filter(
        (plugin) => !(plugin instanceof webpack.DefinePlugin)
      );

      const importMetaEnv = createImportMetaEnv();

      // Add new plugins
      const plugins = [
        // ProvidePlugin - Global variables
        new webpack.ProvidePlugin({
          Buffer: ["buffer", "Buffer"],
          process: "process/browser.js",
        }),

        // NormalModuleReplacementPlugin - Fix node: protocol
        new webpack.NormalModuleReplacementPlugin(/^node:/, (resource) => {
          resource.request = resource.request.replace(/^node:/, "");
        }),

        // DefinePlugin - Environment variables and import.meta
        new webpack.DefinePlugin({
          // import.meta.env object
          "import.meta.env": JSON.stringify(importMetaEnv),

          // import.meta.url
          "import.meta.url": JSON.stringify("about:blank"),

          // import.meta object
          "import.meta": JSON.stringify({
            env: importMetaEnv,
            url: "about:blank",
            webpack: true,
            hot: false,
          }),

          // Individual env variables for direct access
          ...Object.keys(importMetaEnv).reduce((acc, key) => {
            acc[`import.meta.env.${key}`] = JSON.stringify(importMetaEnv[key]);
            return acc;
          }, {}),

          // process.env for backward compatibility
          "process.env.NODE_ENV": JSON.stringify(process.env.NODE_ENV),
        }),
      ];

      // Production-only plugins
      if (isProduction) {
        // Compression plugin for gzip
        plugins.push(
          new CompressionPlugin({
            algorithm: "gzip",
            test: /\.(js|css|html|svg)$/,
            threshold: 8192,
            minRatio: 0.8,
            deleteOriginalAssets: false,
          })
        );

        // Bundle Analyzer (if enabled)
        if (analyzeBundle) {
          plugins.push(
            new BundleAnalyzerPlugin({
              analyzerMode: "static",
              openAnalyzer: true,
              reportFilename: "bundle-report.html",
              generateStatsFile: true,
              statsFilename: "bundle-stats.json",
            })
          );
        }
      }

      webpackConfig.plugins = [...webpackConfig.plugins, ...plugins];

      // =======================================================================
      // 📊 Performance Configuration
      // =======================================================================

      if (!webpackConfig.performance) {
        webpackConfig.performance = {};
      }

      webpackConfig.performance.hints = isProduction ? "warning" : false;
      webpackConfig.performance.maxEntrypointSize = 512000; // 500 KB
      webpackConfig.performance.maxAssetSize = 512000; // 500 KB

      // =======================================================================
      // 🎯 Output Configuration
      // =======================================================================

      if (!webpackConfig.output) {
        webpackConfig.output = {};
      }

      // Clean output directory in production
      if (isProduction) {
        webpackConfig.output.clean = true;
      }

      // =======================================================================
      // 📝 Devtool Configuration
      // =======================================================================

      if (generateSourceMap) {
        webpackConfig.devtool = isProduction
          ? "source-map" // Full source map for production
          : "eval-source-map"; // Fast source map for development
      } else {
        webpackConfig.devtool = false;
      }

      return webpackConfig;
    },
  },

  // ===========================================================================
  // 🎨 Babel Configuration (Optional)
  // ===========================================================================

  babel: {
    presets: [
      [
        "@babel/preset-env",
        {
          useBuiltIns: "entry",
          corejs: 3,
          modules: false,
        },
      ],
      [
        "@babel/preset-react",
        {
          runtime: "automatic",
        },
      ],
    ],
    plugins: [
      // Fix loose mode warnings - all plugins must have same loose setting
      ["@babel/plugin-transform-class-properties", { loose: true }],
      ["@babel/plugin-transform-private-methods", { loose: true }],
      ["@babel/plugin-transform-private-property-in-object", { loose: true }],

      // Bundle optimization plugins
      // Ant Design tree-shaking - Only imports used components
      [
        "import",
        {
          libraryName: "antd",
          libraryDirectory: "es",
          style: false, // Ant Design v6 uses CSS-in-JS, no need for style imports
        },
        "antd",
      ],
      // Note: babel-plugin-lodash removed due to deprecation warnings
      // Use direct imports from lodashUtils.js instead:
      // import { debounce } from '@utils/lodashUtils'
    ],
  },

  // ===========================================================================
  // 🎯 Jest Configuration (Optional)
  // ===========================================================================

  jest: {
    configure: (jestConfig) => {
      jestConfig.moduleNameMapper = {
        "^@/(.*)$": "<rootDir>/src/$1",
        "^@components/(.*)$": "<rootDir>/src/components/$1",
        "^@services/(.*)$": "<rootDir>/src/services/$1",
        "^@utils/(.*)$": "<rootDir>/src/utils/$1",
      };
      return jestConfig;
    },
  },
};
