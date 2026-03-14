/* eslint-disable */
/**
 * PersistenceStore
 * JSON file-based persistence layer — bước đệm trước khi migrate sang PostgreSQL.
 *
 * Mỗi store là một Map được đồng bộ xuống file JSON khi có thay đổi.
 * Tự động load từ file khi khởi động server.
 */

const fs = require("fs");
const path = require("path");

const DATA_DIR = path.join(__dirname, "../data");

// Đảm bảo thư mục data tồn tại
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

/**
 * Tạo một persistent Map gắn với file JSON.
 * @param {string} filename - Tên file (vd: "users.json")
 * @param {number} debounceMs - Thời gian debounce khi ghi (mặc định 500ms)
 */
function createPersistentStore(filename, debounceMs = 500) {
  const filePath = path.join(DATA_DIR, filename);
  let saveTimer = null;

  // Load data từ file nếu tồn tại
  const loadFromFile = () => {
    try {
      if (fs.existsSync(filePath)) {
        const raw = fs.readFileSync(filePath, "utf8");
        const entries = JSON.parse(raw);
        return new Map(entries);
      }
    } catch (err) {
      console.error(`[PersistenceStore] Cannot load ${filename}:`, err.message);
    }
    return new Map();
  };

  const map = loadFromFile();

  // Ghi xuống file (debounced để tránh ghi quá nhiều lần)
  const scheduleFlush = () => {
    if (saveTimer) clearTimeout(saveTimer);
    saveTimer = setTimeout(() => {
      try {
        const entries = Array.from(map.entries());
        fs.writeFileSync(filePath, JSON.stringify(entries, null, 2), "utf8");
      } catch (err) {
        console.error(`[PersistenceStore] Cannot save ${filename}:`, err.message);
      }
    }, debounceMs);
  };

  // Flush ngay lập tức (dùng khi cần đảm bảo data đã ghi trước khi exit)
  const flushSync = () => {
    if (saveTimer) {
      clearTimeout(saveTimer);
      saveTimer = null;
    }
    try {
      const entries = Array.from(map.entries());
      fs.writeFileSync(filePath, JSON.stringify(entries, null, 2), "utf8");
    } catch (err) {
      console.error(`[PersistenceStore] Cannot flush ${filename}:`, err.message);
    }
  };

  // Proxy Map để tự động persist khi có thay đổi
  return new Proxy(map, {
    get(target, prop) {
      if (prop === "flushSync") return flushSync;
      if (prop === "filePath") return filePath;

      const value = target[prop];
      if (typeof value === "function") {
        return function (...args) {
          const result = value.apply(target, args);
          // Chỉ schedule flush khi là mutating operations
          if (["set", "delete", "clear"].includes(prop)) {
            scheduleFlush();
          }
          return result;
        };
      }
      return value;
    },
  });
}

module.exports = { createPersistentStore };
