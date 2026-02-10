/**
 * Google Apps Script Service - Kết nối với Backend Script API
 */

import importMetaEnv from "../utils/importMetaEnv";

const API_BASE_URL =
  importMetaEnv.VITE_API_URL ||
  importMetaEnv.REACT_APP_API_URL ||
  "http://localhost:3001";

class ScriptService {
  /**
   * Execute Google Apps Script
   */
  async executeScript(scriptId, functionName = "main", parameters = []) {
    try {
      const response = await fetch(`${API_BASE_URL}/api/script/execute`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          scriptId,
          functionName,
          parameters,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(
          errorData.error || `Script execution failed: ${response.statusText}`
        );
      }

      return await response.json();
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error("Error executing script:", error);
      throw error;
    }
  }

  /**
   * Execute inline script code
   */
  async executeInline(code, functionName = "main", parameters = []) {
    try {
      const response = await fetch(
        `${API_BASE_URL}/api/script/execute-inline`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            code,
            functionName,
            parameters,
          }),
        }
      );

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(
          errorData.error ||
            `Inline script execution failed: ${response.statusText}`
        );
      }

      return await response.json();
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error("Error executing inline script:", error);
      throw error;
    }
  }

  /**
   * Get script status
   */
  async getScriptStatus(scriptId) {
    try {
      const response = await fetch(
        `${API_BASE_URL}/api/script/status/${scriptId}`
      );

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(
          errorData.error ||
            `Failed to get script status: ${response.statusText}`
        );
      }

      return await response.json();
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error("Error getting script status:", error);
      throw error;
    }
  }

  /**
   * List script projects
   */
  async listProjects() {
    try {
      const response = await fetch(`${API_BASE_URL}/api/script/projects`);

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(
          errorData.error || `Failed to list projects: ${response.statusText}`
        );
      }

      return await response.json();
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error("Error listing projects:", error);
      throw error;
    }
  }

  /**
   * Test script (validation)
   */
  async testScript(scriptId, functionName = "main", parameters = []) {
    try {
      const response = await fetch(`${API_BASE_URL}/api/script/test`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          scriptId,
          functionName,
          parameters,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(
          errorData.error || `Script test failed: ${response.statusText}`
        );
      }

      return await response.json();
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error("Error testing script:", error);
      throw error;
    }
  }
}

// Export singleton instance
export const scriptService = new ScriptService();
export default scriptService;
