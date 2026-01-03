import React, { useState, useRef } from "react";
import { googleDriveApiService } from "../../services/googleDriveApi";

const DriveTester = () => {
  const [files, setFiles] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [testResult, setTestResult] = useState("");
  const [uploadProgress, setUploadProgress] = useState("");
  const fileInputRef = useRef(null);

  // Test upload file
  const handleFileUpload = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    setLoading(true);
    setError(null);
    setUploadProgress(`Uploading ${file.name}...`);

    try {
      const result = await googleDriveApiService.uploadFile(
        file,
        file.name,
        file.type,
      );

      setTestResult(`✅ Upload successful: ${result.name}`);
      setUploadProgress("");
      console.log("Uploaded file:", result);

      // Refresh file list
      setTimeout(() => handleListFiles(), 1000);
    } catch (error) {
      setError(`Upload failed: ${error.message}`);
      setTestResult("❌ Upload failed");
      setUploadProgress("");
    } finally {
      setLoading(false);
    }
  };

  // Test list files
  const handleListFiles = async () => {
    setLoading(true);
    setError(null);

    try {
      const result = await googleDriveApiService.listFiles();
      setFiles(result.files);
      setTestResult(`✅ Listed ${result.files.length} files`);
    } catch (error) {
      setError(`Failed to list files: ${error.message}`);
      setTestResult("❌ List files failed");
    } finally {
      setLoading(false);
    }
  };

  // Test create folder
  const handleCreateFolder = async () => {
    const folderName = `Test Folder ${new Date().getTime()}`;
    setLoading(true);
    setError(null);

    try {
      const result = await googleDriveApiService.createFolder(folderName);
      setTestResult(`✅ Folder created: ${result.name}`);
      console.log("Created folder:", result);

      // Refresh file list
      setTimeout(() => handleListFiles(), 1000);
    } catch (error) {
      setError(`Failed to create folder: ${error.message}`);
      setTestResult("❌ Create folder failed");
    } finally {
      setLoading(false);
    }
  };

  // Test delete file
  const handleDeleteFile = async (fileId, fileName) => {
    if (!window.confirm(`Are you sure you want to delete "${fileName}"?`)) {
      return;
    }

    setLoading(true);
    setError(null);

    try {
      await googleDriveApiService.deleteFile(fileId);
      setTestResult(`✅ Deleted: ${fileName}`);

      // Refresh file list
      setTimeout(() => handleListFiles(), 1000);
    } catch (error) {
      setError(`Failed to delete file: ${error.message}`);
      setTestResult("❌ Delete failed");
    } finally {
      setLoading(false);
    }
  };

  // Generate and upload test report
  const handleGenerateTestReport = async () => {
    setLoading(true);
    setError(null);
    setUploadProgress("Generating test report...");

    try {
      const reportData = {
        title: "Test Report",
        timestamp: new Date().toISOString(),
        data: [
          ["Item", "Quantity", "Price", "Total"],
          ["Product A", "10", "100", "1000"],
          ["Product B", "5", "200", "1000"],
          ["Product C", "3", "300", "900"],
        ],
        summary: {
          totalItems: 3,
          totalQuantity: 18,
          totalValue: 2900,
        },
      };

      const jsonContent = JSON.stringify(reportData, null, 2);
      const blob = new Blob([jsonContent], { type: "application/json" });
      const file = new File(
        [blob],
        `test-report-${new Date().getTime()}.json`,
        {
          type: "application/json",
        },
      );

      const result = await googleDriveApiService.uploadFile(
        file,
        file.name,
        file.type,
      );

      setTestResult(`✅ Report uploaded: ${result.name}`);
      setUploadProgress("");

      // Refresh file list
      setTimeout(() => handleListFiles(), 1000);
    } catch (error) {
      setError(`Failed to generate report: ${error.message}`);
      setTestResult("❌ Report generation failed");
      setUploadProgress("");
    } finally {
      setLoading(false);
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
    <div style={{ padding: "20px", maxWidth: "1000px", margin: "0 auto" }}>
      <h2>Google Drive Integration Tester</h2>

      {/* Status display */}
      <div
        style={{
          padding: "10px",
          margin: "10px 0",
          backgroundColor: error ? "#ffebee" : "#e8f5e8",
          border: `1px solid ${error ? "#f44336" : "#4caf50"}`,
          borderRadius: "4px",
        }}
      >
        <p>
          <strong>Status:</strong> {testResult}
        </p>
        {error && (
          <p style={{ color: "#f44336" }}>
            <strong>Error:</strong> {error}
          </p>
        )}
        {uploadProgress && (
          <p style={{ color: "#2196f3" }}>
            <strong>Progress:</strong> {uploadProgress}
          </p>
        )}
      </div>

      {/* Control buttons */}
      <div style={{ margin: "20px 0" }}>
        <button
          onClick={handleListFiles}
          disabled={loading}
          style={{ margin: "5px", padding: "10px 15px" }}
        >
          {loading ? "Loading..." : "List Files"}
        </button>

        <button
          onClick={handleCreateFolder}
          disabled={loading}
          style={{ margin: "5px", padding: "10px 15px" }}
        >
          {loading ? "Loading..." : "Create Test Folder"}
        </button>

        <button
          onClick={handleGenerateTestReport}
          disabled={loading}
          style={{ margin: "5px", padding: "10px 15px" }}
        >
          {loading ? "Loading..." : "Generate Test Report"}
        </button>

        <input
          type="file"
          ref={fileInputRef}
          onChange={handleFileUpload}
          style={{ margin: "5px", padding: "10px" }}
          disabled={loading}
        />
      </div>

      {/* Files list */}
      {files.length > 0 && (
        <div style={{ marginTop: "20px" }}>
          <h3>Files in Drive:</h3>
          <div style={{ overflowX: "auto" }}>
            <table
              style={{
                width: "100%",
                borderCollapse: "collapse",
                border: "1px solid #ddd",
              }}
            >
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
                {files.map((file, index) => (
                  <tr key={file.id}>
                    <td style={{ border: "1px solid #ddd", padding: "8px" }}>
                      <a
                        href={file.webViewLink}
                        target="_blank"
                        rel="noopener noreferrer"
                        style={{ textDecoration: "none", color: "#1976d2" }}
                      >
                        {file.name}
                      </a>
                    </td>
                    <td style={{ border: "1px solid #ddd", padding: "8px" }}>
                      {file.mimeType.includes("folder")
                        ? "📁 Folder"
                        : "📄 File"}
                    </td>
                    <td style={{ border: "1px solid #ddd", padding: "8px" }}>
                      {formatFileSize(file.size)}
                    </td>
                    <td style={{ border: "1px solid #ddd", padding: "8px" }}>
                      {formatDate(file.modifiedTime)}
                    </td>
                    <td style={{ border: "1px solid #ddd", padding: "8px" }}>
                      <button
                        onClick={() => handleDeleteFile(file.id, file.name)}
                        disabled={loading}
                        style={{
                          padding: "5px 10px",
                          backgroundColor: "#f44336",
                          color: "white",
                          border: "none",
                          borderRadius: "3px",
                          cursor: "pointer",
                        }}
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default DriveTester;
