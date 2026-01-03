import React, { useState, useRef } from "react";
import { useGoogleDrive } from "../../hooks/useGoogleDrive";

const DriveUploader = ({ folderId, onUploadComplete }) => {
  const { loading, error, uploadProgress, uploadFile, clearError } =
    useGoogleDrive();

  const [selectedFiles, setSelectedFiles] = useState([]);
  const [uploadResults, setUploadResults] = useState([]);
  const fileInputRef = useRef(null);

  const handleFileSelect = (event) => {
    const files = Array.from(event.target.files);
    setSelectedFiles(files);
    clearError();
  };

  const handleUpload = async () => {
    if (selectedFiles.length === 0) return;

    setUploadResults([]);
    const results = [];

    for (const file of selectedFiles) {
      try {
        clearError();
        const fileBuffer = await file.arrayBuffer();
        const result = await uploadFile(
          fileBuffer,
          file.name,
          file.type,
          folderId
        );

        results.push({
          fileName: file.name,
          success: true,
          result: result,
        });
      } catch (err) {
        results.push({
          fileName: file.name,
          success: false,
          error: err.message,
        });
      }
    }

    setUploadResults(results);

    if (onUploadComplete) {
      onUploadComplete();
    }
  };

  const handleClearFiles = () => {
    setSelectedFiles([]);
    setUploadResults([]);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
    clearError();
  };

  const formatFileSize = (bytes) => {
    if (!bytes) return "N/A";
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(1024));
    return Math.round((bytes / Math.pow(1024, i)) * 100) / 100 + " " + sizes[i];
  };

  return (
    <div style={{ padding: "20px" }}>
      <h3>⬆️ File Uploader</h3>

      {/* File Selection */}
      <div style={{ marginBottom: "20px" }}>
        <input
          type="file"
          ref={fileInputRef}
          onChange={handleFileSelect}
          multiple
          style={{
            marginBottom: "10px",
            padding: "10px",
            border: "1px solid #ddd",
            borderRadius: "4px",
            width: "100%",
          }}
        />

        {selectedFiles.length > 0 && (
          <div
            style={{
              backgroundColor: "#f5f5f5",
              border: "1px solid #ddd",
              borderRadius: "4px",
              padding: "10px",
              marginBottom: "15px",
            }}
          >
            <h4>Selected Files ({selectedFiles.length}):</h4>
            <ul style={{ margin: "5px 0", paddingLeft: "20px" }}>
              {selectedFiles.map((file, index) => (
                <li key={index}>
                  {file.name} ({formatFileSize(file.size)})
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>

      {/* Action Buttons */}
      <div style={{ marginBottom: "20px" }}>
        <button
          onClick={handleUpload}
          disabled={loading || selectedFiles.length === 0}
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
          {loading ? "Uploading..." : `Upload ${selectedFiles.length} File(s)`}
        </button>

        <button
          onClick={handleClearFiles}
          disabled={loading}
          style={{
            padding: "10px 20px",
            backgroundColor: "#f44336",
            color: "white",
            border: "none",
            borderRadius: "4px",
            cursor: "pointer",
          }}
        >
          Clear Files
        </button>
      </div>

      {/* Progress */}
      {uploadProgress && (
        <div
          style={{
            backgroundColor: "#e3f2fd",
            border: "1px solid #2196f3",
            borderRadius: "4px",
            padding: "10px",
            marginBottom: "15px",
            color: "#1976d2",
          }}
        >
          <strong>Progress:</strong> {uploadProgress}
        </div>
      )}

      {/* Error Display */}
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

      {/* Upload Results */}
      {uploadResults.length > 0 && (
        <div
          style={{
            backgroundColor: "white",
            border: "1px solid #ddd",
            borderRadius: "4px",
            padding: "15px",
          }}
        >
          <h4>Upload Results:</h4>
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
                    File
                  </th>
                  <th
                    style={{
                      border: "1px solid #ddd",
                      padding: "8px",
                      textAlign: "left",
                    }}
                  >
                    Status
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
                {uploadResults.map((result, index) => (
                  <tr key={index}>
                    <td style={{ border: "1px solid #ddd", padding: "8px" }}>
                      {result.fileName}
                    </td>
                    <td style={{ border: "1px solid #ddd", padding: "8px" }}>
                      {result.success ? (
                        <span style={{ color: "#4caf50", fontWeight: "bold" }}>
                          ✅ Success
                        </span>
                      ) : (
                        <span style={{ color: "#f44336", fontWeight: "bold" }}>
                          ❌ Failed
                        </span>
                      )}
                    </td>
                    <td style={{ border: "1px solid #ddd", padding: "8px" }}>
                      {result.success && result.result?.webViewLink && (
                        <a
                          href={result.result.webViewLink}
                          target="_blank"
                          rel="noopener noreferrer"
                          style={{
                            padding: "5px 10px",
                            backgroundColor: "#2196f3",
                            color: "white",
                            textDecoration: "none",
                            borderRadius: "3px",
                            fontSize: "12px",
                          }}
                        >
                          🔗 View
                        </a>
                      )}
                      {!result.success && (
                        <span style={{ fontSize: "12px", color: "#f44336" }}>
                          {result.error}
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Instructions */}
      <div
        style={{
          backgroundColor: "#fff3cd",
          border: "1px solid #ffc107",
          borderRadius: "4px",
          padding: "15px",
          marginTop: "20px",
        }}
      >
        <h4>💡 Upload Instructions:</h4>
        <ul style={{ margin: "5px 0", paddingLeft: "20px" }}>
          <li>Select one or multiple files to upload</li>
          <li>Files will be uploaded to your configured Google Drive folder</li>
          <li>
            Supported file types: All types (images, documents, videos, etc.)
          </li>
          <li>Maximum file size depends on your Google Drive quota</li>
          <li>Upload progress will be shown for each file</li>
        </ul>
      </div>
    </div>
  );
};

export default DriveUploader;
