/**
 * =============================================================================
 * ESLint Configuration - MIA.vn Google Integration Platform
 * =============================================================================
 * Modern ESLint 9+ flat config with React, Prettier integration
 * =============================================================================
 */

import js from "@eslint/js";
import babelParser from "@babel/eslint-parser";
import reactPlugin from "eslint-plugin-react";
import reactHooksPlugin from "eslint-plugin-react-hooks";
import jsxA11yPlugin from "eslint-plugin-jsx-a11y";
import importPlugin from "eslint-plugin-import";
import prettierConfig from "eslint-config-prettier";
import prettierPlugin from "eslint-plugin-prettier";

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
      "no-console": ["warn", { allow: ["warn", "error"] }],
      "no-unused-vars": [
        "warn",
        {
          argsIgnorePattern: "^_",
          varsIgnorePattern: "^_",
          ignoreRestSiblings: true,
        },
      ],
      "no-var": "error",
      "prefer-const": "warn",
      "prefer-arrow-callback": "warn",
      "no-use-before-define": [
        "error",
        {
          functions: false,
          classes: true,
          variables: true,
        },
      ],

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
      "react/no-unknown-property": "warn",
      "react/jsx-key": ["warn", { checkFragmentShorthand: true }],

      // ===== React Hooks Rules =====
      "react-hooks/rules-of-hooks": "error",
      "react-hooks/exhaustive-deps": "warn",

      // ===== Accessibility Rules =====
      "jsx-a11y/alt-text": "warn",
      "jsx-a11y/anchor-is-valid": "warn",
      "jsx-a11y/click-events-have-key-events": "warn",
      "jsx-a11y/no-static-element-interactions": "warn",

      // ===== Import Rules =====
      "import/no-unresolved": "off", // Handled by bundler
      "import/named": "off",
      "import/default": "off",
      "import/no-duplicates": "warn",
      "import/first": "warn",
      "import/newline-after-import": "warn",

      // ===== Other Rules =====
      "no-case-declarations": "off",
      "no-empty-pattern": "warn",
      "no-fallthrough": "warn",
    },
  },

  // Prettier config (disables conflicting rules)
  prettierConfig,

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
