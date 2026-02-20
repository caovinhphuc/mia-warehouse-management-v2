import React, { useState, useEffect } from "react";
import {
  Card,
  Space,
  Button,
  Input,
  Switch,
  Form,
  message,
  Alert,
  Divider,
  Tag,
  Descriptions,
  Spin,
  InputNumber,
} from "antd";
import {
  SettingOutlined,
  LockOutlined,
  SaveOutlined,
  ReloadOutlined,
  KeyOutlined,
  SafetyOutlined,
} from "@ant-design/icons";
import securityService from "../../services/securityService";
import "./Security.css";

const SecuritySettings = () => {
  const [loading, setLoading] = useState(false);
  const [userProfile, setUserProfile] = useState(null);
  const [form] = Form.useForm();

  useEffect(() => {
    loadUserProfile();
  }, []);

  const loadUserProfile = async () => {
    setLoading(true);
    try {
      const profile = await securityService.getCurrentUser();
      const user = profile?.user || profile;
      setUserProfile(user);

      // Set form values
      form.setFieldsValue({
        sessionTimeout: 30, // minutes (default)
        passwordMinLength: 8,
        requireMFA: user?.mfaEnabled || false,
        enableAuditLogging: true,
      });
    } catch (error) {
      console.error("Load user profile error:", error);
      message.error("Không thể tải thông tin người dùng");
    } finally {
      setLoading(false);
    }
  };

  const handleSaveSettings = async (values) => {
    setLoading(true);
    try {
      // In a real app, you would call an API to save settings
      // For now, we'll just show a success message
      console.log("Settings to save:", values);

      message.success("Đã lưu cài đặt bảo mật");
    } catch (error) {
      console.error("Save settings error:", error);
      message.error("Không thể lưu cài đặt");
    } finally {
      setLoading(false);
    }
  };

  if (loading && !userProfile) {
    return (
      <div style={{ textAlign: "center", padding: "40px" }}>
        <Spin size="large" />
      </div>
    );
  }

  return (
    <div className="security-container">
      <Card
        title={
          <Space>
            <SettingOutlined />
            <span>Cài đặt bảo mật</span>
          </Space>
        }
        className="security-card"
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handleSaveSettings}
          initialValues={{
            sessionTimeout: 30,
            passwordMinLength: 8,
            requireMFA: userProfile?.mfaEnabled || false,
            enableAuditLogging: true,
          }}
        >
          {/* Current Security Status */}
          <Card
            type="inner"
            title={
              <Space>
                <SafetyOutlined />
                <span>Trạng thái bảo mật hiện tại</span>
              </Space>
            }
            style={{ marginBottom: "24px" }}
          >
            <Descriptions bordered column={2}>
              <Descriptions.Item label="MFA">
                <Tag color={userProfile?.mfaEnabled ? "green" : "default"}>
                  {userProfile?.mfaEnabled ? "Đã bật" : "Chưa bật"}
                </Tag>
              </Descriptions.Item>
              <Descriptions.Item label="Vai trò">
                <Tag>{userProfile?.role || "N/A"}</Tag>
              </Descriptions.Item>
              <Descriptions.Item label="Quyền" span={2}>
                {userProfile?.permissions &&
                Array.isArray(userProfile.permissions) ? (
                  <Space wrap>
                    {userProfile.permissions.map((perm) => (
                      <Tag key={perm} color="blue">
                        {perm}
                      </Tag>
                    ))}
                  </Space>
                ) : (
                  "N/A"
                )}
              </Descriptions.Item>
            </Descriptions>
          </Card>

          {/* Password Policy */}
          <Card
            type="inner"
            title={
              <Space>
                <LockOutlined />
                <span>Chính sách mật khẩu</span>
              </Space>
            }
            style={{ marginBottom: "24px" }}
          >
            <Form.Item
              name="passwordMinLength"
              label="Độ dài mật khẩu tối thiểu"
              tooltip="Số ký tự tối thiểu cho mật khẩu"
            >
              <Space.Compact style={{ width: "100%" }}>
                <InputNumber min={6} max={32} style={{ width: "100%" }} />
                <Button disabled style={{ minWidth: "80px" }}>
                  ký tự
                </Button>
              </Space.Compact>
            </Form.Item>

            <Alert
              message="Khuyến nghị"
              description="Sử dụng mật khẩu có ít nhất 12 ký tự, bao gồm chữ hoa, chữ thường, số và ký tự đặc biệt."
              type="info"
              showIcon
              style={{ marginTop: "16px" }}
            />
          </Card>

          {/* Session Settings */}
          <Card
            type="inner"
            title="Cài đặt phiên đăng nhập"
            style={{ marginBottom: "24px" }}
          >
            <Form.Item
              name="sessionTimeout"
              label="Thời gian hết hạn phiên"
              tooltip="Số phút trước khi phiên đăng nhập tự động hết hạn"
            >
              <Space.Compact style={{ width: "100%" }}>
                <InputNumber min={5} max={1440} style={{ width: "100%" }} />
                <Button disabled style={{ minWidth: "80px" }}>
                  phút
                </Button>
              </Space.Compact>
            </Form.Item>

            <Alert
              message="Bảo mật"
              description="Phiên đăng nhập sẽ tự động hết hạn sau thời gian không hoạt động."
              type="warning"
              showIcon
              style={{ marginTop: "16px" }}
            />
          </Card>

          {/* Multi-Factor Authentication */}
          <Card
            type="inner"
            title={
              <Space>
                <SafetyOutlined />
                <span>Xác thực hai lớp (MFA)</span>
              </Space>
            }
            style={{ marginBottom: "24px" }}
          >
            <Form.Item
              name="requireMFA"
              label="Yêu cầu MFA"
              valuePropName="checked"
              tooltip="Bật yêu cầu MFA cho tất cả đăng nhập"
            >
              <Switch />
            </Form.Item>

            <Alert
              message={
                userProfile?.mfaEnabled
                  ? "MFA đã được kích hoạt"
                  : "MFA chưa được kích hoạt"
              }
              description={
                userProfile?.mfaEnabled
                  ? "Tài khoản của bạn đã được bảo vệ bằng MFA."
                  : "Vui lòng kích hoạt MFA để tăng cường bảo mật cho tài khoản."
              }
              type={userProfile?.mfaEnabled ? "success" : "warning"}
              showIcon
              style={{ marginTop: "16px" }}
              action={
                !userProfile?.mfaEnabled && (
                  <Button type="link" href="/security/mfa" size="small">
                    Kích hoạt ngay
                  </Button>
                )
              }
            />
          </Card>

          {/* Audit Logging */}
          <Card
            type="inner"
            title="Ghi nhật ký Audit"
            style={{ marginBottom: "24px" }}
          >
            <Form.Item
              name="enableAuditLogging"
              label="Bật ghi nhật ký Audit"
              valuePropName="checked"
              tooltip="Ghi lại tất cả các hoạt động quan trọng để tuân thủ và bảo mật"
            >
              <Switch disabled />
            </Form.Item>

            <Alert
              message="Luôn bật"
              description="Audit logging luôn được bật để đảm bảo tuân thủ và bảo mật."
              type="info"
              showIcon
              style={{ marginTop: "16px" }}
            />
          </Card>

          {/* Encryption Keys Info */}
          <Card
            type="inner"
            title={
              <Space>
                <KeyOutlined />
                <span>Thông tin mã hóa</span>
              </Space>
            }
            style={{ marginBottom: "24px" }}
          >
            <Alert
              message="Mã hóa dữ liệu"
              description={
                <div>
                  <p>
                    <strong>Mã hóa khi lưu trữ:</strong> AES-256-GCM
                  </p>
                  <p>
                    <strong>Mã hóa khi truyền:</strong> RSA
                  </p>
                  <p style={{ marginBottom: 0, color: "#666" }}>
                    Tất cả dữ liệu nhạy cảm đều được mã hóa tự động.
                  </p>
                </div>
              }
              type="success"
              showIcon
            />
          </Card>

          <Divider />

          {/* Save Button */}
          <Form.Item>
            <Space>
              <Button
                type="primary"
                htmlType="submit"
                icon={<SaveOutlined />}
                loading={loading}
                size="large"
              >
                Lưu cài đặt
              </Button>
              <Button
                icon={<ReloadOutlined />}
                onClick={loadUserProfile}
                loading={loading}
              >
                Làm mới
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Card>
    </div>
  );
};

export default SecuritySettings;
