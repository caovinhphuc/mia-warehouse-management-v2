/* eslint-disable */
/**
 * Chart Components - Interactive Charts
 * Line, Bar, Pie, Heat maps using Chart.js and Recharts
 */

import React, { useMemo } from "react";
import { Card, Typography, Space, Select, Button } from "antd";
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
  Area,
  AreaChart,
} from "recharts";

const { Title, Text } = Typography;
const { Option } = Select;

// Color palette
const COLORS = [
  "#3b82f6",
  "#10b981",
  "#f59e0b",
  "#ef4444",
  "#8b5cf6",
  "#ec4899",
  "#06b6d4",
  "#84cc16",
];

// Line Chart Component
export const LineChartComponent = ({
  data,
  dataKey,
  title,
  height = 300,
  showLegend = true,
  strokeColors = COLORS,
}) => {
  const lines = useMemo(() => {
    if (!data || !Array.isArray(data)) return [];
    if (Array.isArray(dataKey)) {
      return dataKey.map((key, index) => (
        <Line
          key={key}
          type="monotone"
          dataKey={key}
          stroke={strokeColors[index % strokeColors.length]}
          strokeWidth={2}
          dot={{ r: 4 }}
          activeDot={{ r: 6 }}
        />
      ));
    }
    return (
      <Line
        type="monotone"
        dataKey={dataKey}
        stroke={strokeColors[0]}
        strokeWidth={2}
        dot={{ r: 4 }}
        activeDot={{ r: 6 }}
      />
    );
  }, [data, dataKey, strokeColors]);

  return (
    <Card>
      {title && <Title level={5}>{title}</Title>}
      <ResponsiveContainer width="100%" height={height}>
        <LineChart
          data={data}
          margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
        >
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="name" />
          <YAxis />
          <Tooltip />
          {showLegend && <Legend />}
          {lines}
        </LineChart>
      </ResponsiveContainer>
    </Card>
  );
};

// Bar Chart Component
export const BarChartComponent = ({
  data,
  dataKey,
  title,
  height = 300,
  showLegend = true,
  colors = COLORS,
  orientation = "vertical",
}) => {
  const bars = useMemo(() => {
    if (!data || !Array.isArray(data)) return [];
    if (Array.isArray(dataKey)) {
      return dataKey.map((key, index) => (
        <Bar key={key} dataKey={key} fill={colors[index % colors.length]} />
      ));
    }
    return <Bar dataKey={dataKey} fill={colors[0]} />;
  }, [data, dataKey, colors]);

  const Chart = orientation === "horizontal" ? BarChart : BarChart;

  return (
    <Card>
      {title && <Title level={5}>{title}</Title>}
      <ResponsiveContainer width="100%" height={height}>
        <BarChart
          data={data}
          layout={orientation === "horizontal" ? "vertical" : "horizontal"}
          margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
        >
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis
            type={orientation === "horizontal" ? "number" : "category"}
            dataKey={orientation === "horizontal" ? dataKey : "name"}
          />
          <YAxis
            type={orientation === "horizontal" ? "category" : "number"}
            dataKey={orientation === "horizontal" ? "name" : dataKey}
          />
          <Tooltip />
          {showLegend && <Legend />}
          {bars}
        </BarChart>
      </ResponsiveContainer>
    </Card>
  );
};

// Pie Chart Component
export const PieChartComponent = ({
  data,
  dataKey = "value",
  nameKey = "name",
  title,
  height = 300,
  showLegend = true,
  colors = COLORS,
}) => {
  const renderCustomLabel = ({
    cx,
    cy,
    midAngle,
    innerRadius,
    outerRadius,
    percent,
  }) => {
    const RADIAN = Math.PI / 180;
    const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
    const x = cx + radius * Math.cos(-midAngle * RADIAN);
    const y = cy + radius * Math.sin(-midAngle * RADIAN);

    return (
      <text
        x={x}
        y={y}
        fill="white"
        textAnchor={x > cx ? "start" : "end"}
        dominantBaseline="central"
        fontSize={12}
        fontWeight="bold"
      >
        {`${(percent * 100).toFixed(0)}%`}
      </text>
    );
  };

  return (
    <Card>
      {title && <Title level={5}>{title}</Title>}
      <ResponsiveContainer width="100%" height={height}>
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            labelLine={false}
            label={renderCustomLabel}
            outerRadius={80}
            fill="#8884d8"
            dataKey={dataKey}
            nameKey={nameKey}
          >
            {data?.map((entry, index) => (
              <Cell
                key={`cell-${index}`}
                fill={colors[index % colors.length]}
              />
            ))}
          </Pie>
          <Tooltip />
          {showLegend && <Legend />}
        </PieChart>
      </ResponsiveContainer>
    </Card>
  );
};

// Area Chart Component (for Heat map visualization)
export const AreaChartComponent = ({
  data,
  dataKey,
  title,
  height = 300,
  showLegend = true,
  strokeColors = COLORS,
  fillColors = COLORS,
}) => {
  const areas = useMemo(() => {
    if (!data || !Array.isArray(data)) return [];
    if (Array.isArray(dataKey)) {
      return dataKey.map((key, index) => (
        <Area
          key={key}
          type="monotone"
          dataKey={key}
          stroke={strokeColors[index % strokeColors.length]}
          fill={fillColors[index % fillColors.length]}
          fillOpacity={0.6}
        />
      ));
    }
    return (
      <Area
        type="monotone"
        dataKey={dataKey}
        stroke={strokeColors[0]}
        fill={fillColors[0]}
        fillOpacity={0.6}
      />
    );
  }, [data, dataKey, strokeColors, fillColors]);

  return (
    <Card>
      {title && <Title level={5}>{title}</Title>}
      <ResponsiveContainer width="100%" height={height}>
        <AreaChart
          data={data}
          margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
        >
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="name" />
          <YAxis />
          <Tooltip />
          {showLegend && <Legend />}
          {areas}
        </AreaChart>
      </ResponsiveContainer>
    </Card>
  );
};

// Heat Map Component (using Bar chart for visualization)
export const HeatMapComponent = ({
  data,
  xKey,
  yKey,
  valueKey,
  title,
  height = 400,
  colors = ["#e6f7ff", "#91d5ff", "#1890ff", "#0050b3", "#003a8c"],
}) => {
  // Transform data for heat map visualization
  const heatMapData = useMemo(() => {
    if (!data || !Array.isArray(data)) return [];
    // Group by xKey and yKey
    const grouped = {};
    data.forEach((item) => {
      const x = item[xKey];
      const y = item[yKey];
      const value = item[valueKey] || 0;
      const key = `${x}-${y}`;
      if (!grouped[key]) {
        grouped[key] = { x, y, value };
      } else {
        grouped[key].value += value;
      }
    });
    return Object.values(grouped);
  }, [data, xKey, yKey, valueKey]);

  // Get color based on value
  const getColor = (value) => {
    const max = Math.max(...heatMapData.map((d) => d.value), 1);
    const ratio = value / max;
    const index = Math.floor(ratio * (colors.length - 1));
    return colors[index] || colors[colors.length - 1];
  };

  return (
    <Card>
      {title && <Title level={5}>{title}</Title>}
      <div style={{ height, overflow: "auto" }}>
        <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
          {heatMapData.map((item, index) => (
            <div
              key={index}
              style={{
                display: "flex",
                alignItems: "center",
                padding: "8px 12px",
                backgroundColor: getColor(item.value),
                borderRadius: 4,
                color: item.value > 50 ? "white" : "black",
              }}
            >
              <Text strong style={{ minWidth: 120 }}>
                {item.x}
              </Text>
              <Text style={{ minWidth: 120 }}>{item.y}</Text>
              <Text strong style={{ marginLeft: "auto" }}>
                {item.value}
              </Text>
            </div>
          ))}
        </div>
      </div>
    </Card>
  );
};

// Chart Type Selector
export const ChartTypeSelector = ({
  value,
  onChange,
  chartTypes = ["line", "bar", "pie", "area"],
}) => {
  return (
    <Space>
      <Text strong>Chart Type:</Text>
      <Select value={value} onChange={onChange} style={{ width: 120 }}>
        {chartTypes.includes("line") && (
          <Option value="line">Line Chart</Option>
        )}
        {chartTypes.includes("bar") && <Option value="bar">Bar Chart</Option>}
        {chartTypes.includes("pie") && <Option value="pie">Pie Chart</Option>}
        {chartTypes.includes("area") && (
          <Option value="area">Area Chart</Option>
        )}
        {chartTypes.includes("heatmap") && (
          <Option value="heatmap">Heat Map</Option>
        )}
      </Select>
    </Space>
  );
};

export default {
  LineChart: LineChartComponent,
  BarChart: BarChartComponent,
  PieChart: PieChartComponent,
  AreaChart: AreaChartComponent,
  HeatMap: HeatMapComponent,
};
