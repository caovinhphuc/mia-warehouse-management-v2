/* eslint-disable */
import { useState, useEffect } from "react";
import importMetaEnv from "../../utils/importMetaEnv";
import {
  Card,
  Table,
  Button,
  Modal,
  Form,
  Input,
  Select,
  Tag,
  Space,
  message,
  Popconfirm,
  Typography,
  Divider,
  Statistic,
  Row,
  Col,
  Tooltip,
} from "antd";
import {
  PlusOutlined,
  DeleteOutlined,
  SendOutlined,
  BellOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
  ReloadOutlined,
} from "@ant-design/icons";
import "./AlertsManagement.css";

const { Title } = Typography;
const { TextArea } = Input;
const { Option } = Select;

const API_BASE_URL =
  importMetaEnv.VITE_API_URL ||
  importMetaEnv.REACT_APP_API_URL ||
  "http://localhost:3001";

const AlertsManagement = () => {
  const [alerts, setAlerts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [editingAlert, setEditingAlert] = useState(null);
  const [form] = Form.useForm();
  const [statistics, setStatistics] = useState({
    total: 0,
    sent: 0,
    failed: 0,
    pending: 0,
  });

  useEffect(() => {
    fetchAlerts();
    fetchStatistics();
  }, []);

  const fetchAlerts = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${API_BASE_URL}/api/alerts/history`);
      const data = await response.json();

      if (data.success) {
        setAlerts(
          (data.data || []).map((alert) => ({ ...alert, key: alert.id }))
        );
      }
    } catch (error) {
      console.error("Error fetching alerts:", error);
      message.error("Không thể tải danh sách alerts");
    } finally {
      setLoading(false);
    }
  };

  const fetchStatistics = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/alerts/statistics`);
      const data = await response.json();

      if (data.success) {
        setStatistics(data.data || statistics);
      }
    } catch (error) {
      console.error("Error fetching statistics:", error);
    }
  };

  const handleCreateAlert = async (values) => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/alerts/send`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: values.channels?.includes("email")
            ? {
                to: values.emailTo,
                subject: values.subject,
                text: values.message,
                html: values.htmlMessage || values.message,
              }
            : null,
          telegram: values.channels?.includes("telegram")
            ? {
                chatId: values.telegramChatId || undefined,
                message: values.message,
                parseMode: "HTML",
              }
            : null,
          channels: values.channels || ["email"],
        }),
      });

      const data = await response.json();

      if (data.success) {
        message.success("Alert đã được gửi thành công!");
        setIsModalVisible(false);
        form.resetFields();
        await fetchAlerts();
        await fetchStatistics();
      } else {
        throw new Error(data.error || "Failed to send alert");
      }
    } catch (error) {
      console.error("Error creating alert:", error);
      message.error(`Lỗi gửi alert: ${error.message}`);
    }
  };

  const handleTestAlert = async (channel = "all") => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/alerts/test`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ channel }),
      });

      const data = await response.json();

      if (data.success) {
        message.success("Test alert thành công!");
        await fetchStatistics();
        await fetchAlerts();
      } else {
        throw new Error(data.error || "Test failed");
      }
    } catch (error) {
      console.error("Error testing alert:", error);
      message.error(`Lỗi test alert: ${error.message}`);
    }
  };

  const handleDeleteAlert = async (id) => {
    // Note: Backend might not have delete endpoint
    message.info("Delete functionality depends on backend implementation");
  };

  const columns = [
    {
      title: "Thời gian",
      dataIndex: "timestamp",
      key: "timestamp",
      render: (text) => new Date(text).toLocaleString("vi-VN"),
      sorter: (a, b) => new Date(a.timestamp) - new Date(b.timestamp),
      width: 180,
    },
    {
      title: "Loại",
      dataIndex: "type",
      key: "type",
      render: (type) => {
        const colors = {
          email: "blue",
          telegram: "cyan",
          both: "purple",
        };
        return <Tag color={colors[type] || "default"}>{type}</Tag>;
      },
      width: 100,
    },
    {
      title: "Trạng thái",
      dataIndex: "status",
      key: "status",
      render: (status) => {
        const statusConfig = {
          sent: { color: "success", icon: <CheckCircleOutlined /> },
          success: { color: "success", icon: <CheckCircleOutlined /> },
          failed: { color: "error", icon: <CloseCircleOutlined /> },
          pending: { color: "warning", icon: <BellOutlined /> },
        };
        const config = statusConfig[status] || statusConfig.pending;
        return (
          <Tag color={config.color} icon={config.icon}>
            {status}
          </Tag>
        );
      },
      width: 120,
    },
    {
      title: "Nội dung",
      dataIndex: "message",
      key: "message",
      ellipsis: true,
      render: (text) => {
        if (!text) return "-";
        const htmlMatch = text.match(/<[^>]+>/);
        if (htmlMatch) {
          // Extract text from HTML
          const textContent = text.replace(/<[^>]+>/g, "").trim();
          return textContent || text.substring(0, 50);
        }
        return text.length > 50 ? text.substring(0, 50) + "..." : text;
      },
    },
    {
      title: "Hành động",
      key: "action",
      width: 100,
      render: (_, record) => (
        <Popconfirm
          title="Xóa alert này?"
          onConfirm={() => handleDeleteAlert(record.id)}
          okText="Xóa"
          cancelText="Hủy"
        >
          <Button type="link" danger icon={<DeleteOutlined />} size="small" />
        </Popconfirm>
      ),
    },
  ];

  return (
    <div style={{ padding: 16 }}>
      {/* Header */}
      <Card>
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: 16,
          }}
        >
          <Title level={2} style={{ margin: 0 }}>
            <BellOutlined /> Quản Lý Alerts
          </Title>
          <Space>
            <Tooltip title="Refresh">
              <Button
                icon={<ReloadOutlined />}
                onClick={() => {
                  fetchAlerts();
                  fetchStatistics();
                }}
              />
            </Tooltip>
            <Button
              icon={<SendOutlined />}
              onClick={() => handleTestAlert("all")}
            >
              Test Alerts
            </Button>
            <Button
              type="primary"
              icon={<PlusOutlined />}
              onClick={() => {
                setEditingAlert(null);
                setIsModalVisible(true);
              }}
            >
              Tạo Alert Mới
            </Button>
          </Space>
        </div>

        {/* Statistics */}
        <Row gutter={16}>
          <Col xs={12} sm={6}>
            <Statistic
              title="Tổng số"
              value={statistics.total}
              prefix={<BellOutlined />}
            />
          </Col>
          <Col xs={12} sm={6}>
            <Statistic
              title="Đã gửi"
              value={statistics.sent}
              valueStyle={{ color: "#3f8600" }}
              prefix={<CheckCircleOutlined />}
            />
          </Col>
          <Col xs={12} sm={6}>
            <Statistic
              title="Thất bại"
              value={statistics.failed}
              valueStyle={{ color: "#cf1322" }}
              prefix={<CloseCircleOutlined />}
            />
          </Col>
          <Col xs={12} sm={6}>
            <Statistic
              title="Đang chờ"
              value={statistics.pending}
              valueStyle={{ color: "#faad14" }}
              prefix={<BellOutlined />}
            />
          </Col>
        </Row>
      </Card>

      {/* Alerts Table */}
      <Card
        title={
          <Space>
            <span>Danh sách Alerts</span>
            <Tag>{alerts.length}</Tag>
          </Space>
        }
        style={{ marginTop: 16 }}
      >
        <Table
          columns={columns}
          dataSource={alerts}
          loading={loading}
          rowKey="id"
          pagination={{ pageSize: 10, showSizeChanger: true }}
          size="middle"
        />
      </Card>

      {/* Create/Edit Modal */}
      <Modal
        title={editingAlert ? "Chỉnh sửa Alert" : "Tạo Alert Mới"}
        open={isModalVisible}
        onCancel={() => {
          setIsModalVisible(false);
          form.resetFields();
          setEditingAlert(null);
        }}
        footer={null}
        width={600}
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handleCreateAlert}
          initialValues={{
            channels: ["email"],
          }}
        >
          <Form.Item
            name="channels"
            label="Kênh gửi"
            rules={[{ required: true, message: "Chọn ít nhất một kênh!" }]}
          >
            <Select mode="multiple" placeholder="Chọn kênh gửi">
              <Option value="email">Email</Option>
              <Option value="telegram">Telegram</Option>
            </Select>
          </Form.Item>

          <Form.Item
            name="emailTo"
            label="Email người nhận"
            rules={[
              {
                type: "email",
                message: "Email không hợp lệ!",
              },
            ]}
          >
            <Input placeholder="email@example.com" />
          </Form.Item>

          <Form.Item name="telegramChatId" label="Telegram Chat ID (tùy chọn)">
            <Input placeholder="-123456789" />
          </Form.Item>

          <Form.Item
            name="subject"
            label="Tiêu đề"
            rules={[{ required: true, message: "Vui lòng nhập tiêu đề!" }]}
          >
            <Input placeholder="Tiêu đề alert" />
          </Form.Item>

          <Form.Item
            name="message"
            label="Nội dung"
            rules={[{ required: true, message: "Vui lòng nhập nội dung!" }]}
          >
            <TextArea rows={4} placeholder="Nội dung alert" />
          </Form.Item>

          <Form.Item name="htmlMessage" label="Nội dung HTML (tùy chọn)">
            <TextArea rows={4} placeholder="<p>Nội dung HTML</p>" />
          </Form.Item>

          <Form.Item>
            <Space>
              <Button type="primary" htmlType="submit">
                {editingAlert ? "Cập nhật Alert" : "Tạo Alert"}
              </Button>
              <Button
                onClick={() => {
                  setIsModalVisible(false);
                  form.resetFields();
                  setEditingAlert(null);
                }}
              >
                Hủy
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default AlertsManagement;
