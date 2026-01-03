/* eslint-disable */
/**
 * Data Filter Panel
 * Advanced filtering và search functionality
 */

import React from "react";
import {
  Input,
  Select,
  DatePicker,
  Space,
  Button,
  Typography,
  Row,
  Col,
} from "antd";
import {
  SearchOutlined,
  FilterOutlined,
  ClearOutlined,
} from "@ant-design/icons";

const { Text } = Typography;
const { RangePicker } = DatePicker;
const { Option } = Select;

export const DataFilterPanel = ({ filters, onFiltersChange, onSearch }) => {
  const handleSearch = (value) => {
    onSearch(value);
    onFiltersChange((prev) => ({ ...prev, search: value }));
  };

  const handleFilterChange = (key, value) => {
    onFiltersChange((prev) => ({ ...prev, [key]: value }));
  };

  const handleClearFilters = () => {
    onFiltersChange({
      search: "",
      dateRange: null,
      chartType: null,
    });
  };

  const hasActiveFilters =
    filters.search || filters.dateRange || filters.chartType;

  return (
    <Row gutter={[16, 16]} align="middle">
      <Col xs={24} sm={12} md={8}>
        <Space direction="vertical" style={{ width: "100%" }} size="small">
          <Text strong>Search</Text>
          <Input
            placeholder="Search widgets by title..."
            prefix={<SearchOutlined />}
            value={filters.search}
            onChange={(e) => handleSearch(e.target.value)}
            allowClear
          />
        </Space>
      </Col>

      <Col xs={24} sm={12} md={6}>
        <Space direction="vertical" style={{ width: "100%" }} size="small">
          <Text strong>Chart Type</Text>
          <Select
            style={{ width: "100%" }}
            placeholder="All Types"
            value={filters.chartType}
            onChange={(value) => handleFilterChange("chartType", value)}
            allowClear
          >
            <Option value="line">Line Chart</Option>
            <Option value="bar">Bar Chart</Option>
            <Option value="pie">Pie Chart</Option>
            <Option value="area">Area Chart</Option>
            <Option value="heatmap">Heat Map</Option>
          </Select>
        </Space>
      </Col>

      <Col xs={24} sm={12} md={8}>
        <Space direction="vertical" style={{ width: "100%" }} size="small">
          <Text strong>Date Range</Text>
          <RangePicker
            style={{ width: "100%" }}
            value={filters.dateRange}
            onChange={(dates) => handleFilterChange("dateRange", dates)}
            format="YYYY-MM-DD"
          />
        </Space>
      </Col>

      <Col xs={24} sm={12} md={2}>
        {hasActiveFilters && (
          <Button
            icon={<ClearOutlined />}
            onClick={handleClearFilters}
            danger
            style={{ width: "100%" }}
          >
            Clear
          </Button>
        )}
      </Col>
    </Row>
  );
};

export default DataFilterPanel;
