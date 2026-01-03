import React, { useState, useEffect } from "react";
import { useGoogleSheets } from "../../hooks/useGoogleSheets";

const SheetReader = ({ range = "A1:Z1000", sheetId, onDataLoaded }) => {
  const { data, loading, error, readSheet, clearError } = useGoogleSheets();
  const [customRange, setCustomRange] = useState(range);

  const handleReadSheet = React.useCallback(async () => {
    try {
      clearError();
      const result = await readSheet(customRange, sheetId);
      if (onDataLoaded) {
        onDataLoaded(result);
      }
    } catch (err) {
      console.error("Failed to read sheet:", err);
    }
  }, [customRange, sheetId, onDataLoaded, readSheet, clearError]);

  useEffect(() => {
    // Auto-load data when component mounts
    if (range) {
      handleReadSheet();
    }
  }, [range, handleReadSheet]);

  const handleRangeChange = (newRange) => {
    setCustomRange(newRange);
  };

  return (
    <div style={{ padding: "20px" }}>
      <h3>📊 Sheet Reader</h3>

      {/* Range Input */}
      <div style={{ marginBottom: "15px" }}>
        <label htmlFor="range-input">Range:</label>
        <input
          id="range-input"
          type="text"
          value={customRange}
          onChange={(e) => handleRangeChange(e.target.value)}
          placeholder="A1:Z1000"
          style={{ marginLeft: "10px", padding: "5px", width: "200px" }}
        />
        <button
          onClick={handleReadSheet}
          disabled={loading}
          style={{ marginLeft: "10px", padding: "5px 10px" }}
        >
          {loading ? "Loading..." : "Read"}
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

      {/* Data Display */}
      {data && data.length > 0 && (
        <div>
          <h4>Data ({data.length} rows):</h4>
          <div
            style={{
              overflowX: "auto",
              maxHeight: "400px",
              border: "1px solid #ddd",
            }}
          >
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
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

      {data && data.length === 0 && !loading && (
        <div
          style={{
            backgroundColor: "#fff3cd",
            border: "1px solid #ffc107",
            borderRadius: "4px",
            padding: "10px",
            color: "#856404",
          }}
        >
          No data found in the specified range.
        </div>
      )}
    </div>
  );
};

export default SheetReader;
