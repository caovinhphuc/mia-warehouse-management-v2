#!/bin/bash

# ========================================
# MIA.vn Logistics - Structure Generator
# ========================================
# Script tự động tạo toàn bộ cấu trúc thư mục và template files
# Usage: ./scripts/generate-structure.sh

set -e  # Exit on error

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
NC='\033[0m'

# Counters
DIRS_CREATED=0
FILES_CREATED=0

# Functions
print_header() {
    echo -e "${BLUE}╔════════════════════════════════════════╗${NC}"
    echo -e "${BLUE}║  $1${NC}"
    echo -e "${BLUE}╚════════════════════════════════════════╝${NC}"
}

print_success() {
    echo -e "${GREEN}✓${NC} $1"
}

print_info() {
    echo -e "${CYAN}ℹ${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}⚠${NC} $1"
}

create_dir() {
    if [ ! -d "$1" ]; then
        mkdir -p "$1"
        DIRS_CREATED=$((DIRS_CREATED + 1))
        echo -e "${GREEN}[DIR]${NC}  Created: $1"
    fi
}

create_file() {
    local file=$1
    local content=$2

    if [ ! -f "$file" ]; then
        echo "$content" > "$file"
        FILES_CREATED=$((FILES_CREATED + 1))
        echo -e "${BLUE}[FILE]${NC} Created: $file"
    fi
}

# ========================================
# Start
# ========================================
clear
print_header "MIA.vn Logistics Structure Generator"
echo ""

# Check if we're in the right directory
if [ ! -f "package.json" ]; then
    print_warning "package.json not found!"
    read -p "Are you in the project root? Continue anyway? (y/n) " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        exit 1
    fi
fi

# ========================================
# 1. Create Public Directory
# ========================================
print_header "Creating Public Directory"

create_dir "public"

# public/index.html
create_file "public/index.html" '<!DOCTYPE html>
<html lang="vi">
  <head>
    <meta charset="utf-8" />
    <link rel="icon" href="%PUBLIC_URL%/favicon.ico" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <meta name="theme-color" content="#1976d2" />
    <meta name="description" content="MIA.vn Logistics - Hệ thống quản lý vận chuyển" />
    <link rel="apple-touch-icon" href="%PUBLIC_URL%/logo192.png" />
    <link rel="manifest" href="%PUBLIC_URL%/manifest.json" />
    <title>MIA.vn Logistics</title>
  </head>
  <body>
    <noscript>Bạn cần bật JavaScript để sử dụng ứng dụng này.</noscript>
    <div id="root"></div>
  </body>
</html>'

# public/manifest.json
create_file "public/manifest.json" '{
  "short_name": "MIA Logistics",
  "name": "MIA.vn Logistics Management",
  "icons": [
    {
      "src": "favicon.ico",
      "sizes": "64x64 32x32 24x24 16x16",
      "type": "image/x-icon"
    },
    {
      "src": "logo192.png",
      "type": "image/png",
      "sizes": "192x192"
    },
    {
      "src": "logo512.png",
      "type": "image/png",
      "sizes": "512x512"
    }
  ],
  "start_url": ".",
  "display": "standalone",
  "theme_color": "#1976d2",
  "background_color": "#ffffff"
}'

# public/robots.txt
create_file "public/robots.txt" 'User-agent: *
Disallow: /admin
Allow: /'

echo ""

# ========================================
# 2. Create Source Directory Structure
# ========================================
print_header "Creating Source Directory Structure"

# Main src directory
create_dir "src"

# Main files
create_file "src/index.tsx" 'import React from "react";
import ReactDOM from "react-dom/client";
import "./index.css";
import App from "./App";
import reportWebVitals from "./reportWebVitals";

const root = ReactDOM.createRoot(
  document.getElementById("root") as HTMLElement
);

root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);

reportWebVitals();'

create_file "src/App.tsx" 'import React from "react";
import { BrowserRouter } from "react-router-dom";
import { ThemeProvider } from "@mui/material/styles";
import CssBaseline from "@mui/material/CssBaseline";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { theme } from "./shared/styles/theme";
import "./App.css";

const queryClient = new QueryClient();

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <BrowserRouter>
          <div className="App">
            <h1>MIA.vn Logistics</h1>
            <p>System is ready!</p>
          </div>
        </BrowserRouter>
      </ThemeProvider>
    </QueryClientProvider>
  );
}

export default App;'

create_file "src/App.css" '.App {
  text-align: center;
  padding: 2rem;
}

.App h1 {
  color: #1976d2;
}'

create_file "src/index.css" 'body {
  margin: 0;
  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", "Roboto", "Oxygen",
    "Ubuntu", "Cantarell", "Fira Sans", "Droid Sans", "Helvetica Neue",
    sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
}

code {
  font-family: source-code-pro, Menlo, Monaco, Consolas, "Courier New",
    monospace;
}

* {
  box-sizing: border-box;
}'

create_file "src/react-app-env.d.ts" '/// <reference types="react-scripts" />'

create_file "src/reportWebVitals.ts" 'import { ReportHandler } from "web-vitals";

const reportWebVitals = (onPerfEntry?: ReportHandler) => {
  if (onPerfEntry && onPerfEntry instanceof Function) {
    import("web-vitals").then(({ getCLS, getFID, getFCP, getLCP, getTTFB }) => {
      getCLS(onPerfEntry);
      getFID(onPerfEntry);
      getFCP(onPerfEntry);
      getLCP(onPerfEntry);
      getTTFB(onPerfEntry);
    });
  }
};

export default reportWebVitals;'

create_file "src/setupTests.ts" 'import "@testing-library/jest-dom";'

echo ""

# ========================================
# 3. Create Features Structure
# ========================================
print_header "Creating Features Structure"

FEATURES=("orders" "shipments" "routes" "products" "pricing" "carriers" "warehouses" "analytics" "notifications" "auth")

for feature in "${FEATURES[@]}"; do
    print_info "Creating feature: $feature"

    # Create feature directories
    create_dir "src/features/$feature/components"
    create_dir "src/features/$feature/hooks"
    create_dir "src/features/$feature/services"
    create_dir "src/features/$feature/types"
    create_dir "src/features/$feature/utils"
    create_dir "src/features/$feature/constants"

    # Create index files
    create_file "src/features/$feature/index.ts" "// Export all $feature components, hooks, and services
export * from './components';
export * from './hooks';
export * from './services';
export * from './types';"

    create_file "src/features/$feature/components/index.ts" "// Export all $feature components"
    create_file "src/features/$feature/hooks/index.ts" "// Export all $feature hooks"
    create_file "src/features/$feature/services/index.ts" "// Export all $feature services"
    create_file "src/features/$feature/types/index.ts" "// Export all $feature types"
done

echo ""

# ========================================
# 4. Create Shared Structure
# ========================================
print_header "Creating Shared Structure"

# Shared components
create_dir "src/shared/components/ui"
create_dir "src/shared/components/layout"
create_dir "src/shared/components/forms"
create_dir "src/shared/components/data"
create_dir "src/shared/components/feedback"
create_dir "src/shared/components/navigation"
create_dir "src/shared/components/visualization"

# Shared hooks
create_dir "src/shared/hooks"
create_file "src/shared/hooks/useDebounce.ts" 'import { useEffect, useState } from "react";

export const useDebounce = <T>(value: T, delay: number = 500): T => {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
};'

create_file "src/shared/hooks/useLocalStorage.ts" 'import { useState, useEffect } from "react";

export const useLocalStorage = <T>(key: string, initialValue: T) => {
  const [value, setValue] = useState<T>(() => {
    try {
      const item = window.localStorage.getItem(key);
      return item ? JSON.parse(item) : initialValue;
    } catch (error) {
      console.error(error);
      return initialValue;
    }
  });

  useEffect(() => {
    try {
      window.localStorage.setItem(key, JSON.stringify(value));
    } catch (error) {
      console.error(error);
    }
  }, [key, value]);

  return [value, setValue] as const;
};'

# Shared utils
create_dir "src/shared/utils"
create_file "src/shared/utils/formatters.ts" '/**
 * Format currency to VND
 */
export const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
  }).format(amount);
};

/**
 * Format date to Vietnamese format
 */
export const formatDate = (date: Date | string): string => {
  return new Intl.DateTimeFormat("vi-VN").format(new Date(date));
};

/**
 * Format phone number
 */
export const formatPhone = (phone: string): string => {
  const cleaned = phone.replace(/\D/g, "");
  const match = cleaned.match(/^(\d{4})(\d{3})(\d{3})$/);
  if (match) {
    return `${match[1]} ${match[2]} ${match[3]}`;
  }
  return phone;
};'

create_file "src/shared/utils/validators.ts" '/**
 * Validate email
 */
export const isValidEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

/**
 * Validate Vietnamese phone number
 */
export const isValidPhone = (phone: string): boolean => {
  const phoneRegex = /^(0|\+84)[0-9]{9}$/;
  return phoneRegex.test(phone.replace(/\s/g, ""));
};

/**
 * Validate positive number
 */
export const isPositiveNumber = (value: number): boolean => {
  return value > 0;
};'

# Shared types
create_dir "src/shared/types"
create_file "src/shared/types/common.types.ts" 'export type Status = "pending" | "in_transit" | "delivered" | "cancelled";

export interface Coordinates {
  lat: number;
  lng: number;
}

export interface Address {
  street: string;
  district: string;
  city: string;
  coordinates?: Coordinates;
}

export interface Dimensions {
  length: number; // cm
  width: number;  // cm
  height: number; // cm
}

export interface PaginationParams {
  page: number;
  pageSize: number;
}

export interface ApiResponse<T> {
  data: T;
  message?: string;
  success: boolean;
}'

# Shared styles
create_dir "src/shared/styles"
create_file "src/shared/styles/theme.ts" 'import { createTheme } from "@mui/material/styles";

export const theme = createTheme({
  palette: {
    primary: {
      main: "#1976d2",
      light: "#42a5f5",
      dark: "#1565c0",
    },
    secondary: {
      main: "#388e3c",
      light: "#66bb6a",
      dark: "#2e7d32",
    },
    error: {
      main: "#d32f2f",
    },
    warning: {
      main: "#f57c00",
    },
    info: {
      main: "#0288d1",
    },
    success: {
      main: "#388e3c",
    },
  },
  typography: {
    fontFamily: [
      "-apple-system",
      "BlinkMacSystemFont",
      "Segoe UI",
      "Roboto",
      "Arial",
      "sans-serif",
    ].join(","),
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          textTransform: "none",
        },
      },
    },
  },
});'

echo ""

# ========================================
# 5. Create Services Structure
# ========================================
print_header "Creating Services Structure"

# API service
create_dir "src/services/api"
create_file "src/services/api/client.ts" 'import axios, { AxiosInstance } from "axios";

class APIClient {
  private client: AxiosInstance;

  constructor() {
    this.client = axios.create({
      baseURL: process.env.REACT_APP_API_BASE_URL || "http://localhost:3000",
      timeout: 30000,
      headers: {
        "Content-Type": "application/json",
      },
    });

    this.setupInterceptors();
  }

  private setupInterceptors() {
    this.client.interceptors.response.use(
      (response) => response,
      (error) => {
        console.error("API Error:", error);
        return Promise.reject(error);
      }
    );
  }

  get<T>(url: string, config?: any): Promise<T> {
    return this.client.get(url, config).then((res) => res.data);
  }

  post<T>(url: string, data?: any, config?: any): Promise<T> {
    return this.client.post(url, data, config).then((res) => res.data);
  }

  put<T>(url: string, data?: any, config?: any): Promise<T> {
    return this.client.put(url, data, config).then((res) => res.data);
  }

  delete<T>(url: string, config?: any): Promise<T> {
    return this.client.delete(url, config).then((res) => res.data);
  }
}

export const apiClient = new APIClient();'

# Other services
create_dir "src/services/sheets"
create_dir "src/services/maps"
create_dir "src/services/telegram"
create_dir "src/services/email"
create_dir "src/services/analytics"
create_dir "src/services/storage"
create_dir "src/services/security"

echo ""

# ========================================
# 6. Create Config
# ========================================
print_header "Creating Config"

create_dir "src/config"
create_file "src/config/constants.ts" '// Application Constants
export const APP_NAME = "MIA.vn Logistics";
export const APP_VERSION = "1.0.0";

// Volumetric weight factors
export const DIM_FACTOR_ROAD = 333;
export const DIM_FACTOR_AIR = 167;

// Default rates
export const DEFAULT_RATE_PER_KM = 500;
export const DEFAULT_RATE_PER_M3 = 800000;
export const DEFAULT_RATE_PER_KG = 15000;

// Limits
export const MAX_PACKAGE_WEIGHT = 500; // kg
export const MAX_PACKAGE_VOLUME = 5; // m³
export const MAX_ROUTE_STOPS = 20;'

# ========================================
# 7. Create Stores
# ========================================
print_header "Creating State Stores"

create_dir "src/stores"
create_file "src/stores/uiStore.ts" 'import create from "zustand";

interface UIState {
  sidebarOpen: boolean;
  theme: "light" | "dark";
  setSidebarOpen: (open: boolean) => void;
  toggleTheme: () => void;
}

export const useUIStore = create<UIState>((set) => ({
  sidebarOpen: true,
  theme: "light",
  setSidebarOpen: (open) => set({ sidebarOpen: open }),
  toggleTheme: () =>
    set((state) => ({
      theme: state.theme === "light" ? "dark" : "light",
    })),
}));'

echo ""

# ========================================
# 8. Create Tests Structure
# ========================================
print_header "Creating Tests Structure"

create_dir "tests/unit"
create_dir "tests/integration"
create_dir "tests/e2e"
create_dir "tests/fixtures"
create_dir "tests/mocks"
create_dir "tests/helpers"

create_file "tests/helpers/testUtils.tsx" 'import React, { ReactElement } from "react";
import { render, RenderOptions } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

const createTestQueryClient = () =>
  new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false },
    },
  });

const AllTheProviders = ({ children }: { children: React.ReactNode }) => {
  const testQueryClient = createTestQueryClient();

  return (
    <QueryClientProvider client={testQueryClient}>
      {children}
    </QueryClientProvider>
  );
};

const customRender = (
  ui: ReactElement,
  options?: Omit<RenderOptions, "wrapper">
) => render(ui, { wrapper: AllTheProviders, ...options });

export * from "@testing-library/react";
export { customRender as render };'

echo ""

# ========================================
# 9. Create Assets
# ========================================
print_header "Creating Assets Structure"

create_dir "src/assets/images"
create_dir "src/assets/images/icons"
create_dir "src/assets/images/illustrations"
create_dir "src/assets/fonts"
create_dir "src/assets/videos"

echo ""

# ========================================
# 10. Create TypeScript Config
# ========================================
print_header "Creating TypeScript Config"

create_file "tsconfig.json" '{
  "compilerOptions": {
    "target": "ES2020",
    "lib": ["ES2020", "DOM", "DOM.Iterable"],
    "jsx": "react-jsx",
    "module": "ESNext",
    "moduleResolution": "bundler",
    "resolveJsonModule": true,
    "allowJs": true,
    "strict": true,
    "noEmit": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "forceConsistentCasingInFileNames": true,
    "isolatedModules": true,
    "allowSyntheticDefaultImports": true,
    "baseUrl": "src",
    "paths": {
      "@/*": ["*"],
      "@features/*": ["features/*"],
      "@shared/*": ["shared/*"],
      "@services/*": ["services/*"],
      "@config/*": ["config/*"],
      "@stores/*": ["stores/*"],
      "@assets/*": ["assets/*"]
    }
  },
  "include": ["src"],
  "exclude": ["node_modules", "build", "dist"]
}'

echo ""

# ========================================
# 11. Create .editorconfig
# ========================================
print_header "Creating Editor Config"

create_file ".editorconfig" 'root = true

[*]
charset = utf-8
end_of_line = lf
indent_style = space
indent_size = 2
insert_final_newline = true
trim_trailing_whitespace = true

[*.md]
trim_trailing_whitespace = false'

echo ""

# ========================================
# 12. Create .prettierrc
# ========================================
print_header "Creating Prettier Config"

create_file ".prettierrc" '{
  "semi": true,
  "trailingComma": "es5",
  "singleQuote": false,
  "printWidth": 100,
  "tabWidth": 2,
  "useTabs": false,
  "arrowParens": "always"
}'

create_file ".prettierignore" 'node_modules
build
dist
coverage
.next
*.min.js
*.min.css'

echo ""

# ========================================
# 13. Create ESLint Config
# ========================================
print_header "Creating ESLint Config"

create_file ".eslintrc.json" '{
  "extends": [
    "react-app",
    "react-app/jest"
  ],
  "rules": {
    "@typescript-eslint/no-unused-vars": [
      "error",
      {
        "argsIgnorePattern": "^_"
      }
    ],
    "react-hooks/exhaustive-deps": "warn",
    "no-console": [
      "warn",
      {
        "allow": ["warn", "error"]
      }
    ]
  }
}'

echo ""

# ========================================
# Summary
# ========================================
print_header "Generation Complete!"

echo ""
print_success "Structure generated successfully!"
echo ""
echo -e "${CYAN}Statistics:${NC}"
echo "  • Directories created: $DIRS_CREATED"
echo "  • Files created: $FILES_CREATED"
echo ""
echo -e "${CYAN}Next steps:${NC}"
echo -e "  1. Review generated structure"
echo  -e"  2. Run: ${GREEN}npm install${NC}"
echo -e "  3. Update ${GREEN}.env${NC} with your API keys"
echo -e "  4. Run: ${GREEN}npm run dev${NC}"
echo ""
print_info "Happy coding! 🚀"
echo ""
