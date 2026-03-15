/**
 * Route preload - Advanced code splitting
 * Preload route chunks khi user hover nav link → giảm latency khi click
 */
const preloaders = {
  "/dashboard": () => import("@components/Dashboard/LiveDashboard"),
  "/ai-analytics": () => import("@components/ai/AIDashboard"),
  "/retail": () => import("@components/custom/MIARetailDashboard"),
  "/google-sheets": () => import("@components/google/GoogleSheetsIntegration"),
  "/google-drive": () => import("@components/google/GoogleDriveIntegration"),
  "/google-apps-script": () =>
    import("@components/google/GoogleAppsScriptIntegration"),
  "/telegram": () => import("@components/telegram/TelegramIntegration"),
  "/automation": () => import("@components/automation/AutomationDashboard"),
  "/alerts": () => import("@components/alerts/AlertsManagement"),
  "/advanced-analytics": () =>
    import("@components/analytics/AdvancedAnalyticsDashboard"),
  "/smart-automation": () =>
    import("@components/smart-automation/SmartAutomationDashboard"),
  "/nlp": () => import("@components/nlp/NLPDashboard"),
  "/security": () => import("@components/security/SecurityDashboard"),
};

const preloaded = new Set();

export const preloadRoute = (path) => {
  if (!path || preloaded.has(path)) return;
  const loader = preloaders[path];
  if (loader) {
    preloaded.add(path);
    loader();
  }
};
