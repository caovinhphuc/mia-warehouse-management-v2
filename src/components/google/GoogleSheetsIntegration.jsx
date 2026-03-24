import React, { useState, useEffect } from "react";
import importMetaEnv from "../../utils/importMetaEnv";
import { useSelector, useDispatch } from "react-redux";
import Loading from "../Common/Loading";
import { googleSheetsApiService } from "../../services/googleSheetsApi";
import "./GoogleSheetsIntegration.css";

const GoogleSheetsIntegration = () => {
  // const dispatch = useDispatch();
  const { loading, error } = useSelector((state) => state.sheets);
  const { isAuthenticated, serviceAccount } = useSelector(
    (state) => state.auth
  );

  const [selectedSheet, setSelectedSheet] = useState(null);
  const [sheetContent, setSheetContent] = useState([]);
  const [isEditing, setIsEditing] = useState(false);
  const [editData, setEditData] = useState({});
  const [searchTerm, setSearchTerm] = useState("");
  const [filteredData, setFilteredData] = useState([]);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newSheetName, setNewSheetName] = useState("");
  const [showColumnModal, setShowColumnModal] = useState(false);
  const [newColumnName, setNewColumnName] = useState("");
  const [selectedRows, setSelectedRows] = useState([]);
  const [spreadsheets, setSpreadsheets] = useState([]);
  const [isLoadingMetadata, setIsLoadingMetadata] = useState(false);
  const [isLoadingContent, setIsLoadingContent] = useState(false);
  const [metadataError, setMetadataError] = useState(null);

  // Load spreadsheet metadata on mount
  useEffect(() => {
    const loadMetadata = async () => {
      setIsLoadingMetadata(true);
      setMetadataError(null);
      try {
        const metadata = await googleSheetsApiService.getSheetMetadata();
        // Transform metadata to match component structure
        const spreadsheet = {
          id:
            importMetaEnv.VITE_GOOGLE_SHEETS_SPREADSHEET_ID ||
            "18B1PIhCDmBWyHZytvOcfj_1QbYBwczLf1x1Qbu0E5As",
          title: metadata.title,
          sheets: metadata.sheets.map((sheet, index) => ({
            name: sheet.title,
            id: sheet.sheetId,
            rowCount: sheet.gridProperties?.rowCount || 0,
            columnCount: sheet.gridProperties?.columnCount || 0,
          })),
        };
        setSpreadsheets([spreadsheet]);
      } catch (err) {
        // Error message đã được format trong googleSheetsApiService
        // Chỉ log trong development mode
        if (process.env.NODE_ENV === "development") {
          console.error("Failed to load sheet metadata:", err.message);
        }
        setMetadataError(err.message);
        // Fallback to empty state
        setSpreadsheets([]);
      } finally {
        setIsLoadingMetadata(false);
      }
    };

    loadMetadata();
  }, []);

  // Load sheet content when sheet is selected
  useEffect(() => {
    const loadSheetContent = async () => {
      if (!selectedSheet) {
        setSheetContent([]);
        return;
      }

      setIsLoadingContent(true);
      try {
        // Get spreadsheet ID from state or env
        const spreadsheetId =
          spreadsheets[0]?.id ||
          importMetaEnv.VITE_GOOGLE_SHEETS_SPREADSHEET_ID ||
          importMetaEnv.REACT_APP_GOOGLE_SHEETS_SPREADSHEET_ID ||
          "18B1PIhCDmBWyHZytvOcfj_1QbYBwczLf1x1Qbu0E5As";

        // Read data from the selected sheet (use sheet name in range)
        const sheetName = selectedSheet.name;
        const range = `${sheetName}!A1:Z1000`;
        const result = await googleSheetsApiService.readSheet(
          range,
          spreadsheetId
        );
        setSheetContent(result.data || []);
      } catch (err) {
        console.error("Failed to load sheet content:", err);
        setSheetContent([]);
      } finally {
        setIsLoadingContent(false);
      }
    };

    loadSheetContent();
  }, [selectedSheet]);

  useEffect(() => {
    if (searchTerm) {
      const filtered = sheetContent.filter((row) =>
        row.some((cell) =>
          cell.toString().toLowerCase().includes(searchTerm.toLowerCase())
        )
      );
      setFilteredData(filtered);
    } else {
      setFilteredData(sheetContent);
    }
  }, [searchTerm, sheetContent]);

  const handleSheetSelect = (sheet) => {
    setSelectedSheet(sheet);
    setIsEditing(false);
    setEditData({});
  };

  // Mở Google Sheet trực tiếp trên browser
  const handleOpenSheetInGoogle = (sheet, spreadsheetId) => {
    if (!spreadsheetId) {
      spreadsheetId =
        spreadsheets[0]?.id ||
        importMetaEnv.VITE_GOOGLE_SHEETS_SPREADSHEET_ID ||
        "18B1PIhCDmBWyHZytvOcfj_1QbYBwczLf1x1Qbu0E5As";
    }

    // Tạo URL để mở sheet cụ thể
    // Format: https://docs.google.com/spreadsheets/d/{SPREADSHEET_ID}/edit#gid={SHEET_ID}
    const sheetUrl = `https://docs.google.com/spreadsheets/d/${spreadsheetId}/edit#gid=${sheet.id}`;
    window.open(sheetUrl, "_blank");
  };

  const handleCellEdit = (rowIndex, colIndex, value) => {
    setEditData({
      ...editData,
      [`${rowIndex}-${colIndex}`]: value,
    });
  };

  // const handleSave = () => {
  //   // Simulate save operation
  //   console.log("Saving data:", editData);
  //   setIsEditing(false);
  //   setEditData({});
  //   // Here you would dispatch an action to save to Google Sheets
  // };

  const handleExport = () => {
    // Simulate export operation
    const csvContent = filteredData.map((row) => row.join(",")).join("\n");
    const blob = new Blob([csvContent], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${selectedSheet?.name || "sheet"}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const handleCreateSheet = async () => {
    if (!newSheetName.trim()) return;

    try {
      setIsLoadingMetadata(true);

      // Get current spreadsheet ID
      const spreadsheetId =
        spreadsheets[0]?.id ||
        importMetaEnv.VITE_GOOGLE_SHEETS_SPREADSHEET_ID ||
        "18B1PIhCDmBWyHZytvOcfj_1QbYBwczLf1x1Qbu0E5As";

      // Call API to create new sheet
      const newSheet = await googleSheetsApiService.addSheet(
        newSheetName.trim(),
        spreadsheetId
      );

      // Reload metadata to show the new sheet
      const metadata = await googleSheetsApiService.getSheetMetadata(
        spreadsheetId
      );
      const spreadsheet = {
        id: spreadsheetId,
        title: metadata.title,
        sheets: metadata.sheets.map((sheet, index) => ({
          name: sheet.title,
          id: sheet.sheetId,
          rowCount: sheet.gridProperties?.rowCount || 0,
          columnCount: sheet.gridProperties?.columnCount || 0,
        })),
      };
      setSpreadsheets([spreadsheet]);

      // Select the newly created sheet
      const createdSheet = spreadsheet.sheets.find(
        (s) => s.id === newSheet.sheetId
      );
      if (createdSheet) {
        setSelectedSheet(createdSheet);
      }

      setNewSheetName("");
      setShowCreateModal(false);
      setIsLoadingMetadata(false);
    } catch (error) {
      // Error message đã được format trong googleSheetsApiService
      // Chỉ log trong development mode
      if (process.env.NODE_ENV === "development") {
        console.error("Error creating sheet:", error.message);
      }
      alert(`Lỗi tạo sheet: ${error.message}`);
      setIsLoadingMetadata(false);
    }
  };

  const handleAddColumn = () => {
    if (!newColumnName.trim() || !selectedSheet) return;

    const updatedContent = sheetContent.map((row, index) => {
      if (index === 0) {
        // Header row
        return [...row, newColumnName];
      } else {
        // Data rows
        return [...row, ""];
      }
    });

    setSheetContent(updatedContent);
    setNewColumnName("");
    setShowColumnModal(false);
  };

  const handleDeleteColumn = (columnIndex) => {
    if (!selectedSheet) return;

    const updatedContent = sheetContent.map((row) =>
      row.filter((_, index) => index !== columnIndex)
    );

    setSheetContent(updatedContent);
  };

  const handleAddRow = () => {
    if (!selectedSheet) return;

    const newRow = Array(selectedSheet.headers.length).fill("");
    setSheetContent([...sheetContent, newRow]);
  };

  const handleDeleteRow = (rowIndex) => {
    const updatedContent = sheetContent.filter(
      (_, index) => index !== rowIndex
    );
    setSheetContent(updatedContent);
  };

  const handleDeleteEmptyRows = () => {
    const updatedContent = sheetContent.filter((row) =>
      row.some((cell) => cell.toString().trim() !== "")
    );
    setSheetContent(updatedContent);
  };

  const handleRowSelect = (rowIndex) => {
    setSelectedRows((prev) =>
      prev.includes(rowIndex)
        ? prev.filter((index) => index !== rowIndex)
        : [...prev, rowIndex]
    );
  };

  const handleSelectAllRows = () => {
    const allRowIndices = sheetContent.map((_, index) => index);
    setSelectedRows(
      selectedRows.length === allRowIndices.length ? [] : allRowIndices
    );
  };

  const handleDeleteSelectedRows = () => {
    const updatedContent = sheetContent.filter(
      (_, index) => !selectedRows.includes(index)
    );
    setSheetContent(updatedContent);
    setSelectedRows([]);
  };

  const handleViewId = (item) => {
    alert(`ID: ${item.id || selectedSheet?.id}`);
  };

  const handleMoveRow = (fromIndex, toIndex) => {
    const updatedContent = [...sheetContent];
    const [movedRow] = updatedContent.splice(fromIndex, 1);
    updatedContent.splice(toIndex, 0, movedRow);
    setSheetContent(updatedContent);
  };

  if (loading) {
    return <Loading text="Đang tải Google Sheets..." fullScreen />;
  }

  if (error) {
    return (
      <div className="sheets-error">
        <h3>Lỗi kết nối Google Sheets</h3>
        <p>{error}</p>
        <button onClick={() => window.location.reload()}>Thử lại</button>
      </div>
    );
  }

  return (
    <div className="google-sheets-integration dashboard-container">
      {/* Header */}
      <div className="sheets-header page-header">
        <div className="header-title-group">
          <h2>📊 Google Sheets Integration</h2>
        </div>
        <div className="sheets-controls page-controls">
          <button
            className="btn btn-primary"
            onClick={() => setShowCreateModal(true)}
          >
            ➕ Tạo sheet mới
          </button>
          {selectedSheet && (
            <>
              <button
                className="btn btn-secondary"
                onClick={() => setIsEditing(!isEditing)}
              >
                {isEditing ? "💾 Lưu" : "✏️ Chỉnh sửa"}
              </button>
              <button className="btn btn-primary" onClick={handleExport}>
                📥 Xuất CSV
              </button>
            </>
          )}
        </div>
      </div>

      <div className="sheets-content two-column-layout">
        {/* Sidebar - Sheet List */}
        <div className="sheets-sidebar">
          <div className="sidebar-header">
            <h3>📋 Danh sách Sheets</h3>
            {isLoadingMetadata ? (
              <span className="sheets-count">Đang tải...</span>
            ) : (
              <span className="sheets-count">
                {spreadsheets.reduce((sum, s) => sum + s.sheets.length, 0)}{" "}
                sheets
              </span>
            )}
          </div>

          {metadataError && (
            <div
              className="error-banner"
              style={{
                padding: "10px",
                margin: "10px",
                backgroundColor: "#ffebee",
                color: "#c62828",
                borderRadius: "4px",
              }}
            >
              ⚠️ Lỗi tải metadata: {metadataError}
            </div>
          )}

          <div className="sheets-list">
            {isLoadingMetadata ? (
              <div style={{ padding: "20px", textAlign: "center" }}>
                Đang tải...
              </div>
            ) : spreadsheets.length === 0 ? (
              <div style={{ padding: "20px", textAlign: "center" }}>
                Không có sheets nào
              </div>
            ) : (
              spreadsheets.map((spreadsheet) => (
                <div key={spreadsheet.id} className="spreadsheet-group">
                  <div className="spreadsheet-title">{spreadsheet.title}</div>
                  {spreadsheet.sheets.map((sheet) => (
                    <div
                      key={sheet.id}
                      className={`sheet-item ${
                        selectedSheet?.id === sheet.id ? "active" : ""
                      }`}
                      onClick={() => handleSheetSelect(sheet)}
                      onDoubleClick={() =>
                        handleOpenSheetInGoogle(sheet, spreadsheet.id)
                      }
                      title="Double-click để mở trên Google Sheets"
                    >
                      <div className="sheet-info">
                        <div className="sheet-header-item">
                          <span className="sheet-name">{sheet.name}</span>
                          <div className="sheet-status-container">
                            <span className="sheet-status">📊</span>
                            {selectedSheet?.id === sheet.id && (
                              <span className="sheet-active-tag">
                                Đang hoạt động
                              </span>
                            )}
                          </div>
                        </div>
                        <div className="sheet-description">
                          Google Sheets - {sheet.rowCount} hàng ×{" "}
                          {sheet.columnCount} cột
                        </div>
                        <div className="sheet-meta">
                          <span className="sheet-trigger">📊 sheets</span>
                          <span className="sheet-action">📅 sync</span>
                        </div>
                        <div className="sheet-stats">
                          <span>{sheet.rowCount} bản ghi</span>
                          <span>100% hoàn thành</span>
                        </div>
                      </div>
                      <div className="sheet-actions">
                        <button
                          className="action-btn"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleOpenSheetInGoogle(sheet, spreadsheet.id);
                          }}
                          title="Mở trên Google Sheets"
                        >
                          🔗
                        </button>
                        <button
                          className="action-btn"
                          onClick={(e) => {
                            e.stopPropagation();
                            alert(`Thêm cột vào ${sheet.name}`);
                          }}
                          title="Thêm cột"
                        >
                          ➕
                        </button>
                        <button
                          className="action-btn"
                          onClick={(e) => {
                            e.stopPropagation();
                            alert(`Thêm hàng vào ${sheet.name}`);
                          }}
                          title="Thêm hàng"
                        >
                          📝
                        </button>
                        <button
                          className="action-btn"
                          onClick={(e) => {
                            e.stopPropagation();
                            alert(`Xóa dòng trống trong ${sheet.name}`);
                          }}
                          title="Xóa dòng trống"
                        >
                          🗑️
                        </button>
                        <button
                          className="action-btn"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleViewId(sheet);
                          }}
                          title="Xem ID"
                        >
                          👁️
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              ))
            )}
          </div>
        </div>

        {/* Main Content - Sheet Data */}
        <div className="sheets-main-content">
          {isLoadingContent ? (
            <div style={{ padding: "40px", textAlign: "center" }}>
              <Loading text="Đang tải dữ liệu sheet..." />
            </div>
          ) : selectedSheet ? (
            <>
              <div className="sheet-header">
                <div className="sheet-info-section">
                  <div className="sheet-title-info">
                    <h3>{selectedSheet.name}</h3>
                    <span className="sheet-dimensions">
                      {selectedSheet.rowCount} hàng ×{" "}
                      {selectedSheet.columnCount} cột
                    </span>
                  </div>
                  <button
                    className="btn btn-link"
                    onClick={() => {
                      const spreadsheetId =
                        spreadsheets[0]?.id ||
                        importMetaEnv.VITE_GOOGLE_SHEETS_SPREADSHEET_ID ||
                        "18B1PIhCDmBWyHZytvOcfj_1QbYBwczLf1x1Qbu0E5As";
                      handleOpenSheetInGoogle(selectedSheet, spreadsheetId);
                    }}
                    title="Mở trên Google Sheets"
                    style={{ marginLeft: "10px", padding: "4px 8px" }}
                  >
                    🔗 Mở trên Google Sheets
                  </button>
                </div>
                <div className="sheet-actions">
                  <input
                    type="text"
                    placeholder="🔍 Tìm kiếm..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="search-input"
                  />
                  <span className="row-count">{filteredData.length} rows</span>
                </div>
              </div>

              <div className="sheet-table-container">
                {filteredData.length === 0 ? (
                  <div style={{ padding: "40px", textAlign: "center" }}>
                    <p>Sheet trống hoặc không có dữ liệu</p>
                  </div>
                ) : (
                  <table className="sheet-table">
                    <thead>
                      <tr>
                        {filteredData[0].map((header, index) => (
                          <th key={index}>{header}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {filteredData.slice(1).map((row, rowIndex) => (
                        <tr key={rowIndex}>
                          {row.map((cell, colIndex) => (
                            <td key={colIndex}>
                              {isEditing ? (
                                <input
                                  type="text"
                                  value={
                                    editData[`${rowIndex + 1}-${colIndex}`] ||
                                    cell
                                  }
                                  onChange={(e) =>
                                    handleCellEdit(
                                      rowIndex + 1,
                                      colIndex,
                                      e.target.value
                                    )
                                  }
                                  className="cell-input"
                                />
                              ) : (
                                <span className="cell-content">{cell}</span>
                              )}
                            </td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </div>
            </>
          ) : (
            <div className="no-sheet-selected">
              <div className="no-sheet-icon">📊</div>
              <h3>Chọn một sheet để xem dữ liệu</h3>
              <p>Nhấp vào một sheet trong danh sách bên trái để bắt đầu</p>
            </div>
          )}
        </div>
      </div>

      {/* Create Sheet Modal */}
      {showCreateModal && (
        <div className="modal-overlay">
          <div className="modal">
            <div className="modal-header">
              <h3>Tạo sheet mới</h3>
              <button
                className="close-btn"
                onClick={() => setShowCreateModal(false)}
              >
                ✕
              </button>
            </div>
            <div className="modal-body">
              <div className="form-group">
                <label>Tên sheet</label>
                <input
                  type="text"
                  value={newSheetName}
                  onChange={(e) => setNewSheetName(e.target.value)}
                  placeholder="Nhập tên sheet..."
                  className="input-field"
                />
              </div>
            </div>
            <div className="modal-footer">
              <button
                className="btn btn-secondary"
                onClick={() => setShowCreateModal(false)}
              >
                Hủy
              </button>
              <button
                className="btn btn-primary"
                onClick={handleCreateSheet}
                disabled={!newSheetName.trim()}
              >
                Tạo sheet
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add Column Modal */}
      {showColumnModal && (
        <div className="modal-overlay">
          <div className="modal">
            <div className="modal-header">
              <h3>Thêm cột mới</h3>
              <button
                className="close-btn"
                onClick={() => setShowColumnModal(false)}
              >
                ✕
              </button>
            </div>
            <div className="modal-body">
              <div className="form-group">
                <label>Tên cột</label>
                <input
                  type="text"
                  value={newColumnName}
                  onChange={(e) => setNewColumnName(e.target.value)}
                  placeholder="Nhập tên cột..."
                  className="input-field"
                />
              </div>
            </div>
            <div className="modal-footer">
              <button
                className="btn btn-secondary"
                onClick={() => setShowColumnModal(false)}
              >
                Hủy
              </button>
              <button
                className="btn btn-primary"
                onClick={handleAddColumn}
                disabled={!newColumnName.trim()}
              >
                Thêm cột
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default GoogleSheetsIntegration;
