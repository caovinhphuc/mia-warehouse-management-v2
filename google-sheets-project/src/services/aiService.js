/**
 * AI Service - Kết nối với Backend AI API
 */

const API_BASE_URL = "/api/ai";

class AIService {
  /**
   * Phân tích dữ liệu và tạo insights
   */
  async analyzeData(data, timeframe = "7d") {
    try {
      const response = await fetch(`${API_BASE_URL}/analyze`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          data,
          timeframe,
        }),
      });

      if (!response.ok) {
        throw new Error(`AI analysis failed: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error("Error analyzing data:", error);
      throw error;
    }
  }

  /**
   * Lấy predictions cho tương lai
   */
  async getPredictions(metrics, timeframe = "7d") {
    try {
      const response = await fetch(`${API_BASE_URL}/predict`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          metrics,
          timeframe,
        }),
      });

      if (!response.ok) {
        throw new Error(`Prediction failed: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error("Error getting predictions:", error);
      throw error;
    }
  }

  /**
   * Phát hiện anomalies trong dữ liệu
   */
  async detectAnomalies(data) {
    try {
      const response = await fetch(`${API_BASE_URL}/anomalies`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ data }),
      });

      if (!response.ok) {
        throw new Error(`Anomaly detection failed: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error("Error detecting anomalies:", error);
      throw error;
    }
  }

  /**
   * Lấy recommendations từ AI
   */
  async getRecommendations(context) {
    try {
      const response = await fetch(`${API_BASE_URL}/recommendations`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ context }),
      });

      if (!response.ok) {
        throw new Error(`Recommendations failed: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error("Error getting recommendations:", error);
      throw error;
    }
  }

  /**
   * AI Chat - Trò chuyện với AI về dữ liệu
   */
  async chat(message, context = {}) {
    try {
      const response = await fetch(`${API_BASE_URL}/chat`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          message,
          context,
        }),
      });

      if (!response.ok) {
        throw new Error(`AI chat failed: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error("Error in AI chat:", error);
      throw error;
    }
  }

  /**
   * Phân tích Google Sheets data
   */
  async analyzeSheets(sheetData) {
    try {
      const response = await fetch(`${API_BASE_URL}/analyze-sheets`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ sheetData }),
      });

      if (!response.ok) {
        throw new Error(`Sheets analysis failed: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error("Error analyzing sheets:", error);
      throw error;
    }
  }

  /**
   * Phân tích Google Drive data
   */
  async analyzeDrive(driveData) {
    try {
      const response = await fetch(`${API_BASE_URL}/analyze-drive`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ driveData }),
      });

      if (!response.ok) {
        throw new Error(`Drive analysis failed: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error("Error analyzing drive:", error);
      throw error;
    }
  }

  /**
   * Tối ưu hóa hệ thống dựa trên AI
   */
  async optimizeSystem(systemMetrics) {
    try {
      const response = await fetch(`${API_BASE_URL}/optimize`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ systemMetrics }),
      });

      if (!response.ok) {
        throw new Error(`System optimization failed: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error("Error optimizing system:", error);
      throw error;
    }
  }
}

// Export singleton instance
export const aiService = new AIService();
export default aiService;
