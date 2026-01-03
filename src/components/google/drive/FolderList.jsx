import React from 'react';
import { Card, Typography } from 'antd';
import { FolderOutlined } from '@ant-design/icons';

const { Title } = Typography;

/**
 * FolderList Component
 * Hiển thị danh sách thư mục từ Google Drive
 */
const FolderList = ({ 
  folders = [], 
  selectedItems = [],
  viewMode = 'grid',
  onFolderClick,
  onItemSelect 
}) => {
  if (folders.length === 0) {
    return null;
  }

  return (
    <div className="folders-section">
      <Title level={4}>📁 Thư mục</Title>
      <div className={`items-grid ${viewMode}`}>
        {folders.map((folder) => (
          <Card
            key={folder.id}
            hoverable
            className={`item-card ${
              selectedItems.includes(folder.id) ? "selected" : ""
            }`}
            onClick={() => onItemSelect(folder.id)}
            onDoubleClick={() => onFolderClick(folder)}
            style={{ cursor: "pointer" }}
          >
            <div className="item-content">
              <div className="item-icon">
                <FolderOutlined
                  style={{ fontSize: 32, color: "#1890ff" }}
                />
              </div>
              <div className="item-info">
                <div className="item-name">{folder.name}</div>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default FolderList;
