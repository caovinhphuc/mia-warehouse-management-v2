import React from "react";

const ConnectionItem = ({
  name,
  icon,
  status = "connected",
  className = "",
}) => {
  const statusClasses = {
    connected: "connected",
    disconnected: "disconnected",
    connecting: "connecting",
    error: "error",
  };

  const statusTexts = {
    connected: "Đã kết nối",
    disconnected: "Mất kết nối",
    connecting: "Đang kết nối...",
    error: "Lỗi kết nối",
  };

  return (
    <div className={`connection-item ${className}`}>
      <div className="connection-icon">{icon}</div>
      <div className="connection-info">
        <div className="connection-name">{name}</div>
        <div className="connection-status">
          <span
            className={`status-dot ${statusClasses[status] || "disconnected"}`}
          ></span>
          <span>{statusTexts[status] || statusTexts.disconnected}</span>
        </div>
      </div>
    </div>
  );
};

export default ConnectionItem;
