/**
 * ESLint Configuration (CommonJS)
 * This is the standard eslint.config.js file for projects that may need CommonJS compatibility
 */
const js = require("@eslint/js");

module.exports = [
  js.configs.recommended,
  {
    files: ["**/*.{js,jsx,ts,tsx}"],
    languageOptions: {
      ecmaVersion: "latest",
      sourceType: "module",
      parserOptions: {
        ecmaFeatures: {
          jsx: true,
        },
      },
      globals: {
        // Browser globals
        window: "readonly",
        document: "readonly",
        console: "readonly",
        setTimeout: "readonly",
        clearTimeout: "readonly",
        setInterval: "readonly",
        clearInterval: "readonly",
        fetch: "readonly",
        alert: "readonly",
        confirm: "readonly",
        prompt: "readonly",
        navigator: "readonly",
        location: "readonly",
        history: "readonly",
        performance: "readonly",
        sessionStorage: "readonly",
        localStorage: "readonly",
        atob: "readonly",
        btoa: "readonly",
        Image: "readonly",
        FileReader: "readonly",
        File: "readonly",
        Blob: "readonly",
        URL: "readonly",
        URLSearchParams: "readonly",
        FormData: "readonly",
        Headers: "readonly",
        Request: "readonly",
        Response: "readonly",
        WebSocket: "readonly",
        PerformanceObserver: "readonly",
        MutationObserver: "readonly",
        IntersectionObserver: "readonly",
        ResizeObserver: "readonly",

        // Node.js globals
        process: "readonly",
        global: "readonly",
        __dirname: "readonly",
        __filename: "readonly",
        Buffer: "readonly",
        module: "readonly",
        require: "readonly",
        exports: "readonly",

        // React globals
        React: "readonly",
        JSX: "readonly",

        // Testing globals
        test: "readonly",
        expect: "readonly",
        describe: "readonly",
        it: "readonly",
        beforeEach: "readonly",
        afterEach: "readonly",
        beforeAll: "readonly",
        afterAll: "readonly",
        jest: "readonly",
        vi: "readonly",
        vitest: "readonly",
      },
    },
    rules: {
      // Code quality
      "no-console": ["warn", { allow: ["warn", "error", "info"] }],
      "no-debugger": "warn",
      "no-alert": "warn",
      "no-unused-vars": [
        "warn",
        {
          argsIgnorePattern: "^_",
          varsIgnorePattern: "^_",
          ignoreRestSiblings: true,
        },
      ],
      "no-undef": "error",
      "no-var": "error",
      "prefer-const": "warn",
      "prefer-arrow-callback": "warn",
      "prefer-template": "warn",

      // Best practices
      eqeqeq: ["error", "always", { null: "ignore" }],
      "no-eval": "error",
      "no-implied-eval": "error",
      "no-new-func": "error",
      "no-return-await": "warn",
      "no-throw-literal": "error",
      "require-await": "warn",

      // Error prevention
      "no-duplicate-imports": "error",
      "no-self-compare": "error",
      "no-template-curly-in-string": "warn",
      "no-unreachable": "error",
      "no-unsafe-negation": "error",
      "valid-typeof": "error",

      // Code style
      curly: ["warn", "multi-line"],
      "dot-notation": "warn",
      "no-multi-spaces": "warn",
      "no-multiple-empty-lines": ["warn", { max: 2, maxEOF: 0 }],
      "no-trailing-spaces": "warn",
      quotes: [
        "warn",
        "single",
        { avoidEscape: true, allowTemplateLiterals: true },
      ],
      semi: ["warn", "always"],
      "comma-dangle": ["warn", "only-multiline"],
    },
  },
  {
    // Backend/Node.js specific configuration
    files: ["backend/**/*.js", "scripts/**/*.js", "*.config.js"],
    languageOptions: {
      sourceType: "commonjs",
      globals: {
        process: "readonly",
        __dirname: "readonly",
        __filename: "readonly",
        module: "readonly",
        require: "readonly",
        exports: "readonly",
        Buffer: "readonly",
        global: "readonly",
      },
    },
    rules: {
      "no-console": "off",
    },
  },
  {
    // Test files configuration
    files: [
      "**/*.test.{js,jsx,ts,tsx}",
      "**/*.spec.{js,jsx,ts,tsx}",
      "**/tests/**/*.{js,jsx,ts,tsx}",
    ],
    rules: {
      "no-console": "off",
      "no-unused-expressions": "off",
    },
  },
  {
    // Configuration files
    files: ["*.config.{js,mjs,cjs}", ".*.{js,mjs,cjs}"],
    rules: {
      "no-console": "off",
    },
  },
  {
    ignores: [
      "node_modules/",
      "build/",
      "dist/",
      "coverage/",
      ".git/",
      "*.min.js",
      "public/",
      "docs/",
      "backups/",
      "lighthouse-reports/",
      "*.bundle.js",
      "webpack.*.js",
    ],
  },
];
