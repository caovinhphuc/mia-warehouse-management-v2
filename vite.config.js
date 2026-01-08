import react from "@vitejs/plugin-react";
import path from "path";
import { defineConfig } from "vite";

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    react({
      include: "**/*.{jsx,tsx}",
      // Use React 17+ automatic JSX runtime
      jsxRuntime: "automatic",
    }),
  ],

  // Build configuration
  build: {
    outDir: "build",
    sourcemap: process.env.GENERATE_SOURCEMAP !== "false",
    minify: "terser",
    target: "es2015",
    rollupOptions: {
      // Multiple entry points: main app và standalone login
      input: {
        main: path.resolve(__dirname, "index.html"),
        login: path.resolve(__dirname, "public/login.html"),
      },
      output: {
        manualChunks(id) {
          // Chunk strategy cho main app
          if (id.includes("node_modules")) {
            if (id.includes("react") || id.includes("react-dom")) {
              return "vendor-react";
            }
            if (id.includes("antd") || id.includes("@ant-design")) {
              return "vendor-antd";
            }
            if (id.includes("googleapis") || id.includes("google-auth")) {
              return "vendor-google";
            }
            if (id.includes("chart") || id.includes("recharts")) {
              return "vendor-charts";
            }
            if (id.includes("redux")) {
              return "vendor-redux";
            }
            return "vendor";
          }
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
    chunkSizeWarningLimit: 1000,
  },

  // Development server
  server: {
    port: 3000,
    host: "localhost",
    open: false,
    cors: true,
    strictPort: false,
    // ✅ ENABLE HMR for hot reload
    hmr: {
      protocol: 'ws',
      host: 'localhost',
      port: 3000,
    },
    watch: {
      usePolling: true,
      interval: 1000,
    },
    proxy: {
      "/api": {
        target: "http://localhost:3001",
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
    dedupe: ["react", "react-dom"],
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
    'process.env': {}, // ✅ Fix "process is not defined"
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
      "chart.js",
      "react-chartjs-2",
      "recharts",
    ],
    exclude: ["googleapis", "google-auth-library"],
    // Force pre-bundling to avoid duplicate React instances
    force: true,
  },

  // Base URL for GitHub Pages or custom domain
  base: process.env.NODE_ENV === "production" ? "./" : "/",

  // Enable esbuild for faster builds
  esbuild: {
    target: "es2015",
    loader: "jsx",
    include: /src\/.*\.[jt]sx?$/,
    logOverride: { "this-is-undefined-in-esm": "silent" },
  },
});
