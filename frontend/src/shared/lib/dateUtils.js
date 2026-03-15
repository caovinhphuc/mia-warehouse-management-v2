/**
 * Date Utilities - Optimized with dayjs (~2KB vs moment.js ~70KB)
 * dayjs is a lightweight alternative to moment.js with similar API
 */
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import isSameOrBefore from "dayjs/plugin/isSameOrBefore";
import isSameOrAfter from "dayjs/plugin/isSameOrAfter";
import isBetween from "dayjs/plugin/isBetween";
import customParseFormat from "dayjs/plugin/customParseFormat";
import "dayjs/locale/vi"; // Vietnamese locale

// Initialize dayjs plugins
dayjs.extend(relativeTime);
dayjs.extend(isSameOrBefore);
dayjs.extend(isSameOrAfter);
dayjs.extend(isBetween);
dayjs.extend(customParseFormat);
dayjs.locale("vi"); // Set default locale to Vietnamese

// Date formatting utilities
export const formatDate = (date, format = "DD/MM/YYYY") => {
  if (!date) return "";
  return dayjs(date).format(format);
};

export const formatDateTime = (date, format = "DD/MM/YYYY HH:mm") => {
  if (!date) return "";
  return dayjs(date).format(format);
};

export const formatTime = (date, format = "HH:mm") => {
  if (!date) return "";
  return dayjs(date).format(format);
};

// Vietnamese date formats
export const formatDateVN = (date) => {
  return formatDate(date, "DD/MM/YYYY");
};

export const formatDateTimeVN = (date) => {
  return formatDateTime(date, "DD/MM/YYYY HH:mm");
};

export const formatTimeVN = (date) => {
  return formatTime(date, "HH:mm:ss");
};

// Relative time
export const getRelativeTime = (date) => {
  if (!date) return "";
  return dayjs(date).fromNow();
};

// Date validation
export const isValidDate = (date) => {
  return dayjs(date).isValid();
};

// Date comparison
export const isToday = (date) => {
  return dayjs(date).isSame(dayjs(), "day");
};

export const isYesterday = (date) => {
  return dayjs(date).isSame(dayjs().subtract(1, "day"), "day");
};

export const isThisWeek = (date) => {
  return dayjs(date).isSame(dayjs(), "week");
};

export const isThisMonth = (date) => {
  return dayjs(date).isSame(dayjs(), "month");
};

export const isThisYear = (date) => {
  return dayjs(date).isSame(dayjs(), "year");
};

// Date ranges
export const getDateRange = (type) => {
  const now = dayjs();

  switch (type) {
    case "today":
      return {
        start: now.startOf("day").toDate(),
        end: now.endOf("day").toDate(),
      };
    case "yesterday":
      return {
        start: now.subtract(1, "day").startOf("day").toDate(),
        end: now.subtract(1, "day").endOf("day").toDate(),
      };
    case "thisWeek":
      return {
        start: now.startOf("week").toDate(),
        end: now.endOf("week").toDate(),
      };
    case "lastWeek":
      return {
        start: now.subtract(1, "week").startOf("week").toDate(),
        end: now.subtract(1, "week").endOf("week").toDate(),
      };
    case "thisMonth":
      return {
        start: now.startOf("month").toDate(),
        end: now.endOf("month").toDate(),
      };
    case "lastMonth":
      return {
        start: now.subtract(1, "month").startOf("month").toDate(),
        end: now.subtract(1, "month").endOf("month").toDate(),
      };
    case "thisYear":
      return {
        start: now.startOf("year").toDate(),
        end: now.endOf("year").toDate(),
      };
    case "lastYear":
      return {
        start: now.subtract(1, "year").startOf("year").toDate(),
        end: now.subtract(1, "year").endOf("year").toDate(),
      };
    default:
      return {
        start: now.startOf("day").toDate(),
        end: now.endOf("day").toDate(),
      };
  }
};

// Date manipulation
export const addDays = (date, days) => {
  return dayjs(date).add(days, "day").toDate();
};

export const subtractDays = (date, days) => {
  return dayjs(date).subtract(days, "day").toDate();
};

export const addMonths = (date, months) => {
  return dayjs(date).add(months, "month").toDate();
};

export const subtractMonths = (date, months) => {
  return dayjs(date).subtract(months, "month").toDate();
};

export const addYears = (date, years) => {
  return dayjs(date).add(years, "year").toDate();
};

export const subtractYears = (date, years) => {
  return dayjs(date).subtract(years, "year").toDate();
};

// Date parsing for Google Sheets
export const parseSheetDate = (dateString) => {
  if (!dateString) return null;

  // Handle various date formats from Google Sheets
  const formats = [
    "DD/MM/YYYY",
    "MM/DD/YYYY",
    "YYYY-MM-DD",
    "DD-MM-YYYY",
    "MM-DD-YYYY",
    "DD/MM/YYYY HH:mm",
    "MM/DD/YYYY HH:mm",
    "YYYY-MM-DD HH:mm:ss",
  ];

  for (const format of formats) {
    const parsed = dayjs(dateString, format, true);
    if (parsed.isValid()) {
      return parsed.toDate();
    }
  }

  // Fallback to automatic parsing
  return dayjs(dateString).isValid() ? dayjs(dateString).toDate() : null;
};

// Format date for Google Sheets
export const formatForSheet = (date, includeTime = false) => {
  if (!date) return "";

  const format = includeTime ? "DD/MM/YYYY HH:mm" : "DD/MM/YYYY";
  return dayjs(date).format(format);
};

// Get current timestamp for Google Sheets
export const getCurrentTimestamp = () => {
  return dayjs().format("DD/MM/YYYY HH:mm:ss");
};

// Date range picker helpers
export const getDateRangeOptions = () => {
  return [
    { value: "today", label: "Hôm nay" },
    { value: "yesterday", label: "Hôm qua" },
    { value: "thisWeek", label: "Tuần này" },
    { value: "lastWeek", label: "Tuần trước" },
    { value: "thisMonth", label: "Tháng này" },
    { value: "lastMonth", label: "Tháng trước" },
    { value: "thisYear", label: "Năm nay" },
    { value: "lastYear", label: "Năm trước" },
    { value: "custom", label: "Tùy chọn" },
  ];
};

// Weekday names in Vietnamese
export const getWeekdayNames = () => {
  return [
    "Chủ nhật",
    "Thứ hai",
    "Thứ ba",
    "Thứ tư",
    "Thứ năm",
    "Thứ sáu",
    "Thứ bảy",
  ];
};

// Month names in Vietnamese
export const getMonthNames = () => {
  return [
    "Tháng 1",
    "Tháng 2",
    "Tháng 3",
    "Tháng 4",
    "Tháng 5",
    "Tháng 6",
    "Tháng 7",
    "Tháng 8",
    "Tháng 9",
    "Tháng 10",
    "Tháng 11",
    "Tháng 12",
  ];
};

// Get Vietnamese weekday name
export const getWeekdayNameVN = (date) => {
  const weekdays = getWeekdayNames();
  return weekdays[dayjs(date).day()];
};

// Get Vietnamese month name
export const getMonthNameVN = (date) => {
  const months = getMonthNames();
  return months[dayjs(date).month()];
};

// Age calculation
export const calculateAge = (birthDate) => {
  return dayjs().diff(dayjs(birthDate), "year");
};

// Business days calculation (excluding weekends)
export const getBusinessDays = (startDate, endDate) => {
  let count = 0;
  let current = dayjs(startDate);
  const end = dayjs(endDate);

  while (current.isSameOrBefore(end, "day")) {
    if (current.day() !== 0 && current.day() !== 6) {
      count++;
    }
    current = current.add(1, "day");
  }

  return count;
};

// Get start and end of different periods
export const getPeriodBounds = (date, period = "month") => {
  const dayjsDate = dayjs(date);

  switch (period) {
    case "day":
      return {
        start: dayjsDate.startOf("day").toDate(),
        end: dayjsDate.endOf("day").toDate(),
      };
    case "week":
      return {
        start: dayjsDate.startOf("week").toDate(),
        end: dayjsDate.endOf("week").toDate(),
      };
    case "month":
      return {
        start: dayjsDate.startOf("month").toDate(),
        end: dayjsDate.endOf("month").toDate(),
      };
    case "quarter":
      return {
        start: dayjsDate.startOf("quarter").toDate(),
        end: dayjsDate.endOf("quarter").toDate(),
      };
    case "year":
      return {
        start: dayjsDate.startOf("year").toDate(),
        end: dayjsDate.endOf("year").toDate(),
      };
    default:
      return {
        start: dayjsDate.startOf("day").toDate(),
        end: dayjsDate.endOf("day").toDate(),
      };
  }
};
