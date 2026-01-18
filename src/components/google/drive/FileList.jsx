import React from 'react';
import { Card, Typography, Button, Tooltip, Space } from 'antd';
import { EyeOutlined } from '@ant-design/icons';

const { Title } = Typography;

/**
 * FileList Component
 * Hiển thị danh sách files từ Google Drive
 */
const FileList = ({
  files = [],
  selectedItems = [],
  viewMode = 'grid',
  onItemSelect,
  getFileIcon,
  formatDate,
}) => {
  if (files.length === 0) {
    return null;
  }

  return (
    <div className="files-section">
      <Title level={4}>📄 Tệp tin</Title>
      <div className={`items-grid ${viewMode}`}>
        {files.map((file) => (
          <Card
            key={file.id}
            hoverable
            className={`item-card ${
              selectedItems.includes(file.id) ? 'selected' : ''
            }`}
            onClick={() => onItemSelect(file.id)}
            onDoubleClick={() => window.open(file.webViewLink, '_blank')}
            style={{ cursor: 'pointer' }}
          >
            <div className="item-content">
              <div className="item-icon">{getFileIcon(file.type)}</div>
              <div className="item-info">
                <div className="item-name">{file.name}</div>
                <div className="item-meta">
                  {file.size} • {formatDate(file.modifiedTime)}
                </div>
              </div>
              <div
                className="item-actions"
                onClick={(e) => e.stopPropagation()}
              >
                <Space>
                  <Tooltip title="Mở">
                    <Button
                      type="text"
                      icon={<EyeOutlined />}
                      onClick={() => window.open(file.webViewLink, '_blank')}
                    />
                  </Tooltip>
                  {/* Thêm các actions khác nếu cần */}
                </Space>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default FileList;
