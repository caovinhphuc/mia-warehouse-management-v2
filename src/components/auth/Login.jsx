import {
  GithubOutlined,
  GoogleOutlined,
  LockOutlined,
  UserOutlined,
  WindowsOutlined,
} from "@ant-design/icons";
import {
  Alert,
  App,
  Button,
  Card,
  Checkbox,
  Divider,
  Form,
  Input,
  Space,
  Typography,
} from "antd";
import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate, useSearchParams } from "react-router-dom";
import securityService, {
  loginUser,
  registerUser,
} from "../../services/securityService";
import Loading from "../Common/Loading";
import "./Auth.css";

const { Title, Text } = Typography;

const Login = () => {
  const { message } = App.useApp();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const dispatch = useDispatch();
  const { isAuthenticated } = useSelector((state) => state.auth);
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [isRegister, setIsRegister] = useState(false);
  const [error, setError] = useState(null);
  const [ssoLoading, setSsoLoading] = useState(null);

  // Lấy returnUrl từ query params
  const returnUrl = searchParams.get("returnUrl") || "/";

  // Redirect if already authenticated
  useEffect(() => {
    const token =
      localStorage.getItem("authToken") || localStorage.getItem("token");
    if (token || isAuthenticated) {
      // Nếu có returnUrl, redirect về đó, nếu không thì về home
      navigate(returnUrl !== "/" ? returnUrl : "/");
    }
  }, [isAuthenticated, navigate, returnUrl]);

  const handleSubmit = async (values) => {
    setLoading(true);
    setError(null);

    try {
      if (isRegister) {
        // Register
        await registerUser(values.email, values.password, "user");
        message.success("Đăng ký thành công! Vui lòng đăng nhập.");
        setIsRegister(false);
        form.resetFields();
      } else {
        // Login với các điều kiện theo thứ tự:
        // Step 1: Validate email/password format
        if (!values.email || !values.password) {
          setError("Vui lòng nhập đầy đủ email và mật khẩu");
          return;
        }

        // Step 2: Verify one.tga.com.vn login (nếu enabled)
        // Điều kiện tiên quyết: Phải đăng nhập one.tga.com.vn thành công
        // Function verifyOneTGALogin() sẽ được gọi bên trong loginUser()
        // Nếu đăng nhập one.tga.com.vn thành công → tiếp tục các bước sau

        // Hiển thị loading message cho user biết đang kiểm tra one.tga.com.vn
        const hideLoading = message.loading(
          "Đang kiểm tra đăng nhập one.tga.com.vn...",
          0
        );

        // Step 3: Proceed with backend login (sau khi verify one.tga.com.vn)
        let result;
        try {
          result = await loginUser(values.email, values.password);
          hideLoading();
        } catch (error) {
          hideLoading();
          throw error;
        }

        if (result.requiresMFA) {
          // MFA required - redirect to MFA page
          message.info("Vui lòng nhập mã MFA");
          navigate("/security", {
            state: { requiresMFA: true, email: values.email },
          });
        } else if (result?.token) {
          // Login success
          localStorage.setItem("authToken", result.token);
          localStorage.setItem("token", result.token);

          // Store sessionId if provided
          if (result.sessionId) {
            localStorage.setItem("sessionId", result.sessionId);
          }

          // Update Redux store
          dispatch({
            type: "LOGIN_SUCCESS",
            payload: {
              user: result.user,
              sessionId: result.sessionId,
              serviceAccount: result.serviceAccount,
            },
          });

          message.success("Đăng nhập thành công!");

          // Redirect về returnUrl nếu có, nếu không thì về home
          const redirectTo =
            returnUrl && returnUrl !== "/login" ? returnUrl : "/";
          navigate(redirectTo);
        }
      }
    } catch (err) {
      // Format error message for better display
      const errorMessage = err.message || "Đăng nhập thất bại";

      // Split multi-line error messages
      const errorLines = errorMessage.split("\n");
      const mainError = errorLines[0];
      const details = errorLines.slice(1).filter((line) => line.trim());

      setError(
        details.length > 0 ? `${mainError}\n${details.join("\n")}` : mainError
      );

      // Show error notification with details
      message.error({
        content: (
          <div>
            <div style={{ fontWeight: "bold", marginBottom: 4 }}>
              {mainError}
            </div>
            {details.length > 0 && (
              <div style={{ fontSize: "12px", color: "#ff7875" }}>
                {details.map((detail, idx) => (
                  <div key={idx}>{detail}</div>
                ))}
              </div>
            )}
          </div>
        ),
        duration: 8, // Show longer for network errors
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSSOLogin = async (provider) => {
    setSsoLoading(provider);
    try {
      const authData = await securityService.getSSOAuthUrl(provider);
      if (authData?.authUrl) {
        window.location.href = authData.authUrl;
      } else {
        message.error(`Không thể lấy URL xác thực từ ${provider}`);
        setSsoLoading(null);
      }
    } catch (error) {
      message.error(`Lỗi đăng nhập ${provider}: ${error.message}`);
      setSsoLoading(null);
    }
  };

  const ssoProviders = [
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
  ];

  if (loading && !isRegister) {
    return <Loading fullScreen text="Đang đăng nhập..." />;
  }

  return (
    <div className="auth-container">
      <div className="auth-wrapper">
        <Card className="auth-card">
          <div className="auth-header">
            <Title level={2} className="auth-title">
              {isRegister ? "📝 Đăng ký" : "🔐 Đăng nhập"}
            </Title>
            <Text type="secondary">
              {isRegister
                ? "Tạo tài khoản mới để sử dụng hệ thống"
                : "Chào mừng trở lại MIA.vn Integration"}
            </Text>
          </div>

          {error && (
            <Alert
              message={<div style={{ whiteSpace: "pre-line" }}>{error}</div>}
              type="error"
              showIcon
              closable
              onClose={() => setError(null)}
              style={{ marginBottom: 24 }}
              description={
                error.includes("Backend server không khả dụng") ||
                error.includes("Không thể kết nối") ? (
                  <div style={{ marginTop: 8, fontSize: "12px" }}>
                    <strong>Hướng dẫn khắc phục:</strong>
                    <ol style={{ marginTop: 4, paddingLeft: 20 }}>
                      <li>
                        Mở terminal và chạy:{" "}
                        <code>cd backend && npm start</code>
                      </li>
                      <li>Đảm bảo backend đang chạy trên port 8000</li>
                      <li>Kiểm tra console để xem lỗi chi tiết</li>
                    </ol>
                  </div>
                ) : null
              }
            />
          )}

          <Form
            form={form}
            name="auth"
            onFinish={handleSubmit}
            autoComplete="off"
            layout="vertical"
            size="large"
          >
            <Form.Item
              name="email"
              label="Email"
              rules={[
                { required: true, message: "Vui lòng nhập email!" },
                { type: "email", message: "Email không hợp lệ!" },
              ]}
            >
              <Input
                prefix={<UserOutlined />}
                placeholder="your@email.com"
                autoComplete="email"
              />
            </Form.Item>

            <Form.Item
              name="password"
              label="Mật khẩu"
              rules={[
                { required: true, message: "Vui lòng nhập mật khẩu!" },
                { min: 6, message: "Mật khẩu phải có ít nhất 6 ký tự!" },
              ]}
            >
              <Input.Password
                prefix={<LockOutlined />}
                placeholder="••••••••"
                autoComplete={isRegister ? "new-password" : "current-password"}
              />
            </Form.Item>

            {isRegister && (
              <Form.Item
                name="confirmPassword"
                label="Xác nhận mật khẩu"
                dependencies={["password"]}
                rules={[
                  { required: true, message: "Vui lòng xác nhận mật khẩu!" },
                  ({ getFieldValue }) => ({
                    validator(_, value) {
                      if (!value || getFieldValue("password") === value) {
                        return Promise.resolve();
                      }
                      return Promise.reject(
                        new Error("Mật khẩu xác nhận không khớp!")
                      );
                    },
                  }),
                ]}
              >
                <Input.Password
                  prefix={<LockOutlined />}
                  placeholder="••••••••"
                  autoComplete="new-password"
                />
              </Form.Item>
            )}

            {!isRegister && (
              <Form.Item>
                <div className="auth-options">
                  <Checkbox>Ghi nhớ đăng nhập</Checkbox>
                  <a href="#forgot" className="auth-link">
                    Quên mật khẩu?
                  </a>
                </div>
              </Form.Item>
            )}

            <Form.Item>
              <Button
                type="primary"
                htmlType="submit"
                block
                loading={loading}
                size="large"
              >
                {isRegister ? "Đăng ký" : "Đăng nhập"}
              </Button>
            </Form.Item>
          </Form>

          <Divider>Hoặc</Divider>

          <Space orientation="vertical" size="middle" style={{ width: "100%" }}>
            {ssoProviders.map((provider) => (
              <Button
                key={provider.id}
                icon={provider.icon}
                block
                size="large"
                loading={ssoLoading === provider.id}
                onClick={() => handleSSOLogin(provider.id)}
                style={{
                  borderColor: provider.color,
                  color: provider.color,
                }}
              >
                Đăng nhập với {provider.name}
              </Button>
            ))}
          </Space>

          <div className="auth-footer">
            <Text type="secondary">
              {isRegister ? "Đã có tài khoản? " : "Chưa có tài khoản? "}
              <a
                href="#"
                onClick={(e) => {
                  e.preventDefault();
                  setIsRegister(!isRegister);
                  form.resetFields();
                  setError(null);
                }}
                className="auth-link"
              >
                {isRegister ? "Đăng nhập" : "Đăng ký ngay"}
              </a>
            </Text>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default Login;
