/**
 * =============================================================================
 * ESLint Configuration - MIA.vn Google Integration Platform
 * =============================================================================
 * Modern ESLint 9+ flat config with React, Prettier integration
 * =============================================================================
 */

import babelParser from "@babel/eslint-parser";
import js from "@eslint/js";
import prettierConfig from "eslint-config-prettier";
import importPlugin from "eslint-plugin-import";
import jsxA11yPlugin from "eslint-plugin-jsx-a11y";
import prettierPlugin from "eslint-plugin-prettier";
import reactPlugin from "eslint-plugin-react";
import reactHooksPlugin from "eslint-plugin-react-hooks";

export default [
  // Base recommended rules
  js.configs.recommended,

  // Main configuration
  {
    files: ["**/*.{js,jsx,ts,tsx}"],

    languageOptions: {
      parser: babelParser,
      parserOptions: {
        ecmaVersion: "latest",
        sourceType: "module",
        ecmaFeatures: {
          jsx: true,
        },
        requireConfigFile: false,
        babelOptions: {
          presets: ["@babel/preset-react"],
        },
      },

      globals: {
        // Browser
        window: "readonly",
        document: "readonly",
        console: "readonly",
        setTimeout: "readonly",
        clearTimeout: "readonly",
        setInterval: "readonly",
        clearInterval: "readonly",
        fetch: "readonly",
        alert: "readonly",
        navigator: "readonly",
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
        AbortController: "readonly",
        PerformanceObserver: "readonly",
        TextEncoder: "readonly",
        TextDecoder: "readonly",

        // Node.js
        process: "readonly",
        __dirname: "readonly",
        __filename: "readonly",
        module: "readonly",
        require: "readonly",
        exports: "writable",
        global: "readonly",
        Buffer: "readonly",

        // React
        React: "readonly",
        JSX: "readonly",

        // Testing
        test: "readonly",
        expect: "readonly",
        describe: "readonly",
        it: "readonly",
        beforeEach: "readonly",
        afterEach: "readonly",
        beforeAll: "readonly",
        afterAll: "readonly",
        jest: "readonly",
      },
    },

    plugins: {
      react: reactPlugin,
      "react-hooks": reactHooksPlugin,
      "jsx-a11y": jsxA11yPlugin,
      import: importPlugin,
      prettier: prettierPlugin,
    },

    settings: {
      react: {
        version: "detect",
      },
      "import/resolver": {
        node: {
          extensions: [".js", ".jsx", ".ts", ".tsx"],
        },
      },
    },

    rules: {
      // ===== Best Practices =====
      "no-console": "off",
      "no-unused-vars": "off",
      "no-var": "error",
      "prefer-const": "off",
      "prefer-arrow-callback": "off",
      "no-use-before-define": "off",

      // ===== Code Style (Prettier handles formatting) =====
      semi: ["error", "always"],
      quotes: "off", // Handled by Prettier
      "comma-dangle": "off", // Handled by Prettier
      "object-curly-spacing": "off", // Handled by Prettier
      "array-bracket-spacing": "off", // Handled by Prettier
      "space-before-function-paren": "off", // Handled by Prettier
      "keyword-spacing": "off", // Handled by Prettier
      "space-infix-ops": "off", // Handled by Prettier
      "no-trailing-spaces": "off", // Handled by Prettier
      "eol-last": "off", // Handled by Prettier

      // ===== React Rules =====
      "react/react-in-jsx-scope": "off", // Not needed in React 17+
      "react/prop-types": "off", // Using TypeScript for type checking
      "react/display-name": "off",
      "react/jsx-uses-react": "off",
      "react/jsx-uses-vars": "error",
      "react/jsx-no-duplicate-props": "error",
      "react/jsx-no-undef": "error",
      "react/no-unknown-property": ["error", { ignore: ["jsx", "global"] }],
      "react/jsx-key": "off",

      // ===== React Hooks Rules =====
      "react-hooks/rules-of-hooks": "error",
      "react-hooks/exhaustive-deps": "off",

      // ===== Accessibility Rules =====
      "jsx-a11y/alt-text": "off",
      "jsx-a11y/anchor-is-valid": "off",
      "jsx-a11y/click-events-have-key-events": "off",
      "jsx-a11y/no-static-element-interactions": "off",

      // ===== Import Rules =====
      "import/no-unresolved": "off", // Handled by bundler
      "import/named": "off",
      "import/default": "off",
      "import/no-duplicates": "off",
      "import/first": "off",
      "import/newline-after-import": "off",

      // ===== Other Rules =====
      "no-case-declarations": "off",
      "no-empty-pattern": "off",
      "no-fallthrough": "off",
    },
  },

  // Prettier config (disables conflicting rules)
  prettierConfig,

  // FSD layer boundaries (warn-only during migration)
  {
    files: ["src/shared/**/*.{js,jsx,ts,tsx}"],
    rules: {
      "no-restricted-imports": [
        "warn",
        {
          patterns: ["@app/*", "@pages/*", "@widgets/*", "@features/*"],
        },
      ],
    },
  },
  {
    files: ["src/features/**/*.{js,jsx,ts,tsx}"],
    rules: {
      "no-restricted-imports": [
        "warn",
        {
          patterns: ["@app/*", "@pages/*", "@widgets/*"],
        },
      ],
    },
  },
  {
    files: ["src/widgets/**/*.{js,jsx,ts,tsx}"],
    rules: {
      "no-restricted-imports": [
        "warn",
        {
          patterns: ["@app/*", "@pages/*"],
        },
      ],
    },
  },
  {
    files: ["src/pages/**/*.{js,jsx,ts,tsx}"],
    rules: {
      "no-restricted-imports": [
        "warn",
        {
          patterns: ["@app/*"],
        },
      ],
    },
  },

  // Ignore patterns
  {
    ignores: [
      "**/node_modules/**",
      "**/build/**",
      "**/dist/**",
      "**/coverage/**",
      "**/.vscode/**",
      "**/.idea/**",
      "**/backups/**",
      "*.config.js",
      "*.config.mjs",
      "lighthouserc.js",
      "craco-plugin-*.js",
      "babel.config.js",
      "jest.config.js",
      "postcss.config.js",
      "webpack.config.js",
    ],
  },
];
