module.exports = {
  ci: {
    collect: {
      // URL của ứng dụng sau khi build
      url: ["http://localhost:3000"],
      // Số lần chạy test để có kết quả ổn định
      numberOfRuns: 3,
      // Cấu hình cho static build
      staticDistDir: "./build",
    },
    assert: {
      // Ngưỡng điểm số tối thiểu cho các metrics
      assertions: {
        "categories:performance": ["error", { minScore: 0.8 }],
        "categories:accessibility": ["error", { minScore: 0.9 }],
        "categories:best-practices": ["error", { minScore: 0.9 }],
        "categories:seo": ["error", { minScore: 0.8 }],
        "categories:pwa": ["warn", { minScore: 0.6 }],

        // Performance metrics
        "first-contentful-paint": ["error", { maxNumericValue: 2000 }],
        "largest-contentful-paint": ["error", { maxNumericValue: 4000 }],
        "cumulative-layout-shift": ["error", { maxNumericValue: 0.1 }],
        "total-blocking-time": ["error", { maxNumericValue: 300 }],
        "speed-index": ["error", { maxNumericValue: 3000 }],

        // Resource optimization
        "unused-css-rules": ["warn", { maxLength: 0 }],
        "unused-javascript": ["warn", { maxLength: 0 }],
        "unminified-css": ["warn", { maxLength: 0 }],
        "unminified-javascript": ["warn", { maxLength: 0 }],
        "unused-css-rules": ["warn", { maxLength: 0 }],
        "render-blocking-resources": ["warn", { maxLength: 0 }],

        // Image optimization
        "uses-optimized-images": ["warn", { maxLength: 0 }],
        "uses-webp-images": ["warn", { maxLength: 0 }],
        "uses-text-compression": ["warn", { maxLength: 0 }],

        // Security
        "is-on-https": ["error", { maxLength: 0 }],
        "uses-http2": ["warn", { maxLength: 0 }],
      },
    },
    upload: {
      // Upload kết quả lên Lighthouse CI server
      target: "temporary-public-storage",
      // Cấu hình cho GitHub integration
      githubAppToken: process.env.LHCI_GITHUB_APP_TOKEN,
      // Tạo comment trên PR
      githubAppId: process.env.LHCI_GITHUB_APP_ID,
      githubAppInstallationId: process.env.LHCI_GITHUB_APP_INSTALLATION_ID,
    },
    // Cấu hình cho development
    server: {
      // Chạy server local để test
      command: "npm run serve",
      port: 3000,
      // Đợi server khởi động
      wait: 5000,
    },
  },
};
