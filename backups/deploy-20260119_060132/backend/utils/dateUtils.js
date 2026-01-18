/* eslint-disable */
/**
 * Date Utilities
 * Format dates in Vietnamese format
 */

/**
 * Format date to Vietnamese format: dd/mm/yyyy HH:mm:ss
 */
const formatVietnameseDateTime = (date = new Date()) => {
  const d = new Date(date);
  const day = String(d.getDate()).padStart(2, "0");
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const year = d.getFullYear();
  const hours = String(d.getHours()).padStart(2, "0");
  const minutes = String(d.getMinutes()).padStart(2, "0");
  const seconds = String(d.getSeconds()).padStart(2, "0");

  return `${day}/${month}/${year} ${hours}:${minutes}:${seconds}`;
};

/**
 * Format date to Vietnamese date only: dd/mm/yyyy
 */
const formatVietnameseDate = (date = new Date()) => {
  const d = new Date(date);
  const day = String(d.getDate()).padStart(2, "0");
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const year = d.getFullYear();

  return `${day}/${month}/${year}`;
};

/**
 * Format date to Vietnamese time only: HH:mm:ss
 */
const formatVietnameseTime = (date = new Date()) => {
  const d = new Date(date);
  const hours = String(d.getHours()).padStart(2, "0");
  const minutes = String(d.getMinutes()).padStart(2, "0");
  const seconds = String(d.getSeconds()).padStart(2, "0");

  return `${hours}:${minutes}:${seconds}`;
};

/**
 * Format date to Vietnamese with timezone
 */
const formatVietnameseDateTimeWithTimezone = (date = new Date()) => {
  const d = new Date(date);
  const day = String(d.getDate()).padStart(2, "0");
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const year = d.getFullYear();
  const hours = String(d.getHours()).padStart(2, "0");
  const minutes = String(d.getMinutes()).padStart(2, "0");
  const seconds = String(d.getSeconds()).padStart(2, "0");

  return `${day}/${month}/${year}, ${hours}:${minutes}:${seconds} GMT+7`;
};

/**
 * Get current Vietnamese date time
 */
const getCurrentVietnameseDateTime = () => {
  return formatVietnameseDateTime(new Date());
};

/**
 * Parse Vietnamese date string to Date object
 * Format: dd/mm/yyyy HH:mm:ss or dd/mm/yyyy
 */
const parseVietnameseDate = (dateString) => {
  const parts = dateString.split(" ");
  const datePart = parts[0]; // dd/mm/yyyy
  const timePart = parts[1] || "00:00:00"; // HH:mm:ss

  const [day, month, year] = datePart.split("/");
  const [hours, minutes, seconds] = timePart.split(":");

  return new Date(
    parseInt(year, 10),
    parseInt(month, 10) - 1,
    parseInt(day, 10),
    parseInt(hours, 10) || 0,
    parseInt(minutes, 10) || 0,
    parseInt(seconds, 10) || 0
  );
};

/**
 * Format relative time in Vietnamese (e.g., "2 giờ trước", "3 ngày trước")
 */
const formatRelativeTime = (date) => {
  const now = new Date();
  const d = new Date(date);
  const diffMs = now - d;
  const diffSeconds = Math.floor(diffMs / 1000);
  const diffMinutes = Math.floor(diffSeconds / 60);
  const diffHours = Math.floor(diffMinutes / 60);
  const diffDays = Math.floor(diffHours / 24);
  const diffMonths = Math.floor(diffDays / 30);
  const diffYears = Math.floor(diffDays / 365);

  if (diffSeconds < 60) {
    return "Vừa xong";
  } else if (diffMinutes < 60) {
    return `${diffMinutes} phút trước`;
  } else if (diffHours < 24) {
    return `${diffHours} giờ trước`;
  } else if (diffDays < 30) {
    return `${diffDays} ngày trước`;
  } else if (diffMonths < 12) {
    return `${diffMonths} tháng trước`;
  } else {
    return `${diffYears} năm trước`;
  }
};

/**
 * Format date range in Vietnamese
 */
const formatDateRange = (startDate, endDate) => {
  const start = formatVietnameseDate(startDate);
  const end = formatVietnameseDate(endDate);
  return `Từ ${start} đến ${end}`;
};

module.exports = {
  formatVietnameseDateTime,
  formatVietnameseDate,
  formatVietnameseTime,
  formatVietnameseDateTimeWithTimezone,
  getCurrentVietnameseDateTime,
  parseVietnameseDate,
  formatRelativeTime,
  formatDateRange,
};
