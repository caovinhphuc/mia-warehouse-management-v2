import React, { useState, useEffect } from "react";
import { googleDriveApiService } from "../../services/googleDriveApi";

const FileViewer = ({ fileId, fileName }) => {
  const [fileMetadata, setFileMetadata] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleGetFileMetadata = React.useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const metadata = await googleDriveApiService.getFileMetadata(fileId);
      setFileMetadata(metadata);
    } catch (err) {
      setError(`Failed to get file metadata: ${err.message}`);
    } finally {
      setLoading(false);
    }
  }, [fileId]);

  useEffect(() => {
    if (fileId) {
      handleGetFileMetadata();
    }
  }, [fileId, handleGetFileMetadata]);

  const formatFileSize = (bytes) => {
    if (!bytes) return "N/A";
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(1024));
    return Math.round((bytes / Math.pow(1024, i)) * 100) / 100 + " " + sizes[i];
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleString();
  };

  const getFileTypeIcon = (mimeType) => {
    if (mimeType.includes("folder")) return "📁";
    if (mimeType.includes("image")) return "🖼️";
    if (mimeType.includes("video")) return "🎥";
    if (mimeType.includes("audio")) return "🎵";
    if (mimeType.includes("pdf")) return "📄";
    if (mimeType.includes("word")) return "📝";
    if (mimeType.includes("excel") || mimeType.includes("spreadsheet"))
      return "📊";
    if (mimeType.includes("presentation")) return "📋";
    if (mimeType.includes("text")) return "📄";
    return "📄";
  };

  const canPreview = (mimeType) => {
    return (
      mimeType.includes("image") ||
      mimeType.includes("pdf") ||
      mimeType.includes("text") ||
      mimeType.includes("spreadsheet") ||
      mimeType.includes("document")
    );
  };

  if (!fileId) {
    return (
      <div style={{ padding: "20px", textAlign: "center", color: "#666" }}>
        <p>Select a file to view its details</p>
      </div>
    );
  }

  return (
    <div style={{ padding: "20px", maxWidth: "800px", margin: "0 auto" }}>
      <h3>📄 File Viewer</h3>

      {loading && (
        <div style={{ textAlign: "center", padding: "20px" }}>
          <p>Loading file information...</p>
        </div>
      )}

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

      {fileMetadata && (
        <div>
          {/* File Header */}
          <div
            style={{
              backgroundColor: "#f5f5f5",
              border: "1px solid #ddd",
              borderRadius: "4px",
              padding: "15px",
              marginBottom: "20px",
            }}
          >
            <div
              style={{
                display: "flex",
                alignItems: "center",
                marginBottom: "10px",
              }}
            >
              <span style={{ fontSize: "24px", marginRight: "10px" }}>
                {getFileTypeIcon(fileMetadata.mimeType)}
              </span>
              <h4 style={{ margin: 0 }}>{fileMetadata.name}</h4>
            </div>

            <div style={{ display: "flex", gap: "20px", flexWrap: "wrap" }}>
              <div>
                <strong>Size:</strong> {formatFileSize(fileMetadata.size)}
              </div>
              <div>
                <strong>Type:</strong> {fileMetadata.mimeType}
              </div>
              <div>
                <strong>Created:</strong> {formatDate(fileMetadata.createdTime)}
              </div>
              <div>
                <strong>Modified:</strong>{" "}
                {formatDate(fileMetadata.modifiedTime)}
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div style={{ marginBottom: "20px" }}>
            <a
              href={fileMetadata.webViewLink}
              target="_blank"
              rel="noopener noreferrer"
              style={{
                display: "inline-block",
                padding: "10px 20px",
                backgroundColor: "#2196f3",
                color: "white",
                textDecoration: "none",
                borderRadius: "4px",
                marginRight: "10px",
              }}
            >
              🔗 Open in Drive
            </a>

            {fileMetadata.webContentLink && (
              <a
                href={fileMetadata.webContentLink}
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  display: "inline-block",
                  padding: "10px 20px",
                  backgroundColor: "#4caf50",
                  color: "white",
                  textDecoration: "none",
                  borderRadius: "4px",
                  marginRight: "10px",
                }}
              >
                ⬇️ Download
              </a>
            )}

            {canPreview(fileMetadata.mimeType) && (
              <button
                onClick={() => window.open(fileMetadata.webViewLink, "_blank")}
                style={{
                  padding: "10px 20px",
                  backgroundColor: "#ff9800",
                  color: "white",
                  border: "none",
                  borderRadius: "4px",
                  cursor: "pointer",
                }}
              >
                👁️ Preview
              </button>
            )}
          </div>

          {/* File Details */}
          <div
            style={{
              backgroundColor: "white",
              border: "1px solid #ddd",
              borderRadius: "4px",
              padding: "15px",
            }}
          >
            <h4>File Details:</h4>
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
              <tbody>
                <tr>
                  <td
                    style={{
                      border: "1px solid #ddd",
                      padding: "8px",
                      fontWeight: "bold",
                      width: "30%",
                    }}
                  >
                    File ID:
                  </td>
                  <td
                    style={{
                      border: "1px solid #ddd",
                      padding: "8px",
                      fontFamily: "monospace",
                    }}
                  >
                    {fileMetadata.id}
                  </td>
                </tr>
                <tr>
                  <td
                    style={{
                      border: "1px solid #ddd",
                      padding: "8px",
                      fontWeight: "bold",
                    }}
                  >
                    Name:
                  </td>
                  <td style={{ border: "1px solid #ddd", padding: "8px" }}>
                    {fileMetadata.name}
                  </td>
                </tr>
                <tr>
                  <td
                    style={{
                      border: "1px solid #ddd",
                      padding: "8px",
                      fontWeight: "bold",
                    }}
                  >
                    MIME Type:
                  </td>
                  <td
                    style={{
                      border: "1px solid #ddd",
                      padding: "8px",
                      fontFamily: "monospace",
                    }}
                  >
                    {fileMetadata.mimeType}
                  </td>
                </tr>
                <tr>
                  <td
                    style={{
                      border: "1px solid #ddd",
                      padding: "8px",
                      fontWeight: "bold",
                    }}
                  >
                    Size:
                  </td>
                  <td style={{ border: "1px solid #ddd", padding: "8px" }}>
                    {formatFileSize(fileMetadata.size)}
                  </td>
                </tr>
                <tr>
                  <td
                    style={{
                      border: "1px solid #ddd",
                      padding: "8px",
                      fontWeight: "bold",
                    }}
                  >
                    Created:
                  </td>
                  <td style={{ border: "1px solid #ddd", padding: "8px" }}>
                    {formatDate(fileMetadata.createdTime)}
                  </td>
                </tr>
                <tr>
                  <td
                    style={{
                      border: "1px solid #ddd",
                      padding: "8px",
                      fontWeight: "bold",
                    }}
                  >
                    Modified:
                  </td>
                  <td style={{ border: "1px solid #ddd", padding: "8px" }}>
                    {formatDate(fileMetadata.modifiedTime)}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* Preview Section */}
          {canPreview(fileMetadata.mimeType) && (
            <div
              style={{
                marginTop: "20px",
                backgroundColor: "white",
                border: "1px solid #ddd",
                borderRadius: "4px",
                padding: "15px",
              }}
            >
              <h4>Preview:</h4>
              <div
                style={{
                  border: "1px solid #ddd",
                  borderRadius: "4px",
                  padding: "10px",
                  backgroundColor: "#f9f9f9",
                  textAlign: "center",
                }}
              >
                <p>Click "Preview" button above to view the file content</p>
                <p style={{ fontSize: "14px", color: "#666" }}>
                  Supported formats: Images, PDFs, Text files, Google Docs,
                  Google Sheets
                </p>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default FileViewer;
