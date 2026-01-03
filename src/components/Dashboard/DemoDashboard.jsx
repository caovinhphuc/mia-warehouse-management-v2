import React, { useState } from "react";

const DemoDashboard = () => {
  const [activeTab, setActiveTab] = useState("demo");

  const tabStyle = (isActive) => ({
    padding: "10px 20px",
    margin: "0 5px",
    border: "1px solid #ddd",
    backgroundColor: isActive ? "#1976d2" : "#f5f5f5",
    color: isActive ? "white" : "#333",
    cursor: "pointer",
    borderRadius: "4px 4px 0 0",
  });

  const DemoContent = () => (
    <div style={{ padding: "20px", maxWidth: "800px", margin: "0 auto" }}>
      <h2>🚀 React Google Integration Demo</h2>

      <div
        style={{
          backgroundColor: "#e8f5e8",
          border: "1px solid #4caf50",
          borderRadius: "4px",
          padding: "15px",
          margin: "20px 0",
        }}
      >
        <h3>✅ Setup hoàn thành!</h3>
        <p>
          Ứng dụng React Google Integration đã được triển khai thành công với:
        </p>
        <ul>
          <li>✅ Google Sheets API integration</li>
          <li>✅ Google Drive API integration</li>
          <li>✅ Service architecture hoàn chỉnh</li>
          <li>✅ UI components responsive</li>
          <li>✅ Error handling và logging</li>
        </ul>
      </div>

      <div
        style={{
          backgroundColor: "#fff3cd",
          border: "1px solid #ffc107",
          borderRadius: "4px",
          padding: "15px",
          margin: "20px 0",
        }}
      >
        <h3>📋 Bước tiếp theo:</h3>
        <ol>
          <li>
            <strong>Cấu hình Google Services:</strong>
            <ul>
              <li>Tạo Google Cloud Project</li>
              <li>Enable Google Sheets API và Drive API</li>
              <li>Tạo Service Account và download JSON key</li>
            </ul>
          </li>
          <li>
            <strong>Cấu hình Environment:</strong>
            <ul>
              <li>
                Copy <code>env.example</code> thành <code>.env</code>
              </li>
              <li>Điền thông tin từ JSON key vào .env</li>
              <li>Share Google Sheet và Drive folder với service account</li>
            </ul>
          </li>
          <li>
            <strong>Test và chạy:</strong>
            <ul>
              <li>
                Chạy <code>npm run test:google</code> để test kết nối
              </li>
              <li>
                Chạy <code>npm start</code> để khởi động ứng dụng
              </li>
            </ul>
          </li>
        </ol>
      </div>

      <div
        style={{
          backgroundColor: "#f8d7da",
          border: "1px solid #dc3545",
          borderRadius: "4px",
          padding: "15px",
          margin: "20px 0",
        }}
      >
        <h3>⚠️ Lưu ý quan trọng:</h3>
        <p>
          Hiện tại ứng dụng chưa có file <code>.env</code> nên sẽ hiển thị lỗi
          configuration. Để test đầy đủ các tính năng, bạn cần:
        </p>
        <ul>
          <li>
            Tạo file <code>.env</code> từ <code>env.example</code>
          </li>
          <li>Cấu hình Google Service Account credentials</li>
          <li>Share quyền truy cập Google Sheet và Drive folder</li>
        </ul>
      </div>

      <div
        style={{
          backgroundColor: "#d1ecf1",
          border: "1px solid #bee5eb",
          borderRadius: "4px",
          padding: "15px",
          margin: "20px 0",
        }}
      >
        <h3>📚 Tài liệu tham khảo:</h3>
        <ul>
          <li>
            📖 <strong>SETUP_GUIDE.md</strong> - Hướng dẫn setup chi tiết
          </li>
          <li>
            📖 <strong>doc/user-guide/</strong> - Tài liệu hướng dẫn đầy đủ
          </li>
          <li>
            🔗{" "}
            <a
              href="https://console.cloud.google.com/"
              target="_blank"
              rel="noopener noreferrer"
            >
              Google Cloud Console
            </a>
          </li>
          <li>
            🔗{" "}
            <a
              href="https://developers.google.com/sheets/api"
              target="_blank"
              rel="noopener noreferrer"
            >
              Google Sheets API
            </a>
          </li>
          <li>
            🔗{" "}
            <a
              href="https://developers.google.com/drive/api"
              target="_blank"
              rel="noopener noreferrer"
            >
              Google Drive API
            </a>
          </li>
        </ul>
      </div>

      <div style={{ textAlign: "center", marginTop: "30px" }}>
        <p style={{ fontSize: "18px", color: "#666" }}>
          <strong>
            🎉 Chúc mừng! Ứng dụng React Google Integration đã sẵn sàng!
          </strong>
        </p>
        <p style={{ color: "#888" }}>
          Làm theo hướng dẫn trong SETUP_GUIDE.md để bắt đầu sử dụng
        </p>
      </div>
    </div>
  );

  return (
    <div style={{ minHeight: "100vh", backgroundColor: "#f9f9f9" }}>
      <div style={{ padding: "20px", maxWidth: "1200px", margin: "0 auto" }}>
        <h1 style={{ textAlign: "center", color: "#333" }}>
          Google Services Integration Demo
        </h1>

        <p style={{ textAlign: "center", color: "#666", marginBottom: "30px" }}>
          Demo ứng dụng React tích hợp Google Sheets và Google Drive
        </p>

        {/* Tab navigation */}
        <div style={{ marginBottom: "20px", borderBottom: "1px solid #ddd" }}>
          <button
            style={tabStyle(activeTab === "demo")}
            onClick={() => setActiveTab("demo")}
          >
            🎯 Demo & Setup
          </button>
        </div>

        {/* Tab content */}
        <div
          style={{
            backgroundColor: "white",
            borderRadius: "0 4px 4px 4px",
            boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
            minHeight: "500px",
          }}
        >
          {activeTab === "demo" && <DemoContent />}
        </div>
      </div>
    </div>
  );
};

export default DemoDashboard;
