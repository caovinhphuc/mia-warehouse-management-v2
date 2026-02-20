/**
 * Modern Button Component
 * Enhanced with design tokens and multiple variants
 */

import React from "react";
import "./Button.css";

const Button = ({
  children,
  variant = "primary",
  size = "md",
  icon,
  iconPosition = "left",
  loading = false,
  disabled = false,
  fullWidth = false,
  className = "",
  onClick,
  type = "button",
  ...props
}) => {
  const buttonClasses = [
    "btn",
    `btn--${variant}`,
    `btn--${size}`,
    loading && "btn--loading",
    disabled && "btn--disabled",
    fullWidth && "btn--full-width",
    icon && !children && "btn--icon-only",
    className,
  ]
    .filter(Boolean)
    .join(" ");

  const handleClick = (e) => {
    if (loading || disabled) {
      e.preventDefault();
      return;
    }
    onClick?.(e);
  };

  return (
    <button
      className={buttonClasses}
      onClick={handleClick}
      disabled={disabled || loading}
      type={type}
      {...props}
    >
      {loading && (
        <span className="btn__loader">
          <svg className="btn__spinner" viewBox="0 0 24 24">
            <circle
              className="btn__spinner-circle"
              cx="12"
              cy="12"
              r="10"
              fill="none"
              strokeWidth="3"
            />
          </svg>
        </span>
      )}
      {!loading && icon && iconPosition === "left" && (
        <span className="btn__icon btn__icon--left">{icon}</span>
      )}
      {children && <span className="btn__text">{children}</span>}
      {!loading && icon && iconPosition === "right" && (
        <span className="btn__icon btn__icon--right">{icon}</span>
      )}
    </button>
  );
};

// Button Group Component
Button.Group = ({ children, className = "", spacing = "sm", ...props }) => (
  <div
    className={`btn-group btn-group--spacing-${spacing} ${className}`}
    {...props}
  >
    {children}
  </div>
);

export default Button;
