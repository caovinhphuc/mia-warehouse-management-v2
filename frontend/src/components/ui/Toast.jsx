/**
 * Toast Notification System
 * Modern, accessible notifications with multiple variants
 */

import React, { createContext, useCallback, useContext, useState } from "react";
import "./Toast.css";

// Toast Context
const ToastContext = createContext(null);

// Toast Provider Component
export const ToastProvider = ({
  children,
  position = "top-right",
  maxToasts = 5,
}) => {
  const [toasts, setToasts] = useState([]);

  // Define removeToast FIRST
  const removeToast = useCallback((id) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id));
  }, []);

  const removeAllToasts = useCallback(() => {
    setToasts([]);
  }, []);

  // Then addToast can use removeToast
  const addToast = useCallback(
    (message, options = {}) => {
      const id = Date.now() + Math.random();
      const toast = {
        id,
        message,
        type: options.type || "info",
        duration: options.duration || 3000,
        icon: options.icon,
        action: options.action,
        closable: options.closable !== false,
      };

      setToasts((prev) => {
        const newToasts = [toast, ...prev];
        return newToasts.slice(0, maxToasts);
      });

      if (toast.duration > 0) {
        setTimeout(() => {
          removeToast(id);
        }, toast.duration);
      }

      return id;
    },
    [maxToasts, removeToast]
  );

  // Convenience methods
  const success = useCallback(
    (message, options = {}) =>
      addToast(message, { ...options, type: "success" }),
    [addToast]
  );

  const error = useCallback(
    (message, options = {}) => addToast(message, { ...options, type: "error" }),
    [addToast]
  );

  const warning = useCallback(
    (message, options = {}) =>
      addToast(message, { ...options, type: "warning" }),
    [addToast]
  );

  const info = useCallback(
    (message, options = {}) => addToast(message, { ...options, type: "info" }),
    [addToast]
  );

  const value = {
    toasts,
    addToast,
    removeToast,
    removeAllToasts,
    success,
    error,
    warning,
    info,
  };

  return (
    <ToastContext.Provider value={value}>
      {children}
      <ToastContainer
        toasts={toasts}
        position={position}
        onRemove={removeToast}
      />
    </ToastContext.Provider>
  );
};

// Toast Container Component
const ToastContainer = ({ toasts, position, onRemove }) => {
  if (toasts.length === 0) return null;

  return (
    <div
      className={`toast-container toast-container--${position}`}
      role="region"
      aria-live="polite"
    >
      {toasts.map((toast, index) => (
        <Toast key={toast.id} toast={toast} onRemove={onRemove} index={index} />
      ))}
    </div>
  );
};

// Individual Toast Component
const Toast = ({ toast, onRemove, index }) => {
  const [isExiting, setIsExiting] = useState(false);

  const handleClose = () => {
    setIsExiting(true);
    setTimeout(() => {
      onRemove(toast.id);
    }, 300);
  };

  const toastClasses = [
    "toast",
    `toast--${toast.type}`,
    isExiting && "toast--exiting",
  ]
    .filter(Boolean)
    .join(" ");

  const icons = {
    success: (
      <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
        <path
          d="M10 0C4.48 0 0 4.48 0 10C0 15.52 4.48 20 10 20C15.52 20 20 15.52 20 10C20 4.48 15.52 0 10 0ZM8 15L3 10L4.41 8.59L8 12.17L15.59 4.58L17 6L8 15Z"
          fill="currentColor"
        />
      </svg>
    ),
    error: (
      <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
        <path
          d="M10 0C4.48 0 0 4.48 0 10C0 15.52 4.48 20 10 20C15.52 20 20 15.52 20 10C20 4.48 15.52 0 10 0ZM11 15H9V13H11V15ZM11 11H9V5H11V11Z"
          fill="currentColor"
        />
      </svg>
    ),
    warning: (
      <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
        <path
          d="M1 17H19L10 2L1 17ZM11 14H9V12H11V14ZM11 10H9V6H11V10Z"
          fill="currentColor"
        />
      </svg>
    ),
    info: (
      <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
        <path
          d="M10 0C4.48 0 0 4.48 0 10C0 15.52 4.48 20 10 20C15.52 20 20 15.52 20 10C20 4.48 15.52 0 10 0ZM11 15H9V9H11V15ZM11 7H9V5H11V7Z"
          fill="currentColor"
        />
      </svg>
    ),
  };

  return (
    <div
      className={toastClasses}
      role="alert"
      style={{ "--toast-index": index }}
    >
      <div className="toast__icon">{toast.icon || icons[toast.type]}</div>
      <div className="toast__content">
        <div className="toast__message">{toast.message}</div>
        {toast.action && (
          <button
            className="toast__action"
            onClick={toast.action.onClick}
            type="button"
          >
            {toast.action.label}
          </button>
        )}
      </div>
      {toast.closable && (
        <button
          className="toast__close"
          onClick={handleClose}
          aria-label="Close notification"
          type="button"
        >
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
            <path
              d="M12.5 3.5L3.5 12.5M3.5 3.5L12.5 12.5"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
            />
          </svg>
        </button>
      )}
    </div>
  );
};

// Custom Hook
export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error("useToast must be used within a ToastProvider");
  }
  return context;
};

export default Toast;
