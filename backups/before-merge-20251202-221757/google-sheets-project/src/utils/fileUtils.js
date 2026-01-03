// File utilities for handling file operations

// File size formatting
export const formatFileSize = (bytes) => {
  if (!bytes || bytes === 0) return "0 Bytes";

  const k = 1024;
  const sizes = ["Bytes", "KB", "MB", "GB", "TB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));

  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
};

// File type detection
export const getFileType = (filename) => {
  const extension = filename.split(".").pop().toLowerCase();

  const fileTypes = {
    // Images
    jpg: "image",
    jpeg: "image",
    png: "image",
    gif: "image",
    bmp: "image",
    svg: "image",
    webp: "image",

    // Documents
    pdf: "document",
    doc: "document",
    docx: "document",
    txt: "text",
    rtf: "document",

    // Spreadsheets
    xls: "spreadsheet",
    xlsx: "spreadsheet",
    csv: "spreadsheet",

    // Presentations
    ppt: "presentation",
    pptx: "presentation",

    // Archives
    zip: "archive",
    rar: "archive",
    "7z": "archive",
    tar: "archive",
    gz: "archive",

    // Videos
    mp4: "video",
    avi: "video",
    mov: "video",
    wmv: "video",
    flv: "video",
    webm: "video",

    // Audio
    mp3: "audio",
    wav: "audio",
    flac: "audio",
    aac: "audio",
    ogg: "audio",

    // Code
    js: "code",
    ts: "code",
    jsx: "code",
    tsx: "code",
    html: "code",
    css: "code",
    json: "code",
    xml: "code",
    py: "code",
    java: "code",
    cpp: "code",
    c: "code",
  };

  return fileTypes[extension] || "unknown";
};

// File type icons
export const getFileIcon = (filename) => {
  const fileType = getFileType(filename);

  const icons = {
    image: "🖼️",
    document: "📄",
    text: "📝",
    spreadsheet: "📊",
    presentation: "📋",
    archive: "📦",
    video: "🎥",
    audio: "🎵",
    code: "💻",
    unknown: "📄",
  };

  return icons[fileType] || icons.unknown;
};

// MIME type detection
export const getMimeType = (filename) => {
  const extension = filename.split(".").pop().toLowerCase();

  const mimeTypes = {
    // Images
    jpg: "image/jpeg",
    jpeg: "image/jpeg",
    png: "image/png",
    gif: "image/gif",
    bmp: "image/bmp",
    svg: "image/svg+xml",
    webp: "image/webp",

    // Documents
    pdf: "application/pdf",
    doc: "application/msword",
    docx: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    txt: "text/plain",
    rtf: "application/rtf",

    // Spreadsheets
    xls: "application/vnd.ms-excel",
    xlsx: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    csv: "text/csv",

    // Presentations
    ppt: "application/vnd.ms-powerpoint",
    pptx: "application/vnd.openxmlformats-officedocument.presentationml.presentation",

    // Archives
    zip: "application/zip",
    rar: "application/x-rar-compressed",
    "7z": "application/x-7z-compressed",

    // Videos
    mp4: "video/mp4",
    avi: "video/x-msvideo",
    mov: "video/quicktime",
    wmv: "video/x-ms-wmv",
    webm: "video/webm",

    // Audio
    mp3: "audio/mpeg",
    wav: "audio/wav",
    flac: "audio/flac",
    aac: "audio/aac",
    ogg: "audio/ogg",

    // Code
    js: "application/javascript",
    ts: "application/typescript",
    html: "text/html",
    css: "text/css",
    json: "application/json",
    xml: "application/xml",
  };

  return mimeTypes[extension] || "application/octet-stream";
};

// File validation
export const validateFile = (file, options = {}) => {
  const {
    maxSize = 10 * 1024 * 1024, // 10MB default
    allowedTypes = [],
    allowedExtensions = [],
  } = options;

  const errors = [];

  // Size validation
  if (file.size > maxSize) {
    errors.push(`File size exceeds ${formatFileSize(maxSize)} limit`);
  }

  // Type validation
  if (allowedTypes.length > 0 && !allowedTypes.includes(file.type)) {
    errors.push(`File type ${file.type} is not allowed`);
  }

  // Extension validation
  if (allowedExtensions.length > 0) {
    const extension = file.name.split(".").pop().toLowerCase();
    if (!allowedExtensions.includes(extension)) {
      errors.push(`File extension .${extension} is not allowed`);
    }
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
};

// File name sanitization
export const sanitizeFileName = (filename) => {
  // Remove or replace invalid characters
  return filename
    .replace(/[<>:"/\\|?*]/g, "_") // Replace invalid characters
    .replace(/\s+/g, "_") // Replace spaces with underscores
    .replace(/_+/g, "_") // Replace multiple underscores with single
    .replace(/^_|_$/g, ""); // Remove leading/trailing underscores
};

// Generate unique filename
export const generateUniqueFileName = (originalName) => {
  const timestamp = Date.now();
  const extension = originalName.split(".").pop();
  const nameWithoutExt = originalName.replace(/\.[^/.]+$/, "");
  const sanitizedName = sanitizeFileName(nameWithoutExt);

  return `${sanitizedName}_${timestamp}.${extension}`;
};

// File download utility
export const downloadFile = (blob, filename) => {
  const url = window.URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  window.URL.revokeObjectURL(url);
};

// File to base64 conversion
export const fileToBase64 = (file) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result);
    reader.onerror = (error) => reject(error);
  });
};

// Base64 to file conversion
export const base64ToFile = (base64, filename, mimeType) => {
  const arr = base64.split(",");
  const bstr = atob(arr[1]);
  let n = bstr.length;
  const u8arr = new Uint8Array(n);

  while (n--) {
    u8arr[n] = bstr.charCodeAt(n);
  }

  return new File([u8arr], filename, { type: mimeType });
};

// File array buffer to blob
export const arrayBufferToBlob = (buffer, mimeType) => {
  return new Blob([buffer], { type: mimeType });
};

// Check if file is image
export const isImageFile = (filename) => {
  return getFileType(filename) === "image";
};

// Check if file is document
export const isDocumentFile = (filename) => {
  const fileType = getFileType(filename);
  return ["document", "text", "spreadsheet", "presentation"].includes(fileType);
};

// Check if file is video
export const isVideoFile = (filename) => {
  return getFileType(filename) === "video";
};

// Check if file is audio
export const isAudioFile = (filename) => {
  return getFileType(filename) === "audio";
};

// Get file extension
export const getFileExtension = (filename) => {
  return filename.split(".").pop().toLowerCase();
};

// Remove file extension
export const removeFileExtension = (filename) => {
  return filename.replace(/\.[^/.]+$/, "");
};

// File drag and drop helpers
export const handleDragOver = (e) => {
  e.preventDefault();
  e.stopPropagation();
};

export const handleDragEnter = (e) => {
  e.preventDefault();
  e.stopPropagation();
};

export const handleDragLeave = (e) => {
  e.preventDefault();
  e.stopPropagation();
};

export const handleDrop = (e, onFiles) => {
  e.preventDefault();
  e.stopPropagation();

  const files = Array.from(e.dataTransfer.files);
  if (onFiles) {
    onFiles(files);
  }
};

// File input change handler
export const handleFileInputChange = (e, onFiles) => {
  const files = Array.from(e.target.files);
  if (onFiles) {
    onFiles(files);
  }
};

// Image preview utility
export const createImagePreview = (file) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => resolve(e.target.result);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
};

// File compression utility (basic)
export const compressImage = (file, quality = 0.8, maxWidth = 800) => {
  return new Promise((resolve) => {
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");
    const img = new Image();

    img.onload = () => {
      const ratio = Math.min(maxWidth / img.width, maxWidth / img.height);
      canvas.width = img.width * ratio;
      canvas.height = img.height * ratio;

      ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

      canvas.toBlob(resolve, "image/jpeg", quality);
    };

    img.src = URL.createObjectURL(file);
  });
};
