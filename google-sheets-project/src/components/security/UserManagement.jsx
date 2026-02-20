import React, { useState, useEffect } from "react";
import {
  Table,
  Card,
  Button,
  Space,
  Tag,
  Modal,
  Select,
  message,
  Popconfirm,
  Tooltip,
  Input,
  Badge,
} from "antd";
import {
  UserOutlined,
  EditOutlined,
  DeleteOutlined,
  ReloadOutlined,
  PlusOutlined,
  SafetyOutlined,
  SearchOutlined,
} from "@ant-design/icons";
import securityService from "../../services/securityService";
import "./Security.css";

const { Option } = Select;

const ROLE_COLORS = {
  admin: "red",
  manager: "orange",
  user: "blue",
  guest: "default",
};

const ROLE_LABELS = {
  admin: "Quản trị viên",
  manager: "Quản lý",
  user: "Người dùng",
  guest: "Khách",
};

const UserManagement = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchText, setSearchText] = useState("");
  const [editingUser, setEditingUser] = useState(null);
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [newRole, setNewRole] = useState(null);

  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = async () => {
    setLoading(true);
    try {
      const data = await securityService.getAllUsers();
      setUsers(Array.isArray(data) ? data : data?.users || []);
    } catch (error) {
      console.error("Load users error:", error);
      message.error("Không thể tải danh sách người dùng");
    } finally {
      setLoading(false);
    }
  };

  const handleEditRole = (user) => {
    setEditingUser(user);
    setNewRole(user.role);
    setEditModalVisible(true);
  };

  const handleSaveRole = async () => {
    if (!editingUser || !newRole) {
      message.warning("Vui lòng chọn vai trò mới");
      return;
    }

    setLoading(true);
    try {
      await securityService.updateUserRole(editingUser.id, newRole);
      message.success(`Đã cập nhật vai trò của ${editingUser.email}`);
      setEditModalVisible(false);
      setEditingUser(null);
      setNewRole(null);
      await loadUsers();
    } catch (error) {
      console.error("Update role error:", error);
      message.error(error.message || "Không thể cập nhật vai trò");
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteUser = async (userId, email) => {
    setLoading(true);
    try {
      await securityService.deleteUser(userId);
      message.success(`Đã xóa người dùng ${email}`);
      await loadUsers();
    } catch (error) {
      console.error("Delete user error:", error);
      message.error(error.message || "Không thể xóa người dùng");
    } finally {
      setLoading(false);
    }
  };

  const filteredUsers = users.filter((user) => {
    if (!searchText) return true;
    const searchLower = searchText.toLowerCase();
    return (
      user.email?.toLowerCase().includes(searchLower) ||
      user.role?.toLowerCase().includes(searchLower) ||
      user.id?.toString().includes(searchLower)
    );
  });

  const columns = [
    {
      title: "Email",
      dataIndex: "email",
      key: "email",
      render: (text, record) => (
        <Space>
          <UserOutlined />
          <span>{text || "N/A"}</span>
          {record.mfaEnabled && (
            <Tooltip title="MFA đã kích hoạt">
              <Badge status="success" />
            </Tooltip>
          )}
        </Space>
      ),
      sorter: (a, b) => (a.email || "").localeCompare(b.email || ""),
    },
    {
      title: "Vai trò",
      dataIndex: "role",
      key: "role",
      render: (role) => (
        <Tag color={ROLE_COLORS[role] || "default"}>
          {ROLE_LABELS[role] || role}
        </Tag>
      ),
      filters: Object.keys(ROLE_LABELS).map((role) => ({
        text: ROLE_LABELS[role],
        value: role,
      })),
      onFilter: (value, record) => record.role === value,
    },
    {
      title: "MFA",
      dataIndex: "mfaEnabled",
      key: "mfaEnabled",
      render: (enabled) => (
        <Tag color={enabled ? "green" : "default"}>
          {enabled ? "Đã bật" : "Chưa bật"}
        </Tag>
      ),
      filters: [
        { text: "Đã bật", value: true },
        { text: "Chưa bật", value: false },
      ],
      onFilter: (value, record) => record.mfaEnabled === value,
    },
    {
      title: "Quyền",
      dataIndex: "permissions",
      key: "permissions",
      render: (permissions) => {
        if (!permissions || !Array.isArray(permissions)) return "N/A";
        return (
          <Space wrap>
            {permissions.slice(0, 3).map((perm) => (
              <Tag key={perm} color="blue">
                {perm}
              </Tag>
            ))}
            {permissions.length > 3 && (
              <Tag color="default">+{permissions.length - 3}</Tag>
            )}
          </Space>
        );
      },
    },
    {
      title: "Hành động",
      key: "action",
      render: (_, record) => (
        <Space>
          <Tooltip title="Chỉnh sửa vai trò">
            <Button
              type="link"
              icon={<EditOutlined />}
              onClick={() => handleEditRole(record)}
            >
              Sửa
            </Button>
          </Tooltip>
          <Popconfirm
            title={`Bạn có chắc muốn xóa người dùng ${record.email}?`}
            description="Hành động này không thể hoàn tác."
            onConfirm={() => handleDeleteUser(record.id, record.email)}
            okText="Xóa"
            cancelText="Hủy"
            okButtonProps={{ danger: true }}
          >
            <Tooltip title="Xóa người dùng">
              <Button
                type="link"
                danger
                icon={<DeleteOutlined />}
                disabled={record.role === "admin"}
              >
                Xóa
              </Button>
            </Tooltip>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <div className="security-container">
      <Card
        title={
          <Space>
            <UserOutlined />
            <span>Quản lý người dùng</span>
          </Space>
        }
        className="security-card"
        extra={
          <Space>
            <Input
              placeholder="Tìm kiếm email, vai trò..."
              prefix={<SearchOutlined />}
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
              style={{ width: "250px" }}
              allowClear
            />
            <Button
              icon={<ReloadOutlined />}
              onClick={loadUsers}
              loading={loading}
            >
              Làm mới
            </Button>
          </Space>
        }
      >
        <Table
          columns={columns}
          dataSource={filteredUsers}
          rowKey="id"
          loading={loading}
          pagination={{
            pageSize: 10,
            showSizeChanger: true,
            showTotal: (total) => `Tổng ${total} người dùng`,
          }}
        />

        <Modal
          title={
            <Space>
              <EditOutlined />
              <span>Chỉnh sửa vai trò người dùng</span>
            </Space>
          }
          open={editModalVisible}
          onOk={handleSaveRole}
          onCancel={() => {
            setEditModalVisible(false);
            setEditingUser(null);
            setNewRole(null);
          }}
          confirmLoading={loading}
        >
          {editingUser && (
            <div>
              <p>
                <strong>Email:</strong> {editingUser.email}
              </p>
              <p style={{ marginTop: "16px", marginBottom: "8px" }}>
                <strong>Vai trò hiện tại:</strong>{" "}
                <Tag color={ROLE_COLORS[editingUser.role]}>
                  {ROLE_LABELS[editingUser.role]}
                </Tag>
              </p>
              <p style={{ marginTop: "16px", marginBottom: "8px" }}>
                <strong>Vai trò mới:</strong>
              </p>
              <Select
                value={newRole}
                onChange={setNewRole}
                style={{ width: "100%" }}
                placeholder="Chọn vai trò mới"
              >
                {Object.keys(ROLE_LABELS).map((role) => (
                  <Option key={role} value={role}>
                    <Tag color={ROLE_COLORS[role]}>{ROLE_LABELS[role]}</Tag>
                  </Option>
                ))}
              </Select>
            </div>
          )}
        </Modal>
      </Card>
    </div>
  );
};

export default UserManagement;
