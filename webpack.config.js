/**
 * =============================================================================
 * 🚀 Webpack Configuration - MIA.vn Google Integration Platform
 * =============================================================================
 * Professional Webpack 5 configuration for React application
 *
 * Note: This project uses CRACO (Create React App Configuration Override)
 * This webpack.config.js serves as a reference/fallback configuration
 * =============================================================================
 */

const path = require("path");
const webpack = require("webpack");
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
// 🎯 Path Configuration
// =============================================================================

const paths = {
  root: path.resolve(__dirname),
  src: path.resolve(__dirname, "src"),
  build: path.resolve(__dirname, "build"),
  public: path.resolve(__dirname, "public"),
  nodeModules: path.resolve(__dirname, "node_modules"),
};

// =============================================================================
// 🔧 Import Meta Environment Variables
// =============================================================================

const createImportMetaEnv = () => {
  return {
    // Environment flags
    DEV: isDevelopment,
    PROD: isProduction,
    MODE: process.env.NODE_ENV || "development",

    // API URLs
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
  };
};

// =============================================================================
// 🎨 Main Configuration
// =============================================================================

module.exports = {
  mode: isProduction ? "production" : "development",

  // Entry point
  entry: {
    main: path.resolve(paths.src, "index.js"),
  },

  // Output configuration
  output: {
    path: paths.build,
    filename: isProduction
      ? "static/js/[name].[contenthash:8].js"
      : "static/js/[name].js",
    chunkFilename: isProduction
      ? "static/js/[name].[contenthash:8].chunk.js"
      : "static/js/[name].chunk.js",
    assetModuleFilename: "static/media/[name].[hash][ext]",
    publicPath: "/",
    clean: isProduction,
    pathinfo: isDevelopment,
  },

  // ===========================================================================
  // 🔍 Resolve Configuration
  // ===========================================================================

  resolve: {
    modules: ["node_modules", paths.src],
    extensions: [".js", ".jsx", ".json", ".ts", ".tsx"],
    alias: {
      "@": paths.src,
      "@components": path.resolve(paths.src, "components"),
      "@services": path.resolve(paths.src, "services"),
      "@utils": path.resolve(paths.src, "utils"),
      "@config": path.resolve(paths.src, "config"),
      "@hooks": path.resolve(paths.src, "hooks"),
      "@store": path.resolve(paths.src, "store"),
      "@constants": path.resolve(paths.src, "constants"),
      "@assets": path.resolve(paths.src, "assets"),
      "@pages": path.resolve(paths.src, "pages"),
    },
    fallback: {
      // Node.js polyfills for browser
      util: require.resolve("util/"),
      url: false, // Built-in, no polyfill needed
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
    },
  },

  // ===========================================================================
  // 📝 Devtool Configuration
  // ===========================================================================

  devtool: generateSourceMap
    ? isProduction
      ? "source-map"
      : "eval-source-map"
    : false,

  // ===========================================================================
  // 🛠️ Module Rules
  // ===========================================================================

  module: {
    rules: [
      // JavaScript/JSX files
      {
        test: /\.(js|mjs|jsx|ts|tsx)$/,
        exclude: /node_modules/,
        use: {
          loader: require.resolve("babel-loader"),
          options: {
            presets: [
              [
                require.resolve("@babel/preset-env"),
                {
                  useBuiltIns: "entry",
                  corejs: 3,
                  modules: false,
                },
              ],
              [
                require.resolve("@babel/preset-react"),
                {
                  runtime: "automatic",
                },
              ],
            ],
            plugins: [
              ["@babel/plugin-transform-class-properties", { loose: true }],
              ["@babel/plugin-transform-private-methods", { loose: true }],
              [
                "@babel/plugin-transform-private-property-in-object",
                { loose: true },
              ],
            ],
            cacheDirectory: true,
            cacheCompression: false,
          },
        },
      },

      // CSS files
      {
        test: /\.css$/,
        use: [
          require.resolve("style-loader"),
          {
            loader: require.resolve("css-loader"),
            options: {
              importLoaders: 1,
              modules: {
                localIdentName: isDevelopment
                  ? "[name]__[local]--[hash:base64:5]"
                  : "[hash:base64:8]",
              },
            },
          },
          {
            loader: require.resolve("postcss-loader"),
            options: {
              postcssOptions: {
                plugins: [
                  require("autoprefixer"),
                  isProduction && require("cssnano"),
                ].filter(Boolean),
              },
            },
          },
        ],
      },

      // Asset files (images, fonts, etc.)
      {
        test: /\.(png|jpe?g|gif|svg|webp|ico)$/i,
        type: "asset",
        parser: {
          dataUrlCondition: {
            maxSize: 8 * 1024, // 8KB
          },
        },
      },

      {
        test: /\.(woff|woff2|eot|ttf|otf)$/i,
        type: "asset/resource",
      },

      // Source map loader (with exclusions)
      {
        test: /\.(js|mjs|jsx|ts|tsx)$/,
        enforce: "pre",
        use: [
          {
            loader: require.resolve("source-map-loader"),
            options: {
              filterSourceMappingUrl: (url, resourcePath) => {
                const excludedPackages = [
                  "node_modules/agent-base",
                  "node_modules/gaxios",
                  "node_modules/google-auth-library",
                ];
                return !excludedPackages.some((pkg) =>
                  resourcePath.includes(pkg)
                );
              },
            },
          },
        ],
      },
    ],
  },

  // ===========================================================================
  // 🎯 Optimization Configuration
  // ===========================================================================

  optimization: {
    minimize: isProduction,
    minimizer: [
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
    ],

    // Code splitting strategy
    splitChunks: {
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
    },

    // Runtime chunk
    runtimeChunk: {
      name: (entrypoint) => `runtime-${entrypoint.name}`,
    },
  },

  // ===========================================================================
  // 🔌 Plugins Configuration
  // ===========================================================================

  plugins: [
    // ProvidePlugin - Global variables
    new webpack.ProvidePlugin({
      Buffer: ["buffer", "Buffer"],
      process: "process/browser.js",
    }),

    // NormalModuleReplacementPlugin - Fix node: protocol
    new webpack.NormalModuleReplacementPlugin(/^node:/, (resource) => {
      resource.request = resource.request.replace(/^node:/, "");
    }),

    // DefinePlugin - Environment variables
    new webpack.DefinePlugin({
      "process.env.NODE_ENV": JSON.stringify(process.env.NODE_ENV),
      "import.meta.env": JSON.stringify(createImportMetaEnv()),
      "import.meta.url": JSON.stringify("about:blank"),
    }),

    // Production-only plugins
    ...(isProduction
      ? [
          // Compression plugin for gzip
          new CompressionPlugin({
            algorithm: "gzip",
            test: /\.(js|css|html|svg)$/,
            threshold: 8192,
            minRatio: 0.8,
            deleteOriginalAssets: false,
          }),

          // Bundle Analyzer (if enabled)
          ...(analyzeBundle
            ? [
                new BundleAnalyzerPlugin({
                  analyzerMode: "static",
                  openAnalyzer: true,
                  reportFilename: "bundle-report.html",
                  generateStatsFile: true,
                  statsFilename: "bundle-stats.json",
                }),
              ]
            : []),
        ]
      : []),
  ],

  // ===========================================================================
  // 📊 Performance Configuration
  // ===========================================================================

  performance: {
    hints: isProduction ? "warning" : false,
    maxEntrypointSize: 512000, // 500 KB
    maxAssetSize: 512000, // 500 KB
  },

  // ===========================================================================
  // 🚀 Development Server Configuration
  // ===========================================================================

  ...(isDevelopment && {
    devServer: {
      static: {
        directory: paths.public,
      },
      compress: true,
      hot: true,
      open: true,
      port: 3000,
      historyApiFallback: true,
      client: {
        overlay: {
          errors: true,
          warnings: false,
        },
      },
    },
  }),
};
