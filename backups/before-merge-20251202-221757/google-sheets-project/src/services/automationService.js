/* eslint-disable */
/**
 * Automation Service - Frontend API calls
 */

const API_BASE_URL =
  import.meta.env.VITE_API_URL ||
  import.meta.env.REACT_APP_API_URL ||
  "http://localhost:3001";

class AutomationService {
  /**
   * List all automations
   */
  async listAutomations() {
    try {
      const response = await fetch(`${API_BASE_URL}/api/automation`);
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to list automations");
      }
      return await response.json();
    } catch (error) {
      console.error("Error listing automations:", error);
      throw error;
    }
  }

  /**
   * Get automation by ID
   */
  async getAutomation(id) {
    try {
      const response = await fetch(`${API_BASE_URL}/api/automation/${id}`);
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to get automation");
      }
      return await response.json();
    } catch (error) {
      console.error("Error getting automation:", error);
      throw error;
    }
  }

  /**
   * Create new automation
   */
  async createAutomation(automation) {
    try {
      const response = await fetch(`${API_BASE_URL}/api/automation`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(automation),
      });
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to create automation");
      }
      return await response.json();
    } catch (error) {
      console.error("Error creating automation:", error);
      throw error;
    }
  }

  /**
   * Update automation
   */
  async updateAutomation(id, updates) {
    try {
      const response = await fetch(`${API_BASE_URL}/api/automation/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(updates),
      });
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to update automation");
      }
      return await response.json();
    } catch (error) {
      console.error("Error updating automation:", error);
      throw error;
    }
  }

  /**
   * Delete automation
   */
  async deleteAutomation(id) {
    try {
      const response = await fetch(`${API_BASE_URL}/api/automation/${id}`, {
        method: "DELETE",
      });
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to delete automation");
      }
      return await response.json();
    } catch (error) {
      console.error("Error deleting automation:", error);
      throw error;
    }
  }

  /**
   * Toggle automation status
   */
  async toggleAutomation(id) {
    try {
      const response = await fetch(
        `${API_BASE_URL}/api/automation/${id}/toggle`,
        {
          method: "POST",
        },
      );
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to toggle automation");
      }
      return await response.json();
    } catch (error) {
      console.error("Error toggling automation:", error);
      throw error;
    }
  }

  /**
   * Execute automation manually
   */
  async executeAutomation(id) {
    try {
      const response = await fetch(
        `${API_BASE_URL}/api/automation/${id}/execute`,
        {
          method: "POST",
        },
      );
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to execute automation");
      }
      return await response.json();
    } catch (error) {
      console.error("Error executing automation:", error);
      throw error;
    }
  }

  /**
   * Get execution logs for automation
   */
  async getAutomationLogs(id) {
    try {
      const response = await fetch(`${API_BASE_URL}/api/automation/${id}/logs`);
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to get logs");
      }
      return await response.json();
    } catch (error) {
      console.error("Error getting logs:", error);
      throw error;
    }
  }

  /**
   * Get all execution logs
   */
  async getAllLogs() {
    try {
      const response = await fetch(`${API_BASE_URL}/api/automation/logs/all`);
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to get logs");
      }
      return await response.json();
    } catch (error) {
      console.error("Error getting all logs:", error);
      throw error;
    }
  }
}

export const automationService = new AutomationService();
export default automationService;
