/**
 * Google Sheets API Service - Frontend
 * Calls backend API instead of direct Google APIs
 */

import axios from "axios";

const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || "http://localhost:3001/api";

class GoogleSheetsApiService {
  /**
   * Read data from sheet
   */
  async readSheet(range = "A1:Z1000", sheetId) {
    try {
      const params = { range };
      if (sheetId) params.sheetId = sheetId;

      const response = await axios.get(`${API_BASE_URL}/sheets/read`, {
        params,
      });
      return {
        data: response.data.data,
        range: response.data.range,
        majorDimension: response.data.majorDimension,
      };
    } catch (error) {
      console.error("Error reading sheet:", error);
      throw new Error(
        error.response?.data?.error || `Failed to read sheet: ${error.message}`,
      );
    }
  }

  /**
   * Write data to sheet
   */
  async writeSheet(range, values, sheetId) {
    try {
      const response = await axios.post(`${API_BASE_URL}/sheets/write`, {
        range,
        values,
        sheetId,
      });
      return response.data.data;
    } catch (error) {
      console.error("Error writing to sheet:", error);
      throw new Error(
        error.response?.data?.error ||
          `Failed to write to sheet: ${error.message}`,
      );
    }
  }

  /**
   * Append data to sheet
   */
  async appendToSheet(range, values, sheetId) {
    try {
      const response = await axios.post(`${API_BASE_URL}/sheets/append`, {
        range,
        values,
        sheetId,
      });
      return response.data.data;
    } catch (error) {
      console.error("Error appending to sheet:", error);
      throw new Error(
        error.response?.data?.error ||
          `Failed to append to sheet: ${error.message}`,
      );
    }
  }

  /**
   * Get sheet metadata
   */
  async getSheetMetadata(sheetId) {
    try {
      const url = sheetId
        ? `${API_BASE_URL}/sheets/metadata/${sheetId}`
        : `${API_BASE_URL}/sheets/metadata`;

      const response = await axios.get(url);
      return response.data.data;
    } catch (error) {
      console.error("Error getting sheet metadata:", error);
      throw new Error(
        error.response?.data?.error ||
          `Failed to get sheet metadata: ${error.message}`,
      );
    }
  }

  /**
   * Clear sheet data
   */
  async clearSheet(range, sheetId) {
    try {
      const response = await axios.delete(`${API_BASE_URL}/sheets/clear`, {
        data: { range, sheetId },
      });
      return response.data.data;
    } catch (error) {
      console.error("Error clearing sheet:", error);
      throw new Error(
        error.response?.data?.error ||
          `Failed to clear sheet: ${error.message}`,
      );
    }
  }

  /**
   * Add new worksheet (sheet) to spreadsheet
   */
  async addSheet(sheetName, sheetId) {
    try {
      const response = await axios.post(`${API_BASE_URL}/sheets/add-sheet`, {
        sheetName,
        sheetId,
      });
      return response.data.data;
    } catch (error) {
      console.error("Error adding sheet:", error);
      throw new Error(
        error.response?.data?.error || `Failed to add sheet: ${error.message}`,
      );
    }
  }
}

// Export singleton instance
export const googleSheetsApiService = new GoogleSheetsApiService();
export default googleSheetsApiService;
