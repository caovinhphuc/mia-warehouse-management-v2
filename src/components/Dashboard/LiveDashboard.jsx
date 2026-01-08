/* eslint-disable */
/**
 * Live Dashboard - Real-time Metrics Display + Scraper Controls
 * Shows real-time updates via WebSocket + Python automation controls
 */

import React, { useState, useEffect } from "react";
import { Card, Row, Col, Statistic, Typography, Tag, Space, Spin, Button, Tabs, Table, message } from "antd";
import {
  DashboardOutlined,
  UserOutlined,
  ThunderboltOutlined,
  DatabaseOutlined,
  RocketOutlined,
  FileTextOutlined,
  InboxOutlined,
  SwapOutlined,
  SettingOutlined,
} from "@ant-design/icons";
import { useWebSocket } from "../../hooks/useWebSocket";
import { websocketService } from "../../services/websocketService";
import axios from "axios";
import "./LiveDashboard.css";

const { Title, Text } = Typography;
const { TabPane } = Tabs;

const LiveDashboard = () => {
  // Temporarily disable WebSocket to avoid conflict
const connected = false;
const subscribe = () => () => {};
const unsubscribe = () => {};
  const [metrics, setMetrics] = useState({
    cpu: 0,
    memory: 0,
    activeUsers: 0,
    timestamp: null,
  });
  const [loading, setLoading] = useState(true);
  
  // Scraper states
  const [scraperStatus, setScraperStatus] = useState({});
  const [scraperData, setScraperData] = useState({});
  const [logs, setLogs] = useState([]);
  const [activeTab, setActiveTab] = useState('metrics');

/* COMMENTED - WebSocket conflict
  useEffect(() => {
    if (!connected) return;

    // Subscribe to metrics updates
    websocketService.subscribeMetrics();

    // Listen for metrics updates
    const unsubscribeMetrics = subscribe("metrics-update", (data) => {
      setMetrics((prev) => ({
        ...prev,
        ...data,
      }));
      setLoading(false);
    });

    // Listen for connection status
    const unsubscribeConnected = subscribe("connected", () => {
      setLoading(false);
    });

    return () => {
      unsubscribeMetrics();
      unsubscribeConnected();
      websocketService.unsubscribeMetrics();
    };
  }, [connected, subscribe]);
*/
  // Add log entry
  const addLog = (message, type = 'info') => {
    const timestamp = new Date().toLocaleTimeString('vi-VN');
    setLogs(prev => [{
      time: timestamp,
      message,
      type
    }, ...prev.slice(0, 49)]);
  };

  // Trigger scraper
  const triggerScraper = async (type) => {
    setScraperStatus(prev => ({ ...prev, [type]: 'running' }));
    addLog(`🚀 Starting ${type} scraper...`, 'info');

    try {
      const response = await axios.post('http://localhost:3001/api/scraper/trigger', {
        type
      });

      if (response.data.success) {
        addLog(`✅ ${type} scraper completed successfully`, 'success');
        setScraperStatus(prev => ({ ...prev, [type]: 'success' }));
        
        // Fetch data
        await fetchScraperData(type);
      }
    } catch (error) {
      addLog(`❌ ${type} scraper failed: ${error.message}`, 'error');
      setScraperStatus(prev => ({ ...prev, [type]: 'error' }));
      message.error(`${type} scraper failed`);
    }
  };

  // Fetch scraper data
  const fetchScraperData = async (type) => {
    try {
      const response = await axios.get(`http://localhost:3001/api/data/${type}`);
      setScraperData(prev => ({
        ...prev,
        [type]: response.data.data
      }));
      addLog(`📊 Loaded ${response.data.data?.length || 0} records for ${type}`, 'success');
    } catch (error) {
      addLog(`⚠️ Failed to load ${type} data`, 'error');
    }
  };

  const scrapers = [
    {
      id: 'so',
      name: 'Đơn hàng (SO)',
      icon: <FileTextOutlined />,
      description: 'Lấy đơn hàng từ one.tga.com.vn',
      color: '#52c41a',
      realtime: true
    },
    {
      id: 'inventory',
      name: 'Tồn kho',
      icon: <DatabaseOutlined />,
      description: 'Lấy dữ liệu tồn kho',
      color: '#faad14',
      realtime: false
    },
    {
      id: 'po',
      name: 'Nhập hàng (PO)',
      icon: <InboxOutlined />,
      description: 'Lấy đơn nhập hàng',
      color: '#f5222d',
      realtime: false
    },
    {
      id: 'ck',
      name: 'Chuyển kho (CK)',
      icon: <SwapOutlined />,
      description: 'Lấy phiếu chuyển kho',
      color: '#722ed1',
      realtime: false
    }
  ];

  return (
    <div className="live-dashboard">
      <div className="dashboard-header">
        <Title level={2}>
          <DashboardOutlined /> Live Dashboard
        </Title>
        <Space>
          <Tag color={connected ? "green" : "red"}>
            {connected ? "🟢 Connected" : "🔴 Disconnected"}
          </Tag>
          <Text type="secondary">Real-time metrics + Automation</Text>
        </Space>
      </div>

      {loading && !connected ? (
        <div className="loading-container">
          <Spin size="large" />
          <Text>Connecting to WebSocket server...</Text>
        </div>
      ) : (
        <>
          {/* Metrics Dashboard */}
          <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
            {/* CPU Usage */}
            <Col xs={24} sm={12} md={6}>
              <Card>
                <Statistic
                  title="CPU Usage"
                  value={metrics.cpu}
                  precision={1}
                  suffix="%"
                  prefix={<ThunderboltOutlined />}
                  valueStyle={{
                    color:
                      metrics.cpu > 80
                        ? "#cf1322"
                        : metrics.cpu > 50
                          ? "#faad14"
                          : "#3f8600",
                  }}
                />
                <div className="metric-bar">
                  <div
                    className="metric-bar-fill"
                    style={{
                      width: `${metrics.cpu}%`,
                      backgroundColor:
                        metrics.cpu > 80
                          ? "#cf1322"
                          : metrics.cpu > 50
                            ? "#faad14"
                            : "#3f8600",
                    }}
                  />
                </div>
              </Card>
            </Col>

            {/* Memory Usage */}
            <Col xs={24} sm={12} md={6}>
              <Card>
                <Statistic
                  title="Memory Usage"
                  value={metrics.memory}
                  precision={1}
                  suffix="%"
                  prefix={<DatabaseOutlined />}
                  valueStyle={{
                    color:
                      metrics.memory > 80
                        ? "#cf1322"
                        : metrics.memory > 50
                          ? "#faad14"
                          : "#3f8600",
                  }}
                />
                <div className="metric-bar">
                  <div
                    className="metric-bar-fill"
                    style={{
                      width: `${metrics.memory}%`,
                      backgroundColor:
                        metrics.memory > 80
                          ? "#cf1322"
                          : metrics.memory > 50
                            ? "#faad14"
                            : "#3f8600",
                    }}
                  />
                </div>
              </Card>
            </Col>

            {/* Active Users */}
            <Col xs={24} sm={12} md={6}>
              <Card>
                <Statistic
                  title="Active Users"
                  value={metrics.activeUsers || 0}
                  prefix={<UserOutlined />}
                  valueStyle={{ color: "#1890ff" }}
                />
                <Text type="secondary" style={{ fontSize: 12 }}>
                  WebSocket connections
                </Text>
              </Card>
            </Col>

            {/* Connection Status */}
            <Col xs={24} sm={12} md={6}>
              <Card>
                <Statistic
                  title="Status"
                  value={connected ? "Online" : "Offline"}
                  prefix={connected ? "🟢" : "🔴"}
                  valueStyle={{
                    color: connected ? "#3f8600" : "#cf1322",
                  }}
                />
                {metrics.timestamp && (
                  <Text type="secondary" style={{ fontSize: 12 }}>
                    Last update:{" "}
                    {new Date(metrics.timestamp).toLocaleTimeString("vi-VN")}
                  </Text>
                )}
              </Card>
            </Col>
          </Row>

          {/* Scraper Controls */}
          <Card 
            title={
              <span>
                <RocketOutlined /> Automation Controls
              </span>
            }
            style={{ marginBottom: 24 }}
          >
            <Row gutter={[16, 16]}>
              {scrapers.map(scraper => {
                const status = scraperStatus[scraper.id];
                const data = scraperData[scraper.id];
                
                return (
                  <Col xs={24} sm={12} md={6} key={scraper.id}>
                    <Card
                      hoverable
                      style={{ 
                        borderColor: status === 'running' ? '#1890ff' : 
                                    status === 'success' ? '#52c41a' :
                                    status === 'error' ? '#f5222d' : '#d9d9d9'
                      }}
                    >
                      <Space direction="vertical" style={{ width: '100%' }}>
                        <div style={{ fontSize: 32, textAlign: 'center' }}>
                          {scraper.icon}
                        </div>
                        <Title level={5} style={{ margin: 0, textAlign: 'center' }}>
                          {scraper.name}
                          {scraper.realtime && (
                            <Tag color="green" style={{ marginLeft: 8 }}>
                              Real-time
                            </Tag>
                          )}
                        </Title>
                        <Text type="secondary" style={{ fontSize: 12, textAlign: 'center' }}>
                          {scraper.description}
                        </Text>
                        
                        {data && (
                          <Tag color="blue">
                            {data.length} records
                          </Tag>
                        )}

                        <Button
                          type="primary"
                          block
                          loading={status === 'running'}
                          onClick={() => triggerScraper(scraper.id)}
                          style={{
                            backgroundColor: status === 'running' ? '#1890ff' :
                                           status === 'success' ? '#52c41a' :
                                           status === 'error' ? '#f5222d' : undefined
                          }}
                        >
                          {status === 'running' ? 'Đang chạy...' : 
                           status === 'success' ? '✅ Thành công' :
                           status === 'error' ? '❌ Lỗi' : 
                           '🚀 Lấy dữ liệu'}
                        </Button>
                      </Space>
                    </Card>
                  </Col>
                );
              })}
            </Row>
          </Card>

          {/* Tabs: Metrics History & Live Logs */}
          <Tabs activeKey={activeTab} onChange={setActiveTab}>
            <TabPane tab="📊 Metrics History" key="metrics">
              <Row gutter={[16, 16]}>
                <Col xs={24} md={12}>
                  <Card title="CPU Usage History">
                    <div className="metrics-history">
                      <Text type="secondary">
                        Real-time CPU usage tracking
                        <br />
                        Updates every 5 seconds via WebSocket
                      </Text>
                    </div>
                  </Card>
                </Col>
                <Col xs={24} md={12}>
                  <Card title="Memory Usage History">
                    <div className="metrics-history">
                      <Text type="secondary">
                        Real-time memory usage tracking
                        <br />
                        Updates every 5 seconds via WebSocket
                      </Text>
                    </div>
                  </Card>
                </Col>
              </Row>
            </TabPane>

            <TabPane tab="📋 Live Logs" key="logs">
              <Card title="Scraper Activity Logs">
                <div style={{
                  backgroundColor: '#1e1e1e',
                  padding: 16,
                  borderRadius: 8,
                  maxHeight: 400,
                  overflowY: 'auto',
                  fontFamily: 'monospace'
                }}>
                  {logs.length === 0 ? (
                    <Text style={{ color: '#666' }}>Waiting for activity...</Text>
                  ) : (
                    logs.map((log, i) => (
                      <div key={i} style={{ marginBottom: 8 }}>
                        <Text style={{ color: '#888' }}>[{log.time}]</Text>{' '}
                        <Text style={{
                          color: log.type === 'success' ? '#52c41a' :
                                 log.type === 'error' ? '#f5222d' :
                                 '#1890ff'
                        }}>
                          {log.message}
                        </Text>
                      </div>
                    ))
                  )}
                </div>
              </Card>
            </TabPane>
          </Tabs>
        </>
      )}
    </div>
  );
};

export default LiveDashboard;
