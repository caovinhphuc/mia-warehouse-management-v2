/**
 * Google Sheets Service - Backend
 * Handles all Google Sheets API operations
 */

const { google } = require("googleapis");
const fs = require("fs");
const path = require("path");
const { normalizeCredentials, normalizePrivateKey } = require("../utils/googleAuthUtils");

class GoogleSheetsService {
  constructor() {
    this.sheets = null;
    this.auth = null;
  }

  async initialize() {
    try {
      // Service Account JSON: env hoặc backend/config/service-account-key.json
      const projectRoot = path.join(__dirname, "..", "..");
      let serviceAccountPath =
        process.env.GOOGLE_SERVICE_ACCOUNT_KEY_PATH ||
        process.env.GOOGLE_APPLICATION_CREDENTIALS ||
        path.join(__dirname, "..", "config", "service-account-key.json");
      // Resolve relative path từ project root (./backend/config/...)
      if (!path.isAbsolute(serviceAccountPath) && serviceAccountPath.startsWith("./")) {
        serviceAccountPath = path.join(projectRoot, serviceAccountPath.replace(/^\.\//, ""));
      } else if (!path.isAbsolute(serviceAccountPath) && !fs.existsSync(serviceAccountPath)) {
        const altPath = path.join(__dirname, "..", "config", "service-account-key.json");
        if (fs.existsSync(altPath)) serviceAccountPath = altPath;
      }

      let credentials;

      // Ưu tiên đọc từ file JSON
      if (fs.existsSync(serviceAccountPath)) {
        console.log(
          `📁 Đang đọc service account từ file: ${serviceAccountPath}`
        );
        const serviceAccountContent = fs.readFileSync(
          serviceAccountPath,
          "utf8"
        );
        credentials = JSON.parse(serviceAccountContent);
        credentials = normalizeCredentials(credentials);
        console.log(`✅ Đã load service account: ${credentials.client_email}`);
      } else {
        // Fallback: dùng environment variables
        console.log("⚠️ Không tìm thấy file JSON, dùng environment variables");

        // Process private key
        let privateKey = process.env.GOOGLE_PRIVATE_KEY;
        if (privateKey) {
          privateKey = privateKey.replace(/^["']|["']$/g, "");
          privateKey = privateKey.replace(/\\n/g, "\n");
          privateKey = normalizePrivateKey(privateKey);
        }

        credentials = {
          type: "service_account",
          project_id: process.env.GOOGLE_PROJECT_ID,
          private_key_id: process.env.GOOGLE_PRIVATE_KEY_ID,
          private_key: privateKey,
          client_email:
            process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL ||
            process.env.GOOGLE_CLIENT_EMAIL,
          client_id: process.env.GOOGLE_CLIENT_ID,
          auth_uri: "https://accounts.google.com/o/oauth2/auth",
          token_uri: "https://oauth2.googleapis.com/token",
          auth_provider_x509_cert_url:
            "https://www.googleapis.com/oauth2/v1/certs",
          client_x509_cert_url: `https://www.googleapis.com/robot/v1/metadata/x509/${
            process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL ||
            process.env.GOOGLE_CLIENT_EMAIL
          }`,
        };
      }

      const scopes = [
        "https://www.googleapis.com/auth/spreadsheets",
        "https://www.googleapis.com/auth/drive.file",
        "https://www.googleapis.com/auth/drive",
      ];

      // Create JWT auth client
      this.auth = new google.auth.JWT(
        credentials.client_email,
        null,
        credentials.private_key,
        scopes
      );

      // Initialize Sheets API
      this.sheets = google.sheets({ version: "v4", auth: this.auth });

      return this.sheets;
    } catch (error) {
      console.error("Failed to initialize Google Sheets:", error);
      throw new Error(`Google Sheets initialization failed: ${error.message}`);
    }
  }

  async getSheets() {
    if (!this.sheets) {
      await this.initialize();
    }
    return this.sheets;
  }

  // Read data from sheet
  async readSheet(range = "A1:Z1000", sheetId) {
    try {
      const sheets = await this.getSheets();
      const spreadsheetId =
        sheetId ||
        process.env.GOOGLE_SHEET_ID ||
        process.env.VITE_GOOGLE_SHEETS_SPREADSHEET_ID;

      if (!spreadsheetId) {
        throw new Error("Sheet ID is required");
      }

      const response = await sheets.spreadsheets.values.get({
        spreadsheetId,
        range,
      });

      return {
        data: response.data.values || [],
        range: response.data.range,
        majorDimension: response.data.majorDimension,
      };
    } catch (error) {
      console.error("Error reading sheet:", error);
      throw new Error(`Failed to read sheet: ${error.message}`);
    }
  }

  // Write data to sheet
  async writeSheet(range, values, sheetId) {
    try {
      const sheets = await this.getSheets();
      const spreadsheetId =
        sheetId ||
        process.env.GOOGLE_SHEET_ID ||
        process.env.VITE_GOOGLE_SHEETS_SPREADSHEET_ID;

      if (!spreadsheetId) {
        throw new Error("Sheet ID is required");
      }

      const response = await sheets.spreadsheets.values.update({
        spreadsheetId,
        range,
        valueInputOption: "RAW",
        requestBody: {
          values,
        },
      });

      return {
        updatedCells: response.data.updatedCells,
        updatedRows: response.data.updatedRows,
        updatedColumns: response.data.updatedColumns,
      };
    } catch (error) {
      console.error("Error writing to sheet:", error);
      throw new Error(`Failed to write to sheet: ${error.message}`);
    }
  }

  // Append data to sheet
  async appendToSheet(range, values, sheetId) {
    try {
      const sheets = await this.getSheets();
      const spreadsheetId =
        sheetId ||
        process.env.GOOGLE_SHEET_ID ||
        process.env.VITE_GOOGLE_SHEETS_SPREADSHEET_ID;

      if (!spreadsheetId) {
        throw new Error("Sheet ID is required");
      }

      const response = await sheets.spreadsheets.values.append({
        spreadsheetId,
        range,
        valueInputOption: "RAW",
        insertDataOption: "INSERT_ROWS",
        requestBody: {
          values,
        },
      });

      return {
        updates: response.data.updates,
        updatedCells: response.data.updates.updatedCells,
        updatedRows: response.data.updates.updatedRows,
      };
    } catch (error) {
      console.error("Error appending to sheet:", error);
      throw new Error(`Failed to append to sheet: ${error.message}`);
    }
  }

  // Get sheet metadata
  async getSheetMetadata(sheetId = null) {
    try {
      const sheets = await this.getSheets();
      const spreadsheetId =
        sheetId ||
        process.env.GOOGLE_SHEET_ID ||
        process.env.VITE_GOOGLE_SHEETS_SPREADSHEET_ID;

      if (!spreadsheetId) {
        throw new Error("Sheet ID is required");
      }

      const response = await sheets.spreadsheets.get({
        spreadsheetId,
      });

      return {
        title: response.data.properties.title,
        sheets: response.data.sheets.map((sheet) => ({
          title: sheet.properties.title,
          sheetId: sheet.properties.sheetId,
          gridProperties: sheet.properties.gridProperties,
        })),
      };
    } catch (error) {
      console.error("Error getting sheet metadata:", error);
      throw new Error(`Failed to get sheet metadata: ${error.message}`);
    }
  }

  // Clear sheet data
  async clearSheet(range, sheetId) {
    try {
      const sheets = await this.getSheets();
      const spreadsheetId =
        sheetId ||
        process.env.GOOGLE_SHEET_ID ||
        process.env.VITE_GOOGLE_SHEETS_SPREADSHEET_ID;

      if (!spreadsheetId) {
        throw new Error("Sheet ID is required");
      }

      const response = await sheets.spreadsheets.values.clear({
        spreadsheetId,
        range,
      });

      return response.data;
    } catch (error) {
      console.error("Error clearing sheet:", error);
      throw new Error(`Failed to clear sheet: ${error.message}`);
    }
  }

  // Add new worksheet (sheet) to spreadsheet
  async addSheet(sheetName, sheetId) {
    try {
      const sheets = await this.getSheets();
      const spreadsheetId =
        sheetId ||
        process.env.GOOGLE_SHEET_ID ||
        process.env.VITE_GOOGLE_SHEETS_SPREADSHEET_ID;

      if (!spreadsheetId) {
        throw new Error("Spreadsheet ID is required");
      }

      if (!sheetName || !sheetName.trim()) {
        throw new Error("Sheet name is required");
      }

      // Use batchUpdate to add a new sheet
      const response = await sheets.spreadsheets.batchUpdate({
        spreadsheetId,
        requestBody: {
          requests: [
            {
              addSheet: {
                properties: {
                  title: sheetName.trim(),
                },
              },
            },
          ],
        },
      });

      // Get the newly created sheet info
      const newSheet = response.data.replies[0].addSheet;
      return {
        sheetId: newSheet.properties.sheetId,
        title: newSheet.properties.title,
        index: newSheet.properties.index,
        gridProperties: newSheet.properties.gridProperties,
      };
    } catch (error) {
      console.error("Error adding sheet:", error);
      throw new Error(`Failed to add sheet: ${error.message}`);
    }
  }
}

// Export singleton instance
module.exports = new GoogleSheetsService();
