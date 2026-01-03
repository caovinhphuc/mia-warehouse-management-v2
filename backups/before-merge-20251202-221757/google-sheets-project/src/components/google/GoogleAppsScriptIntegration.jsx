import React, { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import Loading from "../Common/Loading";
import { scriptService } from "../../services/scriptService";
import { message } from "antd";
import "./GoogleAppsScriptIntegration.css";

const GoogleAppsScriptIntegration = () => {
  const { loading, error } = useSelector((state) => state.auth);
  const { isAuthenticated, serviceAccount } = useSelector(
    (state) => state.auth,
  );

  const [scripts, setScripts] = useState([]);
  const [selectedScript, setSelectedScript] = useState(null);
  const [scriptCode, setScriptCode] = useState("");
  const [isRunning, setIsRunning] = useState(false);
  const [executionLogs, setExecutionLogs] = useState([]);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newScriptName, setNewScriptName] = useState("");
  const [newScriptDescription, setNewScriptDescription] = useState("");

  // Sample scripts
  const sampleScripts = [
    {
      id: "script_1",
      name: "Tự động gửi email báo cáo",
      description: "Gửi email báo cáo hàng ngày cho quản lý",
      lastModified: "2024-01-15T10:30:00Z",
      status: "active",
      executions: 45,
      code: `function sendDailyReport() {
  const sheet = SpreadsheetApp.getActiveSheet();
  const data = sheet.getDataRange().getValues();

  // Tạo báo cáo
  let report = "Báo cáo hàng ngày:\\n\\n";
  report += "Tổng số đơn hàng: " + data.length + "\\n";
  report += "Ngày: " + new Date().toLocaleDateString('vi-VN');

  // Gửi email
  MailApp.sendEmail({
    to: 'manager@mia.vn',
    subject: 'Báo cáo hàng ngày - ' + new Date().toLocaleDateString('vi-VN'),
    body: report
  });

  console.log('Email đã được gửi thành công');
}`,
    },
    {
      id: "script_2",
      name: "Đồng bộ dữ liệu Google Sheets",
      description: "Đồng bộ dữ liệu giữa các sheet khác nhau",
      lastModified: "2024-01-14T15:45:00Z",
      status: "active",
      executions: 23,
      code: `function syncSheetsData() {
  const sourceSheet = SpreadsheetApp.openById('SOURCE_SHEET_ID').getActiveSheet();
  const targetSheet = SpreadsheetApp.openById('TARGET_SHEET_ID').getActiveSheet();

  const data = sourceSheet.getDataRange().getValues();
  targetSheet.getRange(1, 1, data.length, data[0].length).setValues(data);

  console.log('Dữ liệu đã được đồng bộ thành công');
}`,
    },
    {
      id: "script_3",
      name: "Tự động backup dữ liệu",
      description: "Tạo backup dữ liệu hàng tuần",
      lastModified: "2024-01-13T09:20:00Z",
      status: "inactive",
      executions: 8,
      code: `function weeklyBackup() {
  const sheet = SpreadsheetApp.getActiveSheet();
  const data = sheet.getDataRange().getValues();

  // Tạo file backup
  const backupSheet = SpreadsheetApp.create('Backup_' + new Date().getTime());
  backupSheet.getActiveSheet().getRange(1, 1, data.length, data[0].length).setValues(data);

  console.log('Backup đã được tạo thành công');
}`,
    },
  ];

  useEffect(() => {
    setScripts(sampleScripts);
  }, []);

  const handleScriptSelect = (script) => {
    setSelectedScript(script);
    setScriptCode(script.code);
  };

  const handleRunScript = async () => {
    if (!selectedScript) return;

    setIsRunning(true);
    setExecutionLogs([]);

    try {
      // Add initial log
      setExecutionLogs([
        {
          time: new Date().toISOString(),
          message: "Bắt đầu thực thi script...",
          type: "info",
        },
      ]);

      // If script has scriptId, use it; otherwise try inline execution
      let result;
      if (selectedScript.scriptId) {
        result = await scriptService.executeScript(
          selectedScript.scriptId,
          selectedScript.functionName || "main",
          selectedScript.parameters || [],
        );
      } else {
        // Try inline execution (will fail gracefully if not supported)
        result = await scriptService.executeInline(
          selectedScript.code,
          selectedScript.functionName || "main",
          selectedScript.parameters || [],
        );
      }

      if (result.success) {
        setExecutionLogs((prev) => [
          ...prev,
          {
            time: new Date().toISOString(),
            message: "✅ Script đã được thực thi thành công!",
            type: "success",
          },
          {
            time: new Date().toISOString(),
            message: `Kết quả: ${JSON.stringify(result.data)}`,
            type: "info",
          },
        ]);
        message.success("Script đã được thực thi thành công!");
      } else {
        throw new Error(result.error || "Script execution failed");
      }
    } catch (error) {
      console.error("Error executing script:", error);
      setExecutionLogs((prev) => [
        ...prev,
        {
          time: new Date().toISOString(),
          message: `❌ Lỗi: ${error.message}`,
          type: "error",
        },
      ]);
      message.error(`Lỗi thực thi script: ${error.message}`);
    } finally {
      setIsRunning(false);
    }
  };

  const handleCreateScript = () => {
    if (!newScriptName.trim()) return;

    const newScript = {
      id: `script_${Date.now()}`,
      name: newScriptName,
      description: newScriptDescription,
      lastModified: new Date().toISOString(),
      status: "active",
      executions: 0,
      code: `function ${newScriptName.replace(/\s+/g, "")}() {
  // Viết code của bạn ở đây
  console.log('Script mới đã được tạo');
}`,
    };

    setScripts((prev) => [newScript, ...prev]);
    setNewScriptName("");
    setNewScriptDescription("");
    setShowCreateModal(false);
  };

  const handleSaveScript = () => {
    if (!selectedScript) return;

    setScripts((prev) =>
      prev.map((script) =>
        script.id === selectedScript.id
          ? {
              ...script,
              code: scriptCode,
              lastModified: new Date().toISOString(),
            }
          : script,
      ),
    );

    setSelectedScript((prev) => ({
      ...prev,
      code: scriptCode,
      lastModified: new Date().toISOString(),
    }));
  };

  const handleDeleteScript = (scriptId) => {
    setScripts((prev) => prev.filter((script) => script.id !== scriptId));
    if (selectedScript?.id === scriptId) {
      setSelectedScript(null);
      setScriptCode("");
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("vi-VN", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getStatusColor = (status) => {
    return status === "active" ? "#22c55e" : "#ef4444";
  };

  const getLogTypeColor = (type) => {
    switch (type) {
      case "success":
        return "#22c55e";
      case "error":
        return "#ef4444";
      case "warning":
        return "#f59e0b";
      default:
        return "#3b82f6";
    }
  };

  if (loading) return <Loading />;
  if (error) return <div className="error-state">Lỗi: {error}</div>;

  return (
    <div className="apps-script-container">
      {/* Header */}
      <div className="script-header">
        <div className="header-left">
          <h1>⚙️ Google Apps Script</h1>
          <p>Tự động hóa công việc với Google Apps Script</p>
        </div>

        <div className="header-right">
          <button
            className="btn btn-primary"
            onClick={() => setShowCreateModal(true)}
          >
            ➕ Tạo script mới
          </button>
        </div>
      </div>

      <div className="script-content">
        {/* Scripts List */}
        <div className="scripts-sidebar">
          <div className="sidebar-header">
            <h3>📜 Danh sách Scripts</h3>
            <span className="script-count">{scripts.length} scripts</span>
          </div>

          <div className="scripts-list">
            {scripts.map((script) => (
              <div
                key={script.id}
                className={`script-item ${
                  selectedScript?.id === script.id ? "active" : ""
                }`}
                onClick={() => handleScriptSelect(script)}
              >
                <div className="script-info">
                  <div className="script-name">{script.name}</div>
                  <div className="script-description">{script.description}</div>
                  <div className="script-meta">
                    <span
                      className="script-status"
                      style={{ color: getStatusColor(script.status) }}
                    >
                      {script.status === "active"
                        ? "🟢 Hoạt động"
                        : "🔴 Tạm dừng"}
                    </span>
                    <span className="script-executions">
                      {script.executions} lần chạy
                    </span>
                  </div>
                </div>
                <div className="script-actions">
                  <button
                    className="action-btn"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDeleteScript(script.id);
                    }}
                    title="Xóa script"
                  >
                    🗑️
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Script Editor */}
        <div className="script-editor">
          {selectedScript ? (
            <>
              <div className="editor-header">
                <div className="script-title">
                  <h3>{selectedScript.name}</h3>
                  <span className="script-id">ID: {selectedScript.id}</span>
                </div>
                <div className="editor-actions">
                  <button
                    className="btn btn-secondary"
                    onClick={handleSaveScript}
                  >
                    💾 Lưu
                  </button>
                  <button
                    className="btn btn-primary"
                    onClick={handleRunScript}
                    disabled={isRunning}
                  >
                    {isRunning ? "⏳ Đang chạy..." : "▶️ Chạy script"}
                  </button>
                </div>
              </div>

              <div className="code-editor">
                <textarea
                  value={scriptCode}
                  onChange={(e) => setScriptCode(e.target.value)}
                  placeholder="Viết code JavaScript của bạn ở đây..."
                  className="code-textarea"
                />
              </div>

              {/* Execution Logs */}
              {executionLogs.length > 0 && (
                <div className="execution-logs">
                  <h4>📋 Nhật ký thực thi</h4>
                  <div className="logs-container">
                    {executionLogs.map((log, index) => (
                      <div key={index} className="log-entry">
                        <span className="log-time">
                          {new Date(log.time).toLocaleTimeString("vi-VN")}
                        </span>
                        <span
                          className="log-message"
                          style={{ color: getLogTypeColor(log.type) }}
                        >
                          {log.message}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </>
          ) : (
            <div className="no-script-selected">
              <div className="empty-icon">⚙️</div>
              <h3>Chọn một script để chỉnh sửa</h3>
              <p>Tạo script mới hoặc chọn từ danh sách bên trái</p>
            </div>
          )}
        </div>
      </div>

      {/* Create Script Modal */}
      {showCreateModal && (
        <div className="modal-overlay">
          <div className="modal">
            <div className="modal-header">
              <h3>Tạo script mới</h3>
              <button
                className="close-btn"
                onClick={() => setShowCreateModal(false)}
              >
                ✕
              </button>
            </div>
            <div className="modal-body">
              <div className="form-group">
                <label>Tên script</label>
                <input
                  type="text"
                  value={newScriptName}
                  onChange={(e) => setNewScriptName(e.target.value)}
                  placeholder="Nhập tên script..."
                  className="input-field"
                />
              </div>
              <div className="form-group">
                <label>Mô tả</label>
                <textarea
                  value={newScriptDescription}
                  onChange={(e) => setNewScriptDescription(e.target.value)}
                  placeholder="Mô tả chức năng của script..."
                  className="textarea-field"
                  rows="3"
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
                onClick={handleCreateScript}
                disabled={!newScriptName.trim()}
              >
                Tạo script
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default GoogleAppsScriptIntegration;
