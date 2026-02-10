/**
 * Unit Tests for Google Drive API Service
 * Tests all methods of GoogleDriveApiService
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
import googleDriveApiService from "../googleDriveApi";

const mockedAxios = axios;

// Mock importMetaEnv
jest.mock("../../utils/importMetaEnv", () => ({
  __esModule: true,
  default: {
    VITE_API_BASE_URL: "http://localhost:8000/api",
  },
}));

describe("GoogleDriveApiService", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    console.error = jest.fn(); // Mock console.error
  });

  describe("listFiles", () => {
    it("should list files successfully", async () => {
      const mockData = {
        data: {
          success: true,
          data: [
            { id: "file1", name: "Document1.pdf" },
            { id: "file2", name: "Document2.pdf" },
          ],
          nextPageToken: "token123",
        },
      };

      mockedAxios.get.mockResolvedValueOnce(mockData);

      const result = await googleDriveApiService.listFiles("folder-id", 10);

      expect(mockedAxios.get).toHaveBeenCalledWith(
        "http://localhost:8000/api/drive/files",
        { params: { pageSize: 10, folderId: "folder-id" } }
      );
      expect(result.files).toHaveLength(2);
      expect(result.nextPageToken).toBe("token123");
    });

    it("should list files without folderId", async () => {
      const mockData = {
        data: {
          success: true,
          data: [],
        },
      };

      mockedAxios.get.mockResolvedValueOnce(mockData);

      const result = await googleDriveApiService.listFiles(null, 20);

      expect(mockedAxios.get).toHaveBeenCalledWith(
        "http://localhost:8000/api/drive/files",
        { params: { pageSize: 20 } }
      );
      expect(result.files).toEqual([]);
    });

    it("should handle list files errors", async () => {
      const errorResponse = {
        response: {
          data: { error: "Folder not found" },
        },
        message: "Request failed",
      };

      mockedAxios.get.mockRejectedValueOnce(errorResponse);

      await expect(
        googleDriveApiService.listFiles("invalid-folder")
      ).rejects.toThrow("Folder not found");
    });
  });

  describe("getFileMetadata", () => {
    it("should get file metadata successfully", async () => {
      const mockData = {
        data: {
          success: true,
          data: {
            id: "file-id",
            name: "Document.pdf",
            mimeType: "application/pdf",
            size: "1024",
          },
        },
      };

      mockedAxios.get.mockResolvedValueOnce(mockData);

      const result = await googleDriveApiService.getFileMetadata("file-id");

      expect(mockedAxios.get).toHaveBeenCalledWith(
        "http://localhost:8000/api/drive/files/file-id"
      );
      expect(result.id).toBe("file-id");
      expect(result.name).toBe("Document.pdf");
    });

    it("should handle get metadata errors", async () => {
      const errorResponse = {
        response: {
          data: { error: "File not found" },
        },
        message: "Request failed",
      };

      mockedAxios.get.mockRejectedValueOnce(errorResponse);

      await expect(
        googleDriveApiService.getFileMetadata("invalid-id")
      ).rejects.toThrow("File not found");
    });
  });

  describe("createFile", () => {
    it("should create file successfully", async () => {
      const mockData = {
        data: {
          success: true,
          data: {
            id: "new-file-id",
            name: "New Document.pdf",
          },
        },
      };

      mockedAxios.post.mockResolvedValueOnce(mockData);

      const fileData = {
        name: "New Document.pdf",
        mimeType: "application/pdf",
      };

      const result = await googleDriveApiService.createFile(
        fileData,
        "folder-id"
      );

      expect(mockedAxios.post).toHaveBeenCalledWith(
        "http://localhost:8000/api/drive/files",
        {
          ...fileData,
          folderId: "folder-id",
        }
      );
      expect(result.id).toBe("new-file-id");
    });

    it("should handle create file errors", async () => {
      const errorResponse = {
        response: {
          data: { error: "Permission denied" },
        },
        message: "Request failed",
      };

      mockedAxios.post.mockRejectedValueOnce(errorResponse);

      await expect(
        googleDriveApiService.createFile({ name: "test.pdf" }, "folder-id")
      ).rejects.toThrow("Permission denied");
    });
  });

  describe("updateFile", () => {
    it("should update file successfully", async () => {
      const mockData = {
        data: {
          success: true,
          data: {
            id: "file-id",
            name: "Updated Document.pdf",
          },
        },
      };

      mockedAxios.put.mockResolvedValueOnce(mockData);

      const result = await googleDriveApiService.updateFile("file-id", {
        name: "Updated Document.pdf",
      });

      expect(mockedAxios.put).toHaveBeenCalledWith(
        "http://localhost:8000/api/drive/files/file-id",
        {
          name: "Updated Document.pdf",
        }
      );
      expect(result.name).toBe("Updated Document.pdf");
    });

    it("should handle update errors", async () => {
      const errorResponse = {
        response: {
          data: { error: "File not found" },
        },
        message: "Request failed",
      };

      mockedAxios.put.mockRejectedValueOnce(errorResponse);

      await expect(
        googleDriveApiService.updateFile("invalid-id", { name: "test.pdf" })
      ).rejects.toThrow("File not found");
    });
  });

  describe("deleteFile", () => {
    it("should delete file successfully", async () => {
      const mockData = {
        data: {
          success: true,
          data: { deleted: true },
        },
      };

      mockedAxios.delete.mockResolvedValueOnce(mockData);

      const result = await googleDriveApiService.deleteFile("file-id");

      expect(mockedAxios.delete).toHaveBeenCalledWith(
        "http://localhost:8000/api/drive/files/file-id"
      );
      expect(result.deleted).toBe(true);
    });

    it("should handle delete errors", async () => {
      const errorResponse = {
        response: {
          data: { error: "File not found" },
        },
        message: "Request failed",
      };

      mockedAxios.delete.mockRejectedValueOnce(errorResponse);

      await expect(
        googleDriveApiService.deleteFile("invalid-id")
      ).rejects.toThrow("File not found");
    });
  });
});
