/**
 * Modern Card Component
 * Supports multiple variants, hover effects, and loading states
 */

import React from "react";
import "./Card.css";

const Card = ({
  children,
  variant = "default",
  hoverable = false,
  bordered = true,
  shadow = "md",
  padding = "md",
  className = "",
  onClick,
  loading = false,
  ...props
}) => {
  const cardClasses = [
    "card",
    `card--${variant}`,
    `card--shadow-${shadow}`,
    `card--padding-${padding}`,
    hoverable && "card--hoverable",
    bordered && "card--bordered",
    loading && "card--loading",
    onClick && "card--clickable",
    className,
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <div className={cardClasses} onClick={onClick} {...props}>
      {loading ? (
        <div className="card__loading">
          <div className="skeleton skeleton--title" />
          <div className="skeleton skeleton--text" />
          <div className="skeleton skeleton--text" />
        </div>
      ) : (
        children
      )}
    </div>
  );
};

// Card Header Component
Card.Header = ({ children, className = "", ...props }) => (
  <div className={`card__header ${className}`} {...props}>
    {children}
  </div>
);

// Card Body Component
Card.Body = ({ children, className = "", ...props }) => (
  <div className={`card__body ${className}`} {...props}>
    {children}
  </div>
);

// Card Footer Component
Card.Footer = ({ children, className = "", ...props }) => (
  <div className={`card__footer ${className}`} {...props}>
    {children}
  </div>
);

// Card Title Component
Card.Title = ({ children, className = "", level = 3, ...props }) => {
  const Tag = `h${level}`;
  return (
    <Tag className={`card__title ${className}`} {...props}>
      {children}
    </Tag>
  );
};

// Card Meta Component
Card.Meta = ({ title, description, avatar, className = "", ...props }) => (
  <div className={`card__meta ${className}`} {...props}>
    {avatar && <div className="card__meta-avatar">{avatar}</div>}
    <div className="card__meta-content">
      {title && <div className="card__meta-title">{title}</div>}
      {description && (
        <div className="card__meta-description">{description}</div>
      )}
    </div>
  </div>
);

export default Card;
