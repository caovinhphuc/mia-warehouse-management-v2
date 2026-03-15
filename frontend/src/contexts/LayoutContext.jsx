/**
 * LayoutContext - Quản lý cấu hình layout theo trang và view mode
 * Lưu trong localStorage, hỗ trợ toggle widget, reset layout
 */
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import {
  PAGE_LAYOUTS,
  VIEW_MODES,
  getPageList,
} from "../components/layout/layoutConfigData";

const STORAGE_KEY = "mia_layout_config";

const getDefaultLayouts = () => {
  const layouts = {};
  Object.entries(PAGE_LAYOUTS).forEach(([path, config]) => {
    layouts[path] = {};
    Object.values(VIEW_MODES).forEach((mode) => {
      layouts[path][mode] = config.widgets.map((w) => ({ ...w }));
    });
  });
  return layouts;
};

const loadFromStorage = () => {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      const parsed = JSON.parse(saved);
      return { ...getDefaultLayouts(), ...parsed };
    }
  } catch {
    // ignore
  }
  return getDefaultLayouts();
};

const saveToStorage = (layouts) => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(layouts));
  } catch {
    // ignore
  }
};

const LayoutContext = createContext(null);

export const LayoutProvider = ({ children }) => {
  const [layouts, setLayouts] = useState(loadFromStorage);

  useEffect(() => {
    saveToStorage(layouts);
  }, [layouts]);

  const toggleWidgetVisibility = useCallback((pageId, viewMode, widgetId) => {
    setLayouts((prev) => {
      const pageLayout = prev[pageId]?.[viewMode];
      if (!pageLayout) return prev;
      const next = JSON.parse(JSON.stringify(prev));
      const widgets = next[pageId][viewMode];
      const w = widgets.find((x) => x.id === widgetId);
      if (w) w.visible = !w.visible;
      return next;
    });
  }, []);

  const resetLayout = useCallback((pageId) => {
    const defaultPage = PAGE_LAYOUTS[pageId];
    if (!defaultPage) return;
    setLayouts((prev) => ({
      ...prev,
      [pageId]: {
        mobile: defaultPage.widgets.map((w) => ({ ...w })),
        tablet: defaultPage.widgets.map((w) => ({ ...w })),
        desktop: defaultPage.widgets.map((w) => ({ ...w })),
      },
    }));
  }, []);

  const resetAllLayouts = useCallback(() => {
    setLayouts(getDefaultLayouts());
  }, []);

  const getWidgets = useCallback(
    (pageId, viewMode) => {
      return layouts[pageId]?.[viewMode] ?? PAGE_LAYOUTS[pageId]?.widgets ?? [];
    },
    [layouts]
  );

  const value = useMemo(
    () => ({
      layouts,
      toggleWidgetVisibility,
      resetLayout,
      resetAllLayouts,
      getWidgets,
      getPageList,
      PAGE_LAYOUTS,
      VIEW_MODES,
    }),
    [layouts, toggleWidgetVisibility, resetLayout, resetAllLayouts, getWidgets]
  );

  return (
    <LayoutContext.Provider value={value}>{children}</LayoutContext.Provider>
  );
};

export const useLayout = () => {
  const ctx = useContext(LayoutContext);
  if (!ctx) throw new Error("useLayout must be used within LayoutProvider");
  return ctx;
};
