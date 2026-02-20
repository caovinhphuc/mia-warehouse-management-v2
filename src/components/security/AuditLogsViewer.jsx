import React, { useState, useEffect } from "react";
import {
  Card,
  Table,
  Space,
  Button,
  Select,
  DatePicker,
  Input,
  Tag,
  Tooltip,
  message,
  Statistic,
  Row,
  Col,
  Modal,
  Descriptions,
} from "antd";
import {
  FileSearchOutlined,
  ReloadOutlined,
  ExportOutlined,
  FilterOutlined,
  EyeOutlined,
  CalendarOutlined,
} from "@ant-design/icons";
import dayjs from "dayjs";
import securityService from "../../services/securityService";
import { exportToCSV } from "../../utils/exportUtils";
import "./Security.css";

const { RangePicker } = DatePicker;
const { Option } = Select;

const EVENT_TYPES = {
  "login:success": "Đăng nhập thành công",
  "login:failure": "Đăng nhập thất bại",
  logout: "Đăng xuất",
  "mfa:enabled": "Bật MFA",
  "mfa:disabled": "Tắt MFA",
  "mfa:verified": "Xác thực MFA",
  "mfa:failed": "MFA thất bại",
  "sso:login": "Đăng nhập SSO",
  "password:changed": "Đổi mật khẩu",
  "permission:denied": "Từ chối quyền",
  "role:changed": "Thay đổi vai trò",
  "access:granted": "Cấp quyền truy cập",
  "access:revoked": "Thu hồi quyền",
  "data:read": "Đọc dữ liệu",
  "data:write": "Ghi dữ liệu",
  "data:delete": "Xóa dữ liệu",
  "data:export": "Xuất dữ liệu",
  "user:created": "Tạo người dùng",
  "user:updated": "Cập nhật người dùng",
  "user:deleted": "Xóa người dùng",
  "config:changed": "Thay đổi cấu hình",
  "system:error": "Lỗi hệ thống",
  "compliance:check": "Kiểm tra tuân thủ",
  "data:backup": "Sao lưu dữ liệu",
  "data:restore": "Khôi phục dữ liệu",
};

const SEVERITY_COLORS = {
  low: "default",
  medium: "blue",
  high: "orange",
  critical: "red",
};

const STATUS_COLORS = {
  success: "green",
  failure: "red",
  warning: "orange",
  info: "blue",
};

const AuditLogsViewer = () => {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [statistics, setStatistics] = useState(null);
  const [selectedLog, setSelectedLog] = useState(null);
  const [detailModalVisible, setDetailModalVisible] = useState(false);

  // Filters
  const [filters, setFilters] = useState({
    eventType: null,
    severity: null,
    status: null,
    userEmail: "",
    startDate: null,
    endDate: null,
    limit: 100,
  });

  useEffect(() => {
    loadLogs();
    loadStatistics();
  }, []);

  const loadLogs = async () => {
    setLoading(true);
    try {
      const queryFilters = {
        ...filters,
        startDate: filters.startDate
          ? filters.startDate.format("YYYY-MM-DD")
          : null,
        endDate: filters.endDate ? filters.endDate.format("YYYY-MM-DD") : null,
      };

      // Remove null/empty values
      Object.keys(queryFilters).forEach((key) => {
        if (
          queryFilters[key] === null ||
          queryFilters[key] === "" ||
          queryFilters[key] === undefined
        ) {
          delete queryFilters[key];
        }
      });

      const data = await securityService.queryAuditLogs(queryFilters);
      setLogs(Array.isArray(data?.logs) ? data.logs : []);
    } catch (error) {
      console.error("Load audit logs error:", error);
      message.error("Không thể tải audit logs");
    } finally {
      setLoading(false);
    }
  };

  const loadStatistics = async () => {
    try {
      const stats = await securityService.getAuditStatistics({
        startDate: filters.startDate
          ? filters.startDate.format("YYYY-MM-DD")
          : null,
        endDate: filters.endDate ? filters.endDate.format("YYYY-MM-DD") : null,
      });
      setStatistics(stats);
    } catch (error) {
      console.error("Load statistics error:", error);
    }
  };

  const handleFilterChange = (key, value) => {
    setFilters({ ...filters, [key]: value });
  };

  const handleApplyFilters = () => {
    loadLogs();
    loadStatistics();
  };

  const handleResetFilters = () => {
    setFilters({
      eventType: null,
      severity: null,
      status: null,
      userEmail: "",
      startDate: null,
      endDate: null,
      limit: 100,
    });
    setTimeout(() => {
      loadLogs();
      loadStatistics();
    }, 100);
  };

  const handleExport = () => {
    try {
      const exportData = logs.map((log) => ({
        "Thời gian": log.timestampFormatted || log.timestamp,
        "Loại sự kiện": EVENT_TYPES[log.eventType] || log.eventType,
        "Mức độ": log.severity,
        "Trạng thái": log.status,
        Email: log.userEmail || "N/A",
        IP: log.ipAddress || "N/A",
        "Tài nguyên": log.resource || "N/A",
        "Hành động": log.action || "N/A",
      }));

      exportToCSV(exportData, "audit-logs");
      message.success("Đã xuất audit logs ra CSV");
    } catch (error) {
      message.error("Không thể xuất file");
    }
  };

  const handleViewDetails = (log) => {
    setSelectedLog(log);
    setDetailModalVisible(true);
  };

  const columns = [
    {
      title: "Thời gian",
      dataIndex: "timestampFormatted",
      key: "timestamp",
      render: (text, record) => (
        <Tooltip title={record.timestamp}>
          <span>{text || record.timestamp}</span>
        </Tooltip>
      ),
      sorter: (a, b) =>
        new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime(),
      width: 180,
    },
    {
      title: "Loại sự kiện",
      dataIndex: "eventType",
      key: "eventType",
      render: (eventType) => <Tag>{EVENT_TYPES[eventType] || eventType}</Tag>,
      filters: Object.keys(EVENT_TYPES).map((type) => ({
        text: EVENT_TYPES[type],
        value: type,
      })),
      onFilter: (value, record) => record.eventType === value,
      width: 200,
    },
    {
      title: "Mức độ",
      dataIndex: "severity",
      key: "severity",
      render: (severity) => (
        <Tag color={SEVERITY_COLORS[severity] || "default"}>
          {severity?.toUpperCase()}
        </Tag>
      ),
      filters: Object.keys(SEVERITY_COLORS).map((sev) => ({
        text: sev.toUpperCase(),
        value: sev,
      })),
      onFilter: (value, record) => record.severity === value,
      width: 100,
    },
    {
      title: "Trạng thái",
      dataIndex: "status",
      key: "status",
      render: (status) => (
        <Tag color={STATUS_COLORS[status] || "default"}>
          {status?.toUpperCase()}
        </Tag>
      ),
      filters: Object.keys(STATUS_COLORS).map((stat) => ({
        text: stat.toUpperCase(),
        value: stat,
      })),
      onFilter: (value, record) => record.status === value,
      width: 100,
    },
    {
      title: "Người dùng",
      dataIndex: "userEmail",
      key: "userEmail",
      render: (email) => email || "N/A",
      width: 200,
    },
    {
      title: "IP Address",
      dataIndex: "ipAddress",
      key: "ipAddress",
      render: (ip) => ip || "N/A",
      width: 150,
    },
    {
      title: "Hành động",
      key: "action",
      render: (_, record) => (
        <Button
          type="link"
          icon={<EyeOutlined />}
          onClick={() => handleViewDetails(record)}
        >
          Chi tiết
        </Button>
      ),
      width: 100,
    },
  ];

  return (
    <div className="security-container">
      <Card
        title={
          <Space>
            <FileSearchOutlined />
            <span>Audit Logs Viewer</span>
          </Space>
        }
        className="security-card"
      >
        {/* Statistics */}
        {statistics && (
          <Row gutter={16} style={{ marginBottom: "24px" }}>
            <Col span={6}>
              <Statistic
                title="Tổng sự kiện"
                value={statistics.totalEvents || 0}
              />
            </Col>
            <Col span={6}>
              <Statistic
                title="Sự kiện thành công"
                value={statistics.successCount || 0}
                valueStyle={{ color: "#3f8600" }}
              />
            </Col>
            <Col span={6}>
              <Statistic
                title="Sự kiện thất bại"
                value={statistics.failureCount || 0}
                valueStyle={{ color: "#cf1322" }}
              />
            </Col>
            <Col span={6}>
              <Statistic
                title="Sự kiện quan trọng"
                value={statistics.criticalCount || 0}
                valueStyle={{ color: "#ff4d4f" }}
              />
            </Col>
          </Row>
        )}

        {/* Filters */}
        <Card
          title={
            <Space>
              <FilterOutlined />
              <span>Bộ lọc</span>
            </Space>
          }
          style={{ marginBottom: "24px" }}
        >
          <Space wrap style={{ width: "100%" }}>
            <Select
              placeholder="Loại sự kiện"
              style={{ width: 200 }}
              allowClear
              value={filters.eventType}
              onChange={(value) => handleFilterChange("eventType", value)}
            >
              {Object.entries(EVENT_TYPES).map(([key, label]) => (
                <Option key={key} value={key}>
                  {label}
                </Option>
              ))}
            </Select>

            <Select
              placeholder="Mức độ"
              style={{ width: 150 }}
              allowClear
              value={filters.severity}
              onChange={(value) => handleFilterChange("severity", value)}
            >
              {Object.keys(SEVERITY_COLORS).map((sev) => (
                <Option key={sev} value={sev}>
                  {sev.toUpperCase()}
                </Option>
              ))}
            </Select>

            <Select
              placeholder="Trạng thái"
              style={{ width: 150 }}
              allowClear
              value={filters.status}
              onChange={(value) => handleFilterChange("status", value)}
            >
              {Object.keys(STATUS_COLORS).map((stat) => (
                <Option key={stat} value={stat}>
                  {stat.toUpperCase()}
                </Option>
              ))}
            </Select>

            <Input
              placeholder="Email người dùng"
              style={{ width: 200 }}
              value={filters.userEmail}
              onChange={(e) => handleFilterChange("userEmail", e.target.value)}
              allowClear
            />

            <RangePicker
              placeholder={["Ngày bắt đầu", "Ngày kết thúc"]}
              value={[filters.startDate, filters.endDate]}
              onChange={(dates) => {
                handleFilterChange("startDate", dates?.[0] || null);
                handleFilterChange("endDate", dates?.[1] || null);
              }}
            />

            <Button
              type="primary"
              icon={<FilterOutlined />}
              onClick={handleApplyFilters}
            >
              Áp dụng
            </Button>

            <Button icon={<ReloadOutlined />} onClick={handleResetFilters}>
              Đặt lại
            </Button>
          </Space>
        </Card>

        {/* Actions */}
        <Space style={{ marginBottom: "16px" }}>
          <Button
            icon={<ReloadOutlined />}
            onClick={() => {
              loadLogs();
              loadStatistics();
            }}
            loading={loading}
          >
            Làm mới
          </Button>
          <Button
            icon={<ExportOutlined />}
            onClick={handleExport}
            disabled={logs.length === 0}
          >
            Xuất CSV
          </Button>
        </Space>

        {/* Table */}
        <Table
          columns={columns}
          dataSource={logs}
          rowKey="id"
          loading={loading}
          pagination={{
            pageSize: 20,
            showSizeChanger: true,
            showTotal: (total) => `Tổng ${total} logs`,
          }}
        />

        {/* Detail Modal */}
        <Modal
          title="Chi tiết Audit Log"
          open={detailModalVisible}
          onCancel={() => setDetailModalVisible(false)}
          footer={null}
          width={800}
        >
          {selectedLog && (
            <Descriptions bordered column={2}>
              <Descriptions.Item label="ID" span={2}>
                {selectedLog.id}
              </Descriptions.Item>
              <Descriptions.Item label="Thời gian">
                {selectedLog.timestampFormatted || selectedLog.timestamp}
              </Descriptions.Item>
              <Descriptions.Item label="Loại sự kiện">
                <Tag>
                  {EVENT_TYPES[selectedLog.eventType] || selectedLog.eventType}
                </Tag>
              </Descriptions.Item>
              <Descriptions.Item label="Mức độ">
                <Tag color={SEVERITY_COLORS[selectedLog.severity]}>
                  {selectedLog.severity?.toUpperCase()}
                </Tag>
              </Descriptions.Item>
              <Descriptions.Item label="Trạng thái">
                <Tag color={STATUS_COLORS[selectedLog.status]}>
                  {selectedLog.status?.toUpperCase()}
                </Tag>
              </Descriptions.Item>
              <Descriptions.Item label="Email người dùng">
                {selectedLog.userEmail || "N/A"}
              </Descriptions.Item>
              <Descriptions.Item label="User ID">
                {selectedLog.userId || "N/A"}
              </Descriptions.Item>
              <Descriptions.Item label="IP Address">
                {selectedLog.ipAddress || "N/A"}
              </Descriptions.Item>
              <Descriptions.Item label="User Agent" span={2}>
                {selectedLog.userAgent || "N/A"}
              </Descriptions.Item>
              <Descriptions.Item label="Tài nguyên">
                {selectedLog.resource || "N/A"}
              </Descriptions.Item>
              <Descriptions.Item label="Hành động">
                {selectedLog.action || "N/A"}
              </Descriptions.Item>
              <Descriptions.Item label="Chi tiết" span={2}>
                <pre style={{ maxHeight: "200px", overflow: "auto" }}>
                  {JSON.stringify(selectedLog.details || {}, null, 2)}
                </pre>
              </Descriptions.Item>
              <Descriptions.Item label="Metadata" span={2}>
                <pre style={{ maxHeight: "200px", overflow: "auto" }}>
                  {JSON.stringify(selectedLog.metadata || {}, null, 2)}
                </pre>
              </Descriptions.Item>
            </Descriptions>
          )}
        </Modal>
      </Card>
    </div>
  );
};

export default AuditLogsViewer;
