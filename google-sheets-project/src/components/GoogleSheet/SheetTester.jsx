import React, { useState, useEffect } from "react";
import { googleSheetsApiService } from "../../services/googleSheetsApi";

const SheetTester = () => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [testResult, setTestResult] = useState("");
  const [range, setRange] = useState("A1:E10");

  // Test data để ghi vào sheet
  const sampleData = [
    ["Timestamp", "Product", "Quantity", "Price", "Total"],
    [new Date().toISOString(), "Test Product", "10", "100", "1000"],
    [new Date().toISOString(), "Another Product", "5", "200", "1000"],
  ];

  useEffect(() => {
    // Check backend connection
    setTestResult("✅ Using backend API proxy");
  }, []);

  // Test đọc dữ liệu từ Google Sheet
  const handleReadSheet = async () => {
    setLoading(true);
    setError(null);

    try {
      const result = await googleSheetsApiService.readSheet(range);
      setData(result.data);
      setTestResult(`✅ Read successful: ${result.data.length} rows retrieved`);
    } catch (error) {
      setError(`Failed to read sheet: ${error.message}`);
      setTestResult("❌ Read failed");
    } finally {
      setLoading(false);
    }
  };

  // Test ghi dữ liệu vào Google Sheet
  const handleWriteSheet = async () => {
    setLoading(true);
    setError(null);

    try {
      const result = await googleSheetsApiService.writeSheet(range, sampleData);
      setTestResult(
        `✅ Write successful: ${result.updatedCells} cells updated`,
      );

      // Refresh data after writing
      setTimeout(() => handleReadSheet(), 1000);
    } catch (error) {
      setError(`Failed to write to sheet: ${error.message}`);
      setTestResult("❌ Write failed");
    } finally {
      setLoading(false);
    }
  };

  // Test append dữ liệu vào Google Sheet
  const handleAppendSheet = async () => {
    setLoading(true);
    setError(null);

    try {
      const newRow = [
        [new Date().toISOString(), "Appended Product", "3", "50", "150"],
      ];

      const result = await googleSheetsApiService.appendToSheet(
        "A1:E1",
        newRow,
      );
      setTestResult(`✅ Append successful: ${result.updatedCells} cells added`);

      // Refresh data after appending
      setTimeout(() => handleReadSheet(), 1000);
    } catch (error) {
      setError(`Failed to append to sheet: ${error.message}`);
      setTestResult("❌ Append failed");
    } finally {
      setLoading(false);
    }
  };

  // Test lấy metadata của sheet
  const handleGetMetadata = async () => {
    setLoading(true);
    setError(null);

    try {
      const metadata = await googleSheetsApiService.getSheetMetadata();
      setTestResult(
        `✅ Metadata: "${metadata.title}" - ${metadata.sheets.length} sheets`,
      );
      console.log("Sheet metadata:", metadata);
    } catch (error) {
      setError(`Failed to get metadata: ${error.message}`);
      setTestResult("❌ Metadata retrieval failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ padding: "20px", maxWidth: "800px", margin: "0 auto" }}>
      <h2>Google Sheets Integration Tester</h2>

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
      </div>

      {/* Range input */}
      <div style={{ margin: "20px 0" }}>
        <label htmlFor="range">Sheet Range:</label>
        <input
          id="range"
          type="text"
          value={range}
          onChange={(e) => setRange(e.target.value)}
          style={{ marginLeft: "10px", padding: "5px", width: "200px" }}
          placeholder="A1:E10"
        />
      </div>

      {/* Control buttons */}
      <div style={{ margin: "20px 0" }}>
        <button
          onClick={handleGetMetadata}
          disabled={loading}
          style={{ margin: "5px", padding: "10px 15px" }}
        >
          {loading ? "Loading..." : "Get Sheet Metadata"}
        </button>

        <button
          onClick={handleReadSheet}
          disabled={loading}
          style={{ margin: "5px", padding: "10px 15px" }}
        >
          {loading ? "Loading..." : "Read Sheet Data"}
        </button>

        <button
          onClick={handleWriteSheet}
          disabled={loading}
          style={{ margin: "5px", padding: "10px 15px" }}
        >
          {loading ? "Loading..." : "Write Sample Data"}
        </button>

        <button
          onClick={handleAppendSheet}
          disabled={loading}
          style={{ margin: "5px", padding: "10px 15px" }}
        >
          {loading ? "Loading..." : "Append New Row"}
        </button>
      </div>

      {/* Data display */}
      {data.length > 0 && (
        <div style={{ marginTop: "20px" }}>
          <h3>Sheet Data:</h3>
          <div style={{ overflowX: "auto" }}>
            <table
              style={{
                width: "100%",
                borderCollapse: "collapse",
                border: "1px solid #ddd",
              }}
            >
              <tbody>
                {data.map((row, rowIndex) => (
                  <tr key={rowIndex}>
                    {row.map((cell, cellIndex) => (
                      <td
                        key={cellIndex}
                        style={{
                          border: "1px solid #ddd",
                          padding: "8px",
                          backgroundColor: rowIndex === 0 ? "#f5f5f5" : "white",
                          fontWeight: rowIndex === 0 ? "bold" : "normal",
                        }}
                      >
                        {cell}
                      </td>
                    ))}
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

export default SheetTester;
