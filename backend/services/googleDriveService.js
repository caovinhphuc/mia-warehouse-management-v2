/**
 * Google Drive Service - Backend
 * Handles all Google Drive API operations
 */

const { google } = require("googleapis");
const { Readable } = require("stream");
const fs = require("fs");
const path = require("path");

class GoogleDriveService {
  constructor() {
    this.drive = null;
    this.auth = null;
  }

  async initialize() {
    try {
      // Service Account JSON file path (ưu tiên)
      // Thứ tự ưu tiên:
      // 1. GOOGLE_SERVICE_ACCOUNT_KEY_PATH env
      // 2. automation/config/google-credentials.json (file chính)
      // 3. Path cũ (fallback)
      let serviceAccountPath = process.env.GOOGLE_SERVICE_ACCOUNT_KEY_PATH;

      if (!serviceAccountPath) {
        // Thử dùng automation/config/google-credentials.json
        const defaultPath = path.join(
          __dirname,
          "../../automation/config/google-credentials.json"
        );
        if (fs.existsSync(defaultPath)) {
          serviceAccountPath = defaultPath;
          console.log(`📁 Dùng credentials chính: ${serviceAccountPath}`);
        } else {
          // Fallback về path cũ
          serviceAccountPath =
            "/Users/phuccao/Service Account/react-integration-469009-25ca7002a525.json";
        }
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
        console.log(`✅ Đã load service account: ${credentials.client_email}`);
      } else {
        // Fallback: dùng environment variables
        console.log("⚠️ Không tìm thấy file JSON, dùng environment variables");
        credentials = {
          type: "service_account",
          project_id: process.env.GOOGLE_PROJECT_ID,
          private_key_id: process.env.GOOGLE_PRIVATE_KEY_ID,
          private_key: process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, "\n"),
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

      // Initialize Drive API
      this.drive = google.drive({ version: "v3", auth: this.auth });

      return this.drive;
    } catch (error) {
      console.error("Failed to initialize Google Drive:", error);
      throw new Error(`Google Drive initialization failed: ${error.message}`);
    }
  }

  async getDrive() {
    if (!this.drive) {
      await this.initialize();
    }
    return this.drive;
  }

  // Upload file to Drive
  async uploadFile(fileBuffer, fileName, mimeType, folderId) {
    try {
      const drive = await this.getDrive();
      const targetFolderId = folderId || process.env.GOOGLE_DRIVE_FOLDER_ID;

      // Service accounts cannot upload to root (no storage quota)
      // Must upload to a shared folder or Shared Drive
      if (!targetFolderId) {
        // Tìm folder được share với service account
        try {
          const folders = await drive.files.list({
            q: "mimeType='application/vnd.google-apps.folder' and trashed=false",
            spaces: "drive",
            fields: "files(id, name)",
            pageSize: 1,
          });

          if (folders.data.files && folders.data.files.length > 0) {
            const foundFolderId = folders.data.files[0].id;
            console.log(
              `📁 Tìm thấy folder được share: ${folders.data.files[0].name} (${foundFolderId})`
            );
            // Sử dụng folder đầu tiên tìm được
            return await this._uploadToFolder(
              drive,
              fileBuffer,
              fileName,
              mimeType,
              foundFolderId
            );
          }
        } catch (findError) {
          console.warn(
            "⚠️ Không thể tìm folder được share:",
            findError.message
          );
        }

        throw new Error(
          "Folder ID is required. Service accounts must upload to shared folders, not root."
        );
      }

      // First, verify folder exists and is accessible
      let serviceAccountEmail = process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL;

      // Try to get service account email from JSON file
      if (!serviceAccountEmail) {
        try {
          const fs = require("fs");
          const serviceAccountPath =
            process.env.GOOGLE_SERVICE_ACCOUNT_KEY_PATH;
          if (serviceAccountPath && fs.existsSync(serviceAccountPath)) {
            const creds = JSON.parse(
              fs.readFileSync(serviceAccountPath, "utf8")
            );
            serviceAccountEmail = creds.client_email;
          }
        } catch (e) {
          // Ignore error
        }
      }

      try {
        await drive.files.get({
          fileId: targetFolderId,
          fields: "id, name, driveId, capabilities",
          supportsAllDrives: true,
        });
      } catch (verifyError) {
        if (verifyError.message && verifyError.message.includes("not found")) {
          throw new Error(
            `Folder not found or not accessible: ${targetFolderId}. Please ensure the folder exists and is shared with Service Account: ${
              serviceAccountEmail ||
              "your-service-account@project.iam.gserviceaccount.com"
            }`
          );
        }
        throw verifyError;
      }

      const fileMetadata = {
        name: fileName,
        parents: [folderId], // Always require a parent folder
      };

      // Convert buffer to proper format for Google Drive API
      let buffer;
      if (Buffer.isBuffer(fileBuffer)) {
        buffer = fileBuffer;
      } else if (fileBuffer instanceof Uint8Array) {
        buffer = Buffer.from(fileBuffer);
      } else if (typeof fileBuffer === "string") {
        buffer = Buffer.from(fileBuffer, "base64");
      } else {
        try {
          buffer = Buffer.from(fileBuffer);
        } catch (e) {
          throw new Error(`Cannot convert fileBuffer to Buffer: ${e.message}`);
        }
      }

      // Google Drive API v3 requires a ReadableStream
      const stream = Readable.from(buffer);

      const media = {
        mimeType: mimeType || "application/octet-stream",
        body: stream,
      };

      // Try to upload - if folder is Shared Drive, it will work
      // If folder is regular folder, it will fail with storage quota error
      let response;
      try {
        response = await drive.files.create({
          requestBody: fileMetadata,
          media,
          fields: "id,name,webViewLink,webContentLink",
          supportsAllDrives: true,
        });
      } catch (error) {
        // If error is storage quota, try to upload to Shared Drive
        if (error.message && error.message.includes("storage quota")) {
          // Check if folderId is a Shared Drive
          // Try to get drive info
          try {
            const folderInfo = await drive.files.get({
              fileId: targetFolderId,
              fields: "id, name, driveId, capabilities",
              supportsAllDrives: true,
            });

            // If folder has driveId, it's in a Shared Drive
            if (folderInfo.data.driveId) {
              // Upload to Shared Drive
              response = await drive.files.create({
                requestBody: {
                  ...fileMetadata,
                  driveId: folderInfo.data.driveId,
                },
                media,
                fields: "id,name,webViewLink,webContentLink",
                supportsAllDrives: true,
              });
            } else {
              // Try to upload anyway - maybe folder is shared with service account
              // Check if folder is accessible
              try {
                const folderCheck = await drive.files.get({
                  fileId: targetFolderId,
                  fields: "id, name, capabilities",
                  supportsAllDrives: true,
                });

                // If we can access it, try upload with supportsAllDrives
                response = await drive.files.create({
                  requestBody: fileMetadata,
                  media,
                  fields: "id,name,webViewLink,webContentLink",
                  supportsAllDrives: true,
                });
              } catch (uploadError) {
                // Cải thiện error message
                const errorMsg = uploadError.message || error.message;
                throw new Error(
                  `Failed to upload: ${errorMsg}. ` +
                    `Service Accounts do not have storage quota. ` +
                    `Please ensure the folder is a Shared Drive or is shared with the Service Account. ` +
                    `Folder ID: ${targetFolderId}`
                );
              }
            }
          } catch (driveError) {
            throw new Error(
              `Failed to upload: ${error.message}. ` +
                `Service Accounts do not have storage quota. ` +
                `Folder must be a Shared Drive for Service Account uploads. ` +
                `Folder ID: ${targetFolderId}`
            );
          }
        } else {
          // Cải thiện error message cho các lỗi khác
          const errorMsg = error.message || "Unknown error";
          if (
            errorMsg.includes("storage quota") ||
            errorMsg.includes("storageQuotaExceeded")
          ) {
            throw new Error(
              `Failed to upload: Service Accounts do not have storage quota. ` +
                `Leverage shared drives (https://developers.google.com/workspace/drive/api/guides/about-shareddrives), ` +
                `or use OAuth delegation (http://support.google.com/a/answer/7281227) instead. ` +
                `Folder must be a Shared Drive for Service Account uploads.`
            );
          }
          throw error;
        }
      }

      return {
        id: response.data.id,
        name: response.data.name,
        webViewLink: response.data.webViewLink,
        webContentLink: response.data.webContentLink,
      };
    } catch (error) {
      console.error("Error uploading file:", error);
      console.error("Error details:", {
        message: error.message,
        stack: error.stack,
        code: error.code,
      });
      throw new Error(`Failed to upload file: ${error.message}`);
    }
  }

  // Create folder
  async createFolder(folderName, parentFolderId) {
    try {
      const drive = await this.getDrive();
      const targetFolderId =
        parentFolderId || process.env.GOOGLE_DRIVE_FOLDER_ID;

      const fileMetadata = {
        name: folderName,
        mimeType: "application/vnd.google-apps.folder",
        parents: targetFolderId ? [targetFolderId] : undefined,
      };

      const response = await drive.files.create({
        requestBody: fileMetadata,
        fields: "id,name,webViewLink",
      });

      return {
        id: response.data.id,
        name: response.data.name,
        webViewLink: response.data.webViewLink,
      };
    } catch (error) {
      console.error("Error creating folder:", error);
      throw new Error(`Failed to create folder: ${error.message}`);
    }
  }

  // List files in folder
  async listFiles(folderId, pageSize = 10) {
    try {
      const drive = await this.getDrive();
      const targetFolderId = folderId || process.env.GOOGLE_DRIVE_FOLDER_ID;

      const query = targetFolderId
        ? `'${targetFolderId}' in parents`
        : undefined;

      const response = await drive.files.list({
        q: query,
        pageSize,
        fields:
          "nextPageToken, files(id, name, size, mimeType, createdTime, modifiedTime, webViewLink)",
      });

      return {
        files: response.data.files || [],
        nextPageToken: response.data.nextPageToken,
      };
    } catch (error) {
      console.error("Error listing files:", error);
      throw new Error(`Failed to list files: ${error.message}`);
    }
  }

  // Delete file
  async deleteFile(fileId) {
    try {
      const drive = await this.getDrive();
      await drive.files.delete({
        fileId,
      });
      return { success: true, message: "File deleted successfully" };
    } catch (error) {
      console.error("Error deleting file:", error);
      throw new Error(`Failed to delete file: ${error.message}`);
    }
  }

  // Get file metadata
  async getFileMetadata(fileId) {
    try {
      const drive = await this.getDrive();
      const response = await drive.files.get({
        fileId,
        fields:
          "id, name, size, mimeType, createdTime, modifiedTime, webViewLink, webContentLink",
      });

      return response.data;
    } catch (error) {
      console.error("Error getting file metadata:", error);
      throw new Error(`Failed to get file metadata: ${error.message}`);
    }
  }

  // Share folder/file with email
  async shareWithEmail(fileId, email, role = "writer") {
    try {
      const drive = await this.getDrive();

      // Check if file/folder exists (with supportsAllDrives for Shared Drives)
      await drive.files.get({
        fileId,
        fields: "id, name",
        supportsAllDrives: true,
      });

      // Create permission
      const permission = await drive.permissions.create({
        fileId,
        requestBody: {
          role: role, // 'reader', 'writer', 'commenter', 'owner'
          type: "user",
          emailAddress: email,
        },
        fields: "id, role, type, emailAddress",
        supportsAllDrives: true,
      });

      return {
        id: permission.data.id,
        role: permission.data.role,
        type: permission.data.type,
        emailAddress: permission.data.emailAddress,
      };
    } catch (error) {
      // If permission already exists, return existing permission
      if (error.code === 400 && error.message.includes("already exists")) {
        // Get existing permissions
        const drive = await this.getDrive();
        const permissions = await drive.permissions.list({
          fileId,
          fields: "permissions(id, role, type, emailAddress)",
          supportsAllDrives: true,
        });

        const existingPermission = permissions.data.permissions.find(
          (p) => p.emailAddress === email
        );

        if (existingPermission) {
          return {
            id: existingPermission.id,
            role: existingPermission.role,
            type: existingPermission.type,
            emailAddress: existingPermission.emailAddress,
            message: "Permission already exists",
          };
        }
      }
      console.error("Error sharing file:", error);
      throw new Error(`Failed to share file: ${error.message}`);
    }
  }

  // Rename file/folder
  async renameFile(fileId, newName) {
    try {
      const drive = await this.getDrive();

      const response = await drive.files.update({
        fileId,
        requestBody: {
          name: newName,
        },
        fields: "id, name, webViewLink",
        supportsAllDrives: true,
      });

      return {
        id: response.data.id,
        name: response.data.name,
        webViewLink: response.data.webViewLink,
      };
    } catch (error) {
      console.error("Error renaming file:", error);
      throw new Error(`Failed to rename file: ${error.message}`);
    }
  }

  // Download file
  async downloadFile(fileId) {
    try {
      const drive = await this.getDrive();

      // Get file metadata first
      const metadata = await drive.files.get({
        fileId,
        fields: "id, name, mimeType, size",
        supportsAllDrives: true,
      });

      // Download file content
      const response = await drive.files.get(
        {
          fileId,
          alt: "media",
          supportsAllDrives: true,
        },
        { responseType: "arraybuffer" }
      );

      return {
        fileBuffer: Buffer.from(response.data),
        fileName: metadata.data.name,
        mimeType: metadata.data.mimeType,
        size: metadata.data.size,
      };
    } catch (error) {
      console.error("Error downloading file:", error);
      throw new Error(`Failed to download file: ${error.message}`);
    }
  }

  // Get Drive about information
  async about() {
    try {
      const drive = await this.getDrive();
      const response = await drive.about.get({
        fields: "user,storageQuota,kind",
      });
      return response.data;
    } catch (error) {
      console.error("Error getting Drive about:", error);
      throw new Error(`Failed to get Drive about: ${error.message}`);
    }
  }
}

// Export singleton instance
module.exports = new GoogleDriveService();
