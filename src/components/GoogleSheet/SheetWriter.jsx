import React, { useState } from "react";
import { useGoogleSheets } from "../../hooks/useGoogleSheets";

const SheetWriter = ({ sheetId, onDataWritten }) => {
  const { loading, error, writeSheet, appendToSheet, clearError } =
    useGoogleSheets();
  const [range, setRange] = useState("A1:E3");
  const [data, setData] = useState("");
  const [writeMode, setWriteMode] = useState("write"); // "write" or "append"

  // Sample data templates
  const sampleDataTemplates = {
    orders: [
      ["Date", "Product", "Quantity", "Price", "Total"],
      ["2024-01-01", "Laptop", "1", "15000000", "15000000"],
      ["2024-01-02", "Mouse", "2", "500000", "1000000"],
    ],
    inventory: [
      ["Product", "Stock", "Min Stock", "Price", "Category"],
      ["Laptop Dell", "10", "5", "15000000", "Electronics"],
      ["Mouse Logitech", "50", "20", "500000", "Accessories"],
    ],
    customers: [
      ["Name", "Email", "Phone", "Address", "Status"],
      ["Nguyen Van A", "a@email.com", "0123456789", "Ha Noi", "Active"],
      ["Tran Thi B", "b@email.com", "0987654321", "Ho Chi Minh", "Active"],
    ],
  };

  const handleWriteData = async () => {
    try {
      clearError();

      // Parse data from textarea
      const rows = data
        .split("\n")
        .map((row) => row.split("\t").map((cell) => cell.trim()));

      let result;
      if (writeMode === "write") {
        result = await writeSheet(range, rows, sheetId);
      } else {
        result = await appendToSheet(range, rows, sheetId);
      }

      if (onDataWritten) {
        onDataWritten(result);
      }
    } catch (err) {
      console.error("Failed to write data:", err);
    }
  };

  const handleTemplateSelect = (templateKey) => {
    const template = sampleDataTemplates[templateKey];
    const formattedData = template.map((row) => row.join("\t")).join("\n");
    setData(formattedData);
  };

  const clearData = () => {
    setData("");
  };

  return (
    <div style={{ padding: "20px" }}>
      <h3>✏️ Sheet Writer</h3>

      {/* Write Mode Selection */}
      <div style={{ marginBottom: "15px" }}>
        <label>
          <input
            type="radio"
            value="write"
            checked={writeMode === "write"}
            onChange={(e) => setWriteMode(e.target.value)}
          />
          Write (Replace)
        </label>
        <label style={{ marginLeft: "20px" }}>
          <input
            type="radio"
            value="append"
            checked={writeMode === "append"}
            onChange={(e) => setWriteMode(e.target.value)}
          />
          Append (Add to end)
        </label>
      </div>

      {/* Range Input */}
      <div style={{ marginBottom: "15px" }}>
        <label htmlFor="range-write">Range:</label>
        <input
          id="range-write"
          type="text"
          value={range}
          onChange={(e) => setRange(e.target.value)}
          placeholder="A1:E3"
          style={{ marginLeft: "10px", padding: "5px", width: "200px" }}
        />
      </div>

      {/* Template Selection */}
      <div style={{ marginBottom: "15px" }}>
        <label>Quick Templates:</label>
        <select
          onChange={(e) => handleTemplateSelect(e.target.value)}
          style={{ marginLeft: "10px", padding: "5px" }}
        >
          <option value="">Select template...</option>
          <option value="orders">Orders Template</option>
          <option value="inventory">Inventory Template</option>
          <option value="customers">Customers Template</option>
        </select>
      </div>

      {/* Data Input */}
      <div style={{ marginBottom: "15px" }}>
        <label htmlFor="data-input">
          Data (separate columns with TAB, rows with ENTER):
        </label>
        <textarea
          id="data-input"
          value={data}
          onChange={(e) => setData(e.target.value)}
          placeholder="Enter data here...&#10;Use TAB to separate columns&#10;Use ENTER to separate rows"
          style={{
            width: "100%",
            height: "200px",
            padding: "10px",
            marginTop: "5px",
            fontFamily: "monospace",
            fontSize: "12px",
          }}
        />
      </div>

      {/* Action Buttons */}
      <div style={{ marginBottom: "15px" }}>
        <button
          onClick={handleWriteData}
          disabled={loading || !data.trim()}
          style={{
            padding: "10px 20px",
            backgroundColor: "#4caf50",
            color: "white",
            border: "none",
            borderRadius: "4px",
            cursor: loading ? "not-allowed" : "pointer",
          }}
        >
          {loading
            ? "Writing..."
            : `${writeMode === "write" ? "Write" : "Append"} Data`}
        </button>

        <button
          onClick={clearData}
          disabled={loading}
          style={{
            padding: "10px 20px",
            backgroundColor: "#f44336",
            color: "white",
            border: "none",
            borderRadius: "4px",
            cursor: "pointer",
            marginLeft: "10px",
          }}
        >
          Clear
        </button>
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

      {/* Instructions */}
      <div
        style={{
          backgroundColor: "#e3f2fd",
          border: "1px solid #2196f3",
          borderRadius: "4px",
          padding: "10px",
          fontSize: "14px",
        }}
      >
        <strong>💡 Instructions:</strong>
        <ul style={{ margin: "5px 0", paddingLeft: "20px" }}>
          <li>Use TAB to separate columns</li>
          <li>Use ENTER to separate rows</li>
          <li>First row is usually headers</li>
          <li>Range format: A1:Z100 (start:end)</li>
        </ul>
      </div>
    </div>
  );
};

export default SheetWriter;
