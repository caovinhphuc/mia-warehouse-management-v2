/**
 * Unit Tests for Google Sheets API Service
 * Tests all methods of GoogleSheetsApiService
 */

// Mock axios BEFORE importing the service
jest.mock("axios", () => ({
  __esModule: true,
  default: {
    get: jest.fn(),
    post: jest.fn(),
    put: jest.fn(),
    delete: jest.fn(),
  },
}));

import axios from "axios";
import googleSheetsApiService from "../googleSheetsApi";

const mockedAxios = axios;

// Mock importMetaEnv
jest.mock("../../utils/importMetaEnv", () => ({
  __esModule: true,
  default: {
    VITE_API_BASE_URL: "http://localhost:8000/api",
    VITE_GOOGLE_SHEETS_SPREADSHEET_ID: "test-sheet-id",
  },
}));

describe("GoogleSheetsApiService", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    console.error = jest.fn(); // Mock console.error
  });

  describe("readSheet", () => {
    it("should read sheet data successfully", async () => {
      const mockData = {
        data: {
          success: true,
          data: [
            ["Name", "Age"],
            ["John", "30"],
          ],
          range: "A1:B2",
          majorDimension: "ROWS",
        },
      };

      mockedAxios.get.mockResolvedValueOnce(mockData);

      const result = await googleSheetsApiService.readSheet(
        "A1:B2",
        "sheet-id"
      );

      expect(mockedAxios.get).toHaveBeenCalledWith(
        "http://localhost:8000/api/sheets/read",
        { params: { range: "A1:B2", sheetId: "sheet-id" } }
      );
      expect(result).toEqual({
        data: mockData.data.data,
        range: mockData.data.range,
        majorDimension: mockData.data.majorDimension,
      });
    });

    it("should read sheet without sheetId", async () => {
      const mockData = {
        data: {
          success: true,
          data: [["Name", "Age"]],
          range: "A1:Z1000",
          majorDimension: "ROWS",
        },
      };

      mockedAxios.get.mockResolvedValueOnce(mockData);

      const result = await googleSheetsApiService.readSheet("A1:Z1000");

      expect(mockedAxios.get).toHaveBeenCalledWith(
        "http://localhost:8000/api/sheets/read",
        { params: { range: "A1:Z1000" } }
      );
      expect(result.data).toBeDefined();
    });

    it("should handle read errors", async () => {
      const errorResponse = {
        response: {
          data: { error: "Sheet not found" },
        },
        message: "Request failed",
      };

      mockedAxios.get.mockRejectedValueOnce(errorResponse);

      await expect(
        googleSheetsApiService.readSheet("A1:B2", "invalid-id")
      ).rejects.toThrow("Sheet not found");
    });

    it("should handle network errors", async () => {
      const networkError = new Error("Network Error");
      mockedAxios.get.mockRejectedValueOnce(networkError);

      await expect(googleSheetsApiService.readSheet("A1:B2")).rejects.toThrow(
        "Failed to read sheet: Network Error"
      );
    });
  });

  describe("writeSheet", () => {
    it("should write data to sheet successfully", async () => {
      const mockData = {
        data: {
          success: true,
          data: { updatedCells: 2, updatedRange: "A1:B1" },
        },
      };

      mockedAxios.post.mockResolvedValueOnce(mockData);

      const result = await googleSheetsApiService.writeSheet(
        "A1:B1",
        [["Name", "Age"]],
        "sheet-id"
      );

      expect(mockedAxios.post).toHaveBeenCalledWith(
        "http://localhost:8000/api/sheets/write",
        {
          range: "A1:B1",
          values: [["Name", "Age"]],
          sheetId: "sheet-id",
        }
      );
      expect(result).toEqual(mockData.data.data);
    });

    it("should handle write errors", async () => {
      const errorResponse = {
        response: {
          data: { error: "Permission denied" },
        },
        message: "Request failed",
      };

      mockedAxios.post.mockRejectedValueOnce(errorResponse);

      await expect(
        googleSheetsApiService.writeSheet("A1:B1", [["Name"]], "sheet-id")
      ).rejects.toThrow("Permission denied");
    });
  });

  describe("appendToSheet", () => {
    it("should append data to sheet successfully", async () => {
      const mockData = {
        data: {
          success: true,
          data: { updatedCells: 2, updatedRange: "A2:B2" },
        },
      };

      mockedAxios.post.mockResolvedValueOnce(mockData);

      const result = await googleSheetsApiService.appendToSheet(
        "A1:B1",
        [["Jane", "25"]],
        "sheet-id"
      );

      expect(mockedAxios.post).toHaveBeenCalledWith(
        "http://localhost:8000/api/sheets/append",
        {
          range: "A1:B1",
          values: [["Jane", "25"]],
          sheetId: "sheet-id",
        }
      );
      expect(result).toEqual(mockData.data.data);
    });

    it("should handle append errors", async () => {
      const errorResponse = {
        response: {
          data: { error: "Invalid range" },
        },
        message: "Request failed",
      };

      mockedAxios.post.mockRejectedValueOnce(errorResponse);

      await expect(
        googleSheetsApiService.appendToSheet("INVALID", [["Data"]], "sheet-id")
      ).rejects.toThrow("Invalid range");
    });
  });

  describe("getSheetMetadata", () => {
    it("should get sheet metadata with provided sheetId", async () => {
      const mockData = {
        data: {
          success: true,
          data: {
            title: "Test Sheet",
            sheets: [
              {
                title: "Sheet1",
                sheetId: 0,
                gridProperties: { rowCount: 1000, columnCount: 26 },
              },
            ],
          },
        },
      };

      mockedAxios.get.mockResolvedValueOnce(mockData);

      const result = await googleSheetsApiService.getSheetMetadata("test-id");

      expect(mockedAxios.get).toHaveBeenCalledWith(
        "http://localhost:8000/api/sheets/metadata/test-id"
      );
      expect(result).toEqual(mockData.data.data);
      expect(result.title).toBe("Test Sheet");
    });

    it("should get sheet metadata using default sheetId from env", async () => {
      const mockData = {
        data: {
          success: true,
          data: {
            title: "Default Sheet",
            sheets: [],
          },
        },
      };

      mockedAxios.get.mockResolvedValueOnce(mockData);

      const result = await googleSheetsApiService.getSheetMetadata();

      expect(mockedAxios.get).toHaveBeenCalledWith(
        "http://localhost:8000/api/sheets/metadata/test-sheet-id"
      );
      expect(result.title).toBe("Default Sheet");
    });

    it("should handle metadata errors", async () => {
      const errorResponse = {
        response: {
          data: { error: "Sheet ID is required" },
        },
        message: "Request failed",
      };

      mockedAxios.get.mockRejectedValueOnce(errorResponse);

      await expect(
        googleSheetsApiService.getSheetMetadata("invalid")
      ).rejects.toThrow("Sheet ID is required");
    });
  });

  describe("clearSheet", () => {
    it("should clear sheet data successfully", async () => {
      const mockData = {
        data: {
          success: true,
          data: { clearedRange: "A1:B10" },
        },
      };

      mockedAxios.delete.mockResolvedValueOnce(mockData);

      const result = await googleSheetsApiService.clearSheet(
        "A1:B10",
        "sheet-id"
      );

      expect(mockedAxios.delete).toHaveBeenCalledWith(
        "http://localhost:8000/api/sheets/clear",
        {
          data: { range: "A1:B10", sheetId: "sheet-id" },
        }
      );
      expect(result).toEqual(mockData.data.data);
    });

    it("should handle clear errors", async () => {
      const errorResponse = {
        response: {
          data: { error: "Range not found" },
        },
        message: "Request failed",
      };

      mockedAxios.delete.mockRejectedValueOnce(errorResponse);

      await expect(
        googleSheetsApiService.clearSheet("INVALID", "sheet-id")
      ).rejects.toThrow("Range not found");
    });
  });

  describe("addSheet", () => {
    it("should add new sheet successfully", async () => {
      const mockData = {
        data: {
          success: true,
          data: {
            sheetId: 123456,
            title: "New Sheet",
          },
        },
      };

      mockedAxios.post.mockResolvedValueOnce(mockData);

      const result = await googleSheetsApiService.addSheet(
        "New Sheet",
        "spreadsheet-id"
      );

      expect(mockedAxios.post).toHaveBeenCalledWith(
        "http://localhost:8000/api/sheets/add-sheet",
        {
          sheetName: "New Sheet",
          sheetId: "spreadsheet-id",
        }
      );
      expect(result).toEqual(mockData.data.data);
      expect(result.title).toBe("New Sheet");
    });

    it("should handle add sheet errors", async () => {
      const errorResponse = {
        response: {
          data: { error: "Sheet name already exists" },
        },
        message: "Request failed",
      };

      mockedAxios.post.mockRejectedValueOnce(errorResponse);

      await expect(
        googleSheetsApiService.addSheet("Existing Sheet", "spreadsheet-id")
      ).rejects.toThrow("Sheet name already exists");
    });
  });
});
