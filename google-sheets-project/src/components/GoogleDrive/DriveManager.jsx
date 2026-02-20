import React, { useState } from "react";
import { useGoogleDrive } from "../../hooks/useGoogleDrive";
import DriveUploader from "./DriveUploader.jsx";

const DriveManager = ({ folderId }) => {
  const {
    files,
    loading,
    error,
    listFiles,
    createFolder,
    deleteFile,
    clearError,
  } = useGoogleDrive();

  const [activeTab, setActiveTab] = useState("files");
  const [newFolderName, setNewFolderName] = useState("");

  const tabStyle = (isActive) => ({
    padding: "10px 20px",
    margin: "0 5px",
    border: "1px solid #ddd",
    backgroundColor: isActive ? "#1976d2" : "#f5f5f5",
    color: isActive ? "white" : "#333",
    cursor: "pointer",
    borderRadius: "4px 4px 0 0",
  });

  const handleListFiles = async () => {
    try {
      clearError();
      await listFiles(folderId, 50);
    } catch (err) {
      console.error("Failed to list files:", err);
    }
  };

  const handleCreateFolder = async () => {
    if (!newFolderName.trim()) return;

    try {
      clearError();
      await createFolder(newFolderName, folderId);
      setNewFolderName("");
      // Refresh file list
      await listFiles(folderId, 50);
    } catch (err) {
      console.error("Failed to create folder:", err);
    }
  };

  const handleDeleteFile = async (fileId, fileName) => {
    if (!window.confirm(`Are you sure you want to delete "${fileName}"?`)) {
      return;
    }

    try {
      clearError();
      await deleteFile(fileId);
      // Refresh file list
      await listFiles(folderId, 50);
    } catch (err) {
      console.error("Failed to delete file:", err);
    }
  };

  const formatFileSize = (bytes) => {
    if (!bytes) return "N/A";
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(1024));
    return Math.round((bytes / Math.pow(1024, i)) * 100) / 100 + " " + sizes[i];
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleString();
  };

  return (
    <div style={{ maxWidth: "1200px", margin: "0 auto", padding: "20px" }}>
      <h2>💾 Google Drive Manager</h2>

      {/* Action Buttons */}
      <div style={{ marginBottom: "20px" }}>
        <button
          onClick={handleListFiles}
          disabled={loading}
          style={{
            padding: "10px 20px",
            backgroundColor: "#4caf50",
            color: "white",
            border: "none",
            borderRadius: "4px",
            cursor: loading ? "not-allowed" : "pointer",
            marginRight: "10px",
          }}
        >
          {loading ? "Loading..." : "📁 List Files"}
        </button>

        <div style={{ display: "inline-block", marginLeft: "20px" }}>
          <input
            type="text"
            value={newFolderName}
            onChange={(e) => setNewFolderName(e.target.value)}
            placeholder="New folder name"
            style={{ padding: "8px", marginRight: "10px" }}
          />
          <button
            onClick={handleCreateFolder}
            disabled={loading || !newFolderName.trim()}
            style={{
              padding: "8px 16px",
              backgroundColor: "#ff9800",
              color: "white",
              border: "none",
              borderRadius: "4px",
              cursor: loading ? "not-allowed" : "pointer",
            }}
          >
            📁 Create Folder
          </button>
        </div>
      </div>

      {/* Status */}
      {error && (
        <div
          style={{
            backgroundColor: "#ffebee",
            border: "1px solid #f44336",
            borderRadius: "4px",
            padding: "10px",
            marginBottom: "15px",
            color: "#f44336",
          }}
        >
          <strong>Error:</strong> {error}
        </div>
      )}

      {/* Tab Navigation */}
      <div style={{ marginBottom: "20px", borderBottom: "1px solid #ddd" }}>
        <button
          style={tabStyle(activeTab === "files")}
          onClick={() => setActiveTab("files")}
        >
          📁 Files & Folders
        </button>
        <button
          style={tabStyle(activeTab === "upload")}
          onClick={() => setActiveTab("upload")}
        >
          ⬆️ Upload Files
        </button>
      </div>

      {/* Tab Content */}
      <div
        style={{
          backgroundColor: "white",
          borderRadius: "0 4px 4px 4px",
          boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
          minHeight: "400px",
        }}
      >
        {activeTab === "files" && (
          <div style={{ padding: "20px" }}>
            {files.length > 0 ? (
              <div>
                <h4>Files & Folders ({files.length})</h4>
                <div style={{ overflowX: "auto" }}>
                  <table style={{ width: "100%", borderCollapse: "collapse" }}>
                    <thead>
                      <tr style={{ backgroundColor: "#f5f5f5" }}>
                        <th
                          style={{
                            border: "1px solid #ddd",
                            padding: "8px",
                            textAlign: "left",
                          }}
                        >
                          Name
                        </th>
                        <th
                          style={{
                            border: "1px solid #ddd",
                            padding: "8px",
                            textAlign: "left",
                          }}
                        >
                          Type
                        </th>
                        <th
                          style={{
                            border: "1px solid #ddd",
                            padding: "8px",
                            textAlign: "left",
                          }}
                        >
                          Size
                        </th>
                        <th
                          style={{
                            border: "1px solid #ddd",
                            padding: "8px",
                            textAlign: "left",
                          }}
                        >
                          Modified
                        </th>
                        <th
                          style={{
                            border: "1px solid #ddd",
                            padding: "8px",
                            textAlign: "left",
                          }}
                        >
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {files.map((file) => (
                        <tr key={file.id}>
                          <td
                            style={{ border: "1px solid #ddd", padding: "8px" }}
                          >
                            <a
                              href={file.webViewLink}
                              target="_blank"
                              rel="noopener noreferrer"
                              style={{
                                textDecoration: "none",
                                color: "#1976d2",
                              }}
                            >
                              {file.name}
                            </a>
                          </td>
                          <td
                            style={{ border: "1px solid #ddd", padding: "8px" }}
                          >
                            {file.mimeType.includes("folder")
                              ? "📁 Folder"
                              : "📄 File"}
                          </td>
                          <td
                            style={{ border: "1px solid #ddd", padding: "8px" }}
                          >
                            {formatFileSize(file.size)}
                          </td>
                          <td
                            style={{ border: "1px solid #ddd", padding: "8px" }}
                          >
                            {formatDate(file.modifiedTime)}
                          </td>
                          <td
                            style={{ border: "1px solid #ddd", padding: "8px" }}
                          >
                            <button
                              onClick={() =>
                                handleDeleteFile(file.id, file.name)
                              }
                              disabled={loading}
                              style={{
                                padding: "5px 10px",
                                backgroundColor: "#f44336",
                                color: "white",
                                border: "none",
                                borderRadius: "3px",
                                cursor: loading ? "not-allowed" : "pointer",
                              }}
                            >
                              🗑️ Delete
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            ) : (
              <div
                style={{
                  textAlign: "center",
                  padding: "40px",
                  color: "#666",
                }}
              >
                <p>
                  No files found. Click "List Files" to load files from your
                  Drive folder.
                </p>
              </div>
            )}
          </div>
        )}

        {activeTab === "upload" && (
          <div style={{ padding: "20px" }}>
            <DriveUploader
              folderId={folderId}
              onUploadComplete={handleListFiles}
            />
          </div>
        )}
      </div>

      {/* Summary */}
      {files.length > 0 && (
        <div
          style={{
            marginTop: "20px",
            backgroundColor: "#e3f2fd",
            border: "1px solid #2196f3",
            borderRadius: "4px",
            padding: "15px",
          }}
        >
          <h4>📊 Summary:</h4>
          <p>
            <strong>Total items:</strong> {files.length}
          </p>
          <p>
            <strong>Folders:</strong>{" "}
            {files.filter((f) => f.mimeType.includes("folder")).length}
          </p>
          <p>
            <strong>Files:</strong>{" "}
            {files.filter((f) => !f.mimeType.includes("folder")).length}
          </p>
        </div>
      )}
    </div>
  );
};

export default DriveManager;
