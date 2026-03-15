/**
 * Unit Tests for Google Drive API Service
 * Tests all methods of GoogleDriveApiService
 */

// Mock axios BEFORE importing the service
import axios from "axios";
import googleDriveApiService from "../googleDriveApi";

jest.mock("axios", () => ({
  __esModule: true,
  default: {
    get: jest.fn(),
    post: jest.fn(),
    put: jest.fn(),
    delete: jest.fn(),
  },
}));

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

  describe("createFolder", () => {
    it("should create folder successfully", async () => {
      const mockData = {
        data: {
          success: true,
          data: {
            id: "new-folder-id",
            name: "New Folder",
          },
        },
      };

      mockedAxios.post.mockResolvedValueOnce(mockData);

      const result = await googleDriveApiService.createFolder(
        "New Folder",
        "parent-folder-id"
      );

      expect(mockedAxios.post).toHaveBeenCalledWith(
        "http://localhost:8000/api/drive/folders",
        { folderName: "New Folder", parentFolderId: "parent-folder-id" }
      );
      expect(result.name).toBe("New Folder");
    });
  });

  describe("renameFile", () => {
    it("should rename file successfully", async () => {
      const mockData = {
        data: {
          success: true,
          data: {
            id: "file-id",
            name: "Renamed Document.pdf",
          },
        },
      };

      mockedAxios.put.mockResolvedValueOnce(mockData);

      const result = await googleDriveApiService.renameFile(
        "file-id",
        "Renamed Document.pdf"
      );

      expect(result.name).toBe("Renamed Document.pdf");
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
