import { useState, useCallback } from "react";
import { googleDriveApiService } from "../services/googleDriveApi";

export const useGoogleDrive = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [files, setFiles] = useState([]);
  const [uploadProgress, setUploadProgress] = useState("");

  const uploadFile = useCallback(async (file, fileName, mimeType, folderId) => {
    setLoading(true);
    setError(null);
    setUploadProgress(`Uploading ${fileName || "file"}...`);

    try {
      const result = await googleDriveApiService.uploadFile(
        file,
        fileName,
        mimeType,
        folderId,
      );
      setUploadProgress("");
      return result;
    } catch (err) {
      setError(err.message);
      setUploadProgress("");
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const listFiles = useCallback(async (folderId, pageSize = 10) => {
    setLoading(true);
    setError(null);

    try {
      const result = await googleDriveApiService.listFiles(folderId, pageSize);
      setFiles(result.files);
      return result;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const createFolder = useCallback(async (folderName, parentFolderId) => {
    setLoading(true);
    setError(null);

    try {
      const result = await googleDriveApiService.createFolder(
        folderName,
        parentFolderId,
      );
      return result;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const deleteFile = useCallback(async (fileId) => {
    setLoading(true);
    setError(null);

    try {
      const result = await googleDriveApiService.deleteFile(fileId);
      return result;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  return {
    files,
    loading,
    error,
    uploadProgress,
    uploadFile,
    listFiles,
    createFolder,
    deleteFile,
    clearError,
  };
};
