/**
 * PWA Update Prompt - Hiện khi có phiên bản mới (Service Worker update)
 * Dùng useRegisterSW từ vite-plugin-pwa (virtual:pwa-register/react)
 */
import React, { useState, useEffect } from "react";
import { Button, message } from "antd";

const PWAUpdatePrompt = () => {
  const [SWComponent, setSWComponent] = useState(null);

  useEffect(() => {
    import("virtual:pwa-register/react")
      .then(({ useRegisterSW }) => {
        const Inner = () => {
          const [needRefresh, setNeedRefresh] = useState(false);
          const [offlineReady, setOfflineReady] = useState(false);
          const { updateServiceWorker } = useRegisterSW({
            onNeedRefresh: () => setNeedRefresh(true),
            onOfflineReady: () => setOfflineReady(true),
          });
          if (!needRefresh && !offlineReady) return null;
          return (
            <div
              style={{
                position: "fixed",
                bottom: 16,
                right: 16,
                padding: "12px 16px",
                background: "white",
                borderRadius: 8,
                boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
                zIndex: 9999,
                display: "flex",
                alignItems: "center",
                gap: 12,
              }}
            >
              <span>
                {needRefresh ? "Có phiên bản mới" : "Sẵn sàng offline"}
              </span>
              {needRefresh && (
                <Button
                  type="primary"
                  size="small"
                  onClick={() => {
                    updateServiceWorker();
                    setNeedRefresh(false);
                    message.success("Đang cập nhật...");
                  }}
                >
                  Cập nhật
                </Button>
              )}
              <Button
                size="small"
                onClick={() => {
                  setNeedRefresh(false);
                  setOfflineReady(false);
                }}
              >
                Đóng
              </Button>
            </div>
          );
        };
        setSWComponent(() => Inner);
      })
      .catch(() => {});
  }, []);

  return SWComponent ? <SWComponent /> : null;
};

export default PWAUpdatePrompt;
