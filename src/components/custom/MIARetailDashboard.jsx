/**
 * 🛒 MIA Retail Dashboard Widget
 *
 * Retail-specific dashboard widget for MIA Retail analytics platform.
 * Displays sales, inventory, customer, and store performance metrics.
 */

import React, { useState, useEffect } from "react";
import { Card, Typography, Spin, Alert, Row, Col, Tag, Space } from "antd";
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import {
  fetchRetailDashboard,
  fetchSalesMetrics,
  fetchInventoryStatus,
  fetchCustomerAnalytics,
  formatVND,
} from "../../services/retailService";

const MIARetailDashboard = () => {
  const [dashboardData, setDashboardData] = useState(null);
  const [salesData, setSalesData] = useState(null);
  const [inventoryData, setInventoryData] = useState(null);
  const [customerData, setCustomerData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchRetailData();
    // Refresh every 30 seconds
    const interval = setInterval(fetchRetailData, 30000);
    return () => clearInterval(interval);
  }, []);

  const fetchRetailData = async () => {
    try {
      setLoading(true);
      setError(null);

      const [dashboard, sales, inventory, customers] = await Promise.all([
        fetchRetailDashboard(),
        fetchSalesMetrics("30d"),
        fetchInventoryStatus(),
        fetchCustomerAnalytics("30d"),
      ]);

      if (dashboard) setDashboardData(dashboard);
      if (sales) setSalesData(sales);
      if (inventory) setInventoryData(inventory);
      if (customers) setCustomerData(customers);
    } catch (err) {
      console.error("Error fetching retail data:", err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Sales trend chart data (Recharts format)
  const salesChartData = [
    { name: "Mon", revenue: 120000 },
    { name: "Tue", revenue: 150000 },
    { name: "Wed", revenue: 180000 },
    { name: "Thu", revenue: 140000 },
    { name: "Fri", revenue: 160000 },
    { name: "Sat", revenue: 200000 },
    { name: "Sun", revenue: 220000 },
  ];

  // Top products chart (Recharts format)
  const topProductsData = salesData?.topProducts
    ? salesData.topProducts.map((p) => ({ name: p.name, sales: p.sales }))
    : [];

  // Inventory status pie chart (Recharts format)
  const inventoryStatusData = inventoryData
    ? [
        { name: "In Stock", value: inventoryData.inStock, color: "#06a77d" },
        { name: "Low Stock", value: inventoryData.lowStock, color: "#f59e0b" },
        {
          name: "Out of Stock",
          value: inventoryData.outOfStock,
          color: "#d62828",
        },
      ]
    : [];

  if (loading && !dashboardData) {
    return (
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          minHeight: "400px",
        }}
      >
        <Spin size="large" />
      </div>
    );
  }

  if (error) {
    return (
      <Alert
        message="Error"
        description={`Error loading retail data: ${error}`}
        type="error"
        showIcon
        style={{ margin: 16 }}
      />
    );
  }

  return (
    <div style={{ padding: 16 }}>
      <Typography.Title
        level={2}
        style={{ marginBottom: 24, fontWeight: 700, color: "#3b82f6" }}
      >
        🛒 MIA Retail Dashboard
      </Typography.Title>

      <Row gutter={[16, 16]}>
        {/* Today's Revenue */}
        <Col xs={24} sm={12} md={6}>
          <Card
            style={{
              background: "linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)",
              color: "white",
            }}
          >
            <Typography.Text
              style={{
                display: "block",
                marginBottom: 8,
                opacity: 0.9,
                color: "white",
              }}
            >
              Today's Revenue
            </Typography.Text>
            <Typography.Title
              level={3}
              style={{ fontWeight: 700, color: "white", margin: 0 }}
            >
              {formatVND(dashboardData?.today?.revenue || 0)}
            </Typography.Title>
            <Typography.Text
              style={{
                display: "block",
                marginTop: 8,
                opacity: 0.8,
                color: "white",
              }}
            >
              {dashboardData?.today?.orders || 0} orders
            </Typography.Text>
          </Card>
        </Col>

        {/* Total Customers */}
        <Col xs={24} sm={12} md={6}>
          <Card
            style={{
              background: "linear-gradient(135deg, #f77f00 0%, #fcbf49 100%)",
              color: "white",
            }}
          >
            <Typography.Text
              style={{
                display: "block",
                marginBottom: 8,
                opacity: 0.9,
                color: "white",
              }}
            >
              Active Customers
            </Typography.Text>
            <Typography.Title
              level={3}
              style={{ fontWeight: 700, color: "white", margin: 0 }}
            >
              {customerData?.activeCustomers?.toLocaleString() || 0}
            </Typography.Title>
            <Typography.Text
              style={{
                display: "block",
                marginTop: 8,
                opacity: 0.8,
                color: "white",
              }}
            >
              {customerData?.newCustomers || 0} new this month
            </Typography.Text>
          </Card>
        </Col>

        {/* Inventory Status */}
        <Col xs={24} sm={12} md={6}>
          <Card
            style={{
              background: "linear-gradient(135deg, #06a77d 0%, #3b82f6 100%)",
              color: "white",
            }}
          >
            <Typography.Text
              style={{
                display: "block",
                marginBottom: 8,
                opacity: 0.9,
                color: "white",
              }}
            >
              Inventory
            </Typography.Text>
            <Typography.Title
              level={3}
              style={{ fontWeight: 700, color: "white", margin: 0 }}
            >
              {inventoryData?.inStock || 0} /{" "}
              {inventoryData?.totalProducts || 0}
            </Typography.Title>
            <Typography.Text
              style={{
                display: "block",
                marginTop: 8,
                opacity: 0.8,
                color: "white",
              }}
            >
              {inventoryData?.lowStock || 0} low stock items
            </Typography.Text>
          </Card>
        </Col>

        {/* Conversion Rate */}
        <Col xs={24} sm={12} md={6}>
          <Card
            style={{
              background: "linear-gradient(135deg, #3b82f6 0%, #667eea 100%)",
              color: "white",
            }}
          >
            <Typography.Text
              style={{
                display: "block",
                marginBottom: 8,
                opacity: 0.9,
                color: "white",
              }}
            >
              Conversion Rate
            </Typography.Text>
            <Typography.Title
              level={3}
              style={{ fontWeight: 700, color: "white", margin: 0 }}
            >
              {salesData?.conversionRate?.toFixed(1) || 0}%
            </Typography.Title>
            <Typography.Text
              style={{
                display: "block",
                marginTop: 8,
                opacity: 0.8,
                color: "white",
              }}
            >
              AOV: {salesData?.averageOrderValue?.toLocaleString("vi-VN") || 0}₫
            </Typography.Text>
          </Card>
        </Col>

        {/* Sales Trend Chart */}
        <Col xs={24} md={16}>
          <Card>
            <Typography.Title level={4} style={{ marginBottom: 16 }}>
              📈 Sales Trend (Last 7 Days)
            </Typography.Title>
            <div style={{ height: "300px" }}>
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={salesChartData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis
                    tickFormatter={(v) => `${v.toLocaleString("vi-VN")}₫`}
                  />
                  <Tooltip
                    formatter={(v) => [
                      `${v.toLocaleString("vi-VN")}₫`,
                      "Revenue",
                    ]}
                  />
                  <Line
                    type="monotone"
                    dataKey="revenue"
                    stroke="#3b82f6"
                    strokeWidth={2}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </Card>
        </Col>

        {/* Inventory Status Pie */}
        <Col xs={24} md={8}>
          <Card>
            <Typography.Title level={4} style={{ marginBottom: 16 }}>
              📦 Inventory Status
            </Typography.Title>
            {inventoryStatusData.length > 0 && (
              <div style={{ height: "300px" }}>
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={inventoryStatusData}
                      dataKey="value"
                      nameKey="name"
                      cx="50%"
                      cy="50%"
                      outerRadius={100}
                      label
                    >
                      {inventoryStatusData.map((entry, i) => (
                        <Cell key={i} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            )}
          </Card>
        </Col>

        {/* Top Products */}
        <Col xs={24} md={12}>
          <Card>
            <Typography.Title level={4} style={{ marginBottom: 16 }}>
              🏆 Top Selling Products
            </Typography.Title>
            {topProductsData.length > 0 && (
              <div style={{ height: "300px" }}>
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={topProductsData}
                    layout="vertical"
                    margin={{ left: 60 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis
                      type="number"
                      tickFormatter={(v) => `${v.toLocaleString("vi-VN")}₫`}
                    />
                    <YAxis type="category" dataKey="name" width={100} />
                    <Tooltip
                      formatter={(v) => [
                        `${v.toLocaleString("vi-VN")}₫`,
                        "Sales",
                      ]}
                    />
                    <Bar dataKey="sales" fill="#3b82f6" radius={[0, 4, 4, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            )}
          </Card>
        </Col>

        {/* Customer Metrics */}
        <Col xs={24} md={12}>
          <Card>
            <Typography.Title level={4} style={{ marginBottom: 16 }}>
              👥 Customer Metrics
            </Typography.Title>
            <Space
              orientation="vertical"
              size="middle"
              style={{ width: "100%" }}
            >
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                }}
              >
                <Typography.Text>Total Customers</Typography.Text>
                <Tag color="blue">
                  {customerData?.totalCustomers?.toLocaleString() || 0}
                </Tag>
              </div>
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                }}
              >
                <Typography.Text>Retention Rate</Typography.Text>
                <Tag color="green">
                  {`${customerData?.retentionRate?.toFixed(1) || 0}%`}
                </Tag>
              </div>
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                }}
              >
                <Typography.Text>Customer Lifetime Value</Typography.Text>
                <Tag color="cyan">
                  {`${customerData?.customerLifetimeValue?.toLocaleString("vi-VN") || 0}₫`}
                </Tag>
              </div>
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                }}
              >
                <Typography.Text>Average Order Frequency</Typography.Text>
                <Tag color="orange">
                  {`${customerData?.averageOrderFrequency?.toFixed(1) || 0}x`}
                </Tag>
              </div>
            </Space>
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default MIARetailDashboard;
