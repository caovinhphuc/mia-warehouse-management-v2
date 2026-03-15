/**
 * Empty States Component
 * Beautiful empty state illustrations and messages
 */

import React from "react";
import "./Empty.css";

const Empty = ({
  variant = "default",
  title = "No data",
  description,
  image,
  action,
  className = "",
  ...props
}) => {
  const emptyClasses = ["empty", `empty--${variant}`, className]
    .filter(Boolean)
    .join(" ");

  const defaultImages = {
    default: (
      <svg className="empty__image" viewBox="0 0 200 200" fill="none">
        <circle cx="100" cy="100" r="80" fill="var(--color-gray-100)" />
        <path
          d="M70 90C70 85.5817 73.5817 82 78 82H122C126.418 82 130 85.5817 130 90V130C130 134.418 126.418 138 122 138H78C73.5817 138 70 134.418 70 130V90Z"
          fill="var(--color-gray-300)"
        />
        <circle cx="90" cy="100" r="8" fill="var(--color-gray-400)" />
        <path
          d="M70 120L85 105L95 115L110 100L130 120V130C130 134.418 126.418 138 122 138H78C73.5817 138 70 134.418 70 130V120Z"
          fill="var(--color-gray-400)"
        />
      </svg>
    ),
    search: (
      <svg className="empty__image" viewBox="0 0 200 200" fill="none">
        <circle cx="100" cy="100" r="80" fill="var(--color-gray-100)" />
        <circle
          cx="90"
          cy="90"
          r="30"
          stroke="var(--color-gray-400)"
          strokeWidth="6"
          fill="none"
        />
        <path
          d="M112 112L135 135"
          stroke="var(--color-gray-400)"
          strokeWidth="6"
          strokeLinecap="round"
        />
      </svg>
    ),
    error: (
      <svg className="empty__image" viewBox="0 0 200 200" fill="none">
        <circle cx="100" cy="100" r="80" fill="var(--color-error-100)" />
        <circle
          cx="100"
          cy="100"
          r="40"
          stroke="var(--color-error-500)"
          strokeWidth="6"
        />
        <path
          d="M85 85L115 115M115 85L85 115"
          stroke="var(--color-error-500)"
          strokeWidth="6"
          strokeLinecap="round"
        />
      </svg>
    ),
    success: (
      <svg className="empty__image" viewBox="0 0 200 200" fill="none">
        <circle cx="100" cy="100" r="80" fill="var(--color-success-100)" />
        <circle
          cx="100"
          cy="100"
          r="40"
          stroke="var(--color-success-500)"
          strokeWidth="6"
        />
        <path
          d="M80 100L95 115L120 85"
          stroke="var(--color-success-500)"
          strokeWidth="6"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    ),
    folder: (
      <svg className="empty__image" viewBox="0 0 200 200" fill="none">
        <circle cx="100" cy="100" r="80" fill="var(--color-gray-100)" />
        <path
          d="M60 75C60 70.5817 63.5817 67 68 67H90L100 77H132C136.418 77 140 80.5817 140 85V125C140 129.418 136.418 133 132 133H68C63.5817 133 60 129.418 60 125V75Z"
          fill="var(--color-gray-300)"
        />
        <path
          d="M60 85H140V125C140 129.418 136.418 133 132 133H68C63.5817 133 60 129.418 60 125V85Z"
          fill="var(--color-gray-400)"
        />
      </svg>
    ),
    inbox: (
      <svg className="empty__image" viewBox="0 0 200 200" fill="none">
        <circle cx="100" cy="100" r="80" fill="var(--color-gray-100)" />
        <path
          d="M70 75C70 70.5817 73.5817 67 78 67H122C126.418 67 130 70.5817 130 75V95H110L105 105H95L90 95H70V75Z"
          fill="var(--color-gray-300)"
        />
        <path
          d="M70 95H90L95 105H105L110 95H130V125C130 129.418 126.418 133 122 133H78C73.5817 133 70 129.418 70 125V95Z"
          fill="var(--color-gray-400)"
        />
      </svg>
    ),
  };

  return (
    <div className={emptyClasses} {...props}>
      <div className="empty__content">
        {image || defaultImages[variant] || defaultImages.default}
        <div className="empty__text">
          <h3 className="empty__title">{title}</h3>
          {description && <p className="empty__description">{description}</p>}
        </div>
        {action && <div className="empty__action">{action}</div>}
      </div>
    </div>
  );
};

export default Empty;
