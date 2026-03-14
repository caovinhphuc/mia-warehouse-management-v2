import react from "@vitejs/plugin-react";
import path from "path";
import { defineConfig } from "vite";
import viteCompression from "vite-plugin-compression";
import { VitePWA } from "vite-plugin-pwa";

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    react({
      include: "**/*.{jsx,tsx}",
      // Use React 17+ automatic JSX runtime
      jsxRuntime: "automatic",
    }),
    // Gzip compression
    viteCompression({
      verbose: false,
      disable: false,
      threshold: 10240, // Only compress files larger than 10kb
      algorithm: "gzip",
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
      includeAssets: ["favicon.ico", "logo192.png", "logo512.png", "manifest.json"],
      manifest: {
        name: "MIA.vn Google Integration Platform",
        short_name: "MIA.vn",
        description: "Hệ thống tích hợp Google Sheets, Drive, automation",
        theme_color: "#1976d2",
        background_color: "#ffffff",
        start_url: ".",
        display: "standalone",
        icons: [
          { src: "favicon.ico", sizes: "64x64 32x32 24x24 16x16", type: "image/x-icon", purpose: "any" },
          { src: "logo192.png", sizes: "192x192", type: "image/png", purpose: "any maskable" },
          { src: "logo512.png", sizes: "512x512", type: "image/png", purpose: "any maskable" },
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

          // ─── ResizeObserver polyfill (tách riêng để tránh "x is not a constructor") ───
          if (id.includes("resize-observer-polyfill")) {
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
          // antd + rc-* (Table, VirtualList...) phải dùng cùng React instance
          // Fix: _h is not a function (React.createElement) khi rc-* ở chunk khác
          if (
            id.includes("/antd/") ||
            id.includes("/@ant-design/") ||
            id.includes("/rc-")
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
    chunkSizeWarningLimit: 500,
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
    port: 3000,
    host: "localhost",
    open: false,
    cors: true,
    strictPort: true, // Fail nếu 3000 bận → tránh nhầm app khác (MIA retail...) trên 3000
    // ✅ ENABLE HMR for hot reload
    hmr: {
      protocol: "ws",
      host: "localhost",
      port: 3000,
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
    port: 3000,
    host: "localhost",
  },

  // Resolve configuration
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
      "@components": path.resolve(__dirname, "./src/components"),
      "@services": path.resolve(__dirname, "./src/services"),
      "@utils": path.resolve(__dirname, "./src/utils"),
      "@config": path.resolve(__dirname, "./src/config"),
      "@hooks": path.resolve(__dirname, "./src/hooks"),
      "@store": path.resolve(__dirname, "./src/store"),
      "@constants": path.resolve(__dirname, "./src/constants"),
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
