import React, { useState } from "react";
import { Tabs, Card, Space } from "antd";
import {
  SafetyOutlined,
  UserOutlined,
  FileSearchOutlined,
  SettingOutlined,
  LoginOutlined,
  LockOutlined,
} from "@ant-design/icons";
import MFASetup from "./MFASetup";
import SSOLogin from "./SSOLogin";
import UserManagement from "./UserManagement";
import AuditLogsViewer from "./AuditLogsViewer";
import SecuritySettings from "./SecuritySettings";
import "./Security.css";

const SecurityDashboard = () => {
  const [activeTab, setActiveTab] = useState("mfa");

  const tabItems = [
    {
      key: "mfa",
      label: (
        <Space>
          <SafetyOutlined />
          <span>MFA Setup</span>
        </Space>
      ),
      children: <MFASetup />,
    },
    {
      key: "sso",
      label: (
        <Space>
          <LoginOutlined />
          <span>SSO Login</span>
        </Space>
      ),
      children: <SSOLogin />,
    },
    {
      key: "users",
      label: (
        <Space>
          <UserOutlined />
          <span>Quản lý người dùng</span>
        </Space>
      ),
      children: <UserManagement />,
    },
    {
      key: "audit",
      label: (
        <Space>
          <FileSearchOutlined />
          <span>Audit Logs</span>
        </Space>
      ),
      children: <AuditLogsViewer />,
    },
    {
      key: "settings",
      label: (
        <Space>
          <SettingOutlined />
          <span>Cài đặt</span>
        </Space>
      ),
      children: <SecuritySettings />,
    },
  ];

  return (
    <div className="security-dashboard">
      <Card
        title={
          <Space>
            <LockOutlined />
            <span>Enterprise Security Dashboard</span>
          </Space>
        }
        className="security-dashboard-card"
      >
        <Tabs
          activeKey={activeTab}
          onChange={setActiveTab}
          type="card"
          size="large"
          items={tabItems}
        />
      </Card>
    </div>
  );
};

export default SecurityDashboard;
