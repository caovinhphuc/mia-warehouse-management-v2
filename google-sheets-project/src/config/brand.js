/**
 * 🎨 Brand Configuration Template
 *
 * Customize this file to match your company's branding.
 * Update colors, logos, and company information.
 */

export const BRAND_CONFIG = {
  // Company Information
  companyName: "MIA Retail",
  productName: "MIA Retail Analytics Platform",

  // Visual Assets
  logo: "/assets/mia-retail-logo.png",
  favicon: "/favicon-mia-retail.ico",

  // Color Scheme - Blue gradient theme
  colors: {
    primary: "#3b82f6", // Blue-500 - primary brand color
    secondary: "#2563eb", // Blue-600 - secondary color
    accent: "#60a5fa", // Blue-400 - accent color
    success: "#10b981", // Green - growth and success
    warning: "#f59e0b", // Warning state color
    error: "#ef4444", // Error state color
    info: "#3b82f6", // Info state color (same as primary)
    // Gradient colors
    gradient: {
      start: "#3b82f6", // Blue-500
      end: "#1d4ed8", // Blue-700
    },
  },

  // Contact Information
  contact: {
    email: "support@mia-retail.com",
    website: "https://mia-retail.com",
    phone: "+84 (0) 123 456 789",
  },

  // Theme Configuration
  theme: {
    mode: "light", // 'light' | 'dark' | 'auto'
    fontFamily:
      '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
  },

  // Feature Flags
  features: {
    darkMode: true,
    multiLanguage: false,
    customReports: true,
  },
};

// Export default for easy import
export default BRAND_CONFIG;
