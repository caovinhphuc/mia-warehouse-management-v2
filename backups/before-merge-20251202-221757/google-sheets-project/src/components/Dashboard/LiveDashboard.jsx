/* eslint-disable */
/**
 * Live Dashboard - Real-time Metrics Display
 * Shows real-time updates via WebSocket
 */

import React, { useState, useEffect } from "react";
import { Card, Row, Col, Statistic, Typography, Tag, Space, Spin } from "antd";
import {
  DashboardOutlined,
  UserOutlined,
  ThunderboltOutlined,
  DatabaseOutlined,
} from "@ant-design/icons";
import { useWebSocket } from "../../hooks/useWebSocket";
import { websocketService } from "../../services/websocketService";
import "./LiveDashboard.css";

const { Title, Text } = Typography;

const LiveDashboard = () => {
  const { connected, subscribe, unsubscribe } = useWebSocket(null, true);
  const [metrics, setMetrics] = useState({
    cpu: 0,
    memory: 0,
    activeUsers: 0,
    timestamp: null,
  });
  const [loading, setLoading] = useState(true);

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
          <Text type="secondary">Real-time metrics updates</Text>
        </Space>
      </div>

      {loading && !connected ? (
        <div className="loading-container">
          <Spin size="large" />
          <Text>Connecting to WebSocket server...</Text>
        </div>
      ) : (
        <Row gutter={[16, 16]}>
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
      )}

      {/* Metrics History (simple visual) */}
      <Row gutter={[16, 16]} style={{ marginTop: 24 }}>
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
    </div>
  );
};

export default LiveDashboard;
