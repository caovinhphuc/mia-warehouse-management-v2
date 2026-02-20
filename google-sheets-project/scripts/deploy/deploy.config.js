/**
 * MIA Warehouse Management - Deployment Configuration
 * Cấu hình triển khai có thể tuỳ chỉnh cho các môi trường khác nhau
 */

module.exports = {
  // ===== CẤU HÌNH MÔI TRƯỜNG =====
  environments: {
    // Môi trường Development (phát triển)
    dev: {
      name: "Development",
      enabled: true,

      // Cấu hình Build
      build: {
        mode: "development",
        sourceMaps: true,
        optimization: false,
        minify: false,
        outputDir: "build-dev",
      },

      // Cấu hình Backend
      backend: {
        port: 5050,
        host: "localhost",
        apiUrl: "http://localhost:5050/api",
        cors: {
          enabled: true,
          origins: ["http://localhost:3000", "http://localhost:5173"],
        },
      },

      // Cấu hình Frontend
      frontend: {
        port: 5173,
        host: "localhost",
        publicUrl: "http://localhost:5173",
        proxy: true,
      },

      // Deployment target
      target: "local",
      autoReload: true,
      hotReload: true,
    },

    // Môi trường Staging (thử nghiệm)
    staging: {
      name: "Staging",
      enabled: true,

      build: {
        mode: "production",
        sourceMaps: true,
        optimization: true,
        minify: true,
        outputDir: "build-staging",
      },

      backend: {
        port: 3001,
        host: "0.0.0.0",
        apiUrl: "https://staging-api.mia-warehouse.com/api",
        cors: {
          enabled: true,
          origins: ["https://staging.mia-warehouse.com"],
        },
      },

      frontend: {
        port: 3000,
        host: "0.0.0.0",
        publicUrl: "https://staging.mia-warehouse.com",
        proxy: false,
      },

      target: "gcp",
      autoReload: false,
      hotReload: false,
    },

    // Môi trường Production (sản xuất)
    production: {
      name: "Production",
      enabled: true,

      build: {
        mode: "production",
        sourceMaps: false,
        optimization: true,
        minify: true,
        outputDir: "build",
      },

      backend: {
        port: 3001,
        host: "0.0.0.0",
        apiUrl: "https://api.mia-warehouse.com/api",
        cors: {
          enabled: true,
          origins: ["https://mia-warehouse.com", "https://www.mia-warehouse.com"],
        },
      },

      frontend: {
        port: 80,
        host: "0.0.0.0",
        publicUrl: "https://mia-warehouse.com",
        proxy: false,
      },

      target: "gcp",
      autoReload: false,
      hotReload: false,
    },
  },

  // ===== CẤU HÌNH DEPLOYMENT TARGET =====
  targets: {
    // Deploy local (máy tính cá nhân)
    local: {
      name: "Local Development",
      enabled: true,

      frontend: {
        command: "npm run dev",
        startDelay: 2000,
      },

      backend: {
        command: "npm run start:backend",
        startDelay: 3000,
      },

      database: {
        type: "sqlite",
        path: "./data/local.db",
      },
    },

    // Deploy lên Google Cloud Platform
    gcp: {
      name: "Google Cloud Platform",
      enabled: true,

      project: {
        id: "mia-warehouse-v2",
        region: "asia-southeast1",
        zone: "asia-southeast1-a",
      },

      compute: {
        enabled: true,
        instanceName: "mia-warehouse-vm",
        machineType: "e2-medium",
        diskSize: "30GB",
        diskType: "pd-standard",
      },

      appEngine: {
        enabled: false,
        runtime: "nodejs18",
        instanceClass: "F2",
      },

      cloudRun: {
        enabled: false,
        region: "asia-southeast1",
        memory: "512Mi",
        cpu: 1,
        maxInstances: 10,
        minInstances: 0,
      },

      storage: {
        bucket: "mia-warehouse-storage",
        location: "asia-southeast1",
      },

      database: {
        type: "googlesheets",
        spreadsheetId: process.env.GOOGLE_SHEET_ID || "",
      },

      authentication: {
        method: "service-account",
        keyFile: process.env.GOOGLE_APPLICATION_CREDENTIALS || "./config/service-account.json",
      },
    },

    // Deploy lên Docker
    docker: {
      name: "Docker Container",
      enabled: true,

      compose: {
        enabled: true,
        file: "docker-compose.yml",
        services: ["frontend", "backend"],
      },

      frontend: {
        image: "mia-warehouse-frontend",
        tag: "latest",
        port: 80,
        dockerfile: "Dockerfile",
      },

      backend: {
        image: "mia-warehouse-backend",
        tag: "latest",
        port: 3001,
        dockerfile: "Dockerfile.backend",
      },

      network: {
        name: "mia-network",
        driver: "bridge",
      },

      volumes: {
        data: "./data",
        logs: "./logs",
        config: "./config",
      },
    },

    // Deploy lên Netlify (frontend only)
    netlify: {
      name: "Netlify",
      enabled: true,

      siteId: process.env.NETLIFY_SITE_ID || "",
      authToken: process.env.NETLIFY_AUTH_TOKEN || "",

      build: {
        command: "npm run build",
        publish: "build",
        functions: "netlify/functions",
      },

      environment: {
        NODE_VERSION: "18",
      },

      redirects: [
        { from: "/api/*", to: "https://api.mia-warehouse.com/api/:splat", status: 200 },
        { from: "/*", to: "/index.html", status: 200 },
      ],
    },

    // Deploy lên Vercel (frontend only)
    vercel: {
      name: "Vercel",
      enabled: true,

      projectId: process.env.VERCEL_PROJECT_ID || "",
      orgId: process.env.VERCEL_ORG_ID || "",
      token: process.env.VERCEL_TOKEN || "",

      build: {
        command: "npm run build",
        outputDirectory: "build",
      },

      framework: "vite",

      rewrites: [
        { source: "/api/:path*", destination: "https://api.mia-warehouse.com/api/:path*" },
      ],
    },
  },

  // ===== CẤU HÌNH CHUNG =====
  general: {
    // Tên dự án
    projectName: "MIA Warehouse Management v2",
    version: "2.0.0",

    // Thư mục
    paths: {
      root: "/Users/phuccao/Projects/mia-warehouse-management-v2",
      frontend: "./React-OAS-Integration-v4.0",
      backend: "./backend",
      scripts: "./React-OAS-Integration-v4.0/scripts",
      config: "./config",
      logs: "./logs",
      backups: "./backups",
    },

    // Git
    git: {
      autoCommit: false,
      commitMessage: "Deploy: ${ENV} - ${TIMESTAMP}",
      autoPush: false,
      branch: {
        dev: "develop",
        staging: "staging",
        production: "main",
      },
    },

    // Backup
    backup: {
      enabled: true,
      beforeDeploy: true,
      retention: 7, // ngày
      compress: true,
      exclude: ["node_modules", "build*", ".git", "logs"],
    },

    // Health Check
    healthCheck: {
      enabled: true,
      timeout: 30000,
      retries: 3,
      interval: 5000,
      endpoints: {
        backend: "/api/health",
        frontend: "/",
      },
    },

    // Notification
    notification: {
      enabled: false,
      channels: {
        email: {
          enabled: false,
          recipients: ["admin@mia-warehouse.com"],
        },
        slack: {
          enabled: false,
          webhook: process.env.SLACK_WEBHOOK_URL || "",
        },
        telegram: {
          enabled: false,
          botToken: process.env.TELEGRAM_BOT_TOKEN || "",
          chatId: process.env.TELEGRAM_CHAT_ID || "",
        },
      },
      events: ["deploy-start", "deploy-success", "deploy-failure"],
    },

    // Security
    security: {
      sslEnabled: true,
      httpsOnly: true,
      securityHeaders: true,
      rateLimiting: true,
      cors: true,
    },
  },

  // ===== CẤU HÌNH BUILD =====
  build: {
    // Pre-build commands
    preBuild: ["npm install", "npm run lint:fix"],

    // Build commands theo môi trường
    commands: {
      dev: "npm run build:dev",
      staging: "npm run build:staging",
      production: "npm run build",
    },

    // Post-build commands
    postBuild: ["npm run analyze:bundle"],

    // Environment variables
    env: {
      shared: {
        NODE_ENV: "production",
        REACT_APP_VERSION: "2.0.0",
      },
      dev: {
        REACT_APP_API_URL: "http://localhost:5050/api",
        REACT_APP_ENV: "development",
      },
      staging: {
        REACT_APP_API_URL: "https://staging-api.mia-warehouse.com/api",
        REACT_APP_ENV: "staging",
      },
      production: {
        REACT_APP_API_URL: "https://api.mia-warehouse.com/api",
        REACT_APP_ENV: "production",
      },
    },

    // Optimization
    optimization: {
      splitChunks: true,
      treeshaking: true,
      compression: "gzip",
      imageOptimization: true,
    },
  },

  // ===== CẤU HÌNH CI/CD =====
  cicd: {
    enabled: false,

    github: {
      enabled: false,
      workflows: {
        dev: ".github/workflows/deploy-dev.yml",
        staging: ".github/workflows/deploy-staging.yml",
        production: ".github/workflows/deploy-production.yml",
      },
      secrets: ["GCP_PROJECT_ID", "GCP_SERVICE_ACCOUNT", "NETLIFY_AUTH_TOKEN", "VERCEL_TOKEN"],
    },

    gitlab: {
      enabled: false,
      pipelines: ".gitlab-ci.yml",
    },
  },

  // ===== CẤU HÌNH MONITORING =====
  monitoring: {
    enabled: false,

    logging: {
      level: "info",
      format: "json",
      destination: "./logs/deploy.log",
      rotation: {
        enabled: true,
        maxSize: "10m",
        maxFiles: 10,
      },
    },

    metrics: {
      enabled: false,
      provider: "prometheus",
      endpoint: "/metrics",
    },

    errorTracking: {
      enabled: false,
      provider: "sentry",
      dsn: process.env.SENTRY_DSN || "",
    },
  },
};
