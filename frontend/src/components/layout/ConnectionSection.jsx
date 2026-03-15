import React from "react";
import ConnectionItem from "./ConnectionItem";

const ConnectionSection = ({
  connections = [],
  expanded = false,
  onToggle,
  className = "",
}) => {
  if (!connections || connections.length === 0) {
    return null;
  }

  return (
    <div className={`sidebar-footer ${className}`}>
      <div className="connection-status-section">
        <div
          className="connection-status-header"
          onClick={onToggle}
          role="button"
          tabIndex={0}
          onKeyDown={(e) => {
            if (e.key === "Enter" || e.key === " ") {
              e.preventDefault();
              onToggle();
            }
          }}
          aria-expanded={expanded}
          aria-label={`${expanded ? "Đóng" : "Mở"} trạng thái kết nối`}
        >
          <h4 className="connection-title">Trạng thái kết nối</h4>
          <span className="expand-icon">{expanded ? "▼" : "▶"}</span>
        </div>

        {expanded && (
          <div className="connection-items">
            {connections.map((connection, index) => (
              <ConnectionItem
                key={connection.name || index}
                name={connection.name}
                icon={connection.icon}
                status={connection.status}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default ConnectionSection;
