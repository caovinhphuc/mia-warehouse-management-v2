import React, { useState } from "react";
import SheetTester from "../GoogleSheet/SheetTester.jsx";
import DriveTester from "../GoogleDrive/DriveTester.jsx";

const TestDashboard = () => {
  const [activeTab, setActiveTab] = useState("sheets");

  const tabStyle = (isActive) => ({
    padding: "10px 20px",
    margin: "0 5px",
    border: "1px solid #ddd",
    backgroundColor: isActive ? "#1976d2" : "#f5f5f5",
    color: isActive ? "white" : "#333",
    cursor: "pointer",
    borderRadius: "4px 4px 0 0",
  });

  return (
    <div style={{ minHeight: "100vh", backgroundColor: "#f9f9f9" }}>
      <div style={{ padding: "20px", maxWidth: "1200px", margin: "0 auto" }}>
        <h1 style={{ textAlign: "center", color: "#333" }}>
          Google Services Integration Test Dashboard
        </h1>

        <p style={{ textAlign: "center", color: "#666", marginBottom: "30px" }}>
          Test your React app's integration with Google Sheets and Google Drive
        </p>

        {/* Tab navigation */}
        <div style={{ marginBottom: "20px", borderBottom: "1px solid #ddd" }}>
          <button
            style={tabStyle(activeTab === "sheets")}
            onClick={() => setActiveTab("sheets")}
          >
            📊 Google Sheets Test
          </button>
          <button
            style={tabStyle(activeTab === "drive")}
            onClick={() => setActiveTab("drive")}
          >
            💾 Google Drive Test
          </button>
        </div>

        {/* Tab content */}
        <div
          style={{
            backgroundColor: "white",
            borderRadius: "0 4px 4px 4px",
            boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
            minHeight: "500px",
          }}
        >
          {activeTab === "sheets" && <SheetTester />}
          {activeTab === "drive" && <DriveTester />}
        </div>

        {/* Instructions */}
        <div
          style={{
            marginTop: "30px",
            padding: "20px",
            backgroundColor: "white",
            borderRadius: "4px",
            boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
          }}
        >
          <h3>Instructions:</h3>
          <ol>
            <li>
              <strong>Google Sheets Test:</strong> Test reading, writing, and
              appending data to your Google Sheet
            </li>
            <li>
              <strong>Google Drive Test:</strong> Test uploading files, creating
              folders, and managing files in your Google Drive
            </li>
            <li>
              <strong>Check Console:</strong> Open browser developer tools to
              see detailed logs
            </li>
            <li>
              <strong>Verify Results:</strong> Check your actual Google Sheet
              and Drive to confirm operations
            </li>
          </ol>

          <h4>Expected Results:</h4>
          <ul>
            <li>✅ Green status messages indicate successful operations</li>
            <li>
              ❌ Red error messages indicate configuration or permission issues
            </li>
            <li>
              Files uploaded should appear in your configured Google Drive
              folder
            </li>
            <li>Data written should appear in your configured Google Sheet</li>
          </ul>

          <h4>Setup Requirements:</h4>
          <ul>
            <li>Create Google Service Account and download JSON key</li>
            <li>Enable Google Sheets API and Google Drive API</li>
            <li>
              Share your Google Sheet with service account email (Editor access)
            </li>
            <li>
              Share your Google Drive folder with service account email (Editor
              access)
            </li>
            <li>Configure .env file with all required variables</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default TestDashboard;
