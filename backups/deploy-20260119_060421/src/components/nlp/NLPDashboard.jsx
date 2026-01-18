/* eslint-disable */
/**
 * NLP Dashboard
 * Natural Language Processing features:
 * - Chat interface for data queries
 * - Voice commands integration
 * - Auto-generated summaries
 * - Smart search across all data
 */

import React, { useState, useEffect } from "react";
import { Card, Row, Col, Tabs, Typography, Space, Button, message } from "antd";
import {
  MessageOutlined,
  SoundOutlined,
  FileTextOutlined,
  SearchOutlined,
} from "@ant-design/icons";
import NLPChatInterface from "./NLPChatInterface";
import VoiceCommands from "./VoiceCommands";
import SmartSearch from "./SmartSearch";
import { smartAutomationService } from "../../services/smartAutomationService";
import "./NLPDashboard.css";

const { Title, Text } = Typography;

const NLPDashboard = () => {
  const [activeTab, setActiveTab] = useState("chat");
  const [sampleData, setSampleData] = useState([]);
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(false);

  // Load sample data
  useEffect(() => {
    // Sample data for demo
    const data = [
      {
        id: 1,
        name: "Product A",
        sales: 1500,
        date: "2024-01-01",
        category: "Electronics",
      },
      {
        id: 2,
        name: "Product B",
        sales: 2300,
        date: "2024-01-02",
        category: "Clothing",
      },
      {
        id: 3,
        name: "Product C",
        sales: 800,
        date: "2024-01-03",
        category: "Electronics",
      },
      {
        id: 4,
        name: "Product D",
        sales: 3200,
        date: "2024-01-04",
        category: "Food",
      },
      {
        id: 5,
        name: "Product E",
        sales: 1800,
        date: "2024-01-05",
        category: "Clothing",
      },
    ];
    setSampleData(data);

    // Auto-generate summary on mount
    generateAutoSummary(data);
  }, []);

  const generateAutoSummary = async (data) => {
    if (!data || data.length === 0) return;

    setLoading(true);
    try {
      const result = await smartAutomationService.generateSummary(data, 300);
      setSummary(result.summary || result);
    } catch (error) {
      console.error("Summary generation error:", error);
      // Fallback summary
      setSummary(`Tổng hợp ${data.length} mục dữ liệu.`);
    } finally {
      setLoading(false);
    }
  };

  const handleVoiceCommand = async (command) => {
    try {
      const result = await smartAutomationService.processVoiceCommand(command);
      message.success(`Đã xử lý lệnh: ${command}`);
      // You can process the result here
      console.log("Voice command result:", result);
    } catch (error) {
      message.error(`Lỗi xử lý lệnh: ${error.message}`);
    }
  };

  const handleSearchResultSelect = (result) => {
    message.info(`Đã chọn: ${JSON.stringify(result).substring(0, 50)}...`);
  };

  const handleChatQueryResult = (data, intent) => {
    // Handle query result from chat
    console.log("Query result:", data, intent);
  };

  return (
    <div className="nlp-dashboard">
      <Card className="dashboard-header-card">
        <Title level={2}>💬 Natural Language Processing</Title>
        <Text type="secondary">
          Chat interface, voice commands, summaries, and smart search
        </Text>
      </Card>

      <Row gutter={[16, 16]}>
        {/* Auto-generated Summary */}
        <Col xs={24}>
          <Card
            title={
              <Space>
                <FileTextOutlined /> Auto-generated Summary
              </Space>
            }
            extra={
              <Button
                size="small"
                onClick={() => generateAutoSummary(sampleData)}
                loading={loading}
              >
                Regenerate
              </Button>
            }
          >
            {loading ? (
              <Text type="secondary">Đang tạo summary...</Text>
            ) : summary ? (
              <Text>{summary}</Text>
            ) : (
              <Text type="secondary">Chưa có summary</Text>
            )}
          </Card>
        </Col>

        {/* Main Features */}
        <Col xs={24}>
          <Tabs
            activeKey={activeTab}
            onChange={setActiveTab}
            items={[
              {
                key: "chat",
                label: (
                  <Space>
                    <MessageOutlined /> Chat Interface
                  </Space>
                ),
                children: (
                  <NLPChatInterface
                    data={sampleData}
                    onQueryResult={handleChatQueryResult}
                  />
                ),
              },
              {
                key: "voice",
                label: (
                  <Space>
                    <SoundOutlined /> Voice Commands
                  </Space>
                ),
                children: <VoiceCommands onCommand={handleVoiceCommand} />,
              },
              {
                key: "search",
                label: (
                  <Space>
                    <SearchOutlined /> Smart Search
                  </Space>
                ),
                children: (
                  <SmartSearch
                    data={sampleData}
                    onResultSelect={handleSearchResultSelect}
                  />
                ),
              },
            ]}
          />
        </Col>
      </Row>
    </div>
  );
};

export default NLPDashboard;
