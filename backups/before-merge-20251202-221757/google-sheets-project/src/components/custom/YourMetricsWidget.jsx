/**
 * 📊 Custom Metrics Widget Template
 *
 * Create your business-specific dashboard widgets here.
 * Replace example data with your actual API calls.
 */

import React, { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  Typography,
  Box,
  CircularProgress,
  Alert,
} from "@mui/material";
import { Line } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
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
  Title,
  Tooltip,
  Legend,
);

const YourMetricsWidget = () => {
  const [salesData, setSalesData] = useState(null);
  const [userMetrics, setUserMetrics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchYourMetrics();
    // Refresh every 30 seconds
    const interval = setInterval(fetchYourMetrics, 30000);
    return () => clearInterval(interval);
  }, []);

  const fetchYourMetrics = async () => {
    try {
      setLoading(true);
      setError(null);

      // TODO: Replace with your actual API endpoints
      const [sales, users] = await Promise.all([
        fetch("/api/custom/sales-metrics").then((r) => {
          if (!r.ok) throw new Error("Failed to fetch sales metrics");
          return r.json();
        }),
        fetch("/api/custom/user-analytics").then((r) => {
          if (!r.ok) throw new Error("Failed to fetch user analytics");
          return r.json();
        }),
      ]);

      if (sales.success) setSalesData(sales.data);
      if (users.success) setUserMetrics(users.data);
    } catch (err) {
      console.error("Error fetching custom metrics:", err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Chart data for sales trend
  const salesChartData = {
    labels: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"],
    datasets: [
      {
        label: "Sales",
        data: [12000, 15000, 18000, 14000, 16000, 20000, 22000],
        borderColor: "rgb(102, 126, 234)",
        backgroundColor: "rgba(102, 126, 234, 0.1)",
        tension: 0.4,
      },
    ],
  };

  if (loading && !salesData && !userMetrics) {
    return (
      <Box
        display="flex"
        justifyContent="center"
        alignItems="center"
        minHeight="200px"
      >
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Alert severity="error" sx={{ m: 2 }}>
        Error loading metrics: {error}
      </Alert>
    );
  }

  return (
    <Box
      sx={{
        display: "grid",
        gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))",
        gap: 2,
        p: 2,
      }}
    >
      {/* Sales Performance Card */}
      <Card
        sx={{
          background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
          color: "white",
        }}
      >
        <CardContent>
          <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
            📊 Sales Performance
          </Typography>
          <Typography variant="h4" sx={{ mb: 1, fontWeight: 700 }}>
            ${salesData?.totalRevenue?.toLocaleString() || "Loading..."}
          </Typography>
          <Typography variant="body2" sx={{ opacity: 0.9 }}>
            {salesData?.growthRate > 0 ? "📈" : "📉"}{" "}
            {salesData?.growthRate?.toFixed(1) || 0}% vs last period
          </Typography>
          <Box sx={{ mt: 2 }}>
            <Typography variant="caption" sx={{ opacity: 0.8 }}>
              Orders: {salesData?.orders || 0} | AOV: $
              {salesData?.averageOrderValue?.toFixed(2) || 0}
            </Typography>
          </Box>
        </CardContent>
      </Card>

      {/* User Analytics Card */}
      <Card
        sx={{
          background: "linear-gradient(135deg, #f093fb 0%, #f5576c 100%)",
          color: "white",
        }}
      >
        <CardContent>
          <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
            👥 User Analytics
          </Typography>
          <Typography variant="h4" sx={{ mb: 1, fontWeight: 700 }}>
            {userMetrics?.activeUsers?.toLocaleString() || "Loading..."}
          </Typography>
          <Typography variant="body2" sx={{ opacity: 0.9 }}>
            Active Users (Last 30 days)
          </Typography>
          <Box sx={{ mt: 2 }}>
            <Typography variant="caption" sx={{ opacity: 0.8 }}>
              Retention: {userMetrics?.retentionRate?.toFixed(1) || 0}% | New:{" "}
              {userMetrics?.newUsers || 0}
            </Typography>
          </Box>
        </CardContent>
      </Card>

      {/* Your Custom KPI Card */}
      <Card
        sx={{
          background: "linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)",
          color: "white",
        }}
      >
        <CardContent>
          <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
            🎯 Your Key Metric
          </Typography>
          <Typography variant="h4" sx={{ mb: 1, fontWeight: 700 }}>
            {userMetrics?.yourKPI || "N/A"}
          </Typography>
          <Typography variant="body2" sx={{ opacity: 0.9 }}>
            Target: {userMetrics?.target || "Set target"} | Status:{" "}
            {userMetrics?.status || "Unknown"}
          </Typography>
          <Box sx={{ mt: 2 }}>
            <Typography variant="caption" sx={{ opacity: 0.8 }}>
              Last updated: {new Date().toLocaleTimeString()}
            </Typography>
          </Box>
        </CardContent>
      </Card>

      {/* Sales Trend Chart */}
      <Card sx={{ gridColumn: "span 2" }}>
        <CardContent>
          <Typography variant="h6" sx={{ mb: 2 }}>
            📈 Sales Trend (Last 7 Days)
          </Typography>
          <Box sx={{ height: "300px" }}>
            <Line
              data={salesChartData}
              options={{
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                  legend: {
                    display: true,
                    position: "top",
                  },
                  tooltip: {
                    mode: "index",
                    intersect: false,
                  },
                },
                scales: {
                  y: {
                    beginAtZero: true,
                    ticks: {
                      callback: function (value) {
                        return "$" + value.toLocaleString();
                      },
                    },
                  },
                },
              }}
            />
          </Box>
        </CardContent>
      </Card>
    </Box>
  );
};

export default YourMetricsWidget;
