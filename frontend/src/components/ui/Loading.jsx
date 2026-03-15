/**
 * Loading States Component
 * Multiple loading indicators for different contexts
 */

import React from "react";
import "./Loading.css";

const Loading = ({
  variant = "spinner",
  size = "md",
  color = "primary",
  text,
  fullScreen = false,
  className = "",
  ...props
}) => {
  const loadingClasses = [
    "loading",
    `loading--${variant}`,
    `loading--${size}`,
    `loading--${color}`,
    fullScreen && "loading--fullscreen",
    className,
  ]
    .filter(Boolean)
    .join(" ");

  const renderLoader = () => {
    switch (variant) {
      case "spinner":
        return (
          <svg className="loading__spinner" viewBox="0 0 50 50">
            <circle
              className="loading__spinner-circle"
              cx="25"
              cy="25"
              r="20"
              fill="none"
              strokeWidth="4"
            />
          </svg>
        );

      case "dots":
        return (
          <div className="loading__dots">
            <span className="loading__dot" />
            <span className="loading__dot" />
            <span className="loading__dot" />
          </div>
        );

      case "bars":
        return (
          <div className="loading__bars">
            <span className="loading__bar" />
            <span className="loading__bar" />
            <span className="loading__bar" />
            <span className="loading__bar" />
          </div>
        );

      case "pulse":
        return <div className="loading__pulse" />;

      case "ring":
        return <div className="loading__ring" />;

      case "wave":
        return (
          <div className="loading__wave">
            <span className="loading__wave-bar" />
            <span className="loading__wave-bar" />
            <span className="loading__wave-bar" />
            <span className="loading__wave-bar" />
            <span className="loading__wave-bar" />
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className={loadingClasses} role="status" aria-live="polite" {...props}>
      <div className="loading__content">
        {renderLoader()}
        {text && <p className="loading__text">{text}</p>}
      </div>
    </div>
  );
};

// Loading Overlay Component
Loading.Overlay = ({ visible = false, children, ...props }) => {
  if (!visible) return children;

  return (
    <div className="loading-overlay">
      {children}
      <div className="loading-overlay__backdrop">
        <Loading {...props} />
      </div>
    </div>
  );
};

// Loading Inline Component (for buttons, cards, etc.)
Loading.Inline = ({ size = "sm", color = "primary", className = "" }) => (
  <span
    className={`loading-inline loading-inline--${size} loading-inline--${color} ${className}`}
  >
    <svg className="loading-inline__spinner" viewBox="0 0 24 24">
      <circle
        className="loading-inline__circle"
        cx="12"
        cy="12"
        r="10"
        fill="none"
        strokeWidth="3"
      />
    </svg>
  </span>
);

export default Loading;
