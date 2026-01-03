import React, { useState, useEffect } from "react";
import { Card, Button, Space, Divider, Alert, Spin } from "antd";
import {
  GoogleOutlined,
  GithubOutlined,
  WindowsOutlined,
  LoginOutlined,
  SafetyOutlined,
} from "@ant-design/icons";
import { message } from "antd";
import securityService from "../../services/securityService";
import "./Security.css";

const SSOLogin = () => {
  const [loading, setLoading] = useState(null);
  const [providers, setProviders] = useState([
    {
      id: "google",
      name: "Google",
      icon: <GoogleOutlined />,
      color: "#4285F4",
    },
    {
      id: "github",
      name: "GitHub",
      icon: <GithubOutlined />,
      color: "#24292e",
    },
    {
      id: "microsoft",
      name: "Microsoft",
      icon: <WindowsOutlined />,
      color: "#00A1F1",
    },
  ]);

  const handleSSOLogin = async (provider) => {
    setLoading(provider);
    try {
      // Get authorization URL
      const authData = await securityService.getSSOAuthUrl(provider);

      if (authData?.authUrl) {
        // Redirect to OAuth provider
        window.location.href = authData.authUrl;
      } else {
        message.error(`Không thể lấy URL xác thực từ ${provider}`);
        setLoading(null);
      }
    } catch (error) {
      console.error(`SSO login error for ${provider}:`, error);
      message.error(error.message || `Đăng nhập ${provider} thất bại`);
      setLoading(null);
    }
  };

  // Handle SSO callback from URL params
  useEffect(() => {
    if (typeof window !== "undefined" && window.location) {
      const urlParams = new (window.URLSearchParams || URLSearchParams)(
        window.location.search,
      );
      const code = urlParams.get("code");
      const state = urlParams.get("state");
      const provider =
        urlParams.get("provider") || (state ? state.split("_")[0] : null);

      if (code && provider) {
        handleSSOCallback(provider, code, state);
      }
    }
  }, []);

  const handleSSOCallback = async (provider, code, state) => {
    setLoading(provider);
    try {
      const userData = await securityService.handleSSOCallback(
        provider,
        code,
        state,
      );

      if (userData?.token) {
        message.success(`Đăng nhập ${provider} thành công!`);
        // Redirect to dashboard or home
        setTimeout(() => {
          window.location.href = "/";
        }, 1000);
      } else {
        message.error(`Đăng nhập ${provider} thất bại`);
      }
    } catch (error) {
      console.error(`SSO callback error for ${provider}:`, error);
      message.error(error.message || `Đăng nhập ${provider} thất bại`);
    } finally {
      setLoading(null);
      // Clean URL
      window.history.replaceState({}, document.title, window.location.pathname);
    }
  };

  return (
    <div className="security-container">
      <Card
        title={
          <Space>
            <LoginOutlined />
            <span>Đăng nhập bằng SSO</span>
          </Space>
        }
        className="security-card"
      >
        <Alert
          message="Đăng nhập nhanh và an toàn"
          description="Sử dụng tài khoản Google, GitHub, hoặc Microsoft để đăng nhập. Không cần nhớ mật khẩu riêng."
          type="info"
          icon={<SafetyOutlined />}
          showIcon
          style={{ marginBottom: "24px" }}
        />

        <div className="sso-buttons-container">
          <Space direction="vertical" size="middle" style={{ width: "100%" }}>
            {providers.map((provider) => (
              <Button
                key={provider.id}
                type="primary"
                size="large"
                icon={provider.icon}
                loading={loading === provider.id}
                onClick={() => handleSSOLogin(provider.id)}
                style={{
                  width: "100%",
                  height: "50px",
                  backgroundColor:
                    loading === provider.id ? "#d9d9d9" : provider.color,
                  borderColor: provider.color,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: "8px",
                }}
                disabled={loading !== null}
              >
                Đăng nhập với {provider.name}
              </Button>
            ))}
          </Space>
        </div>

        <Divider>Hoặc</Divider>

        <div style={{ textAlign: "center", color: "#666" }}>
          <p>
            Bạn có thể sử dụng email và mật khẩu để đăng nhập{" "}
            <a href="/login">tại đây</a>
          </p>
        </div>

        {loading && (
          <div style={{ textAlign: "center", marginTop: "24px" }}>
            <Spin size="large" />
            <p style={{ marginTop: "16px", color: "#666" }}>
              Đang chuyển hướng đến nhà cung cấp...
            </p>
          </div>
        )}
      </Card>
    </div>
  );
};

export default SSOLogin;
