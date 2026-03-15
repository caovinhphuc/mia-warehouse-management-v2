 
/**
 * Advanced Analytics Dashboard
 * Features:
 * - Interactive charts (Line, Bar, Pie, Heat maps)
 * - Custom dashboard builder với drag & drop
 * - Data filtering và advanced search
 * - Export analytics reports
 */

import {
  DeleteOutlined,
  EditOutlined,
  ExportOutlined,
  PlusOutlined,
} from "@ant-design/icons";
import {
  Button,
  Card,
  Col,
  DatePicker,
  Form,
  Input,
  message,
  Modal,
  Row,
  Select,
  Space,
  Tag,
  Tooltip,
  Typography,
} from "antd";
import { useEffect, useState } from "react";
import { DndProvider } from "react-dnd";
import { HTML5Backend } from "react-dnd-html5-backend";
import { Responsive, WidthProvider } from "react-grid-layout";
// Lazy load ChartComponents (Recharts ~200KB) → tách chunk riêng, load khi cần
import { exportToCSV, exportToExcel, exportToPDF } from "@utils/exportUtils";
import { DataFilterPanel } from "./DataFilterPanel";
// CSS imports for react-grid-layout
import "react-grid-layout/css/styles.css";
import "react-resizable/css/styles.css";
import "./AdvancedAnalyticsDashboard.css";

const { Title, Text } = Typography;
const { RangePicker } = DatePicker;
const ResponsiveGridLayout = WidthProvider(Responsive);

// Sample data
const generateSampleData = (type = "line", count = 10) => {
  const data = [];
  for (let i = 0; i < count; i++) {
    if (type === "line" || type === "bar" || type === "area") {
      data.push({
        name: `Day ${i + 1}`,
        value: Math.floor(Math.random() * 100),
        value2: Math.floor(Math.random() * 100),
        value3: Math.floor(Math.random() * 100),
      });
    } else if (type === "pie") {
      data.push({
        name: `Category ${i + 1}`,
        value: Math.floor(Math.random() * 100),
      });
    } else if (type === "heatmap") {
      data.push({
        x: `X${i % 5}`,
        y: `Y${Math.floor(i / 5)}`,
        value: Math.floor(Math.random() * 100),
      });
    }
  }
  return data;
};

const AdvancedAnalyticsDashboard = () => {
  const [ChartModule, setChartModule] = useState(null);
  useEffect(() => {
    import(/* webpackChunkName: "chart-components" */ "./ChartComponents").then(
      (m) => setChartModule(m)
    );
  }, []);

  const [layouts, setLayouts] = useState({
    lg: [
      { i: "chart-1", x: 0, y: 0, w: 6, h: 3 },
      { i: "chart-2", x: 6, y: 0, w: 6, h: 3 },
      { i: "chart-3", x: 0, y: 3, w: 6, h: 3 },
      { i: "chart-4", x: 6, y: 3, w: 6, h: 3 },
    ],
  });

  const [widgets, setWidgets] = useState([
    {
      id: "chart-1",
      type: "line",
      title: "Sales Trend",
      data: generateSampleData("line"),
      dataKey: "value",
    },
    {
      id: "chart-2",
      type: "bar",
      title: "Revenue by Category",
      data: generateSampleData("bar"),
      dataKey: "value",
    },
    {
      id: "chart-3",
      type: "pie",
      title: "Market Share",
      data: generateSampleData("pie", 5),
      dataKey: "value",
    },
    {
      id: "chart-4",
      type: "area",
      title: "User Activity",
      data: generateSampleData("area"),
      dataKey: "value",
    },
  ]);

  const [filters, setFilters] = useState({
    search: "",
    dateRange: null,
    chartType: null,
  });
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingWidget, setEditingWidget] = useState(null);
  const [form] = Form.useForm();

  // Filter widgets based on search and filters
  const filteredWidgets = widgets.filter((widget) => {
    if (
      filters.search &&
      !widget.title.toLowerCase().includes(filters.search.toLowerCase())
    ) {
      return false;
    }
    if (filters.chartType && widget.type !== filters.chartType) {
      return false;
    }
    return true;
  });

  // Handle layout change
  const handleLayoutChange = (layout, allLayouts) => {
    setLayouts(allLayouts);
  };

  // Add new widget
  const handleAddWidget = () => {
    setShowAddModal(true);
    setEditingWidget(null);
    form.resetFields();
  };

  // Save widget
  const handleSaveWidget = (values) => {
    const newWidget = {
      id: `chart-${Date.now()}`,
      type: values.type,
      title: values.title,
      data: generateSampleData(values.type),
      dataKey: "value",
    };

    if (editingWidget) {
      setWidgets((prev) =>
        prev.map((w) =>
          w.id === editingWidget.id ? { ...w, ...newWidget } : w
        )
      );
      message.success("Widget updated successfully!");
    } else {
      setWidgets((prev) => [...prev, newWidget]);
      const newLayout = {
        i: newWidget.id,
        x: (widgets.length % 2) * 6,
        y: Math.floor(widgets.length / 2) * 3,
        w: 6,
        h: 3,
      };
      setLayouts((prev) => ({
        lg: [...(prev.lg || []), newLayout],
      }));
      message.success("Widget added successfully!");
    }
    setShowAddModal(false);
    form.resetFields();
  };

  // Delete widget
  const handleDeleteWidget = (widgetId) => {
    setWidgets((prev) => prev.filter((w) => w.id !== widgetId));
    setLayouts((prev) => ({
      lg: (prev.lg || []).filter((l) => l.i !== widgetId),
    }));
    message.success("Widget deleted successfully!");
  };

  // Edit widget
  const handleEditWidget = (widget) => {
    setEditingWidget(widget);
    form.setFieldsValue({
      type: widget.type,
      title: widget.title,
    });
    setShowAddModal(true);
  };

  // Export dashboard
  const handleExport = async (format) => {
    try {
      const exportData = {
        widgets: filteredWidgets,
        layouts: layouts.lg,
        filters,
        timestamp: new Date().toISOString(),
      };

      if (format === "pdf") {
        await exportToPDF(exportData, "Analytics-Dashboard");
        message.success("Dashboard exported to PDF!");
      } else if (format === "excel") {
        await exportToExcel(exportData, "Analytics-Dashboard");
        message.success("Dashboard exported to Excel!");
      } else if (format === "csv") {
        await exportToCSV(exportData, "Analytics-Dashboard");
        message.success("Dashboard exported to CSV!");
      }
    } catch (error) {
      console.error("Export error:", error);
      message.error("Failed to export dashboard");
    }
  };

  // Render chart based on type (ChartModule lazy loaded)
  const renderChart = (widget) => {
    if (!ChartModule) {
      return (
        <div
          style={{
            height: 300,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            background: "#fafafa",
            borderRadius: 8,
          }}
        >
          <Text type="secondary">Đang tải biểu đồ...</Text>
        </div>
      );
    }
    const commonProps = {
      title: widget.title,
      data: widget.data,
      dataKey: widget.dataKey,
      height: 300,
    };
    const {
      LineChartComponent: Line,
      BarChartComponent: Bar,
      PieChartComponent: Pie,
      AreaChartComponent: Area,
      HeatMapComponent: HeatMap,
    } = ChartModule;

    switch (widget.type) {
      case "line":
        return <Line {...commonProps} />;
      case "bar":
        return <Bar {...commonProps} />;
      case "pie":
        return <Pie {...commonProps} />;
      case "area":
        return <Area {...commonProps} />;
      case "heatmap":
        return (
          <HeatMap
            data={widget.data}
            xKey="x"
            yKey="y"
            valueKey="value"
            title={widget.title}
          />
        );
      default:
        return <Line {...commonProps} />;
    }
  };

  return (
    <DndProvider backend={HTML5Backend}>
      <div className="advanced-analytics-dashboard">
        {/* Header */}
        <Card className="dashboard-header-card">
          <Row justify="space-between" align="middle">
            <Col>
              <Title level={2}>📊 Advanced Analytics Dashboard</Title>
              <Text type="secondary">
                Interactive charts with drag & drop customization
              </Text>
            </Col>
            <Col>
              <Space>
                <Button
                  type="primary"
                  icon={<PlusOutlined />}
                  onClick={handleAddWidget}
                >
                  Add Widget
                </Button>
                <Button
                  icon={<ExportOutlined />}
                  onClick={() => handleExport("pdf")}
                >
                  Export PDF
                </Button>
                <Button
                  icon={<ExportOutlined />}
                  onClick={() => handleExport("excel")}
                >
                  Export Excel
                </Button>
                <Button
                  icon={<ExportOutlined />}
                  onClick={() => handleExport("csv")}
                >
                  Export CSV
                </Button>
              </Space>
            </Col>
          </Row>
        </Card>

        {/* Filters */}
        <Card className="filters-card">
          <DataFilterPanel
            filters={filters}
            onFiltersChange={setFilters}
            onSearch={(value) =>
              setFilters((prev) => ({ ...prev, search: value }))
            }
          />
        </Card>

        {/* Dashboard Grid */}
        <ResponsiveGridLayout
          className="layout"
          layouts={layouts}
          onLayoutChange={handleLayoutChange}
          breakpoints={{ lg: 1200, md: 996, sm: 768, xs: 480, xxs: 0 }}
          cols={{ lg: 12, md: 10, sm: 6, xs: 4, xxs: 2 }}
          rowHeight={100}
          isDraggable={true}
          isResizable={true}
        >
          {filteredWidgets.map((widget) => (
            <div key={widget.id} className="widget-container">
              <Card
                className="widget-card"
                title={
                  <div className="widget-header">
                    <Text strong>{widget.title}</Text>
                    <Space>
                      <Tooltip title="Edit">
                        <Button
                          type="text"
                          size="small"
                          icon={<EditOutlined />}
                          onClick={() => handleEditWidget(widget)}
                        />
                      </Tooltip>
                      <Tooltip title="Delete">
                        <Button
                          type="text"
                          size="small"
                          danger
                          icon={<DeleteOutlined />}
                          onClick={() => handleDeleteWidget(widget.id)}
                        />
                      </Tooltip>
                    </Space>
                  </div>
                }
                extra={<Tag>{widget.type.toUpperCase()}</Tag>}
              >
                {renderChart(widget)}
              </Card>
            </div>
          ))}
        </ResponsiveGridLayout>

        {/* Add/Edit Widget Modal */}
        <Modal
          title={editingWidget ? "Edit Widget" : "Add New Widget"}
          open={showAddModal}
          onCancel={() => {
            setShowAddModal(false);
            form.resetFields();
          }}
          onOk={() => form.submit()}
          okText="Save"
          cancelText="Cancel"
        >
          <Form
            form={form}
            layout="vertical"
            onFinish={handleSaveWidget}
            initialValues={{
              type: "line",
            }}
          >
            <Form.Item
              name="title"
              label="Widget Title"
              rules={[{ required: true, message: "Please enter widget title" }]}
            >
              <Input placeholder="Enter widget title" />
            </Form.Item>
            <Form.Item
              name="type"
              label="Chart Type"
              rules={[{ required: true, message: "Please select chart type" }]}
            >
              <Select>
                <Select.Option value="line">Line Chart</Select.Option>
                <Select.Option value="bar">Bar Chart</Select.Option>
                <Select.Option value="pie">Pie Chart</Select.Option>
                <Select.Option value="area">Area Chart</Select.Option>
                <Select.Option value="heatmap">Heat Map</Select.Option>
              </Select>
            </Form.Item>
          </Form>
        </Modal>
      </div>
    </DndProvider>
  );
};

export default AdvancedAnalyticsDashboard;
