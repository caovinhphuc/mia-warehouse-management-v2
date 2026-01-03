/**
 * 🛒 MIA Retail Dashboard Widget
 *
 * Retail-specific dashboard widget for MIA Retail analytics platform.
 * Displays sales, inventory, customer, and store performance metrics.
 */

import React, { useState, useEffect } from "react";
import { Card, Typography, Spin, Alert, Row, Col, Tag, Space } from "antd";
import { Line, Bar, Pie } from "react-chartjs-2";
import {
  fetchRetailDashboard,
  fetchSalesMetrics,
  fetchInventoryStatus,
  fetchCustomerAnalytics,
  formatVND,
  formatNumber,
} from "../../services/retailService";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";

// Register Chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend
);

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
      // eslint-disable-next-line no-console
      console.error("Error fetching retail data:", err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Sales trend chart data
  const salesChartData = {
    labels: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"],
    datasets: [
      {
        label: "Revenue (VND)",
        data: [120000, 150000, 180000, 140000, 160000, 200000, 220000],
        borderColor: "#3b82f6",
        backgroundColor: "rgba(59, 130, 246, 0.1)",
        tension: 0.4,
      },
    ],
  };

  // Top products chart
  const topProductsData = salesData?.topProducts
    ? {
        labels: salesData.topProducts.map((p) => p.name),
        datasets: [
          {
            label: "Sales (VND)",
            data: salesData.topProducts.map((p) => p.sales),
            backgroundColor: [
              "#3b82f6",
              "#60a5fa",
              "#2563eb",
              "#06a77d",
              "#1d4ed8",
            ],
          },
        ],
      }
    : null;

  // Inventory status pie chart
  const inventoryStatusData = inventoryData
    ? {
        labels: ["In Stock", "Low Stock", "Out of Stock"],
        datasets: [
          {
            data: [
              inventoryData.inStock,
              inventoryData.lowStock,
              inventoryData.outOfStock,
            ],
            backgroundColor: ["#06a77d", "#f59e0b", "#d62828"],
          },
        ],
      }
    : null;

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
              <Line
                data={salesChartData}
                options={{
                  responsive: true,
                  maintainAspectRatio: false,
                  plugins: {
                    legend: { display: true },
                    tooltip: {
                      callbacks: {
                        label: function (context) {
                          return (
                            "Revenue: " +
                            context.parsed.y.toLocaleString("vi-VN") +
                            "₫"
                          );
                        },
                      },
                    },
                  },
                  scales: {
                    y: {
                      beginAtZero: true,
                      ticks: {
                        callback: function (value) {
                          return value.toLocaleString("vi-VN") + "₫";
                        },
                      },
                    },
                  },
                }}
              />
            </div>
          </Card>
        </Col>

        {/* Inventory Status Pie */}
        <Col xs={24} md={8}>
          <Card>
            <Typography.Title level={4} style={{ marginBottom: 16 }}>
              📦 Inventory Status
            </Typography.Title>
            {inventoryStatusData && (
              <div style={{ height: "300px" }}>
                <Pie
                  data={inventoryStatusData}
                  options={{
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                      legend: { position: "bottom" },
                    },
                  }}
                />
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
            {topProductsData && (
              <div style={{ height: "300px" }}>
                <Bar
                  data={topProductsData}
                  options={{
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                      legend: { display: false },
                      tooltip: {
                        callbacks: {
                          label: function (context) {
                            return (
                              "Sales: " +
                              context.parsed.y.toLocaleString("vi-VN") +
                              "₫"
                            );
                          },
                        },
                      },
                    },
                    scales: {
                      y: {
                        beginAtZero: true,
                        ticks: {
                          callback: function (value) {
                            return value.toLocaleString("vi-VN") + "₫";
                          },
                        },
                      },
                    },
                  }}
                />
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
