import importMetaEnv from "../utils/importMetaEnv";
/* eslint-disable */
/**
 * Smart Automation Service
 * AI-powered data analysis, predictive alerts, categorization, and reports
 */

const API_BASE_URL =
  importMetaEnv.VITE_AI_SERVICE_URL ||
  importMetaEnv.REACT_APP_AI_SERVICE_URL ||
  "http://localhost:3001";

class SmartAutomationService {
  /**
   * Analyze patterns in data
   */
  async analyzePatterns(data, valueColumn, dateColumn = null) {
    try {
      const response = await fetch(`${API_BASE_URL}/api/patterns/analyze`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          data,
          value_column: valueColumn,
          date_column: dateColumn,
        }),
      });

      if (!response.ok) {
        throw new Error(`Pattern analysis failed: ${response.statusText}`);
      }

      const result = await response.json();
      return result.data || result;
    } catch (error) {
      console.error("Error analyzing patterns:", error);
      throw error;
    }
  }

  /**
   * Analyze trends in data
   */
  async analyzeTrends(data, valueColumn) {
    try {
      const response = await fetch(`${API_BASE_URL}/api/patterns/trends`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          data,
          value_column: valueColumn,
        }),
      });

      if (!response.ok) {
        throw new Error(`Trend analysis failed: ${response.statusText}`);
      }

      const result = await response.json();
      return result.data || result;
    } catch (error) {
      console.error("Error analyzing trends:", error);
      throw error;
    }
  }

  /**
   * Detect anomalies in data
   */
  async detectAnomalies(data, valueColumn) {
    try {
      const response = await fetch(`${API_BASE_URL}/api/patterns/anomalies`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          data,
          value_column: valueColumn,
        }),
      });

      if (!response.ok) {
        throw new Error(`Anomaly detection failed: ${response.statusText}`);
      }

      const result = await response.json();
      return result.data || result;
    } catch (error) {
      console.error("Error detecting anomalies:", error);
      throw error;
    }
  }

  /**
   * Generate predictive alerts
   */
  async generatePredictiveAlerts(
    data,
    valueColumn,
    metricName = null,
    threshold = null
  ) {
    try {
      const response = await fetch(`${API_BASE_URL}/api/alerts/predictive`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          data,
          value_column: valueColumn,
          metric_name: metricName,
          threshold,
        }),
      });

      if (!response.ok) {
        throw new Error(`Predictive alert failed: ${response.statusText}`);
      }

      const result = await response.json();
      return result.data || result;
    } catch (error) {
      console.error("Error generating predictive alerts:", error);
      throw error;
    }
  }

  /**
   * Categorize columns
   */
  async categorizeColumn(columnName, sampleValues = []) {
    try {
      const response = await fetch(`${API_BASE_URL}/api/categorize/columns`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          column_name: columnName,
          sample_values: sampleValues,
        }),
      });

      if (!response.ok) {
        throw new Error(`Categorization failed: ${response.statusText}`);
      }

      const result = await response.json();
      return result.data || result;
    } catch (error) {
      console.error("Error categorizing column:", error);
      throw error;
    }
  }

  /**
   * Categorize rows
   */
  async categorizeRows(data, categoryRules = null) {
    try {
      const response = await fetch(`${API_BASE_URL}/api/categorize/rows`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          data,
          category_rules: categoryRules,
        }),
      });

      if (!response.ok) {
        throw new Error(`Row categorization failed: ${response.statusText}`);
      }

      const result = await response.json();
      return result.data || result;
    } catch (error) {
      console.error("Error categorizing rows:", error);
      throw error;
    }
  }

  /**
   * Generate automated report
   */
  async generateReport(
    data,
    valueColumn,
    reportType = "comprehensive",
    dateColumn = null,
    title = null
  ) {
    try {
      const response = await fetch(`${API_BASE_URL}/api/reports/generate`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          data,
          value_column: valueColumn,
          date_column: dateColumn,
          report_type: reportType,
          title,
        }),
      });

      if (!response.ok) {
        throw new Error(`Report generation failed: ${response.statusText}`);
      }

      const result = await response.json();
      return result.data || result;
    } catch (error) {
      console.error("Error generating report:", error);
      throw error;
    }
  }

  /**
   * Process natural language chat query
   */
  async processChatQuery(query, context = null) {
    try {
      const response = await fetch(`${API_BASE_URL}/api/nlp/chat`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          query,
          context,
        }),
      });

      if (!response.ok) {
        throw new Error(`NLP chat failed: ${response.statusText}`);
      }

      const result = await response.json();
      return result.data || result;
    } catch (error) {
      console.error("Error processing chat query:", error);
      throw error;
    }
  }

  /**
   * Generate auto summary
   */
  async generateSummary(data, maxLength = 200) {
    try {
      const response = await fetch(`${API_BASE_URL}/api/nlp/summary`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          data,
          max_length: maxLength,
        }),
      });

      if (!response.ok) {
        throw new Error(`Summary generation failed: ${response.statusText}`);
      }

      const result = await response.json();
      return result.data || result;
    } catch (error) {
      console.error("Error generating summary:", error);
      throw error;
    }
  }

  /**
   * Smart search across all data
   */
  async smartSearch(query, data, columns = null) {
    try {
      const response = await fetch(`${API_BASE_URL}/api/nlp/search`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          query,
          data,
          columns,
        }),
      });

      if (!response.ok) {
        throw new Error(`Smart search failed: ${response.statusText}`);
      }

      const result = await response.json();
      return result.data || result;
    } catch (error) {
      console.error("Error in smart search:", error);
      throw error;
    }
  }

  /**
   * Process voice command
   */
  async processVoiceCommand(command, context = null) {
    try {
      const response = await fetch(`${API_BASE_URL}/api/nlp/voice`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          query: command,
          context,
        }),
      });

      if (!response.ok) {
        throw new Error(
          `Voice command processing failed: ${response.statusText}`
        );
      }

      const result = await response.json();
      return result.data || result;
    } catch (error) {
      console.error("Error processing voice command:", error);
      throw error;
    }
  }
}

export const smartAutomationService = new SmartAutomationService();
export default smartAutomationService;
