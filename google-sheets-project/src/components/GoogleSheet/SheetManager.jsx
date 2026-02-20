import React, { useState } from "react";
import SheetReader from "./SheetReader.jsx";
import SheetWriter from "./SheetWriter.jsx";
import { googleSheetsApiService } from "../../services/googleSheetsApi";

const SheetManager = ({ sheetId }) => {
  const [activeTab, setActiveTab] = useState("reader");
  const [sheetMetadata, setSheetMetadata] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const tabStyle = (isActive) => ({
    padding: "10px 20px",
    margin: "0 5px",
    border: "1px solid #ddd",
    backgroundColor: isActive ? "#1976d2" : "#f5f5f5",
    color: isActive ? "white" : "#333",
    cursor: "pointer",
    borderRadius: "4px 4px 0 0",
  });

  const handleGetMetadata = async () => {
    setLoading(true);
    setError(null);

    try {
      const metadata = await googleSheetsApiService.getSheetMetadata(sheetId);
      setSheetMetadata(metadata);
    } catch (err) {
      setError(`Failed to get metadata: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleDataLoaded = (result) => {
    console.log("Data loaded:", result);
  };

  const handleDataWritten = (result) => {
    console.log("Data written:", result);
    // Optionally refresh the reader
    if (activeTab === "reader") {
      // Trigger a refresh of the reader component
      window.location.reload();
    }
  };

  return (
    <div style={{ maxWidth: "1000px", margin: "0 auto", padding: "20px" }}>
      <h2>📊 Google Sheets Manager</h2>

      {/* Metadata Section */}
      <div style={{ marginBottom: "20px" }}>
        <button
          onClick={handleGetMetadata}
          disabled={loading}
          style={{
            padding: "10px 20px",
            backgroundColor: "#2196f3",
            color: "white",
            border: "none",
            borderRadius: "4px",
            cursor: loading ? "not-allowed" : "pointer",
          }}
        >
          {loading ? "Loading..." : "Get Sheet Info"}
        </button>

        {sheetMetadata && (
          <div
            style={{
              marginTop: "15px",
              backgroundColor: "#e8f5e8",
              border: "1px solid #4caf50",
              borderRadius: "4px",
              padding: "15px",
            }}
          >
            <h4>Sheet Information:</h4>
            <p>
              <strong>Title:</strong> {sheetMetadata.title}
            </p>
            <p>
              <strong>Number of sheets:</strong> {sheetMetadata.sheets.length}
            </p>

            <div>
              <strong>Sheets:</strong>
              <ul>
                {sheetMetadata.sheets.map((sheet, index) => (
                  <li key={index}>
                    {sheet.title} (ID: {sheet.sheetId})
                    {sheet.gridProperties && (
                      <span style={{ color: "#666", fontSize: "12px" }}>
                        {" "}
                        - {sheet.gridProperties.rowCount} rows ×{" "}
                        {sheet.gridProperties.columnCount} columns
                      </span>
                    )}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        )}

        {error && (
          <div
            style={{
              marginTop: "15px",
              backgroundColor: "#ffebee",
              border: "1px solid #f44336",
              borderRadius: "4px",
              padding: "10px",
              color: "#f44336",
            }}
          >
            <strong>Error:</strong> {error}
          </div>
        )}
      </div>

      {/* Tab Navigation */}
      <div style={{ marginBottom: "20px", borderBottom: "1px solid #ddd" }}>
        <button
          style={tabStyle(activeTab === "reader")}
          onClick={() => setActiveTab("reader")}
        >
          📖 Read Data
        </button>
        <button
          style={tabStyle(activeTab === "writer")}
          onClick={() => setActiveTab("writer")}
        >
          ✏️ Write Data
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
        {activeTab === "reader" && (
          <SheetReader sheetId={sheetId} onDataLoaded={handleDataLoaded} />
        )}
        {activeTab === "writer" && (
          <SheetWriter sheetId={sheetId} onDataWritten={handleDataWritten} />
        )}
      </div>

      {/* Quick Actions */}
      <div
        style={{
          marginTop: "20px",
          backgroundColor: "#f5f5f5",
          border: "1px solid #ddd",
          borderRadius: "4px",
          padding: "15px",
        }}
      >
        <h4>Quick Actions:</h4>
        <div style={{ display: "flex", gap: "10px", flexWrap: "wrap" }}>
          <button
            onClick={() => setActiveTab("reader")}
            style={{
              padding: "8px 16px",
              backgroundColor: "#4caf50",
              color: "white",
              border: "none",
              borderRadius: "4px",
              cursor: "pointer",
            }}
          >
            📖 Read Sheet
          </button>
          <button
            onClick={() => setActiveTab("writer")}
            style={{
              padding: "8px 16px",
              backgroundColor: "#ff9800",
              color: "white",
              border: "none",
              borderRadius: "4px",
              cursor: "pointer",
            }}
          >
            ✏️ Write Data
          </button>
          <button
            onClick={handleGetMetadata}
            style={{
              padding: "8px 16px",
              backgroundColor: "#2196f3",
              color: "white",
              border: "none",
              borderRadius: "4px",
              cursor: "pointer",
            }}
          >
            ℹ️ Sheet Info
          </button>
        </div>
      </div>
    </div>
  );
};

export default SheetManager;
