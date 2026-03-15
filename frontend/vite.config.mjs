import react from "@vitejs/plugin-react";
import path from "path";
import { defineConfig } from "vite";
import viteCompression from "vite-plugin-compression";
import { VitePWA } from "vite-plugin-pwa";

const getPackageName = (id) => {
  const normalizedId = id.split("\\").join("/");
  const nodeModulesIndex = normalizedId.lastIndexOf("node_modules/");

  if (nodeModulesIndex === -1) return null;

  let packagePath = normalizedId.slice(
    nodeModulesIndex + "node_modules/".length
  );

  if (packagePath.startsWith(".pnpm/")) {
    const nestedNodeModulesIndex = packagePath.indexOf("node_modules/");
    if (nestedNodeModulesIndex === -1) return null;
    packagePath = packagePath.slice(
      nestedNodeModulesIndex + "node_modules/".length
    );
  }

  const parts = packagePath.split("/");
  if (parts[0].startsWith("@")) {
    return parts.slice(0, 2).join("/");
  }

  return parts[0];
};

const antDesignPackages = new Set([
  "antd",
  "@ant-design/cssinjs",
  "@ant-design/colors",
  "@ant-design/fast-color",
  "@ant-design/icons",
  "@ant-design/icons-svg",
  "@ant-design/react-slick",
  "@babel/runtime",
  "@rc-component/async-validator",
  "@rc-component/color-picker",
  "@rc-component/context",
  "@rc-component/mini-decimal",
  "@rc-component/mutate-observer",
  "@rc-component/portal",
  "@rc-component/qrcode",
  "@rc-component/tour",
  "array-tree-filter",
  "async-validator",
  "classnames",
  "compute-scroll-into-view",
  "copy-to-clipboard",
  "rc-calendar",
  "rc-cascader",
  "rc-checkbox",
  "rc-collapse",
  "rc-dialog",
  "rc-drawer",
  "rc-dropdown",
  "rc-field-form",
  "rc-image",
  "rc-input",
  "rc-input-number",
  "rc-mentions",
  "rc-menu",
  "rc-motion",
  "rc-notification",
  "rc-overflow",
  "rc-pagination",
  "rc-picker",
  "rc-progress",
  "rc-rate",
  "rc-resize-observer",
  "rc-segmented",
  "rc-select",
  "rc-slider",
  "rc-steps",
  "rc-switch",
  "rc-table",
  "rc-tabs",
  "rc-textarea",
  "rc-tooltip",
  "rc-tree",
  "rc-tree-select",
  "rc-upload",
  "rc-util",
  "rc-virtual-list",
  "resize-observer-polyfill",
  "scroll-into-view-if-needed",
  "stylis",
  "throttle-debounce",
  "toggle-selection",
]);

// https://vitejs.dev/config/
const DEV_PORT = Number(process.env.PORT || 3000);
export default defineConfig({
  plugins: [
    react({
      include: "**/*.{jsx,tsx}",
      // Use React 17+ automatic JSX runtime
      jsxRuntime: "automatic",
    }),
    viteCompression({
      verbose: false,
      disable: false,
      threshold: 10240, // Only compress files larger than 10kb
      ext: ".gz",
    }),
    // Brotli compression (better than gzip)
    viteCompression({
      verbose: false,
      disable: false,
      threshold: 10240,
      algorithm: "brotliCompress",
      ext: ".br",
    }),
    // PWA: Service Worker + caching
    VitePWA({
      registerType: "autoUpdate",
      includeAssets: [
        "favicon.ico",
        "logo192.png",
        "logo512.png",
        "manifest.json",
      ],
      manifest: {
        name: "MIA.vn Google Integration Platform",
        short_name: "MIA.vn",
        description: "Hệ thống tích hợp Google Sheets, Drive, automation",
        theme_color: "#1976d2",
        background_color: "#ffffff",
        start_url: ".",
        display: "standalone",
        icons: [
          {
            src: "favicon.ico",
            sizes: "64x64 32x32 24x24 16x16",
            type: "image/x-icon",
            purpose: "any",
          },
          {
            src: "logo192.png",
            sizes: "192x192",
            type: "image/png",
            purpose: "any maskable",
          },
          {
            src: "logo512.png",
            sizes: "512x512",
            type: "image/png",
            purpose: "any maskable",
          },
        ],
      },
      workbox: {
        globPatterns: ["**/*.{js,css,html,ico,png,svg,woff2}"],
        cleanupOutdatedCaches: true,
        clientsClaim: true,
        skipWaiting: true,
      },
    }),
  ],

  // Build configuration
  build: {
    outDir: "build",
    sourcemap: process.env.GENERATE_SOURCEMAP !== "false",
    minify: "terser",
    target: "es2015",
    cssCodeSplit: true,
    rollupOptions: {
      // Multiple entry points: main app và standalone login
      input: {
        main: path.resolve(__dirname, "index.html"),
        login: path.resolve(__dirname, "login.html"),
      },
      output: {
        manualChunks(id) {
          if (!id.includes("node_modules")) return;

          const packageName = getPackageName(id);

          // ─── ResizeObserver polyfill (tách riêng để tránh "x is not a constructor") ───
          if (packageName === "resize-observer-polyfill") {
            return "polyfill-resize-observer";
          }

          // ─── React ecosystem ────────────────────────────────────────────
          // Gộp tất cả react internal deps vào 1 chunk để tránh circular ref
          if (
            id.includes("/react/") ||
            id.includes("/react-dom/") ||
            id.includes("/react-is/") ||
            id.includes("/scheduler/") || // react-dom's internal dep
            id.includes("/use-sync-external-store/") // react-redux dep
          ) {
            return "vendor-react";
          }

          // ─── Ant Design ─────────────────────────────────────────────────
          // Giữ chung 1 chunk để tránh circular chunk graph trong nội bộ AntD.
          if (
            antDesignPackages.has(packageName) ||
            packageName?.startsWith("@ant-design/") ||
            packageName?.startsWith("@rc-component/") ||
            packageName?.startsWith("rc-")
          ) {
            return "vendor-antd";
          }

          // ─── Chart library (Recharts only - Chart.js đã migrate) ─────────
          if (id.includes("/recharts/") || id.includes("/d3-")) {
            return "vendor-recharts";
          }

          // ─── Redux ecosystem ─────────────────────────────────────────────
          if (
            id.includes("/redux/") ||
            id.includes("/react-redux/") ||
            id.includes("/redux-") ||
            id.includes("/immer/") ||
            id.includes("/reselect/")
          ) {
            return "vendor-redux";
          }

          // ─── Router ──────────────────────────────────────────────────────
          if (id.includes("/react-router")) {
            return "vendor-router";
          }

          // ─── MUI ─────────────────────────────────────────────────────────
          if (id.includes("/@mui/") || id.includes("/@emotion/")) {
            return "vendor-mui";
          }

          // ─── Utility libraries ───────────────────────────────────────────
          if (
            id.includes("/lodash/") ||
            id.includes("/lodash-es/") ||
            id.includes("/dayjs/") ||
            id.includes("/moment/")
          ) {
            return "vendor-utils";
          }

          // ─── Google APIs (very large, isolate) ───────────────────────────
          if (
            id.includes("/googleapis/") ||
            id.includes("/google-auth-library/")
          ) {
            return "vendor-google";
          }

          // ─── Socket.io & networking ──────────────────────────────────────
          if (id.includes("/socket.io") || id.includes("/engine.io")) {
            return "vendor-socket";
          }

          // ─── All remaining node_modules ──────────────────────────────────
          return "vendor";
        },
        // Entry file names
        entryFileNames: (chunkInfo) => {
          return chunkInfo.name === "login"
            ? "login/[name]-[hash].js"
            : "assets/[name]-[hash].js";
        },
        chunkFileNames: (chunkInfo) => {
          return chunkInfo.name === "login"
            ? "login/[name]-[hash].js"
            : "assets/[name]-[hash].js";
        },
        assetFileNames: (assetInfo) => {
          if (assetInfo.name === "login.html") {
            return "login.html";
          }
          return "assets/[name]-[hash].[ext]";
        },
      },
    },
    chunkSizeWarningLimit: 1250,
    terserOptions: {
      compress: {
        drop_console: process.env.NODE_ENV === "production",
        drop_debugger: true,
        pure_funcs: ["console.log", "console.info"],
      },
    },
  },

  // Development server
  server: {
    port: DEV_PORT,
    host: "localhost",
    open: false,
    cors: true,
    strictPort: false, // Tự fallback sang 3001/3002... nếu 3000 đang bận
    // ✅ ENABLE HMR for hot reload
    hmr: {
      protocol: "ws",
      host: "localhost",
    },
    watch: {
      usePolling: true,
      interval: 1000,
    },
    proxy: {
      "/api": {
        target: "http://127.0.0.1:3001",
        changeOrigin: true,
        secure: false,
        ws: true, // ✅ Enable WebSocket for API
      },
    },
  },

  // Preview server
  preview: {
    port: DEV_PORT,
    host: "localhost",
  },

  // Resolve configuration
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
      // FSD layers
      "@app": path.resolve(__dirname, "./src/app"),
      "@pages": path.resolve(__dirname, "./src/pages"),
      "@widgets": path.resolve(__dirname, "./src/widgets"),
      "@features": path.resolve(__dirname, "./src/features"),
      "@shared": path.resolve(__dirname, "./src/shared"),
      // Shared sub-packages (new locations)
      "@hooks": path.resolve(__dirname, "./src/shared/hooks"),
      "@utils": path.resolve(__dirname, "./src/shared/lib"),
      "@config": path.resolve(__dirname, "./src/shared/config"),
      "@constants": path.resolve(__dirname, "./src/shared/constants"),
      // Legacy aliases kept for backward compat
      "@components": path.resolve(__dirname, "./src/components"),
      "@services": path.resolve(__dirname, "./src/services"),
      "@store": path.resolve(__dirname, "./src/store"),
      // Fix: Ensure single React instance - use absolute paths
      react: path.resolve(__dirname, "./node_modules/react"),
      "react-dom": path.resolve(__dirname, "./node_modules/react-dom"),
      "react/jsx-runtime": path.resolve(
        __dirname,
        "./node_modules/react/jsx-runtime"
      ),
      "react/jsx-dev-runtime": path.resolve(
        __dirname,
        "./node_modules/react/jsx-dev-runtime"
      ),
    },
    dedupe: ["react", "react-dom", "resize-observer-polyfill"],
  },

  // CSS configuration
  css: {
    modules: {
      localsConvention: "camelCase",
    },
    preprocessorOptions: {
      less: {
        modifyVars: {
          // Ant Design theme customization
          "@primary-color": "#1890ff",
          "@link-color": "#1890ff",
          "@success-color": "#52c41a",
          "@warning-color": "#faad14",
          "@error-color": "#f5222d",
        },
        javascriptEnabled: true,
      },
    },
  },

  // Environment variables - ✅ FIX process.env
  define: {
    global: "globalThis",
    "process.env": {}, // ✅ Fix "process is not defined"
  },

  // Optimization
  optimizeDeps: {
    include: [
      "react",
      "react-dom",
      "react/jsx-runtime",
      "react-router-dom",
      "antd",
      "@ant-design/icons",
      "axios",
      "dayjs",
      "lodash",
      "recharts",
      "resize-observer-polyfill", // Fix "x is not a constructor" (rc-resize-observer/observerUtil.js)
    ],
    exclude: ["googleapis", "google-auth-library"],
    // Force pre-bundling to avoid duplicate React instances
    force: true,
  },

  // Base URL: "/" cho Netlify/Vercel (root deploy); dùng VITE_BASE_URL nếu cần subpath
  base: process.env.VITE_BASE_URL || "/",

  // Enable esbuild for faster builds
  esbuild: {
    target: "es2015",
    loader: "jsx",
    include: /src\/.*\.[jt]sx?$/,
    logOverride: { "this-is-undefined-in-esm": "silent" },
  },
});
