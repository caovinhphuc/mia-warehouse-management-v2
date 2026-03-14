import { useCallback, useState } from "react";

const API_BASE = import.meta.env.VITE_API_BASE_URL || "http://localhost:3001";

/**
 * useDriveOperations
 * Handles Google Drive operations via backend API
 */
const useDriveOperations = () => {
  const [files, setFiles] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [uploadProgress, setUploadProgress] = useState(0);

  const fetchFiles = useCallback(async (folderId = null, pageSize = 50) => {
    setLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams({ pageSize });
      if (folderId) params.set("folderId", folderId);

      const response = await fetch(`${API_BASE}/api/drive/files?${params}`);
      if (!response.ok) {
        const err = await response.json().catch(() => ({}));
        throw new Error(err.error || `HTTP ${response.status}`);
      }
      const data = await response.json();
      setFiles(data.data || []);
      return data.data || [];
    } catch (err) {
      setError(err.message);
      return [];
    } finally {
      setLoading(false);
    }
  }, []);

  const uploadFile = useCallback(async (file, folderId = null) => {
    setLoading(true);
    setError(null);
    setUploadProgress(0);
    try {
      const formData = new FormData();
      formData.append("file", file);
      if (folderId) formData.append("folderId", folderId);

      const response = await fetch(`${API_BASE}/api/drive/upload`, {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        const err = await response.json().catch(() => ({}));
        throw new Error(err.error || `Upload failed: HTTP ${response.status}`);
      }

      const data = await response.json();
      setUploadProgress(100);

      // Thêm file mới vào list hiện tại
      if (data.data) {
        setFiles((prev) => [data.data, ...prev]);
      }

      return data.data;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const deleteFile = useCallback(async (fileId) => {
    setError(null);
    try {
      const response = await fetch(`${API_BASE}/api/drive/files/${fileId}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        const err = await response.json().catch(() => ({}));
        throw new Error(err.error || `Delete failed: HTTP ${response.status}`);
      }

      // Xóa khỏi local state sau khi xóa thành công trên server
      setFiles((prev) => prev.filter((f) => f.id !== fileId));
      return true;
    } catch (err) {
      setError(err.message);
      throw err;
    }
  }, []);

  const renameFile = useCallback(async (fileId, newName) => {
    setError(null);
    try {
      const response = await fetch(
        `${API_BASE}/api/drive/files/${fileId}/rename`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ name: newName }),
        }
      );

      if (!response.ok) {
        const err = await response.json().catch(() => ({}));
        throw new Error(err.error || `Rename failed: HTTP ${response.status}`);
      }

      const data = await response.json();
      setFiles((prev) =>
        prev.map((f) => (f.id === fileId ? { ...f, name: newName } : f))
      );
      return data.data;
    } catch (err) {
      setError(err.message);
      throw err;
    }
  }, []);

  const downloadFile = useCallback(async (fileId, fileName) => {
    setError(null);
    try {
      const response = await fetch(
        `${API_BASE}/api/drive/files/${fileId}/download`
      );

      if (!response.ok) {
        const err = await response.json().catch(() => ({}));
        throw new Error(
          err.error || `Download failed: HTTP ${response.status}`
        );
      }

      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = fileName || fileId;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } catch (err) {
      setError(err.message);
      throw err;
    }
  }, []);

  return {
    files,
    loading,
    error,
    uploadProgress,
    fetchFiles,
    uploadFile,
    deleteFile,
    renameFile,
    downloadFile,
  };
};

export default useDriveOperations;
