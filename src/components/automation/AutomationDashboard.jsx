import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import Loading from '../Common/Loading';
import './AutomationDashboard.css';

const AutomationDashboard = () => {
  const { loading, error } = useSelector((state) => state.auth);
  const { isAuthenticated, serviceAccount } = useSelector(
    (state) => state.auth
  );

  const [automations, setAutomations] = useState([]);
  const [selectedAutomation, setSelectedAutomation] = useState(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newAutomation, setNewAutomation] = useState({
    name: '',
    description: '',
    trigger: 'schedule',
    action: 'email',
    status: 'active',
  });
  const [executionLogs, setExecutionLogs] = useState([]);

  // Sample automation data
  const sampleAutomations = [
    {
      id: 'auto_1',
      name: 'Báo cáo hàng ngày',
      description: 'Tự động gửi báo cáo hàng ngày lúc 8:00 sáng',
      trigger: {
        type: 'schedule',
        schedule: '0 8 * * *', // 8:00 AM daily
        timezone: 'Asia/Ho_Chi_Minh',
      },
      action: {
        type: 'email',
        template: 'daily_report',
        recipients: ['manager@mia.vn', 'admin@mia.vn'],
      },
      status: 'active',
      lastRun: '2024-01-15T08:00:00Z',
      nextRun: '2024-01-16T08:00:00Z',
      executions: 45,
      successRate: 98.5,
    },
    {
      id: 'auto_2',
      name: 'Backup dữ liệu',
      description: 'Tự động backup dữ liệu Google Sheets hàng tuần',
      trigger: {
        type: 'schedule',
        schedule: '0 2 * * 0', // 2:00 AM every Sunday
        timezone: 'Asia/Ho_Chi_Minh',
      },
      action: {
        type: 'backup',
        source: 'google_sheets',
        destination: 'google_drive',
      },
      status: 'active',
      lastRun: '2024-01-14T02:00:00Z',
      nextRun: '2024-01-21T02:00:00Z',
      executions: 8,
      successRate: 100,
    },
    {
      id: 'auto_3',
      name: 'Thông báo đơn hàng mới',
      description: 'Gửi thông báo Telegram khi có đơn hàng mới',
      trigger: {
        type: 'webhook',
        endpoint: '/webhook/new-order',
        method: 'POST',
      },
      action: {
        type: 'telegram',
        message: 'Có đơn hàng mới: {order_id}',
        chatId: '-4818209867',
      },
      status: 'active',
      lastRun: '2024-01-15T14:30:00Z',
      nextRun: 'N/A',
      executions: 23,
      successRate: 95.7,
    },
    {
      id: 'auto_4',
      name: 'Đồng bộ inventory',
      description: 'Đồng bộ dữ liệu inventory giữa các hệ thống',
      trigger: {
        type: 'schedule',
        schedule: '0 */6 * * *', // Every 6 hours
        timezone: 'Asia/Ho_Chi_Minh',
      },
      action: {
        type: 'sync',
        source: 'google_sheets',
        target: 'erp_system',
      },
      status: 'inactive',
      lastRun: '2024-01-10T12:00:00Z',
      nextRun: 'N/A',
      executions: 156,
      successRate: 92.3,
    },
  ];

  const sampleLogs = [
    {
      id: 1,
      automationId: 'auto_1',
      timestamp: '2024-01-15T08:00:00Z',
      status: 'success',
      message: 'Báo cáo hàng ngày đã được gửi thành công',
      duration: '2.3s',
    },
    {
      id: 2,
      automationId: 'auto_3',
      timestamp: '2024-01-15T14:30:00Z',
      status: 'success',
      message: 'Thông báo đơn hàng #12345 đã được gửi',
      duration: '0.8s',
    },
    {
      id: 3,
      automationId: 'auto_2',
      timestamp: '2024-01-14T02:00:00Z',
      status: 'success',
      message: 'Backup dữ liệu hoàn thành',
      duration: '45.2s',
    },
    {
      id: 4,
      automationId: 'auto_1',
      timestamp: '2024-01-14T08:00:00Z',
      status: 'error',
      message: 'Lỗi kết nối email server',
      duration: '5.1s',
    },
  ];

  useEffect(() => {
    setAutomations(sampleAutomations);
    setExecutionLogs(sampleLogs);
  }, []);

  const handleAutomationSelect = (automation) => {
    setSelectedAutomation(automation);
  };

  const handleCreateAutomation = () => {
    if (!newAutomation.name.trim()) return;

    const automation = {
      id: `auto_${Date.now()}`,
      ...newAutomation,
      lastRun: null,
      nextRun: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
      executions: 0,
      successRate: 0,
    };

    setAutomations((prev) => [automation, ...prev]);
    setNewAutomation({
      name: '',
      description: '',
      trigger: 'schedule',
      action: 'email',
      status: 'active',
    });
    setShowCreateModal(false);
  };

  const handleToggleAutomation = (automationId) => {
    setAutomations((prev) =>
      prev.map((auto) =>
        auto.id === automationId
          ? {
              ...auto,
              status: auto.status === 'active' ? 'inactive' : 'active',
            }
          : auto
      )
    );
  };

  const handleDeleteAutomation = (automationId) => {
    setAutomations((prev) => prev.filter((auto) => auto.id !== automationId));
    if (selectedAutomation?.id === automationId) {
      setSelectedAutomation(null);
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('vi-VN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getStatusColor = (status) => {
    return status === 'active' ? '#22c55e' : '#ef4444';
  };

  const getLogStatusColor = (status) => {
    switch (status) {
      case 'success':
        return '#22c55e';
      case 'error':
        return '#ef4444';
      case 'warning':
        return '#f59e0b';
      default:
        return '#3b82f6';
    }
  };

  const getTriggerIcon = (type) => {
    switch (type) {
      case 'schedule':
        return '⏰';
      case 'webhook':
        return '🔗';
      case 'manual':
        return '👆';
      default:
        return '⚡';
    }
  };

  const getActionIcon = (type) => {
    switch (type) {
      case 'email':
        return '📧';
      case 'telegram':
        return '💬';
      case 'backup':
        return '💾';
      case 'sync':
        return '🔄';
      default:
        return '⚡';
    }
  };

  if (loading) return <Loading />;
  if (error) return <div className="error-state">Lỗi: {error}</div>;

  return (
    <div className="automation-dashboard">
      {/* Header */}
      <div className="automation-header">
        <div className="header-left">
          <h1>🤖 Automation</h1>
          <p>Tự động hóa quy trình và công việc</p>
        </div>

        <div className="header-right">
          <button
            className="btn btn-primary"
            onClick={() => setShowCreateModal(true)}
          >
            ➕ Tạo automation mới
          </button>
        </div>
      </div>

      <div className="automation-content">
        {/* Automations List */}
        <div className="automations-sidebar">
          <div className="sidebar-header">
            <h3>📋 Danh sách Automation</h3>
            <span className="automation-count">
              {automations.length} automations
            </span>
          </div>

          <div className="automations-list">
            {automations.map((automation) => (
              <div
                key={automation.id}
                className={`automation-item ${
                  selectedAutomation?.id === automation.id ? 'active' : ''
                }`}
                onClick={() => handleAutomationSelect(automation)}
              >
                <div className="automation-info">
                  <div className="automation-header-item">
                    <span className="automation-name">{automation.name}</span>
                    <span
                      className="automation-status"
                      style={{ color: getStatusColor(automation.status) }}
                    >
                      {automation.status === 'active' ? '🟢' : '🔴'}
                    </span>
                  </div>
                  <div className="automation-description">
                    {automation.description}
                  </div>
                  <div className="automation-meta">
                    <span className="automation-trigger">
                      {getTriggerIcon(automation.trigger.type)}{' '}
                      {automation.trigger.type}
                    </span>
                    <span className="automation-action">
                      {getActionIcon(automation.action.type)}{' '}
                      {automation.action.type}
                    </span>
                  </div>
                  <div className="automation-stats">
                    <span>{automation.executions} lần chạy</span>
                    <span>{automation.successRate}% thành công</span>
                  </div>
                </div>
                <div className="automation-actions">
                  <button
                    className="action-btn"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleToggleAutomation(automation.id);
                    }}
                    title={
                      automation.status === 'active' ? 'Tạm dừng' : 'Kích hoạt'
                    }
                  >
                    {automation.status === 'active' ? '⏸️' : '▶️'}
                  </button>
                  <button
                    className="action-btn"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDeleteAutomation(automation.id);
                    }}
                    title="Xóa automation"
                  >
                    🗑️
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Automation Details */}
        <div className="automation-details">
          {selectedAutomation ? (
            <>
              <div className="details-header">
                <div className="automation-title">
                  <h3>{selectedAutomation.name}</h3>
                  <span
                    className="status-badge"
                    style={{
                      backgroundColor: getStatusColor(
                        selectedAutomation.status
                      ),
                    }}
                  >
                    {selectedAutomation.status === 'active'
                      ? 'Hoạt động'
                      : 'Tạm dừng'}
                  </span>
                </div>
                <div className="details-actions">
                  <button
                    className="btn btn-secondary"
                    onClick={() =>
                      handleToggleAutomation(selectedAutomation.id)
                    }
                  >
                    {selectedAutomation.status === 'active'
                      ? '⏸️ Tạm dừng'
                      : '▶️ Kích hoạt'}
                  </button>
                </div>
              </div>

              <div className="details-content">
                <div className="detail-section">
                  <h4>📝 Mô tả</h4>
                  <p>{selectedAutomation.description}</p>
                </div>

                <div className="detail-section">
                  <h4>⚡ Trigger</h4>
                  <div className="trigger-info">
                    <span className="trigger-type">
                      {getTriggerIcon(selectedAutomation.trigger.type)}{' '}
                      {selectedAutomation.trigger.type}
                    </span>
                    {selectedAutomation.trigger.schedule && (
                      <span className="trigger-schedule">
                        Lịch: {selectedAutomation.trigger.schedule}
                      </span>
                    )}
                    {selectedAutomation.trigger.endpoint && (
                      <span className="trigger-endpoint">
                        Endpoint: {selectedAutomation.trigger.endpoint}
                      </span>
                    )}
                  </div>
                </div>

                <div className="detail-section">
                  <h4>🎯 Action</h4>
                  <div className="action-info">
                    <span className="action-type">
                      {getActionIcon(selectedAutomation.action.type)}{' '}
                      {selectedAutomation.action.type}
                    </span>
                    {selectedAutomation.action.recipients && (
                      <span className="action-recipients">
                        Người nhận:{' '}
                        {selectedAutomation.action.recipients.join(', ')}
                      </span>
                    )}
                    {selectedAutomation.action.chatId && (
                      <span className="action-chat">
                        Chat ID: {selectedAutomation.action.chatId}
                      </span>
                    )}
                  </div>
                </div>

                <div className="detail-section">
                  <h4>📊 Thống kê</h4>
                  <div className="stats-grid">
                    <div className="stat-item">
                      <span className="stat-label">Lần chạy cuối</span>
                      <span className="stat-value">
                        {selectedAutomation.lastRun
                          ? formatDate(selectedAutomation.lastRun)
                          : 'Chưa chạy'}
                      </span>
                    </div>
                    <div className="stat-item">
                      <span className="stat-label">Lần chạy tiếp theo</span>
                      <span className="stat-value">
                        {selectedAutomation.nextRun !== 'N/A'
                          ? formatDate(selectedAutomation.nextRun)
                          : 'N/A'}
                      </span>
                    </div>
                    <div className="stat-item">
                      <span className="stat-label">Tổng lần chạy</span>
                      <span className="stat-value">
                        {selectedAutomation.executions}
                      </span>
                    </div>
                    <div className="stat-item">
                      <span className="stat-label">Tỷ lệ thành công</span>
                      <span className="stat-value">
                        {selectedAutomation.successRate}%
                      </span>
                    </div>
                  </div>
                </div>

                {/* Execution Logs */}
                <div className="detail-section">
                  <h4>📋 Nhật ký thực thi</h4>
                  <div className="logs-container">
                    {executionLogs
                      .filter(
                        (log) => log.automationId === selectedAutomation.id
                      )
                      .slice(0, 10)
                      .map((log) => (
                        <div key={log.id} className="log-entry">
                          <span className="log-time">
                            {formatDate(log.timestamp)}
                          </span>
                          <span
                            className="log-status"
                            style={{ color: getLogStatusColor(log.status) }}
                          >
                            {log.status === 'success' ? '✅' : '❌'}
                          </span>
                          <span className="log-message">{log.message}</span>
                          <span className="log-duration">{log.duration}</span>
                        </div>
                      ))}
                  </div>
                </div>
              </div>
            </>
          ) : (
            <div className="no-automation-selected">
              <div className="empty-icon">🤖</div>
              <h3>Chọn một automation để xem chi tiết</h3>
              <p>Tạo automation mới hoặc chọn từ danh sách bên trái</p>
            </div>
          )}
        </div>
      </div>

      {/* Create Automation Modal */}
      {showCreateModal && (
        <div className="modal-overlay">
          <div className="modal">
            <div className="modal-header">
              <h3>Tạo automation mới</h3>
              <button
                className="close-btn"
                onClick={() => setShowCreateModal(false)}
              >
                ✕
              </button>
            </div>
            <div className="modal-body">
              <div className="form-group">
                <label>Tên automation</label>
                <input
                  type="text"
                  value={newAutomation.name}
                  onChange={(e) =>
                    setNewAutomation((prev) => ({
                      ...prev,
                      name: e.target.value,
                    }))
                  }
                  placeholder="Nhập tên automation..."
                  className="input-field"
                />
              </div>
              <div className="form-group">
                <label>Mô tả</label>
                <textarea
                  value={newAutomation.description}
                  onChange={(e) =>
                    setNewAutomation((prev) => ({
                      ...prev,
                      description: e.target.value,
                    }))
                  }
                  placeholder="Mô tả chức năng của automation..."
                  className="textarea-field"
                  rows="3"
                />
              </div>
              <div className="form-group">
                <label>Trigger</label>
                <select
                  value={newAutomation.trigger}
                  onChange={(e) =>
                    setNewAutomation((prev) => ({
                      ...prev,
                      trigger: e.target.value,
                    }))
                  }
                  className="select-field"
                >
                  <option value="schedule">Lịch trình</option>
                  <option value="webhook">Webhook</option>
                  <option value="manual">Thủ công</option>
                </select>
              </div>
              <div className="form-group">
                <label>Action</label>
                <select
                  value={newAutomation.action}
                  onChange={(e) =>
                    setNewAutomation((prev) => ({
                      ...prev,
                      action: e.target.value,
                    }))
                  }
                  className="select-field"
                >
                  <option value="email">Gửi email</option>
                  <option value="telegram">Gửi Telegram</option>
                  <option value="backup">Backup dữ liệu</option>
                  <option value="sync">Đồng bộ dữ liệu</option>
                </select>
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
                onClick={handleCreateAutomation}
                disabled={!newAutomation.name.trim()}
              >
                Tạo automation
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AutomationDashboard;
