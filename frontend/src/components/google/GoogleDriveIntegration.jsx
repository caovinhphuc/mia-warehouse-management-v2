 
// Thêm vào sau các imports khác

import React, { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import {
  Modal,
  message,
  Input,
  Select,
  Button,
  Space,
  Card,
  Typography,
  Descriptions,
  Popconfirm,
  Tooltip,
  Breadcrumb,
} from "antd";
import FolderList from "./drive/FolderList";
import FileList from "./drive/FileList";
import {
  ShareAltOutlined,
  EditOutlined,
  DeleteOutlined,
  DownloadOutlined,
  EyeOutlined,
  FolderOutlined,
  FileOutlined,
  UploadOutlined,
  PlusOutlined,
  SearchOutlined,
  AppstoreOutlined,
  UnorderedListOutlined,
} from "@ant-design/icons";
import Loading from "../Common/Loading";
import { googleDriveApiService } from "../../services/googleDriveApi";
import "./GoogleDriveIntegration.css";

const { Option } = Select;
const { TextArea } = Input;
const { Title, Text } = Typography;

const GoogleDriveIntegration = () => {
  const { loading, error } = useSelector((state) => state.drive);

  const [currentFolder, setCurrentFolder] = useState(null);
  const [folderHistory, setFolderHistory] = useState([]); // For breadcrumb navigation
  const [files, setFiles] = useState([]);
  const [folders, setFolders] = useState([]);
  const [selectedItems, setSelectedItems] = useState([]);
  const [viewMode, setViewMode] = useState("grid");
  const [searchTerm, setSearchTerm] = useState("");
  const [isLoadingFiles, setIsLoadingFiles] = useState(false);
  const [filesError, setFilesError] = useState(null);

  // Modals
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showShareModal, setShowShareModal] = useState(false);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [showRenameModal, setShowRenameModal] = useState(false);
  const [showPreviewModal, setShowPreviewModal] = useState(false);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [previewType, setPreviewType] = useState(null);

  // Modal states
  const [createType, setCreateType] = useState("");
  const [newItemName, setNewItemName] = useState("");
  const [shareEmail, setShareEmail] = useState("");
  const [shareRole, setShareRole] = useState("writer");
  const [selectedItemForAction, setSelectedItemForAction] = useState(null);
  const [renameValue, setRenameValue] = useState("");

  // Helper function to format file size
  const formatFileSizeBytes = (bytes) => {
    if (!bytes) return "0 KB";
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(1024));
    return Math.round((bytes / Math.pow(1024, i)) * 100) / 100 + " " + sizes[i];
  };

  // Load files and folders from API
  const loadFiles = async () => {
    setIsLoadingFiles(true);
    setFilesError(null);
    try {
      const result = await googleDriveApiService.listFiles(
        currentFolder?.id,
        100
      );

      const driveFiles = [];
      const driveFolders = [];

      result.files.forEach((item) => {
        const fileItem = {
          id: item.id,
          name: item.name,
          type: item.mimeType,
          size: item.size ? formatFileSizeBytes(item.size) : "0 KB",
          sizeBytes: item.size,
          modifiedTime: item.modifiedTime,
          createdTime: item.createdTime,
          webViewLink: item.webViewLink,
        };

        if (item.mimeType === "application/vnd.google-apps.folder") {
          driveFolders.push(fileItem);
        } else {
          driveFiles.push(fileItem);
        }
      });

      setFiles(driveFiles);
      setFolders(driveFolders);
    } catch (err) {
      console.error("Failed to load files:", err);
      setFilesError(err.message);
      message.error(`Lỗi tải files: ${err.message}`);
      setFiles([]);
      setFolders([]);
    } finally {
      setIsLoadingFiles(false);
    }
  };

  useEffect(() => {
    loadFiles();
  }, [currentFolder]);

  const filteredFiles = files.filter((file) =>
    file.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredFolders = folders.filter((folder) =>
    folder.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleItemSelect = (itemId) => {
    setSelectedItems((prev) =>
      prev.includes(itemId)
        ? prev.filter((id) => id !== itemId)
        : [...prev, itemId]
    );
  };

  const handleFolderClick = (folder) => {
    // Add current folder to history
    if (currentFolder) {
      setFolderHistory((prev) => [...prev, currentFolder]);
    }
    setCurrentFolder(folder);
    setSelectedItems([]);
  };

  const handleBreadcrumbClick = (index) => {
    // Navigate to folder at index
    const newHistory = folderHistory.slice(0, index);
    const targetFolder = index === 0 ? null : folderHistory[index - 1];

    setFolderHistory(newHistory);
    setCurrentFolder(targetFolder);
    setSelectedItems([]);
  };

  const handleCreateItem = async () => {
    if (!newItemName.trim()) return;

    try {
      if (createType === "folder") {
        await googleDriveApiService.createFolder(
          newItemName,
          currentFolder?.id
        );
        message.success("Thư mục đã được tạo thành công!");
        await loadFiles();
      } else {
        message.info(
          'Tạo file mới cần upload file. Vui lòng dùng nút "Tải lên".'
        );
      }

      setNewItemName("");
      setShowCreateModal(false);
      setCreateType("");
    } catch (err) {
      console.error("Failed to create item:", err);
      message.error(`Lỗi: ${err.message}`);
    }
  };

  const handleDeleteItems = async () => {
    if (selectedItems.length === 0) return;

    try {
      await Promise.all(
        selectedItems.map((itemId) => googleDriveApiService.deleteFile(itemId))
      );

      message.success(`Đã xóa ${selectedItems.length} mục thành công!`);
      await loadFiles();
      setSelectedItems([]);
    } catch (err) {
      console.error("Failed to delete items:", err);
      message.error(`Lỗi xóa: ${err.message}`);
    }
  };

  const handleDownloadItems = async () => {
    if (selectedItems.length === 0) return;

    try {
      for (const itemId of selectedItems) {
        const item = [...files, ...folders].find((i) => i.id === itemId);
        if (item && item.type !== "application/vnd.google-apps.folder") {
          await googleDriveApiService.downloadFile(itemId);
        }
      }
      message.success(`Đã tải xuống ${selectedItems.length} file!`);
    } catch (err) {
      console.error("Failed to download items:", err);
      message.error(`Lỗi tải xuống: ${err.message}`);
    }
  };

  const handleShare = async () => {
    if (!shareEmail.trim() || !selectedItemForAction) return;

    try {
      await googleDriveApiService.shareFile(
        selectedItemForAction.id,
        shareEmail,
        shareRole
      );
      message.success(`Đã chia sẻ với ${shareEmail} thành công!`);
      setShowShareModal(false);
      setShareEmail("");
      setSelectedItemForAction(null);
    } catch (err) {
      console.error("Failed to share:", err);
      message.error(`Lỗi chia sẻ: ${err.message}`);
    }
  };

  const handleRename = async () => {
    if (!renameValue.trim() || !selectedItemForAction) return;

    try {
      await googleDriveApiService.renameFile(
        selectedItemForAction.id,
        renameValue.trim()
      );
      message.success("Đã đổi tên thành công!");
      setShowRenameModal(false);
      setRenameValue("");
      setSelectedItemForAction(null);
      await loadFiles();
    } catch (err) {
      console.error("Failed to rename:", err);
      message.error(`Lỗi đổi tên: ${err.message}`);
    }
  };

  const handleFileDetails = async (item) => {
    try {
      const metadata = await googleDriveApiService.getFileMetadata(item.id);
      setSelectedItemForAction({
        ...item,
        ...metadata,
        size: metadata.size ? formatFileSizeBytes(metadata.size) : "0 KB",
      });
      setShowDetailsModal(true);
    } catch (err) {
      console.error("Failed to get file details:", err);
      message.error(`Lỗi: ${err.message}`);
    }
  };

  const handlePreview = (item) => {
    const mimeType = item.type || "";

    // Check if file can be previewed
    if (mimeType.startsWith("image/")) {
      // For images, use webViewLink or webContentLink
      setPreviewUrl(item.webViewLink || item.webContentLink);
      setPreviewType("image");
      setShowPreviewModal(true);
    } else if (mimeType === "application/pdf") {
      // For PDFs, use webViewLink
      setPreviewUrl(item.webViewLink);
      setPreviewType("pdf");
      setShowPreviewModal(true);
    } else if (
      mimeType.startsWith("text/") ||
      mimeType.includes("json") ||
      mimeType.includes("xml")
    ) {
      // For text files, we'll need to fetch content
      setPreviewUrl(item.webViewLink);
      setPreviewType("text");
      setShowPreviewModal(true);
    } else if (
      mimeType.includes("spreadsheet") ||
      mimeType.includes("document") ||
      mimeType.includes("presentation")
    ) {
      // Google Docs/Sheets/Slides - use webViewLink
      setPreviewUrl(item.webViewLink);
      setPreviewType("google");
      setShowPreviewModal(true);
    } else {
      message.info(
        "File preview không khả dụng cho loại file này. Vui lòng tải xuống để xem."
      );
    }
  };

  const handleUpload = async (file) => {
    try {
      await googleDriveApiService.uploadFile(
        file,
        file.name,
        file.type,
        currentFolder?.id
      );
      message.success("Upload thành công!");
      await loadFiles();
    } catch (err) {
      console.error("Upload failed:", err);
      message.error(`Lỗi upload: ${err.message}`);
    }
  };

  const getFileIcon = (type) => {
    if (type.includes("spreadsheet")) return "📊";
    if (type.includes("document")) return "📄";
    if (type.includes("pdf")) return "📕";
    if (type.includes("image")) return "🖼️";
    if (type.includes("video")) return "🎥";
    if (type.includes("audio")) return "🎵";
    if (type.includes("folder")) return "📁";
    return "📄";
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("vi-VN", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  if (loading || isLoadingFiles)
    return <Loading text="Đang tải Google Drive..." />;
  if (error || filesError) {
    return (
      <div className="error-state">
        <h3>Lỗi kết nối Google Drive</h3>
        <p>{error || filesError}</p>
        <Button onClick={() => window.location.reload()}>Thử lại</Button>
      </div>
    );
  }

  // Breadcrumb items
  const breadcrumbItems = [
    {
      title: (
        <Button
          type="link"
          onClick={() => {
            setCurrentFolder(null);
            setFolderHistory([]);
            setSelectedItems([]);
          }}
          style={{ padding: 0 }}
        >
          Drive của tôi
        </Button>
      ),
    },
    ...folderHistory.map((folder, index) => ({
      title: (
        <Button
          type="link"
          onClick={() => handleBreadcrumbClick(index + 1)}
          style={{ padding: 0 }}
        >
          {folder.name}
        </Button>
      ),
    })),
    ...(currentFolder
      ? [
          {
            title: <Text>{currentFolder.name}</Text>,
          },
        ]
      : []),
  ];

  return (
    <div className="drive-integration-container">
      {/* Header */}
      <div className="drive-header">
        <div className="header-left">
          <Title level={2} style={{ margin: 0 }}>
            📁 Google Drive
          </Title>
          <Breadcrumb items={breadcrumbItems} style={{ marginTop: 8 }} />
        </div>

        <div className="header-right">
          <Space>
            <Tooltip title="Grid view">
              <Button
                icon={<AppstoreOutlined />}
                type={viewMode === "grid" ? "primary" : "default"}
                onClick={() => setViewMode("grid")}
              />
            </Tooltip>
            <Tooltip title="List view">
              <Button
                icon={<UnorderedListOutlined />}
                type={viewMode === "list" ? "primary" : "default"}
                onClick={() => setViewMode("list")}
              />
            </Tooltip>
            <Button
              type="primary"
              icon={<PlusOutlined />}
              onClick={() => {
                setCreateType("folder");
                setShowCreateModal(true);
              }}
            >
              Tạo thư mục
            </Button>
            <input
              type="file"
              id="file-upload"
              style={{ display: "none" }}
              onChange={async (e) => {
                const file = e.target.files[0];
                if (!file) return;
                await handleUpload(file);
                e.target.value = "";
              }}
              multiple
            />
            <Button
              type="primary"
              icon={<UploadOutlined />}
              onClick={() => document.getElementById("file-upload").click()}
            >
              Tải lên
            </Button>
          </Space>
        </div>
      </div>

      {/* Toolbar */}
      <div className="drive-toolbar">
        <div className="toolbar-left">
          <Input
            placeholder="Tìm kiếm tệp tin và thư mục..."
            prefix={<SearchOutlined />}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{ width: 300 }}
          />
        </div>

        <div className="toolbar-right">
          <Space>
            {selectedItems.length > 0 && (
              <>
                <Text>{selectedItems.length} mục đã chọn</Text>
                <Popconfirm
                  title={`Xóa ${selectedItems.length} mục đã chọn?`}
                  onConfirm={handleDeleteItems}
                  okText="Xóa"
                  cancelText="Hủy"
                >
                  <Button danger icon={<DeleteOutlined />}>
                    Xóa
                  </Button>
                </Popconfirm>
                <Button
                  icon={<DownloadOutlined />}
                  onClick={handleDownloadItems}
                >
                  Tải xuống
                </Button>
              </>
            )}
          </Space>
        </div>
      </div>

      {/* Content */}
      <div className="drive-content">
        {/* Folders */}
        {filteredFolders.length > 0 && (
          <div className="folders-section">
            <Title level={4}>📁 Thư mục</Title>
            <div className={`items-grid ${viewMode}`}>
              {filteredFolders.map((folder) => (
                <Card
                  key={folder.id}
                  hoverable
                  className={`item-card ${
                    selectedItems.includes(folder.id) ? "selected" : ""
                  }`}
                  onClick={() => handleItemSelect(folder.id)}
                  onDoubleClick={() => handleFolderClick(folder)}
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
                      <div className="item-meta">
                        {formatDate(folder.modifiedTime)}
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
                            icon={<FolderOutlined />}
                            onClick={() => handleFolderClick(folder)}
                          />
                        </Tooltip>
                        <Tooltip title="Chi tiết">
                          <Button
                            type="text"
                            icon={<EyeOutlined />}
                            onClick={() => handleFileDetails(folder)}
                          />
                        </Tooltip>
                        <Tooltip title="Chia sẻ">
                          <Button
                            type="text"
                            icon={<ShareAltOutlined />}
                            onClick={() => {
                              setSelectedItemForAction(folder);
                              setShowShareModal(true);
                            }}
                          />
                        </Tooltip>
                        <Tooltip title="Đổi tên">
                          <Button
                            type="text"
                            icon={<EditOutlined />}
                            onClick={() => {
                              setSelectedItemForAction(folder);
                              setRenameValue(folder.name);
                              setShowRenameModal(true);
                            }}
                          />
                        </Tooltip>
                      </Space>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </div>
        )}

        {/* Files */}
        {filteredFiles.length > 0 && (
          <div className="files-section">
            <Title level={4}>📄 Tệp tin</Title>
            <div className={`items-grid ${viewMode}`}>
              {filteredFiles.map((file) => (
                <Card
                  key={file.id}
                  hoverable
                  className={`item-card ${
                    selectedItems.includes(file.id) ? "selected" : ""
                  }`}
                  onClick={() => handleItemSelect(file.id)}
                  onDoubleClick={() => window.open(file.webViewLink, "_blank")}
                  style={{ cursor: "pointer" }}
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
                            onClick={() =>
                              window.open(file.webViewLink, "_blank")
                            }
                          />
                        </Tooltip>
                        <Tooltip title="Tải xuống">
                          <Button
                            type="text"
                            icon={<DownloadOutlined />}
                            onClick={async () => {
                              try {
                                await googleDriveApiService.downloadFile(
                                  file.id
                                );
                                message.success("Đã tải xuống thành công!");
                              } catch (err) {
                                message.error(`Lỗi: ${err.message}`);
                              }
                            }}
                          />
                        </Tooltip>
                        <Tooltip title="Chi tiết">
                          <Button
                            type="text"
                            icon={<FileOutlined />}
                            onClick={() => handleFileDetails(file)}
                          />
                        </Tooltip>
                        <Tooltip title="Chia sẻ">
                          <Button
                            type="text"
                            icon={<ShareAltOutlined />}
                            onClick={() => {
                              setSelectedItemForAction(file);
                              setShowShareModal(true);
                            }}
                          />
                        </Tooltip>
                        <Tooltip title="Đổi tên">
                          <Button
                            type="text"
                            icon={<EditOutlined />}
                            onClick={() => {
                              setSelectedItemForAction(file);
                              setRenameValue(file.name);
                              setShowRenameModal(true);
                            }}
                          />
                        </Tooltip>
                      </Space>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </div>
        )}

        {filteredFiles.length === 0 && filteredFolders.length === 0 && (
          <div className="empty-state">
            <div className="empty-icon">📁</div>
            <Title level={3}>Không có tệp tin nào</Title>
            <Text>Tạo thư mục hoặc tải lên tệp tin để bắt đầu</Text>
          </div>
        )}
      </div>

      {/* Create Modal */}
      <Modal
        title={createType === "folder" ? "Tạo thư mục mới" : "Tạo tệp tin mới"}
        open={showCreateModal}
        onOk={handleCreateItem}
        onCancel={() => {
          setShowCreateModal(false);
          setNewItemName("");
        }}
        okText="Tạo"
        cancelText="Hủy"
      >
        <Input
          placeholder={createType === "folder" ? "Tên thư mục" : "Tên tệp tin"}
          value={newItemName}
          onChange={(e) => setNewItemName(e.target.value)}
          onPressEnter={handleCreateItem}
          autoFocus
        />
      </Modal>

      {/* Share Modal */}
      <Modal
        title="Chia sẻ file/folder"
        open={showShareModal}
        onOk={handleShare}
        onCancel={() => {
          setShowShareModal(false);
          setShareEmail("");
          setSelectedItemForAction(null);
        }}
        okText="Chia sẻ"
        cancelText="Hủy"
      >
        <Space orientation="vertical" style={{ width: "100%" }}>
          <div>
            <Text strong>File/Folder: </Text>
            <Text>{selectedItemForAction?.name}</Text>
          </div>
          <Input
            placeholder="Email người nhận"
            type="email"
            value={shareEmail}
            onChange={(e) => setShareEmail(e.target.value)}
            onPressEnter={handleShare}
          />
          <Select
            value={shareRole}
            onChange={setShareRole}
            style={{ width: "100%" }}
          >
            <Option value="reader">Reader (Chỉ đọc)</Option>
            <Option value="writer">Writer (Chỉnh sửa)</Option>
            <Option value="commenter">Commenter (Bình luận)</Option>
          </Select>
        </Space>
      </Modal>

      {/* Rename Modal */}
      <Modal
        title="Đổi tên"
        open={showRenameModal}
        onOk={handleRename}
        onCancel={() => {
          setShowRenameModal(false);
          setRenameValue("");
          setSelectedItemForAction(null);
        }}
        okText="Đổi tên"
        cancelText="Hủy"
      >
        <Input
          placeholder="Tên mới"
          value={renameValue}
          onChange={(e) => setRenameValue(e.target.value)}
          onPressEnter={handleRename}
          autoFocus
        />
      </Modal>

      {/* File Details Modal */}
      <Modal
        title="Chi tiết file/folder"
        open={showDetailsModal}
        onCancel={() => {
          setShowDetailsModal(false);
          setSelectedItemForAction(null);
        }}
        footer={[
          <Button
            key="share"
            icon={<ShareAltOutlined />}
            onClick={() => {
              setShowDetailsModal(false);
              setShowShareModal(true);
            }}
          >
            Chia sẻ
          </Button>,
          <Button
            key="rename"
            icon={<EditOutlined />}
            onClick={() => {
              setShowDetailsModal(false);
              setRenameValue(selectedItemForAction?.name || "");
              setShowRenameModal(true);
            }}
          >
            Đổi tên
          </Button>,
          selectedItemForAction?.type !==
            "application/vnd.google-apps.folder" && (
            <Button
              key="download"
              icon={<DownloadOutlined />}
              onClick={async () => {
                try {
                  await googleDriveApiService.downloadFile(
                    selectedItemForAction.id
                  );
                  message.success("Đã tải xuống thành công!");
                } catch (err) {
                  message.error(`Lỗi: ${err.message}`);
                }
              }}
            >
              Tải xuống
            </Button>
          ),
          <Popconfirm
            key="delete"
            title="Xóa file/folder này?"
            onConfirm={async () => {
              try {
                await googleDriveApiService.deleteFile(
                  selectedItemForAction.id
                );
                message.success("Đã xóa thành công!");
                setShowDetailsModal(false);
                setSelectedItemForAction(null);
                await loadFiles();
              } catch (err) {
                message.error(`Lỗi: ${err.message}`);
              }
            }}
            okText="Xóa"
            cancelText="Hủy"
          >
            <Button danger icon={<DeleteOutlined />}>
              Xóa
            </Button>
          </Popconfirm>,
        ]}
        width={600}
      >
        {selectedItemForAction && (
          <Descriptions bordered column={1}>
            <Descriptions.Item label="Tên">
              {selectedItemForAction.name}
            </Descriptions.Item>
            <Descriptions.Item label="Loại">
              {selectedItemForAction.type}
            </Descriptions.Item>
            {selectedItemForAction.size && (
              <Descriptions.Item label="Kích thước">
                {selectedItemForAction.size}
              </Descriptions.Item>
            )}
            <Descriptions.Item label="Ngày tạo">
              {formatDate(selectedItemForAction.createdTime)}
            </Descriptions.Item>
            <Descriptions.Item label="Ngày sửa">
              {formatDate(selectedItemForAction.modifiedTime)}
            </Descriptions.Item>
            {selectedItemForAction.webViewLink && (
              <Descriptions.Item label="Link">
                <a
                  href={selectedItemForAction.webViewLink}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Mở trong Google Drive
                </a>
              </Descriptions.Item>
            )}
          </Descriptions>
        )}
      </Modal>

      {/* Preview Modal */}
      <Modal
        title={`Xem trước: ${selectedItemForAction?.name || ""}`}
        open={showPreviewModal}
        onCancel={() => {
          setShowPreviewModal(false);
          setPreviewUrl(null);
          setPreviewType(null);
          setSelectedItemForAction(null);
        }}
        footer={[
          <Button
            key="open"
            onClick={() => {
              if (previewUrl) {
                window.open(previewUrl, "_blank");
              }
            }}
          >
            Mở trong tab mới
          </Button>,
          <Button
            key="download"
            icon={<DownloadOutlined />}
            onClick={async () => {
              if (selectedItemForAction) {
                try {
                  await googleDriveApiService.downloadFile(
                    selectedItemForAction.id
                  );
                  message.success("Đã tải xuống thành công!");
                } catch (err) {
                  message.error(`Lỗi: ${err.message}`);
                }
              }
            }}
          >
            Tải xuống
          </Button>,
        ]}
        width={800}
        style={{ top: 20 }}
      >
        <div style={{ maxHeight: "70vh", overflow: "auto" }}>
          {previewType === "image" && previewUrl && (
            <img
              src={previewUrl}
              alt="Preview"
              loading="lazy"
              decoding="async"
              style={{
                width: "100%",
                height: "auto",
                maxHeight: "70vh",
                objectFit: "contain",
              }}
            />
          )}
          {previewType === "pdf" && previewUrl && (
            <iframe
              src={previewUrl}
              style={{ width: "100%", height: "70vh", border: "none" }}
              title="PDF Preview"
            />
          )}
          {previewType === "google" && previewUrl && (
            <iframe
              src={previewUrl}
              style={{ width: "100%", height: "70vh", border: "none" }}
              title="Google Docs Preview"
            />
          )}
          {previewType === "text" && previewUrl && (
            <div style={{ padding: 16 }}>
              <Text>File text preview không khả dụng trực tiếp. Vui lòng:</Text>
              <Space orientation="vertical" style={{ marginTop: 16 }}>
                <Button onClick={() => window.open(previewUrl, "_blank")}>
                  Mở trong Google Drive
                </Button>
                <Button
                  icon={<DownloadOutlined />}
                  onClick={async () => {
                    if (selectedItemForAction) {
                      try {
                        await googleDriveApiService.downloadFile(
                          selectedItemForAction.id
                        );
                        message.success("Đã tải xuống thành công!");
                      } catch (err) {
                        message.error(`Lỗi: ${err.message}`);
                      }
                    }
                  }}
                >
                  Tải xuống để xem
                </Button>
              </Space>
            </div>
          )}
        </div>
      </Modal>
    </div>
  );
};

export default GoogleDriveIntegration;
