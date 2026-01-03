/* eslint-disable */
/**
 * Google Drive Routes - Backend API endpoints
 */

const express = require("express");
const router = express.Router();
const multer = require("multer");
const googleDriveService = require("../services/googleDriveService");

// Configure multer for file uploads (memory storage)
const upload = multer({ storage: multer.memoryStorage() });

// GET /api/drive/files - List files in folder
router.get("/files", async (req, res) => {
  try {
    const { folderId, pageSize = 10 } = req.query;

    const result = await googleDriveService.listFiles(
      folderId,
      parseInt(pageSize)
    );

    res.json({
      success: true,
      data: result.files,
      nextPageToken: result.nextPageToken,
    });
  } catch (error) {
    console.error("Error listing files:", error);
    res.status(500).json({
      success: false,
      error: error.message || "Failed to list files",
    });
  }
});

// GET /api/drive/files/:fileId - Get file metadata
router.get("/files/:fileId", async (req, res) => {
  try {
    const { fileId } = req.params;

    const metadata = await googleDriveService.getFileMetadata(fileId);

    res.json({
      success: true,
      data: metadata,
    });
  } catch (error) {
    console.error("Error getting file metadata:", error);
    res.status(500).json({
      success: false,
      error: error.message || "Failed to get file metadata",
    });
  }
});

// POST /api/drive/upload - Upload file to Drive
router.post("/upload", upload.single("file"), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        error: "No file provided",
      });
    }

    const { folderId } = req.body;

    // Debug logging
    console.log("📤 Upload request received:");
    console.log("  - File name:", req.file.originalname);
    console.log("  - File size:", req.file.size, "bytes");
    console.log("  - MIME type:", req.file.mimetype);
    console.log("  - Buffer type:", req.file.buffer?.constructor?.name);
    console.log("  - Folder ID:", folderId || "None (will use default)");

    const fileBuffer = req.file.buffer;
    const fileName = req.file.originalname;
    const mimeType = req.file.mimetype || "application/octet-stream";

    // Ensure buffer is valid
    if (!fileBuffer || !Buffer.isBuffer(fileBuffer)) {
      console.error("❌ Invalid file buffer:", typeof fileBuffer);
      return res.status(400).json({
        success: false,
        error: "Invalid file buffer",
      });
    }

    const result = await googleDriveService.uploadFile(
      fileBuffer,
      fileName,
      mimeType,
      folderId
    );

    console.log("✅ Upload successful:", result.id);
    res.json({
      success: true,
      data: result,
    });
  } catch (error) {
    console.error("❌ Error uploading file:", error);
    console.error("Error stack:", error.stack);
    res.status(500).json({
      success: false,
      error: error.message || "Failed to upload file",
    });
  }
});

// POST /api/drive/folders - Create folder
router.post("/folders", async (req, res) => {
  try {
    const { folderName, parentFolderId } = req.body;

    if (!folderName) {
      return res.status(400).json({
        success: false,
        error: "Folder name is required",
      });
    }

    const result = await googleDriveService.createFolder(
      folderName,
      parentFolderId
    );

    res.json({
      success: true,
      data: result,
    });
  } catch (error) {
    console.error("Error creating folder:", error);
    res.status(500).json({
      success: false,
      error: error.message || "Failed to create folder",
    });
  }
});

// DELETE /api/drive/files/:fileId - Delete file
router.delete("/files/:fileId", async (req, res) => {
  try {
    const { fileId } = req.params;

    const result = await googleDriveService.deleteFile(fileId);

    res.json({
      success: true,
      data: result,
    });
  } catch (error) {
    console.error("Error deleting file:", error);
    res.status(500).json({
      success: false,
      error: error.message || "Failed to delete file",
    });
  }
});

// POST /api/drive/files/:fileId/share - Share file/folder with email
router.post("/files/:fileId/share", async (req, res) => {
  try {
    const { fileId } = req.params;
    const { email, role = "writer" } = req.body;

    if (!email) {
      return res.status(400).json({
        success: false,
        error: "Email is required",
      });
    }

    const result = await googleDriveService.shareWithEmail(fileId, email, role);

    res.json({
      success: true,
      data: result,
    });
  } catch (error) {
    console.error("Error sharing file:", error);
    res.status(500).json({
      success: false,
      error: error.message || "Failed to share file",
    });
  }
});

// PUT /api/drive/files/:fileId/rename - Rename file/folder
router.put("/files/:fileId/rename", async (req, res) => {
  try {
    const { fileId } = req.params;
    const { name } = req.body;

    if (!name || !name.trim()) {
      return res.status(400).json({
        success: false,
        error: "Name is required",
      });
    }

    const result = await googleDriveService.renameFile(fileId, name.trim());

    res.json({
      success: true,
      data: result,
    });
  } catch (error) {
    console.error("Error renaming file:", error);
    res.status(500).json({
      success: false,
      error: error.message || "Failed to rename file",
    });
  }
});

// GET /api/drive/files/:fileId/download - Download file
router.get("/files/:fileId/download", async (req, res) => {
  try {
    const { fileId } = req.params;
    const result = await googleDriveService.downloadFile(fileId);

    // Set headers for file download
    res.setHeader(
      "Content-Type",
      result.mimeType || "application/octet-stream"
    );
    res.setHeader(
      "Content-Disposition",
      `attachment; filename="${result.fileName}"`
    );
    res.setHeader("Content-Length", result.fileBuffer.length);

    // Send file buffer
    res.send(result.fileBuffer);
  } catch (error) {
    console.error("Error downloading file:", error);
    res.status(500).json({
      success: false,
      error: error.message || "Failed to download file",
    });
  }
});

module.exports = router;
