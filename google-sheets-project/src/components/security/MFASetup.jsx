import React, { useState, useEffect } from "react";
import {
  message,
  Card,
  Button,
  Input,
  Steps,
  QRCode,
  Space,
  Divider,
  Alert,
  Spin,
} from "antd";
import {
  SafetyOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
  ReloadOutlined,
  LockOutlined,
} from "@ant-design/icons";
import securityService from "../../services/securityService";
import "./Security.css";

const { Step } = Steps;

const MFASetup = () => {
  const [current, setCurrent] = useState(0);
  const [loading, setLoading] = useState(false);
  const [mfaEnabled, setMfaEnabled] = useState(false);
  const [mfaSecret, setMfaSecret] = useState(null);
  const [verificationToken, setVerificationToken] = useState("");
  const [userProfile, setUserProfile] = useState(null);

  useEffect(() => {
    loadUserProfile();
  }, []);

  const loadUserProfile = async () => {
    try {
      const profile = await securityService.getCurrentUser();
      setUserProfile(profile?.user || profile);
      setMfaEnabled(profile?.user?.mfaEnabled || profile?.mfaEnabled || false);
    } catch (error) {
      console.error("Load user profile error:", error);
    }
  };

  const handleGenerateSecret = async () => {
    setLoading(true);
    try {
      const secretData = await securityService.generateMFASecret();
      setMfaSecret(secretData);
      setCurrent(1);
      message.success("MFA secret đã được tạo!");
    } catch (error) {
      message.error(error.message || "Không thể tạo MFA secret");
    } finally {
      setLoading(false);
    }
  };

  const handleEnableMFA = async () => {
    if (!verificationToken) {
      message.warning("Vui lòng nhập mã xác thực");
      return;
    }

    setLoading(true);
    try {
      await securityService.enableMFA(verificationToken);
      setMfaEnabled(true);
      setCurrent(2);
      message.success("MFA đã được kích hoạt thành công!");
      await loadUserProfile();
    } catch (error) {
      message.error(
        error.message ||
          "Không thể kích hoạt MFA. Vui lòng kiểm tra mã xác thực.",
      );
    } finally {
      setLoading(false);
    }
  };

  const handleDisableMFA = async () => {
    setLoading(true);
    try {
      await securityService.disableMFA();
      setMfaEnabled(false);
      setMfaSecret(null);
      setCurrent(0);
      message.success("MFA đã được tắt thành công!");
      await loadUserProfile();
    } catch (error) {
      message.error(error.message || "Không thể tắt MFA");
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setCurrent(0);
    setMfaSecret(null);
    setVerificationToken("");
  };

  const otpAuthUrl = mfaSecret
    ? `otpauth://totp/MIA.vn:${userProfile?.email || "user"}?secret=${mfaSecret.secret}&issuer=MIA.vn`
    : "";

  if (loading && !mfaSecret) {
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
            <SafetyOutlined />
            <span>Xác thực hai lớp (MFA)</span>
          </Space>
        }
        className="security-card"
      >
        {mfaEnabled && current !== 2 ? (
          <Alert
            message="MFA đã được kích hoạt"
            description="Tài khoản của bạn đã được bảo vệ bằng xác thực hai lớp."
            type="success"
            icon={<CheckCircleOutlined />}
            showIcon
            action={
              <Button
                danger
                onClick={handleDisableMFA}
                loading={loading}
                icon={<CloseCircleOutlined />}
              >
                Tắt MFA
              </Button>
            }
            style={{ marginBottom: "24px" }}
          />
        ) : null}

        <Steps current={current} onChange={setCurrent}>
          <Step title="Bắt đầu" description="Tạo MFA secret" />
          <Step title="Quét QR Code" description="Xác thực thiết bị" />
          <Step title="Hoàn tất" description="MFA đã kích hoạt" />
        </Steps>

        <Divider />

        {current === 0 && (
          <div className="mfa-step-content">
            <div style={{ textAlign: "center", marginBottom: "24px" }}>
              <LockOutlined style={{ fontSize: "64px", color: "#1890ff" }} />
              <h3 style={{ marginTop: "16px" }}>Bảo vệ tài khoản của bạn</h3>
              <p style={{ color: "#666", maxWidth: "500px", margin: "0 auto" }}>
                Xác thực hai lớp (MFA) giúp bảo vệ tài khoản của bạn bằng cách
                yêu cầu mã xác thực từ ứng dụng xác thực trên điện thoại khi
                đăng nhập.
              </p>
            </div>

            <div style={{ textAlign: "center" }}>
              <Button
                type="primary"
                size="large"
                icon={<SafetyOutlined />}
                onClick={handleGenerateSecret}
                loading={loading}
              >
                Tạo MFA Secret
              </Button>
            </div>
          </div>
        )}

        {current === 1 && mfaSecret && (
          <div className="mfa-step-content">
            <Alert
              message="Quét QR Code bằng ứng dụng xác thực"
              description="Sử dụng Google Authenticator, Microsoft Authenticator, hoặc ứng dụng tương tự để quét mã QR."
              type="info"
              showIcon
              style={{ marginBottom: "24px" }}
            />

            <div style={{ textAlign: "center", marginBottom: "24px" }}>
              <QRCode
                value={otpAuthUrl}
                size={256}
                style={{ margin: "0 auto" }}
              />
            </div>

            <div style={{ marginBottom: "24px", textAlign: "center" }}>
              <p style={{ marginBottom: "8px", fontWeight: "bold" }}>
                Hoặc nhập mã thủ công:
              </p>
              <Input
                value={mfaSecret.manualEntryKey || mfaSecret.secret}
                readOnly
                style={{
                  maxWidth: "300px",
                  textAlign: "center",
                  fontFamily: "monospace",
                  fontSize: "16px",
                  letterSpacing: "2px",
                }}
              />
            </div>

            <Divider>Nhập mã xác thực</Divider>

            <div style={{ maxWidth: "400px", margin: "0 auto" }}>
              <Input
                placeholder="Nhập mã 6 chữ số từ ứng dụng"
                value={verificationToken}
                onChange={(e) => setVerificationToken(e.target.value)}
                maxLength={6}
                style={{
                  fontSize: "20px",
                  textAlign: "center",
                  letterSpacing: "4px",
                  fontFamily: "monospace",
                  marginBottom: "16px",
                }}
              />
              <Space style={{ width: "100%", justifyContent: "center" }}>
                <Button onClick={handleReset} icon={<ReloadOutlined />}>
                  Quay lại
                </Button>
                <Button
                  type="primary"
                  onClick={handleEnableMFA}
                  loading={loading}
                  disabled={verificationToken.length !== 6}
                  icon={<CheckCircleOutlined />}
                >
                  Kích hoạt MFA
                </Button>
              </Space>
            </div>
          </div>
        )}

        {current === 2 && (
          <div className="mfa-step-content">
            <div style={{ textAlign: "center" }}>
              <CheckCircleOutlined
                style={{ fontSize: "64px", color: "#52c41a" }}
              />
              <h3 style={{ marginTop: "16px", color: "#52c41a" }}>
                MFA đã được kích hoạt thành công!
              </h3>
              <p style={{ color: "#666", marginBottom: "24px" }}>
                Tài khoản của bạn giờ đã được bảo vệ bằng xác thực hai lớp. Bạn
                sẽ cần nhập mã xác thực mỗi khi đăng nhập.
              </p>
              <Button type="primary" onClick={() => setCurrent(0)}>
                Quay lại
              </Button>
            </div>
          </div>
        )}
      </Card>
    </div>
  );
};

export default MFASetup;
