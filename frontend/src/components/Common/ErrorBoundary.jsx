import importMetaEnv from "@utils/importMetaEnv";
import { Button, Result } from "antd";
import React from "react";

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error) {
    // Update state so the next render will show the fallback UI
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    // Log error to monitoring service
    this.setState({
      error,
      errorInfo,
    });

    // Send error to analytics/monitoring
    if (window.gtag) {
      window.gtag("event", "exception", {
        description: error.toString(),
        fatal: false,
      });
    }

    // Bỏ log console - dễ gây lỗi thứ cấp trong test/prod (Jest mock, drop_console)
    // Chi tiết lỗi vẫn hiển thị trong fallback UI khi DEV

    // Send to error tracking service
    if (importMetaEnv.VITE_SENTRY_DSN || importMetaEnv.REACT_APP_SENTRY_DSN) {
      // Sentry integration would go here
    }
  }

  handleRetry = () => {
    this.setState({ hasError: false, error: null, errorInfo: null });
  };

  handleReportError = () => {
    // Report error to support team
    const errorReport = {
      error: this.state.error?.toString(),
      stack: this.state.error?.stack,
      componentStack: this.state.errorInfo?.componentStack,
      userAgent: navigator.userAgent,
      timestamp: new Date().toISOString(),
      url: window.location.href,
    };

    // Send to support endpoint
    fetch("/api/error-report", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(errorReport),
    }).catch(() => {
      // Fallback: open email client
      const subject = encodeURIComponent("Error Report - MIA.vn Integration");
      const body = encodeURIComponent(JSON.stringify(errorReport, null, 2));
      window.open(`mailto:support@mia.vn?subject=${subject}&body=${body}`);
    });
  };

  render() {
    if (this.state.hasError) {
      // Custom error UI
      return (
        <div style={{ padding: "40px", maxWidth: "800px", margin: "0 auto" }}>
          <Result
            status="error"
            title="⚠️ Đã xảy ra lỗi"
            subTitle="Ứng dụng gặp lỗi không mong muốn. Vui lòng thử lại hoặc báo cáo lỗi."
            extra={[
              <Button type="primary" key="retry" onClick={this.handleRetry}>
                🔄 Thử lại
              </Button>,
              <Button key="report" onClick={this.handleReportError}>
                📧 Báo cáo lỗi
              </Button>,
              <Button key="home" onClick={() => (window.location.href = "/")}>
                🏠 Về trang chủ
              </Button>,
            ]}
          >
            {(importMetaEnv.DEV || importMetaEnv.MODE === "development") &&
              this.state.error && (
                <details style={{ whiteSpace: "pre-wrap", marginTop: "20px" }}>
                  <summary style={{ cursor: "pointer", marginBottom: "10px" }}>
                    Chi tiết lỗi (Development)
                  </summary>
                  <div
                    style={{
                      background: "#f5f5f5",
                      padding: "15px",
                      borderRadius: "4px",
                      fontSize: "12px",
                      fontFamily: "monospace",
                    }}
                  >
                    <strong>Error:</strong> {this.state.error.toString()}
                    <br />
                    <br />
                    <strong>Stack:</strong>
                    <br />
                    {this.state.error.stack}
                    <br />
                    <br />
                    <strong>Component Stack:</strong>
                    <br />
                    {this.state.errorInfo?.componentStack}
                  </div>
                </details>
              )}
          </Result>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
