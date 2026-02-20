/**
 * Hook lấy trạng thái kết nối từ backend /health
 * Map services (googleSheets, googleDrive, telegram...) -> ConnectionItem format
 */
import { useState, useEffect } from "react";
import importMetaEnv from "../utils/importMetaEnv";
import { connectionData } from "../components/layout/layoutData";

const API_BASE =
  importMetaEnv.VITE_API_URL ||
  importMetaEnv.REACT_APP_API_URL ||
  "http://localhost:3001";

const SERVICE_MAP = [
  { key: "googleSheets", name: "Google Sheets", icon: "📊" },
  { key: "googleDrive", name: "Google Drive", icon: "📁" },
  { key: "googleAppsScript", name: "Google Apps Script", icon: "⚙️" },
  { key: "telegram", name: "Telegram Bot", icon: "💬" },
  { key: "automation", name: "Automation", icon: "🤖" },
];

const statusMap = {
  healthy: "connected",
  degraded: "error",
  unhealthy: "error",
  warning: "disconnected",
};

export function useHealthConnections() {
  const [connections, setConnections] = useState(connectionData);

  useEffect(() => {
    const fetchHealth = async () => {
      try {
        const ctrl = new AbortController();
        const tid = setTimeout(() => ctrl.abort(), 5000);
        const res = await fetch(`${API_BASE}/health`, { signal: ctrl.signal });
        clearTimeout(tid);
        if (!res.ok) return;
        const data = await res.json();
        const svc = data.services || {};
        setConnections(
          SERVICE_MAP.map(({ key, name, icon }) => {
            const s = svc[key];
            const status = s
              ? statusMap[s.status] || "disconnected"
              : "disconnected";
            return { name, icon, status };
          })
        );
      } catch {
        // Giữ connectionData mặc định khi lỗi
      }
    };
    fetchHealth();
    const t = setInterval(fetchHealth, 60000);
    return () => clearInterval(t);
  }, []);

  return connections;
}
