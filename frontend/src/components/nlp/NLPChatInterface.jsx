 
/**
 * NLP Chat Interface
 * Chat interface for data queries using natural language
 */

import React, { useState, useRef, useEffect } from "react";
import {
  Card,
  Input,
  Button,
  List,
  Avatar,
  Typography,
  Space,
  Tag,
  Spin,
  Empty,
} from "antd";
import {
  SendOutlined,
  UserOutlined,
  RobotOutlined,
  ClearOutlined,
} from "@ant-design/icons";
import { smartAutomationService } from "../../services/smartAutomationService";
import "./NLPChatInterface.css";

const { TextArea } = Input;
const { Text } = Typography;

const NLPChatInterface = ({ data = null, onQueryResult = null }) => {
  const [messages, setMessages] = useState([
    {
      id: "welcome",
      role: "assistant",
      content:
        "Xin chào! Tôi có thể giúp bạn truy vấn và phân tích dữ liệu. Hãy hỏi tôi bất cứ điều gì!",
      timestamp: new Date(),
    },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = async () => {
    if (!input.trim() || loading) return;

    const userMessage = {
      id: Date.now(),
      role: "user",
      content: input,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setLoading(true);

    try {
      // Process query using NLP (simulated for now)
      const query = input.trim();
      const response = await processQuery(query, data);

      const assistantMessage = {
        id: Date.now() + 1,
        role: "assistant",
        content: response.text,
        intent: response.intent,
        data: response.data,
        timestamp: new Date(),
      };

      setMessages((prev) => [...prev, assistantMessage]);

      // Callback with query result
      if (onQueryResult && response.data) {
        onQueryResult(response.data, response.intent);
      }
    } catch (error) {
      console.error("Query processing error:", error);
      const errorMessage = {
        id: Date.now() + 1,
        role: "assistant",
        content: `Xin lỗi, đã xảy ra lỗi: ${error.message}`,
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setLoading(false);
    }
  };

  const processQuery = async (query, availableData) => {
    // Simple NLP processing (can be enhanced with backend API)
    const queryLower = query.toLowerCase();
    let response = {
      text: "",
      intent: "unknown",
      data: null,
    };

    // Pattern matching for common queries
    if (queryLower.includes("summary") || queryLower.includes("tổng kết")) {
      if (availableData && availableData.length > 0) {
        response.text = `Tôi tìm thấy ${availableData.length} mục dữ liệu. `;
        response.text += `Bạn muốn xem summary chi tiết không?`;
        response.intent = "summary";
        response.data = availableData.slice(0, 10);
      } else {
        response.text = "Hiện tại chưa có dữ liệu để tổng kết.";
      }
    } else if (queryLower.includes("filter") || queryLower.includes("lọc")) {
      response.text =
        "Tôi có thể giúp bạn lọc dữ liệu. Bạn muốn lọc theo tiêu chí nào?";
      response.intent = "filter";
    } else if (
      queryLower.includes("trend") ||
      queryLower.includes("xu hướng")
    ) {
      if (availableData && availableData.length > 0) {
        response.text = "Đang phân tích xu hướng...";
        response.intent = "trend";
        // Simulate trend analysis
        try {
          const trendResult = await smartAutomationService.analyzeTrends(
            availableData,
            "value" // Default column
          );
          response.text = `Xu hướng: ${trendResult.trend || "unknown"}, `;
          response.text += `Thay đổi: ${trendResult.change_percentage?.toFixed(1) || 0}%`;
          response.data = trendResult;
        } catch (err) {
          response.text = "Không thể phân tích xu hướng. Vui lòng thử lại.";
        }
      } else {
        response.text = "Cần dữ liệu để phân tích xu hướng.";
      }
    } else if (
      queryLower.includes("anomaly") ||
      queryLower.includes("bất thường")
    ) {
      if (availableData && availableData.length > 0) {
        response.text = "Đang tìm anomalies...";
        response.intent = "anomaly";
        try {
          const anomalies = await smartAutomationService.detectAnomalies(
            availableData,
            "value"
          );
          response.text = `Tìm thấy ${anomalies?.length || 0} anomalies.`;
          response.data = anomalies;
        } catch (err) {
          response.text = "Không thể tìm anomalies.";
        }
      }
    } else if (queryLower.includes("search") || queryLower.includes("tìm")) {
      response.text = "Tôi có thể giúp bạn tìm kiếm. Bạn đang tìm gì?";
      response.intent = "search";
    } else {
      response.text =
        "Tôi hiểu bạn muốn hỏi về dữ liệu. Bạn có thể hỏi tôi về: summary, filter, trend, anomaly, hoặc search.";
      response.intent = "general";
    }

    return response;
  };

  const handleClearChat = () => {
    setMessages([
      {
        id: "welcome",
        role: "assistant",
        content:
          "Xin chào! Tôi có thể giúp bạn truy vấn và phân tích dữ liệu. Hãy hỏi tôi bất cứ điều gì!",
        timestamp: new Date(),
      },
    ]);
  };

  return (
    <Card className="nlp-chat-interface">
      <div className="chat-header">
        <Space>
          <Avatar
            icon={<RobotOutlined />}
            style={{ backgroundColor: "#1890ff" }}
          />
          <div>
            <Text strong>AI Assistant</Text>
            <br />
            <Text type="secondary" style={{ fontSize: 12 }}>
              Natural Language Data Query
            </Text>
          </div>
        </Space>
        <Button
          type="text"
          icon={<ClearOutlined />}
          onClick={handleClearChat}
          size="small"
        >
          Clear
        </Button>
      </div>

      <div className="chat-messages">
        {messages.length === 0 ? (
          <Empty description="Chưa có tin nhắn nào" />
        ) : (
          <List
            dataSource={messages}
            renderItem={(message) => (
              <List.Item
                className={`message-item ${message.role === "user" ? "user-message" : "assistant-message"}`}
              >
                <Space align="start" style={{ width: "100%" }}>
                  <Avatar
                    icon={
                      message.role === "user" ? (
                        <UserOutlined />
                      ) : (
                        <RobotOutlined />
                      )
                    }
                    style={{
                      backgroundColor:
                        message.role === "user" ? "#87d068" : "#1890ff",
                    }}
                  />
                  <div className="message-content">
                    <div className="message-text">{message.content}</div>
                    {message.intent && (
                      <Tag color="blue" style={{ marginTop: 4 }}>
                        {message.intent}
                      </Tag>
                    )}
                    <Text
                      type="secondary"
                      style={{ fontSize: 11, display: "block", marginTop: 4 }}
                    >
                      {new Date(message.timestamp).toLocaleTimeString("vi-VN")}
                    </Text>
                  </div>
                </Space>
              </List.Item>
            )}
          />
        )}
        {loading && (
          <div className="loading-message">
            <Spin size="small" /> <Text type="secondary">Đang xử lý...</Text>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      <div className="chat-input">
        <Space.Compact style={{ width: "100%" }}>
          <Input
            placeholder='Hỏi tôi về dữ liệu... (VD: "Show me trends", "Find anomalies", "Summary data")'
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onPressEnter={handleSendMessage}
            disabled={loading}
            size="large"
          />
          <Button
            type="primary"
            icon={<SendOutlined />}
            onClick={handleSendMessage}
            loading={loading}
            size="large"
          >
            Send
          </Button>
        </Space.Compact>
        <Text
          type="secondary"
          style={{ fontSize: 12, marginTop: 8, display: "block" }}
        >
          💡 Gợi ý: "Show trends", "Find anomalies", "Summary", "Filter data",
          "Search..."
        </Text>
      </div>
    </Card>
  );
};

export default NLPChatInterface;
