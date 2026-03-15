import React from "react";
import NavItem from "./NavItem";

const NavSection = ({ title, items, collapsed, isActive, className = "" }) => {
  if (!items || items.length === 0) {
    return null;
  }

  return (
    <div className={`nav-section ${className}`}>
      <h3 className="nav-section-title">{title}</h3>
      {items.map((item) => {
        const key = item.path || item.label || item.icon;
        const active = isActive ? isActive(item.path) : false;

        return (
          <NavItem
            key={key}
            item={item}
            isActive={active}
            collapsed={collapsed}
            className={item.className || ""}
          />
        );
      })}
    </div>
  );
};

export default NavSection;
