/**
 * Layout Configuration Data - Định nghĩa trang và widget cho Layout Config Manager
 * Mỗi trang có widgets với cấu hình: id, label, row, col, width, height, visible
 */

export const VIEW_MODES = {
  mobile: "mobile",
  tablet: "tablet",
  desktop: "desktop",
};

// Cấu hình mặc định widget cho từng trang
const createDefaultWidgets = (widgets) =>
  widgets.map((w) => ({
    ...w,
    visible: w.visible !== false,
  }));

export const PAGE_LAYOUTS = {
  "/": {
    id: "home",
    label: "Trang chủ",
    category: "main",
    icon: "🏠",
    widgets: createDefaultWidgets([
      {
        id: "welcome",
        label: "Chào mừng",
        row: 0,
        col: 0,
        width: 12,
        height: 1,
        visible: true,
      },
      {
        id: "quickStats",
        label: "Thống kê nhanh",
        row: 1,
        col: 0,
        width: 12,
        height: 2,
        visible: true,
      },
    ]),
  },
  "/dashboard": {
    id: "dashboard",
    label: "Bảng điều khiển",
    category: "main",
    icon: "📊",
    widgets: createDefaultWidgets([
      {
        id: "metrics-cpu",
        label: "CPU Usage",
        row: 0,
        col: 0,
        width: 6,
        height: 2,
        visible: true,
      },
      {
        id: "metrics-memory",
        label: "Memory Usage",
        row: 0,
        col: 1,
        width: 6,
        height: 2,
        visible: true,
      },
      {
        id: "metrics-users",
        label: "Active Users",
        row: 1,
        col: 0,
        width: 6,
        height: 2,
        visible: true,
      },
      {
        id: "metrics-status",
        label: "Connection Status",
        row: 1,
        col: 1,
        width: 6,
        height: 2,
        visible: true,
      },
      {
        id: "scrapers",
        label: "Scraper Controls",
        row: 2,
        col: 0,
        width: 12,
        height: 3,
        visible: true,
      },
      {
        id: "logs",
        label: "Activity Logs",
        row: 3,
        col: 0,
        width: 12,
        height: 4,
        visible: true,
      },
    ]),
  },
  "/ai-analytics": {
    id: "ai-analytics",
    label: "Phân tích AI",
    category: "main",
    icon: "🧠",
    widgets: createDefaultWidgets([
      {
        id: "ai-overview",
        label: "Tổng quan AI",
        row: 0,
        col: 0,
        width: 12,
        height: 2,
        visible: true,
      },
      {
        id: "ai-chat",
        label: "AI Chat",
        row: 1,
        col: 0,
        width: 12,
        height: 4,
        visible: true,
      },
    ]),
  },
  "/retail": {
    id: "retail",
    label: "Retail Dashboard",
    category: "main",
    icon: "🛒",
    widgets: createDefaultWidgets([
      {
        id: "retail-sales",
        label: "Doanh số",
        row: 0,
        col: 0,
        width: 6,
        height: 2,
        visible: true,
      },
      {
        id: "retail-inventory",
        label: "Tồn kho",
        row: 0,
        col: 1,
        width: 6,
        height: 2,
        visible: true,
      },
      {
        id: "retail-charts",
        label: "Biểu đồ",
        row: 1,
        col: 0,
        width: 12,
        height: 4,
        visible: true,
      },
    ]),
  },
  "/google-sheets": {
    id: "google-sheets",
    label: "Google Sheets",
    category: "integrations",
    icon: "📋",
    widgets: createDefaultWidgets([
      {
        id: "sheets-editor",
        label: "Trình chỉnh sửa",
        row: 0,
        col: 0,
        width: 12,
        height: 6,
        visible: true,
      },
    ]),
  },
  "/google-drive": {
    id: "google-drive",
    label: "Google Drive",
    category: "integrations",
    icon: "📁",
    widgets: createDefaultWidgets([
      {
        id: "drive-explorer",
        label: "File Explorer",
        row: 0,
        col: 0,
        width: 12,
        height: 6,
        visible: true,
      },
    ]),
  },
  "/advanced-analytics": {
    id: "advanced-analytics",
    label: "Advanced Analytics",
    category: "main",
    icon: "📈",
    widgets: createDefaultWidgets([
      {
        id: "analytics-filters",
        label: "Bộ lọc",
        row: 0,
        col: 0,
        width: 4,
        height: 2,
        visible: true,
      },
      {
        id: "analytics-charts",
        label: "Biểu đồ",
        row: 0,
        col: 1,
        width: 8,
        height: 4,
        visible: true,
      },
    ]),
  },
  "/alerts": {
    id: "alerts",
    label: "Quản lý Alerts",
    category: "main",
    icon: "🔔",
    widgets: createDefaultWidgets([
      {
        id: "alerts-list",
        label: "Danh sách cảnh báo",
        row: 0,
        col: 0,
        width: 12,
        height: 6,
        visible: true,
      },
    ]),
  },
  "/security": {
    id: "security",
    label: "Enterprise Security",
    category: "main",
    icon: "🔒",
    widgets: createDefaultWidgets([
      {
        id: "security-tabs",
        label: "Tabs Security",
        row: 0,
        col: 0,
        width: 12,
        height: 6,
        visible: true,
      },
    ]),
  },
  "/google-apps-script": {
    id: "google-apps-script",
    label: "Google Apps Script",
    category: "integrations",
    icon: "⚙️",
    widgets: createDefaultWidgets([
      {
        id: "gas-editor",
        label: "Script Editor",
        row: 0,
        col: 0,
        width: 12,
        height: 6,
        visible: true,
      },
    ]),
  },
  "/telegram": {
    id: "telegram",
    label: "Telegram Bot",
    category: "integrations",
    icon: "💬",
    widgets: createDefaultWidgets([
      {
        id: "telegram-panel",
        label: "Telegram Panel",
        row: 0,
        col: 0,
        width: 12,
        height: 6,
        visible: true,
      },
    ]),
  },
  "/automation": {
    id: "automation",
    label: "Automation",
    category: "main",
    icon: "🤖",
    widgets: createDefaultWidgets([
      {
        id: "automation-list",
        label: "Danh sách automation",
        row: 0,
        col: 0,
        width: 12,
        height: 6,
        visible: true,
      },
    ]),
  },
  "/smart-automation": {
    id: "smart-automation",
    label: "Smart Automation",
    category: "main",
    icon: "🤖",
    widgets: createDefaultWidgets([
      {
        id: "smart-panel",
        label: "Smart Automation Panel",
        row: 0,
        col: 0,
        width: 12,
        height: 6,
        visible: true,
      },
    ]),
  },
  "/nlp": {
    id: "nlp",
    label: "NLP Dashboard",
    category: "main",
    icon: "💬",
    widgets: createDefaultWidgets([
      {
        id: "nlp-chat",
        label: "NLP Chat",
        row: 0,
        col: 0,
        width: 12,
        height: 6,
        visible: true,
      },
    ]),
  },
};

// Danh sách trang nhóm theo category cho sidebar
export const getPageList = () => {
  const categories = {};
  Object.entries(PAGE_LAYOUTS).forEach(([path, config]) => {
    const cat = config.category || "other";
    if (!categories[cat]) categories[cat] = [];
    categories[cat].push({ path, ...config });
  });
  return categories;
};
