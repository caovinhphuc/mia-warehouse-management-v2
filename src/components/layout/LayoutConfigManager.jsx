/**
 * LayoutConfigManager - Modal quản lý cấu hình layout và widget theo trang
 */
import React, { useState, useMemo } from "react";
import { Modal, Input, Button } from "antd";
import {
  SettingOutlined,
  EyeOutlined,
  EyeInvisibleOutlined,
  UndoOutlined,
} from "@ant-design/icons";
import { useLayout } from "../../contexts/LayoutContext";
import "./LayoutConfigManager.css";

const LayoutConfigManager = ({ isOpen, onClose }) => {
  const {
    getPageList,
    getWidgets,
    toggleWidgetVisibility,
    resetLayout,
    resetAllLayouts,
    VIEW_MODES,
  } = useLayout();
  const [selectedPage, setSelectedPage] = useState("/dashboard");
  const [viewMode, setViewMode] = useState(VIEW_MODES.desktop);
  const [searchText, setSearchText] = useState("");

  const pageList = useMemo(() => getPageList(), []);
  const categoryLabels = {
    main: "Điều hướng",
    integrations: "Tích hợp",
    tools: "Công cụ",
    other: "Khác",
  };
  const categories = useMemo(() => {
    const catOrder = ["main", "integrations", "tools", "other"];
    return catOrder.filter((c) => pageList[c]?.length);
  }, [pageList]);

  const filteredPages = useMemo(() => {
    if (!searchText.trim()) return pageList;
    const q = searchText.toLowerCase();
    const out = {};
    Object.entries(pageList).forEach(([cat, pages]) => {
      const filtered = pages.filter(
        (p) =>
          p.label?.toLowerCase().includes(q) ||
          p.path?.toLowerCase().includes(q)
      );
      if (filtered.length) out[cat] = filtered;
    });
    return out;
  }, [pageList, searchText]);

  const widgets = getWidgets(selectedPage, viewMode);

  const handleReset = () => {
    resetLayout(selectedPage);
  };

  const handleResetAll = () => {
    Modal.confirm({
      title: "Đặt lại tất cả layout?",
      content: "Toàn bộ cấu hình tùy chỉnh của tất cả trang sẽ bị xóa.",
      okText: "Đặt lại",
      okType: "danger",
      cancelText: "Hủy",
      onOk: () => {
        resetAllLayouts();
        onClose();
      },
    });
  };

  return (
    <Modal
      open={isOpen}
      onCancel={onClose}
      footer={null}
      width="min(90vw, 1152px)"
      className="layout-config-modal"
      destroyOnHidden
      maskClosable
    >
      <div className="layout-config-manager">
        <div className="layout-config-header">
          <span className="layout-config-title">
            <SettingOutlined /> Cấu hình Layout
          </span>
          <Button type="text" icon={<UndoOutlined />} onClick={handleReset}>
            Đặt lại trang hiện tại
          </Button>
        </div>

        <div className="layout-config-grid">
          {/* Sidebar - danh sách trang */}
          <aside className="layout-config-sidebar">
            <Input.Search
              placeholder="Tìm trang..."
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
              allowClear
              className="layout-config-search"
            />
            <div className="layout-config-page-list">
              {categories.map((cat) => (
                <div key={cat} className="layout-config-category">
                  <div className="layout-config-category-title">
                    {categoryLabels[cat] || cat}
                  </div>
                  {(filteredPages[cat] || []).map((page) => (
                    <div
                      key={page.path}
                      className={`layout-config-page-item ${
                        selectedPage === page.path ? "active" : ""
                      }`}
                      onClick={() => setSelectedPage(page.path)}
                    >
                      <span className="page-icon">{page.icon}</span>
                      <span className="page-label">{page.label}</span>
                    </div>
                  ))}
                </div>
              ))}
            </div>
            <Button
              danger
              block
              onClick={handleResetAll}
              className="layout-config-reset-all"
            >
              Đặt lại tất cả
            </Button>
          </aside>

          {/* Nội dung chính */}
          <main className="layout-config-main">
            {/* View mode selector */}
            <div className="layout-config-view-modes">
              <Button
                type={viewMode === VIEW_MODES.mobile ? "primary" : "default"}
                onClick={() => setViewMode(VIEW_MODES.mobile)}
                className="view-mode-btn mobile"
              >
                📱 Mobile
              </Button>
              <Button
                type={viewMode === VIEW_MODES.tablet ? "primary" : "default"}
                onClick={() => setViewMode(VIEW_MODES.tablet)}
                className="view-mode-btn tablet"
              >
                📟 Tablet
              </Button>
              <Button
                type={viewMode === VIEW_MODES.desktop ? "primary" : "default"}
                onClick={() => setViewMode(VIEW_MODES.desktop)}
                className="view-mode-btn desktop"
              >
                🖥️ Desktop
              </Button>
            </div>

            {/* Widget management */}
            <div className="layout-config-widgets">
              <h4>Quản lý widget hiện tại</h4>
              {widgets.length === 0 ? (
                <p className="layout-config-empty">
                  Không có widget nào cho trang này.
                </p>
              ) : (
                <div className="widget-list">
                  {widgets.map((w) => (
                    <div
                      key={w.id}
                      className={`widget-card ${
                        w.visible ? "visible" : "hidden"
                      }`}
                    >
                      <div className="widget-info">
                        <span className="widget-icon">
                          {w.visible ? (
                            <EyeOutlined />
                          ) : (
                            <EyeInvisibleOutlined />
                          )}
                        </span>
                        <div>
                          <div className="widget-label">{w.label}</div>
                          <div className="widget-meta">
                            Vị trí: {w.row},{w.col} | Kích thước: {w.width}x
                            {w.height}
                          </div>
                        </div>
                      </div>
                      <Button
                        type={w.visible ? "default" : "primary"}
                        size="small"
                        onClick={() =>
                          toggleWidgetVisibility(selectedPage, viewMode, w.id)
                        }
                      >
                        {w.visible ? "Ẩn" : "Hiện"}
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Layout preview */}
            <div className="layout-config-preview">
              <h4>Xem trước bố cục</h4>
              <div
                className="layout-preview-grid"
                style={{
                  gridTemplateColumns: `repeat(${
                    viewMode === "mobile" ? 1 : viewMode === "tablet" ? 3 : 4
                  }, 1fr)`,
                }}
              >
                {widgets
                  .filter((w) => w.visible)
                  .map((w) => (
                    <div
                      key={w.id}
                      className="layout-preview-cell"
                      style={{
                        gridColumn: `span ${Math.min(
                          w.width,
                          viewMode === "mobile"
                            ? 1
                            : viewMode === "tablet"
                            ? 3
                            : 4
                        )}`,
                        gridRow: `span ${w.height}`,
                      }}
                    >
                      {w.label}
                    </div>
                  ))}
              </div>
            </div>
          </main>
        </div>
      </div>
    </Modal>
  );
};

export default LayoutConfigManager;
