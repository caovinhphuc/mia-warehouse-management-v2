import React from "react";

const HamburgerMenu = ({ collapsed, onClick, className = "" }) => {
  return (
    <button
      className={`sidebar-toggle ${className}`}
      onClick={onClick}
      aria-label={collapsed ? "Mở sidebar" : "Đóng sidebar"}
      aria-expanded={!collapsed}
    >
      <span className="hamburger"></span>
      <span className="hamburger"></span>
      <span className="hamburger"></span>
    </button>
  );
};

export default HamburgerMenu;
