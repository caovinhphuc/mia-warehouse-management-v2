import React, { useState, useEffect } from "react";

const Notification = ({
  type = "info",
  title,
  message,
  duration = 5000,
  onClose,
  position = "top-right",
  show = true,
}) => {
  const [visible, setVisible] = useState(show);
  const [progress, setProgress] = useState(100);

  const handleClose = React.useCallback(() => {
    setVisible(false);
    if (onClose) {
      onClose();
    }
  }, [onClose]);

  useEffect(() => {
    setVisible(show);
    setProgress(100);
  }, [show]);

  useEffect(() => {
    if (!visible) return;

    const timer = setInterval(() => {
      setProgress((prev) => {
        const newProgress = prev - 100 / (duration / 100);
        if (newProgress <= 0) {
          handleClose();
          return 0;
        }
        return newProgress;
      });
    }, 100);

    return () => clearInterval(timer);
  }, [visible, duration, handleClose]);

  const getNotificationStyle = () => {
    const baseStyle = {
      position: "fixed",
      zIndex: 9999,
      padding: "16px",
      borderRadius: "4px",
      boxShadow: "0 4px 12px rgba(0, 0, 0, 0.15)",
      maxWidth: "400px",
      minWidth: "300px",
      display: "flex",
      alignItems: "flex-start",
      gap: "12px",
      fontFamily: "Arial, sans-serif",
      animation: "slideIn 0.3s ease-out",
    };

    // Position styles
    const positionStyles = {
      "top-right": { top: "20px", right: "20px" },
      "top-left": { top: "20px", left: "20px" },
      "bottom-right": { bottom: "20px", right: "20px" },
      "bottom-left": { bottom: "20px", left: "20px" },
      "top-center": { top: "20px", left: "50%", transform: "translateX(-50%)" },
      "bottom-center": {
        bottom: "20px",
        left: "50%",
        transform: "translateX(-50%)",
      },
    };

    // Type styles
    const typeStyles = {
      success: {
        backgroundColor: "#e8f5e8",
        border: "1px solid #4caf50",
        color: "#2e7d32",
      },
      error: {
        backgroundColor: "#ffebee",
        border: "1px solid #f44336",
        color: "#c62828",
      },
      warning: {
        backgroundColor: "#fff3cd",
        border: "1px solid #ffc107",
        color: "#856404",
      },
      info: {
        backgroundColor: "#e3f2fd",
        border: "1px solid #2196f3",
        color: "#1565c0",
      },
    };

    return {
      ...baseStyle,
      ...positionStyles[position],
      ...typeStyles[type],
    };
  };

  const getIcon = () => {
    const icons = {
      success: "✅",
      error: "❌",
      warning: "⚠️",
      info: "ℹ️",
    };
    return icons[type] || icons.info;
  };

  if (!visible) return null;

  return (
    <>
      <div style={getNotificationStyle()}>
        <div style={{ fontSize: "20px", flexShrink: 0 }}>{getIcon()}</div>

        <div style={{ flex: 1, minWidth: 0 }}>
          {title && (
            <h4
              style={{
                margin: "0 0 8px 0",
                fontSize: "16px",
                fontWeight: "bold",
              }}
            >
              {title}
            </h4>
          )}

          <p
            style={{
              margin: 0,
              fontSize: "14px",
              lineHeight: "1.4",
              wordWrap: "break-word",
            }}
          >
            {message}
          </p>
        </div>

        <button
          onClick={handleClose}
          style={{
            background: "none",
            border: "none",
            fontSize: "18px",
            cursor: "pointer",
            color: "inherit",
            opacity: 0.7,
            padding: "0",
            marginLeft: "8px",
            flexShrink: 0,
          }}
          onMouseEnter={(e) => (e.target.style.opacity = "1")}
          onMouseLeave={(e) => (e.target.style.opacity = "0.7")}
        >
          ×
        </button>

        {/* Progress bar */}
        <div
          style={{
            position: "absolute",
            bottom: 0,
            left: 0,
            height: "3px",
            width: `${progress}%`,
            backgroundColor: "rgba(0, 0, 0, 0.2)",
            borderRadius: "0 0 4px 4px",
            transition: "width 0.1s linear",
          }}
        />
      </div>

      <style jsx>{`
        @keyframes slideIn {
          from {
            transform: translateX(100%);
            opacity: 0;
          }
          to {
            transform: translateX(0);
            opacity: 1;
          }
        }
      `}</style>
    </>
  );
};

// Notification Context for global notifications
const NotificationContext = React.createContext();

export const NotificationProvider = ({ children }) => {
  const [notifications, setNotifications] = useState([]);

  const addNotification = (notification) => {
    const id = Date.now() + Math.random();
    const newNotification = {
      id,
      ...notification,
      onClose: () => removeNotification(id),
    };

    setNotifications((prev) => [...prev, newNotification]);

    // Auto remove after duration
    if (notification.duration !== 0) {
      setTimeout(() => {
        removeNotification(id);
      }, notification.duration || 5000);
    }
  };

  const removeNotification = (id) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id));
  };

  const showSuccess = (message, options = {}) => {
    addNotification({
      type: "success",
      title: "Success",
      message,
      ...options,
    });
  };

  const showError = (message, options = {}) => {
    addNotification({
      type: "error",
      title: "Error",
      message,
      duration: 0, // Don't auto-hide errors
      ...options,
    });
  };

  const showWarning = (message, options = {}) => {
    addNotification({
      type: "warning",
      title: "Warning",
      message,
      ...options,
    });
  };

  const showInfo = (message, options = {}) => {
    addNotification({
      type: "info",
      title: "Info",
      message,
      ...options,
    });
  };

  return (
    <NotificationContext.Provider
      value={{
        addNotification,
        showSuccess,
        showError,
        showWarning,
        showInfo,
      }}
    >
      {children}
      {notifications.map((notification) => (
        <Notification key={notification.id} {...notification} />
      ))}
    </NotificationContext.Provider>
  );
};

export const useNotification = () => {
  const context = React.useContext(NotificationContext);
  if (!context) {
    throw new Error("useNotification must be used within NotificationProvider");
  }
  return context;
};

// Simple notification hook for basic usage
export const useSimpleNotification = () => {
  const [notification, setNotification] = useState(null);

  const showNotification = (type, message, duration = 5000) => {
    setNotification({
      type,
      message,
      show: true,
      duration,
    });
  };

  const hideNotification = () => {
    setNotification(null);
  };

  const notificationComponent = notification ? (
    <Notification {...notification} onClose={hideNotification} />
  ) : null;

  return {
    showNotification,
    hideNotification,
    notificationComponent,
    showSuccess: (message, duration) =>
      showNotification("success", message, duration),
    showError: (message, duration) =>
      showNotification("error", message, duration),
    showWarning: (message, duration) =>
      showNotification("warning", message, duration),
    showInfo: (message, duration) =>
      showNotification("info", message, duration),
  };
};

export default Notification;
