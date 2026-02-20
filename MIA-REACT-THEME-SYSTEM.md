# 🎨 Hướng dẫn Sử dụng Theme - MIA React Theme System

## 📋 Mục lục

1. [Giới thiệu Theme System](#giới-thiệu-theme-system)
2. [Cài đặt và Setup](#cài-đặt-và-setup)
3. [Sử dụng Theme Context](#sử-dụng-theme-context)
4. [CSS Variables System](#css-variables-system)
5. [Dark/Light Mode](#darklight-mode)
6. [Responsive Design](#responsive-design)
7. [Customization](#customization)
8. [Components Styling](#components-styling)
9. [Best Practices](#best-practices)
10. [Troubleshooting](#troubleshooting)

---

## 🎯 Giới thiệu Theme System

**MIA Theme System** là một hệ thống theme toàn diện được thiết kế để:

- 🌓 **Dual Theme**: Hỗ trợ chế độ Tối/Sáng
- 🎨 **Design Tokens**: Bảng màu và typography chuẩn
- 📱 **Responsive**: Tối ưu cho mọi thiết bị
- ⚡ **Performance**: Sử dụng CSS Variables
- 🔧 **Flexible**: Dễ dàng customize

### 🏗️ Kiến trúc Theme

\`\`\`
Theme System
├── 🎨 Color Palette (900+ variants)
├── 📝 Typography Scale (9 sizes)
├── 📏 Spacing System (8px base)
├── 🎭 Shadow System (5 levels)
├── 🔄 Animation Presets
├── 📱 Responsive Breakpoints
└── ♿ Accessibility Support
\`\`\`

---

## ⚡ Cài đặt và Setup

### 1. Import Theme Provider

\`\`\`jsx
// src/App.js
import React from 'react';
import { ThemeProvider } from './contexts/ThemeContext';
import Layout from './components/Layout/Layout';

// Import CSS chính
import './styles/main.css';

function App() {
  return (
    <ThemeProvider>
      <Layout>
        {/* App content */}
      </Layout>
    </ThemeProvider>
  );
}

export default App;
\`\`\`

### 2. CSS Imports Order

\`\`\`css
/* src/styles/main.css */

/* 1. CSS Reset & Base */
@import './base/reset.css';
@import './base/typography.css';
@import './base/layout.css';

/* 2. Theme Variables */
@import './themes/light.css';
@import './themes/dark.css';

/* 3. Components */
@import './components/buttons.css';
@import './components/forms.css';
@import './components/cards.css';

/* 4. Utilities */
@import './utilities/spacing.css';
@import './utilities/colors.css';
@import './utilities/responsive.css';
\`\`\`

---

## 🎮 Sử dụng Theme Context

### Basic Usage

\`\`\`jsx
import React from 'react';
import { useTheme } from '../contexts/ThemeContext';

function MyComponent() {
  const {
    theme,          // 'light' | 'dark'
    toggleTheme,    // Function để toggle
    setTheme,       // Function để set theme
    colors,         // Color palette object
    spacing,        // Spacing values
    breakpoints     // Responsive breakpoints
  } = useTheme();

  return (
    <div className={`my-component theme-${theme}`}>
      <h2>Current Theme: {theme}</h2>

      <button onClick={toggleTheme}>
        Chuyển sang {theme === 'light' ? 'Tối' : 'Sáng'}
      </button>

      <button onClick={() => setTheme('dark')}>
        Luôn dùng chế độ tối
      </button>
    </div>
  );
}
\`\`\`

### Advanced Theme Usage

\`\`\`jsx
import React from 'react';
import { useTheme } from '../contexts/ThemeContext';

function AdvancedComponent() {
  const { theme, colors, setThemePreferences } = useTheme();

  // Lấy màu động dựa trên theme
  const dynamicStyle = {
    backgroundColor: colors.surface,
    color: colors.text,
    borderColor: colors.border,
    boxShadow: theme === 'dark' ? 'none' : '0 2px 4px rgba(0,0,0,0.1)'
  };

  // Custom theme preferences
  const customizeTheme = () => {
    setThemePreferences({
      primaryColor: '#FF6B6B',
      secondaryColor: '#4ECDC4',
      accentColor: '#45B7D1'
    });
  };

  return (
    <div style={dynamicStyle} className="advanced-component">
      <h3>Dynamic Theme Component</h3>
      <button onClick={customizeTheme}>
        Customize Colors
      </button>
    </div>
  );
}
\`\`\`

---

## 🎨 CSS Variables System

### 🌈 Color Variables

\`\`\`css
/* Light Theme Colors */
:root {
  /* Primary Colors */
  --color-primary: #3B82F6;
  --color-primary-50: #EFF6FF;
  --color-primary-100: #DBEAFE;
  --color-primary-200: #BFDBFE;
  --color-primary-300: #93C5FD;
  --color-primary-400: #60A5FA;
  --color-primary-500: #3B82F6; /* Base */
  --color-primary-600: #2563EB;
  --color-primary-700: #1D4ED8;
  --color-primary-800: #1E40AF;
  --color-primary-900: #1E3A8A;

  /* Semantic Colors */
  --color-success: #10B981;
  --color-warning: #F59E0B;
  --color-error: #EF4444;
  --color-info: #06B6D4;

  /* Surface Colors */
  --color-background: #FFFFFF;
  --color-surface: #F8FAFC;
  --color-surface-variant: #F1F5F9;

  /* Text Colors */
  --color-text: #0F172A;
  --color-text-secondary: #64748B;
  --color-text-disabled: #94A3B8;

  /* Border Colors */
  --color-border: #E2E8F0;
  --color-border-focus: #3B82F6;
  --color-divider: #F1F5F9;
}

/* Dark Theme Colors */
[data-theme="dark"] {
  --color-primary: #60A5FA;
  --color-primary-50: #1E3A8A;
  --color-primary-100: #1E40AF;
  /* ... dark variants */

  --color-background: #0F172A;
  --color-surface: #1E293B;
  --color-text: #F8FAFC;
  --color-text-secondary: #CBD5E1;
}
\`\`\`

### 📝 Typography Variables

\`\`\`css
:root {
  /* Font Families */
  --font-family-primary: 'Inter', system-ui, sans-serif;
  --font-family-secondary: 'Roboto', sans-serif;
  --font-family-mono: 'Fira Code', 'Consolas', monospace;

  /* Font Sizes */
  --font-size-xs: 0.75rem;    /* 12px */
  --font-size-sm: 0.875rem;   /* 14px */
  --font-size-base: 1rem;     /* 16px */
  --font-size-lg: 1.125rem;   /* 18px */
  --font-size-xl: 1.25rem;    /* 20px */
  --font-size-2xl: 1.5rem;    /* 24px */
  --font-size-3xl: 1.875rem;  /* 30px */
  --font-size-4xl: 2.25rem;   /* 36px */
  --font-size-5xl: 3rem;      /* 48px */

  /* Font Weights */
  --font-weight-light: 300;
  --font-weight-normal: 400;
  --font-weight-medium: 500;
  --font-weight-semibold: 600;
  --font-weight-bold: 700;

  /* Line Heights */
  --line-height-tight: 1.25;
  --line-height-snug: 1.375;
  --line-height-normal: 1.5;
  --line-height-relaxed: 1.625;
  --line-height-loose: 2;
}
\`\`\`

### 📏 Spacing & Layout Variables

\`\`\`css
:root {
  /* Spacing Scale (8px base) */
  --spacing-0: 0;
  --spacing-1: 0.25rem;   /* 4px */
  --spacing-2: 0.5rem;    /* 8px */
  --spacing-3: 0.75rem;   /* 12px */
  --spacing-4: 1rem;      /* 16px */
  --spacing-5: 1.25rem;   /* 20px */
  --spacing-6: 1.5rem;    /* 24px */
  --spacing-8: 2rem;      /* 32px */
  --spacing-10: 2.5rem;   /* 40px */
  --spacing-12: 3rem;     /* 48px */
  --spacing-16: 4rem;     /* 64px */
  --spacing-20: 5rem;     /* 80px */

  /* Aliases */
  --spacing-xs: var(--spacing-1);
  --spacing-sm: var(--spacing-2);
  --spacing-md: var(--spacing-4);
  --spacing-lg: var(--spacing-6);
  --spacing-xl: var(--spacing-8);

  /* Border Radius */
  --border-radius-none: 0;
  --border-radius-sm: 0.125rem;   /* 2px */
  --border-radius-base: 0.25rem;  /* 4px */
  --border-radius-md: 0.375rem;   /* 6px */
  --border-radius-lg: 0.5rem;     /* 8px */
  --border-radius-xl: 0.75rem;    /* 12px */
  --border-radius-2xl: 1rem;      /* 16px */
  --border-radius-full: 9999px;

  /* Shadows */
  --shadow-sm: 0 1px 2px 0 rgba(0, 0, 0, 0.05);
  --shadow-base: 0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06);
  --shadow-md: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
  --shadow-lg: 0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05);
  --shadow-xl: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04);

  /* Transitions */
  --transition-fast: 150ms ease;
  --transition-base: 250ms ease;
  --transition-slow: 350ms ease;
  --transition-slower: 500ms ease;
}
\`\`\`

---

## 🌓 Dark/Light Mode

### Automatic Detection

\`\`\`jsx
// ThemeContext.js - Auto detect system preference
const getInitialTheme = () => {
  // Check localStorage first
  const savedTheme = localStorage.getItem('theme');
  if (savedTheme) return savedTheme;

  // Check system preference
  const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
  return prefersDark ? 'dark' : 'light';
};

const ThemeProvider = ({ children }) => {
  const [theme, setTheme] = useState(getInitialTheme);

  // Listen for system preference changes
  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const handleChange = (e) => {
      if (!localStorage.getItem('theme')) {
        setTheme(e.matches ? 'dark' : 'light');
      }
    };

    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, []);

  // Apply theme to document
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('theme', theme);
  }, [theme]);

  return (
    <ThemeContext.Provider value={{ theme, setTheme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};
\`\`\`

### Theme Toggle Component

\`\`\`jsx
// components/ThemeToggle.js
import React from 'react';
import { useTheme } from '../contexts/ThemeContext';
import './ThemeToggle.css';

const ThemeToggle = () => {
  const { theme, toggleTheme } = useTheme();

  return (
    <button
      className="theme-toggle"
      onClick={toggleTheme}
      aria-label={`Chuyển sang chế độ ${theme === 'light' ? 'tối' : 'sáng'}`}
    >
      <div className="toggle-track">
        <div className="toggle-thumb">
          {theme === 'light' ? '☀️' : '🌙'}
        </div>
      </div>
      <span className="toggle-label">
        {theme === 'light' ? 'Sáng' : 'Tối'}
      </span>
    </button>
  );
};

export default ThemeToggle;
\`\`\`

### Theme Toggle Styles

\`\`\`css
/* ThemeToggle.css */
.theme-toggle {
  display: flex;
  align-items: center;
  gap: var(--spacing-2);

  background: none;
  border: none;
  cursor: pointer;

  padding: var(--spacing-2);
  border-radius: var(--border-radius-lg);

  transition: var(--transition-base);
}

.theme-toggle:hover {
  background-color: var(--color-surface-variant);
}

.toggle-track {
  position: relative;
  width: 48px;
  height: 24px;

  background-color: var(--color-surface-variant);
  border-radius: var(--border-radius-full);

  transition: var(--transition-base);
}

.toggle-thumb {
  position: absolute;
  top: 2px;
  left: 2px;

  width: 20px;
  height: 20px;

  background-color: var(--color-background);
  border-radius: var(--border-radius-full);

  display: flex;
  align-items: center;
  justify-content: center;

  font-size: 12px;

  transition: var(--transition-base);
  transform: translateX(0);
}

[data-theme="dark"] .toggle-thumb {
  transform: translateX(24px);
}

.toggle-label {
  font-size: var(--font-size-sm);
  font-weight: var(--font-weight-medium);
  color: var(--color-text);
}
\`\`\`

---

## 📱 Responsive Design

### Breakpoint System

\`\`\`css
/* Responsive Breakpoints */
:root {
  --breakpoint-xs: 0px;
  --breakpoint-sm: 640px;    /* Mobile landscape */
  --breakpoint-md: 768px;    /* Tablet */
  --breakpoint-lg: 1024px;   /* Desktop */
  --breakpoint-xl: 1280px;   /* Large desktop */
  --breakpoint-2xl: 1536px;  /* Extra large */
}

/* Container System */
.container {
  width: 100%;
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 var(--spacing-4);
}

@media (min-width: 640px) {
  .container {
    padding: 0 var(--spacing-6);
  }
}

@media (min-width: 1024px) {
  .container {
    padding: 0 var(--spacing-8);
  }
}
\`\`\`

### Responsive Grid System

\`\`\`css
/* Grid System */
.grid {
  display: grid;
  gap: var(--spacing-4);
  grid-template-columns: 1fr;
}

/* Mobile First Responsive Grid */
@media (min-width: 640px) {
  .grid-cols-2 { grid-template-columns: repeat(2, 1fr); }
  .grid-cols-3 { grid-template-columns: repeat(3, 1fr); }
}

@media (min-width: 768px) {
  .grid-cols-4 { grid-template-columns: repeat(4, 1fr); }
  .grid-cols-6 { grid-template-columns: repeat(6, 1fr); }
}

@media (min-width: 1024px) {
  .grid-cols-12 { grid-template-columns: repeat(12, 1fr); }
}

/* Flex Grid Alternative */
.flex-grid {
  display: flex;
  flex-wrap: wrap;
  margin: 0 calc(-1 * var(--spacing-2));
}

.flex-col {
  flex: 1;
  padding: 0 var(--spacing-2);
  min-width: 0;
}

/* Responsive Flex Columns */
.flex-col-12 { flex: 0 0 100%; }
.flex-col-6 { flex: 0 0 50%; }
.flex-col-4 { flex: 0 0 33.333%; }
.flex-col-3 { flex: 0 0 25%; }

@media (min-width: 768px) {
  .flex-col-md-12 { flex: 0 0 100%; }
  .flex-col-md-6 { flex: 0 0 50%; }
  .flex-col-md-4 { flex: 0 0 33.333%; }
  .flex-col-md-3 { flex: 0 0 25%; }
}
\`\`\`

### Responsive Utilities

\`\`\`css
/* Visibility Utilities */
.hidden { display: none !important; }
.visible { display: block !important; }

/* Mobile */
@media (max-width: 639px) {
  .hidden-mobile { display: none !important; }
  .visible-mobile { display: block !important; }
}

/* Tablet */
@media (min-width: 640px) and (max-width: 1023px) {
  .hidden-tablet { display: none !important; }
  .visible-tablet { display: block !important; }
}

/* Desktop */
@media (min-width: 1024px) {
  .hidden-desktop { display: none !important; }
  .visible-desktop { display: block !important; }
}

/* Text Alignment */
.text-left { text-align: left; }
.text-center { text-align: center; }
.text-right { text-align: right; }

@media (min-width: 768px) {
  .text-md-left { text-align: left; }
  .text-md-center { text-align: center; }
  .text-md-right { text-align: right; }
}
\`\`\`

---

## 🎛️ Customization

### Custom Color Palette

\`\`\`css
/* custom-theme.css */
:root {
  /* Override primary colors */
  --color-primary: #FF6B6B;
  --color-primary-50: #FFF5F5;
  --color-primary-100: #FED7D7;
  --color-primary-200: #FEB2B2;
  --color-primary-500: #FF6B6B;
  --color-primary-900: #742A2A;

  /* Custom brand colors */
  --color-brand: #4ECDC4;
  --color-accent: #45B7D1;
  --color-highlight: #FFA07A;
}

/* Apply custom colors */
.btn-brand {
  background-color: var(--color-brand);
  color: white;
}

.accent-text {
  color: var(--color-accent);
}
\`\`\`

### Dynamic Theme Generation

\`\`\`jsx
// utils/themeGenerator.js
export const generateTheme = (primaryColor) => {
  const root = document.documentElement;

  // Generate color variations
  const variations = generateColorVariations(primaryColor);

  // Apply to CSS variables
  Object.entries(variations).forEach(([key, value]) => {
    root.style.setProperty(\`--color-primary-\${key}\`, value);
  });
};

export const generateColorVariations = (baseColor) => {
  // Color generation logic
  return {
    50: lighten(baseColor, 95),
    100: lighten(baseColor, 90),
    200: lighten(baseColor, 80),
    300: lighten(baseColor, 60),
    400: lighten(baseColor, 40),
    500: baseColor,
    600: darken(baseColor, 20),
    700: darken(baseColor, 40),
    800: darken(baseColor, 60),
    900: darken(baseColor, 80)
  };
};

// Usage in component
const ColorCustomizer = () => {
  const handleColorChange = (color) => {
    generateTheme(color);
  };

  return (
    <input
      type="color"
      onChange={(e) => handleColorChange(e.target.value)}
      defaultValue="#3B82F6"
    />
  );
};
\`\`\`

### Theme Presets

\`\`\`jsx
// Theme presets configuration
export const themePresets = {
  default: {
    name: 'Mặc định',
    colors: {
      primary: '#3B82F6',
      secondary: '#8B5CF6',
      success: '#10B981'
    }
  },
  warm: {
    name: 'Ấm áp',
    colors: {
      primary: '#F59E0B',
      secondary: '#EF4444',
      success: '#84CC16'
    }
  },
  cool: {
    name: 'Mát mẻ',
    colors: {
      primary: '#06B6D4',
      secondary: '#3B82F6',
      success: '#10B981'
    }
  },
  nature: {
    name: 'Thiên nhiên',
    colors: {
      primary: '#059669',
      secondary: '#0D9488',
      success: '#65A30D'
    }
  }
};

// Theme preset selector component
const ThemePresetSelector = () => {
  const { applyThemePreset } = useTheme();

  return (
    <div className="theme-presets">
      <h3>Chọn Theme có sẵn</h3>
      <div className="preset-grid">
        {Object.entries(themePresets).map(([key, preset]) => (
          <button
            key={key}
            className="preset-card"
            onClick={() => applyThemePreset(preset)}
          >
            <div className="preset-colors">
              {Object.values(preset.colors).map((color, index) => (
                <div
                  key={index}
                  className="color-sample"
                  style={{ backgroundColor: color }}
                />
              ))}
            </div>
            <span className="preset-name">{preset.name}</span>
          </button>
        ))}
      </div>
    </div>
  );
};
\`\`\`

---

## 🧩 Components Styling

### Button Component

\`\`\`css
/* Button base styles */
.btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: var(--spacing-2);

  padding: var(--spacing-2) var(--spacing-4);
  border: 1px solid transparent;
  border-radius: var(--border-radius-md);

  font-family: var(--font-family-primary);
  font-size: var(--font-size-sm);
  font-weight: var(--font-weight-medium);
  line-height: var(--line-height-normal);
  text-decoration: none;

  cursor: pointer;
  user-select: none;

  transition: var(--transition-base);
}

/* Button variants */
.btn-primary {
  background-color: var(--color-primary);
  color: white;
  border-color: var(--color-primary);
}

.btn-primary:hover {
  background-color: var(--color-primary-600);
  border-color: var(--color-primary-600);
  transform: translateY(-1px);
  box-shadow: var(--shadow-md);
}

.btn-secondary {
  background-color: transparent;
  color: var(--color-primary);
  border-color: var(--color-primary);
}

.btn-secondary:hover {
  background-color: var(--color-primary);
  color: white;
}

/* Button sizes */
.btn-sm {
  padding: var(--spacing-1) var(--spacing-3);
  font-size: var(--font-size-xs);
}

.btn-lg {
  padding: var(--spacing-3) var(--spacing-6);
  font-size: var(--font-size-base);
}

/* Button states */
.btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
  transform: none !important;
}

.btn:focus {
  outline: none;
  box-shadow: 0 0 0 3px var(--color-primary-200);
}

/* Dark theme adjustments */
[data-theme="dark"] .btn-secondary {
  border-color: var(--color-primary-400);
  color: var(--color-primary-400);
}

[data-theme="dark"] .btn-secondary:hover {
  background-color: var(--color-primary-400);
  color: var(--color-background);
}
\`\`\`

### Card Component

\`\`\`css
/* Card component */
.card {
  background-color: var(--color-surface);
  border: 1px solid var(--color-border);
  border-radius: var(--border-radius-lg);
  box-shadow: var(--shadow-sm);

  overflow: hidden;
  transition: var(--transition-base);
}

.card:hover {
  transform: translateY(-2px);
  box-shadow: var(--shadow-md);
  border-color: var(--color-primary-200);
}

.card-header {
  padding: var(--spacing-4) var(--spacing-6);
  border-bottom: 1px solid var(--color-border);
  background-color: var(--color-surface-variant);
}

.card-title {
  margin: 0;
  font-size: var(--font-size-lg);
  font-weight: var(--font-weight-semibold);
  color: var(--color-text);
}

.card-body {
  padding: var(--spacing-6);
}

.card-footer {
  padding: var(--spacing-4) var(--spacing-6);
  border-top: 1px solid var(--color-border);
  background-color: var(--color-surface-variant);
}

/* Card variants */
.card-elevated {
  box-shadow: var(--shadow-lg);
  border: none;
}

.card-outlined {
  border: 2px solid var(--color-primary);
  box-shadow: none;
}

/* Responsive card */
@media (max-width: 639px) {
  .card-header,
  .card-body,
  .card-footer {
    padding-left: var(--spacing-4);
    padding-right: var(--spacing-4);
  }
}
\`\`\`

### Form Components

\`\`\`css
/* Form controls */
.form-group {
  margin-bottom: var(--spacing-4);
}

.form-label {
  display: block;
  margin-bottom: var(--spacing-1);

  font-size: var(--font-size-sm);
  font-weight: var(--font-weight-medium);
  color: var(--color-text);
}

.form-control {
  display: block;
  width: 100%;
  padding: var(--spacing-2) var(--spacing-3);

  font-family: var(--font-family-primary);
  font-size: var(--font-size-base);
  line-height: var(--line-height-normal);

  color: var(--color-text);
  background-color: var(--color-background);
  background-clip: padding-box;

  border: 1px solid var(--color-border);
  border-radius: var(--border-radius-md);

  transition: var(--transition-base);
}

.form-control:focus {
  outline: none;
  border-color: var(--color-primary);
  box-shadow: 0 0 0 3px var(--color-primary-200);
}

.form-control:disabled {
  background-color: var(--color-surface-variant);
  opacity: 0.6;
  cursor: not-allowed;
}

/* Form validation states */
.form-control.is-valid {
  border-color: var(--color-success);
}

.form-control.is-invalid {
  border-color: var(--color-error);
}

.form-feedback {
  display: block;
  margin-top: var(--spacing-1);
  font-size: var(--font-size-xs);
}

.form-feedback.valid {
  color: var(--color-success);
}

.form-feedback.invalid {
  color: var(--color-error);
}
\`\`\`

---

## ✨ Best Practices

### 1. CSS Organization

\`\`\`css
/* ❌ Bad: Hardcoded values */
.component {
  color: #333;
  margin: 16px;
  font-size: 14px;
}

/* ✅ Good: Use CSS variables */
.component {
  color: var(--color-text);
  margin: var(--spacing-4);
  font-size: var(--font-size-sm);
}
\`\`\`

### 2. Theme Context Usage

\`\`\`jsx
// ❌ Bad: Direct theme check
const MyComponent = () => {
  const isDark = document.documentElement.getAttribute('data-theme') === 'dark';

  return (
    <div style={{ color: isDark ? 'white' : 'black' }}>
      Content
    </div>
  );
};

// ✅ Good: Use theme context
const MyComponent = () => {
  const { theme, colors } = useTheme();

  return (
    <div style={{ color: colors.text }}>
      Content
    </div>
  );
};
\`\`\`

### 3. Responsive Design

\`\`\`css
/* ❌ Bad: Desktop-first */
.component {
  padding: 32px;
  font-size: 18px;
}

@media (max-width: 768px) {
  .component {
    padding: 16px;
    font-size: 16px;
  }
}

/* ✅ Good: Mobile-first */
.component {
  padding: var(--spacing-4);
  font-size: var(--font-size-base);
}

@media (min-width: 768px) {
  .component {
    padding: var(--spacing-8);
    font-size: var(--font-size-lg);
  }
}
\`\`\`

### 4. Accessibility

\`\`\`jsx
// ✅ Good: Accessible theme toggle
const ThemeToggle = () => {
  const { theme, toggleTheme } = useTheme();

  return (
    <button
      onClick={toggleTheme}
      aria-label={\`Switch to \${theme === 'light' ? 'dark' : 'light'} mode\`}
      aria-pressed={theme === 'dark'}
    >
      {theme === 'light' ? '🌙' : '☀️'}
    </button>
  );
};
\`\`\`

### 5. Performance

\`\`\`css
/* ✅ Good: Use CSS containment */
.component {
  contain: layout style paint;
}

/* ✅ Good: Optimize transitions */
.component {
  transition: transform var(--transition-base),
              box-shadow var(--transition-base);
}

/* ✅ Good: Use will-change for animations */
.component:hover {
  will-change: transform;
  transform: translateY(-2px);
}
\`\`\`

---

## 🔧 Troubleshooting

### ❌ Theme không chuyển đổi

\`\`\`jsx
// Kiểm tra ThemeProvider wrapper
// App.js
function App() {
  return (
    <ThemeProvider> {/* ✅ Đảm bảo có ThemeProvider */}
      <YourApp />
    </ThemeProvider>
  );
}

// Kiểm tra CSS import
import './styles/main.css'; // ✅ Import styles
\`\`\`

### ❌ CSS Variables không hoạt động

\`\`\`css
/* Kiểm tra CSS syntax */
:root {
  --color-primary: #3B82F6; /* ✅ Correct */
  /* --color-primary #3B82F6; ❌ Missing colon */
}

/* Kiểm tra usage */
.component {
  color: var(--color-primary); /* ✅ Correct */
  /* color: --color-primary; ❌ Missing var() */
}
\`\`\`

### ❌ Responsive breakpoints không hoạt động

\`\`\`css
/* ✅ Correct media query order */
/* Mobile first */
.component { /* Mobile styles */ }

@media (min-width: 768px) {
  .component { /* Tablet styles */ }
}

@media (min-width: 1024px) {
  .component { /* Desktop styles */ }
}

/* ❌ Wrong order */
@media (min-width: 1024px) { /* Desktop */ }
@media (min-width: 768px) { /* This won't work */ }
\`\`\`

### ❌ Dark mode không lưu

\`\`\`jsx
// Kiểm tra localStorage
useEffect(() => {
  // ✅ Save theme preference
  localStorage.setItem('theme', theme);
  document.documentElement.setAttribute('data-theme', theme);
}, [theme]);

// ✅ Load saved theme
const getInitialTheme = () => {
  const saved = localStorage.getItem('theme');
  if (saved) return saved;

  return window.matchMedia('(prefers-color-scheme: dark)').matches
    ? 'dark'
    : 'light';
};
\`\`\`

---

## 🎉 Kết luận

**MIA Theme System** cung cấp một giải pháp theme toàn diện cho React applications với:

- ✅ **Dễ sử dụng**: Setup nhanh chóng với Context API
- ✅ **Hiệu năng cao**: Tối ưu với CSS Variables
- ✅ **Responsive**: Mobile-first design
- ✅ **Accessibility**: Tuân thủ chuẩn WCAG
- ✅ **Customizable**: Dễ dàng tùy chỉnh và mở rộng

### 📚 Tài liệu tham khảo

- [CSS Custom Properties MDN](https://developer.mozilla.org/en-US/docs/Web/CSS/Using_CSS_custom_properties)
- [React Context API](https://reactjs.org/docs/context.html)
- [WCAG Guidelines](https://www.w3.org/WAI/WCAG21/quickref/)
- [Material Design 3](https://m3.material.io/)

### 🆘 Hỗ trợ

Nếu gặp vấn đề:
1. Kiểm tra Console errors
2. Validate CSS syntax
3. Verify import paths
4. Check ThemeProvider setup
5. Test in incognito mode

---

**Happy theming! 🎨✨**
