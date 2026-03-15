/**
 * LayoutConfigButton - Nút mở Layout Configuration Manager
 * Icon 4 ô vuông, tooltip, hiệu ứng hover
 */
import React from "react";
import { Tooltip } from "antd";
import { AppstoreOutlined } from "@ant-design/icons";
import "./LayoutConfigButton.css";

const LayoutConfigButton = ({ onClick }) => {
  return (
    <Tooltip
      title={
        <span>
          Cấu hình Layout
          <br />
          Quản lý hiển thị và bố cục
        </span>
      }
      placement="bottom"
    >
      <button
        type="button"
        className="layout-config-btn action-btn"
        onClick={onClick}
        aria-label="Cấu hình Layout"
      >
        <span className="layout-config-btn-icon">
          <AppstoreOutlined style={{ fontSize: 20 }} />
        </span>
        <span className="layout-config-btn-badge" />
      </button>
    </Tooltip>
  );
};

export default LayoutConfigButton;
