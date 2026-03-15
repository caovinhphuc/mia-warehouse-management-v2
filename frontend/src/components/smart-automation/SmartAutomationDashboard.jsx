 
/**
 * Smart Automation Dashboard
 * AI-powered data analysis, predictive alerts, categorization, and reports
 */

import React, { useState, useEffect } from "react";
import {
  Card,
  Row,
  Col,
  Typography,
  Button,
  Table,
  Tag,
  Space,
  Input,
  Select,
  Tabs,
  Alert,
  Spin,
  message,
  Collapse,
  Descriptions,
  Statistic,
} from "antd";
import {
  ThunderboltOutlined,
  WarningOutlined,
  TagOutlined,
  FileTextOutlined,
  SearchOutlined,
  ReloadOutlined,
} from "@ant-design/icons";
import { smartAutomationService } from "../../services/smartAutomationService";
import "./SmartAutomationDashboard.css";

const { Title, Text } = Typography;
const { TextArea } = Input;
const { Option } = Select;
const { Panel } = Collapse;

const SmartAutomationDashboard = () => {
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState("patterns");

  // Pattern Recognition
  const [patternData, setPatternData] = useState([]);
  const [patternResults, setPatternResults] = useState(null);
  const [valueColumn, setValueColumn] = useState("value");

  // Predictive Alerts
  const [alerts, setAlerts] = useState([]);

  // Categorization
  const [categorizedData, setCategorizedData] = useState([]);

  // Reports
  const [generatedReport, setGeneratedReport] = useState(null);
  const [reportType, setReportType] = useState("comprehensive");

  // Sample data for testing
  const sampleData = [
    { name: "Day 1", value: 45, date: "2024-01-01" },
    { name: "Day 2", value: 52, date: "2024-01-02" },
    { name: "Day 3", value: 48, date: "2024-01-03" },
    { name: "Day 4", value: 120, date: "2024-01-04" }, // Anomaly
    { name: "Day 5", value: 50, date: "2024-01-05" },
    { name: "Day 6", value: 55, date: "2024-01-06" },
    { name: "Day 7", value: 58, date: "2024-01-07" },
    { name: "Day 8", value: 60, date: "2024-01-08" },
    { name: "Day 9", value: 62, date: "2024-01-09" },
    { name: "Day 10", value: 65, date: "2024-01-10" },
  ];

  useEffect(() => {
    // Load sample data on mount
    setPatternData(sampleData);
  }, []);

  // Pattern Recognition Functions
  const handleAnalyzePatterns = async () => {
    if (!patternData || patternData.length === 0) {
      message.warning("Vui lòng nhập dữ liệu để phân tích");
      return;
    }

    setLoading(true);
    try {
      const results = await smartAutomationService.analyzePatterns(
        patternData,
        valueColumn,
        "date"
      );
      setPatternResults(results);
      message.success("Phân tích patterns thành công!");
    } catch (error) {
      console.error("Pattern analysis error:", error);
      message.error(`Lỗi phân tích: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  // Predictive Alerts Functions
  const handleGeneratePredictiveAlerts = async () => {
    if (!patternData || patternData.length === 0) {
      message.warning("Vui lòng nhập dữ liệu");
      return;
    }

    setLoading(true);
    try {
      const results = await smartAutomationService.generatePredictiveAlerts(
        patternData,
        valueColumn,
        "Sample Metric",
        70 // threshold
      );
      setAlerts(results || []);
      message.success(`Tạo ${results?.length || 0} predictive alerts!`);
    } catch (error) {
      console.error("Predictive alert error:", error);
      message.error(`Lỗi: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  // Categorization Functions
  const handleCategorizeData = async () => {
    if (!patternData || patternData.length === 0) {
      message.warning("Vui lòng nhập dữ liệu");
      return;
    }

    setLoading(true);
    try {
      const results = await smartAutomationService.categorizeRows(patternData);
      setCategorizedData(results || []);
      message.success("Categorization thành công!");
    } catch (error) {
      console.error("Categorization error:", error);
      message.error(`Lỗi: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  // Report Generation Functions
  const handleGenerateReport = async () => {
    if (!patternData || patternData.length === 0) {
      message.warning("Vui lòng nhập dữ liệu");
      return;
    }

    setLoading(true);
    try {
      const report = await smartAutomationService.generateReport(
        patternData,
        valueColumn,
        reportType,
        "date",
        `Automated Report - ${new Date().toLocaleDateString("vi-VN")}`
      );
      setGeneratedReport(report);
      message.success("Tạo báo cáo thành công!");
    } catch (error) {
      console.error("Report generation error:", error);
      message.error(`Lỗi: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  // Pattern Recognition Tab
  const PatternRecognitionTab = () => (
    <div>
      <Card>
        <Row gutter={[16, 16]}>
          <Col xs={24} md={12}>
            <Space orientation="vertical" style={{ width: "100%" }}>
              <Text strong>Dữ liệu mẫu:</Text>
              <TextArea
                rows={6}
                value={JSON.stringify(patternData, null, 2)}
                onChange={(e) => {
                  try {
                    const data = JSON.parse(e.target.value);
                    setPatternData(data);
                  } catch (err) {
                    // Invalid JSON, ignore
                  }
                }}
                placeholder="Nhập dữ liệu dạng JSON array..."
              />
            </Space>
          </Col>
          <Col xs={24} md={12}>
            <Space orientation="vertical" style={{ width: "100%" }}>
              <Text strong>Value Column:</Text>
              <Input
                value={valueColumn}
                onChange={(e) => setValueColumn(e.target.value)}
                placeholder="Tên cột chứa giá trị"
              />
              <Button
                type="primary"
                icon={<ThunderboltOutlined />}
                onClick={handleAnalyzePatterns}
                loading={loading}
                block
              >
                Phân tích Patterns
              </Button>
            </Space>
          </Col>
        </Row>
      </Card>

      {patternResults && (
        <Card title="Kết quả phân tích" style={{ marginTop: 16 }}>
          <Collapse>
            <Panel header="Trend Analysis" key="trend">
              <Descriptions bordered column={2}>
                <Descriptions.Item label="Trend">
                  <Tag
                    color={
                      patternResults.trends?.trend === "increasing"
                        ? "green"
                        : "red"
                    }
                  >
                    {patternResults.trends?.trend || "N/A"}
                  </Tag>
                </Descriptions.Item>
                <Descriptions.Item label="Confidence">
                  {(patternResults.trends?.confidence * 100).toFixed(1)}%
                </Descriptions.Item>
                <Descriptions.Item label="Change %">
                  {patternResults.trends?.change_percentage?.toFixed(1)}%
                </Descriptions.Item>
                <Descriptions.Item label="Mean">
                  {patternResults.trends?.mean?.toFixed(2)}
                </Descriptions.Item>
              </Descriptions>
            </Panel>
            <Panel
              header={`Anomalies (${patternResults.anomalies?.length || 0})`}
              key="anomalies"
            >
              {patternResults.anomalies?.length > 0 ? (
                <Table
                  dataSource={patternResults.anomalies}
                  columns={[
                    { title: "Index", dataIndex: "index" },
                    { title: "Value", dataIndex: "value" },
                    { title: "Type", dataIndex: "type" },
                    {
                      title: "Severity",
                      dataIndex: "severity",
                      render: (severity) => (
                        <Tag color={severity === "high" ? "red" : "orange"}>
                          {severity}
                        </Tag>
                      ),
                    },
                  ]}
                  pagination={false}
                  size="small"
                />
              ) : (
                <Text type="secondary">Không có anomalies được phát hiện</Text>
              )}
            </Panel>
            <Panel header="Cycle Analysis" key="cycle">
              <Descriptions bordered>
                <Descriptions.Item label="Cycle Type">
                  {patternResults.cycles?.cycle || "None"}
                </Descriptions.Item>
                <Descriptions.Item label="Confidence">
                  {(patternResults.cycles?.confidence * 100).toFixed(1)}%
                </Descriptions.Item>
              </Descriptions>
            </Panel>
          </Collapse>
        </Card>
      )}
    </div>
  );

  // Predictive Alerts Tab
  const PredictiveAlertsTab = () => (
    <div>
      <Card>
        <Space orientation="vertical" style={{ width: "100%" }}>
          <Button
            type="primary"
            icon={<WarningOutlined />}
            onClick={handleGeneratePredictiveAlerts}
            loading={loading}
          >
            Tạo Predictive Alerts
          </Button>
          <Text type="secondary">
            Phân tích trends và tạo alerts dự đoán dựa trên patterns
          </Text>
        </Space>
      </Card>

      {alerts.length > 0 && (
        <Card
          title={`Predictive Alerts (${alerts.length})`}
          style={{ marginTop: 16 }}
        >
          {alerts.map((alert, index) => (
            <Alert
              key={index}
              message={alert.message}
              description={alert.recommendation || ""}
              type={alert.alert_type === "warning" ? "warning" : "info"}
              showIcon
              style={{ marginBottom: 8 }}
              action={
                <Space>
                  <Tag
                    color={
                      alert.severity === "high"
                        ? "red"
                        : alert.severity === "medium"
                          ? "orange"
                          : "blue"
                    }
                  >
                    {alert.severity}
                  </Tag>
                  <Tag>{alert.type}</Tag>
                </Space>
              }
            />
          ))}
        </Card>
      )}
    </div>
  );

  // Smart Categorization Tab
  const SmartCategorizationTab = () => (
    <div>
      <Card>
        <Space orientation="vertical" style={{ width: "100%" }}>
          <Button
            type="primary"
            icon={<TagOutlined />}
            onClick={handleCategorizeData}
            loading={loading}
          >
            Phân loại dữ liệu
          </Button>
          <Text type="secondary">
            Tự động phân loại và gắn tags cho dữ liệu
          </Text>
        </Space>
      </Card>

      {categorizedData.length > 0 && (
        <Card
          title={`Categorized Data (${categorizedData.length})`}
          style={{ marginTop: 16 }}
        >
          <Table
            dataSource={categorizedData.slice(0, 10)}
            columns={[
              ...Object.keys(categorizedData[0] || {})
                .slice(0, 5)
                .map((key) => ({
                  title: key,
                  dataIndex: key,
                  ellipsis: true,
                })),
              {
                title: "Categories",
                dataIndex: ["_categories"],
                render: (categories) => (
                  <Space>
                    {categories?.tags?.map((tag) => (
                      <Tag key={tag}>{tag}</Tag>
                    ))}
                    <Tag
                      color={
                        categories?.priority === "high"
                          ? "red"
                          : categories?.priority === "medium"
                            ? "orange"
                            : "blue"
                      }
                    >
                      {categories?.priority}
                    </Tag>
                  </Space>
                ),
              },
            ]}
            pagination={{ pageSize: 5 }}
            size="small"
          />
        </Card>
      )}
    </div>
  );

  // Automated Reports Tab
  const AutomatedReportsTab = () => (
    <div>
      <Card>
        <Space orientation="vertical" style={{ width: "100%" }}>
          <Space>
            <Text strong>Report Type:</Text>
            <Select
              value={reportType}
              onChange={setReportType}
              style={{ width: 200 }}
            >
              <Option value="summary">Summary</Option>
              <Option value="trend">Trend Analysis</Option>
              <Option value="anomaly">Anomaly Detection</Option>
              <Option value="comprehensive">Comprehensive</Option>
            </Select>
            <Button
              type="primary"
              icon={<FileTextOutlined />}
              onClick={handleGenerateReport}
              loading={loading}
            >
              Tạo Báo Cáo
            </Button>
          </Space>
          <Text type="secondary">Tự động tạo báo cáo từ dữ liệu</Text>
        </Space>
      </Card>

      {generatedReport && (
        <Card
          title={generatedReport.title || "Generated Report"}
          style={{ marginTop: 16 }}
        >
          <Collapse>
            {generatedReport.executive_summary && (
              <Panel header="Executive Summary" key="summary">
                <Text>{generatedReport.executive_summary}</Text>
              </Panel>
            )}
            {generatedReport.sections && (
              <Panel header="Sections" key="sections">
                <Collapse>
                  {Object.entries(generatedReport.sections).map(
                    ([key, section]) => (
                      <Panel
                        header={key.replace("_", " ").toUpperCase()}
                        key={key}
                      >
                        <pre style={{ whiteSpace: "pre-wrap", fontSize: 12 }}>
                          {JSON.stringify(section, null, 2)}
                        </pre>
                      </Panel>
                    )
                  )}
                </Collapse>
              </Panel>
            )}
            {generatedReport.insights && (
              <Panel header="Insights" key="insights">
                <ul>
                  {generatedReport.insights.map((insight, index) => (
                    <li key={index}>{insight}</li>
                  ))}
                </ul>
              </Panel>
            )}
          </Collapse>
        </Card>
      )}
    </div>
  );

  return (
    <div className="smart-automation-dashboard">
      <Card className="dashboard-header-card">
        <Title level={2}>🤖 Smart Automation</Title>
        <Text type="secondary">
          AI-powered data analysis, predictive alerts, categorization, and
          automated reports
        </Text>
      </Card>

      <Tabs
        activeKey={activeTab}
        onChange={setActiveTab}
        items={[
          {
            key: "patterns",
            label: "📊 Pattern Recognition",
            children: <PatternRecognitionTab />,
          },
          {
            key: "alerts",
            label: "⚠️ Predictive Alerts",
            children: <PredictiveAlertsTab />,
          },
          {
            key: "categorization",
            label: "🏷️ Smart Categorization",
            children: <SmartCategorizationTab />,
          },
          {
            key: "reports",
            label: "📄 Automated Reports",
            children: <AutomatedReportsTab />,
          },
        ]}
      />
    </div>
  );
};

export default SmartAutomationDashboard;
