import React from "react";
import { Link } from "react-router-dom";

const NavItem = ({
  item,
  isActive,
  collapsed,
  onClick,
  className = "",
  isChild = false,
}) => {
  const { path, icon, label, description } = item;

  const navItemClasses = `
    nav-item
    ${isChild ? "nav-child" : ""}
    ${isActive ? "active" : ""}
    ${className}
  `.trim();

  const content = (
    <>
      <span className="nav-icon">{icon}</span>
      <div className="nav-content">
        <span className="nav-label">{label}</span>
        {!collapsed && description && (
          <span className="nav-description">{description}</span>
        )}
      </div>
    </>
  );

  // Nếu có onClick (cho static items), render div
  if (onClick) {
    return (
      <div className={navItemClasses} onClick={onClick}>
        {content}
      </div>
    );
  }

  // Nếu có path (cho navigation items), render Link
  if (path) {
    return (
      <Link to={path} className={navItemClasses}>
        {content}
      </Link>
    );
  }

  // Fallback: render div
  return <div className={navItemClasses}>{content}</div>;
};

export default NavItem;
