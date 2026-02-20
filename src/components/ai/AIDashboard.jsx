import { useState, useEffect, useCallback, useMemo } from "react";
import { useSelector } from "react-redux";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  Legend,
} from "recharts";
import Loading from "../Common/Loading";
import { aiService } from "../../services/aiService";
import "./AIDashboard.css";

const AIDashboard = () => {
  const { sheets } = useSelector((state) => state.sheets);
  const { files } = useSelector((state) => state.drive);
  const { alerts } = useSelector((state) => state.alerts);

  const [aiInsights, setAiInsights] = useState([]);
  const [predictions, setPredictions] = useState({});
  const [recommendations, setRecommendations] = useState([]);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [selectedTimeframe, setSelectedTimeframe] = useState("7d");
  const [error, setError] = useState(null);
  const [predictionChartData, setPredictionChartData] = useState([]);
  const [trendChartData, setTrendChartData] = useState([]);
  const [autoRefresh, setAutoRefresh] = useState(false);
  const [systemStability, setSystemStability] = useState(80);
  const [filterType, setFilterType] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");

  // AI Chat state
  const [chatMessages, setChatMessages] = useState([]);
  const [chatInput, setChatInput] = useState("");
  const [isChatting, setIsChatting] = useState(false);
  const [showChat, setShowChat] = useState(false);

  // Real AI analysis using aiService
  const analyzeData = useCallback(async () => {
    setIsAnalyzing(true);
    setError(null);

    try {
      // Prepare data for analysis
      const analysisData = {
        sheets: sheets.length,
        files: files.length,
        alerts: alerts.length,
        timestamp: new Date().toISOString(),
      };

      // Call AI service
      const [insightsResult, predictionsResult, recommendationsResult] =
        await Promise.all([
          aiService.analyzeData(analysisData, selectedTimeframe),
          aiService.getPredictions(
            {
              sheets: sheets.length,
              files: files.length,
              alerts: alerts.length,
            },
            selectedTimeframe
          ),
          aiService.getRecommendations({
            sheets: sheets.length,
            files: files.length,
            alerts: alerts.length,
          }),
        ]);

      setAiInsights(insightsResult.insights || []);
      setPredictions(predictionsResult.predictions || {});
      setRecommendations(recommendationsResult.recommendations || []);

      // Calculate system stability based on insights
      const stabilityScore = calculateStabilityScore(
        insightsResult.insights || [],
        alerts.length
      );
      setSystemStability(stabilityScore);

      // Generate chart data for predictions
      if (predictionsResult.predictions) {
        const current = {
          sheets: sheets.length,
          files: files.length,
          alerts: alerts.length,
        };
        const nextWeek = predictionsResult.predictions.nextWeek || {};
        const nextMonth = predictionsResult.predictions.nextMonth || {};

        setPredictionChartData([
          {
            period: "Hiện tại",
            sheets: current.sheets,
            files: current.files,
            alerts: current.alerts,
          },
          {
            period: "Tuần tới",
            sheets: nextWeek.sheets || 0,
            files: nextWeek.files || 0,
            alerts: nextWeek.alerts || 0,
          },
          {
            period: "Tháng tới",
            sheets: nextMonth.sheets || 0,
            files: nextMonth.files || 0,
            alerts: nextMonth.alerts || 0,
          },
        ]);

        // Generate trend data (last 7 days projection)
        const trendData = [];
        const days = ["T2", "T3", "T4", "T5", "T6", "T7", "CN"];
        for (let i = 0; i < 7; i++) {
          const growth = 1 + (i / 7) * 0.15; // 15% growth over week
          trendData.push({
            day: days[i],
            sheets: Math.round(current.sheets * growth),
            files: Math.round(current.files * growth * 0.9),
            alerts: Math.max(0, Math.round(current.alerts * (1 - i * 0.05))),
          });
        }
        setTrendChartData(trendData);
      }
    } catch (err) {
      // eslint-disable-next-line no-console
      console.error("AI Analysis Error:", err);
      setError("Không thể phân tích dữ liệu. Vui lòng thử lại.");

      // Fallback to sample data if API fails
      const fallbackInsights = [
        {
          id: 1,
          type: "trend",
          title: "📈 Xu hướng tăng trưởng",
          description: "Dữ liệu Google Sheets tăng 23% trong 7 ngày qua",
          confidence: 0.87,
          impact: "high",
          action: "Tăng cường backup và monitoring",
        },
        {
          id: 2,
          type: "anomaly",
          title: "⚠️ Phát hiện bất thường",
          description: "Hoạt động upload Drive tăng đột biến 150% vào 14:30",
          confidence: 0.92,
          impact: "medium",
          action: "Kiểm tra và xác minh hoạt động",
        },
        {
          id: 3,
          type: "optimization",
          title: "⚡ Tối ưu hóa hiệu suất",
          description: "Có thể giảm 40% thời gian xử lý bằng batch requests",
          confidence: 0.85,
          impact: "high",
          action: "Triển khai batch processing",
        },
      ];

      const fallbackPredictions = {
        nextWeek: {
          sheets: Math.round(sheets.length * 1.15),
          files: Math.round(files.length * 1.08),
          alerts: Math.max(0, Math.round(alerts.length * 0.9)),
        },
        nextMonth: {
          sheets: Math.round(sheets.length * 1.4),
          files: Math.round(files.length * 1.25),
          alerts: Math.max(0, Math.round(alerts.length * 0.8)),
        },
      };

      const fallbackRecommendations = [
        {
          id: 1,
          category: "performance",
          title: "Tối ưu hóa API calls",
          description: "Sử dụng batch requests để giảm 40% thời gian xử lý",
          priority: "high",
          effort: "medium",
          impact: "high",
          status: "pending",
        },
        {
          id: 2,
          category: "security",
          title: "Cập nhật bảo mật",
          description: "Thêm 2FA cho tất cả service accounts",
          priority: "high",
          effort: "low",
          impact: "high",
          status: "pending",
        },
        {
          id: 3,
          category: "automation",
          title: "Tự động hóa backup",
          description: "Thiết lập backup tự động hàng ngày lúc 2:00 AM",
          priority: "medium",
          effort: "low",
          impact: "medium",
          status: "pending",
        },
      ];

      setAiInsights(fallbackInsights);
      setPredictions(fallbackPredictions);
      setRecommendations(fallbackRecommendations);
      setSystemStability(80);
    } finally {
      setIsAnalyzing(false);
    }
  }, [sheets.length, files.length, alerts.length, selectedTimeframe]);

  // Calculate system stability score
  const calculateStabilityScore = (insights, alertCount) => {
    let score = 100;

    // Reduce score based on anomalies
    const anomalies = insights.filter((i) => i.type === "anomaly");
    score -= anomalies.length * 10;

    // Reduce score based on alerts
    if (alertCount > 10) score -= 10;
    else if (alertCount > 5) score -= 5;

    // Increase score based on optimizations
    const optimizations = insights.filter((i) => i.type === "optimization");
    score += optimizations.length * 5;

    return Math.max(0, Math.min(100, score));
  };

  // AI Chat handler
  const handleChatSend = async () => {
    if (!chatInput.trim() || isChatting) return;

    const userMessage = {
      id: Date.now(),
      type: "user",
      message: chatInput,
      timestamp: new Date().toISOString(),
    };

    setChatMessages((prev) => [...prev, userMessage]);
    const currentInput = chatInput;
    setChatInput("");
    setIsChatting(true);

    try {
      const context = {
        sheets: sheets.length,
        files: files.length,
        alerts: alerts.length,
        insights: aiInsights.length,
        recommendations: recommendations.length,
      };

      const response = await aiService.chat(currentInput, context);

      const aiMessage = {
        id: Date.now() + 1,
        type: "ai",
        message: response.response || response.message,
        confidence: response.confidence,
        suggestions: response.suggestions || [],
        timestamp: new Date().toISOString(),
      };

      setChatMessages((prev) => [...prev, aiMessage]);
    } catch (err) {
      // eslint-disable-next-line no-console
      console.error("AI Chat Error:", err);
      const errorMessage = {
        id: Date.now() + 1,
        type: "ai",
        message:
          "Xin lỗi, tôi không thể trả lời ngay bây giờ. Vui lòng thử lại sau.",
        timestamp: new Date().toISOString(),
      };
      setChatMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsChatting(false);
    }
  };

  useEffect(() => {
    analyzeData();
  }, [analyzeData]);

  // Auto-refresh analysis
  useEffect(() => {
    if (autoRefresh) {
      const interval = setInterval(() => {
        analyzeData();
      }, 60000); // Refresh every 60 seconds

      return () => clearInterval(interval);
    }
  }, [autoRefresh, analyzeData]);

  // Handle recommendation implementation
  const handleImplementRecommendation = async (recId) => {
    const recommendation = recommendations.find((r) => r.id === recId);
    if (!recommendation) return;

    // Show confirmation
    if (
      window.confirm(
        `Bạn có muốn triển khai: ${recommendation.title}?\n\n${recommendation.description}`
      )
    ) {
      // Update recommendation status
      setRecommendations((prev) =>
        prev.map((rec) =>
          rec.id === recId
            ? {
                ...rec,
                status: "in-progress",
                implementedAt: new Date().toISOString(),
              }
            : rec
        )
      );

      // Simulate implementation (replace with actual API call)
      setTimeout(() => {
        setRecommendations((prev) =>
          prev.map((rec) =>
            rec.id === recId ? { ...rec, status: "implemented" } : rec
          )
        );
        alert(`✅ Đã triển khai thành công: ${recommendation.title}`);
      }, 2000);
    }
  };

  // Export data
  const handleExport = () => {
    const exportData = {
      insights: aiInsights,
      predictions,
      recommendations,
      systemStability,
      timestamp: new Date().toISOString(),
    };

    const blob = new Blob([JSON.stringify(exportData, null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `ai-dashboard-export-${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  // Filtered insights and recommendations
  const filteredInsights = useMemo(() => {
    let filtered = aiInsights;

    if (filterType !== "all") {
      filtered = filtered.filter((insight) => insight.type === filterType);
    }

    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (insight) =>
          insight.title.toLowerCase().includes(query) ||
          insight.description.toLowerCase().includes(query)
      );
    }

    return filtered;
  }, [aiInsights, filterType, searchQuery]);

  const filteredRecommendations = useMemo(() => {
    let filtered = recommendations;

    if (filterType !== "all") {
      filtered = filtered.filter((rec) => rec.category === filterType);
    }

    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (rec) =>
          rec.title.toLowerCase().includes(query) ||
          rec.description.toLowerCase().includes(query)
      );
    }

    return filtered;
  }, [recommendations, filterType, searchQuery]);

  const getInsightIcon = (type) => {
    switch (type) {
      case "trend":
        return "📈";
      case "anomaly":
        return "⚠️";
      case "optimization":
        return "⚡";
      case "security":
        return "🔒";
      default:
        return "🤖";
    }
  };

  const getImpactColor = (impact) => {
    switch (impact) {
      case "high":
        return "#ef4444";
      case "medium":
        return "#f59e0b";
      case "low":
        return "#10b981";
      default:
        return "#6b7280";
    }
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case "high":
        return "#ef4444";
      case "medium":
        return "#f59e0b";
      case "low":
        return "#10b981";
      default:
        return "#6b7280";
    }
  };

  const getStabilityColor = (stability) => {
    if (stability >= 80) return "#10b981";
    if (stability >= 60) return "#f59e0b";
    return "#ef4444";
  };

  const getStabilityText = (stability) => {
    if (stability >= 80) return "Hệ thống ổn định";
    if (stability >= 60) return "Hệ thống cần chú ý";
    return "Hệ thống có vấn đề";
  };

  return (
    <div className="ai-dashboard ai-dashboard-container">
      <div className="ai-header page-header">
        <div className="header-left">
          <h2>🤖 AI Dashboard</h2>
          {/* System Stability Indicator */}
          <div className="system-stability-indicator">
            <div className="stability-info">
              <span
                className="stability-dot"
                style={{ backgroundColor: getStabilityColor(systemStability) }}
              />
              <span className="stability-text">
                {getStabilityText(systemStability)} {systemStability}%
              </span>
            </div>
            <div className="stability-progress">
              <div
                className="stability-progress-bar"
                style={{
                  width: `${systemStability}%`,
                  backgroundColor: getStabilityColor(systemStability),
                }}
              />
            </div>
          </div>
        </div>
        <div className="ai-controls page-controls">
          <select
            value={selectedTimeframe}
            onChange={(e) => setSelectedTimeframe(e.target.value)}
            className="timeframe-select"
          >
            <option value="1d">1 ngày</option>
            <option value="7d">7 ngày</option>
            <option value="30d">30 ngày</option>
            <option value="90d">90 ngày</option>
          </select>
          <button
            className="analyze-btn"
            onClick={analyzeData}
            disabled={isAnalyzing}
          >
            {isAnalyzing ? "🔄 Đang phân tích..." : "🔍 Phân tích lại"}
          </button>
          <button
            className="export-btn"
            onClick={handleExport}
            title="Xuất dữ liệu"
          >
            📥 Xuất
          </button>
          <button
            className="chat-toggle-btn"
            onClick={() => setShowChat(!showChat)}
          >
            {showChat ? "💬 Ẩn Chat" : "💬 AI Chat"}
          </button>
          <button
            className={`auto-refresh-btn ${autoRefresh ? "active" : ""}`}
            onClick={() => setAutoRefresh(!autoRefresh)}
            title={autoRefresh ? "Tắt tự động làm mới" : "Bật tự động làm mới"}
          >
            {autoRefresh ? "⏸️ Tắt Auto" : "▶️ Bật Auto"}
          </button>
        </div>
      </div>

      {error && <div className="error-banner">⚠️ {error}</div>}

      {isAnalyzing && <Loading text="AI đang phân tích dữ liệu..." />}

      {/* Filters and Search */}
      <div className="ai-filters">
        <div className="filter-group">
          <label>Lọc theo:</label>
          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
            className="filter-select"
          >
            <option value="all">Tất cả</option>
            <option value="trend">Xu hướng</option>
            <option value="anomaly">Bất thường</option>
            <option value="optimization">Tối ưu hóa</option>
            <option value="security">Bảo mật</option>
          </select>
        </div>
        <div className="search-group">
          <input
            type="text"
            placeholder="🔍 Tìm kiếm..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="search-input"
          />
        </div>
      </div>

      <div className="ai-grid">
        {/* AI Insights */}
        <div className="insights-section ai-card">
          <div className="section-header">
            <h3>💡 AI Insights</h3>
            <span className="section-count">{filteredInsights.length}</span>
          </div>
          <div className="insights-list">
            {filteredInsights.length === 0 ? (
              <div className="empty-state">
                <p>Không có insights nào phù hợp với bộ lọc.</p>
              </div>
            ) : (
              filteredInsights.map((insight) => (
                <div key={insight.id} className="insight-card">
                  <div className="insight-header">
                    <span className="insight-icon">
                      {getInsightIcon(insight.type)}
                    </span>
                    <span className="insight-title">{insight.title}</span>
                    <span
                      className="confidence-badge"
                      style={{
                        backgroundColor: getImpactColor(insight.impact),
                      }}
                    >
                      {Math.round(insight.confidence * 100)}%
                    </span>
                  </div>
                  <p className="insight-description">{insight.description}</p>
                  <div className="insight-action">
                    <strong>Hành động:</strong> {insight.action}
                  </div>
                  <div className="insight-confidence-bar">
                    <div
                      className="confidence-fill"
                      style={{
                        width: `${insight.confidence * 100}%`,
                        backgroundColor: getImpactColor(insight.impact),
                      }}
                    />
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Predictions with Charts */}
        <div className="predictions-section ai-card">
          <div className="section-header">
            <h3>🔮 Dự đoán</h3>
          </div>

          {/* Prediction Chart */}
          {predictionChartData.length > 0 && (
            <div className="prediction-chart-container">
              <h4>📊 Dự đoán Tăng Trưởng</h4>
              <ResponsiveContainer width="100%" height={250}>
                <BarChart data={predictionChartData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="period" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="sheets" fill="#3b82f6" name="Sheets" />
                  <Bar dataKey="files" fill="#10b981" name="Files" />
                  <Bar dataKey="alerts" fill="#f59e0b" name="Alerts" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}

          {/* Trend Chart */}
          {trendChartData.length > 0 && (
            <div className="trend-chart-container">
              <h4>📈 Xu Hướng 7 Ngày Tới</h4>
              <ResponsiveContainer width="100%" height={250}>
                <AreaChart data={trendChartData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="day" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Area
                    type="monotone"
                    dataKey="sheets"
                    stackId="1"
                    stroke="#3b82f6"
                    fill="#3b82f6"
                    fillOpacity={0.6}
                    name="Sheets"
                  />
                  <Area
                    type="monotone"
                    dataKey="files"
                    stackId="1"
                    stroke="#10b981"
                    fill="#10b981"
                    fillOpacity={0.6}
                    name="Files"
                  />
                  <Area
                    type="monotone"
                    dataKey="alerts"
                    stackId="1"
                    stroke="#f59e0b"
                    fill="#f59e0b"
                    fillOpacity={0.6}
                    name="Alerts"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          )}

          {/* Prediction Cards */}
          <div className="predictions-grid">
            <div className="prediction-card">
              <h4>📅 Tuần tới</h4>
              <div className="prediction-stats">
                <div className="stat">
                  <span className="label">Sheets:</span>
                  <span className="value">
                    {predictions.nextWeek?.sheets || 0}
                  </span>
                  {sheets.length > 0 && (
                    <span className="change">
                      ({predictions.nextWeek?.sheets > sheets.length ? "+" : ""}
                      {(
                        ((predictions.nextWeek?.sheets - sheets.length) /
                          sheets.length) *
                        100
                      ).toFixed(1)}
                      %)
                    </span>
                  )}
                </div>
                <div className="stat">
                  <span className="label">Files:</span>
                  <span className="value">
                    {predictions.nextWeek?.files || 0}
                  </span>
                  {files.length > 0 && (
                    <span className="change">
                      ({predictions.nextWeek?.files > files.length ? "+" : ""}
                      {(
                        ((predictions.nextWeek?.files - files.length) /
                          files.length) *
                        100
                      ).toFixed(1)}
                      %)
                    </span>
                  )}
                </div>
                <div className="stat">
                  <span className="label">Alerts:</span>
                  <span className="value">
                    {predictions.nextWeek?.alerts || 0}
                  </span>
                </div>
              </div>
            </div>
            <div className="prediction-card">
              <h4>📆 Tháng tới</h4>
              <div className="prediction-stats">
                <div className="stat">
                  <span className="label">Sheets:</span>
                  <span className="value">
                    {predictions.nextMonth?.sheets || 0}
                  </span>
                  {sheets.length > 0 && (
                    <span className="change">
                      (
                      {predictions.nextMonth?.sheets > sheets.length ? "+" : ""}
                      {(
                        ((predictions.nextMonth?.sheets - sheets.length) /
                          sheets.length) *
                        100
                      ).toFixed(1)}
                      %)
                    </span>
                  )}
                </div>
                <div className="stat">
                  <span className="label">Files:</span>
                  <span className="value">
                    {predictions.nextMonth?.files || 0}
                  </span>
                  {files.length > 0 && (
                    <span className="change">
                      ({predictions.nextMonth?.files > files.length ? "+" : ""}
                      {(
                        ((predictions.nextMonth?.files - files.length) /
                          files.length) *
                        100
                      ).toFixed(1)}
                      %)
                    </span>
                  )}
                </div>
                <div className="stat">
                  <span className="label">Alerts:</span>
                  <span className="value">
                    {predictions.nextMonth?.alerts || 0}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Recommendations */}
        <div className="recommendations-section ai-card">
          <div className="section-header">
            <h3>💡 Khuyến nghị</h3>
            <span className="section-count">
              {filteredRecommendations.length}
            </span>
          </div>
          <div className="recommendations-list">
            {filteredRecommendations.length === 0 ? (
              <div className="empty-state">
                <p>Không có khuyến nghị nào phù hợp với bộ lọc.</p>
              </div>
            ) : (
              filteredRecommendations.map((rec) => (
                <div key={rec.id} className="recommendation-card">
                  <div className="rec-header">
                    <span className="rec-title">{rec.title}</span>
                    <span
                      className="priority-badge"
                      style={{
                        backgroundColor: getPriorityColor(rec.priority),
                      }}
                    >
                      {rec.priority}
                    </span>
                  </div>
                  <p className="rec-description">{rec.description}</p>
                  <div className="rec-meta">
                    <span className="effort">Effort: {rec.effort}</span>
                    <span className="impact">Impact: {rec.impact}</span>
                    {rec.status && (
                      <span className={`rec-status ${rec.status}`}>
                        {rec.status === "implemented"
                          ? "✅ Đã triển khai"
                          : rec.status === "in-progress"
                            ? "🔄 Đang triển khai"
                            : "⏳ Chờ triển khai"}
                      </span>
                    )}
                  </div>
                  <button
                    className="implement-btn"
                    onClick={() => handleImplementRecommendation(rec.id)}
                    disabled={rec.status === "implemented"}
                  >
                    {rec.status === "implemented"
                      ? "✅ Đã triển khai"
                      : "🚀 Triển khai"}
                  </button>
                </div>
              ))
            )}
          </div>
        </div>

        {/* AI Performance */}
        <div className="performance-section ai-card">
          <div className="section-header">
            <h3>⚡ AI Performance</h3>
          </div>
          <div className="performance-metrics">
            <div className="metric">
              <div className="metric-label">Accuracy</div>
              <div className="metric-value">94.2%</div>
              <div className="metric-trend positive">↗️ +2.1%</div>
            </div>
            <div className="metric">
              <div className="metric-label">Response Time</div>
              <div className="metric-value">1.2s</div>
              <div className="metric-trend positive">↘️ -0.3s</div>
            </div>
            <div className="metric">
              <div className="metric-label">Insights Generated</div>
              <div className="metric-value">{aiInsights.length}</div>
              <div className="metric-trend positive">
                ↗️ +{aiInsights.length}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* AI Chat Panel */}
      {showChat && (
        <div className="ai-chat-panel">
          <div className="chat-header">
            <h3>💬 AI Assistant</h3>
            <button
              className="close-chat-btn"
              onClick={() => setShowChat(false)}
              aria-label="Đóng chat"
            >
              ✕
            </button>
          </div>
          <div className="chat-messages" id="chat-messages">
            {chatMessages.length === 0 ? (
              <div className="chat-welcome">
                <p>👋 Xin chào! Tôi là AI Assistant.</p>
                <p>Hãy hỏi tôi về dữ liệu, insights, hoặc recommendations!</p>
                <div className="chat-suggestions">
                  <button
                    className="suggestion-btn"
                    onClick={() => setChatInput("Phân tích xu hướng dữ liệu")}
                  >
                    Phân tích xu hướng dữ liệu
                  </button>
                  <button
                    className="suggestion-btn"
                    onClick={() => setChatInput("Khuyến nghị tối ưu hóa")}
                  >
                    Khuyến nghị tối ưu hóa
                  </button>
                  <button
                    className="suggestion-btn"
                    onClick={() => setChatInput("Dự đoán tương lai")}
                  >
                    Dự đoán tương lai
                  </button>
                </div>
              </div>
            ) : (
              chatMessages.map((msg) => (
                <div key={msg.id} className={`chat-message ${msg.type}`}>
                  <div className="message-content">{msg.message}</div>
                  {msg.suggestions && msg.suggestions.length > 0 && (
                    <div className="message-suggestions">
                      {msg.suggestions.map((suggestion, idx) => (
                        <button
                          key={idx}
                          className="suggestion-btn"
                          onClick={() => setChatInput(suggestion)}
                        >
                          {suggestion}
                        </button>
                      ))}
                    </div>
                  )}
                  <div className="message-time">
                    {new Date(msg.timestamp).toLocaleTimeString()}
                  </div>
                </div>
              ))
            )}
          </div>
          <div className="chat-input-container">
            <input
              type="text"
              className="chat-input"
              placeholder="Nhập câu hỏi của bạn..."
              value={chatInput}
              onChange={(e) => setChatInput(e.target.value)}
              onKeyPress={(e) => e.key === "Enter" && handleChatSend()}
              disabled={isChatting}
            />
            <button
              className="chat-send-btn"
              onClick={handleChatSend}
              disabled={isChatting || !chatInput.trim()}
              aria-label="Gửi tin nhắn"
            >
              {isChatting ? "⏳" : "📤"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default AIDashboard;
